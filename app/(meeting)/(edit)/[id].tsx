import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { FullMeeting } from '../../../types/interfaces';
import { useAppDispatch, useAppSelector } from '../../../utils/hooks';

const REQUIRED_FIELDS: (keyof FullMeeting)[] = [
    'title',
    'meeting_date',
    'organization_id',
    'support_contact',
];

const EMAIL_FIELDS: (keyof FullMeeting)[] = ['support_contact'];

const MeetingEditScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const dispatch = useAppDispatch();
    // Ensure params.id is a string
    const meetingId = Array.isArray(params.id) ? params.id[0] : params.id;

    // getMeetingById sets state.meetings.specificMeeting
    const meetingFromRedux = useAppSelector((state: any) =>
        state.meetings.specificMeeting &&
        Object.keys(state.meetings.specificMeeting).length > 0
            ? state.meetings.specificMeeting
            : null
    );
    const [meeting, setMeeting] = React.useState<FullMeeting | null>(null);
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
    const [loading, setLoading] = React.useState(false);

    // Debug logging
    React.useEffect(() => {
        console.log('[EditMeeting] meetingId:', meetingId);
        console.log('[EditMeeting] meetingFromRedux:', meetingFromRedux);
        console.log('[EditMeeting] local meeting state:', meeting);
    }, [meetingId, meetingFromRedux, meeting]);

    // Try Redux first, then fetch from backend if not found
    useEffect(() => {
        let cancelled = false;
        async function fetchMeetingIfNeeded() {
            if (meetingFromRedux && meetingFromRedux.id) {
                setMeeting(meetingFromRedux);
                return;
            }
            if (!meetingId) return;
            setLoading(true);
            try {
                // Try to get org_id from params or fallback (update as needed)
                const org_id = params.org_id || '';
                if (!org_id) {
                    console.warn('[EditMeeting] No org_id provided in params.');
                    setLoading(false);
                    return;
                }
                const { getAMeeting } = await import('../../../utils/api');
                const fetchedMeeting = await getAMeeting(org_id, meetingId);
                if (!cancelled && fetchedMeeting && fetchedMeeting.id) {
                    setMeeting(fetchedMeeting);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error(
                        '[EditMeeting] Failed to fetch meeting:',
                        err
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchMeetingIfNeeded();
        return () => {
            cancelled = true;
        };
    }, [meetingId, meetingFromRedux, params.org_id]);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading meeting...</Text>
            </View>
        );
    }

    const validate = (): boolean => {
        if (!meeting) return false;
        const newErrors: { [key: string]: string } = {};
        // Required fields
        REQUIRED_FIELDS.forEach((field) => {
            if (!meeting[field] || String(meeting[field]).trim() === '') {
                newErrors[field] = 'Required';
            }
        });
        // Email fields
        EMAIL_FIELDS.forEach((field) => {
            const value = meeting[field];
            if (value && !/^\S+@\S+\.\S+$/.test(String(value))) {
                newErrors[field] = 'Invalid email address';
            }
        });
        // Date format (YYYY-MM-DD)
        if (
            meeting.meeting_date &&
            !/^\d{4}-\d{2}-\d{2}$/.test(meeting.meeting_date)
        ) {
            newErrors['meeting_date'] = 'Date must be YYYY-MM-DD';
        }
        // Example: attendance_count must be a number >= 0
        if (
            meeting.attendance_count !== undefined &&
            meeting.attendance_count !== null
        ) {
            if (
                isNaN(Number(meeting.attendance_count)) ||
                Number(meeting.attendance_count) < 0
            ) {
                newErrors['attendance_count'] =
                    'Attendance must be a non-negative number';
            }
        }
        // Example: newcomers_count must be a number >= 0
        if (
            meeting.newcomers_count !== undefined &&
            meeting.newcomers_count !== null
        ) {
            if (
                isNaN(Number(meeting.newcomers_count)) ||
                Number(meeting.newcomers_count) < 0
            ) {
                newErrors['newcomers_count'] =
                    'Newcomers must be a non-negative number';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof FullMeeting, value: string) => {
        setMeeting((prev) => (prev ? { ...prev, [field]: value } : prev));
        setErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors[field]) {
                delete newErrors[field];
            }
            return newErrors;
        });
    };

    const handleSave = () => {
        if (!validate() || !meeting) {
            Alert.alert('Please fix validation errors.');
            return;
        }
        // TODO: Save logic
        Alert.alert('Meeting updated!');
        router.back();
    };

    if (!meeting) {
        return (
            <View style={styles.container}>
                <Text>Loading meeting...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Title:</Text>
            <TextInput
                style={styles.input}
                value={meeting.title}
                onChangeText={(text) => handleChange('title', text)}
                placeholder='Enter meeting title'
            />
            {errors.title ? (
                <Text style={styles.error}>{errors.title}</Text>
            ) : null}

            <Text style={styles.label}>Date:</Text>
            <TextInput
                style={styles.input}
                value={meeting.meeting_date}
                onChangeText={(text) => handleChange('meeting_date', text)}
                placeholder='YYYY-MM-DD'
            />
            {errors.meeting_date ? (
                <Text style={styles.error}>{errors.meeting_date}</Text>
            ) : null}

            <Text style={styles.label}>Support Contact:</Text>
            <TextInput
                style={styles.input}
                value={meeting.support_contact}
                onChangeText={(text) => handleChange('support_contact', text)}
                placeholder='Email address'
                autoCapitalize='none'
                keyboardType='email-address'
            />
            {errors.support_contact ? (
                <Text style={styles.error}>{errors.support_contact}</Text>
            ) : null}

            {/* Example: Attendance Count */}
            <Text style={styles.label}>Attendance Count:</Text>
            <TextInput
                style={styles.input}
                value={String(meeting.attendance_count ?? '')}
                onChangeText={(text) =>
                    handleChange(
                        'attendance_count',
                        text.replace(/[^0-9]/g, '')
                    )
                }
                placeholder='0'
                keyboardType='numeric'
            />
            {errors.attendance_count ? (
                <Text style={styles.error}>{errors.attendance_count}</Text>
            ) : null}

            {/* Example: Newcomers Count */}
            <Text style={styles.label}>Newcomers Count:</Text>
            <TextInput
                style={styles.input}
                value={String(meeting.newcomers_count ?? '')}
                onChangeText={(text) =>
                    handleChange('newcomers_count', text.replace(/[^0-9]/g, ''))
                }
                placeholder='0'
                keyboardType='numeric'
            />
            {errors.newcomers_count ? (
                <Text style={styles.error}>{errors.newcomers_count}</Text>
            ) : null}

            {/* Add more fields and validations as needed */}
            <Button title='Save' onPress={handleSave} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    label: {
        fontWeight: 'bold',
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        marginBottom: 8,
    },
    error: {
        color: 'red',
        marginBottom: 8,
    },
});

export default MeetingEditScreen;
