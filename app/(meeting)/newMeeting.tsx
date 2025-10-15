import themedStyles from '@assets/Styles';
// import TitleSection from '@components/meeting/TitleSection';
import TypeSelectors from '@components/meeting/TypeSelectors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Calendar } from 'react-native-calendars';
import { Meeting } from '../../types/interfaces';

import {
    KeyboardAvoidingView,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
// ...existing code...
import theme from '@assets/Colors';
import MeetingDate from '@components/meeting/MeetingDate';
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
    meeting_date: '2025-10-14',
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
    const [historic, setHistoric] = React.useState(false);
    const user = useSelector((state: any) => state.user);
    const [newId] = React.useState(() => generateUUID());
    // Remove modal date state, use meeting.meeting_date for calendar
    const [meeting, setMeeting] = React.useState<Meeting>({
        id: newId,
        ...initialMeeting,
    });
    const [isSavable, setIsSavable] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const handleChange = (field: keyof Meeting, value: string) => {
        setMeeting((prev) => ({
            ...prev,
            [field]: typeof prev[field] === 'number' ? Number(value) : value,
        }));
    };
    function inputChangedHandler(
        inputIdentifier: string,
        enteredValue: string
    ) {
        setMeeting((curInputValues) => {
            // console.log('inputIdentifier:', inputIdentifier);
            if (inputIdentifier === 'donations') {
                // console.log('MFRTK:203-->donations:', enteredValue);
            }

            return {
                ...curInputValues,
                [inputIdentifier]: enteredValue,
            };
        });
    }

    const handleTypeChange = (value: string) => {
        if (!user.profile.permissions.includes('manage')) {
            return;
        }
        // Only update if the value is different to avoid unnecessary renders
        if (meeting.meeting_type === value) return;
        setMeeting((prev) => ({ ...prev, meeting_type: value }));
        // Example: Only savable if title and meeting_type are set (customize as needed)
        setIsSavable(!!meeting.title && !!value);
    };
    const handleSave = () => {
        console.log('saved new meeting:', meeting);
    };

    return (
        <SafeAreaView style={themedStyles.container}>
            <KeyboardAvoidingView style={themedStyles.keyboardAvoiding}>
                <View style={themedStyles.containerContents}>
                    <View style={themedStyles.firstRow}>
                        <View style={themedStyles.meetingSelectorContainer}>
                            <View style={themedStyles.meetingSelectorWrapper}>
                                <TypeSelectors
                                    pick={meeting?.meeting_type}
                                    setPick={handleTypeChange}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{ marginVertical: 10 }}>
                        <TouchableOpacity
                            style={[
                                themedStyles.firstRow,
                                {
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingVertical: 8,
                                },
                            ]}
                            onPress={() => setShowCalendar((v) => !v)}
                            activeOpacity={0.7}
                        >
                            <MeetingDate date={meeting.meeting_date} />
                        </TouchableOpacity>

                        {showCalendar && (
                            <Calendar
                                current={meeting.meeting_date}
                                onDayPress={(day) => {
                                    handleChange(
                                        'meeting_date',
                                        day.dateString
                                    );
                                    setShowCalendar(false);
                                }}
                                markedDates={{
                                    [meeting.meeting_date]: {
                                        selected: true,
                                        selectedColor: theme.colors.blue,
                                    },
                                }}
                                theme={themedStyles.calendarTheme}
                            />
                        )}
                    </View>
                    <Text style={themedStyles.formLabels}>Title</Text>
                    <TextInput
                        style={localStyles.input}
                        value={meeting.title}
                        onChangeText={(v) => handleChange('title', v)}
                        placeholder='Meeting Title'
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
                </View>
            </KeyboardAvoidingView>
            {/* DateTimePickerModal removed, using Calendar above */}
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
