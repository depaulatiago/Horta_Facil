// src/services/localDataService.js
import { openDatabase } from './database';

/**
 * OPERAÇÕES COM HORTAS
 */

export const fetchHortas = async () => {
  try {
    const db = await openDatabase();
    const hortas = await db.getAllAsync('SELECT * FROM hortas ORDER BY nome');
    return hortas;
  } catch (error) {
    console.error('Erro ao buscar hortas:', error);
    throw new Error('Erro ao carregar hortas');
  }
};

export const fetchHortaById = async (id) => {
  try {
    const db = await openDatabase();
    const horta = await db.getFirstAsync('SELECT * FROM hortas WHERE id = ?', [id]);
    return horta;
  } catch (error) {
    console.error('Erro ao buscar horta:', error);
    throw new Error('Erro ao carregar horta');
  }
};

export const createHorta = async (hortaData) => {
  try {
    const db = await openDatabase();
    const result = await db.runAsync(
      'INSERT INTO hortas (nome, localizacao, area_total, consumo_agua_estimado) VALUES (?, ?, ?, ?)',
      [hortaData.nome, hortaData.localizacao, hortaData.area_total, hortaData.consumo_agua_estimado]
    );
    
    // Retorna a horta criada
    return await fetchHortaById(result.lastInsertRowId);
  } catch (error) {
    console.error('Erro ao criar horta:', error);
    throw new Error('Erro ao criar horta');
  }
};

export const updateHorta = async (id, hortaData) => {
  try {
    const db = await openDatabase();
    await db.runAsync(
      'UPDATE hortas SET nome = ?, localizacao = ?, area_total = ?, consumo_agua_estimado = ? WHERE id = ?',
      [hortaData.nome, hortaData.localizacao, hortaData.area_total, hortaData.consumo_agua_estimado, id]
    );
    
    return await fetchHortaById(id);
  } catch (error) {
    console.error('Erro ao atualizar horta:', error);
    throw new Error('Erro ao atualizar horta');
  }
};

export const deleteHorta = async (hortaId) => {
  try {
    const db = await openDatabase();
    await db.runAsync('DELETE FROM hortas WHERE id = ?', [hortaId]);
  } catch (error) {
    console.error('Erro ao excluir horta:', error);
    throw new Error('Erro ao excluir horta');
  }
};

/**
 * OPERAÇÕES COM HORTALIÇAS (templates/modelos)
 */

export const fetchHortalicas = async () => {
  try {
    const db = await openDatabase();
    const hortalicas = await db.getAllAsync('SELECT * FROM hortalicas ORDER BY nome');
    return hortalicas;
  } catch (error) {
    console.error('Erro ao buscar hortaliças:', error);
    throw new Error('Erro ao carregar hortaliças');
  }
};

export const fetchHortalicaById = async (id) => {
  try {
    const db = await openDatabase();
    const hortalica = await db.getFirstAsync('SELECT * FROM hortalicas WHERE id = ?', [id]);
    return hortalica;
  } catch (error) {
    console.error('Erro ao buscar hortaliça:', error);
    throw new Error('Erro ao carregar hortaliça');
  }
};

