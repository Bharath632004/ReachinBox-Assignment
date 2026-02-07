import { ArrowLeft, Star, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface EmailDetailProps {
  email: Tables<"emails">;
  onBack: () => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string, starred: boolean) => void;
}

export default function EmailDetail({ email, onBack, onDelete, onToggleStar }: EmailDetailProps) {
  const { profile } = useAuth();
  const dateStr = email.sent_at || email.scheduled_at || email.created_at;

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">{email.subject || "(no subject)"}</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleStar(email.id, !email.starred)}
            className={email.starred ? "text-warning" : "text-muted-foreground"}
          >
            <Star className={email.starred ? "h-5 w-5 fill-warning" : "h-5 w-5"} />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Archive className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(email.id)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Sender info */}
      <div className="px-6 py-6">
        <div className="flex items-start gap-4 mb-8">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {(profile?.display_name?.[0] || "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-semibold text-foreground">
                  {profile?.display_name || "You"}
                </span>
                <span className="text-sm text-muted-foreground ml-2">
                  &lt;{profile?.email}&gt;
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {format(new Date(dateStr), "MMM d, h:mm a")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              to {email.recipients?.join(", ")}
            </p>
          </div>
        </div>

        {/* Body */}
        <div
          className="prose prose-sm max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: email.body || "" }}
        />
      </div>
    </div>
  );
}
