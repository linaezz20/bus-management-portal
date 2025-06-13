 import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export const checkEmployeeStatus = (employee, scans, selectedDate) => {
    const TUNIS_TZ = 'Africa/Tunis';
    const currentDay = dayjs(selectedDate).tz(TUNIS_TZ).startOf('day');
    const dayOfWeek = currentDay.day();

    // Récupérer l'horaire du jour
    const schedule = getDaySchedule(employee, dayOfWeek);
    const dailyScans = scans.filter(scan =>
        dayjs(scan.timestamp).tz(TUNIS_TZ).isSame(currentDay, 'day') &&
        scan.nfcToken === employee.nfcToken
    );

    // Cas jour de repos
    if (!schedule || schedule === "Repos") {
        return {
            status: "dayoff",
            message: "Repos",
            color: "#FFC107",
            isValid: false,
            schedule: schedule
        };
    }

    // Cas horaire normal
    if (schedule.includes("_")) {
        const startTime = schedule.split("_")[0].trim();
        const [startHour, startMin] = startTime.split(":").map(Number);

        // Fenêtre de validation ±30min
        const validationStart = currentDay
            .hour(startHour)
            .minute(startMin)
            .subtract(30, 'minute');

        const validationEnd = validationStart.add(60, 'minute');

        const validScans = dailyScans.filter(scan => {
            const scanTime = dayjs(scan.timestamp).tz(TUNIS_TZ);
            return scanTime.isBetween(validationStart, validationEnd, null, '[]');
        });

        return {
            status: validScans.length > 0 ? "present" : "absent",
            message: validScans.length > 0 ? "Présent" : "Absent",
            color: validScans.length > 0 ? "#28A745" : "#DC3545",
            isValid: validScans.length > 0,
            schedule: schedule,
            scanTimes: validScans.map(s => dayjs(s.timestamp).tz(TUNIS_TZ).format("HH:mm")),
            validationWindow: `Fenêtre: ${validationStart.format("HH:mm")} - ${validationEnd.format("HH:mm")}`
        };
    }

    return {
        status: "invalid",
        message: "Horaire invalide",
        color: "#6C757D",
        isValid: false,
        schedule: schedule
    };
};

// Helper function
const getDaySchedule = (employee, dayOfWeek) => {
    const schedules = [
        employee.dimanche, // 0: Dimanche
        employee.lundi,    // 1: Lundi
        employee.mardi,    // 2: Mardi
        employee.mercredi, // 3: Mercredi
        employee.jeudi,    // 4: Jeudi
        employee.vendredi, // 5: Vendredi
        employee.samedi    // 6: Samedi
    ];
    return schedules[dayOfWeek] || null;
};