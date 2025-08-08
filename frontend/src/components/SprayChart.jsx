// src/components/SprayChart.jsx
import React, { useState } from 'react';

// 樣式定義保持不變
const HIT_TYPE_STYLES = {
  'single': { name: '一壘安打', color: '#22c55e' },
  'double': { name: '二壘安打', color: '#3b82f6' },
  'triple': { name: '三壘安打', color: '#eab308' },
  'home_run': { name: '全壘打', color: '#ef4444' },
  'out': { name: '出局', color: '#a0aec0' }
};

const getHitStyle = (event) => {
  const evt = event ? event.toLowerCase() : 'out';
  if (evt.includes('home_run')) return HIT_TYPE_STYLES.home_run;
  if (evt.includes('double')) return HIT_TYPE_STYLES.double;
  if (evt.includes('triple')) return HIT_TYPE_STYLES.triple;
  if (evt.includes('single')) return HIT_TYPE_STYLES.single;
  return HIT_TYPE_STYLES.out;
};

// 球場背景 SVG 保持不變
const BaseballField = () => (
    <svg width="100%" height="100%" viewBox="0 0 250 250" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
        <g transform="translate(0, -30)">
            <path d="M 125,250 A 210,210 0 0,0 -35,125 L 125,125 Z" fill="#607a33" />
            <path d="M 125,250 A 210,210 0 0,1 285,125 L 125,125 Z" fill="#607a33" />
            <path d="M -35,125 A 210,210 0 0,1 285,125" fill="none" stroke="#4c566a" strokeWidth="2" />
            <path d="M125,250 L35,160 A 90,90 0 0,1 215,160 L125,250 Z" fill="#b9946A" />
            <circle cx="125" cy="195" r="10" fill="#d08770" stroke="#b9946A" strokeWidth="0.5" />
            <path d="M125,250 L185,190 L125,130 L65,190 Z" fill="none" stroke="#d08770" strokeWidth="2" />
            <rect x="122" y="246" width="6" height="6" fill="#eceff4" transform="rotate(45 125 249)" />
            <rect x="182" y="187" width="6" height="6" fill="#eceff4" />
            <rect x="62" y="187" width="6" height="6" fill="#eceff4" />
            <rect x="122" y="127" width="6" height="6" fill="#eceff4" />
            <line x1="125" y1="250" x2="-20" y2="105" stroke="#eceff4" strokeWidth="1" />
            <line x1="-20" y1="105" x2="-22" y2="95" stroke="#fbc02d" strokeWidth="2" />
            <line x1="125" y1="250" x2="270" y2="105" stroke="#eceff4" strokeWidth="1" />
            <line x1="270" y1="105" x2="272" y2="95" stroke="#fbc02d" strokeWidth="2" />
            <text x="125" y="30" fill="#eceff4" fontSize="8" textAnchor="middle">400 ft</text>
            <text x="25" y="100" fill="#eceff4" fontSize="8" textAnchor="middle" transform="rotate(-45 25 100)">330 ft</text>
            <text x="225" y="100" fill="#eceff4" fontSize="8" textAnchor="middle" transform="rotate(45 225 100)">330 ft</text>
        </g>
    </svg>
);


export function SprayChart({ data }) {
  const [highlightedType, setHighlightedType] = useState(null);

  const allLines = data
    .filter(p => p.hc_x != null && p.hc_y != null)
    .map((p, index) => {
      const style = getHitStyle(p.events);
      const isHomerun = style.name === '全壘打';
      
      // 【最終座標修正】我們只做最簡單的縮放和平移，不再進行任何旋轉
      const scale = 0.5;
      const homePlate = { x: 125, y: 250 }; // SVG 中未經 transform 的本壘板座標
      
      let landingX = p.hc_x;
      let landingY = p.hc_y;

      // 如果是全壘打，我們人為地將擊球點延伸，使其飛出牆外
      if (isHomerun) {
        const original_distance = Math.sqrt(p.hc_x**2 + p.hc_y**2);
        // 避免除以零
        if (original_distance > 0) {
            const extension_factor = 450 / original_distance; // 延伸到 450ft
            landingX = p.hc_x * extension_factor;
            landingY = p.hc_y * extension_factor;
        }
      }
      
      const landingSpot = {
          x: homePlate.x + landingX * scale,
          y: homePlate.y - landingY * scale
      };

      return {
          id: index,
          color: style.color,
          name: style.name,
          path: [ homePlate, landingSpot ] 
      };
    });

  const legendPayload = Object.values(HIT_TYPE_STYLES);

  return (
    <div className="w-full aspect-square relative">
      <BaseballField />
      <svg width="100%" height="100%" viewBox="0 0 250 250" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <g transform="translate(0, -30)">
          {allLines.map(line => (
            <line
              key={line.id}
              x1={line.path[0].x}
              y1={line.path[0].y}
              x2={line.path[1].x}
              y2={line.path[1].y}
              stroke={line.color}
              strokeWidth={highlightedType === null || highlightedType === line.name ? 2 : 0.5}
              opacity={highlightedType === null || highlightedType === line.name ? 0.9 : 0.15}
              style={{ transition: 'all 0.2s ease-in-out' }}
            />
          ))}
        </g>
      </svg>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-4 p-2 bg-slate-900/50 rounded-md">
        {legendPayload.map(entry => (
          <div 
            key={entry.name} 
            className="flex items-center gap-1.5 cursor-pointer"
            onMouseEnter={() => setHighlightedType(entry.name)}
            onMouseLeave={() => setHighlightedType(null)}
          >
            <div className="w-3 h-0.5" style={{ backgroundColor: entry.color }}></div>
            <span className="text-xs text-slate-300">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
