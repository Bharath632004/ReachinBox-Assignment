import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface EmailListProps {
  emails: Tables<"emails">[];
  onSelect: (email: Tables<"emails">) => void;
  onToggleStar: (id: string, starred: boolean) => void;
}

const statusConfig = {
  scheduled: { label: "Scheduled", className: "bg-warning/15 text-warning border-warning/30" },
  sent: { label: "Sent", className: "bg-success/15 text-success border-success/30" },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive border-destructive/30" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
};

export default function EmailList({ emails, onSelect, onToggleStar }: EmailListProps) {
  if (emails.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        No emails found
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {emails.map((email) => {
        const status = statusConfig[email.status];
        const dateStr = email.scheduled_at || email.sent_at || email.created_at;
        const date = new Date(dateStr);
        const recipient = email.recipients?.[0] || "No recipient";

        return (
          <div
            key={email.id}
            onClick={() => onSelect(email)}
            className="flex items-center gap-4 px-6 py-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <div className="w-40 shrink-0">
              <p className="text-sm font-medium text-foreground truncate">To: {recipient}</p>
            </div>

            <Badge variant="outline" className={cn("shrink-0 text-xs font-medium", status.className)}>
              {email.status === "scheduled" && "⏱ "}
              {format(date, "EEE h:mm:ss a")}
            </Badge>

            <div className="flex-1 min-w-0 flex items-baseline gap-2">
              <span className="font-medium text-sm text-foreground truncate">{email.subject || "(no subject)"}</span>
              <span className="text-sm text-muted-foreground truncate">
                - {email.body?.replace(/<[^>]*>/g, "").slice(0, 80)}...
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(email.id, !email.starred);
              }}
              className="shrink-0 text-muted-foreground hover:text-warning transition-colors"
            >
              <Star className={cn("h-4 w-4", email.starred && "fill-warning text-warning")} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
