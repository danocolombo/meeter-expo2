export interface Group {
    id: string;
    grp_comp_key: string | null;
    title: string;
    location: string | null;
    gender: string;
    attendance: number;
    facilitator: string | null;
    cofacilitator: string | null;
    notes: string | null;
    meeting_id: string;
}

export interface Meeting {
    id: string;
    meeting_date: string;
    title: string;
    meeting_type: string;
    mtg_comp_key: string;
    announcements_contact: string;
    attendance_count: number;
    av_contact: string;
    cafe_contact: string;
    cafe_count: number;
    children_contact: string;
    children_count: number;
    cleanup_contact: string;
    closing_contact: string;
    donations: number;
    facilitator_contact: string;
    greeter_contact1: string;
    greeter_contact2: string;
    meal: string;
    meal_contact: string;
    meal_count: number;
    newcomers_count: string;
    notes: string;
    nursery_contact: string;
    nursery_count: number;
    resource_contact: number;
    security_contact: string;
    setup_contact: string;
    support_contact: string;
    transportation_contact: string;
    transportation_count: number;
    worship: string;
    youth_contact: string;
    youth_count: number;
    organization_id: string;
}
