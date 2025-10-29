export const selectCurrentMeeting = (state: any) =>
    state.meetings?.currentMeeting || {};

export const selectCurrentGroups = (state: any) =>
    (state.meetings?.currentMeeting?.groups as any[]) || [];
