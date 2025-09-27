import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

// 🔹 Preload all models at startup
useGLTF.preload("/models/Father_default.glb");
useGLTF.preload("/models/Mother_default.glb");
useGLTF.preload("/models/Hello_default.glb");

function AnimatedModel({ url, visible, onFinished }) {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions, mixer } = useAnimations(animations, group);

  useEffect(() => {
    if (visible && animations.length) {
      const action = actions[animations[0].name];
      action.reset();
      action.setLoop(THREE.LoopOnce, 1); // play once
      action.clampWhenFinished = true;   // hold last frame
      action.play();

      const onEnd = () => onFinished?.();
      mixer.addEventListener("finished", onEnd);

      return () => mixer.removeEventListener("finished", onEnd);
    }
  }, [visible, animations, actions, mixer, onFinished]);

  return (
    <primitive
      ref={group}
      object={scene}
      position={[0, 0, 0]}
      visible={visible} // 🔹 Toggle visibility instead of unmounting
    />
  );
}

export default function GLBViewer() {
  const models = [
    "/models/Cat.glb",
    "/models/Child.glb",
    "/models/Father_default.glb",
  ];

  const [index, setIndex] = useState(0);

  const handleFinished = () => {
    if (index < models.length - 1) {
      setIndex((prev) => prev + 1);
    }
  };

  return (
    <Canvas shadows camera={{ position: [0, 1.6, 3], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7]} intensity={1} castShadow />

      <Suspense fallback={null}>
        {models.map((m, i) => (
          <AnimatedModel
            key={m}
            url={m}
            visible={i === index} // 🔹 Only one is visible at a time
            onFinished={handleFinished}
          />
        ))}
      </Suspense>

      <OrbitControls />
    </Canvas>
  );
}
