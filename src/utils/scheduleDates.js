export const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

export const parseLocalDate = (dateStr) => {
  const [y, m, d] = String(dateStr).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const toDateInput = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const expandDateRange = (fromDate, toDate, weekdays = [1, 2, 3, 4, 5]) => {
  const from = parseLocalDate(fromDate);
  const to = parseLocalDate(toDate);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    return [];
  }

  const daySet = new Set((weekdays || []).map(Number));
  const dates = [];
  const cur = new Date(from);

  while (cur <= to) {
    if (daySet.has(cur.getDay())) {
      dates.push(toDateInput(cur));
    }
    cur.setDate(cur.getDate() + 1);
  }

  return dates;
};

export const previewScheduleDates = (form) => {
  if (form.mode === "single" && form.date) {
    return [form.date];
  }
  if (form.mode === "range" && form.fromDate && form.toDate) {
    const rangeDates = expandDateRange(form.fromDate, form.toDate, form.weekdays);
    const extra = (form.extraDates || []).filter(Boolean);
    return [...new Set([...rangeDates, ...extra])].sort();
  }
  return [];
};
