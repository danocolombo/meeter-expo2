import { createSlice } from '@reduxjs/toolkit';
import { printObject } from '../../utils/helpers';
import { loadActiveOrg, initializeSystem } from './systemThunks';
const makeToday1 = () => {
    var d = new Date();
    const dminusone = d.toLocaleString(); //  M/DD/YYYY, H:MM:SS PM
    let datetime = dminusone.split(', '); // M/DD/YYYY
    const dateparts = datetime[0].split('/');
    const yr = dateparts[2];
    const mn = dateparts[0] < 10 ? '0' + dateparts[0] : dateparts[0];
    const da = dateparts[1] < 10 ? '0' + dateparts[1] : dateparts[1];
    const target = yr + mn + da;
    return target; // returns YYYYMMDD
};
const makeToday = () => {
    var data = new Date();
    // printObject('data', data);
    const yr = parseInt(data.getFullYear());
    let mo = parseInt(data.getMonth());
    const da = parseInt(data.getDate());
    const hr = parseInt(data.getHours());
    const mi = parseInt(data.getMinutes());
    //month and day lengths if applicable
    mo = mo + 1;
    const moFix = ('0' + mo.toString()).slice(-2);
    const daFix = ('0' + da.toString()).slice(-2);
    const target = yr.toString() + moFix + daFix;
    return target; //
};
let today = makeToday();
let AFF = {
    ownerEmail: 'dflt@init.com',
    code: 'DFLT',
    ownerContact: 'Affiliate Owner',
    label: 'DEFAULT',
    status: 'active',
    category: 'default',
    description: 'default desc. value',
    ownerPhone: '1234567890',
    title: 'Welcome...',
};

const initialState = {
    meeter: {
        appName: 'Meeter',
        region: 'us#east#dflt',
        eventRegion: 'test',
        stateProv: 'GA',
        affiliateTitle: 'MEETER',
        today: today,
        affiliation: 'DFLT',
        affiliate: AFF,
        userRole: '',
        isLoading: true,
    },
    isLoading: true,
    activeOrg: {},
};

export const systemSlice = createSlice({
    name: 'system',
    initialState,
    reducers: {
        updateAffiliation: (state, action) => {
            state.meeter.appName = action.payload.appName;
            state.meeter.region = action.payload.regions[0];
            state.meeter.eventRegion = action.payload.eventRegions[0];
            state.meeter.affiliateTitle = action.payload.title;
            state.meeter.affiliation = action.payload.value;
            state.meeter.userRole = action.payload.userRole;
            state.meeter.affiliate = action.payload;
            return state;
        },

        logout: (state) => {
            state.activeOrg = {};
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(initializeSystem.pending, (state) => {
                state.isLoading = true;
                state.meeter.isLoading = true;
            })
            .addCase(initializeSystem.fulfilled, (state, action) => {
                // Set a default state update for testing
                state.meeter.appName = action.payload.appName;
                state.meeter.region = action?.payload?.region || '';
                state.meeter.eventRegion = action?.payload?.eventRegion || '';
                state.meeter.affiliateTitle = action?.payload?.title || '';
                state.meeter.affiliation = action?.payload?.value || '';
                state.meeter.userRole = action?.payload?.userRole || '';
                state.meeter.isLoading = false;
                state.isLoading = false;
            })
            .addCase(initializeSystem.rejected, (state, action) => {
                state.isLoading = false;
                state.meeter.isLoading = false;
            })
            .addCase(loadActiveOrg.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loadActiveOrg.fulfilled, (state, action) => {
                // Set a default state update for testing
                state.activeOrg = action.payload;
                state.isLoading = false;
            })
            .addCase(loadActiveOrg.rejected, (state, action) => {
                state.isLoading = false;
            });
    },
});

// Action creators are generated for each case reducer function
export const {
    logout,

    updateAffiliation,
} = systemSlice.actions;

export default systemSlice.reducer;
