import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface IMatch {
  id: number;
  profileAId: string;
  profileBId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MatchCreationAttributes = Optional<IMatch, 'id' | 'createdAt' | 'updatedAt'>;

export class MatchModel extends Model<IMatch, MatchCreationAttributes> implements IMatch {
  public id!: number;
  public profileAId!: string;
  public profileBId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof MatchModel {
  MatchModel.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      profileAId: { type: DataTypes.UUID, allowNull: false, field: 'profile_a_id' },
      profileBId: { type: DataTypes.UUID, allowNull: false, field: 'profile_b_id' },
    },
    {
      sequelize,
      tableName: 'matches',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        { unique: true, fields: ['profile_a_id', 'profile_b_id'] },
        { fields: ['profile_a_id', 'created_at'] },
        { fields: ['profile_b_id', 'created_at'] },
      ],
    },
  );

  return MatchModel;
}
