import theme from './Colors';
const themedStyles = {
    container: {
        flex: 1,
        flexDirection: 'column' as 'column',
        backgroundColor: theme.colors.primaryBackground,
    },
    surface: {
        flex: 1,
        flexDirection: 'column' as 'column',
        backgroundColor: theme.colors.primaryBackground,
        paddingVertical: 16,
    },
    containerContents: {
        paddingTop: 20,
        paddingHorizontal: 10,
    },
    calendarText: {
        color: theme.colors.darkText,
    },
    // Add the additional styles needed for MeetingFormScreen
    keyboardAvoiding: {
        flex: 1,
    },
    firstRow: {
        flexDirection: 'row' as 'row',
        alignItems: 'center' as 'center',
        marginVertical: 0,
        marginHorizontal: 10,
    },
    row1col2: {
        flexDirection: 'column' as 'column',
        marginLeft: 5,
        marginRight: 10,
    },
    textColumn: {
        alignContent: 'flex-start' as 'flex-start',
    },
    formLabels: {
        fontFamily: 'Roboto-Bold',
        fontSize: 20,
        color: theme.colors.lightText,
        paddingVertical: 5,
    },
    dateContainer: { margin: 5 },
    meetingSelectorContainer: {
        flex: 1,
        alignItems: 'center' as 'center',
        justifyContent: 'center' as 'center',
        marginBottom: 10,
    },
    meetingSelectorWrapper: {
        flexDirection: 'row' as 'row',
        borderWidth: 2,
        borderColor: theme.colors.darkText, // Use the darkText variable directly, same as darkGraphic',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        backgroundColor: theme.colors.lightGraphic,
        // marginTop: 5,
        paddingVertical: 5,
        marginHorizontal: 10,
    },
    meetingTypeSelectorUnselected: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        backgroundColor: theme.colors.unSelected,
        alignSelf: 'flex-start' as 'flex-start',
        marginHorizontal: '1%',
        minWidth: '30%',
        textAlign: 'center' as 'center',
    },
    meetingTypeSelectorUnselectedText: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.unSelectedText,
        textAlign: 'center' as 'center',
    },
    meetingTypeSelectorSelected: {
        backgroundColor: theme.colors.accent,
        borderWidth: 0,
    },
    meetingTypeSelectorSelectedText: {
        color: theme.colors.darkText,
    },
    logisticsWrapper: {
        flexDirection: 'row' as 'row',
        borderWidth: 2,
        borderColor: theme.colors.darkText, // Use the darkText variable directly, same as darkGraphic',
        borderRadius: 5,
        backgroundColor: theme.colors.white,
        paddingVertical: 5,
        marginHorizontal: 10,
    },
    mealWrapper: {
        flexDirection: 'row' as 'row',
        borderWidth: 2,
        borderColor: theme.colors.darkText, // Use the darkText variable directly, same as darkGraphic',
        borderRadius: 5,
        backgroundColor: theme.colors.white,
        marginVertical: 0,
        paddingVertical: 5,
        marginHorizontal: 10,
    },
    mealSectionContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: theme.colors.darkText,
        borderRadius: 10,
        padding: 5,
        marginHorizontal: 10,
        marginVertical: 5,
    },
    mealSectionTitleText: {
        fontFamily: 'Roboto-Regular',
        color: theme.colors.darkText,
        fontSize: 20,
    },
    mealSectionInputLabel: {
        fontFamily: 'Roboto-Regular',
        color: theme.colors.darkText,
        fontSize: 18,
        marginLeft: 10,
    },
    mealSectionCountLabelContainer: {
        paddingTop: 5,
        alignItems: 'center',
    },
    mealSectionCountLabelText: {
        fontFamily: 'Roboto-Regular',
        color: theme.colors.darkText,
        fontSize: 18,
        textAlign: 'center',
    },
};

export default themedStyles;
