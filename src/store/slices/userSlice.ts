import { StateCreator } from "zustand";
import { AppState, UserSlice } from "../../types/store";
import { LocationCordinates } from "@/types/user";

export const createUserSlice: StateCreator<
    AppState,
    [["zustand/persist", unknown], ["zustand/devtools", never]],
    [],
    UserSlice
> = (set) => ({
    locationCordinates: {
        lat: null,
        lng: null,
    },
    setLocationCordinates: (cordinates: LocationCordinates) =>
        set(
            (state) => ({ locationCordinates: cordinates }),
            false,
            "user/setLocationCordinates"
        ),
});
