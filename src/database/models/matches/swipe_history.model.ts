import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type SwipeAction = 'like' | 'reject';

export interface ISwipeHistory {
  id: number;
  actorProfileId: string;
  targetProfileId: string;
  action: SwipeAction;
  createdAt?: Date;
}

export type SwipeHistoryCreationAttributes = Optional<ISwipeHistory, 'id' | 'createdAt'>;

export class SwipeHistoryModel extends Model<ISwipeHistory, SwipeHistoryCreationAttributes> implements ISwipeHistory {
  public id!: number;
  public actorProfileId!: string;
  public targetProfileId!: string;
  public action!: SwipeAction;
  public readonly createdAt!: Date;
}

export default function (sequelize: Sequelize): typeof SwipeHistoryModel {
  SwipeHistoryModel.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      actorProfileId: { type: DataTypes.UUID, allowNull: false, field: 'actor_profile_id' },
      targetProfileId: { type: DataTypes.UUID, allowNull: false, field: 'target_profile_id' },
      action: { type: DataTypes.ENUM('like', 'reject'), allowNull: false },
    },
    {
      sequelize,
      tableName: 'swipe_history',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        { unique: true, fields: ['actor_profile_id', 'target_profile_id'] },
        { fields: ['actor_profile_id', 'created_at'] },
        { fields: ['target_profile_id', 'action', 'created_at'] },
      ],
    },
  );

  return SwipeHistoryModel;
}
