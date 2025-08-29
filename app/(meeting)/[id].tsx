import { Group } from '@/types/interfaces';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const MeetingDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [groups, setGroups] = React.useState<Group[]>([]);

    React.useEffect(() => {
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
        const one: Group = {
            id: generateUUID(),
            grp_comp_key: '2025#08#25#ABC',
            title: 'A test',
            location: 'Left 1',
            gender: 'M',
            attendance: 5,
            facilitator: 'Joe',
            cofacilitator: 'Tom',
            notes: 'A note',
            meeting_id: id,
        };
        const two: Group = {
            id: generateUUID(),
            grp_comp_key: '2025#08#25#DEF',
            title: 'B test',
            location: 'Right 1',
            gender: 'F',
            attendance: 3,
            facilitator: 'Alice',
            cofacilitator: 'Mary',
            notes: 'Another note',
            meeting_id: id,
        };
        setGroups([one, two]);
    }, [id]);
    // Removed unused generateUUID
    return (
        <View style={styles.container}>
            <Text>Meeting Details for {id}</Text>
            <View style={styles.linkRow}>
                <Text>Groups:</Text>
            </View>
            <FlatList
                data={groups}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.link}
                        onPress={() => {
                            router.push(
                                `/(group)/${item.id}?title=${encodeURIComponent(
                                    item.title
                                )}&fromMeetingId=${encodeURIComponent(id)}`
                            );
                        }}
                    >
                        <Text style={styles.linkText}>{item.title}</Text>
                        <Text style={styles.linkText}>ID: {item.id}</Text>
                    </TouchableOpacity>
                )}
            />
            <TouchableOpacity
                style={{
                    backgroundColor: 'green',
                    padding: 16,
                    borderRadius: 8,
                    alignItems: 'center',
                    margin: 16,
                }}
                onPress={() =>
                    router.push(
                        `/(group)/newGroup?meetingId=${encodeURIComponent(id)}`
                    )
                }
            >
                <Text
                    style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 16,
                    }}
                >
                    Add New Group
                </Text>
            </TouchableOpacity>
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
