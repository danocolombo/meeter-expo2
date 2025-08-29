import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NewGroup = () => {
    const router = useRouter();

    const { meetingId, from } = useLocalSearchParams<{
        meetingId?: string;
        from?: string;
    }>();

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

    const handleCancel = () => {
        if (meetingId) {
            router.replace({
                pathname: '/(meeting)/[id]',
                params: { id: meetingId, from },
            });
        } else {
            router.replace('/(meeting)/[id]');
            // Display meetingId for context
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Create New Group</Text>
                    {meetingId && (
                        <Text style={styles.meetingIdText}>
                            Meeting ID: {meetingId}
                        </Text>
                    )}
                    {/* ...existing group creation UI... */}
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancel}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    const handleSave = () => {
        const uuid = generateUUID();
        if (meetingId) {
            console.log(
                `New Group UUID: ${uuid} added to Meeting ID: ${meetingId}`
            );
            router.replace({
                pathname: '/(meeting)/[id]',
                params: { id: meetingId, from },
            });
        } else {
            console.log(`New Group UUID: ${uuid} added to unknown Meeting`);
            router.replace('/(meeting)/[id]');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create New Group</Text>
            {meetingId && (
                <Text style={styles.meetingIdText}>
                    Meeting ID: {meetingId}
                </Text>
            )}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
            >
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
};

export default NewGroup;

const styles = StyleSheet.create({
    meetingIdText: {
        marginTop: 16,
        fontSize: 16,
        color: 'gray',
    },
    cancelButton: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: '#ccc',
        borderRadius: 8,
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
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
    saveButton: {
        marginTop: 48,
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
