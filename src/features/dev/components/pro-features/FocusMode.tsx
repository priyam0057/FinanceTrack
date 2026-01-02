import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/features/dev/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Monitor, Coffee, Settings2, CheckCircle2 } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function FocusMode() {
    const { addFocusSession, focusSessions } = useStore();

    // Timer Settings (in minutes)
    const [focusDuration, setFocusDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Update timer if settings change and timer is not running/hasn't started
    useEffect(() => {
        if (!isActive) {
            setTimeLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
        }
    }, [focusDuration, breakDuration]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            // Timer Finished
            setIsActive(false);
            handleTimerComplete();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const handleTimerComplete = () => {
        // Log session
        addFocusSession({
            type: mode,
            durationSeconds: mode === 'focus' ? focusDuration * 60 : breakDuration * 60,
        });

        // Optional: Play sound here

        // Auto-switch modes or just stop? For now just stop and maybe notify.
        // If we want to be fancy, we can ask user to start next session.
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
    };

    const switchMode = (newMode: 'focus' | 'break') => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(newMode === 'focus' ? focusDuration * 60 : breakDuration * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate Daily Stats
    const today = new Date();
    const todaysSessions = focusSessions.filter(s => isSameDay(new Date(s.completedAt), today));
    const focusCount = todaysSessions.filter(s => s.type === 'focus').length;
    const breakCount = todaysSessions.filter(s => s.type === 'break').length;

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
            <Card className="w-full overflow-hidden relative border-primary/20 bg-background/50 backdrop-blur-sm">
                <div
                    className={`absolute inset-0 opacity-5 pointer-events-none transition-colors duration-500 ${mode === 'focus' ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex gap-2 p-1 bg-muted rounded-lg">
                        <Button
                            variant={mode === 'focus' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => switchMode('focus')}
                            className="h-7 text-xs"
                        >
                            <Monitor className="h-3 w-3 mr-1.5" />
                            Focus
                        </Button>
                        <Button
                            variant={mode === 'break' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => switchMode('break')}
                            className="h-7 text-xs"
                        >
                            <Coffee className="h-3 w-3 mr-1.5" />
                            Break
                        </Button>
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Settings2 className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Timer Settings</h4>
                                    <p className="text-sm text-muted-foreground">Adjust your session durations.</p>
                                </div>
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor="focus">Focus (min)</Label>
                                        <Input
                                            id="focus"
                                            type="number"
                                            value={focusDuration}
                                            onChange={(e) => setFocusDuration(Number(e.target.value))}
                                            className="col-span-2 h-8"
                                            min={1}
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor="break">Break (min)</Label>
                                        <Input
                                            id="break"
                                            type="number"
                                            value={breakDuration}
                                            onChange={(e) => setBreakDuration(Number(e.target.value))}
                                            className="col-span-2 h-8"
                                            min={1}
                                        />
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </CardHeader>

                <CardContent className="p-6 pt-2 text-center space-y-8">
                    <div className="py-4">
                        <div className="text-7xl font-mono font-bold tracking-tighter tabular-nums text-foreground">
                            {formatTime(timeLeft)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 font-medium tracking-wide uppercase">
                            {isActive ? (mode === 'focus' ? 'Locked In' : 'Recharging') : 'Ready'}
                        </p>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button
                            size="lg"
                            className="w-16 h-16 rounded-full"
                            variant={isActive ? "secondary" : "default"}
                            onClick={toggleTimer}
                        >
                            {isActive ? (
                                <Pause className="h-6 w-6" />
                            ) : (
                                <Play className="h-6 w-6 ml-1" />
                            )}
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-16 h-16 rounded-full"
                            onClick={resetTimer}
                        >
                            <RotateCcw className="h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Daily Stats */}
            <div className="grid grid-cols-2 gap-4 w-full">
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-1">
                        <div className="p-2 bg-blue-500/10 rounded-full mb-1">
                            <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        </div>
                        <span className="text-2xl font-bold">{focusCount}</span>
                        <span className="text-xs text-muted-foreground">Focus Sessions</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-1">
                        <div className="p-2 bg-green-500/10 rounded-full mb-1">
                            <Coffee className="h-5 w-5 text-green-500" />
                        </div>
                        <span className="text-2xl font-bold">{breakCount}</span>
                        <span className="text-xs text-muted-foreground">Breaks Taken</span>
                    </CardContent>
                </Card>
            </div>

            <p className="text-xs text-muted-foreground text-center">
                Stats for today, {format(today, 'MMMM d, yyyy')}
            </p>
        </div>
    );
}
