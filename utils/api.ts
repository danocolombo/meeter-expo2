import {
    Affiliation,
    FullGroup,
    FullMeeting,
    Meeting,
    Person,
} from '../types/interfaces';
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
        created_at: '',
        updated_at: '',
        sub: '',
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        shirt: '',
        birthday: '',
        picture: '',
        default_org_id: '',
        location_id: '',
        aws_id: '',
        aws_def_org_id: '',
        aws_location_id: '',
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
): Promise<Affiliation[]> => {
    const response = await fetch(`${API_URL}/affiliations/organization/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_TOKEN}`,
        },
    });
    const json = await response.json();
    if (json?.status === 200 && Array.isArray(json.data)) return json.data;
    return [];
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
            newcomers_count: 0,
            notes: '',
            nursery_contact: '',
            nursery_count: 0,
            resource_contact: '',
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
    // Debug: show arguments and constructed API path
    console.log(
        '[getAMeeting] Called with org_id:',
        org_id,
        'meeting_id:',
        meeting_id
    );
    const apiPath = `${API_URL}/meeting/${org_id}/${meeting_id}`;
    console.log('[getAMeeting] API path:', apiPath);
    const response = await fetch(apiPath, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_TOKEN}`,
        },
    });

    const json = await response.json();
    console.log('[getAMeeting] API response JSON:', json);
    if (json.status === 200 && json.data) {
        console.log('[getAMeeting] FullMeeting data:', json.data);
        return json.data;
    }
    // Return a default FullMeeting object with all required properties
    return {
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
        newcomers_count: 0,
        notes: '',
        nursery_contact: '',
        nursery_count: 0,
        resource_contact: '',
        security_contact: '',
        setup_contact: '',
        support_contact: '',
        transportation_contact: '',
        transportation_count: 0,
        worship: '',
        youth_contact: '',
        youth_count: 0,
        organization_id: '',
        created_at: null,
        updated_at: null,
        aws_id: null,
        aws_mtg_id: null,
        aws_org_id: null,
        groups: null,
    };
};
//      ########################################
//      DEFAULT ORGANIZATION GROUPS
//      ########################################
export const getDefaultGroups = async (id: string): Promise<FullGroup[]> => {
    const response = await fetch(`${API_URL}/defaultgroups/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_TOKEN}`,
        },
    });

    const json = await response.json();

    if (json.status === 200 && json.data && Array.isArray(json.data)) {
        return json.data;
    }
    // Return a default Meeting object with all required properties
    return [];
};
