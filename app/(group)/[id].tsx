// ...existing code...
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Group = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Group Details</Text>
            <Text style={styles.uuid}>UUID: {id}</Text>
        </View>
    );
};

export default Group;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    uuid: {
        fontSize: 18,
        color: '#333',
    },
});
