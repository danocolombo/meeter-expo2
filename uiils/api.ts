import { Affiliation, Person } from '@/types/interfaces';
const API_URL = process.env.EXPO_PUBLIC_JERICHO_ENDPOINT;
const API_TOKEN = process.env.EXPO_PUBLIC_JERICHO_API_TOKEN;
export interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating: Rating;
}

export interface Rating {
    rate: number;
    count: number;
}

export const getProducts = async (): Promise<Product[]> => {
    const response = await fetch(`${API_URL}/products`);
    const fake = {
        title: 'Shiny product',
        price: 109.95,
        description: 'Looks like a regular product',
        category: "men's clothing",
        image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
        rating: { rate: 3.9, count: 120 },
    };
    const json = await response.json();
    return [...json, fake];
};
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
    return undefined;
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

export const getPersonAffiliations = async (id: string): Promise<Product> => {
    const response = await fetch(`${API_URL}/affiliations/person/${id}`);
    return response.json();
};

export const getOrganizationAffiliations = async (
    id: string
): Promise<Product> => {
    const response = await fetch(`${API_URL}/affiliations/organization/${id}`);
    return response.json();
};
