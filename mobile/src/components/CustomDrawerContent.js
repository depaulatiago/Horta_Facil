import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome5';

const CustomDrawerContent = (props) => {
    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props}>
                <View style={styles.profileContainer}>
                    <Icon name="user-circle" size={50} color="#1D3557" />
                    <Text style={styles.profileText}>Olá, Usuário!</Text>
                </View>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    profileContainer: { padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
    profileText: { marginLeft: 15, fontSize: 18, fontWeight: 'bold', color: '#1D3557' },
});

export default CustomDrawerContent;