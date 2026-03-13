import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FridgeItem } from '@/types/fridge';

const SHELVES = 3;
const SLOTS_PER_SHELF = 3;
const MAX_ITEMS = SHELVES * SLOTS_PER_SHELF;

// Fridge dimensions
const FW = 2, FH = 3.5, FD = 1.5;
const WALL = 0.08;

function createLabelTexture(name: string, expiry: string): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = '#fff';
  ctx.font = '8px monospace';
  ctx.fillText(name.slice(0, 8), 4, 24);
  ctx.fillStyle = '#fcd566';
  ctx.font = '7px monospace';
  ctx.fillText(expiry, 4, 44);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

function getItemColor(type: string): number {
  switch (type) {
    case 'milk': return 0xf8f8f8;
    case 'cheese': return 0xfcd566;
    case 'juice': return 0xff8844;
    default: return 0xb08050;
  }
}

function getItemGeometry(type: string): THREE.BufferGeometry {
  switch (type) {
    case 'milk': return new THREE.BoxGeometry(0.25, 0.5, 0.25);
    case 'cheese': return new THREE.BoxGeometry(0.3, 0.2, 0.3);
    case 'juice': return new THREE.BoxGeometry(0.2, 0.4, 0.2);
    default: return new THREE.BoxGeometry(0.28, 0.3, 0.25);
  }
}

function getSlotPosition(shelfIndex: number, slotIndex: number): THREE.Vector3 {
  const shelfY = -FH / 2 + 0.5 + shelfIndex * 1.0;
  const x = -0.5 + slotIndex * 0.5;
  const z = 0;
  return new THREE.Vector3(x, shelfY + 0.25, z);
}

interface SceneRefs {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  doorPivot: THREE.Object3D;
  interiorLight: THREE.PointLight;
  doorOpen: boolean;
  animating: boolean;
  fridgeGroup: THREE.Group;
  itemMeshes: Map<string, THREE.Mesh>;
  slots: boolean[][];
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  doorMesh: THREE.Mesh;
  clock: THREE.Clock;
}

interface Props {
  items: FridgeItem[];
  onRemoveItem: (id: string) => void;
  onDoorStateChange: (open: boolean) => void;
  doorShouldOpen: boolean;
}

