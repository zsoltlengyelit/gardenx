import {
  Association,
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Sequelize
} from 'sequelize';
import fp from 'fastify-plugin';

export type OnOffAuto = 'on' | 'off' | 'auto';

// eslint-disable-next-line no-use-before-define
export class Controller extends Model<InferAttributes<Controller>, InferCreationAttributes<Controller>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare state: OnOffAuto;
  declare gpio: number;
}

// eslint-disable-next-line no-use-before-define
export class Schedule extends Model<InferAttributes<Schedule>, InferCreationAttributes<Schedule>> {
  declare id: CreationOptional<string>;
  declare start: Date;
  declare end: Date;
  declare rrule: string | null;
  declare active: boolean;
  declare group_id: string;

  declare controller: NonAttribute<Controller>;

  declare static associations: {
        // eslint-disable-next-line no-use-before-define
        controller: Association<Schedule, Controller>;
    };
}

type DbType = {
    Controller: typeof Controller,
    Schedule: typeof Schedule
};

declare module 'fastify' {

    export interface FastifyInstance {
        db: DbType;
    }
}
export default fp(async (fastify) => {

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: fastify.config.DB_PATH,
    database: fastify.config.DB_NAME,
    logging: true
  });

  Controller.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    state: {
      type: DataTypes.ENUM('on', 'off', 'auto'),
      allowNull: false,
      defaultValue: 'auto'
    },
    gpio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    tableName: 'controller',
    timestamps: false
  });

  Schedule.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rrule: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    group_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    tableName: 'schedule',
    timestamps: false
  });
  Schedule.belongsTo(Controller, {
    as: 'controller',
    foreignKey: 'controller_id',
    onDelete: 'cascade'
  });

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  fastify.decorate<DbType>('db', {
    Controller,
    Schedule
  });
});
