import React from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Input from '../ui/Input';

import { useTheme } from 'react-native-paper';
import MealSection from '../MeetingForm.meal';
import TypeSelectors from '../TypeSelectors';
import CustomButton from '../ui/CustomButton';
import MeetingDate from '../ui/MeetingDate';
import MeetingDonations from '../ui/MeetingDonations';

import useMeetingForm from '../../hooks/useMeetingForm';
import { getCurrentLocalDate } from '../../utils/helpers';
import NumbersSection from '../MeetingForm.numbers';
import TitleSection from '../MeetingForm.titleContact';
// type MeetingFormProps = {
//     meeting: MeetingType,
//     handleSubmit: (meeting: MeetingType) => void, // Adjust the type if handleSubmit has a different signature
// };
//   FUNCTION START
//   ==============
const MeetingForm = ({ meeting, handleSubmit }) => {
    // Use theme from the provider but merge with our direct theme values
    // const paperTheme = useTheme();
    // const mtrTheme = { ...theme, ...paperTheme };
    const mtrTheme = useTheme();
    const {
        userProfile,
        currentMeeting,
        currentGroups,
        theMeeting,
        setTheMeeting,
        newPerms,
        modalMeetingDateVisible,
        setModalMeetingDateVisible,
        authority,
        dateValue,
        setDateValue,
        isSavable,
        setIsSavable,
        inputChangedHandler,
        onMeetingDateConfirm,
        handleDateClick,
        handleTypeChange,
        handleFormSubmit,
        onMeetingDateCancel,
    } = useMeetingForm(meeting, handleSubmit);

    if (!theMeeting.meeting_date) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <ActivityIndicator color={{ color: 'blue' }} size={80} />
            </View>
        );
    }
    return (
        <SafeAreaView style={mtrTheme.surface}>
            <KeyboardAvoidingView style={mtrTheme.keyboardAvoiding}>
                <View style={mtrTheme.selectorWrapper}>
                    <TypeSelectors
                        pick={theMeeting?.meeting_type}
                        setPick={handleTypeChange}
                    />
                </View>
                <View style={mtrTheme.logisticsWrapper}>
                    <TouchableOpacity
                        onPress={() =>
                            newPerms.includes('manage')
                                ? handleDateClick()
                                : null
                        }
                    >
                        <View style={mtrTheme.dateContainer}>
                            <MeetingDate date={theMeeting?.meeting_date} />
                        </View>
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <TitleSection
                            values={theMeeting}
                            setValues={setTheMeeting}
                        />
                    </View>
                </View>
                <View style={mtrTheme.mealWrapper}>
                    <MealSection
                        values={theMeeting}
                        setValues={setTheMeeting}
                    />
                </View>
                <View style={mtrTheme.numberWrapper}>
                    <NumbersSection
                        values={theMeeting}
                        setValues={setTheMeeting}
                    />
                    {authority && (
                        <MeetingDonations
                            donations={theMeeting?.donations ?? 0}
                            onChangeValue={inputChangedHandler.bind(
                                this,
                                'donations'
                            )}
                        />
                    )}
                </View>
                <View style={mtrTheme.notesWrapper}>
                    <View style={mtrTheme.notesStyle}>
                        <Input
                            label='Notes'
                            labelStyle={mtrTheme.notesLabelText}
                            textInputConfig={{
                                backgroundColor: mtrTheme.colors.lightGrey,
                                paddingHorizontal: 10,
                                fontSize: 20,
                                borderColor: mtrTheme.colors.mediumObject,
                                borderWidth: StyleSheet.hairlineWidth,
                                editable: authority,
                                color: mtrTheme.colors.darkText,
                                value: theMeeting?.notes,
                                capitalize: 'sentence',
                                autoCorrect: true,
                                marginHorizontal: 20,
                                placeholder: '',
                                style: { color: mtrTheme.colors.darkText },
                                fontWeight: '500',
                                letterSpacing: 0,
                                multiline: true,
                                minHeight: 50,
                                onChangeText: inputChangedHandler.bind(
                                    this,
                                    'notes'
                                ),
                            }}
                        />
                    </View>
                </View>
                <View style={{ color: mtrTheme.colors.lightGraphic }}>
                    <DateTimePickerModal
                        isVisible={modalMeetingDateVisible}
                        mode='date'
                        // date={dateValue || new Date()} // Set the initial date value
                        date={dateValue || getCurrentLocalDate()}
                        // const myLocalDate = formatInTimeZone(
                        //     today,
                        //     'America/New_York',
                        //     'yyyy-MM-dd HH:mm:ssXXX'
                        // ).toString();
                        display='inline'
                        dayTextStyle={mtrTheme.calendarText}
                        dateTextStyle={mtrTheme.calendarText}
                        textColor={mtrTheme.calendarText}
                        monthTextStyle={mtrTheme.calendarText}
                        yearTextStyle={mtrTheme.calendarText}
                        onConfirm={onMeetingDateConfirm}
                        onCancel={onMeetingDateCancel}
                    />
                </View>
                {isSavable && (
                    <View style={mtrTheme.buttonContainer}>
                        <CustomButton
                            text='SAVE'
                            bgColor={mtrTheme.colors.mediumGreen}
                            fgColor={mtrTheme.colors.lightText}
                            type='PRIMARY'
                            enabled={true}
                            onPress={() => handleFormSubmit()}
                        />
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
export default MeetingForm;
