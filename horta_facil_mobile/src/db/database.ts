import * as SQLite from 'expo-sqlite';
import seedData from '../data/seed_data.json';
import { SCHEMA_SQL } from './schema';
import type { Colheita, Cultivo, Horta, Hortalica, Relatorio } from './models';

const DB_NAME = 'horta_facil.db';

const dbInstance = SQLite.openDatabaseSync(DB_NAME);

type SeedItem = {
  model: string;
  pk: number;
  fields: Record<string, unknown>;
};

type SqlResultSet = {
  rows: {
    length: number;
    item: (index: number) => any;
  };
  insertId?: number;
};

const isSelectStatement = (sql: string) => /^\s*select/i.test(sql);

const executeSql = async (
  db: SQLite.SQLiteDatabase,
  sql: string,
  params: (string | number | null)[] = [],
): Promise<SqlResultSet> => {
  if (isSelectStatement(sql)) {
    const rows = await db.getAllAsync<any>(sql, params);
    return {
      rows: {
        length: rows.length,
        item: index => rows[index],
      },
    };
  }

  const result = await db.runAsync(sql, params);
  return {
    rows: {
      length: 0,
      item: () => undefined,
    },
    insertId: result.lastInsertRowId,
  };
};

const getSeedItems = (modelName: string): SeedItem[] =>
  (seedData as SeedItem[]).filter(item => item.model === modelName);

const toText = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === 'string' ? value : String(value);
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (value === null || value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  return dbInstance;
}

export async function initDatabase() {
  const db = await getDb();
  for (const statement of SCHEMA_SQL) {
    await executeSql(db, statement);
  }
  await seedDatabase(db);
  return db;
}

async function seedDatabase(db: SQLite.SQLiteDatabase) {
  const countResult = await executeSql(db, 'SELECT COUNT(*) as total FROM hortalica;');
  const rows = countResult.rows;
  const total = rows.item(0)?.total ?? 0;
  if (total > 0) {
    return;
  }

  await db.withExclusiveTransactionAsync(async (txn: SQLite.SQLiteDatabase) => {
    const tx = txn;

    const hortas = getSeedItems('core.horta');
    for (const horta of hortas) {
      const fields = horta.fields || {};
      await executeSql(
        tx,
        `INSERT INTO horta (id, nome, responsavel_id, localizacao, area_total, consumo_agua_estimado)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [
          horta.pk,
          toText(fields.nome),
          toNullableNumber(fields.responsavel),
          toText(fields.localizacao),
          toNullableNumber(fields.area_total),
          toNullableNumber(fields.consumo_agua_estimado),
        ],
      );
    }

    const hortalicas = getSeedItems('core.hortalica');
    for (const hortalica of hortalicas) {
      const fields = hortalica.fields || {};
      await executeSql(
        tx,
        `INSERT INTO hortalica (
          id, nome, tipo_plantio, ciclo_desenvolvimento, ciclo_colheita, ciclo_limpeza,
          espacamento_linhas, espacamento_plantas, produtividade_esperada, area_modulo, periodicidade
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          hortalica.pk,
          toText(fields.nome),
          toText(fields.tipo_plantio),
          toNumber(fields.ciclo_desenvolvimento),
          toNumber(fields.ciclo_colheita),
          toNumber(fields.ciclo_limpeza),
          toNumber(fields.espacamento_linhas),
          toNumber(fields.espacamento_plantas),
          toNumber(fields.produtividade_esperada),
          toNumber(fields.area_modulo),
          toNumber(fields.periodicidade),
        ],
      );
    }

    const cultivos = getSeedItems('core.cultivo');
    for (const cultivo of cultivos) {
      const fields = cultivo.fields || {};
      const hortalicaId = toNullableNumber(fields.hortalica);
      const numModulos = toNumber(fields.num_modulos);
      await executeSql(
        tx,
        `INSERT INTO cultivo (
          id, horta_id, hortalica_id, data_inicio, producao_semanal_desejada, num_modulos, area_total_hortalica
        ) VALUES (
          ?, ?, ?, ?, ?, ?, COALESCE(?, (SELECT area_modulo * ? FROM hortalica WHERE id = ?))
        );`,
        [
          cultivo.pk,
          toNullableNumber(fields.horta),
          hortalicaId,
          toText(fields.data_inicio),
          toNumber(fields.producao_semanal_desejada),
          numModulos,
          toNullableNumber(fields.area_total_hortalica),
          numModulos,
          hortalicaId,
        ],
      );
    }
  });
}

