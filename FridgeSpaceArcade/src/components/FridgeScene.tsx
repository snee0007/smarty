import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FridgeItem } from '@/types/fridge';

const SHELVES = 3;
const SLOTS_PER_SHELF = 3;
const MAX_ITEMS = SHELVES * SLOTS_PER_SHELF;

const FW = 2;
const FH = 3.5;
const FD = 1.5;
const WALL = 0.08;

const SLOT_X = [-0.55, 0, 0.55];
const SHELF_Y = [-0.83, 0.12, 1.07];
const ITEM_Z = -0.08;

type ItemVisual = {
  width: number;
  height: number;
  emoji: string;
};

type AnimatedItemObject = THREE.Object3D & {
  userData: {
    itemId?: string;
    itemWidth?: number;
    itemHeight?: number;
    baseY?: number;
    createdAt?: number;
    bounceDuration?: number;
    phase?: number;
  };
};

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function getItemVisual(name: string, type: string): ItemVisual {
  const lower = name.toLowerCase();

  // FRUITS
  if (lower.includes('apple')) return { emoji: '🍎', width: 0.34, height: 0.34 };
  if (lower.includes('banana')) return { emoji: '🍌', width: 0.42, height: 0.32 };
  if (lower.includes('orange')) return { emoji: '🍊', width: 0.34, height: 0.34 };
  if (lower.includes('lemon')) return { emoji: '🍋', width: 0.34, height: 0.34 };
  if (lower.includes('grape')) return { emoji: '🍇', width: 0.38, height: 0.36 };
  if (lower.includes('strawberry')) return { emoji: '🍓', width: 0.34, height: 0.34 };
  if (lower.includes('watermelon')) return { emoji: '🍉', width: 0.42, height: 0.32 };
  if (lower.includes('peach')) return { emoji: '🍑', width: 0.34, height: 0.34 };
  if (lower.includes('pear')) return { emoji: '🍐', width: 0.34, height: 0.34 };
  if (lower.includes('pineapple')) return { emoji: '🍍', width: 0.38, height: 0.42 };

  // VEGETABLES
  if (lower.includes('tomato')) return { emoji: '🍅', width: 0.34, height: 0.34 };
  if (lower.includes('carrot')) return { emoji: '🥕', width: 0.38, height: 0.38 };
  if (lower.includes('potato')) return { emoji: '🥔', width: 0.34, height: 0.34 };
  if (lower.includes('onion')) return { emoji: '🧅', width: 0.34, height: 0.34 };
  if (lower.includes('mushroom')) return { emoji: '🍄', width: 0.34, height: 0.34 };
  if (lower.includes('broccoli')) return { emoji: '🥦', width: 0.36, height: 0.38 };
  if (lower.includes('lettuce')) return { emoji: '🥬', width: 0.38, height: 0.38 };
  if (lower.includes('cucumber')) return { emoji: '🥒', width: 0.42, height: 0.28 };
  if (lower.includes('pepper')) return { emoji: '🫑', width: 0.34, height: 0.36 };
  if (lower.includes('corn')) return { emoji: '🌽', width: 0.42, height: 0.36 };

  // DAIRY
  if (lower.includes('milk')) return { emoji: '🥛', width: 0.3, height: 0.46 };
  if (lower.includes('cheese')) return { emoji: '🧀', width: 0.42, height: 0.3 };
  if (lower.includes('egg')) return { emoji: '🥚', width: 0.28, height: 0.34 };
  if (lower.includes('yogurt')) return { emoji: '🥛', width: 0.3, height: 0.38 };
  if (lower.includes('butter')) return { emoji: '🧈', width: 0.4, height: 0.28 };

  // BREAD / GRAINS
  if (lower.includes('bread')) return { emoji: '🍞', width: 0.4, height: 0.34 };
  if (lower.includes('bagel')) return { emoji: '🥯', width: 0.34, height: 0.34 };
  if (lower.includes('rice')) return { emoji: '🍚', width: 0.36, height: 0.36 };
  if (lower.includes('noodle') || lower.includes('ramen')) return { emoji: '🍜', width: 0.42, height: 0.36 };
  if (lower.includes('spaghetti') || lower.includes('pasta')) return { emoji: '🍝', width: 0.42, height: 0.36 };

  // MEAT / PROTEIN
  if (lower.includes('chicken')) return { emoji: '🍗', width: 0.42, height: 0.36 };
  if (lower.includes('beef') || lower.includes('steak')) return { emoji: '🥩', width: 0.42, height: 0.36 };
  if (lower.includes('fish') || lower.includes('salmon')) return { emoji: '🐟', width: 0.42, height: 0.36 };
  if (lower.includes('shrimp') || lower.includes('prawn')) return { emoji: '🍤', width: 0.42, height: 0.36 };
  if (lower.includes('bacon')) return { emoji: '🥓', width: 0.42, height: 0.34 };

  // DRINKS
  if (lower.includes('juice')) return { emoji: '🧃', width: 0.28, height: 0.46 };
  if (lower.includes('water') || lower.includes('bottle')) return { emoji: '💧', width: 0.28, height: 0.44 };
  if (lower.includes('soda') || lower.includes('cola')) return { emoji: '🥤', width: 0.28, height: 0.44 };
  if (lower.includes('coffee')) return { emoji: '☕', width: 0.32, height: 0.38 };
  if (lower.includes('tea')) return { emoji: '🍵', width: 0.32, height: 0.38 };

  // SNACKS / NON-FRIDGE ITEMS
  if (lower.includes('pizza')) return { emoji: '🍕', width: 0.42, height: 0.36 };
  if (lower.includes('burger')) return { emoji: '🍔', width: 0.42, height: 0.36 };
  if (lower.includes('fries')) return { emoji: '🍟', width: 0.38, height: 0.38 };
  if (lower.includes('sandwich')) return { emoji: '🥪', width: 0.42, height: 0.36 };
  if (lower.includes('taco')) return { emoji: '🌮', width: 0.42, height: 0.36 };
  if (lower.includes('burrito')) return { emoji: '🌯', width: 0.42, height: 0.36 };
  if (lower.includes('cereal')) return { emoji: '🥣', width: 0.38, height: 0.36 };
  if (lower.includes('soup')) return { emoji: '🍲', width: 0.38, height: 0.36 };

  // SWEETS
  if (lower.includes('cake')) return { emoji: '🍰', width: 0.36, height: 0.36 };
  if (lower.includes('donut') || lower.includes('doughnut')) return { emoji: '🍩', width: 0.34, height: 0.34 };
  if (lower.includes('cookie') || lower.includes('biscuit')) return { emoji: '🍪', width: 0.34, height: 0.34 };
  if (lower.includes('chocolate')) return { emoji: '🍫', width: 0.34, height: 0.34 };
  if (lower.includes('ice cream')) return { emoji: '🍦', width: 0.34, height: 0.42 };

  // CONDIMENTS
  if (lower.includes('sauce')) return { emoji: '🥫', width: 0.3, height: 0.42 };
  if (lower.includes('ketchup')) return { emoji: '🍅', width: 0.34, height: 0.36 };
  if (lower.includes('mustard')) return { emoji: '🌭', width: 0.34, height: 0.36 };
  if (lower.includes('mayo')) return { emoji: '🥫', width: 0.3, height: 0.42 };

  if (type === 'milk') return { emoji: '🥛', width: 0.3, height: 0.46 };
  if (type === 'cheese') return { emoji: '🧀', width: 0.42, height: 0.3 };
  if (type === 'juice') return { emoji: '🧃', width: 0.28, height: 0.46 };

  return { emoji: '🍽️', width: 0.34, height: 0.34 };
}

