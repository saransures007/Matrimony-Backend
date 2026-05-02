import express from 'express';

import { 
  registerController, 
  loginPasswordController, 
  loginOTPController, 
  checkAvailabilityController,
  requestLoginOtpController,
  verifyLoginOtpController
} from './auth.controller';


const authRouter = express.Router();
authRouter.post('/register', registerController);
authRouter.post('/login/password', loginPasswordController);
authRouter.post('/login/otp', loginOTPController);
authRouter.get('/check-availability', checkAvailabilityController);
authRouter.post('/otp/request', requestLoginOtpController);
authRouter.post('/otp/verify', verifyLoginOtpController);

export default authRouter;
