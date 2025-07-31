// /src/components/PlantCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Ícone para plantas

const COLORS = {
    primary: '#76C893',
    text: '#1D3557',
    cardBackground: '#FFFFFF',
    statusWarning: '#E76F51',
    placeholder: '#E0E0E0',
};

// O componente agora espera mais dados na prop "planta"
const PlantCard = ({ planta }) => {
    return (
        <TouchableOpacity style={styles.card}>
            {/* Seção da Foto */}
            <View style={styles.imageContainer}>
                {planta.fotoUrl ? (
                    <Image source={{ uri: planta.fotoUrl }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Icon name="sprout" size={40} color={COLORS.primary} />
                    </View>
                )}
            </View>

            {/* Seção das Informações */}
            <View style={styles.infoContainer}>
                <Text style={styles.cardTitle}>{planta.nome}</Text>
                <Text style={styles.plantCount}>{planta.qtdPlantas} plantas</Text>
                <Text style={[styles.status, { color: planta.status === 'Saudável' ? COLORS.primary : COLORS.statusWarning }]}>
                    {planta.status}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 20, // Bordas mais arredondadas
        marginBottom: 20,
        flexDirection: 'row',
        overflow: 'hidden', // Garante que a imagem não vaze das bordas
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    imageContainer: {
        width: 100,
        height: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: 100,
        height: 120,
        backgroundColor: COLORS.placeholder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
        padding: 15,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    plantCount: {
        fontSize: 16,
        color: '#666',
        marginVertical: 4,
    },
    status: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default PlantCard;