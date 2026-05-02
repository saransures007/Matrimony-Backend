import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type ProfileLikeStatus = 'pending' | 'accepted' | 'rejected';

export interface IProfileLike {
  id: number;
  likerProfileId: string;
  likedProfileId: string;
  status: ProfileLikeStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProfileLikeCreationAttributes = Optional<IProfileLike, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

export class ProfileLikeModel extends Model<IProfileLike, ProfileLikeCreationAttributes> implements IProfileLike {
  public id!: number;
  public likerProfileId!: string;
  public likedProfileId!: string;
  public status!: ProfileLikeStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof ProfileLikeModel {
  ProfileLikeModel.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      likerProfileId: { type: DataTypes.UUID, allowNull: false, field: 'liker_profile_id' },
      likedProfileId: { type: DataTypes.UUID, allowNull: false, field: 'liked_profile_id' },
      status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected'), allowNull: false, defaultValue: 'pending' },
    },
    {
      sequelize,
      tableName: 'profile_likes',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        { unique: true, fields: ['liker_profile_id', 'liked_profile_id'] },
        { fields: ['liked_profile_id', 'status', 'created_at'] },
        { fields: ['liker_profile_id', 'status', 'created_at'] },
      ],
    },
  );

  return ProfileLikeModel;
}
