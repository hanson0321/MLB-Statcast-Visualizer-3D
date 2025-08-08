// src/components/PitchArsenal.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from './AnimatedCard';

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

const StatItem = ({ label, value, unit = '' }) => (
  <div className="flex justify-between text-sm">
    <span className="text-slate-400">{label}</span>
    <span className="font-semibold text-white">{value != null ? `${value}${unit}` : 'N/A'}</span>
  </div>
);

export function PitchArsenal({ data, pitcherName }) {
  return (
    <AnimatedCard className="bg-slate-950/50 border-slate-800">
      <CardHeader>
        {/* 【修正處】加入 text-white class */}
        <CardTitle className="text-2xl sm:text-3xl text-center text-white">{pitcherName}'s Pitch Arsenal</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((pitch) => (
          <div key={pitch.pitch_name} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center mb-3">
              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PITCH_TYPE_COLORS[pitch.pitch_name] || '#9e9e9e' }}></div>
              <h4 className="font-bold text-lg text-white">{pitch.pitch_name}</h4>
              <span className="ml-auto text-base font-bold text-cyan-400">{pitch.usage_percentage}%</span>
            </div>
            <div className="space-y-1">
              <StatItem label="Avg. Velo" value={pitch.avg_speed} unit=" mph" />
              <StatItem label="Max Velo" value={pitch.max_speed} unit=" mph" />
              <StatItem label="Avg. Spin" value={pitch.avg_spin} unit=" rpm" />
              <StatItem label="Horz. Break" value={pitch.avg_pfx_x} unit=" in" />
              <StatItem label="Vert. Break" value={pitch.avg_pfx_z} unit=" in" />
            </div>
          </div>
        ))}
      </CardContent>
    </AnimatedCard>
  );
}