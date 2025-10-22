export enum FarmRecordTypes {
    FARM = 'farm',
    STALL = 'stall',
    STALL_ONLY = 'stall-only'
}

export enum FarmAccountTypes {
    FARM = 'farm',
    STALL = 'stall'
}

export type FarmMapDBRecord = {
    id: string;
    farmer_id: string;
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    type: FarmAccountTypes;
    latitude: number;
    longitude: number;
    stall_id: string | null;
    stall_name: string | null;
    stall_location: string | null;
    record_type: FarmRecordTypes;
    distance_meters: number;
    bio: string | null;
    logo: string | null;
};

export type SearchFarmsWithFiltersType = {
    userLat: number;
    userLon: number;
    filters: null | {
        withinDistance?: number;
        farmTypes?: string[];
        includeStalls?: boolean;
        searchQuery?: string;
    }
}
