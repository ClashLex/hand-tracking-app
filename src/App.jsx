import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Environment, ContactShadows } from '@react-three/drei';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import * as THREE from 'three';

// ==========================================
// 1. THE 3D SCENE (React Three Fiber)
// ==========================================
const InteractiveGlassBlob = ({ handRef, handDetected }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (handRef.current && meshRef.current) {
      const targetX = (handRef.current.x - 0.5) * -10;
      const targetY = -(handRef.current.y - 0.5) * 8;

      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);

      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.02;

      // Pulse scale when hand detected
      const pulse = handDetected ? 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05 : 1;
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, pulse, 0.1));
    }
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <torusKnotGeometry args={[1, 0.4, 128, 64]} />
      <MeshTransmissionMaterial
        backside
        samples={4}
        thickness={2}
        chromaticAberration={1.5}
        anisotropy={0.3}
        distortion={0.5}
        distortionScale={0.5}
        temporalDistortion={0.1}
        color="#ffffff"
      />
    </mesh>
  );
};

// ==========================================
// 2. SKIPER UI — LOADING SCREEN
// ==========================================
const LoadingScreen = ({ progress }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 100,
    background: '#030305',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '32px',
    fontFamily: "'Space Mono', 'Courier New', monospace",
  }}>
    {/* Animated logo orb */}
    <div style={{ position: 'relative', width: 80, height: 80 }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'conic-gradient(from 0deg, #7c3aed, #a78bfa, #c4b5fd, #7c3aed)',
        animation: 'spin 1.5s linear infinite',
      }} />
      <div style={{
        position: 'absolute', inset: 4, borderRadius: '50%',
        background: '#030305',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 24 }}>✦</span>
      </div>
    </div>

    {/* Title */}
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 11, letterSpacing: '0.3em', color: '#7c3aed',
        textTransform: 'uppercase', marginBottom: 8,
      }}>
        Neural Engine
      </div>
      <div style={{
        fontSize: 22, fontWeight: 700, color: '#f0f0f5',
        letterSpacing: '-0.02em',
      }}>
        Initializing GPU...
      </div>
    </div>

    {/* Progress bar */}
    <div style={{ width: 240, height: 2, background: 'rgba(124,58,237,0.2)', borderRadius: 999 }}>
      <div style={{
        height: '100%', borderRadius: 999,
        background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
        width: `${progress}%`,
        transition: 'width 0.3s ease',
        boxShadow: '0 0 12px #7c3aed',
      }} />
    </div>

    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  </div>
);

