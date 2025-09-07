import theme from '@/assets/Colors';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const Selectors = ({
    label,
    children,
    values,
    selectedValue,
    setSelectedValue,
    buttonUnselected,
}) => {
    const Colors = theme.colors;
    const bUnselected = {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        backgroundColor: Colors.unSelected,
        alignSelf: 'flex-start' as const,
        marginHorizontal: 4, // replace '1%' with a number (e.g., 4)
        marginBottom: 0,
        minWidth: 80, // replace '30%' with a number (e.g., 80)
        textAlign: 'center' as const,
    };
    const tUnselected = {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.unSelectedText,
        textAlign: 'center',
    };
    const bSelected = {
        backgroundColor: Colors.accent,
        borderWidth: 0,
    };
    const tSelected = {
        color: Colors.selectedText,
    };
    return (
        <>
            <View style={{ flex: 1 }}>
                <View style={styles.row}>
                    {values.map((value) => (
                        <TouchableOpacity
                            key={value}
                            onPress={() => setSelectedValue(value)}
                            style={[
                                bUnselected,
                                selectedValue === value && bSelected,
                            ]}
                        >
                            <Text
                                style={[
                                    tUnselected,
                                    selectedValue === value && tSelected,
                                ]}
                            >
                                {value === 'f'
                                    ? 'Women'
                                    : value === 'm'
                                    ? 'Men'
                                    : 'Mixed'}
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
        justifyContent: 'center',
        //flexWrap: "wrap",
    },
});

export default Selectors;
