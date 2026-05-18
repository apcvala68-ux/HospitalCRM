import Chart from 'react-apexcharts';

export function Sparkline({ data, color = '#2563eb', height = 36 }) {
  if (!data || data.length === 0) return null;

  const series = [{ data: data.map(d => d.value) }];

  return (
    <Chart
      options={{
        chart: {
          type: 'line',
          sparkline: { enabled: true },
          toolbar: { show: false },
        },
        stroke: { curve: 'smooth', width: 1.5 },
        colors: [color],
        fill: {
          type: 'gradient',
          gradient: { shadeIntensity: 0, opacityFrom: 0.15, opacityTo: 0 },
        },
        tooltip: { enabled: false },
      }}
      series={series}
      type="area"
      height={height}
    />
  );
}
