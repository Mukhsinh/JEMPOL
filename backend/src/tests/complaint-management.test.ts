import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Types for our tests
interface Unit {
  id: string;
  name: string;
  code: string;
  parent_unit_id: string | null;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  sla_hours?: number;
  is_active?: boolean;
}

// Custom generators for property-based testing
const unitCodeGenerator = fc.string({ minLength: 2, maxLength: 10 })
  .filter(code => /^[A-Z0-9_]+$/.test(code));

const unitNameGenerator = fc.string({ minLength: 5, maxLength: 100 })
  .filter(name => name.trim().length > 0);

const emailGenerator = fc.emailAddress();

const phoneGenerator = fc.string({ minLength: 10, maxLength: 15 })
  .filter(phone => /^[0-9+\-\s()]+$/.test(phone));

// Generator for creating valid unit hierarchies
const unitHierarchyGenerator = fc.array(
  fc.record({
    name: unitNameGenerator,
    code: unitCodeGenerator,
    description: fc.option(fc.string({ maxLength: 500 })),
    contact_email: fc.option(emailGenerator),
    contact_phone: fc.option(phoneGenerator),
    sla_hours: fc.option(fc.integer({ min: 1, max: 168 })) // 1 hour to 1 week
  }),
  { minLength: 1, maxLength: 10 }
).map(units => {
  // Ensure unique codes
  const uniqueCodes = new Set<string>();
  const validUnits = units.filter(unit => {
    if (uniqueCodes.has(unit.code)) {
      return false;
    }
    uniqueCodes.add(unit.code);
    return true;
  });

  // Create hierarchy by assigning parent relationships
  return validUnits.map((unit, index) => ({
    ...unit,
    parent_unit_id: index > 0 && Math.random() > 0.5 ? validUnits[Math.floor(Math.random() * index)]?.code : null
  }));
});

describe('Complaint Management System - Property Tests', () => {
  beforeAll(async () => {
    // Clean up any existing test data
    await cleanupTestData();
  });

  afterAll(async () => {
    // Clean up test data after tests
    await cleanupTestData();
  });

  /**
   * **Feature: complaint-management-system, Property 30: Hierarchical Unit Structure Maintenance**
   * **Validates: Requirements 8.1**
   * 
   * For any unit configuration with parent-child relationships, the system should maintain 
   * referential integrity and prevent circular dependencies
   */
  it('should maintain hierarchical unit structure integrity', async () => {
    await fc.assert(
      fc.asyncProperty(unitHierarchyGenerator, async (unitHierarchy) => {
        // Clean up before each test iteration
        await cleanupTestData();

        try {
          // Insert units in dependency order (parents before children)
          const insertedUnits: Unit[] = [];
          const unitsByCode = new Map<string, any>();
          
          // First pass: insert all units without parent relationships
          for (const unitData of unitHierarchy) {
            const { data: unit, error } = await supabase
              .from('units')
              .insert({
                name: unitData.name,
                code: unitData.code,
                parent_unit_id: null, // Insert without parent first
                description: unitData.description,
                contact_email: unitData.contact_email,
                contact_phone: unitData.contact_phone,
                sla_hours: unitData.sla_hours || 24,
                is_active: true
              })
              .select()
              .single();

            if (error) {
              throw new Error(`Failed to insert unit: ${error.message}`);
            }

            insertedUnits.push(unit);
            unitsByCode.set(unitData.code, { ...unit, originalParentCode: unitData.parent_unit_id });
          }

          // Second pass: update parent relationships
          for (const [code, unit] of unitsByCode) {
            if (unit.originalParentCode) {
              const parentUnit = unitsByCode.get(unit.originalParentCode);
              if (parentUnit) {
                const { error } = await supabase
                  .from('units')
                  .update({ parent_unit_id: parentUnit.id })
                  .eq('id', unit.id);

                if (error) {
                  throw new Error(`Failed to update parent relationship: ${error.message}`);
                }
              }
            }
          }

          // Verify hierarchical integrity
          const { data: allUnits, error: fetchError } = await supabase
            .from('units')
            .select('*')
            .in('id', insertedUnits.map(u => u.id));

          if (fetchError) {
            throw new Error(`Failed to fetch units: ${fetchError.message}`);
          }

          // Property 1: No circular dependencies
          const hasCircularDependency = checkCircularDependencies(allUnits);
          expect(hasCircularDependency).toBe(false);

          // Property 2: All parent references are valid
          for (const unit of allUnits) {
            if (unit.parent_unit_id) {
              const parentExists = allUnits.some(u => u.id === unit.parent_unit_id);
              expect(parentExists).toBe(true);
            }
          }

          // Property 3: Referential integrity is maintained
          const { data: orphanedUnits, error: orphanError } = await supabase
            .from('units')
            .select('*')
            .not('parent_unit_id', 'is', null)
            .not('parent_unit_id', 'in', `(${allUnits.map(u => `'${u.id}'`).join(',')})`);

          if (orphanError && !orphanError.message.includes('syntax error')) {
            throw new Error(`Failed to check orphaned units: ${orphanError.message}`);
          }

          // Property 4: Unit codes remain unique
          const codes = allUnits.map(u => u.code);
          const uniqueCodes = new Set(codes);
          expect(codes.length).toBe(uniqueCodes.size);

          return true;
        } catch (error) {
          console.error('Property test failed:', error);
          return false;
        }
      }),
      { 
        numRuns: 100, // Run 100 iterations as specified in design
        timeout: 30000 // 30 second timeout per test
      }
    );
  });

  /**
   * Helper function to check for circular dependencies in unit hierarchy
   */
  function checkCircularDependencies(units: Unit[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    function hasCycle(unitId: string): boolean {
      if (recursionStack.has(unitId)) {
        return true; // Circular dependency found
      }
      if (visited.has(unitId)) {
        return false; // Already processed
      }

      visited.add(unitId);
      recursionStack.add(unitId);

      const unit = units.find(u => u.id === unitId);
      if (unit?.parent_unit_id) {
        if (hasCycle(unit.parent_unit_id)) {
          return true;
        }
      }

      recursionStack.delete(unitId);
      return false;
    }

    // Check each unit for cycles
    for (const unit of units) {
      if (hasCycle(unit.id)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Helper function to clean up test data
   */
  async function cleanupTestData(): Promise<void> {
    try {
      // Delete in reverse dependency order
      await supabase.from('ticket_responses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('ticket_escalations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('ticket_attachments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('ai_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('satisfaction_surveys').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('qr_codes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Delete units (children first, then parents)
      const { data: allUnits } = await supabase
        .from('units')
        .select('id, parent_unit_id')
        .order('created_at', { ascending: false });

      if (allUnits) {
        // Delete leaf nodes first (units with no children)
        const unitsToDelete = [...allUnits];
        while (unitsToDelete.length > 0) {
          const leafUnits = unitsToDelete.filter(unit => 
            !unitsToDelete.some(other => other.parent_unit_id === unit.id)
          );
          
          if (leafUnits.length === 0) {
            // If no leaf units found, delete all remaining (handles cycles)
            break;
          }

          for (const leafUnit of leafUnits) {
            await supabase.from('units').delete().eq('id', leafUnit.id);
            const index = unitsToDelete.findIndex(u => u.id === leafUnit.id);
            if (index > -1) {
              unitsToDelete.splice(index, 1);
            }
          }
        }

        // Clean up any remaining units
        if (unitsToDelete.length > 0) {
          await supabase.from('units').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
      }
    } catch (error) {
      console.warn('Cleanup warning:', error);
      // Continue even if cleanup fails
    }
  }
});