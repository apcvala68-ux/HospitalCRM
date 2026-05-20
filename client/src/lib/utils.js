export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function displayPhone(phone) {
  if (!phone || typeof phone !== 'string') return '—';
  phone = phone.trim();
  if (!phone) return '—';
  if (phone.startsWith('+')) return phone;
  return '+91 ' + phone.replace(/^0+/, '');
}
