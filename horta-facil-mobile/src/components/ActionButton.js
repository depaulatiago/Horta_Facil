// /src/components/ActionButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const COLORS = {
    primary: '#76C893',
    textLight: '#FFFFFF',
    textDark: '#1D3557'
};

const ActionButton = ({ iconName, title, onPress }) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Icon name={iconName} size={60} color={COLORS.primary} />
            <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 20,
        color: COLORS.textDark,
        fontWeight: 'bold',
        marginTop: 10,
    }
});

export default ActionButton;