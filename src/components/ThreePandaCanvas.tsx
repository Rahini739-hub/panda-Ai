import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PandaAnimation, PandaAccessories } from '../types';
import { playSound } from '../utils/audio';

interface ThreePandaCanvasProps {
  currentAnimation: PandaAnimation;
  accessories: PandaAccessories;
  onPandaClick: () => void;
  onPandaPet: () => void;
  soundEnabled: boolean;
  soundVolume: number;
}

export const ThreePandaCanvas: React.FC<ThreePandaCanvasProps> = ({
  currentAnimation,
  accessories,
  onPandaClick,
  onPandaPet,
  soundEnabled,
  soundVolume,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<PandaAnimation>(currentAnimation);
  const accessoriesRef = useRef<PandaAccessories>(accessories);
  const [hasWebGlError, setHasWebGlError] = useState(false);

  // Keep refs in sync so the animation loop always has fresh state without recreation
  useEffect(() => {
    animRef.current = currentAnimation;
  }, [currentAnimation]);

  useEffect(() => {
    accessoriesRef.current = accessories;
  }, [accessories]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let animFrameId: number;

    try {
      // 1. Scene setup
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0e0c1f, 0.045);

      const width = container.clientWidth || 360;
      const height = container.clientHeight || 360;

      camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
      camera.position.set(0, 1.4, 4.4);
      camera.lookAt(0, 0.9, 0);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.appendChild(renderer.domElement);

      // 2. Procedural Fur & Material Textures
      const createNoiseTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 128, 128);
          const imgData = ctx.getImageData(0, 0, 128, 128);
          for (let i = 0; i < imgData.data.length; i += 4) {
            const val = 230 + Math.floor(Math.random() * 25);
            imgData.data[i] = val;
            imgData.data[i + 1] = val;
            imgData.data[i + 2] = val;
          }
          ctx.putImageData(imgData, 0, 0);
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
      };

      const furTexture = createNoiseTexture();

      // Materials
      const whiteFurMat = new THREE.MeshStandardMaterial({
        color: 0xf6f6fc,
        roughness: 0.88,
        metalness: 0.02,
        bumpMap: furTexture,
        bumpScale: 0.015,
      });

      const blackFurMat = new THREE.MeshStandardMaterial({
        color: 0x181622,
        roughness: 0.85,
        metalness: 0.05,
        bumpMap: furTexture,
        bumpScale: 0.015,
      });

      const innerEarMat = new THREE.MeshStandardMaterial({
        color: 0x242033,
        roughness: 0.9,
      });

      const eyeWhiteMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
      });

      const eyeCorneaMat = new THREE.MeshStandardMaterial({
        color: 0x110f1c,
        roughness: 0.05,
        metalness: 0.2,
      });

      const eyePupilMat = new THREE.MeshStandardMaterial({
        color: 0x05040a,
        roughness: 0.02,
      });

      const irisHighlightMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });

      const noseMat = new THREE.MeshStandardMaterial({
        color: 0x14121c,
        roughness: 0.25,
        metalness: 0.1,
      });

      const blushMat = new THREE.MeshBasicMaterial({
        color: 0xf472b6,
        transparent: true,
        opacity: 0.38,
      });

      const pawPadMat = new THREE.MeshStandardMaterial({
        color: 0x2d2940,
        roughness: 0.6,
      });

      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.25,
        metalness: 0.8,
      });

      const violetMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        roughness: 0.5,
      });

      const bambooStemMat = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        roughness: 0.35,
        metalness: 0.1,
      });

      // 3. Assemble Procedural 3D Character (Panda)
      const pandaRoot = new THREE.Group();
      pandaRoot.position.set(0, 0, 0);
      scene.add(pandaRoot);

      // Contact Shadow Plane (Procedural ground grounding)
      const createShadowPlane = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 62);
          grad.addColorStop(0, 'rgba(10, 8, 20, 0.65)');
          grad.addColorStop(0.5, 'rgba(10, 8, 20, 0.35)');
          grad.addColorStop(1, 'rgba(10, 8, 20, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 128, 128);
        }
        const shadowTex = new THREE.CanvasTexture(canvas);
        const geo = new THREE.PlaneGeometry(2.4, 2.4);
        const mat = new THREE.MeshBasicMaterial({
          map: shadowTex,
          transparent: true,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = 0.01;
        return mesh;
      };
      pandaRoot.add(createShadowPlane());

      // TORSO / BODY
      const bodyGroup = new THREE.Group();
      bodyGroup.position.set(0, 0.72, 0);
      pandaRoot.add(bodyGroup);

      // Main chubby belly/body
      const bodyGeo = new THREE.SphereGeometry(0.72, 32, 28);
      bodyGeo.scale(1, 1.1, 0.95);
      const bodyMesh = new THREE.Mesh(bodyGeo, whiteFurMat);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      bodyGroup.add(bodyMesh);

      // Dark shoulder & back mantle
      const mantleGeo = new THREE.SphereGeometry(0.73, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.42);
      mantleGeo.scale(1.01, 1.11, 0.96);
      const mantleMesh = new THREE.Mesh(mantleGeo, blackFurMat);
      mantleMesh.castShadow = true;
      mantleMesh.position.y = 0.02;
      bodyGroup.add(mantleMesh);

      // Tail
      const tailGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const tailMesh = new THREE.Mesh(tailGeo, blackFurMat);
      tailMesh.position.set(0, -0.2, -0.68);
      bodyGroup.add(tailMesh);

      // SEATED LEGS
      const createLeg = (isLeft: boolean) => {
        const legGroup = new THREE.Group();
        const legGeo = new THREE.SphereGeometry(0.34, 20, 20);
        legGeo.scale(0.9, 0.8, 1.25);
        const legMesh = new THREE.Mesh(legGeo, blackFurMat);
        legMesh.castShadow = true;
        legGroup.add(legMesh);

        // Foot pad
        const padGeo = new THREE.SphereGeometry(0.18, 16, 16);
        padGeo.scale(0.85, 0.2, 1.1);
        const padMesh = new THREE.Mesh(padGeo, pawPadMat);
        padMesh.position.set(0, 0.05, 0.24);
        padMesh.rotation.x = 0.3;
        legGroup.add(padMesh);

        const xPos = isLeft ? -0.52 : 0.52;
        legGroup.position.set(xPos, 0.25, 0.2);
        legGroup.rotation.y = isLeft ? 0.25 : -0.25;
        return legGroup;
      };
      pandaRoot.add(createLeg(true));
      pandaRoot.add(createLeg(false));

      // ARMS
      // Left Arm
      const leftArmPivot = new THREE.Group();
      leftArmPivot.position.set(-0.62, 0.88, 0.05);
      const leftArmGeo = new THREE.CapsuleGeometry(0.18, 0.42, 12, 18);
      leftArmGeo.rotateZ(0.25);
      const leftArmMesh = new THREE.Mesh(leftArmGeo, blackFurMat);
      leftArmMesh.castShadow = true;
      leftArmMesh.position.set(-0.06, -0.24, 0.12);
      leftArmPivot.add(leftArmMesh);
      pandaRoot.add(leftArmPivot);

      // Right Arm (Articulated for waving, scratching, holding food)
      const rightArmPivot = new THREE.Group();
      rightArmPivot.position.set(0.62, 0.88, 0.05);
      const rightArmGeo = new THREE.CapsuleGeometry(0.18, 0.42, 12, 18);
      rightArmGeo.rotateZ(-0.25);
      const rightArmMesh = new THREE.Mesh(rightArmGeo, blackFurMat);
      rightArmMesh.castShadow = true;
      rightArmMesh.position.set(0.06, -0.24, 0.12);
      rightArmPivot.add(rightArmMesh);
      pandaRoot.add(rightArmPivot);

      // Bamboo prop (in right paw)
      const bambooGroup = new THREE.Group();
      const stemGeo = new THREE.CylinderGeometry(0.038, 0.042, 0.75, 12);
      const stemMesh = new THREE.Mesh(stemGeo, bambooStemMat);
      stemMesh.castShadow = true;
      bambooGroup.add(stemMesh);

      // Bamboo leaf sprigs
      const leafGeo = new THREE.ConeGeometry(0.06, 0.25, 6);
      leafGeo.rotateZ(0.8);
      const leaf1 = new THREE.Mesh(leafGeo, bambooStemMat);
      leaf1.position.set(0.08, 0.26, 0);
      bambooGroup.add(leaf1);

      bambooGroup.position.set(0.18, -0.32, 0.32);
      bambooGroup.rotation.set(0.4, 0.2, 0.5);
      bambooGroup.visible = false;
      rightArmPivot.add(bambooGroup);

      // HEAD GROUP
      const headPivot = new THREE.Group();
      headPivot.position.set(0, 1.35, 0.1);
      pandaRoot.add(headPivot);

      // Main head sphere (chubby cute proportions)
      const headGeo = new THREE.SphereGeometry(0.68, 36, 32);
      headGeo.scale(1.15, 1.02, 1.0);
      const headMesh = new THREE.Mesh(headGeo, whiteFurMat);
      headMesh.castShadow = true;
      headMesh.receiveShadow = true;
      headPivot.add(headMesh);

      // Snout / Muzzle
      const muzzleGeo = new THREE.SphereGeometry(0.26, 24, 20);
      muzzleGeo.scale(1.15, 0.82, 0.95);
      const muzzleMesh = new THREE.Mesh(muzzleGeo, whiteFurMat);
      muzzleMesh.position.set(0, -0.12, 0.62);
      headPivot.add(muzzleMesh);

      // Nose
      const noseGeo = new THREE.SphereGeometry(0.09, 16, 14);
      noseGeo.scale(1.3, 0.85, 0.9);
      const noseMesh = new THREE.Mesh(noseGeo, noseMat);
      noseMesh.position.set(0, -0.06, 0.84);
      headPivot.add(noseMesh);

      // Blushing cheeks
      const blushGeo = new THREE.CircleGeometry(0.13, 20);
      const leftBlush = new THREE.Mesh(blushGeo, blushMat);
      leftBlush.position.set(-0.46, -0.18, 0.58);
      leftBlush.rotation.y = -0.5;
      headPivot.add(leftBlush);

      const rightBlush = new THREE.Mesh(blushGeo, blushMat);
      rightBlush.position.set(0.46, -0.18, 0.58);
      rightBlush.rotation.y = 0.5;
      headPivot.add(rightBlush);

      // EARS
      const createEar = (isLeft: boolean) => {
        const earGroup = new THREE.Group();
        const earOuterGeo = new THREE.SphereGeometry(0.24, 20, 20);
        earOuterGeo.scale(1.0, 1.1, 0.65);
        const earOuter = new THREE.Mesh(earOuterGeo, blackFurMat);
        earOuter.castShadow = true;
        earGroup.add(earOuter);

        const earInnerGeo = new THREE.SphereGeometry(0.16, 16, 16);
        earInnerGeo.scale(0.9, 1.0, 0.3);
        const earInner = new THREE.Mesh(earInnerGeo, innerEarMat);
        earInner.position.set(0, 0, 0.08);
        earGroup.add(earInner);

        const xPos = isLeft ? -0.58 : 0.58;
        earGroup.position.set(xPos, 0.58, -0.05);
        earGroup.rotation.z = isLeft ? 0.35 : -0.35;
        earGroup.rotation.x = -0.1;
        return earGroup;
      };
      const leftEar = createEar(true);
      const rightEar = createEar(false);
      headPivot.add(leftEar);
      headPivot.add(rightEar);

      // EYES & EYEPATCHES
      const leftEyeGroup = new THREE.Group();
      const rightEyeGroup = new THREE.Group();

      const createEyeSide = (isLeft: boolean, targetGroup: THREE.Group) => {
        // Velvety black teardrop patch
        const patchGeo = new THREE.SphereGeometry(0.23, 24, 20);
        patchGeo.scale(0.9, 1.15, 0.45);
        const patchMesh = new THREE.Mesh(patchGeo, blackFurMat);
        patchMesh.rotation.z = isLeft ? -0.28 : 0.28;
        patchMesh.rotation.y = isLeft ? -0.35 : 0.35;
        patchMesh.castShadow = true;
        targetGroup.add(patchMesh);

        // Eyeball White
        const eyeballGeo = new THREE.SphereGeometry(0.105, 20, 20);
        const eyeball = new THREE.Mesh(eyeballGeo, eyeWhiteMat);
        eyeball.position.set(0, 0.02, 0.09);
        targetGroup.add(eyeball);

        // Iris / Cornea
        const corneaGeo = new THREE.SphereGeometry(0.088, 20, 20);
        const cornea = new THREE.Mesh(corneaGeo, eyeCorneaMat);
        cornea.position.set(0, 0.02, 0.12);
        targetGroup.add(cornea);

        // Pupil
        const pupilGeo = new THREE.SphereGeometry(0.055, 16, 16);
        const pupil = new THREE.Mesh(pupilGeo, eyePupilMat);
        pupil.position.set(0, 0.02, 0.155);
        targetGroup.add(pupil);

        // Specular glint 1 (large)
        const glint1Geo = new THREE.SphereGeometry(0.024, 12, 12);
        const glint1 = new THREE.Mesh(glint1Geo, irisHighlightMat);
        glint1.position.set(0.022, 0.045, 0.185);
        targetGroup.add(glint1);

        // Specular glint 2 (small)
        const glint2Geo = new THREE.SphereGeometry(0.012, 8, 8);
        const glint2 = new THREE.Mesh(glint2Geo, irisHighlightMat);
        glint2.position.set(-0.02, -0.01, 0.188);
        targetGroup.add(glint2);

        const xPos = isLeft ? -0.28 : 0.28;
        targetGroup.position.set(xPos, 0.04, 0.54);
      };

      createEyeSide(true, leftEyeGroup);
      createEyeSide(false, rightEyeGroup);
      headPivot.add(leftEyeGroup);
      headPivot.add(rightEyeGroup);

      // ACCESSORIES 3D MESHES
      // 1. Glasses
      const glassesGroup = new THREE.Group();
      const ringGeo = new THREE.TorusGeometry(0.14, 0.018, 12, 24);
      const leftRing = new THREE.Mesh(ringGeo, goldMat);
      leftRing.position.set(-0.28, 0.04, 0.68);
      glassesGroup.add(leftRing);

      const rightRing = new THREE.Mesh(ringGeo, goldMat);
      rightRing.position.set(0.28, 0.04, 0.68);
      glassesGroup.add(rightRing);

      const bridgeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8);
      bridgeGeo.rotateZ(Math.PI / 2);
      const bridge = new THREE.Mesh(bridgeGeo, goldMat);
      bridge.position.set(0, 0.05, 0.69);
      glassesGroup.add(bridge);
      headPivot.add(glassesGroup);

      // 2. Zen Headband
      const headbandGroup = new THREE.Group();
      const bandGeo = new THREE.TorusGeometry(0.68, 0.045, 12, 36);
      bandGeo.rotateX(Math.PI / 2);
      const bandMesh = new THREE.Mesh(bandGeo, violetMat);
      bandMesh.position.set(0, 0.32, 0.05);
      bandMesh.scale.set(1.15, 0.98, 1);
      headbandGroup.add(bandMesh);

      // Golden crest in front
      const crestGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.03, 16);
      crestGeo.rotateX(Math.PI / 2);
      const crest = new THREE.Mesh(crestGeo, goldMat);
      crest.position.set(0, 0.34, 0.72);
      headbandGroup.add(crest);
      headPivot.add(headbandGroup);

      // 3. Bamboo Crown on Right Ear
      const crownGroup = new THREE.Group();
      const crownLeaf1 = new THREE.Mesh(leafGeo, bambooStemMat);
      crownLeaf1.scale.set(1.2, 1.2, 1.2);
      crownLeaf1.position.set(0.56, 0.78, 0.1);
      crownLeaf1.rotation.set(-0.2, 0.4, -0.6);
      crownGroup.add(crownLeaf1);
      headPivot.add(crownGroup);

      // 4. Cozy Scarf
      const scarfGroup = new THREE.Group();
      const scarfToroid = new THREE.TorusGeometry(0.58, 0.08, 12, 32);
      scarfToroid.rotateX(Math.PI / 2);
      const scarfMesh = new THREE.Mesh(scarfToroid, violetMat);
      scarfMesh.position.set(0, 0.95, 0.08);
      scarfMesh.scale.set(1.1, 0.95, 1);
      scarfGroup.add(scarfMesh);
      pandaRoot.add(scarfGroup);

      // FLOATING ZEN PARTICLES
      const particleCount = 28;
      const particleGeo = new THREE.SphereGeometry(0.024, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({
        color: 0xc084fc,
        transparent: true,
        opacity: 0.55,
      });
      const particles = new THREE.InstancedMesh(particleGeo, particleMat, particleCount);
      const dummy = new THREE.Object3D();
      const particlePositions: { x: number; y: number; z: number; speed: number; phase: number }[] = [];

      for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * 4.5;
        const y = Math.random() * 3.0;
        const z = (Math.random() - 0.5) * 3.0;
        particlePositions.push({
          x,
          y,
          z,
          speed: 0.15 + Math.random() * 0.25,
          phase: Math.random() * Math.PI * 2,
        });
      }
      scene.add(particles);

      // 4. STUDIO LIGHTING RIG
      // Key Warm Directional Light
      const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
      keyLight.position.set(2.8, 4.2, 3.5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 10;
      keyLight.shadow.camera.left = -2;
      keyLight.shadow.camera.right = 2;
      keyLight.shadow.camera.top = 2.5;
      keyLight.shadow.camera.bottom = -0.5;
      keyLight.shadow.bias = -0.0005;
      scene.add(keyLight);

      // Cool Hemisphere Light (Deep sky / warm floor)
      const hemiLight = new THREE.HemisphereLight(0x9333ea, 0x1e1b4b, 0.85);
      scene.add(hemiLight);

      // Neon Violet Rim Light (Separates panda from dark background)
      const rimLight1 = new THREE.DirectionalLight(0xa855f7, 2.2);
      rimLight1.position.set(-3, 2.5, -2.5);
      scene.add(rimLight1);

      // Soft Lavender Rim Light Right
      const rimLight2 = new THREE.DirectionalLight(0x818cf8, 1.4);
      rimLight2.position.set(3, 1.8, -2);
      scene.add(rimLight2);

      // Gentle warm fill light front-left
      const fillLight = new THREE.PointLight(0xfef08a, 0.45, 6);
      fillLight.position.set(-1.5, 1.2, 2.2);
      scene.add(fillLight);

      // 5. MOUSE & POINTER TRACKING INTERACTION
      const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      const onPointerMove = (e: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;
        mouse.targetX = (clientX / rect.width) * 2 - 1;
        mouse.targetY = -(clientY / rect.height) * 2 + 1;
      };

      container.addEventListener('pointermove', onPointerMove);

      // 6. ANIMATION KINEMATICS & CLOCK LOOP
      const clock = new THREE.Clock();
      let blinkTimer = 3.0;
      let isBlinking = false;
      let blinkProgress = 0;

      const animate = () => {
        animFrameId = requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.1);
        const time = clock.getElapsedTime();
        const anim = animRef.current;
        const acc = accessoriesRef.current;

        // Sync accessory visibility
        glassesGroup.visible = !!acc.glasses;
        headbandGroup.visible = !!acc.zenHeadband;
        crownGroup.visible = !!acc.bambooCrown;
        scarfGroup.visible = !!acc.cozyScarf;

        // Smooth pointer tracking
        mouse.x = THREE.MathUtils.damp(mouse.x, mouse.targetX, 4, delta);
        mouse.y = THREE.MathUtils.damp(mouse.y, mouse.targetY, 4, delta);

        // Blinking system
        blinkTimer -= delta;
        if (blinkTimer <= 0) {
          isBlinking = true;
          blinkProgress = 0;
          blinkTimer = 2.5 + Math.random() * 3.5;
        }

        let eyeScaleY = 1.0;
        if (anim === 'sleeping') {
          eyeScaleY = 0.08;
        } else if (isBlinking) {
          blinkProgress += delta * 14;
          if (blinkProgress >= Math.PI) {
            isBlinking = false;
            eyeScaleY = 1.0;
          } else {
            eyeScaleY = Math.max(0.08, Math.cos(blinkProgress));
          }
        }
        leftEyeGroup.scale.y = THREE.MathUtils.damp(leftEyeGroup.scale.y, eyeScaleY, 18, delta);
        rightEyeGroup.scale.y = THREE.MathUtils.damp(rightEyeGroup.scale.y, eyeScaleY, 18, delta);

        // Base breathing motion
        const breathSpeed = anim === 'sleeping' ? 1.2 : anim === 'happy_bouncing' ? 4.5 : 2.2;
        const breathAmount = Math.sin(time * breathSpeed) * 0.035;
        bodyGroup.scale.y = THREE.MathUtils.damp(bodyGroup.scale.y, 1.0 + breathAmount, 6, delta);
        bodyGroup.scale.x = THREE.MathUtils.damp(bodyGroup.scale.x, 1.0 - breathAmount * 0.5, 6, delta);

        // Bamboo stick visibility
        bambooGroup.visible = anim === 'eating';

        // Specific animation states
        let targetHeadRotX = -mouse.y * 0.28;
        let targetHeadRotY = mouse.x * 0.42;
        let targetHeadRotZ = 0;
        let targetHeadPosY = 1.35 + breathAmount * 0.4;

        let targetPandaY = 0;
        let targetPandaRotY = 0;

        let targetRightArmRotZ = 0;
        let targetRightArmRotX = 0;
        let targetLeftArmRotZ = 0;
        let targetLeftArmRotX = 0;

        let targetLeftEarRotZ = 0.35;
        let targetRightEarRotZ = -0.35;

        switch (anim) {
          case 'idle':
            targetHeadRotZ = Math.sin(time * 0.8) * 0.04;
            targetLeftEarRotZ = 0.35 + Math.sin(time * 1.5) * 0.05;
            targetRightEarRotZ = -0.35 - Math.sin(time * 1.5) * 0.05;
            break;

          case 'waving':
            targetHeadRotZ = -0.12;
            targetHeadRotY += 0.1;
            // Right arm raises up and waves
            targetRightArmRotZ = 2.4 + Math.sin(time * 9) * 0.45;
            targetRightArmRotX = 0.3;
            targetRightEarRotZ = -0.45 + Math.sin(time * 9) * 0.1;
            break;

          case 'happy_bouncing':
            // Playful hops
            targetPandaY = Math.abs(Math.sin(time * 6)) * 0.22;
            targetHeadRotX = Math.sin(time * 6) * 0.15;
            targetRightArmRotZ = 1.2 + Math.sin(time * 6) * 0.3;
            targetLeftArmRotZ = -1.2 - Math.sin(time * 6) * 0.3;
            targetLeftEarRotZ = 0.45 + Math.sin(time * 12) * 0.1;
            targetRightEarRotZ = -0.45 - Math.sin(time * 12) * 0.1;
            break;

          case 'sleeping':
            targetHeadRotX = 0.28;
            targetHeadRotY = 0.1;
            targetHeadRotZ = 0.15;
            targetLeftEarRotZ = 0.15;
            targetRightEarRotZ = -0.15;
            targetRightArmRotZ = 0.1;
            targetLeftArmRotZ = -0.1;
            break;

          case 'sad':
            targetHeadRotX = 0.35;
            targetHeadRotY = 0;
            targetLeftEarRotZ = 0.12;
            targetRightEarRotZ = -0.12;
            targetRightArmRotX = 0.3;
            targetLeftArmRotX = 0.3;
            break;

          case 'playful':
            targetPandaRotY = Math.sin(time * 4) * 0.25;
            targetHeadRotZ = Math.sin(time * 4) * 0.18;
            targetRightArmRotZ = 0.8 + Math.sin(time * 5) * 0.4;
            targetLeftArmRotZ = -0.8 - Math.cos(time * 5) * 0.4;
            break;

          case 'thinking':
            targetHeadRotZ = -0.22;
            targetHeadRotX = -0.18;
            targetHeadRotY = 0.25;
            // Left arm scratching cheek/chin
            targetLeftArmRotZ = -1.8;
            targetLeftArmRotX = 0.75 + Math.sin(time * 6) * 0.1;
            break;

          case 'studying':
            targetHeadRotX = 0.22 + Math.sin(time * 1.8) * 0.04;
            targetHeadRotY = 0;
            targetRightArmRotX = 0.55;
            targetLeftArmRotX = 0.55;
            break;

          case 'celebrating':
            targetPandaRotY = time * 3.5;
            targetPandaY = Math.abs(Math.sin(time * 8)) * 0.32;
            targetRightArmRotZ = 2.4 + Math.sin(time * 10) * 0.4;
            targetLeftArmRotZ = -2.4 - Math.sin(time * 10) * 0.4;
            break;

          case 'eating':
            // Hand brings bamboo to mouth and munches
            targetRightArmRotZ = 1.6;
            targetRightArmRotX = 0.95 + Math.sin(time * 7) * 0.15;
            targetHeadRotX = 0.12 + Math.sin(time * 7) * 0.08;
            targetHeadRotZ = 0.08;
            break;

          case 'low_energy':
            targetHeadRotX = 0.28;
            targetHeadRotZ = Math.sin(time * 0.6) * 0.12;
            targetLeftEarRotZ = 0.2;
            targetRightEarRotZ = -0.2;
            targetRightArmRotZ = 0.05;
            targetLeftArmRotZ = -0.05;
            break;
        }

        // Apply smooth kinematics
        headPivot.rotation.x = THREE.MathUtils.damp(headPivot.rotation.x, targetHeadRotX, 6, delta);
        headPivot.rotation.y = THREE.MathUtils.damp(headPivot.rotation.y, targetHeadRotY, 6, delta);
        headPivot.rotation.z = THREE.MathUtils.damp(headPivot.rotation.z, targetHeadRotZ, 6, delta);
        headPivot.position.y = THREE.MathUtils.damp(headPivot.position.y, targetHeadPosY, 6, delta);

        pandaRoot.position.y = THREE.MathUtils.damp(pandaRoot.position.y, targetPandaY, 8, delta);
        pandaRoot.rotation.y = THREE.MathUtils.damp(pandaRoot.rotation.y, targetPandaRotY, 6, delta);

        rightArmPivot.rotation.z = THREE.MathUtils.damp(rightArmPivot.rotation.z, targetRightArmRotZ, 8, delta);
        rightArmPivot.rotation.x = THREE.MathUtils.damp(rightArmPivot.rotation.x, targetRightArmRotX, 8, delta);
        leftArmPivot.rotation.z = THREE.MathUtils.damp(leftArmPivot.rotation.z, targetLeftArmRotZ, 8, delta);
        leftArmPivot.rotation.x = THREE.MathUtils.damp(leftArmPivot.rotation.x, targetLeftArmRotX, 8, delta);

        leftEar.rotation.z = THREE.MathUtils.damp(leftEar.rotation.z, targetLeftEarRotZ, 8, delta);
        rightEar.rotation.z = THREE.MathUtils.damp(rightEar.rotation.z, targetRightEarRotZ, 8, delta);

        // Update floating zen particles
        for (let i = 0; i < particleCount; i++) {
          const p = particlePositions[i];
          const curY = (p.y + time * p.speed) % 3.2;
          const curX = p.x + Math.sin(time * 0.8 + p.phase) * 0.15;
          const curZ = p.z + Math.cos(time * 0.8 + p.phase) * 0.15;

          dummy.position.set(curX, curY, curZ);
          const scale = 0.6 + Math.sin(time * 2 + p.phase) * 0.4;
          dummy.scale.set(scale, scale, scale);
          dummy.updateMatrix();
          particles.setMatrixAt(i, dummy.matrix);
        }
        particles.instanceMatrix.needsUpdate = true;

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };

      animate();

      // Resize handler
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };
      window.addEventListener('resize', handleResize);

      // WebGL context loss recovery
      const glCanvas = renderer.domElement;
      const handleContextLost = (e: Event) => {
        e.preventDefault();
        setHasWebGlError(true);
      };
      const handleContextRestored = () => {
        setHasWebGlError(false);
      };
      glCanvas.addEventListener('webglcontextlost', handleContextLost);
      glCanvas.addEventListener('webglcontextrestored', handleContextRestored);

      return () => {
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('pointermove', onPointerMove);
        glCanvas.removeEventListener('webglcontextlost', handleContextLost);
        glCanvas.removeEventListener('webglcontextrestored', handleContextRestored);
        cancelAnimationFrame(animFrameId);
        renderer?.dispose();
        if (renderer?.domElement) {
          renderer.domElement.remove();
        }
      };
    } catch (err) {
      console.warn('WebGL Initialization Fallback:', err);
      setHasWebGlError(true);
    }
  }, []);

  // Raycast/Click & Pet Gestures
  const handlePointerDown = (e: React.PointerEvent) => {
    // Determine if it was a quick tap or drag
    const startX = e.clientX;
    const startY = e.clientY;

    const onPointerUp = (upEvt: PointerEvent) => {
      window.removeEventListener('pointerup', onPointerUp);
      const dist = Math.hypot(upEvt.clientX - startX, upEvt.clientY - startY);
      if (dist < 10) {
        // Quick tap/click
        playSound('squeak', soundVolume, soundEnabled);
        onPandaClick();
      } else {
        // Pet/tickle drag
        playSound('purr', soundVolume, soundEnabled);
        onPandaPet();
      }
    };
    window.addEventListener('pointerup', onPointerUp);
  };

  if (hasWebGlError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <img
          src="/src/assets/images/panda_buddy_portrait_1792338723967.jpg"
          alt="PandaBuddy AI"
          className="w-56 h-56 rounded-full object-cover shadow-2xl border-2 border-purple-500/30 animate-breathe cursor-pointer"
          onClick={onPandaClick}
        />
        <p className="text-xs text-slate-400 mt-3 font-medium">3D Engine running in compatibility mode · Tap to interact</p>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      className="w-full h-full relative cursor-pointer select-none touch-none"
      title="Click to interact with BaoBao · Drag to pet!"
    />
  );
};
