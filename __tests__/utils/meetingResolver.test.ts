import resolveMeeting from '@utils/meetingResolver';

// Use `as any` in tests to avoid constructing full FullMeeting shape
const sampleMeeting = {
    id: 'm1',
    meeting_date: '2025-10-23',
    meeting_type: 'regular',
    title: 'Test Meeting',
    organization_id: 'org1',
    groups: [],
    attendance_count: 0,
    meal: null,
    meal_contact: null,
    newcomers_count: 0,
    notes: '',
};

describe('resolveMeeting helper', () => {
    it('resolves from route param when present and ids match', () => {
        const param = JSON.stringify(sampleMeeting);
        const selector = (_: string) => null;
        const result = resolveMeeting('m1', param, selector);
        expect(result).toEqual(sampleMeeting);
    });

    it('falls back to selector when route param absent', () => {
        const selector = (id: string) =>
            id === 'm1' ? (sampleMeeting as any) : null;
        const result = resolveMeeting('m1', undefined, selector as any);
        expect(result).toEqual(sampleMeeting);
    });

    it('returns null when neither param nor store provide meeting', () => {
        const selector = (_: string) => null;
        const result = resolveMeeting('m1', undefined, selector as any);
        expect(result).toBeNull();
    });

    it('returns null when param parsing fails and selector returns null', () => {
        const selector = (_: string) => null;
        const result = resolveMeeting('m1', '{bad json', selector as any);
        expect(result).toBeNull();
    });
});
