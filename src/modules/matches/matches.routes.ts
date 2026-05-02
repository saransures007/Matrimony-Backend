import express from 'express';
import { getMatchesController } from './matches.controller';
import { authenticateJWT } from '@/middlewares/auth.middleware';

const matchesRouter = express.Router();
matchesRouter.get('/', authenticateJWT(['USER']), getMatchesController);

export default matchesRouter;
