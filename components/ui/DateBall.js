import theme from '@assets/Colors';
import { StyleSheet, Text, View } from 'react-native';
import { MONTH_STRINGS } from '../../constants/meeter';
const DateBall = ({ date }) => {
    if (!date) {
        return null;
    }
    // printObject('DB:12 - ��� IN ���� - DateBall (date)\n', date);
    function formatDate(date) {
        // Check if date is a Date object
        if (date instanceof Date) {
            // console.log('DB:16--IF: dateType date:', typeof date);
            // console.log('DB:17-->date:', date);
            // Use local time methods instead of UTC to preserve timezone
            const year = date.getFullYear().toString().padStart(4, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            // console.log('type of date...', typeof date);
            // console.log('🗓️🗓️🗓️🗓️ year:>' + year + '<');
            // console.log('🗓️🗓️🗓️🗓️ month:>' + month + '<');
            // console.log('🗓️🗓️🗓️🗓️ day:>' + day + '<');
            return `${year}-${month}-${day}`;
        } else if (typeof date === 'string') {
            // console.log('DB:32--ELSE: dateType date:', typeof date);
            // console.log('DB:33-->date:', date);
            // Extract the date part, ignoring any trailing time information
            const dateWithoutTime = date.split(' ').shift(); // Remove everything after first space
            // Check if the date part is in YYYY-MM-DD format
            if (dateWithoutTime.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return dateWithoutTime;
            }
        }
        return null; // Return null for invalid input
    }
    let dateStringToUse = formatDate(date);

    // strip time off variable
    // const dateToUse = date.toString().slice(0, 10);
    //get dateParts
    if (!dateStringToUse) {
        console.log('date value:', date);
        console.log('type:', typeof date);
        return null;
    }
    const dateParts = dateStringToUse.split('-');
    const year = dateParts[0];
    const month = MONTH_STRINGS[parseInt(dateParts[1])];
    const day = dateParts[2];

    return (
        <View>
            <View style={styles.dateChipContainer}>
                <View style={styles.monthContainer}>
                    <Text style={styles.dateChipNonDayText}>{month}</Text>
                </View>
                <View style={styles.dayContainer}>
                    <Text style={styles.dateChipDayText}>{day}</Text>
                </View>
                <View style={styles.yearContainer}>
                    <Text style={styles.dateChipNonDayText}>{year}</Text>
                </View>
            </View>
        </View>
    );
};

export default DateBall;

const styles = StyleSheet.create({
    dateChipContainer: {
        height: 80,
        width: 80,
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
        borderRadius: 20,
    },
    dateChipNonDayText: {
        color: theme.colors.darkText,
    },
    dateChipDayText: {
        color: theme.colors.darkText,
        fontSize: 28,
        fontWeight: '700',
    },
});
