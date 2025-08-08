// src/components/TaleOfTheTape.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from './AnimatedCard';

const StatRow = ({ label, value, toFixed = null }) => (
  <div className="flex justify-between items-baseline py-2 border-b border-slate-800">
    <span className="text-slate-400">{label}</span>
    <span className="text-xl font-bold text-white">
      {typeof value === 'number' ? (toFixed !== null ? value.toFixed(toFixed) : value) : (value ?? 'N/A')}
    </span>
  </div>
);

const PlayerCard = ({ stats, borderColor }) => {
  if (!stats || stats.error) return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-4">
      <div className="w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center mb-4">
        <span className="text-5xl text-slate-500">?</span>
      </div>
      <h3 className="text-xl font-bold text-center text-slate-500">No Data</h3>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col items-center p-6 bg-slate-900/50 rounded-xl">
      <div className="relative mb-4">
        {stats.image_url ? (
          <img src={stats.image_url} alt={stats.name} className={`w-32 h-32 rounded-full object-cover border-4 ${borderColor} shadow-lg shadow-black/50`} />
        ) : (
          <div className={`w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center border-4 ${borderColor}`}>
            <span className="text-5xl text-slate-500">?</span>
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-center text-white mb-6" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{stats.name}</h3>
      <div className="w-full space-y-2">
        {stats.type === 'pitcher' ? (
          <>
            {stats.ERA !== undefined ? (
              <>
                <StatRow label="Record (W-L)" value={`${stats.W}-${stats.L}`} />
                <StatRow label="ERA" value={stats.ERA} toFixed={2} />
                <StatRow label="Strikeouts (SO)" value={stats.SO} />
                <StatRow label="WHIP" value={stats.WHIP} toFixed={2} />
              </>
            ) : (
              <>
                <StatRow label="Innings Pitched (IP)" value={stats.IP} toFixed={1} />
                <StatRow label="Strikeouts (SO)" value={stats.SO} />
                <StatRow label="WHIP" value={stats.WHIP} toFixed={2} />
                <StatRow label="K/9" value={stats['K/9']} toFixed={2} />
              </>
            )}
          </>
        ) : (
          <>
            <StatRow label="Batting Avg. (AVG)" value={stats.AVG} toFixed={3} />
            <StatRow label="Home Runs (HR)" value={stats.HR} />
            <StatRow label="RBIs" value={stats.RBI} />
            <StatRow label="On-Base Pct. (OBP)" value={stats.OBP} toFixed={3} />
            <StatRow label="Slugging Pct. (SLG)" value={stats.SLG} toFixed={3} />
            <StatRow label="OPS" value={stats.OPS} toFixed={3} />
          </>
        )}
      </div>
    </div>
  );
};

export function TaleOfTheTape({ pitcherStats, batterStats }) {
  return (
    <AnimatedCard className="bg-transparent border-none shadow-none">
      <CardHeader>
        {/* 【修正處】加入 text-white class */}
        <CardTitle className="text-3xl sm:text-4xl text-center font-bold text-white">Tale of the Tape</CardTitle>
        <p className="text-center text-slate-400">Season Overview</p>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-stretch gap-8 p-0 mt-6">
        <PlayerCard stats={pitcherStats} borderColor="border-cyan-500" />
        <div className="flex items-center justify-center">
            <span className="text-5xl font-black text-slate-700">VS</span>
        </div>
        <PlayerCard stats={batterStats} borderColor="border-orange-500" />
      </CardContent>
    </AnimatedCard>
  );
}