function createEmojiTexture(name: string, emoji: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;

  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 256, 256);

  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  roundedRect(ctx, 20, 20, 216, 216, 28);
  ctx.fill();

  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 8;
  roundedRect(ctx, 20, 20, 216, 216, 28);
  ctx.stroke();

  ctx.font = '120px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 128, 108);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(name.slice(0, 12), 128, 204);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    const material = (mesh as THREE.Mesh).material;
    if (Array.isArray(material)) {
      material.forEach((m) => {
        const map = (m as THREE.MeshBasicMaterial).map;
        if (map) map.dispose();
        m.dispose();
      });
    } else if (material) {
      const map = (material as THREE.MeshBasicMaterial).map;
      if (map) map.dispose();
      material.dispose();
    }
  });
}

function createItemObject(item: FridgeItem): AnimatedItemObject {
  const visual = getItemVisual(item.name, item.type);
  const group = new THREE.Group() as AnimatedItemObject;

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(visual.width * 0.33, 20),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.002;
  group.add(shadow);

  const texture = createEmojiTexture(item.name, visual.emoji);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    })
  );
  sprite.scale.set(visual.width, visual.height, 1);
  sprite.position.y = visual.height / 2 + 0.03;
  sprite.userData.itemId = item.id;
  group.add(sprite);

  const marker = new THREE.Mesh(
    new THREE.BoxGeometry(Math.max(visual.width * 0.2, 0.08), 0.02, Math.max(visual.width * 0.2, 0.08)),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
  );
  marker.position.y = 0.03;
  marker.userData.itemId = item.id;
  group.add(marker);

  const x = SLOT_X[item.slotIndex] ?? 0;
  const shelfTop = (SHELF_Y[item.shelfIndex] ?? 0) + 0.025;
  const hoverBaseY = shelfTop + 0.03;

  group.position.set(x, hoverBaseY, ITEM_Z);
  group.scale.setScalar(0.2);

  group.userData.itemId = item.id;
  group.userData.itemWidth = visual.width;
  group.userData.itemHeight = visual.height;
  group.userData.baseY = hoverBaseY;
  group.userData.createdAt = performance.now();
  group.userData.bounceDuration = 650;
  group.userData.phase = Math.random() * Math.PI * 2;

  return group;
}

