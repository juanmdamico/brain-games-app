import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, Text, Edges } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import { Physics, RigidBody, vec3 } from '@react-three/rapier';
import * as THREE from 'three';

// -------------------------------------------------------------
// SINGLE TILE (STATIC - DURING GAMEPLAY)
// -------------------------------------------------------------
const StaticTile = ({ value, isFixed, isSelected, isError, row, col, onClick }) => {
    const meshRef = useRef();
    
    // Position grid (9x9), centered at 0,0
    const x = (col - 4) * 1.1;
    const y = (4 - row) * 1.1;
    const z = 0;

    // Materials based on state
    const color = isError ? '#ef4444' : isSelected ? '#3b82f6' : isFixed ? '#94a3b8' : '#e2e8f0';
    const emissive = isError ? '#ef4444' : (isSelected || (value !== 0 && !isFixed)) ? '#3b82f6' : '#000000';
    const emissiveIntensity = isError ? 2 : (isSelected ? 1.5 : (value !== 0 && !isFixed ? 1 : 0));

    // Hover animation
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (!meshRef.current) return;
        // Smooth scaling on hover/select
        const targetScale = isSelected ? 1.1 : (hovered ? 1.05 : 1);
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.2);
        
        // Gentle float
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, isSelected ? 0.5 : 0, 0.1);
    });

    // 3x3 Block grouping color hint (optional, but looks nice)
    const blockIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    const blockColor = blockIndex % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)';

    return (
        <group position={[x, y, z]} onClick={(e) => { e.stopPropagation(); onClick(row, col); }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
            <mesh ref={meshRef}>
                <boxGeometry args={[1, 1, 0.5]} />
                <meshPhysicalMaterial 
                    color={blockColor}
                    transmission={0.9} 
                    roughness={0.2} 
                    thickness={0.5} 
                    envMapIntensity={2} 
                    transparent
                />
                <Edges scale={1} threshold={15} color={color} />
                
                {value !== 0 && (
                    <Text 
                        position={[0, 0, 0.26]} 
                        fontSize={0.6} 
                        color={color} 
                        fontWeight="bold"
                        anchorX="center" 
                        anchorY="middle"
                    >
                        {value}
                        <meshBasicMaterial attach="material" color={color} />
                    </Text>
                )}
            </mesh>
            
            {/* Glowing Aura if selected or error */}
            {(isSelected || isError) && (
                 <mesh position={[0,0,-0.1]}>
                     <boxGeometry args={[1.2, 1.2, 0.1]} />
                     <meshBasicMaterial color={emissive} transparent opacity={0.3} />
                 </mesh>
            )}
        </group>
    );
};

// -------------------------------------------------------------
// EXPLODING TILES (VICTORY SCENE WITH RAPIER PHYSICS)
// -------------------------------------------------------------
const ExplodingTile = ({ value, row, col }) => {
    const x = (col - 4) * 1.1;
    const y = (4 - row) * 1.1;
    const rigidBodyRef = useRef();

    useEffect(() => {
        // Apply a random explosion impulse
        if (rigidBodyRef.current) {
            const impulse = {
                x: (Math.random() - 0.5) * 5,
                y: (Math.random() - 0.5) * 5 + 5, // Bias upwards
                z: Math.random() * 5 + 2 // Explode towards the camera
            };
            const torque = {
                x: Math.random() * 2,
                y: Math.random() * 2,
                z: Math.random() * 2
            };
            setTimeout(() => {
                rigidBodyRef.current.applyImpulse(impulse, true);
                rigidBodyRef.current.applyTorqueImpulse(torque, true);
            }, 100);
        }
    }, []);

    return (
        <RigidBody ref={rigidBodyRef} position={[x, y, 0]} colliders="cuboid" restitution={0.8} mass={1}>
            <mesh>
                <boxGeometry args={[1, 1, 0.5]} />
                <meshPhysicalMaterial 
                    color="#1e293b"
                    transmission={0.9} 
                    roughness={0.1} 
                    thickness={0.5} 
                    envMapIntensity={2} 
                />
                <Edges scale={1} color="#3b82f6" />
                <Text position={[0, 0, 0.26]} fontSize={0.6} color="#3b82f6" fontWeight="bold" anchorX="center" anchorY="middle">
                    {value}
                </Text>
            </mesh>
        </RigidBody>
    );
};


// -------------------------------------------------------------
// MAIN BOARD COMPONENT
// -------------------------------------------------------------
export default function Board3D({ board, initialBoard, selectedCell, errors, onCellClick, isVictory }) {
    
    // Check if a cell is an error
    const isError = (r, c) => errors.some(err => err.r === r && err.c === c || err.row === r && err.col === c);

    return (
        <Canvas camera={{ position: [0, 0, 12], fov: 50 }} style={{ width: '100%', height: '100%', background: 'transparent' }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} />
            
            {/* Environment for glass reflections */}
            <Environment preset="city" />

            <group position={[0, 0.5, 0]}>
                {!isVictory ? (
                    // GAMEPLAY MODE: Static interactive tiles
                    board.map((row, r) => 
                        row.map((val, c) => (
                            <StaticTile 
                                key={`${r}-${c}`}
                                value={val}
                                isFixed={initialBoard[r][c] !== 0}
                                isSelected={selectedCell?.row === r && selectedCell?.col === c}
                                isError={isError(r, c)}
                                row={r}
                                col={c}
                                onClick={onCellClick}
                            />
                        ))
                    )
                ) : (
                    // VICTORY MODE: Exploding physics tiles
                    <Physics gravity={[0, -9.81, 0]}>
                        {board.map((row, r) => 
                            row.map((val, c) => (
                                <ExplodingTile 
                                    key={`win-${r}-${c}`}
                                    value={val}
                                    row={r}
                                    col={c}
                                />
                            ))
                        )}
                        {/* Invisible floor so they bounce off the bottom of the screen */}
                        <RigidBody type="fixed" position={[0, -10, 0]}>
                            <mesh>
                                <boxGeometry args={[40, 1, 40]} />
                                <meshBasicMaterial visible={false} />
                            </mesh>
                        </RigidBody>
                    </Physics>
                )}
            </group>

            {/* Sexy Post-Processing */}
            <EffectComposer>
                <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
                <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} opacity={1.5} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>

            {/* Ground shadow */}
            <ContactShadows position={[0, -6, 0]} opacity={0.4} scale={20} blur={2} far={10} />
        </Canvas>
    );
}
