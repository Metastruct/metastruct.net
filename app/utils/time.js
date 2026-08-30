// Shared rendering for the unix second timestamps on ban records.

export function day(ts) {
  if (!ts) return "-";
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

export function absolute(ts) {
  if (!ts) return "-";
  return new Date(ts * 1000).toLocaleString();
}

export function until(ts) {
  if (!ts) return "-";
  const diff = ts * 1000 - Date.now();
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor(abs / 3600000);
  const label =
    days >= 365
      ? `${Math.round(days / 365)} y`
      : days >= 1
        ? `${days} d`
        : hours >= 1
          ? `${hours} h`
          : `${Math.max(1, Math.round(abs / 60000))} min`;
  return diff > 0 ? `in ${label}` : `${label} ago`;
}
