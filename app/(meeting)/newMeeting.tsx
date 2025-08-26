import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function generateUUID() {
    // Simple UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
            const r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }
    );
}

const NewMeeting = () => {
    const router = useRouter();
    const { from } = useLocalSearchParams<{ from?: string }>();
    const [newId] = React.useState(() => generateUUID());

    const handleSave = () => {
        console.log('saved new meeting:', newId);
        router.replace({
            pathname: '/(meeting)/[id]',
            params: { id: newId, from },
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>New Meeting</Text>
            <View style={styles.spacer} />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

export default NewMeeting;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 48,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    // ...existing code...
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
