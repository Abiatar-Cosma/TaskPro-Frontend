import { Bar, Rectangle, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { Chart } from './Barchart.styled';

const Barchart = ({ data = [], colors = [] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <Chart data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar
        dataKey="value"
        activeBar={<Rectangle fill="var(--accent-color)" stroke="var(--loader-color)" />}
        label={{ position: 'top' }}
      >
        {data.map((_, i) => (
          <Cell key={i} fill={colors.length ? colors[i % colors.length] : 'var(--accent-color)'} />
        ))}
      </Bar>
    </Chart>
  </ResponsiveContainer>
);

export default Barchart;
