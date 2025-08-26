import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MeetingDetails = () => {
    const router = useRouter();
    const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function (c) {
                const r = (Math.random() * 16) | 0,
                    v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }
        );
    }
    return (
        <View style={styles.container}>
            <Text>Meeting Details for {id}</Text>
            <View style={styles.linkRow}>
                <TouchableOpacity
                    style={styles.link}
                    onPress={() => {
                        const groupId = generateUUID();
                        router.push({
                            pathname: '/(group)/[id]',
                            params: { id: groupId, fromMeetingId: id },
                        });
                    }}
                >
                    <Text style={styles.linkText}>Go to Group</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.link}
                    onPress={() => {
                        router.push({
                            pathname: '/(group)/newGroup',
                            params: { fromMeetingId: id, from },
                        });
                    }}
                >
                    <Text style={styles.linkText}>New Group</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default MeetingDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkRow: {
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
    link: {
        marginTop: 24,
        padding: 12,
        backgroundColor: '#F2A310',
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    linkText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