interface SceneRefs {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  fridgeGroup: THREE.Group;
  doorPivot: THREE.Object3D;
  interiorLight: THREE.PointLight;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  itemObjects: Map<string, AnimatedItemObject>;
  doorOpen: boolean;
  animating: boolean;
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

  const toggleDoor = useCallback((refs: SceneRefs) => {
    if (refs.animating) return;

    refs.animating = true;

    const startRotation = refs.doorPivot.rotation.y;
    const targetRotation = refs.doorOpen ? 0 : Math.PI / 2.2;
    const startLight = refs.interiorLight.intensity;
    const targetLight = refs.doorOpen ? 0.5 : 2.2;

    const duration = 420;
    const startTime = performance.now();

    const animateDoor = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      refs.doorPivot.rotation.y = startRotation + (targetRotation - startRotation) * eased;
      refs.interiorLight.intensity = startLight + (targetLight - startLight) * eased;

      if (t < 1) {
        requestAnimationFrame(animateDoor);
        return;
      }

      refs.doorOpen = !refs.doorOpen;
      refs.animating = false;
      onDoorStateChange(refs.doorOpen);
    };

    requestAnimationFrame(animateDoor);
  }, [onDoorStateChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x050816);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(4.6, 2.8, 5.9);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.autoRotate = false;
    controls.target.set(0, 0.2, 0);

