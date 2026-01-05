"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Calendar } from "lucide-react";

interface DateRangePickerProps {
  onRangeChange: (since: Date | undefined, until: Date | undefined) => void;
}

export function DateRangePicker({ onRangeChange }: DateRangePickerProps) {
  const [since, setSince] = useState<string>("");
  const [until, setUntil] = useState<string>("");

  const presets = [
    { label: "Today", days: 0 },
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "All time", days: -1 },
  ];

  const handlePreset = (days: number) => {
    if (days === -1) {
      setSince("");
      setUntil("");
      onRangeChange(undefined, undefined);
    } else {
      const sinceDate = startOfDay(subDays(new Date(), days));
      const untilDate = endOfDay(new Date());
      setSince(format(sinceDate, "yyyy-MM-dd"));
      setUntil(format(untilDate, "yyyy-MM-dd"));
      onRangeChange(sinceDate, untilDate);
    }
  };

  const handleCustomRange = () => {
    const sinceDate = since ? startOfDay(new Date(since)) : undefined;
    const untilDate = until ? endOfDay(new Date(until)) : undefined;
    onRangeChange(sinceDate, untilDate);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            onClick={() => handlePreset(preset.days)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={since}
            onChange={(e) => setSince(e.target.value)}
            className="w-40"
            placeholder="From"
          />
        </div>
        <span className="text-muted-foreground">to</span>
        <Input
          type="date"
          value={until}
          onChange={(e) => setUntil(e.target.value)}
          className="w-40"
          placeholder="To"
        />
        <Button variant="secondary" size="sm" onClick={handleCustomRange}>
          Apply
        </Button>
      </div>
    </div>
  );
}
