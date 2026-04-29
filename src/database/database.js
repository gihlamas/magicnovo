'use strict';

const logger = require('../utils/logger');

// Mock dos DataTypes do Sequelize
const DataTypes = {
  UUID: 'UUID',
  UUIDV4: 'UUIDV4',
  STRING: () => 'STRING',
  TEXT: 'TEXT',
  ENUM: () => 'ENUM',
  DATE: 'DATE',
  NOW: 'NOW',
  INTEGER: 'INTEGER',
  BOOLEAN: 'BOOLEAN',
};

// Mock do Sequelize
const sequelizeMock = {
  authenticate: async () => {
    logger.info('Mock: Conexão com o banco de dados simulada com sucesso.');
    return true;
  },
  sync: async () => {
    logger.info('Mock: Modelos sincronizados (simulado).');
    return true;
  },
  define: (name, schema, options) => {
    logger.info(`Mock: Definindo modelo ${name}`);
    
    const createMockInstance = (data) => ({
      ...data,
      id: data.id || 'mock-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: async function() { 
        logger.info(`Mock: [${name}] Salvando instância`, this);
        return this; 
      },
      update: async function(newData) {
        logger.info(`Mock: [${name}] Atualizando instância`, newData);
        Object.assign(this, newData);
        return this;
      }
    });

    const model = {
      create: async (data) => {
        logger.info(`Mock: [${name}] Criando registro`, data);
        return createMockInstance(data);
      },
      findOne: async (query) => {
        logger.info(`Mock: [${name}] findOne`, query);
        // Retorna uma instância mockada para evitar erros de "não encontrado"
        const phone = query?.where?.phone || '5511999999999';
        return createMockInstance({ phone });
      },
      findAll: async (query) => {
        logger.info(`Mock: [${name}] findAll`, query);
        return [];
      },
      update: async (data, query) => {
        logger.info(`Mock: [${name}] update`, { data, query });
        return [1];
      },
      destroy: async (query) => {
        logger.info(`Mock: [${name}] destroy`, query);
        return 1;
      },
      findOrCreate: async (options) => {
        logger.info(`Mock: [${name}] findOrCreate`, options);
        const data = options.defaults || options.where;
        return [createMockInstance(data), true];
      },
      findByPk: async (id) => {
        logger.info(`Mock: [${name}] findByPk ${id}`);
        return createMockInstance({ id });
      },
      count: async (query) => {
        logger.info(`Mock: [${name}] count`, query);
        return 0;
      }
    };
    return model;
  }
};

async function connectDatabase() {
  try {
    await sequelizeMock.authenticate();
    await sequelizeMock.sync();
  } catch (error) {
    logger.error('Erro ao conectar ao banco de dados (Mock):', error);
    throw error;
  }
}

module.exports = { sequelize: sequelizeMock, connectDatabase, DataTypes };
