import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  // Generate random particle positions - subtle but visible
  const [sphere] = useState(() => {
    const count = 1200; // More particles for visibility
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Evenly distributed points inside a sphere-like volume, stretched horizontally
      const r = Math.cbrt(Math.random()) * 6;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.5 * (viewport.width / 4);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) * 2;
    }
    return positions;
  });

  useFrame((state, delta) => {
    if (!ref.current) return;

    // Very slow continuous rotation
    ref.current.rotation.x -= delta / 25;
    ref.current.rotation.y -= delta / 35;
  });

  return (
    <group rotation={[0, 0, Math.PI / 6]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#8b5cf6" // Purple to match your theme
          size={0.05} // Slightly larger particles
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.7} // More visible
        />
      </Points>
    </group>
  );
}

interface LEDParticleBackgroundProps {
  className?: string;
}

const LEDParticleBackground: React.FC<LEDParticleBackgroundProps> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 50 }} 
        dpr={[1, 2]}
        style={{ 
          background: 'transparent',
          pointerEvents: 'none'
        }}
      >
        <fog attach="fog" args={['#0f172a', 8, 20]} />
        <ParticleField />
      </Canvas>
    </div>
  );
};

export default LEDParticleBackground;