import {
  createCultivo as dbCreateCultivo,
  createHorta as dbCreateHorta,
  deleteCultivo as dbDeleteCultivo,
  deleteHorta as dbDeleteHorta,
  initDatabase,
  listCultivos,
  listHortalicas,
  listHortas,
} from '../db/database';
import * as Print from 'expo-print';

let dbReadyPromise = null;

const ensureDbReady = async () => {
  if (!dbReadyPromise) {
    dbReadyPromise = initDatabase().then(() => undefined);
  }
  return dbReadyPromise;
};

const toHortaApiShape = horta => ({
  id: horta.id,
  nome: horta.nome,
  responsavel: horta.responsavelId ?? null,
  localizacao: horta.localizacao ?? null,
  area_total: horta.areaTotal ?? null,
  consumo_agua_estimado: horta.consumoAguaEstimado ?? null,
});

const toHortalicaApiShape = hortalica => ({
  id: hortalica.id,
  nome: hortalica.nome,
  tipo_plantio: hortalica.tipoPlantio,
  ciclo_desenvolvimento: hortalica.cicloDesenvolvimento,
  ciclo_colheita: hortalica.cicloColheita,
  ciclo_limpeza: hortalica.cicloLimpeza,
  espacamento_linhas: hortalica.espacamentoLinhas,
  espacamento_plantas: hortalica.espacamentoPlantas,
  produtividade_esperada: hortalica.produtividadeEsperada,
  area_modulo: hortalica.areaModulo,
  periodicidade: hortalica.periodicidade,
});

const toCultivoApiShape = cultivo => ({
  id: cultivo.id,
  horta: cultivo.hortaId,
  hortalica: cultivo.hortalicaId,
  data_inicio: cultivo.dataInicio,
  producao_semanal_desejada: cultivo.producaoSemanalDesejada,
  num_modulos: cultivo.numModulos,
  area_total_hortalica: cultivo.areaTotalHortalica ?? null,
});

const parseDate = dateString => {
  if (!dateString) {
    return new Date();
  }
  return new Date(`${dateString}T00:00:00`);
};

const addWeeks = (date, weeks) => {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
};

const formatDate = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const fetchHortas = async () => {
  await ensureDbReady();
  const hortas = await listHortas();
  return hortas.map(toHortaApiShape);
};

export const createHorta = async hortaData => {
  await ensureDbReady();
  const id = await dbCreateHorta({
    nome: hortaData.nome,
    localizacao: hortaData.localizacao ?? null,
    areaTotal: hortaData.area_total ?? null,
    consumoAguaEstimado: hortaData.consumo_agua_estimado ?? null,
    responsavelId: hortaData.responsavel ?? null,
  });
  return { ...hortaData, id };
};

export const deleteHorta = async hortaId => {
  await ensureDbReady();
  await dbDeleteHorta(hortaId);
};

export const fetchHortalicas = async () => {
  await ensureDbReady();
  const hortalicas = await listHortalicas();
  return hortalicas.map(toHortalicaApiShape);
};

export const fetchCultivos = async hortaId => {
  await ensureDbReady();
  const cultivos = await listCultivos();
  return cultivos
    .filter(cultivo => cultivo.hortaId === hortaId)
    .map(toCultivoApiShape);
};

export const createCultivo = async cultivoData => {
  await ensureDbReady();
  const id = await dbCreateCultivo({
    hortaId: cultivoData.horta,
    hortalicaId: cultivoData.hortalica,
    dataInicio: cultivoData.data_inicio,
    producaoSemanalDesejada: cultivoData.producao_semanal_desejada,
    numModulos: cultivoData.num_modulos,
    areaTotalHortalica: cultivoData.area_total_hortalica ?? null,
  });
  return { ...cultivoData, id };
};

export const deleteCultivo = async cultivoId => {
  await ensureDbReady();
  await dbDeleteCultivo(cultivoId);
};

