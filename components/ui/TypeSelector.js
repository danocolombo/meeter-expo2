import themedStyles from '@assets/Styles';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const TypeSelector = ({
    label,
    children,
    values,
    selectedValue,
    setSelectedValue,
    buttonUnselected,
}) => {
    return (
        <>
            <View style={{ padding: 10, flex: 1 }}>
                <View style={styles.row}>
                    {values.map((value) => (
                        <TouchableOpacity
                            key={value}
                            onPress={() => setSelectedValue(value)}
                            style={[
                                themedStyles.meetingTypeSelectorUnselected,
                                selectedValue === value &&
                                    themedStyles.meetingTypeSelectorSelected,
                            ]}
                        >
                            <Text
                                style={[
                                    themedStyles.meetingTypeSelectorUnselectedText,
                                    selectedValue === value &&
                                        themedStyles.meetingTypeSelectorSelectedText,
                                ]}
                            >
                                {value === 'Lesson'
                                    ? 'Lesson'
                                    : value === 'Testimony'
                                    ? 'Testimony'
                                    : 'Special'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        //flexWrap: "wrap",
    },
});

export default TypeSelector;
