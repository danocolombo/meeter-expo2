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
export interface FullGroup extends Group {
    created_at: string | null;
    updated_at: string | null;
    aws_id: string | null;
    aws_mtg_id: string | null;
    aws_org_id: string | null;
    organization_id: string | null;
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
    newcomers_count: number;
    notes: string;
    nursery_contact: string;
    nursery_count: number;
    resource_contact: string;
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
export interface FullMeeting extends Meeting {
    created_at: string | null;
    updated_at: string | null;
    aws_id: string | null;
    aws_mtg_id: string | null;
    aws_org_id: string | null;
    groups: FullGroup[] | null;
}

export interface Affiliation {
    id: string;
    created_at: string;
    updated_at: string;
    role: string;
    status: string;
    person_id: string;
    organization_id: string;
    aws_person_id: string;
    aws_org_id: string;
    aws_id: string;
}

export interface Person {
    id: string;
    created_at: string;
    updated_at: string;
    sub: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    shirt: string;
    birthday: string;
    picture: string;
    default_org_id: string;
    location_id: string;
    aws_id: string;
    aws_def_org_id: string;
    aws_location_id: string;
}
export interface ApiError {
    status: number;
    message: string;
    details: string;
}

export interface UserProfile {
    id: string;
    sub: string;
    username: string;
    email: string;
    phone: string;
    shirt: string;
    birthday: string;
    picture: string | null;
    affiliations: UserAffiliation[];
    location: UserLocation;
    organizationDefaultUsersId: string;
    defaultOrg: UserOrg;
    locationUsersId: string;
    createdAt: string;
    updatedAt: string;
    firstName: string;
    lastName: string;
    awsId: string;
    awsDefOrgId: string;
    awsLocationId: string | null;
    forgotPasswordToken: string | null;
    verifyToken: string | null;
    forgotPasswordTokenExpiry: string;
    verifyTokenExpiry: string;
    activeOrg: ActiveOrg;
    permissions: string[];
}

export interface UserAffiliation {
    id: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string | null;
    personId: string;
    organizationId: string;
    awsPersonId: string;
    awsOrgId: string;
    awsId: string;
}

export interface UserLocation {
    id: string;
    street: string;
    city: string;
    createdAt: string;
    updatedAt: string;
    stateProv: string;
    postalCode: string;
    awsId: string | null;
}

export interface UserOrg {
    id: string;
    name: string;
    code: string;
    createdAt: string;
    updatedAt: string | null;
    heroMessage: string;
    locationId: string;
    awsId: string;
    awsLocationId: string;
}

export interface ActiveOrg {
    id: string;
    code: string;
    name: string;
    heroMessage: string;
    role: string;
    status: string;
}
