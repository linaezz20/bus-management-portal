import React from 'react';
import dayjs from 'dayjs';

const DateSelector = ({ selectedDate, onChange }) => {
  const handleDateChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="date-selector">
      <input
        type="date"
        value={selectedDate || dayjs().format('YYYY-MM-DD')}
        onChange={handleDateChange}
        max={dayjs().format('YYYY-MM-DD')}
      />
    </div>
  );
};

export default DateSelector;