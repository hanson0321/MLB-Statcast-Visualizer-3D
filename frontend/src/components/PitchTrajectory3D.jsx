// frontend/src/components/PitchTrajectory3D.jsx

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Tube, Plane, Cylinder, Shape, Extrude } from '@react-three/drei';
import * as THREE from 'three';

// 1. 顏色與球種對應表
const pitchColorMap = {
    'FF': { name: '四縫線快速球', color: '#ff4d4d' },
    'FA': { name: '快速球', color: '#ff4d4d' },
    'SL': { name: '滑球', color: '#4da6ff' },
    'ST': { name: '橫掃滑球', color: '#4da6ff' },
    'SV': { name: '曲滑球', color: '#4da6ff' },
    'CU': { name: '曲球', color: '#ffff66' },
    'KC': { name: '彈指曲球', color: '#ffff66' },
    'CH': { name: '變速球', color: '#33cc33' },
    'SI': { name: '伸卡球', color: '#ff8c1a' },
    'FT': { name: '二縫線快速球', color: '#ff8c1a' },
    'FC': { name: '卡特球', color: '#9966ff' },
    'FS': { name: '指叉球', color: '#ff66b3' },
};

const getPitchColor = (pitchType) => pitchColorMap[pitchType]?.color || '#ffffff';

// 【新功能】2. 球路圖例元件
const PitchLegend = () => (
    <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '10px',
        borderRadius: '8px',
        color: 'white',
        fontFamily: 'sans-serif',
        fontSize: '12px',
        maxWidth: '180px',
    }}>
        <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #555' }}>球路圖例</h4>
        {Object.entries(pitchColorMap).map(([abbr, { name, color }]) => (
            <div key={abbr} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: color, marginRight: '8px', borderRadius: '2px' }}></div>
                <span>{name} ({abbr})</span>
            </div>
        ))}
    </div>
);


// 3. 好球帶元件 (維持不變)
const StrikeZoneBox = ({ top, bottom }) => {
  const PLATE_WIDTH = 1.42;
  const height = top - bottom;
  return (
    <Box args={[PLATE_WIDTH, height, 0.1]} position={[0, bottom + height / 2, 0]}>
      <meshStandardMaterial color="#ffffff" emissive="#00aaff" transparent opacity={0.15} />
    </Box>
  );
};

// 4. 單一投球軌跡 + 球點元件 (維持不變)
const Pitch = ({ pitch }) => {
  const color = getPitchColor(pitch.pitch_type);
  const curve = useMemo(() => {
    const start = new THREE.Vector3(pitch.release_pos_x, pitch.release_pos_z, pitch.release_pos_y);
    const end = new THREE.Vector3(pitch.plate_x, pitch.plate_z, 0);
    const controlPoint = start.clone().lerp(end, 0.5).setY(start.y * 0.5 + end.y * 0.5 + 1.5);
    return new THREE.QuadraticBezierCurve3(start, controlPoint, end);
  }, [pitch]);

  return (
    <group>
      <Tube args={[curve, 20, 0.015, 8, false]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} toneMapped={false} />
      </Tube>
      <Sphere args={[0.08, 32, 32]} position={[pitch.plate_x, pitch.plate_z, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false}/>
      </Sphere>
    </group>
  );
};

// 5. 本壘板元件 (維持不變)
const HomePlate = () => {
    const shape = useMemo(() => {
        const s = new THREE.Shape();
        s.moveTo(0, 0.708); s.lineTo(0.708, 0); s.lineTo(0.708, -0.354);
        s.lineTo(-0.708, -0.354); s.lineTo(-0.708, 0); s.lineTo(0, 0.708);
        return s;
    }, []);
    const extrudeSettings = { steps: 1, depth: 0.1, bevelEnabled: false };
    return (
        <Extrude args={[shape, extrudeSettings]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0.354]} castShadow>
            <meshStandardMaterial color="white" />
        </Extrude>
    );
};

