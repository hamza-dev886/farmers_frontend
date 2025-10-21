import { create } from "zustand";
import { createUserSlice } from "./slices/userSlice";
import { devtools, persist } from "zustand/middleware";
import { AppState } from "@/types/store";

export const useStore = create<AppState>()(
    devtools(
        persist(
            // The function that combines all slices
            (...a) => ({
                ...createUserSlice(...a),
            }),
            {
                name: "app-storage", // Key for local storage
            }
        ),
        {
            name: "App-Store-Devtools", // Name shown in Redux DevTools
        }
    )
);
