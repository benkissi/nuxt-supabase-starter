import type { $Fetch } from "nitropack";
import { promisify } from "../functions";

const memberApi = (fetch: $Fetch) => {
  const supabase = useSupabaseClient();
  return {
    getMembers: async () => {
      const { data, error } = await supabase
        .from("organization_members")
        .select("*, account:accounts(id, name, image)")
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
    updateMember: async (id: string, details: { role?: string; job_title?: string | null }) => {
      const { data, error } = await supabase
        .from("organization_members")
        .update(details as never)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    getInvitations: async () => {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    sendInvite: async (details: { email: string; name?: string; role: string, organization_id: string}) => {
      try {
        const result = await fetch("/api/org/invite/email", {
          method: "POST",
          body: details,
        });
        
        // Return the full result so we can check email_sent status
        return result;
      } catch (error: any) {
        throw new Error(error.data?.message || error.message || "Failed to send invitation");
      }
    },
    updateInvite: async (id: string, details: { email: string; name?: string; role: string}) => {
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
    },
    resendInvite: async (invitationId: string) => {
      try {
        const result = await fetch("/api/invitations/resend", {
          method: "POST",
          body: { invitation_id: invitationId },
        });
        return result;
      } catch (error: any) {
        throw new Error(error.data?.message || error.message || "Failed to resend invitation");
      }
    }
  };
};

export default memberApi;
