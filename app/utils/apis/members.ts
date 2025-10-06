import type { $Fetch } from "nitropack";
import { promisify } from "../functions";

const memberApi = (fetch: $Fetch) => {
  const supabase = useSupabaseClient();
  return {
    getMembers: async () => {
      const { data, error } = await supabase
        .from("organization_members")
        .select("*, account:accounts(image)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  };
};

export default memberApi;