export const createHortalica = async (hortalicaData) => {
  try {
    const db = await openDatabase();
    const result = await db.runAsync(
      `INSERT INTO hortalicas (
        nome, tipo_plantio, ciclo_desenvolvimento, ciclo_colheita, ciclo_limpeza,
        espacamento_linhas, espacamento_plantas, produtividade_esperada, area_modulo, periodicidade
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hortalicaData.nome,
        hortalicaData.tipo_plantio,
        hortalicaData.ciclo_desenvolvimento,
        hortalicaData.ciclo_colheita,
        hortalicaData.ciclo_limpeza,
        hortalicaData.espacamento_linhas,
        hortalicaData.espacamento_plantas,
        hortalicaData.produtividade_esperada,
        hortalicaData.area_modulo,
        hortalicaData.periodicidade
      ]
    );
    
    return await fetchHortalicaById(result.lastInsertRowId);
  } catch (error) {
    console.error('Erro ao criar hortaliça:', error);
    throw new Error('Erro ao criar hortaliça');
  }
};

export const deleteHortalica = async (id) => {
  try {
    const db = await openDatabase();
    await db.runAsync('DELETE FROM hortalicas WHERE id = ?', [id]);
  } catch (error) {
    console.error('Erro ao excluir hortaliça:', error);
    throw new Error('Erro ao excluir hortaliça');
  }
};

export const calcularDimensionamento = async (hortalicaId, producaoDesejada) => {
  try {
    const hortalica = await fetchHortalicaById(hortalicaId);

    if (!hortalica) {
      throw new Error('Hortaliça não encontrada');
    }

    const producao = Number(producaoDesejada);
    const produtividade = Number(hortalica.produtividade_esperada);
    const areaModulo = Number(hortalica.area_modulo);

    if (!Number.isFinite(producao) || producao <= 0) {
      throw new Error('Informe uma produção semanal válida');
    }

    if (!Number.isFinite(produtividade) || produtividade <= 0) {
      throw new Error('Produtividade esperada inválida para esta hortaliça');
    }

    if (!Number.isFinite(areaModulo) || areaModulo <= 0) {
      throw new Error('Área por módulo inválida para esta hortaliça');
    }

    const num_modulos_calculado = Math.max(1, Math.ceil(producao / produtividade));
    const area_total_calculada = Number((num_modulos_calculado * areaModulo).toFixed(2));

    return {
      num_modulos_calculado,
      area_total_calculada,
    };
  } catch (error) {
    console.error('Erro ao calcular dimensionamento:', error);
    throw new Error(error.message || 'Erro ao calcular dimensionamento');
  }
};

/**
 * OPERAÇÕES COM CULTIVOS (instâncias de plantio)
 */

export const fetchCultivos = async (hortaId = null) => {
  try {
    const db = await openDatabase();
    let query = `
      SELECT 
        c.*,
        h.nome as hortalica_nome,
        h.ciclo_colheita,
        h.ciclo_desenvolvimento,
        hor.nome as horta_nome
      FROM cultivos c
      INNER JOIN hortalicas h ON c.hortalica_id = h.id
      INNER JOIN hortas hor ON c.horta_id = hor.id
    `;
    
    if (hortaId) {
      query += ' WHERE c.horta_id = ? ORDER BY c.data_inicio DESC';
      return await db.getAllAsync(query, [hortaId]);
    } else {
      query += ' ORDER BY c.data_inicio DESC';
      return await db.getAllAsync(query);
    }
  } catch (error) {
    console.error('Erro ao buscar cultivos:', error);
    throw new Error('Erro ao carregar cultivos');
  }
};

export const fetchCultivoById = async (id) => {
  try {
    const db = await openDatabase();
    const query = `
      SELECT 
        c.*,
        h.nome as hortalica_nome,
        h.tipo_plantio,
        h.ciclo_desenvolvimento,
        h.ciclo_colheita,
        h.ciclo_limpeza,
        h.area_modulo,
        hor.nome as horta_nome
      FROM cultivos c
      INNER JOIN hortalicas h ON c.hortalica_id = h.id
      INNER JOIN hortas hor ON c.horta_id = hor.id
      WHERE c.id = ?
    `;
    const cultivo = await db.getFirstAsync(query, [id]);
    return cultivo;
  } catch (error) {
    console.error('Erro ao buscar cultivo:', error);
    throw new Error('Erro ao carregar cultivo');
  }
};

export const createCultivo = async (cultivoData) => {
  try {
    const db = await openDatabase();
    
    // Busca informações da hortaliça para calcular área total
    const hortalica = await fetchHortalicaById(cultivoData.hortalica_id);
    const area_total_hortalica = cultivoData.num_modulos * hortalica.area_modulo;
    
    const result = await db.runAsync(
      `INSERT INTO cultivos (
        horta_id, hortalica_id, data_inicio, producao_semanal_desejada, 
        num_modulos, area_total_hortalica
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        cultivoData.horta_id,
        cultivoData.hortalica_id,
        cultivoData.data_inicio,
        cultivoData.producao_semanal_desejada,
        cultivoData.num_modulos,
        area_total_hortalica
      ]
    );
    
    return await fetchCultivoById(result.lastInsertRowId);
  } catch (error) {
    console.error('Erro ao criar cultivo:', error);
    throw new Error('Erro ao criar cultivo');
  }
};

export const updateCultivo = async (id, cultivoData) => {
  try {
    const db = await openDatabase();
    
    // Recalcula área total se necessário
    let area_total_hortalica = cultivoData.area_total_hortalica;
    if (cultivoData.num_modulos && cultivoData.hortalica_id) {
      const hortalica = await fetchHortalicaById(cultivoData.hortalica_id);
      area_total_hortalica = cultivoData.num_modulos * hortalica.area_modulo;
    }
    
    await db.runAsync(
      `UPDATE cultivos SET 
        horta_id = ?, hortalica_id = ?, data_inicio = ?, 
        producao_semanal_desejada = ?, num_modulos = ?, area_total_hortalica = ?
      WHERE id = ?`,
      [
        cultivoData.horta_id,
        cultivoData.hortalica_id,
        cultivoData.data_inicio,
        cultivoData.producao_semanal_desejada,
        cultivoData.num_modulos,
        area_total_hortalica,
        id
      ]
    );
    
    return await fetchCultivoById(id);
  } catch (error) {
    console.error('Erro ao atualizar cultivo:', error);
    throw new Error('Erro ao atualizar cultivo');
  }
};

export const deleteCultivo = async (id) => {
  try {
    const db = await openDatabase();
    await db.runAsync('DELETE FROM cultivos WHERE id = ?', [id]);
  } catch (error) {
    console.error('Erro ao excluir cultivo:', error);
    throw new Error('Erro ao excluir cultivo');
  }
};

/**
 * OPERAÇÕES COM COLHEITAS
 */