// 6. 球員模型元件 (加入姓名)
const HumanoidModel = ({ position, name, isPitcher = false }) => {
    const bodyColor = "#334155";
    const headColor = "#fde047";
    const hatColor = isPitcher ? "#dc2626" : "#1e3a8a";
    const batterStanceRotation = isPitcher ? [0, 0, 0] : [0, 0.2, 0];

    return (
        <group position={position} rotation={batterStanceRotation}>
            {/* 【新功能】在背後顯示球員姓名 */}
            <Text
                position={[0, 1.8, -0.3]}
                rotation={[0, 0, 0]}
                fontSize={0.25}
                color="white"
                anchorX="center"
            >
                {name.toUpperCase()}
            </Text>
            <mesh position={[0, 1.25, 0]} castShadow>
                <boxGeometry args={[0.8, 1.5, 0.5]} />
                <meshStandardMaterial color={bodyColor} />
            </mesh>
            <mesh position={[-0.2, 0.4, 0]} rotation={isPitcher ? [0,0,0] : [0,0,0.1]} castShadow>
                <cylinderGeometry args={[0.15, 0.1, 0.8]} />
                <meshStandardMaterial color={bodyColor} />
            </mesh>
            <mesh position={[0.2, 0.4, 0]} rotation={isPitcher ? [0,0,0] : [0,0,-0.1]} castShadow>
                <cylinderGeometry args={[0.15, 0.1, 0.8]} />
                <meshStandardMaterial color={bodyColor} />
            </mesh>
            <mesh position={[0, 2.2, 0]} rotation={isPitcher ? [0,0,0] : [0, 0.4, 0]} castShadow>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color={headColor} />
            </mesh>
            <group position={[0, 2.4, 0]} rotation={isPitcher ? [0,0,0] : [0, 0.4, 0]}>
                 <mesh castShadow>
                    <cylinderGeometry args={[0.35, 0.35, 0.2]} />
                    <meshStandardMaterial color={hatColor} />
                 </mesh>
                <mesh position={[0, -0.1, 0.3]} castShadow>
                     <boxGeometry args={[0.7, 0.1, 0.4]} />
                    <meshStandardMaterial color={hatColor} />
                </mesh>
            </group>
            {isPitcher ? (
                <mesh position={[-0.6, 1.6, 0]} rotation={[0, 0, 0.5]} castShadow>
                    <cylinderGeometry args={[0.1, 0.08, 1.2]} />
                    <meshStandardMaterial color={bodyColor} />
                </mesh>
            ) : (
                <>
                    <group position={[-0.2, 1.7, 0.2]}>
                        <mesh rotation={[0,0,1.8]}>
                            <cylinderGeometry args={[0.1, 0.08, 0.7]} />
                            <meshStandardMaterial color={bodyColor} />
                        </mesh>
                        <mesh position={[0.3, -0.5, 0]} rotation={[0,0,0.5]}>
                            <cylinderGeometry args={[0.08, 0.06, 0.6]} />
                            <meshStandardMaterial color={bodyColor} />
                        </mesh>
                    </group>
                     <group position={[0.2, 1.7, 0.2]}>
                        <mesh rotation={[0,0,-1.8]}>
                            <cylinderGeometry args={[0.1, 0.08, 0.7]} />
                            <meshStandardMaterial color={bodyColor} />
                        </mesh>
                        <mesh position={[-0.3, -0.5, 0]} rotation={[0,0,-0.5]}>
                            <cylinderGeometry args={[0.08, 0.06, 0.6]} />
                            <meshStandardMaterial color={bodyColor} />
                        </mesh>
                    </group>
                    <mesh position={[0.2, 1.8, 0.2]} rotation={[1.8, 0.8, -0.5]} castShadow>
                        <cylinderGeometry args={[0.06, 0.1, 3.5]} />
                        <meshStandardMaterial color="#854d0e" />
                    </mesh>
                </>
            )}
        </group>
    );
};

// 7. 主元件：整合所有 3D 元素
export const PitchTrajectory3D = ({ data, pitcherName, batterName }) => {
  const { avgStrikeZone, pitcherPosition, batterPosition } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        avgStrikeZone: { top: 3.5, bottom: 1.5 },
        pitcherPosition: new THREE.Vector3(0, 0, 60.5),
        batterPosition: new THREE.Vector3(-1.5, 0, 0.5),
      };
    }
    const firstPitch = data[0];
    const totalTop = data.reduce((sum, p) => sum + p.sz_top, 0);
    const totalBottom = data.reduce((sum, p) => sum + p.sz_bot, 0);
    const pPos = new THREE.Vector3(firstPitch.release_pos_x, 0, firstPitch.release_pos_y);
    return {
      avgStrikeZone: { top: totalTop / data.length, bottom: totalBottom / data.length },
      pitcherPosition: pPos,
      batterPosition: new THREE.Vector3(-1.5, 0, 0.5),
    };
  }, [data]);
  
  const pitcherLastName = pitcherName.split(' ').pop();
  const batterLastName = batterName.split(' ').pop();

  return (
    <div style={{ position: 'relative', height: '600px', width: '100%', background: '#111827', borderRadius: '8px', cursor: 'grab' }}>
      <Canvas camera={{ position: [0, 6, 35], fov: 45 }} shadows>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 20, 5]} intensity={1.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <meshStandardMaterial color="#052e16" />
        </Plane>
        <Cylinder args={[9, 9, 0.5, 64]} position={[0, 0.25, 60.5]} receiveShadow>
            <meshStandardMaterial color="#b45309" />
        </Cylinder>
        <HomePlate />
        <HumanoidModel position={batterPosition} name={batterLastName} />
        <HumanoidModel position={pitcherPosition} name={pitcherLastName} isPitcher={true} />
        <StrikeZoneBox top={avgStrikeZone.top} bottom={avgStrikeZone.bottom} />
        {data.map((pitch, index) => (
          <Pitch key={index} pitch={pitch} />
        ))}
        <OrbitControls minDistance={5} maxDistance={80} target={[0, 2, 0]} enablePan={false} />
      </Canvas>
      <PitchLegend />
    </div>
  );
};

