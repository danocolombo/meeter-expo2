import theme from '@assets/Colors';
import themedStyles from '@assets/Styles';
import GenderSelectors from '@components/ui/GenderSelectors';
import NumberInputEditable from '@components/ui/NumberInputEditable';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Surface } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { updateGroup } from '../../../features/meetings/meetingsThunks';

const GroupEdit = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const params = useLocalSearchParams();
    const api_token = useSelector((state: any) => state.user?.apiToken);
    const user = useSelector((state: any) => state.user);

    function getParamString(val: any): string {
        if (Array.isArray(val)) return val[0] || '';
        return val || '';
    }
    const groupId = getParamString(params.id);
    const meetingId =
        getParamString(params.meetingId) ||
        getParamString(params.fromMeetingId);

    const meetings = useSelector(
        (state: any) => state.meetings?.meetings || []
    );
    const meeting = meetings.find(
        (m: any) => String(m.id) === String(meetingId)
    );
    const reduxGroup = meeting?.groups?.find(
        (g: any) => String(g.id) === String(groupId)
    );

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

    const canEdit = user?.profile?.permissions?.includes('groups');

    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [facilitator, setFacilitator] = useState('');
    const [cofacilitator, setCofacilitator] = useState('');
    const [notes, setNotes] = useState('');
    const [gender, setGender] = useState('x');
    const [attendance, setAttendance] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        function missing(val: any) {
            return val === undefined || val === null || val === '';
        }
        const source = paramGroup || reduxGroup || {};
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

    const handleSave = async () => {
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
                    <View style={themedStyles.row}>
                        <Text style={themedStyles.meetingLabel}>EDIT</Text>
                    </View>
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
                            onChangeText={setTitle}
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
                            onChangeText={setLocation}
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
                            onChangeText={setFacilitator}
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
                            onChangeText={setCofacilitator}
                            placeholder='Co-Facilitator'
                            maxLength={25}
                        />
                    </View>

                    <View style={themedStyles.groupFormRow}>
                        <Text style={themedStyles.groupFormLabel}>Notes</Text>
                        <TextInput
                            style={[themedStyles.input, { height: 60 }]}
                            value={notes as string}
                            onChangeText={setNotes}
                            placeholder='Notes'
                            multiline
                        />
                    </View>

                    {error ? (
                        <Text
                            style={{
                                color: 'red',
                                textAlign: 'center',
                                marginVertical: 8,
                            }}
                        >
                            {error}
                        </Text>
                    ) : null}

                    <View style={themedStyles.buttonRow}>
                        {canEdit && canSubmit && (
                            <TouchableOpacity
                                style={themedStyles.saveButton}
                                onPress={handleSave}
                                disabled={submitting}
                            >
                                <Text style={themedStyles.saveText}>
                                    {submitting ? 'Saving...' : 'Save'}
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

export default GroupEdit;
