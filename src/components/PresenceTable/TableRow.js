 import React from 'react';
import { checkEmployeeStatus } from '../../utils/employeeStatus';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const TableRow = ({ employee, scans, selectedDate }) => {
  const renderScheduleWithStatus = (schedule, dayOfWeek) => {
    const status = checkEmployeeStatus(employee, scans, selectedDate); // Use the passed 'employee'
    const isCurrentDay = dayjs(selectedDate).day() === dayOfWeek;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{schedule || 'N/A'}</span>
        {isCurrentDay && (
          <span style={{
            color: status.color,
            fontWeight: 'bold',
            fontSize: '1.2em'
          }}>
            {status.isValid ? '✓' : '✗'}
          </span>
        )}
      </div>
    );
  };

  return (
    <tr>
      <td>{employee.matricule}</td>
      <td>{employee.immatricule}</td>
      <td>{employee.name}</td>
      <td>{employee.tel}</td>
      <td>{renderScheduleWithStatus(employee.samedi, 6)}</td>
      <td>{renderScheduleWithStatus(employee.dimanche, 0)}</td>
      <td>{renderScheduleWithStatus(employee.lundi, 1)}</td>
      <td>{renderScheduleWithStatus(employee.mardi, 2)}</td>
      <td>{renderScheduleWithStatus(employee.mercredi, 3)}</td>
      <td>{renderScheduleWithStatus(employee.jeudi, 4)}</td>
      <td>{renderScheduleWithStatus(employee.vendredi, 5)}</td>
      <td>
        <button className="details-button" onClick={() => handleViewDetails(employee)}>
          ℹ️
        </button>
      </td>
    </tr>
  );
};
export default TableRow; 