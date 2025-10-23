import { PHONE_REGX } from '@constants/meeter';
import { format } from 'date-fns';
import * as Crypto from 'expo-crypto';
import { UserProfile } from '../types/interfaces';

////import { format } from 'date-fns';

const SHORT_MONTH: Record<number, string> = {
    1: 'Jan',
    2: 'Feb',
    3: 'Mar',
    4: 'Apr',
    5: 'May',
    6: 'Jun',
    7: 'Jul',
    8: 'Aug',
    9: 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Dec',
};
export function dateIsBeforeToday(testDate: string): boolean {
    // let testDate = '2022-01-15';

    let target = testDate.split('-');

    let tYear = parseInt(target[0]);
    // return true;
    const tMonth = parseInt(target[1], 10);
    const tDay = parseInt(target[2], 10);

    const todayDate = new Date().toISOString().slice(0, 10);
    const standard = todayDate.toString().split('-');
    const sYear = parseInt(standard[0], 10);
    const sMonth = parseInt(standard[1], 10);
    const sDay = parseInt(standard[2], 10);
    let results = false;
    if (tYear < sYear) {
        results = true;
    } else if (tYear === sYear && tMonth < sMonth) {
        results = true;
    } else if (tYear === sYear && tMonth === sMonth && tDay < sDay) {
        results = true;
    } else {
        results = false;
    }
    return results;
}
export function createAWSUniqueID(): string {
    // this returns a unique value for use as AWS ID
    // example:  eca1dda7-f6d3-4b0c-8c5d-716da1cafaa8
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return (
        s4() +
        s4() +
        '-' +
        s4() +
        '-' +
        s4() +
        '-' +
        s4() +
        '-' +
        s4() +
        s4() +
        s4()
    );
}
export function createNewUniqueID(): string {
    // this returns a unique value for use as AWS ID
    // example:  eca1dda7-f6d3-4b0c-8c5d-716da1cafaa8
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return (
        s4() +
        s4() +
        '-' +
        s4() +
        '-' +
        s4() +
        '-' +
        s4() +
        '-' +
        s4() +
        s4() +
        s4()
    );
}
export async function getUniqueId(): Promise<string> {
    const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        new Date().toString() + Math.random().toString()
    );
    return digest;
}
export function getToday(): string {
    let d = new Date();
    //- this was in the function originally, but it does not give today
    // d.setDate(d.getDate() - 1); // date - one
    const dminusone = d.toLocaleString(); //  M/DD/YYYY, H:MM:SS PM

    let datetime = dminusone.split(', '); // M/DD/YYYY
    const dateparts = datetime[0].split('/');
    const yr = dateparts[2];
    const mn = Number(dateparts[0]) < 10 ? '0' + dateparts[0] : dateparts[0];
    const da = dateparts[1];
    const target = yr + '-' + mn + '-' + da;
    return target;
}
// export function printObject(label, target) {
//     const util = require('util');
//     console.log(
//         label,
//         ':  \n' +
//             util.inspect(target, {
//                 showHidden: false,
//                 depth: null,
//             })
//     );
// }
export function printObject(label: string, target: unknown): void {
    console.log(label, JSON.stringify(target, null, 2));
}