export async function listHortas(): Promise<Horta[]> {
  const db = await getDb();
  const result = await executeSql(db, 'SELECT * FROM horta ORDER BY nome;');
  const hortas: Horta[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    const row = result.rows.item(i);
    hortas.push({
      id: row.id,
      nome: row.nome,
      responsavelId: row.responsavel_id,
      localizacao: row.localizacao,
      areaTotal: row.area_total,
      consumoAguaEstimado: row.consumo_agua_estimado,
    });
  }
  return hortas;
}

export async function createHorta(input: Omit<Horta, 'id'>): Promise<number> {
  const db = await getDb();
  const result = await executeSql(
    db,
    `INSERT INTO horta (nome, responsavel_id, localizacao, area_total, consumo_agua_estimado)
     VALUES (?, ?, ?, ?, ?);`,
    [
      input.nome,
      input.responsavelId ?? null,
      input.localizacao ?? null,
      input.areaTotal ?? null,
      input.consumoAguaEstimado ?? null,
    ],
  );
  return result.insertId ?? 0;
}

export async function updateHorta(
  id: number,
  input: Partial<Omit<Horta, 'id'>>,
): Promise<void> {
  const db = await getDb();
  const current = await getHortaById(id);
  if (!current) {
    return;
  }
  await executeSql(
    db,
    `UPDATE horta SET
      nome = ?,
      responsavel_id = ?,
      localizacao = ?,
      area_total = ?,
      consumo_agua_estimado = ?
    WHERE id = ?;`,
    [
      input.nome ?? current.nome,
      input.responsavelId ?? current.responsavelId ?? null,
      input.localizacao ?? current.localizacao ?? null,
      input.areaTotal ?? current.areaTotal ?? null,
      input.consumoAguaEstimado ?? current.consumoAguaEstimado ?? null,
      id,
    ],
  );
}

export async function deleteHorta(id: number): Promise<void> {
  const db = await getDb();
  await executeSql(db, 'DELETE FROM horta WHERE id = ?;', [id]);
}

export async function listHortalicas(): Promise<Hortalica[]> {
  const db = await getDb();
  const result = await executeSql(db, 'SELECT * FROM hortalica ORDER BY nome;');
  const hortalicas: Hortalica[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    const row = result.rows.item(i);
    hortalicas.push({
      id: row.id,
      nome: row.nome,
      tipoPlantio: row.tipo_plantio,
      cicloDesenvolvimento: row.ciclo_desenvolvimento,
      cicloColheita: row.ciclo_colheita,
      cicloLimpeza: row.ciclo_limpeza,
      espacamentoLinhas: row.espacamento_linhas,
      espacamentoPlantas: row.espacamento_plantas,
      produtividadeEsperada: row.produtividade_esperada,
      areaModulo: row.area_modulo,
      periodicidade: row.periodicidade,
    });
  }
  return hortalicas;
}

export async function listCultivos(): Promise<Cultivo[]> {
  const db = await getDb();
  const result = await executeSql(db, 'SELECT * FROM cultivo ORDER BY data_inicio DESC;');
  const cultivos: Cultivo[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    const row = result.rows.item(i);
    cultivos.push({
      id: row.id,
      hortaId: row.horta_id,
      hortalicaId: row.hortalica_id,
      dataInicio: row.data_inicio,
      producaoSemanalDesejada: row.producao_semanal_desejada,
      numModulos: row.num_modulos,
      areaTotalHortalica: row.area_total_hortalica,
    });
  }
  return cultivos;
}

export async function createCultivo(input: Omit<Cultivo, 'id'>): Promise<number> {
  const db = await getDb();
  const areaTotal =
    input.areaTotalHortalica ??
    (await resolveAreaTotal(input.hortalicaId, input.numModulos));
  const result = await executeSql(
    db,
    `INSERT INTO cultivo (
      horta_id, hortalica_id, data_inicio, producao_semanal_desejada, num_modulos, area_total_hortalica
    ) VALUES (?, ?, ?, ?, ?, ?);`,
    [
      input.hortaId,
      input.hortalicaId,
      input.dataInicio,
      input.producaoSemanalDesejada,
      input.numModulos,
      areaTotal,
    ],
  );
  return result.insertId ?? 0;
}

