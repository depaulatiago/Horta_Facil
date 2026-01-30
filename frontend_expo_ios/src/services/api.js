// src/services/api.js
import axios from 'axios';

// URL base da API
// No celular/emulador, substitua 'localhost' pelo IP da sua máquina
// Exemplo: const API_BASE_URL = 'http://192.168.1.100:8000/api';
// Para descobrir seu IP: ifconfig ou hostname -I no terminal
// Uso um fallback para o seu IP local detectado: 192.168.2.137
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.2.137:8000/api';

// Crie uma instância do axios com configuração padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- FUNÇÕES DE API ---

/**
 * Busca todas as hortas
 * @returns {Promise<Array>} Lista de hortas
 */
export const fetchHortas = async () => {
  try {
    const response = await api.get('/hortas/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar hortas:', error);
    throw new Error(error.response?.data?.detail || 'Erro ao carregar hortas');
  }
};

/**
 * Cria uma nova horta
 * @param {Object} hortaData - Dados da horta (nome, localizacao, area_total)
 * @returns {Promise<Object>} Horta criada
 */
export const createHorta = async (hortaData) => {
  try {
    const response = await api.post('/hortas/', hortaData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar horta:', error);
    throw new Error(error.response?.data?.detail || 'Erro ao criar horta');
  }
};

/**
 * Exclui uma horta
 * @param {number} hortaId - ID da horta a ser excluída
 * @returns {Promise<void>}
 */
export const deleteHorta = async (hortaId) => {
  try {
    await api.delete(`/hortas/${hortaId}/`);
  } catch (error) {
    console.error('Erro ao excluir horta:', error);
    throw new Error(error.response?.data?.detail || 'Erro ao excluir horta');
  }
};

/**
 * Busca todas as hortaliças (modelos de cultivo)
 * @returns {Promise<Array>} Lista de hortaliças
 */
export const fetchHortalicas = async () => {
  try {
    const response = await api.get('/hortalicas/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar hortaliças:', error);
    throw new Error(error.response?.data?.detail || 'Erro ao carregar hortaliças');
  }
};

/**
 * Busca cultivos de uma horta específica
 * @param {number} hortaId - ID da horta
 * @returns {Promise<Array>} Lista de cultivos filtrados
 */
export const fetchCultivos = async (hortaId) => {
  try {
    const response = await api.get('/cultivos/');
    // Filtra no frontend (idealmente o backend deveria fazer isso)
    return response.data.filter(cultivo => cultivo.horta === hortaId);
  } catch (error) {
    console.error('Erro ao buscar cultivos:', error);
    throw new Error(error.response?.data?.detail || 'Erro ao carregar cultivos');
  }
};

/**
 * Cria um novo cultivo
 * @param {Object} cultivoData - Dados do cultivo
 * @returns {Promise<Object>} Cultivo criado
 */
export const createCultivo = async (cultivoData) => {
  try {
    const response = await api.post('/cultivos/', cultivoData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar cultivo:', error);
    throw new Error(error.response?.data?.detail || 'Erro ao criar cultivo');
  }
};

/**
 * Exclui um cultivo
 * @param {number} cultivoId - ID do cultivo a ser excluído
 * @returns {Promise<void>}
 */
export const deleteCultivo = async (cultivoId) => {
  try {
    await api.delete(`/cultivos/${cultivoId}/`);
  } catch (error) {
    console.error('Erro ao excluir cultivo:', error);
    throw new Error(error.response?.data?.detail || 'Erro ao excluir cultivo');
  }
};

/**
 * Busca o calendário de atividades de um cultivo
 * @param {number} cultivoId - ID do cultivo
 * @returns {Promise<Array>} Lista de atividades do calendário
 */
export const fetchCalendario = async (cultivoId) => {
  try {
    const response = await api.get(`/cultivos/${cultivoId}/calendario/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar calendário:', error);
    throw new Error(error.response?.data?.detail || 'Erro ao carregar calendário');
  }
};

/**
 * Busca o calendário consolidado de TODOS os cultivos do usuário
 * @returns {Promise<Array>} Lista de atividades consolidadas
 */
export const fetchCalendarioConsolidado = async () => {
  try {
    const response = await api.get('/cultivos/calendario-consolidado/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar calendário consolidado:', error);
    throw new Error(error.response?.data?.detail || 'Erro ao carregar cronograma');
  }
};

/**
 * Gera PDF com cronograma semanal
 * @returns {Promise<string>} URL do PDF gerado
 */
export const gerarPDFSemanal = async () => {
  try {
    const url = `${API_BASE_URL}/cultivos/gerar-pdf-semanal/`;
    return url;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error(error.response?.data?.detail || 'Erro ao gerar PDF');
  }
};

/**
 * Calcula o dimensionamento para uma hortaliça
 * @param {number} hortalicaId - ID da hortaliça
 * @param {number} producaoDesejada - Produção semanal desejada
 * @returns {Promise<Object>} Resultado do cálculo
 */
export const calcularDimensionamento = async (hortalicaId, producaoDesejada) => {
  try {
    const response = await api.get(
      `/hortalicas/${hortalicaId}/calcular-dimensionamento/`,
      {
        params: { desejada: producaoDesejada }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao calcular dimensionamento:', error);
    throw new Error(error.response?.data?.detail || 'Erro ao calcular dimensionamento');
  }
};

/**
 * Busca cultivos detalhados (com informações das hortaliças)
 * @param {number} hortaId - ID da horta
 * @returns {Promise<Array>} Lista de cultivos com detalhes das hortaliças
 */
export const fetchCultivosDetalhados = async (hortaId) => {
  try {
    // Busca cultivos e hortaliças em paralelo
    const [cultivos, hortalicas] = await Promise.all([
      fetchCultivos(hortaId),
      fetchHortalicas()
    ]);

    // Cria um mapa de hortaliças para busca rápida
    const hortalicasMap = hortalicas.reduce((map, h) => {
      map[h.id] = h;
      return map;
    }, {});

    // Combina os dados
    return cultivos.map(cultivo => ({
      cultivo,
      hortalica: hortalicasMap[cultivo.hortalica]
    })).filter(item => item.hortalica); // Remove itens sem hortaliça
  } catch (error) {
    console.error('Erro ao buscar cultivos detalhados:', error);
    throw error;
  }
};

export { API_BASE_URL };
export default api;
