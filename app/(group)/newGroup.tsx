import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NewGroup = () => {
    return (
        <View>
            <Text>NewGroup</Text>
            <View style={styles.spacer} />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

export default NewGroup;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 48,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    title: {
        marginTop: 80,
        fontSize: 24,
        fontWeight: 'bold',
    },
    spacer: {
        flex: 1,
    },
    saveButton: {
        marginBottom: 32,
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: '#007AFF',
        borderRadius: 8,
    },
    saveText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
