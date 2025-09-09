// subscriptionHandlers.js
import { API, graphqlOperation } from 'aws-amplify';
import {
    onCreateMeetingForOrg,
    onCreateMeeting,
} from '../../graphql/subscriptions';
import { addSubscribeMeeting } from './meetingsSlice';
import { printObject } from '../../utils/helpers';

export const subscribeToMeetingCreation = (orgId, dispatch) => {
    try {
        const subscription = API.graphql(graphqlOperation(onCreateMeeting));
        printObject('MS:12-->subscription:\n', subscription);
        subscription.subscribe({
            next: (event) => {
                const newMeetingForOrg = event.value.data.onCreateMeetingForOrg;
                dispatch(addSubscribeMeeting(newMeetingForOrg));
            },
            error: (error) => {
                console.error('Subscription error:', error);
            },
        });

        // Return the subscription to be used for unsubscribing
        return subscription;
    } catch (error) {
        printObject('MS:27-->catch error:\n', error);
    }
};

export const unsubscribeFromMeetingCreation = (subscription) => async () => {
    subscription.unsubscribe(); // Unsubscribe from the subscription
};
