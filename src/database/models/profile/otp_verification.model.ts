import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export type OTPType = 'PhoneVerification' | 'PasswordReset' | 'TwoFA' | 'Login'

export interface IOtpVerification {
  otpId: string;
  accountId?: string;
  phoneNumber: string;
  otpCode: string;
  type: OTPType;
  isUsed: boolean;
  attemptCount: number;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OtpVerificationCreationAttributes = Optional<
  IOtpVerification,
  'otpId' | 'accountId' | 'isUsed' | 'attemptCount' | 'createdAt' | 'updatedAt'
>;

export class OtpVerificationModel extends Model<IOtpVerification, OtpVerificationCreationAttributes>
  implements IOtpVerification {
  public otpId!: string;
  public accountId?: string;
  public phoneNumber!: string;
  public otpCode!: string;
  public type!: OTPType;
  public isUsed!: boolean;
  public attemptCount!: number;
  public expiresAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof OtpVerificationModel {
  OtpVerificationModel.init(
    {
      otpId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, field: 'otp_id' },
      accountId: { type: DataTypes.UUID, allowNull: true, field: 'account_id' },
      phoneNumber: { type: DataTypes.STRING(20), allowNull: false, field: 'phone_number' },
      otpCode: { type: DataTypes.STRING(10), allowNull: false, field: 'otp_code' },
      type: { type: DataTypes.ENUM('PhoneVerification', 'PasswordReset', 'TwoFA', 'Login'), allowNull: false },
      isUsed: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_used' },
      attemptCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'attempt_count' },
      expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
    },
    {
      sequelize,
      tableName: 'otp_verification',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return OtpVerificationModel;
}
