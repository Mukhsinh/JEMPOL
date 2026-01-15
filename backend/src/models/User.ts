/**
 * User Model with Role-Based Permissions
 * Task 2.3: Implement User model with role-based permissions
 */

import { supabase } from '../config/supabase';
import { User, UserRole, TicketPriority } from '../types/complaint-management';

/**
 * Role Hierarchy (higher number = higher authority)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.STAFF]: 1,
  [UserRole.SUPERVISOR]: 2,
  [UserRole.MANAGER]: 3,
  [UserRole.DIRECTOR]: 4,
  [UserRole.ADMIN]: 5
};

/**
 * Permission Matrix
 * Defines what each role can do
 */
interface PermissionMatrix {
  canCreateTicket: boolean;
  canAssignTicket: boolean;
  canEscalateTicket: boolean;
  canCloseTicket: boolean;
  canViewAllTickets: boolean;
  canViewUnitTickets: boolean;
  canManageUsers: boolean;
  canManageUnits: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  maxPriorityLevel: TicketPriority;
  canOverrideSLA: boolean;
  canAccessAISettings: boolean;
}

const PERMISSIONS: Record<UserRole, PermissionMatrix> = {
  [UserRole.STAFF]: {
    canCreateTicket: true,
    canAssignTicket: false,
    canEscalateTicket: true,
    canCloseTicket: false,
    canViewAllTickets: false,
    canViewUnitTickets: true,
    canManageUsers: false,
    canManageUnits: false,
    canViewReports: false,
    canExportData: false,
    maxPriorityLevel: TicketPriority.MEDIUM,
    canOverrideSLA: false,
    canAccessAISettings: false
  },
  [UserRole.SUPERVISOR]: {
    canCreateTicket: true,
    canAssignTicket: true,
    canEscalateTicket: true,
    canCloseTicket: true,
    canViewAllTickets: false,
    canViewUnitTickets: true,
    canManageUsers: false,
    canManageUnits: false,
    canViewReports: true,
    canExportData: true,
    maxPriorityLevel: TicketPriority.HIGH,
    canOverrideSLA: false,
    canAccessAISettings: false
  },
  [UserRole.MANAGER]: {
    canCreateTicket: true,
    canAssignTicket: true,
    canEscalateTicket: true,
    canCloseTicket: true,
    canViewAllTickets: true,
    canViewUnitTickets: true,
    canManageUsers: true,
    canManageUnits: false,
    canViewReports: true,
    canExportData: true,
    maxPriorityLevel: TicketPriority.CRITICAL,
    canOverrideSLA: true,
    canAccessAISettings: false
  },
  [UserRole.DIRECTOR]: {
    canCreateTicket: true,
    canAssignTicket: true,
    canEscalateTicket: true,
    canCloseTicket: true,
    canViewAllTickets: true,
    canViewUnitTickets: true,
    canManageUsers: true,
    canManageUnits: true,
    canViewReports: true,
    canExportData: true,
    maxPriorityLevel: TicketPriority.CRITICAL,
    canOverrideSLA: true,
    canAccessAISettings: true
  },
  [UserRole.ADMIN]: {
    canCreateTicket: true,
    canAssignTicket: true,
    canEscalateTicket: true,
    canCloseTicket: true,
    canViewAllTickets: true,
    canViewUnitTickets: true,
    canManageUsers: true,
    canManageUnits: true,
    canViewReports: true,
    canExportData: true,
    maxPriorityLevel: TicketPriority.CRITICAL,
    canOverrideSLA: true,
    canAccessAISettings: true
  }
};

export class UserModel {
  /**
   * Get user by ID
   */
  static async getById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('is_active', true)
      .single();
    
    if (error) {
      return null;
    }
    
