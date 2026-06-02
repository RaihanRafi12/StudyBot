import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertCircle,
  Clock,
  Plus,
  BookOpen,
  FileText,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'exam' | 'deadline' | 'reminder' | 'class';
  description?: string;
}

interface FullCalendarProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  isAuthenticated?: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function FullCalendar({ events, onAddEvent, isAuthenticated = false }: FullCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<CalendarEvent['type']>('reminder');
  const [newEventDescription, setNewEventDescription] = useState('');

  // Filter events for logged-out users
  const displayEvents = isAuthenticated ? events : [];

  const getEventColor = (type: string) => {
    switch (type) {
      case 'exam':
        return 'bg-red-500 text-white';
      case 'deadline':
        return 'bg-orange-500 text-white';
      case 'class':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <AlertCircle className="h-3 w-3" />;
      case 'deadline':
        return <Clock className="h-3 w-3" />;
      case 'class':
        return <BookOpen className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  // Get the first day of the month
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Get the number of days in the month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get days to display (including previous/next month days)
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; day: number }[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
        day: daysInPrevMonth - i,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        day: i,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        day: i,
      });
    }

    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return displayEvents.filter(
      (event) => event.date.toDateString() === date.toDateString()
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = () => {
    if (newEventTitle && selectedDate) {
      onAddEvent({
        title: newEventTitle,
        date: selectedDate,
        type: newEventType,
        description: newEventDescription,
      });
      setNewEventTitle('');
      setNewEventDescription('');
      setNewEventType('reminder');
      setIsAddEventOpen(false);
    }
  };

  const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    setSelectedDate(date);
    if (isAuthenticated) {
      setIsAddEventOpen(true);
    }
  };

  const calendarDays = getCalendarDays();
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6 p-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and events</p>
        </div>
      </div>

      <Card className="h-[calc(100vh-200px)]">
        <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-80px)]">
          <div className="h-full flex flex-col">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="p-4 text-center font-semibold text-base border-r last:border-r-0 bg-muted/30"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 flex-1">
              {calendarDays.map((dayInfo, index) => {
                const dayEvents = getEventsForDate(dayInfo.date);
                const isTodayDate = isToday(dayInfo.date);

                return (
                  <div
                    key={index}
                    className={`border-r border-b last:border-r-0 p-2 min-h-[100px] flex flex-col cursor-pointer hover:bg-accent/50 transition-colors ${
                      !dayInfo.isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''
                    }`}
                    onClick={() => handleDateClick(dayInfo.date, dayInfo.isCurrentMonth)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-base font-medium ${
                          isTodayDate
                            ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center'
                            : ''
                        }`}
                      >
                        {dayInfo.day}
                      </span>
                    </div>

                    <div className="flex-1 space-y-1 overflow-y-auto">
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`text-xs px-2 py-1 rounded ${getEventColor(
                            event.type
                          )} truncate flex items-center gap-1`}
                          title={event.title}
                        >
                          {getEventIcon(event.type)}
                          <span className="truncate">{event.title}</span>
                        </motion.div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground px-2">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-2xl font-bold">{displayEvents.length}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Exams</p>
              <p className="text-2xl font-bold">
                {displayEvents.filter((e) => e.type === 'exam').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">Deadlines</p>
              <p className="text-2xl font-bold">
                {displayEvents.filter((e) => e.type === 'deadline').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Classes</p>
              <p className="text-2xl font-bold">
                {displayEvents.filter((e) => e.type === 'class').length}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event for{' '}
              {selectedDate?.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">
                Event Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="event-title"
                placeholder="e.g., Computer Science Midterm"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-type">
                Event Type <span className="text-red-500">*</span>
              </Label>
              <Select value={newEventType} onValueChange={(value: any) => setNewEventType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Description (Optional)</Label>
              <Textarea
                id="event-description"
                placeholder="Add additional details..."
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={!newEventTitle}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
