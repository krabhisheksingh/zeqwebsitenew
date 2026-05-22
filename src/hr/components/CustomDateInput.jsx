import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const CustomDateInput = ({
  value,
  onChange,
  className = '',
  placeholder = 'DD/MM/YYYY',
  required = false,
  disabled = false,
  id,
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef(null);

  // Convert ISO YYYY-MM-DD -> display format DD/MM/YYYY
  const getDisplayValue = (isoVal) => {
    if (!isoVal) return '';
    const parts = isoVal.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoVal;
  };

  const [inputValue, setInputValue] = useState(getDisplayValue(value));

  // Sync prop changes (e.g. form resets) to local state
  useEffect(() => {
    setInputValue(getDisplayValue(value));
    if (value) {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        setCurrentMonth(parsedDate);
      }
    }
  }, [value]);

  // Click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        validateAndTrigger();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue]);

  const validateAndTrigger = () => {
    if (inputValue) {
      const parts = inputValue.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        const parsed = new Date(y, m - 1, d);
        if (
          !isNaN(parsed.getTime()) &&
          parsed.getDate() === d &&
          parsed.getMonth() === m - 1 &&
          parsed.getFullYear() === y &&
          parts[2].length === 4
        ) {
          onChange({ target: { value: isoDate } });
          return;
        }
      }
      // Revert if invalid
      setInputValue(getDisplayValue(value));
    } else {
      onChange({ target: { value: '' } });
    }
  };

  const handleInputChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // digits only
    if (val.length > 8) val = val.substring(0, 8);

    let formatted = '';
    if (val.length > 0) {
      formatted += val.substring(0, 2);
    }
    if (val.length > 2) {
      formatted += '/' + val.substring(2, 4);
    }
    if (val.length > 4) {
      formatted += '/' + val.substring(4, 8);
    }

    setInputValue(formatted);

    if (formatted.length === 10) {
      const parts = formatted.split('/');
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      const parsed = new Date(y, m - 1, d);
      if (
        !isNaN(parsed.getTime()) &&
        parsed.getDate() === d &&
        parsed.getMonth() === m - 1 &&
        parsed.getFullYear() === y
      ) {
        onChange({ target: { value: isoDate } });
      }
    } else if (formatted.length === 0) {
      onChange({ target: { value: '' } });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      validateAndTrigger();
      setIsOpen(false);
    }
  };

  // Calendar logic
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const handlePrevMonth = (e) => {
    e.preventDefault();
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handlePrevYear = (e) => {
    e.preventDefault();
    setCurrentMonth(new Date(year - 1, month, 1));
  };

  const handleNextYear = (e) => {
    e.preventDefault();
    setCurrentMonth(new Date(year + 1, month, 1));
  };

  const handleDateSelect = (dateStr) => {
    onChange({ target: { value: dateStr } });
    setIsOpen(false);
  };

  const handleSelectToday = (e) => {
    e.preventDefault();
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    onChange({ target: { value: dateStr } });
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.preventDefault();
    onChange({ target: { value: '' } });
    setInputValue('');
    setIsOpen(false);
  };

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        id={id}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={validateAndTrigger}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={style}
        className={`${className} pr-10`}
      />
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
      >
        <Calendar className="w-4 h-4" />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 z-50 mt-2 w-64 rounded-2xl border border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-xl"
          onMouseDown={(e) => e.preventDefault()} // prevent focus loss
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-0.5">
              <button 
                type="button" 
                onClick={handlePrevYear} 
                className="p-1 text-white/40 hover:text-white hover:bg-white/5 rounded transition-colors"
                title="Previous Year"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                onClick={handlePrevMonth} 
                className="p-1 text-white/40 hover:text-white hover:bg-white/5 rounded transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <span className="font-heading font-bold text-white text-xs">
              {monthsList[month]} {year}
            </span>

            <div className="flex gap-0.5">
              <button 
                type="button" 
                onClick={handleNextMonth} 
                className="p-1 text-white/40 hover:text-white hover:bg-white/5 rounded transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                onClick={handleNextYear} 
                className="p-1 text-white/40 hover:text-white hover:bg-white/5 rounded transition-colors"
                title="Next Year"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase font-bold text-white/40 mb-2">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-3">
            {days.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="w-8 h-8" />;
              }

              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              const isSelected = value === dateStr;
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDateSelect(dateStr)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors font-medium ${
                    isSelected
                      ? 'bg-accent text-white font-bold'
                      : isToday
                        ? 'border border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/10'
                        : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Calendar Actions */}
          <div className="flex justify-between items-center border-t border-white/5 pt-2 text-[11px]">
            <button 
              type="button" 
              onClick={handleSelectToday} 
              className="text-accent-cyan hover:underline font-semibold"
            >
              Today
            </button>
            <button 
              type="button" 
              onClick={handleClear} 
              className="text-white/40 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDateInput;
