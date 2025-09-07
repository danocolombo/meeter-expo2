// ...existing code...
import theme from '@/assets/Colors';
import CustomButton from '@/components/ui/CustomButton';
import GenderSelectors from '@/components/ui/GenderSelectors';
import Input from '@/components/ui/Input';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
const Group = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    // params: { id, title, location, facilitator, gender }
    const [values, setValues] = useState({
        id: params.id ?? null,
        gender: params.gender ?? 'x',
        title: params.title ?? '',
        location: params.location ?? '',
        facilitator: params.facilitator ?? '',
    });
    function setGenderValue(enteredValue: string) {
        setValues((curInputValues) => {
            return {
                ...curInputValues,
                gender: enteredValue,
            };
        });
    }
    const [isLocationValid, setIsLocationValid] = useState(
        (params.location?.length ?? 0) > 2 ? true : false
    );
    const [isTitleValid, setIsTitleValid] = useState(
        params.title?.length > 2 ? true : false
    );
    const [isFacilitatorValid, setIsFacilitatorValid] = useState(
        (params.facilitator?.length ?? 0) > 1 ? true : false
    );
    function inputChangedHandler(
        inputIdentifier: string,
        enteredValue: string
    ) {
        setValues((curInputValues) => {
            if (inputIdentifier === 'title') {
                if (enteredValue.length < 3) {
                    setIsTitleValid(false);
                } else {
                    setIsTitleValid(true);
                }
            }
            if (inputIdentifier === 'location') {
                if (enteredValue.length < 3) {
                    setIsLocationValid(false);
                } else {
                    setIsLocationValid(true);
                }
            }
            if (inputIdentifier === 'facilitator') {
                if (enteredValue.length < 2) {
                    setIsFacilitatorValid(false);
                } else {
                    setIsFacilitatorValid(true);
                }
            }
            return {
                ...curInputValues,
                [inputIdentifier]: enteredValue,
            };
        });
    }

    const handleFormSubmit = () => {
        // handleUpdate(values);
        console.log('Form submitted:', values);
    };
    const handleFormCancel = () => {
        // Navigate back to meeting page with id and org_id if available
        if (params.fromMeetingId && params.org_id) {
            router.replace({
                pathname: '/(meeting)/[id]',
                params: { id: params.fromMeetingId, org_id: params.org_id },
            });
        } else if (params.fromMeetingId) {
            router.replace({
                pathname: '/(meeting)/[id]',
                params: { id: params.fromMeetingId },
            });
        } else {
            router.replace('/(meeting)/[id]');
        }
    };
    return (
        <SafeAreaView>
            <ScrollView>
                <KeyboardAvoidingView behavior='padding'>
                    <View style={localStyles.selectorWrapper}>
                        <GenderSelectors
                            setPick={setGenderValue}
                            pick={values.gender}
                        />
                    </View>
                    <View style={localStyles.row}>
                        <Input
                            label='Group Title'
                            labelStyle={localStyles.labelText}
                            textInputConfig={{
                                backgroundColor: isTitleValid
                                    ? theme.colors.lightGraphic
                                    : theme.colors.lightGraphic,
                                value: values.title,
                                paddingHorizontal: 5,
                                fontSize: 24,
                                color: theme.colors.darkText,
                                marginHorizontal: 0,
                                placeholder: 'title of group...',
                                style: { color: theme.colors.darkText },
                                fontWeight: '500',
                                letterSpacing: 0,
                                onChangeText: inputChangedHandler.bind(
                                    this,
                                    'title'
                                ),
                            }}
                        />
                    </View>
                    {!isTitleValid && (
                        <View style={localStyles.errorMessageContainer}>
                            <Text style={localStyles.errorMessageText}>
                                REQUIRED: minimum length = 3
                            </Text>
                        </View>
                    )}
                    <View style={localStyles.row}>
                        <Input
                            label='Location'
                            labelStyle={localStyles.labelText}
                            textInputConfig={{
                                backgroundColor: isLocationValid
                                    ? theme.colors.lightGraphic
                                    : theme.colors.lightGraphic,
                                paddingHorizontal: 5,
                                value: values.location,
                                fontSize: 24,
                                color: theme.colors.darkText,
                                capitalize: 'words',
                                marginHorizontal: 0,
                                placeholder: 'planned location...',
                                style: { color: theme.colors.darkText },
                                fontWeight: '500',
                                letterSpacing: 0,
                                onChangeText: inputChangedHandler.bind(
                                    this,
                                    'location'
                                ),
                            }}
                        />
                    </View>
                    {!isLocationValid && (
                        <View style={localStyles.errorMessageContainer}>
                            <Text style={localStyles.errorMessageText}>
                                REQUIRED: minimum length = 3
                            </Text>
                        </View>
                    )}
                    <View style={localStyles.row}>
                        <Input
                            label='Facilitator'
                            labelStyle={localStyles.labelText}
                            textInputConfig={{
                                backgroundColor: isFacilitatorValid
                                    ? theme.colors.lightGraphic
                                    : theme.colors.lightGraphic,
                                paddingHorizontal: 5,
                                fontSize: 24,
                                value: values.facilitator,
                                color: theme.colors.darkText,
                                capitalize: 'words',
                                marginHorizontal: 0,
                                placeholder: 'expected facilitator...',
                                style: { color: theme.colors.darkText },
                                fontWeight: '500',
                                letterSpacing: 0,
                                onChangeText: inputChangedHandler.bind(
                                    this,
                                    'facilitator'
                                ),
                            }}
                        />
                    </View>
                    {!isFacilitatorValid && (
                        <View style={localStyles.errorMessageContainer}>
                            <Text style={localStyles.errorMessageText}>
                                REQUIRED: minimum length = 2
                            </Text>
                        </View>
                    )}
                    <View style={localStyles.buttonContainer}>
                        {isTitleValid &&
                            isLocationValid &&
                            isFacilitatorValid && (
                                <View>
                                    <CustomButton
                                        text='SAVE'
                                        bgColor={theme.colors.success}
                                        fgColor={theme.colors.lightText}
                                        type='STANDARD'
                                        enabled={
                                            isTitleValid && isLocationValid
                                        }
                                        onPress={handleFormSubmit}
                                    />
                                </View>
                            )}
                        <View>
                            <CustomButton
                                text='CANCEL'
                                bgColor={theme.colors.critical}
                                fgColor={theme.colors.lightText}
                                type='STANDARD'
                                onPress={handleFormCancel}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Group;

const localStyles = StyleSheet.create({
    selectorWrapper: {
        flexDirection: 'row',
        borderWidth: 2,
        borderColor: theme.colors.lightGraphic,
        borderRadius: 5,
        marginVertical: 10,
        marginHorizontal: 10,
        paddingVertical: 5,
    },
    row: {
        marginHorizontal: 20,
        marginVertical: 5,
    },
    labelText: {
        color: theme.colors.lightText,
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
    },
    errorMessageContainer: {
        marginHorizontal: 30,
    },
    errorMessageText: {
        color: theme.colors.accent,
        fontFamily: 'Roboto-MediumItalic',
        fontSize: 18,
    },
    buttonContainer: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
});
