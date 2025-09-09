import { createAction, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { printObject } from '../utils/helpers';

const initialState = {
    allProfiles: [],
    leaders: [],
    guests: [],
    isLoading: false,
};
export const getProfiles = createAsyncThunk(
    'profiles/getProfiles',
    async (_, thunkAPI) => {
        try {
            // we get the data here but will simulate for now
            const profiles = [
                { id: '23323-2323-888', name: 'One Thing', role: 'guest' },
                { id: '23323-2323-222', name: 'Two Thing', role: 'lead' },
                { id: '23323-2323-111', name: 'Three Thing', role: 'regp' },
                { id: '23323-2323-212', name: 'Four Thing', role: 'guest' },
            ];
            return profiles;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                'PS:16-->>> something went wrong in createAsyncThunk'
            );
        }
    }
);
export const profilesSlice = createSlice({
    name: 'profiles',
    initialState,
    reducers: {
        loadProfiles: (state, action) => {
            // state.publicRallies = action.payload;
            state.allProfiles = action.payload;
            return state;
        },
        updateProfile: (state, action) => {
            const updates = state.allProfiles.map((pro) => {
                if (pro.uid === action.payload.uid) {
                    return action.payload;
                } else {
                    return pro;
                }
            });
            state.allProfiles = updates;
            return state;
        },
        updateAndMoveProfile: (state, action) => {
            // printObject('action', action);
            if (action.payload.target === 'rep') {
                const reducedGuests = state.guests.filter(
                    (g) => g.uid !== action.payload.newProfile.uid
                );
                state.guests = reducedGuests;
                const before = state.leaders;
                const newProfile = action.payload.newProfile;
                before.push(newProfile);
                state.leaders = before;
            } else {
                const reducedLeaders = state.leaders.filter(
                    (l) => l.uid !== action.payload.newProfile.uid
                );
                state.leaders = reducedLeaders;

                const before = state.guests;
                const newProfile = action.payload.newProfile;
                before.push(newProfile);
                state.guests = before;
            }
        },
        loadLeaders: (state, action) => {
            state.leaders = action.payload;
            return state;
        },
        loadGuests: (state, action) => {
            state.guests = action.payload;
            return state;
        },
        clearLeadersAndGuests: (state) => {
            state.leaders = [];
            state.guests = [];
        },
        logout: (state) => {
            state.allProfiles = [];
            state.leaders = [];
            state.guests = [];
            return state;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getProfiles.pending, (state) => {
            state.isLoading = true;
        }),
            builder.addCase(getProfiles.fulfilled, (state) => {
                state.isLoading = false;
                state.allProfiles = action.payload;
            }),
            builder.addCase(getProfiles.rejected, (state) => {
                console.log(action);
                state.isLoading = false;
            });
    },
});

// Action creators are generated for each case reducer function
export const {
    clearLeadersAndGuests,
    loadGuests,
    loadLeaders,
    loadProfiles,
    updateProfile,
    updateAndMoveProfile,
    logout,
} = profilesSlice.actions;

export default profilesSlice.reducer;
