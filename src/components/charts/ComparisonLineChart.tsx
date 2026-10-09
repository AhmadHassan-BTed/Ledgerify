import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

interface ComparisonLineChartProps {
  data: {
    month: string;
    revenueA: number;
    revenueB: number;
  }[];
  nameA: string;
  nameB: string;
  currA?: string;
  currB?: string;
}

export const ComparisonLineChart: React.FC<ComparisonLineChartProps> = ({
  data,
  nameA,
  nameB,
  currA = '£',
  currB = '$'
}) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#272732" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#272732' }}
          />
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#121217',
              borderColor: '#323242',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#f4f4f5',
              boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
            }}
            formatter={(val: any, name: any) => {
              const prefix = name === nameA ? currA : currB;
              return [`${prefix}${Number(val).toLocaleString()}`, name];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="revenueA"
            name={nameA}
            stroke="#a855f7"
            strokeWidth={3}
            dot={{ r: 4, fill: '#a855f7' }}
            activeDot={{ r: 6, fill: '#c084fc' }}
          />
          <Line
            type="monotone"
            dataKey="revenueB"
            name={nameB}
            stroke="#06b6d4"
            strokeWidth={3}
            dot={{ r: 4, fill: '#06b6d4' }}
            activeDot={{ r: 6, fill: '#67e8f9' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
