"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import cn from 'lib/utils/cn';

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  courseId: string;
};

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export function Calendar({ events, onEventClick }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const getEventsForDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="btn btn-sm btn-ghost btn-circle"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>

        <h3 className="font-bold text-lg">{monthYear}</h3>

        <button
          onClick={nextMonth}
          className="btn btn-sm btn-ghost btn-circle"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="min-h-[400px]">
        <div className="grid grid-cols-7 text-center mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-xs font-medium text-base-content/70 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square p-1"></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayEvents = getEventsForDay(day);
            const hasEvents = dayEvents.length > 0;
            const isToday = new Date().getDate() === day &&
                            new Date().getMonth() === currentMonth.getMonth() &&
                            new Date().getFullYear() === currentMonth.getFullYear();

            return (
              <div
                key={day}
                className={cn("aspect-square p-1 relative", hasEvents && "cursor-pointer")}
                onClick={() => {
                  if (hasEvents && onEventClick) {
                    onEventClick(dayEvents[0]);
                  }
                }}
              >
                <div
                  className={cn(
                    "h-full w-full flex flex-col justify-start items-center rounded-md p-1",
                    isToday && "border-2 border-primary",
                    hasEvents && "bg-base-200 hover:bg-base-300"
                  )}
                >
                  <div className="relative w-full flex justify-center">
                    <span className={cn("text-sm font-medium", isToday && "text-primary")}>{day}</span>
                  </div>

                  {hasEvents && (
                    <div className="mt-1 w-full">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="bg-primary/20 text-primary text-xs mb-1 truncate rounded px-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                        >
                          {event.title.substring(0, 8)}
                          {event.title.length > 8 && '...'}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-base-content/70 text-center">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