export const calcularDimensionamento = async (hortalicaId, producaoDesejada) => {
  await ensureDbReady();
  const hortalicas = await listHortalicas();
  const hortalica = hortalicas.find(item => item.id === hortalicaId);
  if (!hortalica) {
    throw new Error('Hortaliça não encontrada');
  }
  if (!producaoDesejada || producaoDesejada <= 0) {
    throw new Error('A produção desejada deve ser maior que 0');
  }
  if (!hortalica.produtividadeEsperada || hortalica.produtividadeEsperada <= 0) {
    throw new Error('Produtividade esperada inválida');
  }
  const numModulos = Math.ceil(producaoDesejada / hortalica.produtividadeEsperada);
  const areaTotal = numModulos * hortalica.areaModulo;
  return {
    num_modulos_calculado: numModulos,
    area_total_calculada: areaTotal,
  };
};

export const fetchCultivosDetalhados = async hortaId => {
  await ensureDbReady();
  const [cultivos, hortalicas] = await Promise.all([
    fetchCultivos(hortaId),
    fetchHortalicas(),
  ]);
  const hortalicasMap = hortalicas.reduce((map, h) => {
    map[h.id] = h;
    return map;
  }, {});

  return cultivos
    .map(cultivo => ({
      cultivo,
      hortalica: hortalicasMap[cultivo.hortalica],
    }))
    .filter(item => item.hortalica);
};

export const fetchCalendario = async cultivoId => {
  await ensureDbReady();
  const cultivos = await listCultivos();
  const cultivo = cultivos.find(item => item.id === cultivoId);
  if (!cultivo) {
    throw new Error('Cultivo não encontrado');
  }
  const hortalicas = await listHortalicas();
  const hortalica = hortalicas.find(item => item.id === cultivo.hortalicaId);
  if (!hortalica) {
    throw new Error('Hortaliça não encontrada');
  }

  const dataInicio = parseDate(cultivo.dataInicio);
  const atividades = [];

  for (let i = 0; i < cultivo.numModulos; i += 1) {
    const inicioPlantio = addWeeks(dataInicio, i * hortalica.periodicidade);
    const inicioColheita = addWeeks(inicioPlantio, hortalica.cicloDesenvolvimento);
    const fimColheita = addWeeks(inicioColheita, hortalica.cicloColheita);

    atividades.push({
      modulo: i + 1,
      data_plantio: formatDate(inicioPlantio),
      data_inicio_colheita: formatDate(inicioColheita),
      data_fim_colheita: formatDate(fimColheita),
    });
  }

  return atividades;
};

export const fetchCalendarioConsolidado = async () => {
  await ensureDbReady();
  const [cultivos, hortalicas, hortas] = await Promise.all([
    listCultivos(),
    listHortalicas(),
    listHortas(),
  ]);

  const hortalicasMap = hortalicas.reduce((map, h) => {
    map[h.id] = h;
    return map;
  }, {});

  const hortasMap = hortas.reduce((map, h) => {
    map[h.id] = h;
    return map;
  }, {});

  const atividades = [];

  cultivos.forEach(cultivo => {
    const hortalica = hortalicasMap[cultivo.hortalicaId];
    const horta = hortasMap[cultivo.hortaId];
    if (!hortalica || !horta) {
      return;
    }

    const dataInicio = parseDate(cultivo.dataInicio);
    for (let i = 0; i < cultivo.numModulos; i += 1) {
      const inicioPlantio = addWeeks(dataInicio, i * hortalica.periodicidade);
      const inicioColheita = addWeeks(inicioPlantio, hortalica.cicloDesenvolvimento);
      const fimColheita = addWeeks(inicioColheita, hortalica.cicloColheita);
      const inicioLimpeza = fimColheita;
      const fimLimpeza = addWeeks(inicioLimpeza, hortalica.cicloLimpeza);

      atividades.push({
        horta_id: horta.id,
        horta_nome: horta.nome,
        hortalica_id: hortalica.id,
        hortalica_nome: hortalica.nome,
        cultivo_id: cultivo.id,
        modulo: i + 1,
        data_plantio: inicioPlantio.toISOString(),
        data_inicio_colheita: inicioColheita.toISOString(),
        data_fim_colheita: fimColheita.toISOString(),
        data_inicio_limpeza: inicioLimpeza.toISOString(),
        data_proximo_plantio_disponivel: fimLimpeza.toISOString(),
      });
    }
  });

  atividades.sort((a, b) => a.data_plantio.localeCompare(b.data_plantio));
  return atividades;
};

