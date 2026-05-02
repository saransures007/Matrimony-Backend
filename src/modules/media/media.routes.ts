import express from 'express';
import { authenticateJWT } from '@/middlewares/auth.middleware';
import {
  completeProfilePicturesController,
  deleteProfilePictureController,
  listProfilePicturesController,
  presignProfilePicturesController,
  profilePictureVerificationStatusController,
  rollbackProfilePicturesController,
  submitProfilePictureVerificationController,
} from './media.controller';

const mediaRouter = express.Router();

mediaRouter.get('/profile-pictures', authenticateJWT(['USER']), listProfilePicturesController);
mediaRouter.post('/profile-pictures/presign', authenticateJWT(['USER']), presignProfilePicturesController);
mediaRouter.post('/profile-pictures/complete', authenticateJWT(['USER']), completeProfilePicturesController);
mediaRouter.post('/profile-pictures/rollback', authenticateJWT(['USER']), rollbackProfilePicturesController);
mediaRouter.delete('/profile-pictures/:pictureId', authenticateJWT(['USER']), deleteProfilePictureController);

mediaRouter.get(
  '/profile-pictures/verification/status',
  authenticateJWT(['USER']),
  profilePictureVerificationStatusController,
);
mediaRouter.post(
  '/profile-pictures/verification/submit',
  authenticateJWT(['USER']),
  submitProfilePictureVerificationController,
);

export default mediaRouter;
