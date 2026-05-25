import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IProfilePicture {
  id: number;
  profileId: string;
  storageKey: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  isProfilePic: boolean;
  isApproved: boolean;
  uploadStatus: 'pending' | 'uploaded' | 'failed';
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProfilePictureCreationAttributes = Optional<IProfilePicture, 'id' | 'createdAt' | 'updatedAt'>;

// IMPORTANT: Do NOT use 'declare' - use 'public' with '!'
export class ProfilePictureModel extends Model<IProfilePicture, ProfilePictureCreationAttributes> {
  public id!: number;
  public profileId!: string;
  public storageKey!: string;
  public filename!: string;
  public contentType!: string;
  public sizeBytes!: number;
  public url!: string;
  public isProfilePic!: boolean;
  public isApproved!: boolean;
  public uploadStatus!: 'pending' | 'uploaded' | 'failed';
  public sortOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof ProfilePictureModel {
  ProfilePictureModel.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      profileId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'profile_id',
      },
      storageKey: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'storage_key',
      },
      filename: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      contentType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'content_type',
      },
      sizeBytes: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'size_bytes',
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      isProfilePic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_profile_pic',
      },
      isApproved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_approved',
      },
      uploadStatus: {
        type: DataTypes.ENUM('pending', 'uploaded', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
        field: 'upload_status',
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'sort_order',
      },
    },
    {
      sequelize,
      tableName: 'profile_picture',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        { fields: ['profile_id'] },
        { fields: ['profile_id', 'sort_order'] },
        { fields: ['profile_id', 'is_profile_pic'] },
      ],
    }
  );
  return ProfilePictureModel;
}