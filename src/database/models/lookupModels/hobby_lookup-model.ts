import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IHobby {
  id: number;
  label: string;
  type: 'H' | 'I';
  sortby: number;
}

export type HobbyCreationAttributes = Optional<IHobby, 'id' | 'sortby'>;

export class HobbyModel extends Model<IHobby, HobbyCreationAttributes> implements IHobby {
  public id!: number;
  public label!: string;
  public type!: 'H' | 'I';
  public sortby!: number;
}

export default function (sequelize: Sequelize): typeof HobbyModel {
  HobbyModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      label: { type: DataTypes.STRING(150), allowNull: false },
      type: { type: DataTypes.ENUM('H','I'), allowNull: false },
      sortby: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, tableName: 'hobby_lookup', timestamps: false }
  );
  return HobbyModel;
}