export const fetchColheitas = async (cultivoId = null) => {
  try {
    const db = await openDatabase();
    let query = `
      SELECT 
        col.*,
        c.hortalica_id,
        h.nome as hortalica_nome
      FROM colheitas col
      LEFT JOIN cultivos c ON col.cultivo_id = c.id
      LEFT JOIN hortalicas h ON c.hortalica_id = h.id
    `;
    
    if (cultivoId) {
      query += ' WHERE col.cultivo_id = ? ORDER BY col.data DESC';
      return await db.getAllAsync(query, [cultivoId]);
    } else {
      query += ' ORDER BY col.data DESC';
      return await db.getAllAsync(query);
    }
  } catch (error) {
    console.error('Erro ao buscar colheitas:', error);
    throw new Error('Erro ao carregar colheitas');
  }
};

export const createColheita = async (colheitaData) => {
  try {
    const db = await openDatabase();
    const result = await db.runAsync(
      'INSERT INTO colheitas (cultivo_id, data, quantidade_colhida) VALUES (?, ?, ?)',
      [colheitaData.cultivo_id, colheitaData.data, colheitaData.quantidade_colhida]
    );
    
    // Retorna a colheita criada
    const colheita = await db.getFirstAsync('SELECT * FROM colheitas WHERE id = ?', [result.lastInsertRowId]);
    return colheita;
  } catch (error) {
    console.error('Erro ao criar colheita:', error);
    throw new Error('Erro ao criar colheita');
  }
};

export const deleteColheita = async (id) => {
  try {
    const db = await openDatabase();
    await db.runAsync('DELETE FROM colheitas WHERE id = ?', [id]);
  } catch (error) {
    console.error('Erro ao excluir colheita:', error);
    throw new Error('Erro ao excluir colheita');
  }
};

/**
 * OPERAÇÕES COM RELATÓRIOS
 */

export const fetchRelatorios = async (hortaId = null) => {
  try {
    const db = await openDatabase();
    let query = `
      SELECT 
        r.*,
        h.nome as horta_nome
      FROM relatorios r
      INNER JOIN hortas h ON r.horta_id = h.id
    `;
    
    if (hortaId) {
      query += ' WHERE r.horta_id = ? ORDER BY r.data DESC';
      return await db.getAllAsync(query, [hortaId]);
    } else {
      query += ' ORDER BY r.data DESC';
      return await db.getAllAsync(query);
    }
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error);
    throw new Error('Erro ao carregar relatórios');
  }
};

export const createRelatorio = async (relatorioData) => {
  try {
    const db = await openDatabase();
    
    // Calcula eficiência
    let eficiencia = 0;
    if (relatorioData.total_produzido_planejado > 0) {
      eficiencia = (relatorioData.total_colhido_real / relatorioData.total_produzido_planejado) * 100;
    }
    
    const result = await db.runAsync(
      `INSERT INTO relatorios (
        horta_id, data, total_produzido_planejado, total_colhido_real, eficiencia
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        relatorioData.horta_id,
        relatorioData.data,
        relatorioData.total_produzido_planejado,
        relatorioData.total_colhido_real,
        eficiencia
      ]
    );
    
    const relatorio = await db.getFirstAsync('SELECT * FROM relatorios WHERE id = ?', [result.lastInsertRowId]);
    return relatorio;
  } catch (error) {
    console.error('Erro ao criar relatório:', error);
    throw new Error('Erro ao criar relatório');
  }
};

/**
 * FUNÇÕES AUXILIARES PARA COMPATIBILIDADE COM API ANTIGA
 */

// Para manter compatibilidade com código que usa "horta" ao invés de "horta_id"
export const fetchCultivosByHorta = async (hortaId) => {
  const cultivos = await fetchCultivos(hortaId);
  // Transforma para formato esperado pelo código antigo
  return cultivos.map(c => ({
    ...c,
    horta: c.horta_id,
    hortalica: c.hortalica_id,
    hortalica_nome: c.hortalica_nome
  }));
};

// Função para buscar hortaliça por nome (útil para AddHortalicaScreen)
export const fetchHortalicaByName = async (nome) => {
  try {
    const db = await openDatabase();
    const hortalica = await db.getFirstAsync('SELECT * FROM hortalicas WHERE nome = ?', [nome]);
    return hortalica;
  } catch (error) {
    console.error('Erro ao buscar hortaliça por nome:', error);
    return null;
  }
};

// Exporta todas as funções que já existiam na API antiga
export default {
  // Hortas
  fetchHortas,
  fetchHortaById,
  createHorta,
  updateHorta,
  deleteHorta,
  
  // Hortaliças
  fetchHortalicas,
  fetchHortalicaById,
  createHortalica,
  deleteHortalica,
  fetchHortalicaByName,
  
  // Cultivos
  fetchCultivos,
  fetchCultivoById,
  fetchCultivosByHorta,
  createCultivo,
  updateCultivo,
  deleteCultivo,
  
  // Colheitas
  fetchColheitas,
  createColheita,
  deleteColheita,
  
  // Relatórios
  fetchRelatorios,
  createRelatorio
};
