import { Router } from 'express';
import * as masterDataController from '../controllers/masterDataController.js';
import { authenticateSupabase, optionalSupabaseAuth } from '../middleware/supabaseAuthMiddleware.js';

const router = Router();

// Public endpoints (no auth required) for basic data
router.get('/public/unit-types', masterDataController.getUnitTypes);
router.get('/public/service-categories', masterDataController.getServiceCategories);
router.get('/public/ticket-types', masterDataController.getTicketTypes);
router.get('/public/ticket-classifications', masterDataController.getTicketClassifications);
router.get('/public/ticket-statuses', masterDataController.getTicketStatuses);
router.get('/public/patient-types', masterDataController.getPatientTypes);
router.get('/public/roles', masterDataController.getRoles);
router.get('/public/sla-settings', masterDataController.getSLASettings);

// Semi-protected endpoints (optional auth) - work with or without token
router.get('/patient-types', optionalSupabaseAuth, masterDataController.getPatientTypes);
router.get('/unit-types', optionalSupabaseAuth, masterDataController.getUnitTypes);
router.get('/service-categories', optionalSupabaseAuth, masterDataController.getServiceCategories);
router.get('/ticket-types', optionalSupabaseAuth, masterDataController.getTicketTypes);
router.get('/ticket-classifications', optionalSupabaseAuth, masterDataController.getTicketClassifications);
router.get('/ticket-statuses', optionalSupabaseAuth, masterDataController.getTicketStatuses);
router.get('/roles', optionalSupabaseAuth, masterDataController.getRoles);
router.get('/sla-settings', optionalSupabaseAuth, masterDataController.getSLASettings);

// Apply authentication middleware to protected routes (CUD operations)
router.use(authenticateSupabase);

// Unit Types routes (protected)
router.post('/unit-types', masterDataController.createUnitType);
router.put('/unit-types/:id', masterDataController.updateUnitType);
router.delete('/unit-types/:id', masterDataController.deleteUnitType);

// Service Categories routes (protected)
router.post('/service-categories', masterDataController.createServiceCategory);
router.put('/service-categories/:id', masterDataController.updateServiceCategory);
router.delete('/service-categories/:id', masterDataController.deleteServiceCategory);

// Ticket Types routes (protected)
router.post('/ticket-types', masterDataController.createTicketType);
router.put('/ticket-types/:id', masterDataController.updateTicketType);
router.delete('/ticket-types/:id', masterDataController.deleteTicketType);

// Ticket Classifications routes (protected)
router.post('/ticket-classifications', masterDataController.createTicketClassification);
router.put('/ticket-classifications/:id', masterDataController.updateTicketClassification);
router.delete('/ticket-classifications/:id', masterDataController.deleteTicketClassification);

// Ticket Statuses routes (protected)
router.post('/ticket-statuses', masterDataController.createTicketStatus);
router.put('/ticket-statuses/:id', masterDataController.updateTicketStatus);
router.delete('/ticket-statuses/:id', masterDataController.deleteTicketStatus);

// Patient Types routes (protected)
router.post('/patient-types', masterDataController.createPatientType);
router.put('/patient-types/:id', masterDataController.updatePatientType);
router.delete('/patient-types/:id', masterDataController.deletePatientType);

// SLA Settings routes (protected)
router.post('/sla-settings', masterDataController.createSLASetting);
router.put('/sla-settings/:id', masterDataController.updateSLASetting);
router.delete('/sla-settings/:id', masterDataController.deleteSLASetting);

// Roles routes (protected)
router.post('/roles', masterDataController.createRole);
router.put('/roles/:id', masterDataController.updateRole);
router.delete('/roles/:id', masterDataController.deleteRole);

// Response Templates routes (protected)
router.get('/response-templates', masterDataController.getResponseTemplates);
router.post('/response-templates', masterDataController.createResponseTemplate);
router.put('/response-templates/:id', masterDataController.updateResponseTemplate);
router.delete('/response-templates/:id', masterDataController.deleteResponseTemplate);

// AI Trust Settings routes (protected)
router.get('/ai-trust-settings', masterDataController.getAITrustSettings);
router.put('/ai-trust-settings', masterDataController.updateAITrustSettings);
router.put('/ai-trust-settings/:id', masterDataController.updateAITrustSettings);

export default router;