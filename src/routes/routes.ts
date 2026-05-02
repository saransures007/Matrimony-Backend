import authRouter from '@/modules/auth/auth.routes';
// import userRouter from '@/modules/user/user.routes';
import staticDataRouter from '@/modules/common/static-data/static-data.routes';
import matchesRouter from '@/modules/matches/matches.routes';
import mediaRouter from '@/modules/media/media.routes';
import swipesRouter from '@/modules/swipes/swipes.routes';
import interestsRouter from '@/modules/interests/interests.routes';
import express from 'express';

const router = express.Router();

router.use('/auth', authRouter);
// router.use('/user', userRouter);
router.use('/common', staticDataRouter);
router.use('/matches', matchesRouter);
router.use('/media', mediaRouter);
router.use('/swipes', swipesRouter);
router.use('/interests', interestsRouter);

export default router;
