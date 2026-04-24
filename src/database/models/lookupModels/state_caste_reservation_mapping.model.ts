import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IStateCasteReservation {
  id: number;
  state_id: number;
  caste_id: number;
  reservation_type: string; // e.g., "SC", "ST", "OBC"
}

export type StateCasteReservationCreationAttributes = Optional<IStateCasteReservation, 'id'>;

export class StateCasteReservationMappingModel extends Model<IStateCasteReservation, StateCasteReservationCreationAttributes> implements IStateCasteReservation {
  public id!: number;
  public state_id!: number;
  public caste_id!: number;
  public reservation_type!: string;
}

export default function (sequelize: Sequelize): typeof StateCasteReservationMappingModel {
  StateCasteReservationMappingModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      state_id: { type: DataTypes.INTEGER, allowNull: false },
      caste_id: { type: DataTypes.INTEGER, allowNull: false },
      reservation_type: { type: DataTypes.STRING(10), allowNull: false },
    },
    { sequelize, tableName: 'state_caste_reservation_mapping', timestamps: false }
  );

  return StateCasteReservationMappingModel;
}
