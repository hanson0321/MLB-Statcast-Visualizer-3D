// frontend/src/components/PitchTrajectory3D.jsx

import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Tube, Plane, Cylinder, Shape, Extrude, Line } from '@react-three/drei';
import * as THREE from 'three';

// 顏色與球種對應表
const pitchColorMap = {
    'FF': { name: '四縫線快速球', color: '#d9534f' },
    'SI': { name: '伸卡球', color: '#f0ad4e' },
    'FT': { name: '二縫線快速球', color: '#f0ad4e' },
    'FC': { name: '卡特球', color: '#5bc0de' },
    'SL': { name: '滑球', color: '#5bc0de' },
    'ST': { name: '橫掃滑球', color: '#5bc0de' },
    'SV': { name: '曲滑球', color: '#5bc0de' },
    'CU': { name: '曲球', color: '#428bca' },
    'KC': { name: '彈指曲球', color: '#428bca' },
    'CH': { name: '變速球', color: '#5cb85c' },
    'FS': { name: '指叉球', color: '#5cb85c' },
};

const getPitchColor = (pitchType) => pitchColorMap[pitchType]?.color || '#ffffff';

// 球路圖例元件
const PitchLegend = () => (
    <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.85)',
        padding: '10px',
        borderRadius: '8px',
        color: '#333',
        fontFamily: 'sans-serif',
        fontSize: '12px',
        maxWidth: '180px',
        pointerEvents: 'none',
        border: '1px solid #ccc'
    }}>
        <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Pitch Type</h4>
        {Object.entries(pitchColorMap).map(([abbr, { name, color }]) => (
            <div key={abbr} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: color, marginRight: '8px', borderRadius: '2px' }}></div>
                <span>{name.split(' ')[0]} ({abbr})</span>
            </div>
        ))}
    </div>
);

// 好球帶元件
const StrikeZoneBox = ({ top, bottom }) => {
  const PLATE_WIDTH = 1.42;
  const height = top - bottom;
  return (
    <Box args={[PLATE_WIDTH, height, 0.1]} position={[0, bottom + height / 2, 0]}>
      <meshBasicMaterial color="#333" transparent opacity={0.3} />
    </Box>
  );
};

// 單一投球軌跡 + 球點 + 球速顯示元件
const Pitch = ({ pitch }) => {
  const [hovered, setHovered] = useState(false);
  const color = getPitchColor(pitch.pitch_type);
  const curve = useMemo(() => {
    const start = new THREE.Vector3(pitch.release_pos_x, pitch.release_pos_z, pitch.release_pos_y);
    const end = new THREE.Vector3(pitch.plate_x, pitch.plate_z, 0);
    const controlPoint = start.clone().lerp(end, 0.5).setY(start.y * 0.5 + end.y * 0.5 + 1.5);
    return new THREE.QuadraticBezierCurve3(start, controlPoint, end);
  }, [pitch]);

  return (
    <group
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      <Tube args={[curve, 20, 0.02, 8, false]}>
        <meshBasicMaterial color={color} transparent opacity={hovered ? 1 : 0.7} toneMapped={false} />
      </Tube>
      <Sphere args={[0.085, 32, 32]} position={[pitch.plate_x, pitch.plate_z, 0]}>
        <meshBasicMaterial color={color}/>
      </Sphere>
      {hovered && (
        <Text
          position={[pitch.plate_x, pitch.plate_z + 0.3, 0]}
          fontSize={0.25}
          color="black"
          anchorX="center"
          backgroundColor="white"
          backgroundOpacity={0.8}
          padding={0.05}
          borderRadius={0.05}
        >
          {`${pitch.release_speed.toFixed(1)} mph`}
        </Text>
      )}
    </group>
  );
};