const FridgeScene = ({ items, onRemoveItem, onDoorStateChange, doorShouldOpen }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneRefs | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Initialize scene
  useEffect(() => {
    const canvas = canvasRef.current!;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(0.5); // Pixelated look
    renderer.setClearColor(0x02030a);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(4, 3, 6);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.target.set(0, 0, 0);

    // Lighting
    const ambient = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xaabbff, 0.8);
    dirLight.position.set(5, 8, 4);
    scene.add(dirLight);

    // Stars
    const starsGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(600);
    for (let i = 0; i < 600; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 100;
      starPositions[i + 1] = (Math.random() - 0.5) * 100;
      starPositions[i + 2] = (Math.random() - 0.5) * 100;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3 });
    scene.add(new THREE.Points(starsGeo, starsMat));

    // Fridge group
    const fridgeGroup = new THREE.Group();
    scene.add(fridgeGroup);

    const toonMat = (color: number) => new THREE.MeshToonMaterial({ color });
    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, side: THREE.BackSide });

    // Body
    const bodyGeo = new THREE.BoxGeometry(FW, FH, FD);
    const body = new THREE.Mesh(bodyGeo, toonMat(0xf4f0df));
    fridgeGroup.add(body);
    // Outline
    const bodyOutline = new THREE.Mesh(bodyGeo, outlineMat);
    bodyOutline.scale.multiplyScalar(1.03);
    fridgeGroup.add(bodyOutline);

    // Interior cavity
    const interiorGeo = new THREE.BoxGeometry(FW - WALL * 2, FH - WALL * 2, FD - WALL * 2);
    const interiorMat = new THREE.MeshToonMaterial({ color: 0x8899aa, emissive: 0x332200, emissiveIntensity: 0.1 });
    const interior = new THREE.Mesh(interiorGeo, interiorMat);
    interior.position.z = -WALL;
    fridgeGroup.add(interior);

    // Shelves
    for (let i = 0; i < SHELVES; i++) {
      const shelfGeo = new THREE.BoxGeometry(FW - WALL * 4, 0.04, FD - WALL * 4);
      const shelf = new THREE.Mesh(shelfGeo, toonMat(0xcccccc));
      shelf.position.set(0, -FH / 2 + 0.5 + i * 1.0, -WALL);
      fridgeGroup.add(shelf);
    }

    // Interior light
    const interiorLight = new THREE.PointLight(0xffd86b, 0.1, 5);
    interiorLight.position.set(0, 1, 0.2);
    fridgeGroup.add(interiorLight);

    // Door
    const doorPivot = new THREE.Object3D();
    doorPivot.position.set(FW / 2, 0, FD / 2);
    fridgeGroup.add(doorPivot);

    const doorGeo = new THREE.BoxGeometry(FW, FH, 0.1);
    const doorMesh = new THREE.Mesh(doorGeo, toonMat(0xf4f0df));
    doorMesh.position.set(-FW / 2, 0, 0);
    doorMesh.userData.isDoor = true;
    doorPivot.add(doorMesh);
    // Door outline
    const doorOutline = new THREE.Mesh(doorGeo, outlineMat);
    doorOutline.scale.multiplyScalar(1.03);
    doorOutline.position.copy(doorMesh.position);
    doorPivot.add(doorOutline);

    // Handle
    const handleGeo = new THREE.BoxGeometry(0.08, 0.6, 0.12);
    const handle = new THREE.Mesh(handleGeo, toonMat(0xd01010));
    handle.position.set(-FW + 0.2, 0.3, 0.08);
    handle.userData.isDoor = true;
    doorPivot.add(handle);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const clock = new THREE.Clock();

    const slots: boolean[][] = [];
    for (let s = 0; s < SHELVES; s++) {
      slots.push(new Array(SLOTS_PER_SHELF).fill(false));
    }

    sceneRef.current = {
      scene, camera, renderer, controls, doorPivot, interiorLight,
      doorOpen: false, animating: false, fridgeGroup,
      itemMeshes: new Map(), slots, raycaster, mouse, doorMesh, clock
    };

    // Click handler
    const onClick = (e: MouseEvent) => {
      const refs = sceneRef.current!;
      refs.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      refs.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      refs.raycaster.setFromCamera(refs.mouse, refs.camera);

      // Check items first
      const itemMeshArray = Array.from(refs.itemMeshes.values());
      const itemHits = refs.raycaster.intersectObjects(itemMeshArray);
      if (itemHits.length > 0 && refs.doorOpen) {
        const hit = itemHits[0].object as THREE.Mesh;
        const id = hit.userData.itemId;
        if (id) onRemoveItem(id);
        return;
      }

      // Check door
      const doorHits = refs.raycaster.intersectObjects(refs.doorPivot.children, true);
      if (doorHits.length > 0) {
        toggleDoor(refs);
      }
    };

    canvas.addEventListener('click', onClick);

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      const refs = sceneRef.current;
      if (!refs) return;
      const t = refs.clock.getElapsedTime();
      refs.fridgeGroup.position.y = Math.sin(t * 0.8) * 0.15;
      refs.fridgeGroup.rotation.y = Math.sin(t * 0.3) * 0.05;
      refs.controls.update();
      refs.renderer.render(refs.scene, refs.camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('click', onClick);
      renderer.dispose();
    };
  }, []);

  // Toggle door function
  const toggleDoor = useCallback((refs: SceneRefs) => {
    if (refs.animating) return;
    refs.animating = true;
    const targetY = refs.doorOpen ? 0 : -Math.PI / 2;
    const startY = refs.doorPivot.rotation.y;
    const startIntensity = refs.interiorLight.intensity;
    const targetIntensity = refs.doorOpen ? 0.1 : 2.0;
    const dur = 500;
    const start = performance.now();

    const anim = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / dur, 1);
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      refs.doorPivot.rotation.y = startY + (targetY - startY) * ease;
      refs.interiorLight.intensity = startIntensity + (targetIntensity - startIntensity) * ease;
      if (p < 1) {
        requestAnimationFrame(anim);
      } else {
        refs.doorOpen = !refs.doorOpen;
        refs.animating = false;
        onDoorStateChange(refs.doorOpen);
      }
    };
    requestAnimationFrame(anim);
  }, [onDoorStateChange]);

  // Auto-open door when requested
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    if (doorShouldOpen && !refs.doorOpen && !refs.animating) {
      toggleDoor(refs);
    }
  }, [doorShouldOpen, toggleDoor]);

  // Sync item meshes
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;

    const currentIds = new Set(items.map(i => i.id));
    
    // Remove meshes for deleted items
    refs.itemMeshes.forEach((mesh, id) => {
      if (!currentIds.has(id)) {
        refs.fridgeGroup.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        refs.itemMeshes.delete(id);
        // Free slot
        const item = itemsRef.current.find(i => i.id === id);
        if (!item) {
          // find from saved data
        }
      }
    });

    // Reset slots
    for (let s = 0; s < SHELVES; s++) {
      refs.slots[s].fill(false);
    }
    // Mark occupied slots
    items.forEach(item => {
      if (item.shelfIndex < SHELVES && item.slotIndex < SLOTS_PER_SHELF) {
        refs.slots[item.shelfIndex][item.slotIndex] = true;
      }
    });

    // Add meshes for new items
    items.forEach(item => {
      if (refs.itemMeshes.has(item.id)) return;
      const geo = getItemGeometry(item.type);
      const labelTex = createLabelTexture(item.name, item.expiry.toISOString().slice(0, 10));
      const mat = new THREE.MeshToonMaterial({
        color: getItemColor(item.type),
        map: labelTex,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.itemId = item.id;
      const pos = getSlotPosition(item.shelfIndex, item.slotIndex);
      mesh.position.copy(pos);
      mesh.position.z -= WALL;
      refs.fridgeGroup.add(mesh);
      refs.itemMeshes.set(item.id, mesh);
    });
  }, [items]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export { MAX_ITEMS, SHELVES, SLOTS_PER_SHELF };
export default FridgeScene;
