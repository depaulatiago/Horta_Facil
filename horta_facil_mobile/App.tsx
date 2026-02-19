/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  createColheita,
  createCultivo,
  createRelatorio,
  initDatabase,
  listColheitas,
  listCultivos,
  listHortalicas,
  listHortas,
  listRelatorios,
} from './src/db/database';
import type { Colheita, Cultivo, Horta, Hortalica, Relatorio } from './src/db/models';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [hortas, setHortas] = useState<Horta[]>([]);
  const [hortalicas, setHortalicas] = useState<Hortalica[]>([]);
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [colheitas, setColheitas] = useState<Colheita[]>([]);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadAll = async () => {
    const [hortasData, hortalicasData, cultivosData, colheitasData, relatoriosData] =
      await Promise.all([
        listHortas(),
        listHortalicas(),
        listCultivos(),
        listColheitas(),
        listRelatorios(),
      ]);
    setHortas(hortasData);
    setHortalicas(hortalicasData);
    setCultivos(cultivosData);
    setColheitas(colheitasData);
    setRelatorios(relatoriosData);
  };

  useEffect(() => {
    let mounted = true;
    initDatabase()
      .then(() => loadAll())
      .catch(err => {
        if (mounted) {
          setError(err?.message ?? 'Erro ao carregar banco');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleAddCultivo = async () => {
    if (hortas.length === 0 || hortalicas.length === 0) {
      return;
    }
    await createCultivo({
      hortaId: hortas[0].id,
      hortalicaId: hortalicas[0].id,
      dataInicio: new Date().toISOString().slice(0, 10),
      producaoSemanalDesejada: 10,
      numModulos: 1,
      areaTotalHortalica: null,
    });
    await loadAll();
  };

  const handleAddColheita = async () => {
    const cultivoId = cultivos[0]?.id ?? null;
    await createColheita({
      cultivoId,
      data: new Date().toISOString().slice(0, 10),
      quantidadeColhida: 1,
    });
    await loadAll();
  };

  const handleAddRelatorio = async () => {
    if (hortas.length === 0) {
      return;
    }
    await createRelatorio({
      hortaId: hortas[0].id,
      data: new Date().toISOString().slice(0, 10),
      totalProduzidoPlanejado: 10,
      totalColhidoReal: 7,
      eficiencia: null,
    });
    await loadAll();
  };

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <Text style={styles.title}>Horta Fácil (SQLite)</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Hortas ({hortas.length})</Text>
          {hortas.map(horta => (
            <View key={horta.id} style={styles.card}>
              <Text style={styles.cardTitle}>{horta.nome}</Text>
              {horta.localizacao ? (
                <Text style={styles.cardText}>{horta.localizacao}</Text>
              ) : null}
            </View>
          ))}

          <Text style={styles.sectionTitle}>Hortaliças ({hortalicas.length})</Text>
          {hortalicas.slice(0, 5).map(hortalica => (
            <View key={hortalica.id} style={styles.card}>
              <Text style={styles.cardTitle}>{hortalica.nome}</Text>
              <Text style={styles.cardText}>Plantio: {hortalica.tipoPlantio}</Text>
            </View>
          ))}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={handleAddCultivo}>
              <Text style={styles.buttonText}>Adicionar Cultivo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleAddColheita}>
              <Text style={styles.buttonText}>Adicionar Colheita</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleAddRelatorio}>
              <Text style={styles.buttonText}>Adicionar Relatório</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Cultivos ({cultivos.length})</Text>
          {cultivos.map(cultivo => (
            <View key={cultivo.id} style={styles.card}>
              <Text style={styles.cardTitle}>Cultivo #{cultivo.id}</Text>
              <Text style={styles.cardText}>
                Horta: {cultivo.hortaId} • Hortaliça: {cultivo.hortalicaId}
              </Text>
              <Text style={styles.cardText}>Início: {cultivo.dataInicio}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Colheitas ({colheitas.length})</Text>
          {colheitas.map(colheita => (
            <View key={colheita.id} style={styles.card}>
              <Text style={styles.cardTitle}>Colheita #{colheita.id}</Text>
              <Text style={styles.cardText}>Data: {colheita.data}</Text>
              <Text style={styles.cardText}>Quantidade: {colheita.quantidadeColhida}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Relatórios ({relatorios.length})</Text>
          {relatorios.map(relatorio => (
            <View key={relatorio.id} style={styles.card}>
              <Text style={styles.cardTitle}>Relatório #{relatorio.id}</Text>
              <Text style={styles.cardText}>Data: {relatorio.data}</Text>
              <Text style={styles.cardText}>
                Planejado: {relatorio.totalProduzidoPlanejado} • Colhido: {relatorio.totalColhidoReal}
              </Text>
              <Text style={styles.cardText}>
                Eficiência: {relatorio.eficiencia?.toFixed(1) ?? 0}%
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2937',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#374151',
  },
  error: {
    color: '#B91C1C',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardText: {
    fontSize: 14,
    color: '#4B5563',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  actions: {
    marginTop: 12,
    marginBottom: 4,
    gap: 8,
  },
  button: {
    backgroundColor: '#22C55E',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default App;
