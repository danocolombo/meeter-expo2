import theme from '@assets/Colors';

import GenderSelectors from '@components/ui/GenderSelectors';
import NumberInputEditable from '@components/ui/NumberInputEditable';
import { updateGroup } from '@features/meetings/meetingsThunks';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView as RNScrollView,
    TextInput as RNTextInput,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const Group = () => {
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
    // Permissions logic
    const canEdit = user?.profile?.permissions?.includes('groups');

    // Form state
    const [title, setTitle] = useState(getParamString(params.title));
    const [location, setLocation] = useState(getParamString(params.location));
    const [facilitator, setFacilitator] = useState(
        getParamString(params.facilitator)
    );
    const [cofacilitator, setCofacilitator] = useState(
        getParamString(params.cofacilitator)
    );
    const [notes, setNotes] = useState(getParamString(params.notes));
    const [gender, setGender] = useState(getParamString(params.gender) || 'x');
    const [attendance, setAttendance] = useState(
        Number(getParamString(params.attendance)) || 0
    );
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const scrollViewRef = useRef<RNScrollView | null>(null);
    const notesInputRef = useRef(null);

    // Validation
    const isTitleValid = /^[a-zA-Z0-9 \-_&]{3,25}$/.test(title);
    const isLocationValid = /^[a-zA-Z0-9 \-_&]{3,25}$/.test(location);
    const isFacilitatorValid =
        facilitator.length === 0 || /^[a-zA-Z0-9 ]{0,25}$/.test(facilitator);
    const isCofacilitatorValid =
        cofacilitator.length === 0 ||
        /^[a-zA-Z0-9 ]{0,25}$/.test(cofacilitator);
    const isNotesValid =
        notes.length === 0 || /^[a-zA-Z0-9 .,!?\-]{0,100}$/.test(notes);
    const canSubmit =
        isTitleValid &&
        isLocationValid &&
        isFacilitatorValid &&
        isCofacilitatorValid &&
        isNotesValid &&
        canEdit;

    // Top navigation cancel handler
    const handleCancel = useCallback(() => {
        if (meetingId) {
            router.push({
                pathname: '/(meeting)/[id]',
                params: { id: meetingId },
            });
        } else {
            router.push('/(meeting)/[id]');
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
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: theme.colors.primaryBackground,
                }}
                edges={['bottom', 'left', 'right']}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
                >
                    <View style={{ flex: 1 }}>
                        <RNScrollView
                            ref={scrollViewRef}
                            contentContainerStyle={styles.container}
                            keyboardShouldPersistTaps='handled'
                        >
                            <View style={styles.section}>
                                <Text style={styles.label}>Group Type</Text>
                                <GenderSelectors
                                    pick={gender}
                                    setPick={canEdit ? setGender : undefined}
                                />
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.label}>Attendance</Text>
                                <NumberInputEditable
                                    value={attendance}
                                    onAction={
                                        canEdit ? setAttendance : () => {}
                                    }
                                    min={0}
                                    max={999}
                                    numberStyle={{}}
                                    graphicStyle={{}}
                                />
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.label}>Title *</Text>
                                <RNTextInput
                                    style={[
                                        styles.input,
                                        !isTitleValid &&
                                            title.length > 0 &&
                                            styles.inputError,
                                    ]}
                                    value={title}
                                    onChangeText={
                                        canEdit ? setTitle : undefined
                                    }
                                    placeholder='Group Title'
                                    maxLength={25}
                                    autoCapitalize='words'
                                    returnKeyType='next'
                                    editable={canEdit}
                                />
                                {!isTitleValid && title.length > 0 && (
                                    <Text style={styles.errorText}>
                                        3-25 alphanumeric chars required
                                    </Text>
                                )}
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.label}>Location *</Text>
                                <RNTextInput
                                    style={[
                                        styles.input,
                                        !isLocationValid &&
                                            location.length > 0 &&
                                            styles.inputError,
                                    ]}
                                    value={location}
                                    onChangeText={
                                        canEdit ? setLocation : undefined
                                    }
                                    placeholder='Location'
                                    maxLength={25}
                                    autoCapitalize='words'
                                    returnKeyType='next'
                                    editable={canEdit}
                                />
                                {!isLocationValid && location.length > 0 && (
                                    <Text style={styles.errorText}>
                                        3-25 alphanumeric chars required
                                    </Text>
                                )}
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.label}>Facilitator</Text>
                                <RNTextInput
                                    style={[
                                        styles.input,
                                        !isFacilitatorValid &&
                                            facilitator.length > 0 &&
                                            styles.inputError,
                                    ]}
                                    value={facilitator}
                                    onChangeText={
                                        canEdit ? setFacilitator : undefined
                                    }
                                    placeholder='Facilitator'
                                    maxLength={25}
                                    autoCapitalize='words'
                                    returnKeyType='next'
                                    editable={canEdit}
                                />
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.label}>Co-Facilitator</Text>
                                <RNTextInput
                                    style={[
                                        styles.input,
                                        !isCofacilitatorValid &&
                                            cofacilitator.length > 0 &&
                                            styles.inputError,
                                    ]}
                                    value={cofacilitator}
                                    onChangeText={
                                        canEdit ? setCofacilitator : undefined
                                    }
                                    placeholder='Co-Facilitator'
                                    maxLength={25}
                                    autoCapitalize='words'
                                    returnKeyType='next'
                                    editable={canEdit}
                                />
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.label}>Notes</Text>
                                <RNTextInput
                                    ref={notesInputRef}
                                    style={[
                                        styles.input,
                                        !isNotesValid &&
                                            notes.length > 0 &&
                                            styles.inputError,
                                    ]}
                                    value={notes}
                                    onChangeText={
                                        canEdit ? setNotes : undefined
                                    }
                                    placeholder='Notes'
                                    maxLength={100}
                                    multiline
                                    textAlignVertical='top'
                                    returnKeyType='done'
                                    editable={canEdit}
                                    onFocus={() => {
                                        setTimeout(() => {
                                            if (scrollViewRef.current) {
                                                scrollViewRef.current.scrollTo({
                                                    y: 500,
                                                    animated: true,
                                                });
                                            }
                                        }, 250);
                                    }}
                                />
                            </View>
                            {error ? (
                                <Text style={styles.errorText}>{error}</Text>
                            ) : null}
                            <View style={styles.buttonRow}>
                                {canEdit && canSubmit && (
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={handleSubmit}
                                        disabled={submitting}
                                    >
                                        <Text style={styles.saveText}>
                                            {submitting
                                                ? 'Saving...'
                                                : 'Update'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </RNScrollView>
                        {submitting && (
                            <View style={styles.activityOverlay}>
                                <ActivityIndicator
                                    size='large'
                                    color={theme.colors.accent}
                                />
                            </View>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 32,
    },
    section: {
        marginBottom: 16,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
        color: theme.colors.text,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: 6,
        padding: 10,
        fontSize: 16,
        backgroundColor: theme.colors.inputBackground,
        color: theme.colors.text,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    errorText: {
        color: theme.colors.error,
        marginTop: 4,
        marginBottom: 4,
        fontSize: 14,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    saveButton: {
        backgroundColor: theme.colors.accent,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 6,
    },
    saveText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    activityOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
});

export default Group;