    const ambient = new THREE.AmbientLight(0x6172a5, 0.7);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xe5ecff, 1.08);
    directional.position.set(5, 8, 4);
    scene.add(directional);

    const starsGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(900);
    for (let i = 0; i < starPositions.length; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 100;
      starPositions[i + 1] = (Math.random() - 0.5) * 100;
      starPositions[i + 2] = (Math.random() - 0.5) * 100;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starsGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.18 })
    );
    scene.add(stars);

    const fridgeGroup = new THREE.Group();
    scene.add(fridgeGroup);

    const bodyMaterial = new THREE.MeshToonMaterial({ color: 0xf4f0df });
    const interiorMaterial = new THREE.MeshToonMaterial({
      color: 0xb8c7d9,
      emissive: 0x332200,
      emissiveIntensity: 0.08,
    });
    const shelfMaterial = new THREE.MeshToonMaterial({ color: 0xe6edf5 });
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a1a1a,
      side: THREE.BackSide,
    });

    const addOutlinedMesh = (mesh: THREE.Mesh, parent: THREE.Object3D) => {
      parent.add(mesh);

      const outline = new THREE.Mesh(mesh.geometry.clone(), outlineMaterial);
      outline.position.copy(mesh.position);
      outline.rotation.copy(mesh.rotation);
      outline.scale.copy(mesh.scale).multiplyScalar(1.03);
      parent.add(outline);
    };

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(WALL, FH, FD), bodyMaterial);
    leftWall.position.set(-FW / 2 + WALL / 2, 0, 0);
    addOutlinedMesh(leftWall, fridgeGroup);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(WALL, FH, FD), bodyMaterial);
    rightWall.position.set(FW / 2 - WALL / 2, 0, 0);
    addOutlinedMesh(rightWall, fridgeGroup);

    const topWall = new THREE.Mesh(new THREE.BoxGeometry(FW, WALL, FD), bodyMaterial);
    topWall.position.set(0, FH / 2 - WALL / 2, 0);
    addOutlinedMesh(topWall, fridgeGroup);

    const bottomWall = new THREE.Mesh(new THREE.BoxGeometry(FW, WALL, FD), bodyMaterial);
    bottomWall.position.set(0, -FH / 2 + WALL / 2, 0);
    addOutlinedMesh(bottomWall, fridgeGroup);

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(FW - WALL * 2, FH - WALL * 2, WALL),
      interiorMaterial
    );
    backWall.position.set(0, 0, -FD / 2 + WALL / 2);
    addOutlinedMesh(backWall, fridgeGroup);

    for (let i = 0; i < SHELVES; i++) {
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(FW - WALL * 3, 0.05, FD - 0.28),
        shelfMaterial
      );
      shelf.position.set(0, SHELF_Y[i], -0.08);
      addOutlinedMesh(shelf, fridgeGroup);
    }

    const interiorLight = new THREE.PointLight(0xffd86b, 0.5, 6);
    interiorLight.position.set(0, 0.6, 0.2);
    fridgeGroup.add(interiorLight);

    const doorPivot = new THREE.Object3D();
    doorPivot.position.set(FW / 2, 0, FD / 2 + 0.03);
    fridgeGroup.add(doorPivot);

    const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(FW, FH, 0.1), bodyMaterial);
    doorMesh.position.set(-FW / 2, 0, 0);
    doorMesh.userData.isDoor = true;
    addOutlinedMesh(doorMesh, doorPivot);

    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.6, 0.12),
      new THREE.MeshToonMaterial({ color: 0xd01010 })
    );
    handle.position.set(-FW + 0.22, 0.2, 0.09);
    handle.userData.isDoor = true;
    doorPivot.add(handle);

    const floorGlow = new THREE.Mesh(
      new THREE.CircleGeometry(2.4, 32),
      new THREE.MeshBasicMaterial({
        color: 0x1f2d5a,
        transparent: true,
        opacity: 0.22,
      })
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = -FH / 2 - 0.01;
    scene.add(floorGlow);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      fridgeGroup,
      doorPivot,
      interiorLight,
      raycaster,
      mouse,
      itemObjects: new Map(),
      doorOpen: false,
      animating: false,
    };

    const onClick = (event: MouseEvent) => {
      const refs = sceneRef.current;
      if (!refs) return;

      refs.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      refs.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      refs.raycaster.setFromCamera(refs.mouse, refs.camera);

      if (refs.doorOpen) {
        const itemHits = refs.raycaster.intersectObjects(Array.from(refs.itemObjects.values()), true);

        if (itemHits.length > 0) {
          const hit = itemHits[0].object;
          const id =
            hit.userData.itemId ??
            hit.parent?.userData.itemId ??
            hit.parent?.parent?.userData.itemId;

          if (id) {
            onRemoveItem(id);
            return;
          }
        }
      }

      const doorHits = refs.raycaster.intersectObjects(refs.doorPivot.children, true);
      if (doorHits.length > 0) {
        toggleDoor(refs);
      }
    };

    canvas.addEventListener('click', onClick);

    const animate = () => {
      const refs = sceneRef.current;
      if (!refs) return;

      requestAnimationFrame(animate);

      const now = performance.now();

      refs.itemObjects.forEach((object) => {
        const baseY = object.userData.baseY ?? object.position.y;
        const phase = object.userData.phase ?? 0;
        const hoverOffset = Math.sin(now * 0.002 + phase) * 0.015;
        object.position.y = baseY + hoverOffset;

        const createdAt = object.userData.createdAt ?? now;
        const bounceDuration = object.userData.bounceDuration ?? 650;
        const elapsed = now - createdAt;
        const progress = Math.min(elapsed / bounceDuration, 1);

        if (progress < 1) {
          const eased = 1 - Math.pow(1 - progress, 3);
          const overshoot = 1 + Math.sin(progress * Math.PI) * 0.18;
          object.scale.setScalar(eased * overshoot);
        } else {
          object.scale.setScalar(1);
        }
      });

      refs.controls.update();
      refs.renderer.render(refs.scene, refs.camera);
    };

    animate();

    const onResize = () => {
      const refs = sceneRef.current;
      if (!refs) return;

      refs.camera.aspect = window.innerWidth / window.innerHeight;
      refs.camera.updateProjectionMatrix();
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('click', onClick);
      renderer.dispose();
    };
  }, [onRemoveItem, toggleDoor]);

  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;

    if (doorShouldOpen && !refs.doorOpen && !refs.animating) {
      toggleDoor(refs);
    }
  }, [doorShouldOpen, toggleDoor]);

  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;

    const currentIds = new Set(items.map((item) => item.id));

    refs.itemObjects.forEach((object, id) => {
      if (!currentIds.has(id)) {
        refs.fridgeGroup.remove(object);
        disposeObject(object);
        refs.itemObjects.delete(id);
      }
    });

    for (const item of items) {
      const existing = refs.itemObjects.get(item.id);

      if (existing) {
        const x = SLOT_X[item.slotIndex] ?? 0;
        const shelfTop = (SHELF_Y[item.shelfIndex] ?? 0) + 0.025;
        const hoverBaseY = shelfTop + 0.03;
        existing.position.set(x, hoverBaseY, ITEM_Z);
        existing.userData.baseY = hoverBaseY;
        continue;
      }

      const object = createItemObject(item);
      refs.fridgeGroup.add(object);
      refs.itemObjects.set(item.id, object);
    }
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