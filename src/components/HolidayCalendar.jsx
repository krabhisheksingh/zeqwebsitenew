import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Plus, X, Bell, FileText, Trash2 } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, parse, subMonths, addMonths } from 'date-fns';
import { HOLIDAYS_2026, getSession, getCalendarEvents, addCalendarEvent, deleteCalendarEvent, markCalendarEventTriggered } from '../hr/utils/hrStorage';
import toast from 'react-hot-toast';
import { playRingtone } from '../utils/audioUtils';

export default function HolidayCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newNote, setNewNote] = useState('');
  const [newAlarmTime, setNewAlarmTime] = useState('');
  const [ringtone, setRingtone] = useState(() => localStorage.getItem('alarmRingtone') || 'beep');
  
  const session = getSession();

  const fetchEvents = async () => {
    if (!session?.employeeId) return;
    try {
      const data = await getCalendarEvents(session.employeeId);
      setEvents(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [session?.employeeId]);

  // Alarm System Polling
  useEffect(() => {
    const checkAlarms = async () => {
      const now = new Date();
      const todayStr = format(now, 'dd-MM-yyyy');
      const timeStr = format(now, 'HH:mm');

      for (const ev of events) {
        if (ev.date === todayStr && ev.alarmTime === timeStr && !ev.isTriggered) {
          const preferredTone = localStorage.getItem('alarmRingtone') || 'beep';
          playRingtone(preferredTone);
          
          toast.success(`Alarm: ${ev.note}`, {
            duration: 10000,
            icon: '🔔',
            style: { background: 'var(--color-card)', color: 'var(--color-foreground)', border: '1px solid var(--color-accent-gold)' }
          });
          // Mark as triggered in DB
          try {
            await markCalendarEventTriggered(ev.id);
            setEvents(prev => prev.map(p => p.id === ev.id ? { ...p, isTriggered: true } : p));
          } catch(e) {}
        }
      }
    };
    
    // Check every 30 seconds
    const interval = setInterval(checkAlarms, 30000);
    checkAlarms();
    return () => clearInterval(interval);
  }, [events]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const exportICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Zexora Quvixo//Holiday Calendar//EN\n";
    HOLIDAYS_2026.forEach(h => {
      const [day, month, year] = h.date.split('-');
      const dateStr = `${year}${month}${day}`;
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `DTSTART;VALUE=DATE:${dateStr}\n`;
      icsContent += `DTEND;VALUE=DATE:${dateStr}\n`;
      icsContent += `SUMMARY:${h.name}\n`;
      icsContent += "END:VEVENT\n";
    });
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Zexora_Quvixo_Holidays_2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDayClick = (dayStr) => {
    setSelectedDateStr(dayStr);
    setIsModalOpen(true);
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) {
      toast.error('Note cannot be empty');
      return;
    }
    if (!session?.employeeId) {
      toast.error('You must be logged in to save notes');
      return;
    }

    const eventData = {
      employeeId: session.employeeId,
      date: selectedDateStr,
      note: newNote,
      alarmTime: newAlarmTime || null,
      isTriggered: false
    };
    try {
      const id = await addCalendarEvent(eventData);
      setEvents([...events, { ...eventData, id }]);
      setNewNote('');
      setNewAlarmTime('');
      toast.success('Note added successfully');
    } catch (e) {
      toast.error('Failed to save note');
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteCalendarEvent(id);
      setEvents(events.filter(e => e.id !== id));
      toast.success('Note deleted');
    } catch (e) {
      toast.error('Failed to delete note');
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      const dayStr = format(cloneDay, 'dd-MM-yyyy');
      const holiday = HOLIDAYS_2026.find(h => h.date === dayStr);
      const dayEvents = events.filter(e => e.date === dayStr);

      days.push(
        <div
          key={day.toString()}
          onClick={() => handleDayClick(dayStr)}
          className={`relative p-3 h-24 border border-foreground/5 flex flex-col justify-start items-start rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
            !isSameMonth(day, monthStart)
              ? "opacity-30 bg-background/50"
              : isSameDay(day, new Date())
              ? "bg-accent/10 border-accent/20 text-accent font-bold"
              : "bg-background/40 hover:bg-foreground/5"
          } ${holiday ? 'ring-2 ring-accent-gold/50 bg-accent-gold/10' : ''}`}
        >
          <span className="text-sm z-10">{formattedDate}</span>
          
          {holiday && (
            <div className="mt-1 w-full text-[10px] leading-tight text-accent-gold font-semibold bg-accent-gold/20 px-1.5 py-0.5 rounded backdrop-blur-md truncate">
              {holiday.name}
            </div>
          )}
          
          {dayEvents.length > 0 && (
            <div className="absolute bottom-2 right-2 flex gap-1">
              {dayEvents.slice(0,3).map((e, idx) => (
                <div key={idx} className="w-2 h-2 rounded-full bg-accent-cyan"></div>
              ))}
              {dayEvents.length > 3 && <span className="text-[8px] text-foreground/50">+</span>}
            </div>
          )}
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 gap-2 mb-2" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <>
      <div className="glass-panel rounded-3xl overflow-hidden p-6 relative z-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="font-heading font-bold text-2xl text-foreground">Official Calendar</h3>
            <p className="text-foreground/50 text-sm mt-1">Plan your year and track holidays</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-foreground/5 rounded-xl p-1 border border-foreground/10">
              <button onClick={prevMonth} className="p-2 hover:bg-background rounded-lg transition-colors text-foreground">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 font-heading font-semibold min-w-[140px] text-center text-foreground">
                {format(currentDate, "MMMM yyyy")}
              </span>
              <button onClick={nextMonth} className="p-2 hover:bg-background rounded-lg transition-colors text-foreground">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button 
              onClick={exportICS}
              className="flex items-center gap-2 bg-gradient-to-r from-accent-cyan to-accent text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="w-4 h-4" />
              Export Holidays
            </button>
          </div>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
              <div key={dayName} className="text-center text-xs font-semibold uppercase tracking-widest text-foreground/40 py-2">
                {dayName}
              </div>
            ))}
          </div>
          <div className="w-full">{rows}</div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-foreground/10 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-foreground/50 hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold font-heading mb-1 text-foreground">{selectedDateStr}</h3>
            <p className="text-sm text-foreground/50 mb-6">Notes & Alarms</p>

            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {events.filter(e => e.date === selectedDateStr).length === 0 ? (
                <div className="text-center py-6 text-foreground/30 text-sm">
                  No notes for this day.
                </div>
              ) : (
                events.filter(e => e.date === selectedDateStr).map(ev => (
                  <div key={ev.id} className="bg-foreground/5 rounded-xl p-4 border border-foreground/10 group">
                    <div className="flex justify-between items-start mb-2">
                      {ev.alarmTime ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-accent-gold bg-accent-gold/10 px-2 py-1 rounded-md">
                          <Bell className="w-3 h-3" />
                          {ev.alarmTime} {ev.isTriggered && '(Triggered)'}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/50 bg-foreground/5 px-2 py-1 rounded-md">
                          <FileText className="w-3 h-3" /> Note
                        </div>
                      )}
                      <button 
                        onClick={() => handleDeleteNote(ev.id)}
                        className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-400/10 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-foreground text-sm whitespace-pre-wrap">{ev.note}</p>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-foreground/10">
              <div>
                <label className="block text-xs uppercase tracking-widest text-foreground/50 font-bold mb-2">Add Note</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-foreground text-sm resize-none"
                  placeholder="What do you need to remember?"
                  rows="3"
                ></textarea>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs uppercase tracking-widest text-foreground/50 font-bold mb-2">Set Alarm (Optional)</label>
                  <input
                    type="time"
                    value={newAlarmTime}
                    onChange={(e) => setNewAlarmTime(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-foreground text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs uppercase tracking-widest text-foreground/50 font-bold mb-2 flex justify-between">
                    <span>Ringtone</span>
                    <button 
                      onClick={() => playRingtone(ringtone)} 
                      className="text-accent hover:text-accent-cyan transition-colors"
                      title="Test Ringtone"
                    >
                      ▶ Test
                    </button>
                  </label>
                  <select
                    value={ringtone}
                    onChange={(e) => { 
                      setRingtone(e.target.value); 
                      localStorage.setItem('alarmRingtone', e.target.value); 
                      playRingtone(e.target.value);
                    }}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-accent text-foreground text-sm appearance-none"
                  >
                    <option value="beep">Classic Beep</option>
                    <option value="chime">Gentle Chime</option>
                    <option value="buzzer">Urgent Buzzer</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={handleSaveNote}
                className="w-full py-3 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
