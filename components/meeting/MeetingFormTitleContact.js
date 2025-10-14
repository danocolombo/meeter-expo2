import theme from '@assets/Colors';
import Input from '@components/ui/Input';
import React, { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
const TitleSection = ({ values, setValues }) => {
    const { width } = useWindowDimensions();
    const user = useSelector((state) => state.user);
    const [isTitleValid, setIsTitleValid] = useState(
        values?.title?.length > 2 ? true : false
    );
    const ViewOnly = user.profile.permissions.includes('manage');
    function inputChangedHandler(inputIdentifier, enteredValue) {
        setValues((curInputValues) => {
            if (inputIdentifier === 'title') {
                if (enteredValue.length < 3) {
                    setIsTitleValid(false);
                } else {
                    setIsTitleValid(true);
                }
            }
            return {
                ...curInputValues,
                [inputIdentifier]: enteredValue,
            };
        });
    }
    if (ViewOnly) {
        return (
            <>
                <View style={localStyles.column}>
                    {values.meeting_type === 'Lesson' && (
                        <>
                            <Input
                                label='LessonX'
                                labelStyle={localStyles.meetingEditInputLabel}
                                textInputConfig={{
                                    backgroundColor: theme.colors.lightGraphic,
                                    value: values.title,
                                    paddingHorizontal: 1,
                                    fontSize: 24,
                                    color: theme.colors.darkText,
                                    editable: user.profile.permissions.includes(
                                        'manage'
                                    )
                                        ? true
                                        : false,
                                    marginHorizontal: 10,
                                    placeholder: 'Lesson Title',
                                    fontWeight: '300',
                                    minWidth: '70%',
                                    letterSpacing: 0,
                                    onChangeText: inputChangedHandler.bind(
                                        this,
                                        'title'
                                    ),
                                }}
                            />
                            <Input
                                label='Contact'
                                labelStyle={localStyles.meetingEditInputLabel}
                                textInputConfig={{
                                    backgroundColor: theme.colors.lightGraphic,
                                    value: values?.support_contact,
                                    paddingHorizontal: 1,
                                    fontSize: 24,
                                    color: theme.colors.darkText,
                                    marginHorizontal: 10,
                                    placeholder: 'Contact',
                                    fontWeight: '300',
                                    minWidth: width * 0.6,
                                    letterSpacing: 0,
                                    onChangeText: inputChangedHandler.bind(
                                        this,
                                        'support_contact'
                                    ),
                                }}
                            />
                        </>
                    )}
                    {values.meeting_type === 'Testimony' && (
                        <>
                            <Input
                                label='Guest'
                                labelStyle={localStyles.meetingEditInputLabel}
                                textInputConfig={{
                                    backgroundColor: theme.colors.lightGraphic,
                                    value: values.title,
                                    paddingHorizontal: 1,
                                    fontSize: 24,
                                    editable: user.profile.permissions.includes(
                                        'manage'
                                    )
                                        ? true
                                        : false,
                                    color: theme.colors.darkText,
                                    marginHorizontal: 10,
                                    autoCapitalize: 'words',
                                    placeholder: 'Guest',
                                    fontWeight: '300',
                                    minWidth: '70%',
                                    letterSpacing: 0,
                                    onChangeText: inputChangedHandler.bind(
                                        this,
                                        'title'
                                    ),
                                }}
                            />
                        </>
                    )}
                    {values.meeting_type === 'Special' && (
                        <View style={localStyles.container}>
                            <Text style={localStyles.title}>
                                {values.title}
                            </Text>

                            <Text style={localStyles.subTitle}>
                                {values?.support_contact || ''}
                            </Text>
                        </View>
                    )}
                </View>
            </>
        );
    }
    return (
        <>
            <View style={localStyles.column}>
                {values.meeting_type === 'Lesson' && (
                    <>
                        <Input
                            label='Lesson'
                            labelStyle={localStyles.meetingEditInputLabel}
                            textInputConfig={{
                                backgroundColor: theme.colors.lightGrey,
                                value: values.title,
                                paddingHorizontal: 1,
                                borderColor: theme.colors.mediumObject,
                                borderWidth: StyleSheet.hairlineWidth,
                                fontSize: 24,
                                color: theme.colors.darkText,
                                editable: user.profile.permissions.includes(
                                    'manage'
                                )
                                    ? true
                                    : false,
                                marginHorizontal: 10,
                                placeholder: 'Lesson Title',
                                fontWeight: '300',
                                minWidth: '70%',
                                letterSpacing: 0,
                                onChangeText: inputChangedHandler.bind(
                                    this,
                                    'title'
                                ),
                            }}
                        />
                        <Input
                            label='Contact'
                            labelStyle={localStyles.meetingEditInputLabel}
                            textInputConfig={{
                                backgroundColor: theme.colors.lightGrey,
                                value: values?.support_contact || '',
                                borderColor: theme.colors.mediumObject,
                                borderWidth: StyleSheet.hairlineWidth,
                                paddingHorizontal: 1,
                                fontSize: 24,
                                color: theme.colors.darkText,
                                marginHorizontal: 10,
                                placeholder: 'Contact',
                                fontWeight: '300',
                                minWidth: width * 0.6,
                                letterSpacing: 0,
                                onChangeText: inputChangedHandler.bind(
                                    this,
                                    'support_contact'
                                ),
                            }}
                        />
                    </>
                )}
                {values.meeting_type === 'Testimony' && (
                    <>
                        <Input
                            label='Guest'
                            labelStyle={localStyles.meetingEditInputLabel}
                            textInputConfig={{
                                backgroundColor: theme.colors.lightGrey,
                                value: values.title,
                                paddingHorizontal: 1,
                                borderColor: theme.colors.mediumObject,
                                borderWidth: StyleSheet.hairlineWidth,
                                fontSize: 24,
                                editable: user.profile.permissions.includes(
                                    'manage'
                                )
                                    ? true
                                    : false,
                                color: theme.colors.darkText,
                                marginHorizontal: 10,
                                autoCapitalize: 'words',
                                placeholder: 'Guest',
                                fontWeight: '300',
                                minWidth: '70%',
                                letterSpacing: 0,
                                onChangeText: inputChangedHandler.bind(
                                    this,
                                    'title'
                                ),
                            }}
                        />
                    </>
                )}
                {values.meeting_type === 'Special' && (
                    <>
                        <Input
                            label='Event Title'
                            labelStyle={localStyles.meetingEditInputLabel}
                            textInputConfig={{
                                backgroundColor: theme.colors.lightGrey,
                                value: values.title,
                                borderColor: theme.colors.mediumObject,
                                borderWidth: StyleSheet.hairlineWidth,
                                paddingHorizontal: 1,
                                fontSize: 24,
                                color: theme.colors.darkText,
                                marginHorizontal: 10,
                                placeholder: 'Event Title',
                                fontWeight: '300',
                                minWidth: width * 0.6,
                                letterSpacing: 0,
                                onChangeText: inputChangedHandler.bind(
                                    this,
                                    'title'
                                ),
                            }}
                        />
                        <Input
                            label='Contact'
                            labelStyle={localStyles.meetingEditInputLabel}
                            textInputConfig={{
                                backgroundColor: theme.colors.lightGrey,
                                value: values?.support_contact || '',
                                borderColor: theme.colors.mediumObject,
                                borderWidth: StyleSheet.hairlineWidth,
                                paddingHorizontal: 1,
                                fontSize: 24,
                                color: theme.colors.darkText,
                                marginHorizontal: 10,
                                placeholder: 'Contact',
                                fontWeight: '300',
                                minWidth: width * 0.6,
                                letterSpacing: 0,
                                onChangeText: inputChangedHandler.bind(
                                    this,
                                    'support_contact'
                                ),
                            }}
                        />
                    </>
                )}
                <Input
                    label='Music/Worship'
                    labelStyle={localStyles.meetingEditInputLabel}
                    textInputConfig={{
                        backgroundColor: theme.colors.lightGrey,
                        value: values.worship,
                        borderColor: theme.colors.mediumObject,
                        borderWidth: StyleSheet.hairlineWidth,
                        paddingHorizontal: 1,
                        fontSize: 24,
                        color: theme.colors.darkText,
                        marginHorizontal: 10,
                        placeholder: 'Music/Worship',
                        fontWeight: '300',
                        minWidth: width * 0.6,
                        letterSpacing: 0,
                        onChangeText: inputChangedHandler.bind(this, 'worship'),
                    }}
                />
            </View>
        </>
    );
};

export default TitleSection;
const localStyles = StyleSheet.create({
    meetingEditInputLabel: {
        color: theme.colors.darkText,
        fontFamily: 'Roboto-Regular',
        paddingLeft: 10,
        fontSize: 20,
    },
    column: {
        flexDirection: 'column',
    },
    container: {
        paddingLeft: 5,
    },
    title: {
        color: theme.colors.lightGrey,
        fontSize: 24,
        paddingVertical: 3,
    },
    subTitle: {
        color: theme.colors.lightGrey,
        fontSize: 20,
        paddingVertical: 3,
    },
});
