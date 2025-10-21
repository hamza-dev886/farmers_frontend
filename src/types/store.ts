import { LocationCordinates } from "./user";

export interface UserSlice {
    locationCordinates: LocationCordinates;
    setLocationCordinates: (paylaod: LocationCordinates) => void;
}

export type AppState = UserSlice;
