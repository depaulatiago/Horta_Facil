// /src/screens/MinhasHortasScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, Platform, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Componentes que vamos usar
import ActionButton from '../components/ActionButton';
import PlantCard from '../components/PlantCard'; // O card atualizado
import AddHortaModal from '../components/AddHortaModal'; // O novo modal

const COLORS = {
    background: '#F4FBF0',
    text: '#1D3557',
};

const MinhasHortasScreen = ({ navigation }) => {
    // Estado para a lista de hortas
    const [hortas, setHortas] = useState([]);
    // Estado para controlar a visibilidade do modal
    const [isModalVisible, setModalVisible] = useState(false);

    // Função que será chamada pelo modal para salvar a nova horta
    const handleAddHorta = (novaHortaData) => {
        const novaHorta = {
            id: String(hortas.length + 1), // ID simples (melhorar no futuro)
            nome: novaHortaData.nome,
            qtdPlantas: 0, // Começa com 0 plantas
            status: 'Saudável',
            fotoUrl: null, // Sem foto por enquanto
        };
        setHortas([...hortas, novaHorta]); // Adiciona a nova horta à lista
        setModalVisible(false); // Fecha o modal
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* O cabeçalho com o menu continua o mesmo */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Icon name="menu" size={30} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Minhas Hortas</Text>
            </View>
            
            <View style={styles.container}>
                {hortas.length === 0 ? (
                    // Se não há hortas, mostra o botão para abrir o modal
                    <ActionButton 
                        iconName="add-circle-outline"
                        title="Adicionar nova horta"
                        onPress={() => setModalVisible(true)} // Ação: abrir o modal
                    />
                ) : (
                    // Se há hortas, mostra a lista usando FlatList e nosso PlantCard atualizado
                    <FlatList
                      data={hortas}
                      keyExtractor={(item) => item.id}
                      renderItem={({item}) => <PlantCard planta={item} />}
                      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
                    />
                )}
            </View>

            {/* O Modal fica aqui, invisível até que 'isModalVisible' seja true */}
            <AddHortaModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleAddHorta}
            />
        </SafeAreaView>
    );
};

// Os estilos continuam os mesmos da última versão
const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 5 : 10,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        marginLeft: 20,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 30, 
    },
});

export default MinhasHortasScreen;