import crypto from 'crypto';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DB } from '@/database';
import { CustomError } from '@/utils/custom-error';
import {
  R2_ACCESS_KEY_ID,
  R2_ACCOUNT_ID,
  R2_BUCKET,
  R2_PUBLIC_BASE_URL,
  R2_SECRET_ACCESS_KEY,
} from '@/config';

const allowedContentTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxImageBytes = 8 * 1024 * 1024;

type PresignFile = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  sortOrder?: number;
  isProfilePic?: boolean;
};

type CompleteUpload = PresignFile & {
  uploadId: string;
  storageKey: string;
  publicUrl: string;
};

const requireR2Config = () => {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_BASE_URL) {
    throw new CustomError('R2 storage is not configured', 500);
  }
};

const s3 = () => {
  requireR2Config();
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID as string,
      secretAccessKey: R2_SECRET_ACCESS_KEY as string,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',  // ← here, not in PutObjectCommand
    responseChecksumValidation: 'WHEN_REQUIRED',  // ← here
  });
};

const safeExtension = (contentType: string) => {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
};

const getMyProfile = async (accountId: string) => {
  const profile = await DB.profiles.findOne({ where: { accountId } });
  if (!profile) throw new CustomError('Profile not found', 404);
  return profile;
};

const validateFile = (file: PresignFile) => {
  if (!allowedContentTypes.has(file.contentType)) {
    throw new CustomError('Only JPEG, PNG, and WEBP images are allowed', 400);
  }
  if (file.sizeBytes > maxImageBytes) {
    throw new CustomError('Image size must be 8MB or smaller', 400);
  }
};

