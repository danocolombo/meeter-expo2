import meetingsReducer from '@features/meetings/meetingsSlice';
import { configureStore } from '@reduxjs/toolkit';
// import teamReducer from '@features/team/teamSlice';
// import groupsReducer from '@features/groups/groupsSlice';
// import profilesReducer from '@features/profilesSlice';
// import systemReducer from '@features/system/systemSlice';
// import userReducer from '@features/user/userSlice';
export type RootState = ReturnType<typeof configureStore>;

export const store = configureStore({
    reducer: {
        meetings: meetingsReducer,
        // profiles: profilesReducer,
        // system: systemReducer,
        // team: teamReducer,
        // user: userReducer,
        // groups: groupsReducer,
    },
    devTools: true,
});
