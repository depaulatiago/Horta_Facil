export const SCHEMA_SQL = [
  `PRAGMA foreign_keys = ON;`,
  `CREATE TABLE IF NOT EXISTS horta (
    id INTEGER PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    responsavel_id INTEGER,
    localizacao TEXT,
    area_total REAL,
    consumo_agua_estimado REAL
  );`,
  `CREATE TABLE IF NOT EXISTS hortalica (
    id INTEGER PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    tipo_plantio TEXT NOT NULL,
    ciclo_desenvolvimento INTEGER NOT NULL,
    ciclo_colheita INTEGER NOT NULL,
    ciclo_limpeza INTEGER NOT NULL,
    espacamento_linhas REAL NOT NULL,
    espacamento_plantas REAL NOT NULL,
    produtividade_esperada REAL NOT NULL,
    area_modulo REAL NOT NULL,
    periodicidade INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS cultivo (
    id INTEGER PRIMARY KEY NOT NULL,
    horta_id INTEGER NOT NULL,
    hortalica_id INTEGER NOT NULL,
    data_inicio TEXT NOT NULL,
    producao_semanal_desejada REAL NOT NULL,
    num_modulos INTEGER NOT NULL,
    area_total_hortalica REAL,
    FOREIGN KEY (horta_id) REFERENCES horta(id) ON DELETE CASCADE,
    FOREIGN KEY (hortalica_id) REFERENCES hortalica(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS colheita (
    id INTEGER PRIMARY KEY NOT NULL,
    cultivo_id INTEGER,
    data TEXT NOT NULL,
    quantidade_colhida REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (cultivo_id) REFERENCES cultivo(id) ON DELETE SET NULL
  );`,
  `CREATE TABLE IF NOT EXISTS relatorio (
    id INTEGER PRIMARY KEY NOT NULL,
    horta_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    total_produzido_planejado REAL NOT NULL,
    total_colhido_real REAL NOT NULL DEFAULT 0,
    eficiencia REAL,
    FOREIGN KEY (horta_id) REFERENCES horta(id) ON DELETE CASCADE
  );`,
];
