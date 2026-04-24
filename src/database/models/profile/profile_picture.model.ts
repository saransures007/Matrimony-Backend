import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IProfilePicture {
  id: number;
  profileId: string;
  filename?: string;
  url?: string;
  isProfilePic?: boolean;
  isApproved?: boolean;
}

export type ProfilePictureCreationAttributes = Optional<IProfilePicture, 'id' | 'isProfilePic' | 'isApproved'>;

export class ProfilePictureModel extends Model<IProfilePicture, ProfilePictureCreationAttributes> implements IProfilePicture {
  public id!: number;
  public profileId!: string;
  public filename?: string;
  public url?: string;
  public isProfilePic?: boolean;
  public isApproved?: boolean;
}

export default function (sequelize: Sequelize): typeof ProfilePictureModel {
  ProfilePictureModel.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      profileId: { type: DataTypes.UUID, allowNull: false },
      filename: { type: DataTypes.STRING(255) },
      url: { type: DataTypes.STRING(500) },
      isProfilePic: { type: DataTypes.BOOLEAN, defaultValue: false },
      isApproved: { type: DataTypes.BOOLEAN },
    },
    { sequelize, tableName: 'profile_picture', timestamps: true }
  );
  return ProfilePictureModel;
}
