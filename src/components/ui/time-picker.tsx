import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => (i + 1).toString()), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")), []);

  const currentHours24 = value.getHours();
  const currentMinutes = value.getMinutes();
  const isPM = currentHours24 >= 12;
  const currentHour12 = ((currentHours24 % 12) || 12).toString();
  const currentMinuteStr = currentMinutes.toString().padStart(2, "0");

  const setHour12 = (hour12: string) => {
    const h = parseInt(hour12, 10);
    const newHour24 = isPM ? (h % 12) + 12 : (h % 12);
    const d = new Date(value);
    d.setHours(newHour24);
    onChange(d);
  };

  const setMinute = (minute: string) => {
    const m = parseInt(minute, 10);
    const d = new Date(value);
    d.setMinutes(m);
    onChange(d);
  };

  const setMeridiem = (meridiem: "AM" | "PM") => {
    const d = new Date(value);
    let h = ((d.getHours() % 12) || 12);
    if (meridiem === "PM") {
      h = (h % 12) + 12;
    } else {
      h = (h % 12);
    }
    d.setHours(h);
    onChange(d);
  };

  return (
    <div className={cn("flex items-end gap-3", className)}>
      <div className="space-y-1 w-24">
        <Label>Hour</Label>
        <Select value={currentHour12} onValueChange={setHour12}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hours.map((h) => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1 w-28">
        <Label>Minute</Label>
        <Select value={currentMinuteStr} onValueChange={setMinute}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {minutes.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1 w-28">
        <Label>AM/PM</Label>
        <Select value={isPM ? "PM" : "AM"} onValueChange={(v) => setMeridiem(v as "AM" | "PM") }>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

