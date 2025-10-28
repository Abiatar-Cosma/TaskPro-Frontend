import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RAD = Math.PI / 180;
const renderLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  if (!Number.isFinite(percent)) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Piechart = ({ data = [], colors = [] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        labelLine={false}
        label={renderLabel}
        outerRadius="70%"
        dataKey="value"
      >
        {data.map((_, i) => (
          <Cell
            key={i}
            fill={
              colors.length ? colors[i % colors.length] : 'var(--accent-color)'
            }
          />
        ))}
      </Pie>
    </PieChart>
  </ResponsiveContainer>
);

export default Piechart;