export const CONFIG = {
    headers: {
        'Content-type': 'application/json; charset=UTF-8',
    },
};
export function checkPatePhoneValue(patePhone: string): boolean {
    if (!patePhone) return false;
    if (patePhone.length !== 10) {
        return false;
    }
    return !isNaN(Number(patePhone));
}
export function getPhoneType(patePhone: string): 'PATE' | 'MASKED' | null {
    // this returns true if patePhone is in format of "(123) 233-3232"
    let result = patePhone.match(PHONE_REGX);
    if (result) return patePhone.length === 10 ? 'PATE' : 'MASKED';
    return null;
}
export function transformPatePhone(patePhone: string | null): string | null {
    // we take patePhone 1234567890 and return (123) 456-7890
    if (!patePhone) return null;
    if (isNaN(Number(patePhone))) return null;
    const p1 = patePhone.substring(0, 3);
    const p2 = patePhone.substring(3, 6);
    const p3 = patePhone.substring(6);
    return `(${p1}) ${p2}-${p3}`;
}
export function createPatePhone(inputPhone: string): string | null {
    // we expect (208) 424-2494 need 2084242494
    // if (inputPhone.length > 0) {
    //     let result = inputPhone.match(PHONE_REGX);
    //     if (result === null) {
    //         return null;
    //     }
    // } else {
    //     return null;
    // }
    if (!inputPhone || inputPhone.length < 1) return null;
    const p1 = inputPhone.substring(1, 4);
    const p2 = inputPhone.substring(6, 9);
    const p3 = inputPhone.substring(10);
    // console.log('p1', p1);
    // console.log('p2', p2);
    // console.log('p3', p3);
    let patePhone = p1 + p2 + p3;
    return patePhone;
}
export function createMtgCompKey(client: string, meetingDate: string): string {
    const mtgCompKey = `${client}#${meetingDate.substring(
        0,
        4
    )}#${meetingDate.substring(5, 7)}#${meetingDate.substring(8, 10)}`;
    return mtgCompKey;
}
export function capitalize(
    textString: string | null | undefined
): string | null {
    if (!textString) return null;
    const lower = textString.toLowerCase();
    const upper = lower.charAt(0).toUpperCase();
    return upper + lower.slice(1);
}
export function createGrpCompKey(client: string, meetingId: string): string {
    return `${client}#${meetingId}`;
}
export async function asc_sort(
    a: { eventDate: string },
    b: { eventDate: string }
): Promise<number> {
    return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
}
export async function desc_sort(
    a: { eventDate: string },
    b: { eventDate: string }
): Promise<number> {
    return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
}
export async function desc_sort_raw(
    a: { eventDate: number },
    b: { eventDate: number }
): Promise<number> {
    return b.eventDate - a.eventDate;
}
export async function asc_sort_raw(
    a: { eventDate: number },
    b: { eventDate: number }
): Promise<number> {
    return a.eventDate - b.eventDate;
}
export function getFormattedDate(date?: Date | null): string | null {
    if (!date) return null;
    return date.toISOString().slice(0, 10);
}
export function dateNumToJSDate(dateNum?: string | null): Date | null {
    // YYYYMMDD to JSDate
    if (!dateNum) {
        return null;
    }
    if (!dateNum || dateNum.length < 8) {
        return null;
    }
    const year = +dateNum.substring(0, 4);
    const month = +dateNum.substring(4, 6);
    const day = +dateNum.substring(6, 8);
    const javaScriptDate = new Date(year, month - 1, day);
    return javaScriptDate;
}

export function dateNumsToLongDayLongMondayDay(
    dateNum?: string | null
): string | null {
    if (!dateNum) return null;
    const convDate = dateNumToJSDate(dateNum);
    if (!convDate) return null;
    const result = format(convDate, 'EEEE, LLLL do');
    return result;
}
export function dateNumToDateDash(dateNum?: string | null): string {
    // converts YYYYMMDD to YYYY-MM-DD
    if (!dateNum) return '';
    if (dateNum.length !== 8) {
        return '';
    }
    const y = dateNum.substr(0, 4);
    const m = dateNum.substr(4, 2);
    const d = dateNum.substr(6);
    const returnValue = y + '-' + m + '-' + d;
    return returnValue;
}
export function getDateMinusDays(date: Date, days: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - days);
}
export function subtractMonths(
    numOfMonths: number,
    date: Date = new Date()
): Date {
    date.setMonth(date.getMonth() - numOfMonths);
    return date;
}
export function dateDashToDateObject(dateDash?: string | null): Date | null {
    if (!dateDash) return null;
    const dashPos = dateDash.indexOf('-');
    if (dashPos === -1) return null;
    const datePart = dateDash.split('-');
    const newDate = new Date(
        Number(datePart[0]),
        Number(datePart[1]) - 1,
        Number(datePart[2])
    );
    return newDate;
}
export function dateObjectToDashDate(dateString: string | Date): string {
    const date =
        typeof dateString === 'string' ? new Date(dateString) : dateString;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so we add 1 and padStart to ensure two digits
    const day = String(date.getDate()).padStart(2, '0'); // Pad day with zero to ensure two digits

    return `${year}-${month}-${day}`;
}

