import { Search, Filter, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

export default function TopBar({ search, onSearchChange, onRefresh }: TopBarProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-card">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 bg-muted/50 border-0"
        />
      </div>
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <Filter className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}