// ==========================================
// 3. SKIPER UI — HUD PANEL (top-left)
// ==========================================
const HUDPanel = ({ handCoords, handDetected }) => {
  const [coords, setCoords] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCoords({ ...handCoords.current });
    }, 60);
    return () => clearInterval(interval);
  }, [handCoords]);

  return (
    <div style={{
      position: 'absolute', top: 20, left: 20, zIndex: 10,
      background: 'rgba(10, 10, 18, 0.7)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(124, 58, 237, 0.3)',
      borderRadius: 14,
      padding: '14px 18px',
      fontFamily: "'Space Mono', 'Courier New', monospace",
      minWidth: 180,
      boxShadow: '0 0 30px rgba(124,58,237,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 12, paddingBottom: 10,
        borderBottom: '1px solid rgba(124,58,237,0.2)',
      }}>
        {/* Status dot */}
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: handDetected ? '#4ade80' : '#ef4444',
          boxShadow: handDetected ? '0 0 8px #4ade80' : '0 0 8px #ef4444',
          animation: handDetected ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
        }} />
        <span style={{ fontSize: 10, color: '#9ca3af', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {handDetected ? 'Tracking' : 'Searching'}
        </span>
      </div>

      {/* Coordinates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { label: 'X', value: coords.x.toFixed(3), color: '#a78bfa' },
          { label: 'Y', value: coords.y.toFixed(3), color: '#818cf8' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: '#6b7280', width: 12 }}>{label}</span>
            <div style={{
              flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${parseFloat(value) * 100}%`,
                background: color, borderRadius: 99,
                transition: 'width 0.1s ease',
                boxShadow: `0 0 6px ${color}`,
              }} />
            </div>
            <span style={{ fontSize: 11, color, fontVariantNumeric: 'tabular-nums', minWidth: 42 }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
};

// ==========================================
// 4. SKIPER UI — TITLE HEADER
// ==========================================
const TitleHeader = ({ visible }) => (
  <div style={{
    position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
    zIndex: 10, textAlign: 'center',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.8s ease 0.3s',
    pointerEvents: 'none',
  }}>
    <div style={{
      fontFamily: "'Space Mono', 'Courier New', monospace",
      fontSize: 11, letterSpacing: '0.35em', color: '#6b7280',
      textTransform: 'uppercase', marginBottom: 4,
    }}>
      Hand Tracking
    </div>
    <div style={{
      fontFamily: "system-ui, sans-serif",
      fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em',
      background: 'linear-gradient(135deg, #f0f0f5 30%, #a78bfa 70%, #818cf8)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}>
      Neural Sculptor
    </div>
  </div>
);

// ==========================================
// 5. SKIPER UI — BOTTOM HINT BAR
// ==========================================
const BottomBar = ({ handDetected, visible }) => (
  <div style={{
    position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
    zIndex: 10,
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.8s ease 0.5s',
    pointerEvents: 'none',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'rgba(10,10,18,0.7)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 999, padding: '8px 18px',
      fontFamily: "'Space Mono', 'Courier New', monospace",
      fontSize: 11, color: '#6b7280', letterSpacing: '0.05em',
    }}>
      <span style={{
        display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
        background: handDetected ? '#4ade80' : '#f59e0b',
        boxShadow: handDetected ? '0 0 6px #4ade80' : '0 0 6px #f59e0b',
      }} />
      {handDetected
        ? 'Move your index finger to sculpt'
        : 'Hold your hand in front of camera'}
    </div>
  </div>
);

// ==========================================
// 6. SKIPER UI — CORNER BADGE (bottom-right)
// ==========================================
const CornerBadge = ({ visible }) => (
  <div style={{
    position: 'absolute', bottom: 24, right: 20, zIndex: 10,
    opacity: visible ? 0.6 : 0,
    transition: 'opacity 0.8s ease',
    pointerEvents: 'none',
  }}>
    <div style={{
      fontFamily: "'Space Mono', 'Courier New', monospace",
      fontSize: 9, color: '#4b5563', letterSpacing: '0.2em',
      textTransform: 'uppercase', lineHeight: 1.6, textAlign: 'right',
    }}>
      <div>MediaPipe · R3F</div>
      <div style={{ color: '#7c3aed' }}>✦ ClashLex</div>
    </div>
  </div>
);

// ==========================================
// 7. MAIN APP
// ==========================================
export default function App() {
  const videoRef = useRef(null);
  const handCoords = useRef({ x: 0.5, y: 0.5 });
  const [isReady, setIsReady] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    let handLandmarker;
    let animationFrameId;
    let handLostTimer;

    // Simulate progress ticks while loading
    const progressInterval = setInterval(() => {
      setLoadProgress(p => Math.min(p + Math.random() * 18, 90));
    }, 300);

    const initializeAI = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });

      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", predictWebcam);
      }

      clearInterval(progressInterval);
      setLoadProgress(100);
      setTimeout(() => setIsReady(true), 400);
    };

    const predictWebcam = () => {
      let startTimeMs = performance.now();
      if (videoRef.current && handLandmarker) {
        const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);

        if (results.landmarks.length > 0) {
          handCoords.current = {
            x: results.landmarks[0][8].x,
            y: results.landmarks[0][8].y
          };
          setHandDetected(true);
          clearTimeout(handLostTimer);
        } else {
          // Debounce — wait 500ms before marking hand as lost
          handLostTimer = setTimeout(() => setHandDetected(false), 500);
        }
      }
      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    initializeAI();

    return () => {
      clearInterval(progressInterval);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(handLostTimer);
      if (handLandmarker) handLandmarker.close();
    };
  }, []);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      backgroundColor: '#030305',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Hidden Video */}
      <video ref={videoRef} autoPlay playsInline style={{ display: 'none' }} />

      {/* Loading Screen */}
      {!isReady && <LoadingScreen progress={loadProgress} />}

      {/* === SKIPER UI OVERLAYS === */}
      <TitleHeader visible={isReady} />
      <HUDPanel handCoords={handCoords} handDetected={handDetected} />
      <BottomBar handDetected={handDetected} visible={isReady} />
      <CornerBadge visible={isReady} />

      {/* Subtle vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(3,3,5,0.6) 100%)',
      }} />

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        <Environment preset="city" />
        <InteractiveGlassBlob handRef={handCoords} handDetected={handDetected} />
        <ContactShadows position={[0, -3, 0]} opacity={0.5} scale={20} blur={2} far={4.5} />
      </Canvas>
    </div>
  );
}