    return data as User;
  }

  /**
   * Get user by email
   */
  static async getByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();
    
    if (error) {
      return null;
    }
    
    return data as User;
  }

  /**
   * Get user by admin ID (link to existing admin system)
   */
  static async getByAdminId(adminId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('admin_id', adminId)
      .eq('is_active', true)
      .single();
    
    if (error) {
      return null;
    }
    
    return data as User;
  }

  /**
   * Get permissions for a role
   */
  static getPermissions(role: UserRole): PermissionMatrix {
    return PERMISSIONS[role];
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(user: User, permission: keyof PermissionMatrix): boolean {
    const permissions = this.getPermissions(user.role);
    return permissions[permission] as boolean;
  }

  /**
   * Check if user can access unit
   */
  static async canAccessUnit(user: User, unitId: string): Promise<boolean> {
    const permissions = this.getPermissions(user.role);
    
    // Admins and users with canViewAllTickets can access any unit
    if (permissions.canViewAllTickets) {
      return true;
    }
    
    // Check if unit is user's unit or child unit
    if (user.unit_id === unitId) {
      return true;
    }
    
    // Check if unitId is a child of user's unit
    if (user.unit_id) {
      const isChildUnit = await this.isChildUnit(user.unit_id, unitId);
      return isChildUnit;
    }
    
    return false;
  }

  /**
   * Check if targetUnitId is a child of parentUnitId
   */
  static async isChildUnit(parentUnitId: string, targetUnitId: string): Promise<boolean> {
    let currentUnitId: string | null = targetUnitId;
    const visited = new Set<string>();
    
    while (currentUnitId && !visited.has(currentUnitId)) {
      visited.add(currentUnitId);
      
      const { data: unit } = await supabase
        .from('units')
        .select('parent_unit_id')
        .eq('id', currentUnitId)
        .single();
      
      if (!unit) {
        break;
      }
      
      if (unit.parent_unit_id === parentUnitId) {
        return true;
      }
      
      currentUnitId = unit.parent_unit_id;
    }
    
    return false;
  }

  /**
   * Check if user can assign priority level
   */
  static canAssignPriority(user: User, priority: TicketPriority): boolean {
    const permissions = this.getPermissions(user.role);
    const maxPriority = permissions.maxPriorityLevel;
    
    const priorityLevels = {
      [TicketPriority.LOW]: 1,
      [TicketPriority.MEDIUM]: 2,
      [TicketPriority.HIGH]: 3,
      [TicketPriority.CRITICAL]: 4
    };
    
    return priorityLevels[priority] <= priorityLevels[maxPriority];
  }

  /**
   * Get role hierarchy level
   */
  static getRoleLevel(role: UserRole): number {
    return ROLE_HIERARCHY[role];
  }

  /**
   * Check if role1 is higher than role2
   */
  static isHigherRole(role1: UserRole, role2: UserRole): boolean {
    return this.getRoleLevel(role1) > this.getRoleLevel(role2);
  }

  /**
   * Get next escalation role
   */
  static getNextEscalationRole(currentRole: UserRole): UserRole | null {
    const currentLevel = this.getRoleLevel(currentRole);
    
    // Find next higher role
    for (const [role, level] of Object.entries(ROLE_HIERARCHY)) {
      if (level === currentLevel + 1) {
        return role as UserRole;
      }
    }
    
    return null;
  }

  /**
   * Get users by role in unit
   */
  static async getUsersByRoleInUnit(role: UserRole, unitId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .eq('unit_id', unitId)
      .eq('is_active', true);
    
    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
    
    return data as User[];
  }

  /**
   * Get users for escalation (higher roles in unit hierarchy)
   */
  static async getEscalationTargets(currentUserId: string): Promise<User[]> {
    const currentUser = await this.getById(currentUserId);
    if (!currentUser) {
      throw new Error('Current user not found');
    }
    
    const nextRole = this.getNextEscalationRole(currentUser.role);
    if (!nextRole) {
      return []; // Already at highest role
    }
    
    // Get users with higher role in same unit or parent units
    const targets: User[] = [];
    
    // Same unit
    if (currentUser.unit_id) {
      const sameUnitUsers = await this.getUsersByRoleInUnit(nextRole, currentUser.unit_id);
      targets.push(...sameUnitUsers);
      
      // Parent units
      let parentUnitId = await this.getParentUnitId(currentUser.unit_id);
      while (parentUnitId) {
        const parentUnitUsers = await this.getUsersByRoleInUnit(nextRole, parentUnitId);
        targets.push(...parentUnitUsers);
        parentUnitId = await this.getParentUnitId(parentUnitId);
      }
    }
    
    return targets;
  }

  /**
   * Get parent unit ID
   */
  static async getParentUnitId(unitId: string): Promise<string | null> {
    const { data: unit } = await supabase
      .from('units')
      .select('parent_unit_id')
      .eq('id', unitId)
      .single();
    
    return unit?.parent_unit_id || null;
  }

  /**
   * Create user
   */
  static async create(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
    
    return data as User;
  }

  /**
   * Update user
   */
  static async update(userId: string, userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
    
    return data as User;
  }

  /**
   * Validate role-based ticket creation
   */
  static async validateTicketCreation(user: User, unitId: string, priority?: TicketPriority): Promise<{
    valid: boolean;
    error?: string;
  }> {
    const permissions = this.getPermissions(user.role);
    
    // Check if user can create tickets
    if (!permissions.canCreateTicket) {
      return { valid: false, error: 'User does not have permission to create tickets' };
    }
    
    // Check if user can access the unit
    const canAccess = await this.canAccessUnit(user, unitId);
    if (!canAccess) {
      return { valid: false, error: 'User does not have access to this unit' };
    }
    
    // Check priority level if specified
    if (priority && !this.canAssignPriority(user, priority)) {
      return { valid: false, error: `User cannot assign ${priority} priority` };
    }
    
    return { valid: true };
  }
}
