import themedStyles from '@assets/Styles';
import GenderSelectors from '@components/ui/GenderSelectors';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Surface } from 'react-native-paper';
import { useSelector } from 'react-redux';

const Group = () => {
    // ...existing code...
    const router = useRouter();
    const params = useLocalSearchParams();
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
    // Otherwise, fallback to Redux lookup
    // Permissions logic: allow 'groups' or 'manage'
    const canEdit =
        user?.profile?.permissions?.includes('groups') ||
        user?.profile?.permissions?.includes('manage');

    // Form state (initialize as empty, always set from paramGroup/reduxGroup in useEffect)
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [facilitator, setFacilitator] = useState('');
    const [cofacilitator, setCofacilitator] = useState('');
    const [notes, setNotes] = useState('');
    const [gender, setGender] = useState('x');
    const [attendance, setAttendance] = useState(0);

    // On mount or when params change, sync form state from params if present,
    // otherwise use Redux group data if available.
    useEffect(() => {
        // Helper to check if a param is missing or empty
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

    // Top navigation cancel handler
    // Always ensure the meeting route receives the meeting id and origin so
    // MeetingDetails can render correctly. Use replace to avoid stacking a
    // duplicate meeting route on the history; fall back to router.back() if
    // no meetingId is available.
    const originParam =
        (params &&
            (Array.isArray(params.origin)
                ? params.origin[0]
                : params.origin)) ||
        undefined;
    const handleCancel = useCallback(() => {
        // Prefer popping the previous route to preserve any serialized
        // meeting object or in-memory state. This keeps the UX stable when
        // navigating back from a group to its parent meeting screen.
        try {
            if ((router as any).back) {
                (router as any).back();
                return;
            }
        } catch {
            // fall through to fallback navigation
        }

        // If we can't pop, ensure we navigate to the meeting route with id
        if (meetingId) {
            const meetingParam = getParamString((params as any).meeting);
            const navParams: any = { id: meetingId, origin: originParam };
            if (meetingParam) navParams.meeting = meetingParam;
            if ((router as any).replace) {
                (router as any).replace({
                    pathname: '/(meeting)/[id]',
                    params: navParams,
                } as any);
                return;
            }
            if ((router as any).push) {
                (router as any).push({
                    pathname: '/(meeting)/[id]',
                    params: navParams,
                } as any);
                return;
            }
        }
    }, [meetingId, router, originParam, params]);

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
                    headerRight: () =>
                        canEdit ? (
                            <TouchableOpacity
                                onPress={() =>
                                    router.push({
                                        pathname: '/(group)/(edit)/[id]',
                                        params: {
                                            id: groupId,
                                            meetingId,
                                            title,
                                            location,
                                            facilitator,
                                            cofacilitator,
                                            notes,
                                            gender,
                                            attendance: String(attendance),
                                        },
                                    } as any)
                                }
                                style={{ marginRight: 16 }}
                            >
                                <Text
                                    style={{ color: '#007AFF', fontSize: 18 }}
                                >
                                    Edit
                                </Text>
                            </TouchableOpacity>
                        ) : null,
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
                        <Text style={themedStyles.groupReadOnlyLabel}>
                            Attendance: {String(attendance)}
                        </Text>
                    </View>
                    <View style={themedStyles.groupFormRow}>
                        <Text style={themedStyles.groupReadOnlyLabel}>
                            Title
                        </Text>
                        <Text style={themedStyles.groupReadOnlyData}>
                            {title?.trim() ? title : ''}
                        </Text>
                    </View>
                    <View style={themedStyles.groupFormRow}>
                        <Text style={themedStyles.groupReadOnlyLabel}>
                            Location
                        </Text>
                        <Text style={themedStyles.groupReadOnlyData}>
                            {location?.trim() ? location : ''}
                        </Text>
                    </View>
                    <View style={themedStyles.groupFormRow}>
                        <Text style={themedStyles.groupReadOnlyLabel}>
                            Facilitator
                        </Text>
                        <Text style={themedStyles.groupReadOnlyData}>
                            {facilitator?.trim() ? facilitator : ''}
                        </Text>
                    </View>
                    <View style={themedStyles.groupFormRow}>
                        <Text style={themedStyles.groupReadOnlyLabel}>
                            Co-Facilitator
                        </Text>
                        <Text style={themedStyles.groupReadOnlyData}>
                            {cofacilitator?.trim() ? cofacilitator : ''}
                        </Text>
                    </View>
                    <View style={themedStyles.groupFormRow}>
                        <Text style={themedStyles.groupReadOnlyLabel}>
                            Notes
                        </Text>
                        <Text
                            style={[
                                themedStyles.groupReadOnlyData,
                                { height: 60 },
                            ]}
                        >
                            {(notes as string)?.trim() ? (notes as string) : ''}
                        </Text>
                    </View>
                </Surface>
            </KeyboardAvoidingView>
        </>
    );
};

export default Group;
