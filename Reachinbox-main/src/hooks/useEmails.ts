import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

export function useEmails() {
  const { user } = useAuth();
  const [emails, setEmails] = useState<Tables<"emails">[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmails = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("emails")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setEmails(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("emails-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "emails", filter: `user_id=eq.${user.id}` },
        () => {
          fetchEmails();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchEmails]);

  const toggleStar = async (id: string, starred: boolean) => {
    await supabase.from("emails").update({ starred }).eq("id", id);
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, starred } : e)));
  };

  const deleteEmail = async (id: string) => {
    await supabase.from("emails").delete().eq("id", id);
    setEmails((prev) => prev.filter((e) => e.id !== id));
  };

  const counts = {
    scheduled: emails.filter((e) => e.status === "scheduled").length,
    sent: emails.filter((e) => e.status === "sent").length,
    failed: emails.filter((e) => e.status === "failed").length,
  };

  return { emails, loading, fetchEmails, toggleStar, deleteEmail, counts };
}
