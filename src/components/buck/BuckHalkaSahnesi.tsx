// BuckHalkaSahnesi — BUCK Studio IBM Sports paneli stilinde 3D sahne.
//
// Referans: https://buck.co/work/ibm-sports-entertainment
// Estetik: krem-pembe zemin + dev 3D claymorphism + pastel doygun renkler +
// Cinema 4D / Octane shading (soft clay material).
//
// Form: 4 firma için 4 katmanlı halka (Torus) + ortada gri basketbol (Sphere).
// Her halka firmanın signature rengi + kalınlık = firma cirosu / max.

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FIRMALAR } from "@/data/firmalar";
import { FINANS_VERISI } from "@/data/mock-finans";
import type { FirmaId } from "@/types/domain";

const FIRMA_SIRA: FirmaId[] = ["meba", "mesa", "elmos", "arkon"];

interface HalkaProps {
  yaricap: number;
  kalinlik: number;
  pozisyon: [number, number, number];
  renk: string;
  donmeHizi: number;
}

function Halka({ yaricap, kalinlik, pozisyon, renk, donmeHizi }: HalkaProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x += donmeHizi * 0.5;
    ref.current.rotation.y += donmeHizi;
  });

  return (
    <mesh ref={ref} position={pozisyon} castShadow receiveShadow>
      <torusGeometry args={[yaricap, kalinlik, 64, 128]} />
      <meshPhysicalMaterial
        color={renk}
        roughness={0.45}
        metalness={0.05}
        clearcoat={0.4}
        clearcoatRoughness={0.5}
        sheen={0.5}
        sheenColor={renk}
      />
    </mesh>
  );
}

function Basketbol() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.003;
  });

  return (
    <mesh ref={ref} position={[-2.6, 0, 0.3]} castShadow receiveShadow>
      <sphereGeometry args={[1.4, 96, 96]} />
      <meshPhysicalMaterial
        color="#a8a8a8"
        roughness={0.85}
        metalness={0.02}
        clearcoat={0.15}
      />
    </mesh>
  );
}

function HalkaYigini() {
  // 4 firma yıllık cirosuna göre yaricap belirlenir
  const cirolar = FIRMA_SIRA.map((f) =>
    FINANS_VERISI[f].son12Ay.reduce((s, a) => s + a.ciro, 0),
  );
  const enBuyuk = Math.max(...cirolar);

  // BUCK paletinden esinli pastel doygun renkler
  const palet: string[] = ["#86efac", "#60a5fa", "#fbbf24", "#34d399"];

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
      <group>
        <Basketbol />
        {FIRMA_SIRA.map((f, i) => {
          const oran = cirolar[i]! / enBuyuk;
          const yaricap = 1.35 + i * 0.15;
          const kalinlik = 0.32 + oran * 0.18;
          const x = i * 0.55 - 0.5;
          const renkAlt = palet[i] ?? FIRMALAR[f].renk;
          return (
            <Halka
              key={f}
              yaricap={yaricap}
              kalinlik={kalinlik}
              pozisyon={[x, 0, 0]}
              renk={renkAlt}
              donmeHizi={0.001 + i * 0.0008}
            />
          );
        })}
      </group>
    </Float>
  );
}

export function BuckHalkaSahnesi() {
  return (
    <Canvas
      camera={{ position: [3, 1.5, 7.5], fov: 32 }}
      shadows
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        {/* Studio lighting — BUCK Octane shading benzeri */}
        <ambientLight intensity={0.45} color="#fff7ed" />

        <directionalLight
          position={[5, 8, 6]}
          intensity={2.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={20}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-bias={-0.0001}
        />

        <directionalLight
          position={[-6, 4, -2]}
          intensity={0.6}
          color="#fde7e0"
        />

        <pointLight position={[2, -3, 4]} intensity={0.4} color="#fcd34d" />

        <Environment preset="studio" environmentIntensity={0.6} />

        <HalkaYigini />

        <ContactShadows
          position={[0, -2.4, 0]}
          opacity={0.35}
          blur={3.5}
          far={6}
          resolution={1024}
          color="#5d3a2e"
        />

        {/* Geliştirme sırasında — production'da kapatılır */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Suspense>
    </Canvas>
  );
}
