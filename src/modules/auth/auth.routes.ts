import express from 'express';



import { registerController, loginPasswordController, loginOTPController } from './auth.controller';


const authRouter = express.Router();
authRouter.post('/register', registerController);
authRouter.post('/login/password', loginPasswordController);
authRouter.post('/login/otp', loginOTPController);

export default authRouter;