export async function updateCultivo(
  id: number,
  input: Partial<Omit<Cultivo, 'id'>>,
): Promise<void> {
  const db = await getDb();
  const current = await getCultivoById(id);
  if (!current) {
    return;
  }

  const hortalicaId = input.hortalicaId ?? current.hortalicaId;
  const numModulos = input.numModulos ?? current.numModulos;
  const areaTotal =
    input.areaTotalHortalica ??
    (await resolveAreaTotal(hortalicaId, numModulos));

  await executeSql(
    db,
    `UPDATE cultivo SET
      horta_id = ?,
      hortalica_id = ?,
      data_inicio = ?,
      producao_semanal_desejada = ?,
      num_modulos = ?,
      area_total_hortalica = ?
    WHERE id = ?;`,
    [
      input.hortaId ?? current.hortaId,
      hortalicaId,
      input.dataInicio ?? current.dataInicio,
      input.producaoSemanalDesejada ?? current.producaoSemanalDesejada,
      numModulos,
      areaTotal,
      id,
    ],
  );
}

export async function deleteCultivo(id: number): Promise<void> {
  const db = await getDb();
  await executeSql(db, 'DELETE FROM cultivo WHERE id = ?;', [id]);
}

export async function listColheitas(): Promise<Colheita[]> {
  const db = await getDb();
  const result = await executeSql(db, 'SELECT * FROM colheita ORDER BY data DESC;');
  const colheitas: Colheita[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    const row = result.rows.item(i);
    colheitas.push({
      id: row.id,
      cultivoId: row.cultivo_id,
      data: row.data,
      quantidadeColhida: row.quantidade_colhida,
    });
  }
  return colheitas;
}

export async function createColheita(input: Omit<Colheita, 'id'>): Promise<number> {
  const db = await getDb();
  const result = await executeSql(
    db,
    `INSERT INTO colheita (cultivo_id, data, quantidade_colhida)
     VALUES (?, ?, ?);`,
    [input.cultivoId ?? null, input.data, input.quantidadeColhida],
  );
  return result.insertId ?? 0;
}

export async function updateColheita(
  id: number,
  input: Partial<Omit<Colheita, 'id'>>,
): Promise<void> {
  const db = await getDb();
  const current = await getColheitaById(id);
  if (!current) {
    return;
  }
  await executeSql(
    db,
    `UPDATE colheita SET
      cultivo_id = ?,
      data = ?,
      quantidade_colhida = ?
    WHERE id = ?;`,
    [
      input.cultivoId ?? current.cultivoId ?? null,
      input.data ?? current.data,
      input.quantidadeColhida ?? current.quantidadeColhida,
      id,
    ],
  );
}

export async function deleteColheita(id: number): Promise<void> {
  const db = await getDb();
  await executeSql(db, 'DELETE FROM colheita WHERE id = ?;', [id]);
}

export async function listRelatorios(): Promise<Relatorio[]> {
  const db = await getDb();
  const result = await executeSql(db, 'SELECT * FROM relatorio ORDER BY data DESC;');
  const relatorios: Relatorio[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    const row = result.rows.item(i);
    relatorios.push({
      id: row.id,
      hortaId: row.horta_id,
      data: row.data,
      totalProduzidoPlanejado: row.total_produzido_planejado,
      totalColhidoReal: row.total_colhido_real,
      eficiencia: row.eficiencia,
    });
  }
  return relatorios;
}

export async function createRelatorio(input: Omit<Relatorio, 'id'>): Promise<number> {
  const db = await getDb();
  const eficiencia =
    input.eficiencia ??
    calculateEficiencia(input.totalProduzidoPlanejado, input.totalColhidoReal);
  const result = await executeSql(
    db,
    `INSERT INTO relatorio (
      horta_id, data, total_produzido_planejado, total_colhido_real, eficiencia
    ) VALUES (?, ?, ?, ?, ?);`,
    [
      input.hortaId,
      input.data,
      input.totalProduzidoPlanejado,
      input.totalColhidoReal,
      eficiencia,
    ],
  );
  return result.insertId ?? 0;
}

