// src/components/PitchMovementChart.jsx
import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const PITCH_TYPE_COLORS = {
  '4-Seam Fastball': '#d50000',
  'Sinker': '#e65100',
  'Cutter': '#ffab00',
  'Slider': '#2962ff',
  'Sweeper': '#304ffe',
  'Slurve': '#536dfe',
  'Curveball': '#00b8d4',
  'Knuckle Curve': '#00bfa5',
  'Changeup': '#00c853',
  'Split-Finger': '#64dd17',
  'Other': '#9e9e9e'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-slate-800 border border-slate-700 rounded-md text-sm">
        <p className="font-bold" style={{ color: PITCH_TYPE_COLORS[data.pitch_name] || PITCH_TYPE_COLORS['Other'] }}>
          {data.pitch_name}
        </p>
        <p>Horz. Break: {data.pfx_x_in.toFixed(1)} in</p>
        <p>Vert. Break: {data.pfx_z_in.toFixed(1)} in</p>
      </div>
    );
  }
  return null;
};

export function PitchMovementChart({ data, leagueAvgData }) {
  const pitches = React.useMemo(() => {
    const groups = {};
    data.forEach(p => {
      if (!groups[p.pitch_name]) {
        groups[p.pitch_name] = [];
      }
      groups[p.pitch_name].push(p);
    });
    return Object.entries(groups);
  }, [data]);

  return (
    <div className="w-full h-[450px]">
       {/* 【修正處】加入 text-white class */}
       <h3 className="text-xl font-bold text-center mb-4 text-white">Pitch Movement (Pitcher's View)</h3>
      <ResponsiveContainer>
        <ScatterChart
          margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
          <XAxis 
            type="number" 
            dataKey="pfx_x_in" 
            name="Horizontal Break" 
            label={{ value: "Horz. Break (in)", position: 'insideBottom', offset: -10, fill: '#9ca3af' }}
            domain={[-25, 25]}
            tick={{ fill: '#d1d5db' }}
          />
          <YAxis 
            type="number" 
            dataKey="pfx_z_in" 
            name="Vertical Break" 
            // 【修正處】調整 offset 避免重疊
            label={{ value: 'Vert. Break (in)', angle: -90, position: 'insideLeft', offset: -10, fill: '#9ca3af' }}
            domain={[-25, 25]}
            tick={{ fill: '#d1d5db' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Legend iconSize={10} />
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" />
          <ReferenceLine x={0} stroke="#6b7280" strokeDasharray="2 2" />

          {pitches.map(([name, points]) => (
            <Scatter 
              key={name} 
              name={name} 
              data={points} 
              fill={PITCH_TYPE_COLORS[name] || PITCH_TYPE_COLORS['Other']} 
              shape="circle" 
            />
          ))}

          {leagueAvgData && Object.entries(leagueAvgData).map(([name, coords]) => (
             <Scatter 
              key={`avg-${name}`} 
              name={`${name} (League Avg)`} 
              data={[{ pfx_x_in: coords.pfx_x_in, pfx_z_in: coords.pfx_z_in }]} 
              fill={PITCH_TYPE_COLORS[name] || PITCH_TYPE_COLORS['Other']} 
              shape="cross" 
              legendType="cross"
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}