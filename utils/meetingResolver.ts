import { FullMeeting } from '../types/interfaces';

export type MeetingSelector = (id: string) => FullMeeting | null | undefined;

/**
 * Resolve a meeting object from either a serialized route param or the store selector.
 * Returns the meeting object or null if nothing found or parsing fails.
 */
export function resolveMeeting(
    id: string | undefined,
    routeMeetingParam: string | undefined,
    selectMeetingById: MeetingSelector
): FullMeeting | null {
    if (!id) return null;

    // If caller passed a serialized meeting object in route params, prefer that.
    if (routeMeetingParam) {
        try {
            const parsed = JSON.parse(routeMeetingParam) as FullMeeting;
            if (parsed && parsed.id === id) return parsed;
            // If parsed id doesn't match, fall through to selector
        } catch {
            // ignore parse errors and fall back to selector
        }
    }

    const fromStore = selectMeetingById(id);
    return fromStore ?? null;
}

export default resolveMeeting;