const getWeekRange = () => {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const diffInicio = diaSemana === 0 ? -6 : 1 - diaSemana;
  const inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() + diffInicio);
  inicio.setHours(0, 0, 0, 0);

  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  fim.setHours(23, 59, 59, 999);

  return { inicio, fim };
};

const formatDateBr = date => date.toLocaleDateString('pt-BR');

const buildPdfHtml = (tarefas, inicioSemana, fimSemana) => {
  const linhas = tarefas
    .map(
      tarefa => `
        <tr>
          <td>${formatDateBr(tarefa.data)}</td>
          <td>${tarefa.tipo}</td>
          <td>${tarefa.hortalica}</td>
          <td>${tarefa.horta}</td>
          <td style="text-align:center;">${tarefa.modulo}</td>
        </tr>`
    )
    .join('');

  const conteudoTabela = tarefas.length
    ? `
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Hortaliça</th>
            <th>Horta</th>
            <th>Módulo</th>
          </tr>
        </thead>
        <tbody>
          ${linhas}
        </tbody>
      </table>`
    : '<p>Nenhuma tarefa programada para esta semana.</p>';

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #1B4D3E; }
          h1 { color: #27AE60; font-size: 20px; margin-bottom: 6px; }
          h2 { font-size: 14px; font-weight: normal; margin-top: 0; color: #52796F; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th { background: #27AE60; color: #fff; padding: 8px; font-size: 12px; }
          td { border: 1px solid #DDD; padding: 8px; font-size: 12px; }
          tr:nth-child(even) { background: #F0F9F7; }
          .footer { margin-top: 20px; font-size: 11px; color: #52796F; }
        </style>
      </head>
      <body>
        <h1>Cronograma Semanal</h1>
        <h2>${formatDateBr(inicioSemana)} a ${formatDateBr(fimSemana)}</h2>
        ${conteudoTabela}
        <div class="footer">Gerado em ${formatDateBr(new Date())}</div>
      </body>
    </html>
  `;
};

export const gerarPDFSemanal = async () => {
  await ensureDbReady();
  const atividades = await fetchCalendarioConsolidado();
  const { inicio, fim } = getWeekRange();

  const tarefas = [];

  atividades.forEach(atividade => {
    const dataPlantio = new Date(atividade.data_plantio);
    const dataInicioColheita = new Date(atividade.data_inicio_colheita);
    const dataFimColheita = new Date(atividade.data_fim_colheita);

    if (dataPlantio >= inicio && dataPlantio <= fim) {
      tarefas.push({
        data: dataPlantio,
        tipo: 'Plantio',
        hortalica: atividade.hortalica_nome,
        horta: atividade.horta_nome,
        modulo: atividade.modulo,
      });
    }

    if (dataInicioColheita >= inicio && dataInicioColheita <= fim) {
      tarefas.push({
        data: dataInicioColheita,
        tipo: 'Início Colheita',
        hortalica: atividade.hortalica_nome,
        horta: atividade.horta_nome,
        modulo: atividade.modulo,
      });
    }

    if (dataFimColheita >= inicio && dataFimColheita <= fim) {
      tarefas.push({
        data: dataFimColheita,
        tipo: 'Fim Colheita',
        hortalica: atividade.hortalica_nome,
        horta: atividade.horta_nome,
        modulo: atividade.modulo,
      });
    }
  });

  tarefas.sort((a, b) => a.data.getTime() - b.data.getTime());

  const html = buildPdfHtml(tarefas, inicio, fim);
  const file = await Print.printToFileAsync({
    html,
  });

  return file.uri;
};

export const API_BASE_URL = 'offline';

export default {
  fetchHortas,
  createHorta,
  deleteHorta,
  fetchHortalicas,
  fetchCultivos,
  createCultivo,
  deleteCultivo,
  fetchCalendario,
  fetchCalendarioConsolidado,
  gerarPDFSemanal,
  calcularDimensionamento,
  fetchCultivosDetalhados,
};
