import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
  showDate?: boolean;
  showTime?: boolean;
}

export function DateTimePicker({ value, onChange, className, showDate = true, showTime = true }: DateTimePickerProps) {
  const cols = showDate && showTime ? "grid grid-cols-1 md:grid-cols-2" : "grid grid-cols-1";
  return (
    <div className={cn(`${cols} gap-6 items-start`, className)}>
      {showDate && (
        <div className="space-y-1">
          <Label>Date</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-yellow-500" />
            <div className="pl-10 max-w-[420px]">
              <Calendar
                selected={value}
                onSelect={(d) => {
                  if (!d) return;
                  const merged = new Date(value);
                  merged.setFullYear(d.getFullYear());
                  merged.setMonth(d.getMonth());
                  merged.setDate(d.getDate());
                  onChange(merged);
                }}
                mode="single"
              />
            </div>
          </div>
        </div>
      )}
      {showTime && (
        <div className="space-y-1">
          <Label>Time</Label>
          <TimePicker value={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