export const mediaService = {
  listProfilePictures: async (accountId: string) => {
    const profile = await getMyProfile(accountId);
    return DB.profile_picture.findAll({
      where: { profileId: profile.profileId, uploadStatus: 'uploaded' },
      order: [['is_profile_pic', 'DESC'], ['sort_order', 'ASC'], ['created_at', 'ASC']],
    });
  },

presignProfilePictures: async (accountId: string, files: PresignFile[]) => {
    const profile = await getMyProfile(accountId);
    const client = s3();

    return Promise.all(
      files.map(async (file) => {
        validateFile(file);

        const uploadId = crypto.randomUUID();
        const extension = safeExtension(file.contentType);

        const storageKey = `profiles/${profile.profileId}/${uploadId}.${extension}`;

        const publicUrl = `${String(R2_PUBLIC_BASE_URL).replace(/\/$/, '')}/${storageKey}`;

        const command = new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: storageKey,
          ContentType: file.contentType,
          // ❌ DO NOT ADD ContentLength
          // ❌ DO NOT ADD Checksum
        });

        const uploadUrl = await getSignedUrl(client, command, {
          expiresIn: 300,
        });

        console.log("uploadUrl:",uploadUrl);
        return {
          uploadId,
          storageKey,
          uploadUrl,
          publicUrl,
          headers: {
            'Content-Type': file.contentType,
          },
          sortOrder: file.sortOrder ?? 0,
          isProfilePic: file.isProfilePic ?? false,
        };
      })
    );
  },

  completeProfilePictures: async (accountId: string, uploads: CompleteUpload[]) => {
    const profile = await getMyProfile(accountId);
    return DB.sequelize.transaction(async (transaction: any) => {
      if (uploads.some((upload) => !upload.storageKey.startsWith(`profiles/${profile.profileId}/`))) {
        throw new CustomError('Invalid upload ownership', 403);
      }

      if (uploads.some((upload) => upload.isProfilePic)) {
        await DB.profile_picture.update(
          { isProfilePic: false },
          { where: { profileId: profile.profileId }, transaction },
        );
      }

      const rows = [];
      for (const upload of uploads) {
        validateFile(upload);
        const [picture] = await DB.profile_picture.findOrCreate({
          where: { storageKey: upload.storageKey },
          defaults: {
            profileId: profile.profileId,
            storageKey: upload.storageKey,
            filename: upload.fileName,
            contentType: upload.contentType,
            sizeBytes: upload.sizeBytes,
            url: upload.publicUrl,
            isProfilePic: upload.isProfilePic,
            uploadStatus: 'uploaded',
            sortOrder: upload.sortOrder ?? 0,
          },
          transaction,
        });
        rows.push(picture);
      }
      return rows;
    });
  },

  rollbackProfilePictures: async (accountId: string, storageKeys: string[]) => {
    const profile = await getMyProfile(accountId);
    const client = s3();
    const ownedKeys = storageKeys.filter((key) => key.startsWith(`profiles/${profile.profileId}/`));
    if (ownedKeys.length !== storageKeys.length) throw new CustomError('Invalid upload ownership', 403);

    await Promise.all(ownedKeys.map((Key) => client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key }))));
    await DB.profile_picture.update(
      { uploadStatus: 'failed' },
      { where: { profileId: profile.profileId, storageKey: ownedKeys } },
    );
    return { deleted: ownedKeys.length };
  },

  deleteProfilePicture: async (accountId: string, pictureId: number) => {
    const profile = await getMyProfile(accountId);
    const picture = await DB.profile_picture.findOne({
      where: { id: pictureId, profileId: profile.profileId, uploadStatus: 'uploaded' },
    });
    if (!picture) throw new CustomError('Profile picture not found', 404);

    const count = await DB.profile_picture.count({
      where: { profileId: profile.profileId, uploadStatus: 'uploaded' },
    });
    if (count <= 1) {
      throw new CustomError('At least one profile picture is required', 400);
    }

    if (picture.storageKey) {
      try {
        await s3().send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: picture.storageKey }));
      } catch (error) {
        console.warn('R2 delete failed, removing DB record anyway:', error);
      }
    }
    await picture.destroy();

    if (picture.isProfilePic) {
      const nextPicture = await DB.profile_picture.findOne({
        where: { profileId: profile.profileId, uploadStatus: 'uploaded' },
        order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
      });
      if (nextPicture) await nextPicture.update({ isProfilePic: true });
    }

    return { deleted: true };
  },

  profilePictureVerificationStatus: async (accountId: string) => {
    const profile = await getMyProfile(accountId);
    const pictures = await DB.profile_picture.findAll({
      where: { profileId: profile.profileId },
      attributes: ['id', 'uploadStatus', 'isApproved', 'isProfilePic'],
      order: [['is_profile_pic', 'DESC'], ['sort_order', 'ASC'], ['created_at', 'ASC']],
    });

    if (pictures.length === 0) {
      return {
        status: 'not_started' as const,
        verified: false,
        approvedPictureIds: [] as number[],
      };
    }

    const approvedPictureIds = pictures.filter((p: any) => !!p.isApproved).map((p: any) => p.id as number);

    // In absence of real liveness results yet, we model:
    // - verified: any approved picture
    // - pending: uploads exist but none approved
    const status = approvedPictureIds.length > 0 ? 'verified' : 'pending';

    return {
      status: status as 'pending' | 'verified' | 'not_started',
      verified: approvedPictureIds.length > 0,
      approvedPictureIds,
    };
  },

  submitProfilePictureVerification: async (
    accountId: string,
    body: { primaryPictureId?: number },
  ) => {
    const profile = await getMyProfile(accountId);

    const uploadedPictures = await DB.profile_picture.findAll({
      where: { profileId: profile.profileId, uploadStatus: 'uploaded' },
      attributes: ['id'],
    });

    if (uploadedPictures.length === 0) {
      throw new CustomError('No uploaded profile pictures found', 400);
    }

    if (body.primaryPictureId != null) {
      const exists = uploadedPictures.some((p: any) => p.id === body.primaryPictureId);
      if (!exists) throw new CustomError('Invalid primaryPictureId', 400);
    }

    // Premium verification flow (stub):
    // when user submits verification, we approve all currently uploaded pictures.
    const approved = await DB.sequelize.transaction(async (transaction: any) => {
      const [count] = await DB.profile_picture.update(
        { isApproved: true },
        { where: { profileId: profile.profileId, uploadStatus: 'uploaded' }, transaction },
      );

      const ids = await DB.profile_picture.findAll({
        where: { profileId: profile.profileId, uploadStatus: 'uploaded' },
        attributes: ['id'],
        transaction,
      });

      return { approvedCount: count, approvedPictureIds: ids.map((r: any) => r.id as number) };
    });

    return approved;
  },
};
