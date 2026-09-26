import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// SAMPLE DATA ONLY — illustrative shape, not results from the project.
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function sampleSeries(seed: number) {
  return months.map((m, i) => {
    const base = 100 + i * 6 + Math.sin((i + seed) * 0.9) * 14;
    const actual = Math.round(base + Math.cos((i + seed) * 1.7) * 6);
    const forecast = Math.round(base + Math.sin((i + seed) * 1.3) * 4);
    return { month: m, Actual: i < 10 ? actual : null, Forecast: forecast };
  });
}

export default function ForecastChart({ seed = 0 }: { seed?: number }) {
  const data = sampleSeries(seed);
  return (
    <div className="h-56 w-full" role="img" aria-label="Actual versus forecast line chart using sample data">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'var(--line)' }} />
          <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line-strong)', borderRadius: 6, fontSize: 12 }}
            labelStyle={{ color: 'var(--ink)' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="Actual" stroke="#1f9d58" strokeWidth={2.5} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="Forecast" stroke="var(--teal)" strokeWidth={2} strokeDasharray="5 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
