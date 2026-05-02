import express from 'express';
import { authenticateJWT } from '@/middlewares/auth.middleware';
import { nextProfilesController, profileDetailsController, swipeController } from './swipes.controller';

const swipesRouter = express.Router();

swipesRouter.get('/next', authenticateJWT(['USER']), nextProfilesController);
swipesRouter.get('/profiles/:profileId', authenticateJWT(['USER']), profileDetailsController);
swipesRouter.post('/', authenticateJWT(['USER']), swipeController);

export default swipesRouter;
