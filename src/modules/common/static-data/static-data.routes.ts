// Matrimony-Backend/src/modules/common/static-data/static-data.routes.ts
import express from 'express';
import { getStaticDataController } from './static-data.controller';

const router = express.Router();

router.get('/static-data', getStaticDataController);

export default router;
