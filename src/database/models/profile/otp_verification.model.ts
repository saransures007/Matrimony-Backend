import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export type OTPType = 'PhoneVerification' | 'PasswordReset' | '2FA'

export interface IOtpVerification {
  otpId: string;
  accountId: string;
  otpCode: string;
  type: OTPType;
  isUsed: boolean;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OtpVerificationCreationAttributes = Optional<
  IOtpVerification,
  'otpId' | 'isUsed' | 'createdAt' | 'updatedAt'
>;

export class OtpVerificationModel extends Model<IOtpVerification, OtpVerificationCreationAttributes>
  implements IOtpVerification {
  public otpId!: string;
  public accountId!: string;
  public otpCode!: string;
  public type!: OTPType;
  public isUsed!: boolean;
  public expiresAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof OtpVerificationModel {
  OtpVerificationModel.init(
    {
      otpId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, field: 'otp_id' },
      accountId: { type: DataTypes.UUID, allowNull: false, field: 'account_id' },
      otpCode: { type: DataTypes.STRING(10), allowNull: false, field: 'otp_code' },
      type: { type: DataTypes.ENUM('PhoneVerification', 'PasswordReset', 'TwoFA'), allowNull: false },
      isUsed: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_used' },
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
