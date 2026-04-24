import authRouter from '@/modules/auth/auth.routes';
// import userRouter from '@/modules/user/user.routes';
import staticDataRouter from '@/modules/common/static-data/static-data.routes';
import express from 'express';

const router = express.Router();

router.use('/auth', authRouter);
// router.use('/user', userRouter);
router.use('/common', staticDataRouter);

export default router;
