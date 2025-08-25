import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const HistoricMeetings = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Historic Meetings</Text>

            <TouchableOpacity
                style={styles.link}
                onPress={() =>
                    router.push({
                        pathname: '/(meeting)/[id]',
                        params: { id: '80', from: 'historic' },
                    })
                }
            >
                <Text style={styles.linkText}>Meeting 80</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.link}
                onPress={() =>
                    router.push({
                        pathname: '/(meeting)/[id]',
                        params: { id: '81', from: 'historic' },
                    })
                }
            >
                <Text style={styles.linkText}>Meeting 81</Text>
            </TouchableOpacity>
        </View>
    );
};

export default HistoricMeetings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    link: {
        marginTop: 24,
        padding: 12,
        backgroundColor: '#F2A310',
        borderRadius: 8,
    },
    linkText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
