import meetingsReducer from '@features/meetings/meetingsSlice';
import { configureStore } from '@reduxjs/toolkit';
// import teamReducer from '@features/team/teamSlice';
// import groupsReducer from '@features/groups/groupsSlice';
// import profilesReducer from '@features/profilesSlice';
// import systemReducer from '@features/system/systemSlice';
import userReducer from '@features/user/userSlice';

export const store = configureStore({
    reducer: {
        meetings: meetingsReducer,
        // profiles: profilesReducer,
        // system: systemReducer,
        // team: teamReducer,
        user: userReducer,
        // groups: groupsReducer,
    },
    devTools: true,
});
export type AppDispatch = typeof store.dispatch;
// export type RootState = ReturnType<typeof configureStore>;
export type RootState = ReturnType<typeof store.getState>;
