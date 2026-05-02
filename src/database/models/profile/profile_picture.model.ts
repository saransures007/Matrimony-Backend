import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IProfilePicture {
  id: number;
  profileId: string;
  storageKey?: string;
  filename?: string;
  contentType?: string;
  sizeBytes?: number;
  url?: string;
  isProfilePic?: boolean;
  isApproved?: boolean;
  uploadStatus?: 'pending' | 'uploaded' | 'failed';
  sortOrder?: number;
}

export type ProfilePictureCreationAttributes = Optional<IProfilePicture, 'id' | 'storageKey' | 'filename' | 'contentType' | 'sizeBytes' | 'url' | 'isProfilePic' | 'isApproved' | 'uploadStatus' | 'sortOrder'>;

export class ProfilePictureModel extends Model<IProfilePicture, ProfilePictureCreationAttributes> implements IProfilePicture {
  public id!: number;
  public profileId!: string;
  public storageKey?: string;
  public filename?: string;
  public contentType?: string;
  public sizeBytes?: number;
  public url?: string;
  public isProfilePic?: boolean;
  public isApproved?: boolean;
  public uploadStatus?: 'pending' | 'uploaded' | 'failed';
  public sortOrder?: number;
}

export default function (sequelize: Sequelize): typeof ProfilePictureModel {
  ProfilePictureModel.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      profileId: { type: DataTypes.UUID, allowNull: false, field: 'profile_id' },
      storageKey: { type: DataTypes.STRING(700), allowNull: true, unique: true, field: 'storage_key' },
      filename: { type: DataTypes.STRING(255) },
      contentType: { type: DataTypes.STRING(100), allowNull: true, field: 'content_type' },
      sizeBytes: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'size_bytes' },
      url: { type: DataTypes.STRING(500) },
      isProfilePic: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_profile_pic' },
      isApproved: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_approved' },
      uploadStatus: { type: DataTypes.ENUM('pending', 'uploaded', 'failed'), defaultValue: 'uploaded', field: 'upload_status' },
      sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    },
    {
      sequelize,
      tableName: 'profile_picture',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        { fields: ['profile_id', 'sort_order'] },
        { fields: ['profile_id', 'is_profile_pic'] },
      ],
    }
  );
  return ProfilePictureModel;
}
