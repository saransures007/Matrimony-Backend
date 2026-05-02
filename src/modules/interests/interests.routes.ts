import express from 'express';
import { authenticateJWT } from '@/middlewares/auth.middleware';
import {
  acceptInterestController,
  interestMatchesController,
  receivedInterestsController,
  rejectInterestController,
  sentInterestsController,
} from './interests.controller';

const interestsRouter = express.Router();

interestsRouter.get('/received', authenticateJWT(['USER']), receivedInterestsController);
interestsRouter.get('/sent', authenticateJWT(['USER']), sentInterestsController);
interestsRouter.get('/matches', authenticateJWT(['USER']), interestMatchesController);
interestsRouter.post('/:likeId/accept', authenticateJWT(['USER']), acceptInterestController);
interestsRouter.post('/:likeId/reject', authenticateJWT(['USER']), rejectInterestController);

export default interestsRouter;
