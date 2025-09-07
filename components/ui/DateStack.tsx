import theme from '@/assets/Colors';
import { MONTH_STRINGS } from '@/constants/meeter';
import { Text, View } from 'react-native';

const Colors = theme.colors;
//* ---------------------------------------
//* ANDROID display of date
//* ---------------------------------------
type DateStackProps = {
    date: string;
};

function DateStack({ date }: DateStackProps) {
    const Colors = theme.colors;
    let mo = '';
    let da = '';
    let yr = '';
    try {
        if (!date) {
            return null;
        }
        // Clean and parse the date string
        const refinedDate = date.replace(/\//g, '-').replace(/\s+/g, '');
        const parts = refinedDate.split('-');
        if (parts.length !== 3) {
            console.warn('Invalid date format:', date);
            return null;
        }
        yr = parts[0];
        mo = parts[1];
        da = parts[2];
        if (da.startsWith('0')) {
            da = da.substring(1);
        }
    } catch (error) {
        console.warn('Error parsing date:', error);
        return null;
    }
    // MONTH_STRINGS is 1-based (index 1 = JAN, index 9 = SEP)
    const monthIndex = parseInt(mo, 10);
    const monthName = MONTH_STRINGS[monthIndex] || 'Invalid';
    return (
        <View
            style={{
                backgroundColor: Colors.accent,
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 4,
                paddingHorizontal: 2,
                borderRadius: 8,
                minWidth: 60,
            }}
        >
            <View style={{ alignItems: 'center' }}>
                <Text
                    style={{
                        fontSize: 14,
                        color: Colors.darkText,
                        fontWeight: '500',
                    }}
                >
                    {monthName}
                </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
                <Text
                    style={{
                        fontSize: 24,
                        color: Colors.darkText,
                        fontWeight: 'bold',
                    }}
                >
                    {da}
                </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
                <Text
                    style={{
                        fontSize: 14,
                        color: Colors.darkText,
                        fontWeight: '500',
                    }}
                >
                    {yr}
                </Text>
            </View>
        </View>
    );
}

export default DateStack;

// ...existing code...
