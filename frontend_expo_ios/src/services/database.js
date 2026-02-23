// src/services/database.js
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'horta_facil.db';

let db = null;

/**
 * Abre a conexão com o banco de dados
 */
export const openDatabase = async () => {
  if (db) return db;
  
  try {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    console.log('Banco de dados aberto com sucesso');
    return db;
  } catch (error) {
    console.error('Erro ao abrir banco de dados:', error);
    throw error;
  }
};

/**
 * Inicializa as tabelas do banco de dados
 */
export const initDatabase = async () => {
  const database = await openDatabase();
  
  try {
    // Criar tabela Hortas
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS hortas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        localizacao TEXT,
        area_total REAL,
        consumo_agua_estimado REAL
      );
    `);

    // Criar tabela Hortaliças (modelos/templates)
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS hortalicas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        tipo_plantio TEXT NOT NULL,
        ciclo_desenvolvimento INTEGER DEFAULT 0,
        ciclo_colheita INTEGER NOT NULL,
        ciclo_limpeza INTEGER NOT NULL,
        espacamento_linhas REAL NOT NULL,
        espacamento_plantas REAL NOT NULL,
        produtividade_esperada REAL DEFAULT 0,
        area_modulo REAL NOT NULL,
        periodicidade INTEGER NOT NULL
      );
    `);

    // Criar tabela Cultivos (instâncias de plantio)
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS cultivos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        horta_id INTEGER NOT NULL,
        hortalica_id INTEGER NOT NULL,
        data_inicio TEXT NOT NULL,
        producao_semanal_desejada REAL NOT NULL,
        num_modulos INTEGER NOT NULL,
        area_total_hortalica REAL,
        FOREIGN KEY (horta_id) REFERENCES hortas (id) ON DELETE CASCADE,
        FOREIGN KEY (hortalica_id) REFERENCES hortalicas (id) ON DELETE CASCADE
      );
    `);

    // Criar tabela Colheitas
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS colheitas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cultivo_id INTEGER,
        data TEXT NOT NULL,
        quantidade_colhida REAL DEFAULT 0,
        FOREIGN KEY (cultivo_id) REFERENCES cultivos (id) ON DELETE CASCADE
      );
    `);

    // Criar tabela Relatórios
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS relatorios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        horta_id INTEGER NOT NULL,
        data TEXT NOT NULL,
        total_produzido_planejado REAL NOT NULL,
        total_colhido_real REAL DEFAULT 0,
        eficiencia REAL,
        FOREIGN KEY (horta_id) REFERENCES hortas (id) ON DELETE CASCADE
      );
    `);

    console.log('Tabelas criadas/verificadas com sucesso');
    
    // Verifica se precisa popular dados iniciais
    await seedInitialData(database);
    
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    throw error;
  }
};

/**
 * Popula o banco com dados iniciais de hortaliças
 */
const seedInitialData = async (database) => {
  try {
    // Verifica se já existem hortaliças cadastradas
    const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM hortalicas');
    
    if (result.count > 0) {
      console.log('Dados iniciais já existem');
      return;
    }

    console.log('Populando dados iniciais de hortaliças...');

    const hortalicas = [
      {
        nome: "Abobrinha-Caserta",
        tipo_plantio: "direta",
        ciclo_desenvolvimento: 6,
        ciclo_colheita: 4,
        ciclo_limpeza: 1,
        espacamento_linhas: 1.0,
        espacamento_plantas: 0.7,
        produtividade_esperada: 28.0,
        area_modulo: 14.0,
        periodicidade: 2
      },
      {
        nome: "Abobrinha-Menina",
        tipo_plantio: "direta",
        ciclo_desenvolvimento: 10,
        ciclo_colheita: 6,
        ciclo_limpeza: 1,
        espacamento_linhas: 2.0,
        espacamento_plantas: 2.0,
        produtividade_esperada: 900.0,
        area_modulo: 450.0,
        periodicidade: 3
      },
      {
        nome: "Alface lisa ou crespa",
        tipo_plantio: "mudas",
        ciclo_desenvolvimento: 5,
        ciclo_colheita: 1,
        ciclo_limpeza: 1,
        espacamento_linhas: 0.3,
        espacamento_plantas: 0.3,
        produtividade_esperada: 14.0,
        area_modulo: 1.575,
        periodicidade: 1
      },
      {
        nome: "Alface americana",
        tipo_plantio: "mudas",
        ciclo_desenvolvimento: 7,
        ciclo_colheita: 1,
        ciclo_limpeza: 1,
        espacamento_linhas: 0.4,
        espacamento_plantas: 0.4,
        produtividade_esperada: 1500.0,
        area_modulo: 300.0,
        periodicidade: 1
      },
      {
        nome: "Batata",
        tipo_plantio: "direta",
        ciclo_desenvolvimento: 15,
        ciclo_colheita: 1,
        ciclo_limpeza: 2,
        espacamento_linhas: 0.8,
        espacamento_plantas: 0.3,
        produtividade_esperada: 14.0,
        area_modulo: 8.4,
        periodicidade: 4
      },
      {
        nome: "Berinjela",
        tipo_plantio: "mudas",
        ciclo_desenvolvimento: 12,
        ciclo_colheita: 16,
        ciclo_limpeza: 2,
        espacamento_linhas: 1.2,
        espacamento_plantas: 0.8,
        produtividade_esperada: 120.0,
        area_modulo: 33.6,
        periodicidade: 5
      },
      {
        nome: "Beterraba",
        tipo_plantio: "direta",
        ciclo_desenvolvimento: 8,
        ciclo_colheita: 2,
        ciclo_limpeza: 1,
        espacamento_linhas: 0.25,
        espacamento_plantas: 0.1,
        produtividade_esperada: 23.0,
        area_modulo: 3.5,
        periodicidade: 2
      },
      {
        nome: "Cenoura",
        tipo_plantio: "direta",
        ciclo_desenvolvimento: 10,
        ciclo_colheita: 2,
        ciclo_limpeza: 1,
        espacamento_linhas: 0.2,
        espacamento_plantas: 0.05,
        produtividade_esperada: 35.0,
        area_modulo: 1.4,
        periodicidade: 2
      },
      {
        nome: "Couve-manteiga",
        tipo_plantio: "mudas",
        ciclo_desenvolvimento: 8,
        ciclo_colheita: 18,
        ciclo_limpeza: 1,
        espacamento_linhas: 1.0,
        espacamento_plantas: 0.5,
        produtividade_esperada: 150.0,
        area_modulo: 17.5,
        periodicidade: 4
      },
      {
        nome: "Pepino",
        tipo_plantio: "mudas",
        ciclo_desenvolvimento: 5,
        ciclo_colheita: 8,
        ciclo_limpeza: 1,
        espacamento_linhas: 1.0,
        espacamento_plantas: 0.5,
        produtividade_esperada: 120.0,
        area_modulo: 17.5,
        periodicidade: 2
      },
      {
        nome: "Pimentão",
        tipo_plantio: "mudas",
        ciclo_desenvolvimento: 12,
        ciclo_colheita: 16,
        ciclo_limpeza: 2,
        espacamento_linhas: 1.0,
        espacamento_plantas: 0.5,
        produtividade_esperada: 90.0,
        area_modulo: 17.5,
        periodicidade: 5
      },
      {
        nome: "Rabanete",
        tipo_plantio: "direta",
        ciclo_desenvolvimento: 4,
        ciclo_colheita: 1,
        ciclo_limpeza: 1,
        espacamento_linhas: 0.25,
        espacamento_plantas: 0.05,
        produtividade_esperada: 9.0,
        area_modulo: 1.75,
        periodicidade: 1
      },
      {
        nome: "Rúcula",
        tipo_plantio: "direta",
        ciclo_desenvolvimento: 4,
        ciclo_colheita: 2,
        ciclo_limpeza: 1,
        espacamento_linhas: 0.25,
        espacamento_plantas: 0.05,
        produtividade_esperada: 10.0,
        area_modulo: 1.75,
        periodicidade: 1
      },
      {
        nome: "Tomate",
        tipo_plantio: "mudas",
        ciclo_desenvolvimento: 10,
        ciclo_colheita: 12,
        ciclo_limpeza: 2,
        espacamento_linhas: 1.0,
        espacamento_plantas: 0.5,
        produtividade_esperada: 150.0,
        area_modulo: 17.5,
        periodicidade: 4
      }
    ];

    for (const hortalica of hortalicas) {
      await database.runAsync(
        `INSERT INTO hortalicas (
          nome, tipo_plantio, ciclo_desenvolvimento, ciclo_colheita, ciclo_limpeza,
          espacamento_linhas, espacamento_plantas, produtividade_esperada, area_modulo, periodicidade
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          hortalica.nome,
          hortalica.tipo_plantio,
          hortalica.ciclo_desenvolvimento,
          hortalica.ciclo_colheita,
          hortalica.ciclo_limpeza,
          hortalica.espacamento_linhas,
          hortalica.espacamento_plantas,
          hortalica.produtividade_esperada,
          hortalica.area_modulo,
          hortalica.periodicidade
        ]
      );
    }

    console.log('Dados iniciais inseridos com sucesso');
  } catch (error) {
    console.error('Erro ao popular dados iniciais:', error);
  }
};

/**
 * Limpa todas as tabelas (útil para testes)
 */
export const clearAllData = async () => {
  const database = await openDatabase();
  try {
    await database.execAsync('DELETE FROM colheitas');
    await database.execAsync('DELETE FROM relatorios');
    await database.execAsync('DELETE FROM cultivos');
    await database.execAsync('DELETE FROM hortas');
    await database.execAsync('DELETE FROM hortalicas');
    console.log('Todas as tabelas foram limpas');
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    throw error;
  }
};

/**
 * Reseta o banco de dados (DROP e recria as tabelas)
 */
export const resetDatabase = async () => {
  const database = await openDatabase();
  try {
    await database.execAsync('DROP TABLE IF EXISTS colheitas');
    await database.execAsync('DROP TABLE IF EXISTS relatorios');
    await database.execAsync('DROP TABLE IF EXISTS cultivos');
    await database.execAsync('DROP TABLE IF EXISTS hortas');
    await database.execAsync('DROP TABLE IF EXISTS hortalicas');
    console.log('Banco de dados resetado');
    await initDatabase();
  } catch (error) {
    console.error('Erro ao resetar banco de dados:', error);
    throw error;
  }
};
