import React from 'react';

const WeekSelector = ({ selectedWeek, onChange }) => {
  const handleChange = (e) => {
    if (typeof onChange === 'function') {
      onChange(e.target.value);
    }
  };

  return (
    <input
      type="week"
      value={selectedWeek}
      onChange={handleChange}
      className="week-input"
      min="2023-01" // Adaptez selon vos besoins
    />
  );
};

export default WeekSelector;