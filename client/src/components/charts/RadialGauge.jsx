import Chart from 'react-apexcharts';

export function RadialGauge({ percentage = 0, size = 120, color = '#2563eb', label = '' }) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <Chart
        options={{
          chart: { type: 'radialBar', sparkline: { enabled: true } },
          colors: [color],
          plotOptions: {
            radialBar: {
              hollow: { size: '55%' },
              track: { background: 'var(--color-muted)' },
              dataLabels: {
                show: true,
                name: { show: false },
                value: {
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--color-foreground)',
                  offsetY: 0,
                  formatter: () => `${percentage}%`,
                },
              },
            },
          },
          stroke: { lineCap: 'round' },
          tooltip: { enabled: false },
        }}
        series={[percentage]}
        type="radialBar"
        height={size}
        width={size}
      />
      {label && (
        <span className="text-[11px] font-medium text-muted-foreground -mt-1">
          {label}
        </span>
      )}
    </div>
  );
}
