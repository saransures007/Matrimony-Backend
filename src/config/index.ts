import { config } from 'dotenv';

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
config({ path: envFile });

export const {
    PORT,
    NODE_ENV,
    BASE_URL,
    JWT_ACCESS_TOKEN_SECRET,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    SMS_SECRET_TOKEN,
    JWT_REFRESH_TOKEN_SECRET,
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    R2_PUBLIC_BASE_URL,
    REDIS_URL,
} = process.env;

export const {
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    DB_HOST,
    DB_DIALECT,
} = process.env;
