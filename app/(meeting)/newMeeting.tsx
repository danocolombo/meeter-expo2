import themedStyles from '@assets/Styles';
// import TitleSection from '@components/meeting/TitleSection';
import TypeSelectors from '@components/meeting/TypeSelectors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useDispatch, useSelector } from 'react-redux';
import { saveNewMeeting } from '../../features/meetings/meetingsThunks';
import { Meeting } from '../../types/interfaces';
// ...existing code...
import theme from '@assets/Colors';
import MeetingDate from '@components/meeting/MeetingDate';
import NumberInputEditable from '@components/ui/NumberInputEditable';
import { unwrapResult } from '@reduxjs/toolkit';
import type { AppDispatch } from '../../utils/store';
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

// Get today's date in local timezone as YYYY-MM-DD
function getTodayLocalISODate() {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISO = new Date(now.getTime() - tzOffset)
        .toISOString()
        .slice(0, 10);
    return localISO;
}

const initialMeeting: Omit<Meeting, 'id'> = {
    meeting_date: getTodayLocalISODate(),
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
    newcomers_count: 0,
    notes: '',
    nursery_contact: '',
    nursery_count: 0,
    resource_contact: '',
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
    const dispatch = useDispatch<AppDispatch>();
    const [historic, setHistoric] = React.useState(false);
    const user = useSelector((state: any) => state.user);
    const [newId] = React.useState(() => generateUUID());
    const org_id = user?.profile?.activeOrg?.id;
    const api_token = user?.apiToken || user?.token || user?.profile?.apiToken;

    // Remove modal date state, use meeting.meeting_date for calendar
    const [meeting, setMeeting] = React.useState<Meeting>({
        id: newId,
        ...initialMeeting,
    });
    const [isSavable, setIsSavable] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleChange = (field: keyof Meeting, value: string) => {
        setMeeting((prev) => {
            const updated = {
                ...prev,
                [field]:
                    typeof prev[field] === 'number' ? Number(value) : value,
            };
            setIsSavable(
                !!updated.title &&
                    !!updated.meeting_type &&
                    !!updated.meeting_date
            );
            return updated;
        });
    };

    function inputChangedHandler(
        inputIdentifier: string,
        enteredValue: string
    ) {
        setMeeting((curInputValues) => {
            const updated = {
                ...curInputValues,
                [inputIdentifier]: enteredValue,
            };
            setIsSavable(
                !!updated.title &&
                    !!updated.meeting_type &&
                    !!updated.meeting_date
            );
            return updated;
        });
    }

    const handleTypeChange = (value: string) => {
        if (!user.profile.permissions.includes('manage')) {
            return;
        }
        if (meeting.meeting_type === value) return;
        setMeeting((prev) => {
            const updated = { ...prev, meeting_type: value };
            setIsSavable(
                !!updated.title &&
                    !!updated.meeting_type &&
                    !!updated.meeting_date
            );
            return updated;
        });
    };
    const handleSave = () => {
        setSaving(true);
        setError(null);
        // Prepare meeting object with updated org_id and mtg_comp_key
        // Build mtg_comp_key: org code # yyyy # mm # dd
        const orgCode = user?.profile?.activeOrg?.code || '';
        const dateStr = meeting.meeting_date || '';
        let year = '',
            month = '',
            day = '';
        if (dateStr.length >= 10) {
            year = dateStr.slice(0, 4);
            month = dateStr.slice(5, 7);
            day = dateStr.slice(8, 10);
        }
        const mtg_comp_key = `${orgCode}#${year}#${month}#${day}`;
        const meetingToSave = {
            ...meeting,
            organization_id: org_id,
            mtg_comp_key,
        };
        // Clean up meeting object: set empty strings to null, zero numbers to null
        const cleanedMeeting = Object.fromEntries(
            Object.entries(meetingToSave).map(([key, value]) => {
                if (typeof value === 'string') {
                    return [key, value.trim() === '' ? null : value];
                }
                if (typeof value === 'number') {
                    return [key, value === 0 ? null : value];
                }
                return [key, value];
            })
        );
        // Save cleanedMeeting to backend or state
        dispatch(saveNewMeeting({ api_token, meeting: cleanedMeeting }))
            .then(unwrapResult)
            .then(() => {
                setSaving(false);
                setError(null);
                router.replace('/(drawer)');
            })
            .catch((err: any) => {
                setSaving(false);
                setError(err?.message || 'Failed to save meeting.');
            });
    };

    return (
        <SafeAreaView style={themedStyles.container}>
            <KeyboardAvoidingView style={themedStyles.keyboardAvoiding}>
                <View style={themedStyles.containerContents}>
                    {saving && (
                        <View
                            style={{ alignItems: 'center', marginVertical: 10 }}
                        >
                            <ActivityIndicator size='large' color='#007AFF' />
                        </View>
                    )}
                    {error && (
                        <Text
                            style={{
                                color: 'red',
                                textAlign: 'center',
                                marginBottom: 10,
                            }}
                        >
                            {error}
                        </Text>
                    )}
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
                    <View style={themedStyles.meetingDateRow}>
                        <TouchableOpacity
                            style={themedStyles.firstRow}
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
                    <Text style={themedStyles.formLabel}>Title</Text>
                    <TextInput
                        style={themedStyles.formInput}
                        value={meeting.title}
                        onChangeText={(v) => handleChange('title', v)}
                        placeholder='Meeting Title'
                    />
                    <Text style={themedStyles.formLabel}>Contact</Text>
                    <TextInput
                        style={themedStyles.formInput}
                        // Use support_contact so new meeting Contact matches
                        // the field used elsewhere (meeting edit uses support_contact)
                        value={meeting.support_contact}
                        onChangeText={(v) => handleChange('support_contact', v)}
                        placeholder='Meeting Cont'
                    />
                    <Text style={themedStyles.formLabel}>Music/Worship</Text>
                    <TextInput
                        style={themedStyles.formInput}
                        value={meeting.worship}
                        onChangeText={(v) => handleChange('worship', v)}
                        placeholder='Music/Worship'
                    />
                    <View style={themedStyles.mealContainer}>
                        <Text style={themedStyles.formLabel}>Menu</Text>
                        <TextInput
                            style={themedStyles.formInput}
                            value={meeting.meal}
                            onChangeText={(v) => handleChange('meal', v)}
                            placeholder='Menu'
                        />
                        <Text style={themedStyles.formLabel}>Contact</Text>
                        <TextInput
                            style={themedStyles.formInput}
                            value={meeting.meal_contact}
                            onChangeText={(v) =>
                                handleChange('meal_contact', v)
                            }
                            placeholder='Contact'
                        />
                        <View style={themedStyles.firstRow}>
                            <Text
                                style={[
                                    themedStyles.formLabel,
                                    { paddingRight: 15 },
                                ]}
                            >
                                Meal Count
                            </Text>
                            <NumberInputEditable
                                value={meeting.meal_count}
                                onAction={(v: number) =>
                                    handleChange('meal_count', String(v))
                                }
                                min={0}
                                max={999}
                                fontSize={14} // Make the number and buttons a bit smaller
                                paddingHorizontal={5} // Add more horizontal padding to the input
                                controlSize={25} // Make the +/- buttons larger
                                numberStyle={{}}
                                graphicStyle={{}}
                            />
                        </View>
                    </View>
                    <View
                        style={[
                            themedStyles.firstRow,
                            {
                                alignContent: 'space-evenly',
                                paddingVertical: 2,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                themedStyles.formLabel,
                                { paddingRight: 15 },
                            ]}
                        >
                            Attendance
                        </Text>
                        <NumberInputEditable
                            value={meeting.attendance_count}
                            onAction={(v: number) =>
                                handleChange('attendance_count', String(v))
                            }
                            min={0}
                            max={999}
                            fontSize={14} // Make the number and buttons a bit smaller
                            paddingHorizontal={5} // Add more horizontal padding to the input
                            controlSize={25} // Make the +/- buttons larger
                            numberStyle={{}}
                            graphicStyle={{}}
                        />
                    </View>
                    <View
                        style={[
                            themedStyles.firstRow,
                            {
                                alignContent: 'space-evenly',
                                paddingVertical: 2,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                themedStyles.formLabel,
                                { paddingRight: 15 },
                            ]}
                        >
                            Newcomers
                        </Text>
                        <NumberInputEditable
                            value={meeting.newcomers_count}
                            onAction={(v: number) =>
                                handleChange('newcomers_count', String(v))
                            }
                            min={0}
                            max={999}
                            fontSize={14} // Make the number and buttons a bit smaller
                            paddingHorizontal={5} // Add more horizontal padding to the input
                            controlSize={25} // Make the +/- buttons larger
                            numberStyle={{}}
                            graphicStyle={{}}
                        />
                    </View>
                    <View style={themedStyles.meetingNotesContainer}>
                        <TextInput
                            style={[themedStyles.input, { height: 60 }]}
                            value={meeting.notes}
                            onChangeText={(v) => handleChange('notes', v)}
                            placeholder='Notes'
                            multiline
                        />
                    </View>
                    {/* Add more fields as needed */}
                    {isSavable && (
                        <TouchableOpacity
                            style={themedStyles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={themedStyles.saveText}>Save</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
            {/* DateTimePickerModal removed, using Calendar above */}
        </SafeAreaView>
    );
};

export default NewMeeting;
