export function generateSparkline(base = 50, variance = 15, points = 7) {
  let current = base;
  return Array.from({ length: points }, () => {
    current = Math.max(5, current + Math.round((Math.random() - 0.5) * variance));
    return { value: current };
  });
}

export function generateRevenueTrend(days = 7) {
  const base = 50000;
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      revenue: Math.round(base + (Math.random() - 0.4) * 30000),
    };
  });
}

export function generatePatientStats(days = 7) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      newPatients: Math.round(5 + Math.random() * 15),
      returningPatients: Math.round(8 + Math.random() * 20),
    };
  });
}

export function generateDepartmentRevenue() {
  return [
    { name: 'Cardiology', revenue: 125000 },
    { name: 'Orthopedics', revenue: 98000 },
    { name: 'Neurology', revenue: 82000 },
    { name: 'General Medicine', revenue: 65000 },
    { name: 'Pediatrics', revenue: 54000 },
    { name: 'Dermatology', revenue: 41000 },
  ];
}

export function generatePaymentBreakdown() {
  return [
    { method: 'Cash', total: 45 },
    { method: 'Card', total: 30 },
    { method: 'Insurance', total: 15 },
    { method: 'UPI', total: 10 },
  ];
}

export function generateLowStockData() {
  return [
    { name: 'Paracetamol', stock: 12 },
    { name: 'Amoxicillin', stock: 8 },
    { name: 'Metformin', stock: 25 },
    { name: 'Omeprazole', stock: 5 },
    { name: 'Ibuprofen', stock: 18 },
  ];
}
