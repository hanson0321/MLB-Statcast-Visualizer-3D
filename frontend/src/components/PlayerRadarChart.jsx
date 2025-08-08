// frontend/src/components/PlayerRadarChart.jsx
import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

// 自定義 Tooltip 元件
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const playerData = payload.find(p => p.dataKey === 'percentile');
    if (!playerData) return null;
    
    return (
      <div className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-sm">
        <p className="font-bold text-white">{label}</p>
        <p className="text-cyan-400">{`聯盟 PR 值: ${playerData.value}`}</p>
        <p className="text-slate-300">{`實際數值: ${playerData.payload.player_value}`}</p>
      </div>
    );
  }
  return null;
};

export const PlayerRadarChart = ({ playerName }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playerName) return;

    const fetchRadarData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/player-radar-stats?player_name=${encodeURIComponent(playerName)}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || '無法獲取雷達圖數據');
        }
        const result = await response.json();
        
        // 將聯盟平均 (PR 50) 加入到數據中
        const chartData = result.data.map(item => ({
          ...item,
          league_avg: 50,
        }));
        setData(chartData);

      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRadarData();
  }, [playerName]);

  if (loading) {
    return <div className="flex justify-center items-center h-[350px]"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-[350px] text-sm text-red-400">{error}</div>;
  }

  if (!data) {
    return <div className="flex justify-center items-center h-[350px] text-sm text-slate-500">無可用數據</div>;
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 14 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} />
          
          {/* 聯盟平均的雷達圖 (虛線) */}
          <Radar name="聯盟平均" dataKey="league_avg" stroke="#94a3b8" fill="transparent" strokeDasharray="3 3" />
          
          {/* 球員的雷達圖 (實心) */}
          <Radar name={playerName} dataKey="percentile" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.6} />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }}/>
        </RadarChart>
      </ResponsiveContainer>
      <p className="text-xs text-center text-slate-500 mt-2">
        * PR 值 (Percentile Rank) 代表該球員此項數據在聯盟中的百分等級。
      </p>
    </div>
  );
};
