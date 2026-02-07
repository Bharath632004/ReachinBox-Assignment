import { useState, useRef, KeyboardEvent } from "react";
import { ArrowLeft, Paperclip, Clock, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SendLaterModal from "./SendLaterModal";

interface ComposeEmailProps {
  onBack: () => void;
  onSent: () => void;
}

export default function ComposeEmail({ onBack, onSent }: ComposeEmailProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [delayBetween, setDelayBetween] = useState(0);
  const [hourlyLimit, setHourlyLimit] = useState(0);
  const [sending, setSending] = useState(false);
  const [showSendLater, setShowSendLater] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const MAX_VISIBLE = 3;

  const addRecipient = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && !recipients.includes(trimmed)) {
      setRecipients([...recipients, trimmed]);
    }
    setRecipientInput("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRecipient(recipientInput);
    }
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const emails = text
        .split(/[\n,;]/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
      const unique = [...new Set([...recipients, ...emails])];
      setRecipients(unique);
      toast({ title: `${emails.length} emails parsed from CSV` });
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  const saveAndSend = async (scheduledAt?: Date) => {
    if (!user) return;
    if (recipients.length === 0) {
      toast({ title: "Add at least one recipient", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const status = scheduledAt ? "scheduled" : "sent";
      const { error } = await supabase.from("emails").insert({
        user_id: user.id,
        recipients,
        subject,
        body,
        status: scheduledAt ? "scheduled" : "draft",
        scheduled_at: scheduledAt?.toISOString() || null,
        delay_between: delayBetween,
        hourly_limit: hourlyLimit,
      });
      if (error) throw error;
      toast({ title: scheduledAt ? "Email scheduled!" : "Email saved!" });
      onSent();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">Compose New Email</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowSendLater(true)}>
            <Clock className="h-5 w-5" />
          </Button>
          <Button
            className="font-medium"
            onClick={() => saveAndSend()}
            disabled={sending}
          >
            {sending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" className="hidden" />
      <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />

      {/* Form */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* From */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-muted-foreground w-16 shrink-0">From</label>
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm">
            {profile?.email || "you@email.com"}
          </div>
        </div>

        {/* To */}
        <div className="flex items-start gap-4 border-b border-border pb-4">
          <label className="text-sm text-muted-foreground w-16 shrink-0 pt-2">To</label>
          <div className="flex-1 flex flex-wrap items-center gap-2">
            {recipients.slice(0, MAX_VISIBLE).map((r, i) => (
              <Badge key={r} variant="outline" className="border-primary/30 text-foreground gap-1 pl-3 pr-1 py-1">
                {r}
                <button onClick={() => removeRecipient(i)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {recipients.length > MAX_VISIBLE && (
              <Badge variant="outline" className="border-primary/30 text-foreground">
                +{recipients.length - MAX_VISIBLE}
              </Badge>
            )}
            <Input
              placeholder="recipient@example.com"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => recipientInput && addRecipient(recipientInput)}
              className="flex-1 min-w-[200px] border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary shrink-0"
            onClick={() => csvInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload List
          </Button>
        </div>

        {/* Subject */}
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <label className="text-sm text-muted-foreground w-16 shrink-0">Subject</label>
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
          />
        </div>

        {/* Delay + Hourly */}
        <div className="flex items-center gap-6 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground whitespace-nowrap">Delay between 2 emails</label>
            <Input
              type="number"
              value={delayBetween}
              onChange={(e) => setDelayBetween(Number(e.target.value))}
              className="w-16 h-9 text-center"
              min={0}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground whitespace-nowrap">Hourly Limit</label>
            <Input
              type="number"
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(Number(e.target.value))}
              className="w-16 h-9 text-center"
              min={0}
            />
          </div>
        </div>

        {/* Body */}
        <Textarea
          placeholder="Type Your Reply..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-[300px] border-0 bg-muted/30 shadow-none focus-visible:ring-0 resize-none"
        />
      </div>

      {showSendLater && (
        <SendLaterModal
          onClose={() => setShowSendLater(false)}
          onSchedule={(date) => {
            setShowSendLater(false);
            saveAndSend(date);
          }}
        />
      )}
    </div>
  );
}
