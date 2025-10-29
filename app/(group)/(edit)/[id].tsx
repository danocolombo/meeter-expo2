import theme from '@assets/Colors';
import themedStyles from '@assets/Styles';
import GenderSelectors from '@components/ui/GenderSelectors';
import NumberInputEditable from '@components/ui/NumberInputEditable';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { upsertMeeting } from '../../../features/meetings/meetingsSlice';
import {
    fetchMeetingDetailsById,
    updateGroup,
} from '../../../features/meetings/meetingsThunks';

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

    // allow either 'groups' or 'manage' permission to edit groups
    const canEdit =
        user?.profile?.permissions?.includes('groups') ||
        user?.profile?.permissions?.includes('manage');

    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [facilitator, setFacilitator] = useState('');
    const [cofacilitator, setCofacilitator] = useState('');
    const [notes, setNotes] = useState('');
    const [gender, setGender] = useState('x');
    const [attendance, setAttendance] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Initialize form state once when this screen mounts or when params change.
    // Avoid overwriting user edits while they're editing (reduxGroup can update
    // frequently and would otherwise reset local state on each change).
    const initializedRef = useRef(false);
    useEffect(() => {
        function missing(val: any) {
            return val === undefined || val === null || val === '';
        }
        // Only initialize when not yet initialized. If params change (new group),
        // we should re-initialize, so reset initializedRef when params differ.
        if (initializedRef.current) return;

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
        initializedRef.current = true;
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
        // Always navigate back to the meeting details screen so callers
        // return to a single canonical view. Use replace when available
        // to avoid stacking duplicate routes.
        try {
            if (meetingId) {
                const navParams: any = { id: meetingId };
                if ((params as any)?.origin) navParams.origin = params.origin;
                if ((params as any)?.org_id) navParams.org_id = params.org_id;
                if ((params as any)?.meeting)
                    navParams.meeting = params.meeting;
                if ((router as any).replace) {
                    (router as any).replace({
                        pathname: '/(meeting)/[id]',
                        params: navParams,
                    } as any);
                    return;
                }
                (router as any).push({
                    pathname: '/(meeting)/[id]',
                    params: navParams,
                } as any);
                return;
            }
        } catch {
            // fall through to best-effort back
        }

        try {
            (router as any).back?.();
        } catch {
            // ignore
        }
    }, [meetingId, params, router]);

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

            // After successful update, proactively refresh the meeting details
            // so the meeting screen has data to render immediately.
            let prefetchedMeeting: any | undefined = undefined;
            try {
                const tokenStr =
                    user?.profile?.apiToken?.plainTextToken ||
                    (api_token && api_token.plainTextToken) ||
                    undefined;
                const orgId = user?.profile?.activeOrg?.id;
                console.debug(
                    'Prefetch attempt: token present?',
                    !!tokenStr,
                    'orgId:',
                    orgId,
                    'meetingId:',
                    meetingId
                );

                // Relax requirement on orgId: try best-effort fetch when we at least
                // have a token and meetingId. Some environments may infer org
                // server-side from token alone.
                if (tokenStr && meetingId) {
                    try {
                        const result = await (dispatch as any)(
                            fetchMeetingDetailsById({
                                apiToken: tokenStr,
                                organizationId: orgId || undefined,
                                meetingId,
                            })
                        ).unwrap();
                        // Prefer payload data shape used elsewhere
                        prefetchedMeeting =
                            result?.data?.currentMeeting ||
                            result?.data ||
                            result;
                        console.debug(
                            'Prefetch succeeded, payload keys:',
                            prefetchedMeeting &&
                                Object.keys(prefetchedMeeting).slice(0, 10)
                        );
                    } catch (innerErr) {
                        console.warn('Prefetch failed (inner):', innerErr);
                    }
                } else {
                    console.debug(
                        'Skipping prefetch due to missing token or meetingId'
                    );
                }
            } catch (e) {
                // non-fatal: if fetch fails, still navigate so user isn't blocked
                console.warn('Failed to prefetch meeting details (outer):', e);
            }

            // Navigate to the meeting details screen. Include serialized meeting
            // in params when available so the target screen can render immediately
            // from the route param (MeetingDetails upserts route param if present).
            if (meetingId) {
                const paramsToSend: any = { id: meetingId };
                // forward origin/org_id/meeting if present on this route so the
                // meeting edit/details screen can preserve return navigation
                if ((params as any)?.origin)
                    paramsToSend.origin = String((params as any).origin);
                if ((params as any)?.org_id)
                    paramsToSend.org_id = String((params as any).org_id);
                if ((params as any)?.meeting)
                    paramsToSend.meeting = String((params as any).meeting);

                if (prefetchedMeeting) {
                    try {
                        // upsert into redux so target screen can read it even if
                        // route params are dropped or truncated by the router.
                        try {
                            dispatch(upsertMeeting(prefetchedMeeting));
                            console.debug(
                                'Upserted prefetchedMeeting into store, id:',
                                prefetchedMeeting?.id
                            );
                        } catch (upsertErr) {
                            console.warn(
                                'Failed to upsert prefetchedMeeting into store:',
                                upsertErr
                            );
                        }

                        // only attach a serialized meeting if we weren't already
                        // given one via params; avoid overwriting an explicit param
                        if (!paramsToSend.meeting) {
                            paramsToSend.meeting =
                                JSON.stringify(prefetchedMeeting);
                            console.debug(
                                'Attached serialized meeting param, length:',
                                paramsToSend.meeting.length
                            );
                        } else {
                            console.debug(
                                'Keeping existing meeting param from caller; not overwriting with prefetchedMeeting'
                            );
                        }
                    } catch (serErr) {
                        console.warn(
                            'Failed to serialize prefetchedMeeting:',
                            serErr
                        );
                    }
                } else {
                    console.debug(
                        'No prefetchedMeeting available to attach to params'
                    );
                }

                console.debug(
                    'Navigating to meeting edit with params:',
                    Object.keys(paramsToSend)
                );
                // Navigate directly to the meeting details screen and include the
                // serialized meeting so the details screen can render immediately.
                // Prefer replace to avoid stacking the meeting edit route in history
                if ((router as any).replace) {
                    (router as any).replace({
                        pathname: '/(meeting)/[id]',
                        params: paramsToSend,
                    } as any);
                } else {
                    router.push({
                        pathname: '/(meeting)/[id]',
                        params: paramsToSend,
                    });
                }
            } else {
                handleCancel();
            }
        } catch (err) {
            // Unwrap throws the rejected value; prefer any message/details it provides
            const e = err as any;
            const message =
                (e && (e.message || e.details || e.error)) ||
                'Failed to update group. Please try again.';
            setError(String(message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
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
                            onChangeText={setTitle}
                            placeholder='Group Title'
                            maxLength={25}
                            editable={canEdit}
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
                            editable={canEdit}
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
                            editable={canEdit}
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
                            editable={canEdit}
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
                            editable={canEdit}
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
                            <View
                                style={{ width: '100%', alignItems: 'center' }}
                            >
                                <TouchableOpacity
                                    style={themedStyles.saveButton}
                                    onPress={handleSave}
                                    disabled={submitting}
                                >
                                    <Text style={themedStyles.saveText}>
                                        {submitting ? 'Saving...' : 'Save'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
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
