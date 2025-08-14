// frontend/src/components/PitchStrategy.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from './AnimatedCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// 格式化數據以符合圖表需求
const formatDataForChart = (data) => {
  if (!data) return [];
  return Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // 只顯示前 5 名
};

const pitchColors = {
  'FF': '#d9534f', 'SI': '#f0ad4e', 'FT': '#f0ad4e', 'FC': '#5bc0de', 
  'SL': '#5bc0de', 'ST': '#5bc0de', 'CU': '#428bca', 'KC': '#428bca', 
  'CH': '#5cb85c', 'FS': '#5cb85c', 'SV': '#4da6ff',
};

const StrategyChart = ({ title, data }) => {
  const chartData = formatDataForChart(data);

  if (chartData.length === 0) {
    return (
      <AnimatedCard className="bg-slate-900 border-slate-800 h-full">
        <CardHeader><CardTitle className="text-xl text-center text-white">{title}</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-slate-500">無可用數據</p>
        </CardContent>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="bg-slate-900 border-slate-800">
      <CardHeader><CardTitle className="text-xl text-center text-white">{title}</CardTitle></CardHeader>
      <CardContent style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer>
          <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#cbd5e1' }} />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
              labelStyle={{ color: '#cbd5e1' }}
              formatter={(value) => [`${value.toFixed(1)}%`, '使用率']}
            />
            <Bar dataKey="value" background={{ fill: '#334155' }}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pitchColors[entry.name] || '#8884d8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </AnimatedCard>
  );
};

export const PitchStrategy = ({ data }) => {
  if (!data || data.message) {
    return (
        <AnimatedCard className="bg-slate-950/50 border-slate-800">
            <CardContent className="flex items-center justify-center h-96">
                <p className="text-slate-500">{data?.message || "無投球策略數據"}</p>
            </CardContent>
        </AnimatedCard>
    );
  }
  
  const analysisTitle = `對決 ${data.analysis_target || '策略分析'}`;

  return (
    <AnimatedCard className="bg-slate-950/50 border-slate-800">
        <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-center text-white">{analysisTitle}</CardTitle>
            <p className="text-sm text-center text-slate-400">分析投手在本賽季面對此類型打者時的投球習慣</p>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <StrategyChart title="第一球策略 (搶好球數)" data={data.first_pitch} />
                <StrategyChart title="兩好球後策略 (決勝球)" data={data.two_strikes} />
                <StrategyChart title="最終三振球路" data={data.strikeout_pitch} />
            </div>
        </CardContent>
    </AnimatedCard>
  );
};
