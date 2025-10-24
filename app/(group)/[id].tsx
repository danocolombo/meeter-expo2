import theme from '@assets/Colors';
import themedStyles from '@assets/Styles';
import GenderSelectors from '@components/ui/GenderSelectors';
import NumberInputEditable from '@components/ui/NumberInputEditable';
import { updateGroup } from '@features/meetings/meetingsThunks';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView as RNScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Surface } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { printObject } from '../../utils/helpers';

const Group = () => {
    // ...existing code...
    // Debug: print the group object from params and redux
    useEffect(() => {
        printObject('Group params object', params);
        printObject('Group paramGroup', paramGroup);
        printObject('Group reduxGroup', reduxGroup);
    }, [params, paramGroup, reduxGroup]);
    const router = useRouter();
    const dispatch = useDispatch();
    const params = useLocalSearchParams();
    const api_token = useSelector((state: any) => state.user?.apiToken);
    const user = useSelector((state: any) => state.user);
    // Helper to always get string from param
    function getParamString(val: any): string {
        if (Array.isArray(val)) return val[0] || '';
        return val || '';
    }
    const groupId = getParamString(params.id);
    const meetingId =
        getParamString(params.meetingId) ||
        getParamString(params.fromMeetingId);
    // Find meeting by meetingId, then group by groupId within meeting.groups
    const meetings = useSelector(
        (state: any) => state.meetings?.meetings || []
    );
    const meeting = meetings.find(
        (m: any) => String(m.id) === String(meetingId)
    );
    const reduxGroup = meeting?.groups?.find(
        (g: any) => String(g.id) === String(groupId)
    );
    // If full group object is passed in params, use it (all params are strings)
    const paramGroup = React.useMemo(() => {
        if (params.title || params.group_title) {
            const allFields = { ...params };
            return {
                ...allFields,
                title:
                    (getParamString(allFields.title) ||
                        getParamString(allFields.group_title)) ??
                    '',
                location:
                    (getParamString(allFields.location) ||
                        getParamString(allFields.group_location)) ??
                    '',
                facilitator:
                    (getParamString(allFields.facilitator) ||
                        getParamString(allFields.group_facilitator)) ??
                    '',
                cofacilitator:
                    (getParamString(allFields.cofacilitator) ||
                        getParamString(allFields.group_cofacilitator)) ??
                    '',
                notes:
                    (getParamString(allFields.notes) ||
                        getParamString(allFields.group_notes)) ??
                    '',
                gender:
                    (getParamString(allFields.gender) ||
                        getParamString(allFields.group_gender)) ??
                    'x',
                attendance:
                    Number(
                        getParamString(allFields.attendance) ||
                            getParamString(allFields.attendance_count) ||
                            getParamString(allFields.group_attendance)
                    ) || 0,
            };
        }
        return undefined;
    }, [params]);
    // Debug: print the group object from params and redux
    useEffect(() => {
        printObject('Group params object', params);
        printObject('Group paramGroup', paramGroup);
        printObject('Group reduxGroup', reduxGroup);
    }, [params, paramGroup, reduxGroup]);
    // Otherwise, fallback to Redux lookup
    // Permissions logic
    const canEdit = user?.profile?.permissions?.includes('groups');

    // Form state (initialize as empty, always set from paramGroup/reduxGroup in useEffect)
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [facilitator, setFacilitator] = useState('');
    const [cofacilitator, setCofacilitator] = useState('');
    const [notes, setNotes] = useState('');
    const [gender, setGender] = useState('x');
    const [attendance, setAttendance] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const scrollViewRef = useRef<RNScrollView | null>(null);
    const notesInputRef = useRef(null);

    // On mount or when params change, sync form state from params if present,
    // otherwise use Redux group data if available.
    useEffect(() => {
        // Helper to check if a param is missing or empty
        function missing(val: any) {
            return val === undefined || val === null || val === '';
        }
        const source = paramGroup || reduxGroup || {};
        printObject('useEffect set state source', source);
        setTitle(!missing(source.title) ? getParamString(source.title) : '');
        setLocation(
            !missing(source.location) ? getParamString(source.location) : ''
        );
        setFacilitator(
            !missing(source.facilitator)
                ? getParamString(source.facilitator)
                : ''
        );
        setCofacilitator(
            !missing(source.cofacilitator)
                ? getParamString(source.cofacilitator)
                : ''
        );
        setNotes(!missing(source.notes) ? getParamString(source.notes) : '');
        setGender(
            !missing(source.gender) ? getParamString(source.gender) : 'x'
        );
        setAttendance(
            !missing(source.attendance)
                ? Number(getParamString(source.attendance))
                : 0
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(params), paramGroup, reduxGroup]);

    // Validation
    const isTitleValid = /^[a-zA-Z0-9 \-_&]{3,25}$/.test(title);
    const isLocationValid = /^[a-zA-Z0-9 \-_&]{3,25}$/.test(location);
    const isFacilitatorValid =
        facilitator.length === 0 || /^[a-zA-Z0-9 ]{0,25}$/.test(facilitator);
    const isCofacilitatorValid =
        cofacilitator.length === 0 ||
        /^[a-zA-Z0-9 ]{0,25}$/.test(cofacilitator);
    const isNotesValid =
        notes.length === 0 || /^[a-zA-Z0-9 .,!?\\-]{0,100}$/.test(notes);
    const canSubmit =
        isTitleValid &&
        isLocationValid &&
        isFacilitatorValid &&
        isCofacilitatorValid &&
        isNotesValid &&
        canEdit;

    // Top navigation cancel handler
    // If we have the meetingId, navigate explicitly to that meeting. Otherwise
    // fall back to router.back() to return to the previous screen so we don't
    // accidentally navigate to the literal '/(meeting)/[id]' route without an id
    // (which results in no meeting data). Using router.back() preserves the
    // previous screen state when possible.
    const handleCancel = useCallback(() => {
        if (meetingId) {
            router.push({
                pathname: '/(meeting)/[id]',
                params: { id: meetingId },
            });
        } else {
            router.back();
        }
    }, [meetingId, router]);

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        const group = {
            title: title.trim(),
            location: location.trim(),
            gender,
            attendance,
            facilitator: facilitator.trim() || null,
            cofacilitator: cofacilitator.trim() || null,
            notes: notes.trim() || null,
        };
        try {
            await (dispatch as any)(
                updateGroup({
                    api_token,
                    group_id: groupId,
                    group,
                    meeting_id: meetingId,
                })
            ).unwrap();
            handleCancel();
        } catch {
            setError('Failed to update group. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // No navigation.setOptions in expo-router, so skip headerLeft logic

    return (
        <>
            <Stack.Screen
                options={{
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={handleCancel}
                            style={{ marginLeft: 16 }}
                        >
                            <Text style={{ color: '#007AFF', fontSize: 18 }}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
            >
                <Surface style={themedStyles.surface}>
                    <View style={themedStyles.groupGenderSelectorRow}>
                        <View style={themedStyles.groupGenderSelectorContainer}>
                            <View
                                style={themedStyles.groupGenderSelectorWrapper}
                            >
                                <GenderSelectors
                                    pick={gender}
                                    setPick={canEdit ? setGender : undefined}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={themedStyles.groupFormRow}>
                        <Text style={themedStyles.groupFormLabel}>
                            Attendance
                        </Text>
                        <NumberInputEditable
                            value={attendance}
                            onAction={canEdit ? setAttendance : () => {}}
                            min={0}
                            max={999}
                            numberStyle={{}}
                            graphicStyle={{}}
                        />
                    </View>
                    <View style={themedStyles.groupFormRow}>
                        <Text style={themedStyles.groupFormLabel}>Title *</Text>
                        <TextInput
                            style={themedStyles.formInput}
                            value={title}
                            placeholder='Group Title'
                            maxLength={25}
                        />
                    </View>
                    <View style={themedStyles.groupFormRow}>
                        <Text style={themedStyles.groupFormLabel}>
                            Location *
                        </Text>
                        <TextInput
                            style={themedStyles.formInput}
                            value={location}
                            placeholder='Location'
                            maxLength={25}
                        />
                    </View>
                    <View style={themedStyles.groupFormRow}>
                        <Text style={themedStyles.groupFormLabel}>
                            Facilitator
                        </Text>
                        <TextInput
                            style={themedStyles.formInput}
                            value={facilitator}
                            placeholder='Facilitator'
                            maxLength={25}
                        />
                    </View>
                    <View style={themedStyles.groupFormRow}>
                        <Text style={themedStyles.groupFormLabel}>
                            Co-Facilitator
                        </Text>
                        <TextInput
                            style={themedStyles.formInput}
                            value={cofacilitator}
                            placeholder='Co-Facilitator'
                            maxLength={25}
                        />
                    </View>
                    <View style={themedStyles.groupFormRow}>
                        <Text style={themedStyles.groupFormLabel}>Notes</Text>
                        <TextInput
                            style={[themedStyles.input, { height: 60 }]}
                            value={notes as string}
                            placeholder='Notes'
                            multiline
                        />
                    </View>

                    <View style={themedStyles.buttonRow}>
                        {canEdit && canSubmit && (
                            <TouchableOpacity
                                style={themedStyles.saveButton}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                <Text style={themedStyles.saveText}>
                                    {submitting ? 'Saving...' : 'Update'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {submitting && (
                            <View style={themedStyles.activityOverlay}>
                                <ActivityIndicator
                                    size='large'
                                    color={theme.colors.accent}
                                />
                            </View>
                        )}
                    </View>
                </Surface>
            </KeyboardAvoidingView>
        </>
    );
};

export default Group;