// 本壘板元件
const HomePlate = () => {
    const shape = useMemo(() => {
        const s = new THREE.Shape();
        s.moveTo(0, 0.708); s.lineTo(0.708, 0); s.lineTo(0.708, -0.354);
        s.lineTo(-0.708, -0.354); s.lineTo(-0.708, 0); s.lineTo(0, 0.708);
        return s;
    }, []);
    const extrudeSettings = { steps: 1, depth: 0.05, bevelEnabled: false };
    return (
        <Extrude args={[shape, extrudeSettings]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0.354]}>
            <meshBasicMaterial color="#ffffff" />
        </Extrude>
    );
};

// 球場環境元件
const BaseballField = () => {
    const BatterBox = ({ position, width, height }) => {
        const points = [
            new THREE.Vector3(-width/2, 0, -height/2), new THREE.Vector3(width/2, 0, -height/2),
            new THREE.Vector3(width/2, 0, height/2), new THREE.Vector3(-width/2, 0, height/2),
            new THREE.Vector3(-width/2, 0, -height/2)
        ];
        return <Line points={points} color="white" lineWidth={2} position={position} rotation={[-Math.PI / 2, 0, 0]} />;
    };

    return (
        <group>
            <Plane args={[200, 200]} rotation={[-Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#d1d5db" />
            </Plane>
            <Cylinder args={[45, 45, 0.015, 64]} position={[0, 0.005, 45]}>
                <meshBasicMaterial color="#65a30d" />
            </Cylinder>
            <Cylinder args={[13, 13, 0.02, 64]} position={[0, 0.01, 0]}>
                <meshBasicMaterial color="#9ca3af" />
            </Cylinder>
            <Cylinder args={[9, 9, 0.5, 64]} position={[0, 0.25, 60.5]}>
                <meshBasicMaterial color="#9ca3af" />
            </Cylinder>
            <Box args={[0.2, 0.03, 150]} position={[-35.35, 0.015, 35.35]} rotation={[0, 0.785, 0]} >
                 <meshBasicMaterial color="white" />
            </Box>
             <Box args={[0.2, 0.03, 150]} position={[35.35, 0.015, 35.35]} rotation={[0, -0.785, 0]} >
                 <meshBasicMaterial color="white" />
            </Box>
            <BatterBox position={[-4, 0.02, 0]} width={4} height={6} />
            <BatterBox position={[4, 0.02, 0]} width={4} height={6} />
            <Cylinder args={[2.5, 2.5, 0.02, 64]} position={[-10, 0.01, -10]}>
                <meshBasicMaterial color="#9ca3af" />
            </Cylinder>
             <Cylinder args={[2.5, 2.5, 0.02, 64]} position={[10, 0.01, -10]}>
                <meshBasicMaterial color="#9ca3af" />
            </Cylinder>
        </group>
    );
};


// 【錯誤修正】將元件改為 named export，以匹配 App.jsx 中的 import 方式
export const PitchTrajectory3D = ({ data, pitcherName, batterName }) => {
  const avgStrikeZone = useMemo(() => {
    if (!data || data.length === 0) return { top: 3.5, bottom: 1.5 };
    const totalTop = data.reduce((sum, p) => sum + p.sz_top, 0);
    const totalBottom = data.reduce((sum, p) => sum + p.sz_bot, 0);
    return {
      top: totalTop / data.length,
      bottom: totalBottom / data.length,
    };
  }, [data]);

  return (
    <div style={{ position: 'relative', height: '600px', width: '100%', background: '#a3a3a3', borderRadius: '8px', cursor: 'grab' }}>
      <Canvas camera={{ position: [0, 50, 0.1], fov: 45 }} shadows={false}>
        <ambientLight intensity={5} />
        
        <BaseballField />
        <HomePlate />
        <StrikeZoneBox top={avgStrikeZone.top} bottom={avgStrikeZone.bottom} />
        
        {data.map((pitch, index) => (
          <Pitch key={index} pitch={pitch} />
        ))}

        <OrbitControls 
            minDistance={10} 
            maxDistance={120}
            target={[0, 2, 0]}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2.1}
            enablePan={false}
        />
      </Canvas>
      <PitchLegend />
    </div>
  );
};
