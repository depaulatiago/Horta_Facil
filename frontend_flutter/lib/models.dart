import 'package:http/http.dart' as http; // <-- ADICIONE ESTA LINHA
import 'dart:convert';                 // <-- ADICIONE ESTA LINHA

// --- MODELO HORTA ---
class Horta {
  final int id;
  final String nome;
  final String? localizacao;
  final double? areaTotal;

  Horta({
    required this.id,
    required this.nome,
    this.localizacao,
    this.areaTotal,
  });

  factory Horta.fromJson(Map<String, dynamic> json) {
    return Horta(
      id: json['id'],
      nome: json['nome'],
      localizacao: json['localizacao'],
      areaTotal: (json['area_total'] as num?)?.toDouble(), 
    );
  }
}

// --- MODELO HORTALIÇA (Modelo de Cultivo) ---
class Hortalica {
  final int id;
  final String nome;
  final String tipoPlantio;
  final int cicloDesenvolvimento;
  final int cicloColheita;
  final int cicloLimpeza;
  final double produtividadeEsperada;
  final double areaModulo;

  Hortalica({
    required this.id,
    required this.nome,
    required this.tipoPlantio,
    required this.cicloDesenvolvimento,
    required this.cicloColheita,
    required this.cicloLimpeza,
    required this.produtividadeEsperada,
    required this.areaModulo,
  });

  int get cicloTotal => cicloDesenvolvimento + cicloColheita + cicloLimpeza;

  factory Hortalica.fromJson(Map<String, dynamic> json) {
    return Hortalica(
      id: json['id'],
      nome: json['nome'],
      tipoPlantio: json['tipo_plantio'],
      cicloDesenvolvimento: json['ciclo_desenvolvimento'],
      cicloColheita: json['ciclo_colheita'],
      cicloLimpeza: json['ciclo_limpeza'],
      produtividadeEsperada: (json['produtividade_esperada'] as num).toDouble(),
      areaModulo: (json['area_modulo'] as num).toDouble(),
    );
  }
}

// --- MODELO CULTIVO ---
class Cultivo {
  final int id;
  final int hortaId;
  final int hortalicaId;
  final String dataInicio;
  final double producaoSemanalDesejada;
  final int numModulos;

  Cultivo({
    required this.id,
    required this.hortaId,
    required this.hortalicaId,
    required this.dataInicio,
    required this.producaoSemanalDesejada,
    required this.numModulos,
  });

  factory Cultivo.fromJson(Map<String, dynamic> json) {
    return Cultivo(
      id: json['id'],
      hortaId: json['horta'],
      hortalicaId: json['hortaliça'],
      dataInicio: json['data_inicio'],
      producaoSemanalDesejada: (json['producao_semanal_desejada'] as num).toDouble(),
      numModulos: json['num_modulos'],
    );
  }
}

// Classe de "ViewModel" para combinar os dados
class CultivoDetalhado {
  final Cultivo cultivo;
  final Hortalica hortalica;
  CultivoDetalhado({required this.cultivo, required this.hortalica});
}

// --- MODELO ATIVIDADE (Calendário) ---
class AtividadeCalendario {
  final int modulo;
  final String dataPlantio;
  final String dataInicioColheita;
  final String dataFimColheita;

  AtividadeCalendario({
    required this.modulo,
    required this.dataPlantio,
    required this.dataInicioColheita,
    required this.dataFimColheita,
  });

  factory AtividadeCalendario.fromJson(Map<String, dynamic> json) {
    return AtividadeCalendario(
      modulo: json['modulo'],
      dataPlantio: json['data_plantio'],
      dataInicioColheita: json['data_inicio_colheita'],
      dataFimColheita: json['data_fim_colheita'],
    );
  }
}

// --- FUNÇÕES GLOBAIS DE API ---
// (Movendo as funções de 'fetch' para cá)

// Busca Hortas
Future<List<Horta>> fetchHortas() async {
  final url = Uri.parse('http://127.0.0.1:8000/api/hortas/');
  try {
    final response = await http.get(url);
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(utf8.decode(response.bodyBytes));
      return data.map((json) => Horta.fromJson(json)).toList();
    } else {
      throw Exception('Falha ao carregar hortas (Status: ${response.statusCode})');
    }
  } catch (e) {
    throw Exception('Erro de rede: $e');
  }
}

// Busca Hortalicas (Modelos de Cultivo)
Future<List<Hortalica>> fetchHortalicas() async {
  final url = Uri.parse('http://127.0.0.1:8000/api/hortalicas/');
  try {
    final response = await http.get(url);
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(utf8.decode(response.bodyBytes));
      return data.map((json) => Hortalica.fromJson(json)).toList();
    } else {
      throw Exception('Falha ao carregar hortaliças');
    }
  } catch (e) {
    throw Exception('Erro de rede: $e');
  }
}

// Busca Cultivos
Future<List<Cultivo>> fetchCultivos(int hortaId) async {
  final url = Uri.parse('http://127.0.0.1:8000/api/cultivos/');
  try {
    final response = await http.get(url);
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(utf8.decode(response.bodyBytes));
      return data
          .map((json) => Cultivo.fromJson(json))
          .where((cultivo) => cultivo.hortaId == hortaId)
          .toList();
    } else {
      throw Exception('Falha ao carregar cultivos');
    }
  } catch (e) {
    throw Exception('Erro de rede: $e');
  }
}

// Busca Calendário
Future<List<AtividadeCalendario>> fetchCalendario(int cultivoId) async {
  final url = Uri.parse('http://127.0.0.1:8000/api/cultivos/$cultivoId/calendario/');
  try {
    final response = await http.get(url);
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(utf8.decode(response.bodyBytes));
      return data.map((json) => AtividadeCalendario.fromJson(json)).toList();
    } else {
      throw Exception('Falha ao gerar calendário');
    }
  } catch (e) {
    throw Exception('Erro de rede: $e');
  }
}