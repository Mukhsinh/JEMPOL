import { Router } from 'express';
import * as masterDataController from '../controllers/masterDataController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Unit Types routes
router.get('/unit-types', masterDataController.getUnitTypes);
router.post('/unit-types', masterDataController.createUnitType);
router.put('/unit-types/:id', masterDataController.updateUnitType);
router.delete('/unit-types/:id', masterDataController.deleteUnitType);

// Service Categories routes
router.get('/service-categories', masterDataController.getServiceCategories);
router.post('/service-categories', masterDataController.createServiceCategory);
router.put('/service-categories/:id', masterDataController.updateServiceCategory);
router.delete('/service-categories/:id', masterDataController.deleteServiceCategory);

// Ticket Types routes
router.get('/ticket-types', masterDataController.getTicketTypes);
router.post('/ticket-types', masterDataController.createTicketType);
router.put('/ticket-types/:id', masterDataController.updateTicketType);
router.delete('/ticket-types/:id', masterDataController.deleteTicketType);

// Ticket Classifications routes
router.get('/ticket-classifications', masterDataController.getTicketClassifications);
router.post('/ticket-classifications', masterDataController.createTicketClassification);
router.put('/ticket-classifications/:id', masterDataController.updateTicketClassification);
router.delete('/ticket-classifications/:id', masterDataController.deleteTicketClassification);

// Ticket Statuses routes
router.get('/ticket-statuses', masterDataController.getTicketStatuses);
router.post('/ticket-statuses', masterDataController.createTicketStatus);
router.put('/ticket-statuses/:id', masterDataController.updateTicketStatus);
router.delete('/ticket-statuses/:id', masterDataController.deleteTicketStatus);

// Patient Types routes
router.get('/patient-types', masterDataController.getPatientTypes);
router.post('/patient-types', masterDataController.createPatientType);
router.put('/patient-types/:id', masterDataController.updatePatientType);
router.delete('/patient-types/:id', masterDataController.deletePatientType);

// SLA Settings routes
router.get('/sla-settings', masterDataController.getSLASettings);
router.post('/sla-settings', masterDataController.createSLASetting);
router.put('/sla-settings/:id', masterDataController.updateSLASetting);
router.delete('/sla-settings/:id', masterDataController.deleteSLASetting);

// Roles routes
router.get('/roles', masterDataController.getRoles);
router.post('/roles', masterDataController.createRole);
router.put('/roles/:id', masterDataController.updateRole);
router.delete('/roles/:id', masterDataController.deleteRole);

// Response Templates routes
router.get('/response-templates', masterDataController.getResponseTemplates);
router.post('/response-templates', masterDataController.createResponseTemplate);
router.put('/response-templates/:id', masterDataController.updateResponseTemplate);
router.delete('/response-templates/:id', masterDataController.deleteResponseTemplate);

// AI Trust Settings routes
router.get('/ai-trust-settings', masterDataController.getAITrustSettings);
router.put('/ai-trust-settings', masterDataController.updateAITrustSettings);
router.put('/ai-trust-settings/:id', masterDataController.updateAITrustSettings);

export default router;