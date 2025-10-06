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
    deleteMember: async (id: string) => {
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    },
    getInvitations: async () => {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    sendInvite: async (details: { email: string; role: string, organization_id: string}) => {
      const { data, error } = await supabase
        .from("invitations")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert([details] as any) // type assertion to avoid TS error
        .select();
      if (error) throw error;
      return data;
    },
    updateInvite: async (id: string, details: { email: string; role: string}) => {
      const { data, error } = await supabase
        .from("invitations")
        .update(details as never) // type assertion to avoid TS error
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    revokeInvite: async (id: string) => {
      const { error } = await supabase
        .from("invitations")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    }
  };
};

export default memberApi;
