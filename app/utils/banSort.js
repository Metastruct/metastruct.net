// permanent bans do not share one timestamp: the sentinel is 1900000000 but hardbans
// carry arbitrary far future dates that overlap real expiries, so sorting on the raw
// value interleaves rows that all read "permanent". Group them at the far end instead.
export function sortExpires(a, b, isAsc) {
  const rank = ban => (ban.permanent ? Infinity : ban.unbanAt);
  const av = rank(a);
  const bv = rank(b);
  // both permanent, order by when the ban was issued so the grouping stays stable
  const [x, y] = av === bv ? [a.bannedAt, b.bannedAt] : [av, bv];
  if (x === y) return 0;
  return (x < y ? -1 : 1) * (isAsc ? 1 : -1);
}

export function compareBans(field, isAsc) {
  if (field === "unbanAt") return (a, b) => sortExpires(a, b, isAsc);
  return (a, b) => {
    const left = a[field] ?? "";
    const right = b[field] ?? "";
    if (left === right) return 0;
    const order =
      typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left).localeCompare(String(right));
    return isAsc ? order : -order;
  };
}
