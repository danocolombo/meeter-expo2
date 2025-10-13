import theme from './Colors';
const themedStyles = {
    container: {
        flex: 1,
        flexDirection: 'column' as 'column',
        backgroundColor: theme.colors.primaryBackground,
    },
    containerContents: {
        paddingTop: 20,
        paddingHorizontal: 10,
    },
    // Add the additional styles needed for MeetingFormScreen
    keyboardAvoiding: {
        flex: 1,
    },
    formLabels: {
        fontFamily: 'Roboto-Bold',
        fontSize: 20,
        color: theme.colors.lightText,
        paddingVertical: 5,
    },
    meetingSelectorWrapper: {
        flexDirection: 'row' as 'row',
        borderWidth: 2,
        borderColor: theme.colors.darkText, // Use the darkText variable directly, same as darkGraphic',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        backgroundColor: theme.colors.white,
        marginTop: 5,
        paddingVertical: 5,
        marginHorizontal: 10,
        borderRadius: 5,
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
};

export default themedStyles;
