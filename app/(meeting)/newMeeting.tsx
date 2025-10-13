import { useRouter } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import type { Meeting } from '../../types/interfaces';

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

const initialMeeting: Omit<Meeting, 'id'> = {
    meeting_date: '',
    title: '',
    meeting_type: '',
    mtg_comp_key: '',
    announcements_contact: '',
    attendance_count: 0,
    av_contact: '',
    cafe_contact: '',
    cafe_count: 0,
    children_contact: '',
    children_count: 0,
    cleanup_contact: '',
    closing_contact: '',
    donations: 0,
    facilitator_contact: '',
    greeter_contact1: '',
    greeter_contact2: '',
    meal: '',
    meal_contact: '',
    meal_count: 0,
    newcomers_count: '',
    notes: '',
    nursery_contact: '',
    nursery_count: 0,
    resource_contact: 0,
    security_contact: '',
    setup_contact: '',
    support_contact: '',
    transportation_contact: '',
    transportation_count: 0,
    worship: '',
    youth_contact: '',
    youth_count: 0,
    organization_id: '',
};

const NewMeeting = () => {
    const router = useRouter();
    const [newId] = React.useState(() => generateUUID());
    const [meeting, setMeeting] = React.useState<Meeting>({
        id: newId,
        ...initialMeeting,
    });

    const handleChange = (field: keyof Meeting, value: string) => {
        setMeeting((prev) => ({
            ...prev,
            [field]: typeof prev[field] === 'number' ? Number(value) : value,
        }));
    };

    const handleSave = () => {
        console.log('saved new meeting:', meeting);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>New Meeting</Text>
            <View style={styles.formSection}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                    style={styles.input}
                    value={meeting.title}
                    onChangeText={(v) => handleChange('title', v)}
                    placeholder='Meeting Title'
                />
                <Text style={styles.label}>Date</Text>
                <TextInput
                    style={styles.input}
                    value={meeting.meeting_date}
                    onChangeText={(v) => handleChange('meeting_date', v)}
                    placeholder='YYYY-MM-DD'
                />
                <Text style={styles.label}>Type</Text>
                <TextInput
                    style={styles.input}
                    value={meeting.meeting_type}
                    onChangeText={(v) => handleChange('meeting_type', v)}
                    placeholder='Type'
                />
                <Text style={styles.label}>Attendance Count</Text>
                <TextInput
                    style={styles.input}
                    value={meeting.attendance_count.toString()}
                    onChangeText={(v) => handleChange('attendance_count', v)}
                    placeholder='0'
                    keyboardType='numeric'
                />
                <Text style={styles.label}>Notes</Text>
                <TextInput
                    style={[styles.input, { height: 60 }]}
                    value={meeting.notes}
                    onChangeText={(v) => handleChange('notes', v)}
                    placeholder='Notes'
                    multiline
                />
                {/* Add more fields as needed */}
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default NewMeeting;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 48,
        paddingHorizontal: 16,
    },
    title: {
        marginTop: 40,
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'center',
    },
    formSection: {
        marginTop: 32,
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        fontSize: 16,
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    saveButton: {
        marginBottom: 32,
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        alignSelf: 'center',
    },
    saveText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
