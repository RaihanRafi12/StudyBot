import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
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

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  isAuthenticated?: boolean;
}

export function CalendarView({ events, onAddEvent, isAuthenticated = false }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<CalendarEvent['type']>('reminder');
  const [newEventDescription, setNewEventDescription] = useState('');

  // Filter events for logged-out users - show empty array
  const displayEvents = isAuthenticated ? events : [];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <AlertCircle className="h-4 w-4" />;
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      case 'class':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'exam':
        return 'bg-red-500/10 border-red-500/20 text-red-600';
      case 'deadline':
        return 'bg-orange-500/10 border-orange-500/20 text-orange-600';
      case 'class':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-600';
      default:
        return 'bg-purple-500/10 border-purple-500/20 text-purple-600';
    }
  };

  const selectedDateEvents = displayEvents.filter(
    (event) =>
      selectedDate &&
      event.date.toDateString() === selectedDate.toDateString()
  );

  const upcomingEvents = displayEvents
    .filter((event) => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

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

  const eventDates = displayEvents.map((e) => e.date);

  return (
    <div className="space-y-6 p-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and events</p>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setIsAddEventOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        {/* Calendar - Full size */}
        <Card className="lg:col-span-2 flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="h-6 w-6" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-4">
            <div className="w-full h-full flex items-center justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full h-full max-w-full [&_.rdp-months]:h-full [&_.rdp-month]:h-full [&_.rdp-table]:h-[calc(100%-60px)] [&_.rdp-tbody]:h-full [&_.rdp-row]:flex-1 [&_.rdp-cell]:flex-1 [&_.rdp-day]:w-full [&_.rdp-day]:h-full [&_.rdp-day]:min-h-[60px] [&_.rdp-day]:text-lg [&_.rdp-head_cell]:text-base [&_.rdp-head_cell]:font-semibold [&_.rdp-caption_label]:text-2xl [&_.rdp-caption_label]:font-bold [&_.rdp-nav_button]:w-12 [&_.rdp-nav_button]:h-12"
                modifiers={{
                  hasEvent: eventDates,
                }}
                modifiersClassNames={{
                  hasEvent: 'bg-primary/10 font-bold ring-2 ring-primary/30',
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-base text-muted-foreground text-center py-8">
                  No upcoming events
                </p>
              ) : (
                upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border ${getEventColor(event.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getEventIcon(event.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base">{event.title}</p>
                        <p className="text-sm mt-1 opacity-80">
                          {event.date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize text-xs">
                        {event.type}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Event Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base text-muted-foreground">Total Events</span>
                <span className="font-bold text-xl">{displayEvents.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-red-600">Exams</span>
                <span className="font-bold text-xl">
                  {displayEvents.filter((e) => e.type === 'exam').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-orange-600">Deadlines</span>
                <span className="font-bold text-xl">
                  {displayEvents.filter((e) => e.type === 'deadline').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-blue-600">Classes</span>
                <span className="font-bold text-xl">
                  {displayEvents.filter((e) => e.type === 'class').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Events on {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No events scheduled for this date
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedDateEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border ${getEventColor(event.type)}`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {getEventIcon(event.type)}
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        <Badge variant="outline" className="mt-2 capitalize">
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm mt-3 opacity-80">{event.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event for your calendar
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

            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm">
                <span className="font-medium">Selected Date:</span>{' '}
                {selectedDate?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
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