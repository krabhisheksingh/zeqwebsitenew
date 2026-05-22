import React, { useState } from 'react';

const CustomDateInput = ({
  value,
  onChange,
  className = '',
  placeholder = 'DD/MM/YYYY',
  required = false,
  style = {},
  disabled = false,
  id,
  leftOffset = 'pl-4',
  fontSize = 'text-sm'
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Convert YYYY-MM-DD -> DD/MM/YYYY
  const displayValue = () => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return value;
  };

  const isTextHidden = !isFocused;

  return (
    <div className="relative w-full">
      <input
        type="date"
        id={id}
        value={value || ''}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        disabled={disabled}
        style={{
          ...style,
          colorScheme: 'dark',
        }}
        className={`${className} ${
          isTextHidden ? 'text-transparent hide-date-text select-none' : 'text-white'
        } transition-colors`}
      />
      {isTextHidden && (
        <div className={`absolute inset-y-0 left-0 flex items-center ${leftOffset} pointer-events-none text-white ${fontSize}`}>
          {value ? (
            <span>{displayValue()}</span>
          ) : (
            <span className="text-white/40">{placeholder}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDateInput;
