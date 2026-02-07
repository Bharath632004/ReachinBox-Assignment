import { useState, useMemo } from "react";
import AppSidebar from "@/components/layout/AppSidebar";
import TopBar from "@/components/layout/TopBar";
import EmailList from "@/components/email/EmailList";
import EmailDetail from "@/components/email/EmailDetail";
import ComposeEmail from "@/components/email/ComposeEmail";
import { useEmails } from "@/hooks/useEmails";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type View = "list" | "detail" | "compose";

const PAGE_SIZE = 20;

export default function Dashboard() {
  const [view, setView] = useState<View>("list");
  const [activeTab, setActiveTab] = useState("scheduled");
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<Tables<"emails"> | null>(null);
  const [page, setPage] = useState(1);
  const { emails, loading, fetchEmails, toggleStar, deleteEmail, counts } = useEmails();

  const filtered = useMemo(() => {
    let list = emails.filter((e) => e.status === activeTab);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.recipients.some((r) => r.toLowerCase().includes(q))
      );
    }
    return list;
  }, [emails, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSelect = (email: Tables<"emails">) => {
    setSelectedEmail(email);
    setView("detail");
  };

  const handleBack = () => {
    setView("list");
    setSelectedEmail(null);
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setView("list");
          setPage(1);
        }}
        onCompose={() => setView("compose")}
        counts={counts}
      />
      <main className="flex-1 flex flex-col min-w-0">
        {view === "list" && (
          <>
            <TopBar search={search} onSearchChange={setSearch} onRefresh={fetchEmails} />
            <EmailList emails={paged} onSelect={handleSelect} onToggleStar={toggleStar} />
            {filtered.length > PAGE_SIZE && (
              <div className="flex items-center justify-center gap-3 py-3 border-t border-border bg-card">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
        {view === "detail" && selectedEmail && (
          <EmailDetail
            email={selectedEmail}
            onBack={handleBack}
            onDelete={(id) => {
              deleteEmail(id);
              handleBack();
            }}
            onToggleStar={toggleStar}
          />
        )}
        {view === "compose" && (
          <ComposeEmail
            onBack={handleBack}
            onSent={() => {
              setView("list");
              fetchEmails();
            }}
          />
        )}
      </main>
    </div>
  );
}
