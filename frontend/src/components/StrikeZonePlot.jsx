// src/components/StrikeZonePlot.jsx
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
  ReferenceArea,
  Cell
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

const getPitchColor = (description) => {
  const desc = description ? description.toLowerCase() : '';
  if (desc.includes('strike')) return '#ef4444';
  if (desc.includes('ball') || desc.includes('walk')) return '#22c55e';
  if (desc.includes('hit') || desc.includes('play')) return '#3b82f6';
  return '#a8a29e';
};

export function StrikeZonePlot({ data }) {
  const strikeZone = { x1: -0.83, x2: 0.83, y1: 1.5, y2: 3.5 };

  const processedData = data.map(p => ({
    ...p,
    color: getPitchColor(p.description)
  }));

  return (
    <div style={{ width: '100%', height: 450 }}>
      {/* 【修正處】加入 text-white class */}
      <h3 className="text-xl font-bold text-center mb-4 text-white">Strike Zone (Catcher's View)</h3>
      <ResponsiveContainer>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
          
          <ReferenceArea 
            x1={strikeZone.x1} 
            x2={strikeZone.x2} 
            y1={strikeZone.y1} 
            y2={strikeZone.y2} 
            stroke="rgba(250, 204, 21, 0.5)" 
            strokeOpacity={0.8} 
            fill="rgba(250, 204, 21, 0.1)" 
          />
          
          <XAxis 
            type="number" 
            dataKey="plate_x" 
            name="Horizontal Location" 
            unit=" ft" 
            domain={[-2, 2]} 
            tick={{ fill: '#d1d5db' }}
          />
          <YAxis 
            type="number" 
            dataKey="plate_z" 
            name="Vertical Location" 
            unit=" ft" 
            domain={[0, 5]}
            tick={{ fill: '#d1d5db' }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
          />
          <Legend 
            payload={[
              { value: 'Strike/Whiff', type: 'circle', color: '#ef4444' },
              { value: 'Ball/Walk', type: 'circle', color: '#22c55e' },
              { value: 'In Play', type: 'circle', color: '#3b82f6' },
            ]}
          />
          
          <Scatter name="Pitches" data={processedData} fill="#8884d8">
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}