export function dateDashMadePretty(dateDash?: string | null): string | null {
    if (!dateDash) return null;
    const dashPos = dateDash.indexOf('-');
    if (dashPos === -1) return null;
    const datePart = dateDash.split('-');
    const newDate = new Date(
        Number(datePart[0]),
        Number(datePart[1]) - 1,
        Number(datePart[2])
    );
    return newDate.toDateString();
}
export function isDateDashBeforeToday(
    dateDash?: string | null
): boolean | null {
    // uses dashDate yyyy-mm-dd
    //check if we have any dashes
    if (!dateDash) {
        return null;
    }
    let dashPos = dateDash.indexOf('-');
    if (dashPos === -1) {
        return null;
    }
    const datePart = dateDash.split('-');
    // parse numbers safely
    const mo = Number(datePart[1]) - 1;
    const mDate = new Date(Number(datePart[0]), mo, Number(datePart[2]));
    const testDate = new Date(mDate.toDateString());
    return testDate < new Date(new Date().toDateString());
}

export function dateNumToDisplayTime(numTime?: string | null): string {
    if (!numTime) return '';
    // 1330 or 13:30 to 1:30 PM
    let A = '';
    let B = '';
    let confirmedValue: string = '';
    // the length of numTime can only be 4 or 5 characters, if not return ""
    if (numTime.length < 4 || numTime.length > 5) {
        console.log('1');
        return '';
    }
    if (numTime.length === 4) {
        const colon = numTime.indexOf(':');
        if (colon === -1) {
            //no colon, split the numbers and stick colon in.
            A = numTime.substr(0, 2);
            B = numTime.substr(2);
            let returnValue = A + ':' + B;
            confirmedValue = returnValue;
        } else {
            let parts = numTime.split(':');
            let returnValue = parts[0] + ':' + parts[1];
            confirmedValue = returnValue;
        }
    } else if (numTime.length === 5) {
        const colon = numTime.indexOf(':');
        if (colon === -1) {
            return '';
        } else {
            confirmedValue = numTime;
        }
    }
    const timeParts = confirmedValue.split(':');
    // Get the hours of 29 February 2012 11:45:00:
    const result = new Date(
        2012,
        1,
        29,
        Number(timeParts[0]),
        Number(timeParts[1])
    );
    const returnTime = format(result, 'h:mm a');
    return returnTime || '';
}
export function getPateDate(dateTimeNumber: Date | string | number): string {
    // takes dateStamp and returns YYYYMMDD
    // this gets the time dateStamp and returns P8 date string "YYYYMMDD"
    let inputDate = new Date(dateTimeNumber);

    const yr = String(inputDate.getFullYear());
    let mo = String(inputDate.getMonth() + 1);
    let da = String(inputDate.getDate());
    // now see if we need to add zero to month
    if (Number(mo) < 10) mo = '0' + mo;
    // now see if we need to add zero to day of month
    if (Number(da) < 10) da = '0' + da;
    let returnValue = yr + mo + da;
    return returnValue;
}
export function getPateTime(dateTimeNumber: Date | string | number): string {
    // dateTimeStamp to 1230
    let inputDate = new Date(dateTimeNumber);
    let h = String(inputDate.getHours());
    let m = String(inputDate.getMinutes());
    //add zeros if necessary
    if (Number(h) < 10) h = '0' + h;
    if (Number(m) < 10) m = '0' + m;
    let returnValue = h + m;
    return returnValue;
}
export function pateDateToSpinner(pDate: string): Date {
    // this takes in pateDate (YYYYMMDD) and returns Date object
    // break apart
    const m = pDate.substring(4, 6);
    const d = pDate.substring(6);
    const date = new Date(
        Number(pDate.substring(0, 4)),
        Number(m) - 1,
        Number(d)
    );
    return date;
}
export function pateDateToShortMonthDay(pDate: string): string {
    const m = pDate.substring(4, 6);
    const d = pDate.substring(6);
    const moName = SHORT_MONTH[Number(m)];
    return `${moName} ${d}`;
}
export function convertPateDate(pDate: string): string {
    // break apart
    const y = Number(pDate.substring(0, 4));
    const m = Number(pDate.substring(4, 6));
    const d = Number(pDate.substring(6));
    const date = new Date(y, m - 1, d);
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };
    const returnValue = date.toLocaleDateString('en-us', options);
    return returnValue;
}
export function convertPateTime(pTime: string): string {
    //break apart, always 2 digits and 2 digits
    let ho = pTime.substring(0, 2);
    let mi = pTime.substring(2);
    //determine if AM or PM
    let half = 'AM';
    if (parseInt(ho) < 12) {
        half = 'AM';
    } else {
        half = 'PM';
    }
    const hourNum = Number(ho);
    const displayHour = hourNum < 13 ? String(hourNum) : String(hourNum - 12);
    return `${displayHour}:${mi} ${half}`;
}
export function pateTimeToSpinner(pDate: string, pTime: string): Date {
    // this takes pDate and pTime and returns date object
    const y = Number(pDate.substring(0, 4));
    const m = Number(pDate.substring(4, 6));
    const d = Number(pDate.substring(6));
    const date = new Date(y, m - 1, d);

    //break apart, always 2 digits and 2 digits
    const ho = Number(pTime.substring(0, 2));
    const mi = Number(pTime.substring(3));
    date.setHours(ho);
    date.setMinutes(mi);
    return date;
}
export function todayMinus60(): Date {
    const now = new Date();
    const copy = new Date(now.getTime());
    copy.setDate(copy.getDate() - 60);
    return copy;
}
function s4(): string {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

export function createUniqueID(): string {
    return (
        s4() +
        s4() +
        '-' +
        s4() +
        '-' +
        s4() +
        '-' +
        s4() +
        '-' +
        s4() +
        s4() +
        s4()
    );
}
export const getMonthFromCode = (mo: string | number): string => {
    const monthMap: Record<string, string> = {
        '01': 'JAN',
        '02': 'FEB',
        '03': 'MAR',
        '04': 'APR',
        '05': 'MAY',
        '06': 'JUN',
        '07': 'JUL',
        '08': 'AUG',
        '09': 'SEP',
        10: 'OCT',
        11: 'NOV',
        12: 'DEC',
    };

    return monthMap[String(mo)] || 'INVALID_MONTH'; // Handle invalid input gracefully
};
export function incrementStringNumber(stringNumber: string): string | null {
    // Convert the string to a number using parseInt
    const number = parseInt(stringNumber, 10);

    // Check if conversion was successful (returns NaN if not a number)
    if (isNaN(number)) return null;

    // Increment the number
    const incrementedNumber = number + 1;

    // Convert the incremented number back to a string
    return incrementedNumber.toString();
}

/**
 * Creates a Date object representing the current local time
 * instead of UTC. This ensures the date shows the user's
 * local timezone rather than tomorrow's date in UTC.
 * @returns {Date} - Current date in user's local timezone
 */
export function getCurrentLocalDate() {
    const now = new Date();
    // Adjust for timezone offset to get local date
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate;
}

/**
 * Formats a local date to YYYY-MM-DD string format
 * @param {Date | null} date - Date object (optional, defaults to current local date)
 * @returns {string} - Date in YYYY-MM-DD format
 */
export function getCurrentLocalDateString(date: Date | null = null): string {
    const localDate = date || new Date(); // Use regular new Date() for local time
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Gets the user profile passed in and evaluates the affiliations for
 * the activeOrg, returning an array of permissions/roles in the
 * userProfile passed in
 */

export function getPermissionsForActiveOrg(profile: UserProfile): string[] {
    if (!profile?.activeOrg?.id) return [];
    const orgId = profile.activeOrg.id;

    // affiliations may come in multiple shapes depending on payload:
    // - an array: profile.affiliations = [{ organizationId, role, status, ... }, ...]
    // - a wrapper: profile.affiliations = { items: [...] }
    // normalize to an array
    const rawAffs: any = (profile as any).affiliations;
    const affiliationsArr: any[] = Array.isArray(rawAffs)
        ? rawAffs
        : Array.isArray(rawAffs?.items)
        ? rawAffs.items
        : [];

    const roles = affiliationsArr
        .filter((aff) => {
            if (!aff) return false;
            const affOrgId = aff.organizationId ?? aff.organization?.id ?? null;
            const affStatus = aff.status ?? null;
            return affOrgId === orgId && affStatus === 'active';
        })
        .map((aff) => String(aff.role))
        .filter(Boolean);

    // dedupe and sort for stable output
    const unique = Array.from(new Set(roles)).sort((a, b) =>
        a.localeCompare(b)
    );
    return unique;
}

/**
 * Normalize a permissions value into a string[].
 * Accepts: undefined, null, string (comma-separated), string[] and returns a
 * stable array (possibly empty). This is useful before calling .includes()
 * in UI code.
 */
export function normalizePermissions(
    input?: string[] | string | null
): string[] {
    if (!input) return [];
    if (Array.isArray(input)) return input.filter(Boolean).map(String);
    // it's a string
    if (typeof input === 'string') {
        // split on commas and trim
        return input
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
    }
    return [];
}
