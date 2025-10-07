import type { $Fetch } from "nitropack";
import { promisify } from "../functions";

const organizationsApi = (fetch: $Fetch) => {
    const supabase = useSupabaseClient();
    return {
        getOrganizations: async () => {
            const { data, error } = await supabase
                .from("organizations")
                .select("*")
                .order("created_at", { ascending: true });
            if (error) throw error;
            return data;
        },
    };
};

export default organizationsApi;
