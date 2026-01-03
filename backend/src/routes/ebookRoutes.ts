import express from 'express';
import { getEbookSections, getEbookSection } from '../controllers/ebookController.js';

const router = express.Router();

router.get('/', getEbookSections);
router.get('/:id', getEbookSection);

export default router;
