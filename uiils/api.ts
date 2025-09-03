import { Affiliation, FullMeeting, Meeting, Person } from '@/types/interfaces';
const API_URL = process.env.EXPO_PUBLIC_JERICHO_ENDPOINT;
const API_TOKEN = process.env.EXPO_PUBLIC_JERICHO_API_TOKEN;

//      ########################################
//      PERSON, JERICHO AUTHORIZATION
//      ########################################
export const getPerson = async (id: string): Promise<Person> => {
    const response = await fetch(`${API_URL}/person/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_TOKEN}`,
        },
    });

    const json = await response.json();

    return json.data; // This is the array you want
};
export const getPersonBySub = async (id: string): Promise<Person> => {
    const response = await fetch(`${API_URL}/people/search?sub=${id}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_TOKEN}`,
        },
    });

    const json = await response.json();

    if (json.status === 200 && json.data && Array.isArray(json.data.data)) {
        return json.data.data[0];
    }
    return {
        id: '',
        first_name: '',
        last_name: '',
        email: '',
        created_at: '',
        updated_at: '',
        sub: '',
        username: '',
        phone: '',
        avatar: '',
        bio: '',
        organization_id: '',
        role: '',
        status: '',
        // Add any other required fields from the Person interface with default values
    };
};

//      ########################################
//      AFFILIATIONS
//      ########################################
export const getAffiliations = async (): Promise<Affiliation[]> => {
    const response = await fetch(`${API_URL}/affiliations`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_TOKEN}`,
        },
    });

    const json = await response.json();
    return json.data; // This is the array you want
};

export const getPersonAffiliations = async (id: string): Promise<Person> => {
    const response = await fetch(`${API_URL}/affiliations/person/${id}`);
    return response.json();
};

export const getOrganizationAffiliations = async (
    id: string
): Promise<Product> => {
    const response = await fetch(`${API_URL}/affiliations/organization/${id}`);
    return response.json();
};

//      ########################################
//      MEETINGS
//      ########################################
export const getActiveMeetings = async (id: string): Promise<Meeting[]> => {
    const response = await fetch(
        `${API_URL}/meetings/${id}?active=2025-08-30`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_TOKEN}`,
            },
        }
    );

    const json = await response.json();

    if (json.status === 200 && json.data && Array.isArray(json.data.data)) {
        return json.data.data;
    }
    // Return a default Meeting object with all required properties
    return [
        {
            id: '',
            meeting_date: '',
            title: '',
            meeting_type: '',
            mtg_comp_key: '',
            announcements_contact: '',
            attendance_count: 0,
            av_contact: '',
            cafe_contact: '',
            cafe_count: 0,
            children_contact: '',
            children_count: 0,
            cleanup_contact: '',
            closing_contact: '',
            donations: 0,
            facilitator_contact: '',
            greeter_contact1: '',
            greeter_contact2: '',
            meal: '',
            meal_contact: '',
            meal_count: 0,
            newcomers_count: '',
            notes: '',
            nursery_contact: '',
            nursery_count: 0,
            resource_contact: 0,
            security_contact: '',
            setup_contact: '',
            support_contact: '',
            transportation_contact: '',
            transportation_count: 0,
            worship: '',
            youth_contact: '',
            youth_count: 0,
            organization_id: '',
        },
    ];
};
//      ########################################
//      GET A MEETING
//      ########################################
export const getAMeeting = async (
    org_id: string,
    meeting_id: string
): Promise<FullMeeting> => {
    const response = await fetch(`${API_URL}/meeting/${org_id}/${meeting_id}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_TOKEN}`,
        },
    });

    const json = await response.json();
    //* ***********************************
    //* THIS WILL RETURN A MEETING WITH
    //* GROUPS ARRAY
    //* ***********************************

    if (json.status === 200 && json.data) {
        console.log('FullMeeting data:\n', json.data); // Debug log to inspect the data structure
        return json.data;
    }
    // Return a default Meeting object with all required properties
    return [
        {
            id: '',
            meeting_date: '',
            title: '',
            meeting_type: '',
            mtg_comp_key: '',
            announcements_contact: '',
            attendance_count: 0,
            av_contact: '',
            cafe_contact: '',
            cafe_count: 0,
            children_contact: '',
            children_count: 0,
            cleanup_contact: '',
            closing_contact: '',
            donations: 0,
            facilitator_contact: '',
            greeter_contact1: '',
            greeter_contact2: '',
            groups: [],
            meal: '',
            meal_contact: '',
            meal_count: 0,
            newcomers_count: '',
            notes: '',
            nursery_contact: '',
            nursery_count: 0,
            resource_contact: 0,
            security_contact: '',
            setup_contact: '',
            support_contact: '',
            transportation_contact: '',
            transportation_count: 0,
            worship: '',
            youth_contact: '',
            youth_count: 0,
            organization_id: '',
        },
    ];
};