export async function updateRelatorio(
  id: number,
  input: Partial<Omit<Relatorio, 'id'>>,
): Promise<void> {
  const db = await getDb();
  const current = await getRelatorioById(id);
  if (!current) {
    return;
  }
  const totalProduzidoPlanejado =
    input.totalProduzidoPlanejado ?? current.totalProduzidoPlanejado;
  const totalColhidoReal = input.totalColhidoReal ?? current.totalColhidoReal;
  const eficiencia =
    input.eficiencia ?? calculateEficiencia(totalProduzidoPlanejado, totalColhidoReal);

  await executeSql(
    db,
    `UPDATE relatorio SET
      horta_id = ?,
      data = ?,
      total_produzido_planejado = ?,
      total_colhido_real = ?,
      eficiencia = ?
    WHERE id = ?;`,
    [
      input.hortaId ?? current.hortaId,
      input.data ?? current.data,
      totalProduzidoPlanejado,
      totalColhidoReal,
      eficiencia,
      id,
    ],
  );
}

export async function deleteRelatorio(id: number): Promise<void> {
  const db = await getDb();
  await executeSql(db, 'DELETE FROM relatorio WHERE id = ?;', [id]);
}

async function getCultivoById(id: number): Promise<Cultivo | null> {
  const db = await getDb();
  const result = await executeSql(db, 'SELECT * FROM cultivo WHERE id = ?;', [id]);
  if (result.rows.length === 0) {
    return null;
  }
  const row = result.rows.item(0);
  return {
    id: row.id,
    hortaId: row.horta_id,
    hortalicaId: row.hortalica_id,
    dataInicio: row.data_inicio,
    producaoSemanalDesejada: row.producao_semanal_desejada,
    numModulos: row.num_modulos,
    areaTotalHortalica: row.area_total_hortalica,
  };
}

async function getHortaById(id: number): Promise<Horta | null> {
  const db = await getDb();
  const result = await executeSql(db, 'SELECT * FROM horta WHERE id = ?;', [id]);
  if (result.rows.length === 0) {
    return null;
  }
  const row = result.rows.item(0);
  return {
    id: row.id,
    nome: row.nome,
    responsavelId: row.responsavel_id,
    localizacao: row.localizacao,
    areaTotal: row.area_total,
    consumoAguaEstimado: row.consumo_agua_estimado,
  };
}

async function getColheitaById(id: number): Promise<Colheita | null> {
  const db = await getDb();
  const result = await executeSql(db, 'SELECT * FROM colheita WHERE id = ?;', [id]);
  if (result.rows.length === 0) {
    return null;
  }
  const row = result.rows.item(0);
  return {
    id: row.id,
    cultivoId: row.cultivo_id,
    data: row.data,
    quantidadeColhida: row.quantidade_colhida,
  };
}

async function getRelatorioById(id: number): Promise<Relatorio | null> {
  const db = await getDb();
  const result = await executeSql(db, 'SELECT * FROM relatorio WHERE id = ?;', [id]);
  if (result.rows.length === 0) {
    return null;
  }
  const row = result.rows.item(0);
  return {
    id: row.id,
    hortaId: row.horta_id,
    data: row.data,
    totalProduzidoPlanejado: row.total_produzido_planejado,
    totalColhidoReal: row.total_colhido_real,
    eficiencia: row.eficiencia,
  };
}

async function resolveAreaTotal(hortalicaId: number, numModulos: number): Promise<number> {
  const db = await getDb();
  const result = await executeSql(db, 'SELECT area_modulo FROM hortalica WHERE id = ?;', [
    hortalicaId,
  ]);
  const areaModulo = result.rows.item(0)?.area_modulo ?? 0;
  return areaModulo * numModulos;
}

function calculateEficiencia(totalPlanejado: number, totalReal: number): number {
  if (!totalPlanejado || totalPlanejado <= 0) {
    return 0;
  }
  return (totalReal / totalPlanejado) * 100;
}
