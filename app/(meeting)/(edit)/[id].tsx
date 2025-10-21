import theme from '@assets/Colors';
import themedStyles from '@assets/Styles';
import MeetingDate from '@components/meeting/MeetingDate';
import TypeSelectors from '@components/meeting/TypeSelectors';
import NumberInputEditable from '@components/ui/NumberInputEditable';
import { useNavigation } from '@react-navigation/native';
import { unwrapResult } from '@reduxjs/toolkit';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { updateMeeting } from '../../../features/meetings/meetingsThunks';
import { FullMeeting } from '../../../types/interfaces';
import type { AppDispatch } from '../../../utils/store';

// Infer payload type for updateMeeting thunk to keep typings tight
type UpdateMeetingPayload = Parameters<typeof updateMeeting>[0];

// Helper to coerce date to YYYY-MM-DD if needed
function normalizeDateToISO(dateStr?: string) {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr;
    return parsed.toISOString().slice(0, 10);
}

const NewLayoutEdit = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const user = useSelector((state: any) => state.user);
    const api_token = user?.apiToken || user?.token || user?.profile?.apiToken;

    const meetingParam = params.meeting as string | undefined;
    // meetingId fallback from params
    const meetingId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [showCalendar, setShowCalendar] = React.useState(false);
    const [isSavable, setIsSavable] = React.useState(false);

    // local meeting state
    const [meeting, setMeeting] = useState<FullMeeting | null>(null);

    // Load meeting from params JSON or bail
    useEffect(() => {
        // Set the parent navigation header title while this screen is mounted
        try {
            const parent =
                (navigation as any).getParent &&
                (navigation as any).getParent();
            if (parent && typeof parent.setOptions === 'function') {
                parent.setOptions({
                    title: 'Edit Meeting',
                    headerBackTitle: 'Cancel',
                });
            }
        } catch {
            // ignore
        }
        let parsed: FullMeeting | null = null;
        if (meetingParam) {
            try {
                parsed = JSON.parse(meetingParam) as FullMeeting;
            } catch (e) {
                console.warn('Failed to parse meeting param for edit:', e);
            }
        }
        // If no parsed meeting but we have meetingId and redux could provide one in future,
        // leave as null and show loading message. For now prefer param.
        if (parsed) {
            // Normalize date
            parsed.meeting_date = normalizeDateToISO(
                parsed.meeting_date as string
            );
            setMeeting(parsed);
            setIsSavable(
                !!parsed.title && !!parsed.meeting_type && !!parsed.meeting_date
            );
        }
    }, [meetingParam, meetingId, navigation]);

    // restore parent title on unmount
    useEffect(() => {
        return () => {
            try {
                const parent =
                    (navigation as any).getParent &&
                    (navigation as any).getParent();
                if (parent && typeof parent.setOptions === 'function') {
                    parent.setOptions({
                        title: undefined,
                        headerBackTitle: undefined,
                    });
                }
            } catch {
                // ignore
            }
        };
    }, [navigation]);

    const handleChange = (field: keyof FullMeeting, value: any) => {
        setMeeting((prev) => {
            if (!prev) return prev;
            const updated: any = { ...prev, [field]: value };
            setIsSavable(
                !!updated.title &&
                    !!updated.meeting_type &&
                    !!updated.meeting_date
            );
            return updated as FullMeeting;
        });
    };

    const handleTypeChange = (value: string) => {
        if (!user?.profile?.permissions?.includes('manage')) return;
        if (!meeting) return;
        if (meeting.meeting_type === value) return;
        handleChange('meeting_type', value);
    };

    const handleSave = () => {
        if (!meeting) return;
        setSaving(true);
        setError(null);

        // Clean values similar to newMeeting: empty strings -> null, 0 -> null
        const cleaned: any = Object.fromEntries(
            Object.entries(meeting).map(([k, v]) => {
                if (typeof v === 'string')
                    return [k, v.trim() === '' ? null : v];
                if (typeof v === 'number') return [k, v === 0 ? null : v];
                return [k, v];
            })
        );

        // Ensure id present
        if (!cleaned.id && meetingId) cleaned.id = meetingId;

        const payload: UpdateMeetingPayload = {
            api_token: api_token,
            meeting: cleaned,
        } as unknown as UpdateMeetingPayload;
        dispatch(updateMeeting(payload))
            .then(unwrapResult)
            .then(() => {
                setSaving(false);
                // After successful save, navigate back to the meeting details
                // so that screen's useFocusEffect will re-fetch the latest data.
                // Use replace to avoid stacking navigation history from edit.
                // Prefer popping back to the previous screen so the details
                // screen regains focus and triggers its useFocusEffect refresh.
                try {
                    // router.back() will pop the current route when possible.
                    // If it's not available or doesn't change the screen, fall
                    // back to replacing to the details route.
                    (router as any).back?.();
                    // Note: some router implementations may not throw but also
                    // may not navigate; schedule a microtask to verify if we
                    // remained on this screen and then fallback.
                    setTimeout(() => {
                        // If still on edit (meeting state exists), try replace
                        // to the details route as a fallback.
                        // We check window.history length as a heuristic is not
                        // reliable in RN; instead assume back worked in normal
                        // flows. If you consistently see the edit screen after
                        // save, uncomment the fallback below to force navigation.
                        /*
                        try {
                            if (meeting && meeting.id) {
                                router.replace({
                                    pathname: '/(meeting)/[id]',
                                    params: { id: String(meeting.id) },
                                });
                            } else if (meetingId) {
                                router.replace({
                                    pathname: '/(meeting)/[id]',
                                    params: { id: String(meetingId) },
                                });
                            } else {
                                router.replace('/(drawer)');
                            }
                        } catch {
                            router.replace('/(drawer)');
                        }
                        */
                    }, 50);
                } catch {
                    // Best-effort fallback
                    try {
                        if (meeting && meeting.id) {
                            router.replace({
                                pathname: '/(meeting)/[id]',
                                params: { id: String(meeting.id) },
                            });
                        } else if (meetingId) {
                            router.replace({
                                pathname: '/(meeting)/[id]',
                                params: { id: String(meetingId) },
                            });
                        } else {
                            router.replace('/(drawer)');
                        }
                    } catch {
                        router.replace('/(drawer)');
                    }
                }
            })
            .catch((err: any) => {
                setSaving(false);
                setError(err?.message || 'Failed to update meeting.');
            });
    };

    if (!meeting) {
        return (
            <View style={themedStyles.container}>
                <Text>Loading meeting...</Text>
            </View>
        );
    }
    return (
        <SafeAreaView style={themedStyles.surface}>
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
                                    pick={meeting.meeting_type}
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
                            <MeetingDate
                                date={meeting.meeting_date as string}
                            />
                        </TouchableOpacity>

                        {showCalendar && (
                            <Calendar
                                current={meeting.meeting_date as string}
                                onDayPress={(day) => {
                                    handleChange(
                                        'meeting_date',
                                        day.dateString
                                    );
                                    setShowCalendar(false);
                                }}
                                markedDates={{
                                    [meeting.meeting_date as string]: {
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
                        value={meeting.title as string}
                        onChangeText={(v) => handleChange('title', v)}
                        placeholder='Meeting Title'
                    />

                    <Text style={themedStyles.formLabel}>Contact</Text>
                    <TextInput
                        style={themedStyles.formInput}
                        value={meeting.support_contact as string}
                        onChangeText={(v) => handleChange('support_contact', v)}
                        placeholder='Meeting Cont'
                    />

                    <Text style={themedStyles.formLabel}>Music/Worship</Text>
                    <TextInput
                        style={themedStyles.formInput}
                        value={meeting.worship as string}
                        onChangeText={(v) => handleChange('worship', v)}
                        placeholder='Music/Worship'
                    />

                    <View style={themedStyles.mealContainer}>
                        <Text style={themedStyles.formLabel}>Menu</Text>
                        <TextInput
                            style={themedStyles.formInput}
                            value={meeting.meal as string}
                            onChangeText={(v) => handleChange('meal', v)}
                            placeholder='Menu'
                        />
                        <Text style={themedStyles.formLabel}>Contact</Text>
                        <TextInput
                            style={themedStyles.formInput}
                            value={meeting.meal_contact as string}
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
                                value={Number(meeting.meal_count) || 0}
                                onAction={(v: number) =>
                                    handleChange('meal_count', v)
                                }
                                min={0}
                                max={999}
                                fontSize={14}
                                paddingHorizontal={5}
                                controlSize={25}
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
                            value={Number(meeting.attendance_count) || 0}
                            onAction={(v: number) =>
                                handleChange('attendance_count', v)
                            }
                            min={0}
                            max={999}
                            fontSize={14}
                            paddingHorizontal={5}
                            controlSize={25}
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
                            value={Number(meeting.newcomers_count) || 0}
                            onAction={(v: number) =>
                                handleChange('newcomers_count', v)
                            }
                            min={0}
                            max={999}
                            fontSize={14}
                            paddingHorizontal={5}
                            controlSize={25}
                            numberStyle={{}}
                            graphicStyle={{}}
                        />
                    </View>

                    <View style={themedStyles.meetingNotesContainer}>
                        <TextInput
                            style={[themedStyles.input, { height: 60 }]}
                            value={meeting.notes as string}
                            onChangeText={(v) => handleChange('notes', v)}
                            placeholder='Notes'
                            multiline
                        />
                    </View>

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
        </SafeAreaView>
    );
};

export default NewLayoutEdit;
