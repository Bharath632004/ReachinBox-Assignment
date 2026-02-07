import { Clock, Send, AlertTriangle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCompose: () => void;
  counts: { scheduled: number; sent: number; failed: number };
}

const tabs = [
  { id: "scheduled", label: "Scheduled", icon: Clock },
  { id: "sent", label: "Sent", icon: Send },
  { id: "failed", label: "Failed", icon: AlertTriangle },
];

export default function AppSidebar({ activeTab, onTabChange, onCompose, counts }: AppSidebarProps) {
  const { profile, signOut } = useAuth();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-black tracking-tight text-foreground">ONB</h1>
      </div>

      {/* Profile */}
      <div className="px-4 pb-4">
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-muted text-muted-foreground text-sm">
              {(profile?.display_name?.[0] || profile?.email?.[0] || "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.display_name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </div>

      {/* Compose */}
      <div className="px-4 pb-6">
        <Button
          variant="outline"
          className="w-full h-10 border-primary text-primary hover:bg-primary/5 font-medium"
          onClick={onCompose}
        >
          Compose
        </Button>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
          Core
        </p>
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-muted"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{tab.label}</span>
              <span className="text-xs text-muted-foreground">
                {counts[tab.id as keyof typeof counts]}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
