import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addDays, setHours, setMinutes, startOfDay } from "date-fns";

interface SendLaterModalProps {
  onClose: () => void;
  onSchedule: (date: Date) => void;
}

export default function SendLaterModal({ onClose, onSchedule }: SendLaterModalProps) {
  const [dateTime, setDateTime] = useState("");

  const tomorrow = addDays(startOfDay(new Date()), 1);

  const quickOptions = [
    { label: "Tomorrow", date: setHours(setMinutes(tomorrow, 0), 9) },
    { label: "Tomorrow, 10:00 AM", date: setHours(setMinutes(tomorrow, 0), 10) },
    { label: "Tomorrow, 11:00 AM", date: setHours(setMinutes(tomorrow, 0), 11) },
    { label: "Tomorrow, 3:00 PM", date: setHours(setMinutes(tomorrow, 0), 15) },
  ];

  return (
    <div className="fixed inset-0 bg-black/20 flex items-start justify-end p-4 z-50" onClick={onClose}>
      <Card className="w-80 mt-16 mr-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Send Later</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="h-10"
          />

          <div className="space-y-1">
            {quickOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => onSchedule(opt.date)}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              variant="outline"
              className="border-primary text-primary"
              disabled={!dateTime}
              onClick={() => onSchedule(new Date(dateTime))}
            >
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
