import themedStyles from '@assets/Styles';
import TypeSelectors from '@components/meeting/TypeSelectors';
import { Meeting } from '@types/interfaces';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

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
    const user = useSelector((state: any) => state.user);
    const [newId] = React.useState(() => generateUUID());
    const [meeting, setMeeting] = React.useState<Meeting>({
        id: newId,
        ...initialMeeting,
    });
    const [isSavable, setIsSavable] = useState(false);
    const handleChange = (field: keyof Meeting, value: string) => {
        setMeeting((prev) => ({
            ...prev,
            [field]: typeof prev[field] === 'number' ? Number(value) : value,
        }));
    };
    const handleTypeChange = (value: string) => {
        if (!user.profile.permissions.includes('manage')) {
            return;
        }
        let titleVal = false;
        let contactVal = false;
        switch (meeting.meeting_type) {
            case 'Testimony':
                setIsSavable(titleVal);
                break;
            case 'Special':
                if (titleVal && contactVal) {
                    setIsSavable(true);
                }
                break;
            case 'Lesson':
                if (titleVal && contactVal) {
                    setIsSavable(true);
                }
                break;
            default:
                break;
        }
        const newValues = {
            ...meeting,
            meeting_type: value,
        };
        setMeeting(newValues);
    };
    const handleSave = () => {
        console.log('saved new meeting:', meeting);
    };

    return (
        <SafeAreaView style={themedStyles.container}>
            <KeyboardAvoidingView style={themedStyles.keyboardAvoiding}>
                <ScrollView style={themedStyles.containerContents}>
                    <View style={themedStyles.meetingSelectorWrapper}>
                        <TypeSelectors
                            pick={meeting?.meeting_type}
                            setPick={handleTypeChange}
                        />
                    </View>
                    <Text style={themedStyles.formLabels}>Title</Text>
                    <TextInput
                        style={localStyles.input}
                        value={meeting.title}
                        onChangeText={(v) => handleChange('title', v)}
                        placeholder='Meeting Title'
                    />
                    <Text style={localStyles.label}>Date</Text>
                    <TextInput
                        style={localStyles.input}
                        value={meeting.meeting_date}
                        onChangeText={(v) => handleChange('meeting_date', v)}
                        placeholder='YYYY-MM-DD'
                    />
                    <Text style={localStyles.label}>Type</Text>
                    <TextInput
                        style={localStyles.input}
                        value={meeting.meeting_type}
                        onChangeText={(v) => handleChange('meeting_type', v)}
                        placeholder='Type'
                    />
                    <Text style={localStyles.label}>Attendance Count</Text>
                    <TextInput
                        style={localStyles.input}
                        value={meeting.attendance_count.toString()}
                        onChangeText={(v) =>
                            handleChange('attendance_count', v)
                        }
                        placeholder='0'
                        keyboardType='numeric'
                    />
                    <Text style={localStyles.label}>Notes</Text>
                    <TextInput
                        style={[localStyles.input, { height: 60 }]}
                        value={meeting.notes}
                        onChangeText={(v) => handleChange('notes', v)}
                        placeholder='Notes'
                        multiline
                    />
                    {/* Add more fields as needed */}
                    {isSavable && (
                        <TouchableOpacity
                            style={localStyles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={localStyles.saveText}>Save</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default NewMeeting;

const localStyles = StyleSheet.create({
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
