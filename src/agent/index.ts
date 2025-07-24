import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Configuration constants
const AGENT_CONFIG = {
  CAMERA: {
    FOV: 75,
    NEAR: 0.1,
    FAR: 1000,
    INITIAL_POSITION: [0, 0, 3] as [number, number, number],
    TARGET: [0, 0, 0] as [number, number, number],
  },
  CONTROLS: {
    ROTATE_SPEED: 0.5,
    DAMPING_FACTOR: 0.05,
    MAX_POLAR_ANGLE: Math.PI * 0.8,
    MIN_POLAR_ANGLE: Math.PI * 0.2,
  },
  LIGHTING: {
    AMBIENT: { color: 0x404040, intensity: 0.4 },
    KEY_LIGHT: {
      color: 0xffffff,
      intensity: 3.0,
      position: [5, 5, 5] as [number, number, number],
    },
    FILL_LIGHT: {
      color: 0xffffff,
      intensity: 1.0,
      position: [-5, 3, 5] as [number, number, number],
    },
    RIM_LIGHT: {
      color: 0xffffff,
      intensity: 0.5,
      position: [0, 5, -5] as [number, number, number],
    },
  },
  AVATAR: {
    MODEL_PATH: "/models/characters/fox_character.glb",
    POSITION: [0, -1.8, 0] as [number, number, number],
    SCALE: [4, 4, 4] as [number, number, number],
  },
  RENDERER: {
    PIXEL_RATIO_LIMIT: 2,
  },
} as const;

// Agent instance interface
interface AgentInstance {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  animationId: number | null;
  avatar: THREE.Group | null;
  mixer: THREE.AnimationMixer | null;
  clock: THREE.Clock;
}

let agentInstance: AgentInstance | null = null;
let resizeHandler: (() => void) | null = null;

// Start agent
export function startAgent(canvasId: string): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) {
    console.error(`Canvas with id "${canvasId}" not found`);
    return;
  }

  // Clean up existing instance if any
  if (agentInstance) {
    cleanupAgent();
  }

  try {
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      AGENT_CONFIG.CAMERA.FOV,
      canvas.clientWidth / canvas.clientHeight,
      AGENT_CONFIG.CAMERA.NEAR,
      AGENT_CONFIG.CAMERA.FAR
    );
    camera.position.set(...AGENT_CONFIG.CAMERA.INITIAL_POSITION);
    camera.lookAt(...AGENT_CONFIG.CAMERA.TARGET);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, AGENT_CONFIG.RENDERER.PIXEL_RATIO_LIMIT)
    );

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = AGENT_CONFIG.CONTROLS.DAMPING_FACTOR;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.autoRotate = false;
    controls.rotateSpeed = AGENT_CONFIG.CONTROLS.ROTATE_SPEED;
    controls.maxPolarAngle = AGENT_CONFIG.CONTROLS.MAX_POLAR_ANGLE;
    controls.minPolarAngle = AGENT_CONFIG.CONTROLS.MIN_POLAR_ANGLE;
    controls.target.set(...AGENT_CONFIG.CAMERA.TARGET);

    // Setup lighting
    setupLighting(scene);

    // Load avatar model
    let avatar: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;

    loadGLBModel(scene)
      .then(({ model, animationMixer }) => {
        avatar = model;
        mixer = animationMixer;

        if (avatar) {
          avatar.position.set(...AGENT_CONFIG.AVATAR.POSITION);
          avatar.scale.set(...AGENT_CONFIG.AVATAR.SCALE);
        }
      })
      .catch((error) => {
        console.error("Failed to load GLB model:", error);
        // Fallback to geometric avatar
        avatar = createAvatar();
        scene.add(avatar);
      });

    // Setup animation loop
    const clock = new THREE.Clock();
    let animationId: number | null = null;

    function animate() {
      animationId = requestAnimationFrame(animate);

      const deltaTime = clock.getDelta();

      // Update animation mixer if it exists
      if (mixer) {
        mixer.update(deltaTime);
      }

      // Update controls
      controls.update();

      renderer.render(scene, camera);
    }

    // Setup resize handler
    setupResizeHandler(canvas, camera, renderer, scene);

    // Store instance
    agentInstance = {
      scene,
      camera,
      renderer,
      controls,
      animationId,
      avatar,
      mixer,
      clock,
    };

    // Start animation
    animate();
  } catch (error) {
    console.error("Failed to start agent:", error);
  }
}

// Setup lighting for the scene
function setupLighting(scene: THREE.Scene): void {
  const { LIGHTING } = AGENT_CONFIG;

  // Ambient light
  const ambientLight = new THREE.AmbientLight(
    LIGHTING.AMBIENT.color,
    LIGHTING.AMBIENT.intensity
  );
  scene.add(ambientLight);

  // Key light
  const keyLight = new THREE.DirectionalLight(
    LIGHTING.KEY_LIGHT.color,
    LIGHTING.KEY_LIGHT.intensity
  );
  keyLight.position.set(...LIGHTING.KEY_LIGHT.position);
  scene.add(keyLight);

  // Fill light
  const fillLight = new THREE.DirectionalLight(
    LIGHTING.FILL_LIGHT.color,
    LIGHTING.FILL_LIGHT.intensity
  );
  fillLight.position.set(...LIGHTING.FILL_LIGHT.position);
  scene.add(fillLight);

  // Rim light
  const rimLight = new THREE.DirectionalLight(
    LIGHTING.RIM_LIGHT.color,
    LIGHTING.RIM_LIGHT.intensity
  );
  rimLight.position.set(...LIGHTING.RIM_LIGHT.position);
  scene.add(rimLight);
}

// Setup resize handler with debouncing
function setupResizeHandler(
  canvas: HTMLCanvasElement,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene
): void {
  let resizeTimeout: number | null = null;

  resizeHandler = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    resizeTimeout = window.setTimeout(() => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);

      // Force a render to update the display
      renderer.render(scene, camera);
    }, 100);
  };

  window.addEventListener("resize", resizeHandler);

  // Initial resize to ensure proper sizing
  resizeHandler();
}

// Load GLB model
async function loadGLBModel(
  scene: THREE.Scene
): Promise<{
  model: THREE.Group;
  animationMixer: THREE.AnimationMixer | null;
}> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    loader.load(
      AGENT_CONFIG.AVATAR.MODEL_PATH,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        // Set up animation mixer if animations exist
        let mixer: THREE.AnimationMixer | null = null;
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        resolve({ model, animationMixer: mixer });
      },
      undefined, // Progress callback removed for production
      (error) => {
        console.error("Error loading GLB:", error);
        reject(error);
      }
    );
  });
}

// Create fallback avatar
function createAvatar(): THREE.Group {
  const group = new THREE.Group();

  // Create a simple robot-like avatar
  const headGeometry = new THREE.BoxGeometry(1, 1, 1);
  const headMaterial = new THREE.MeshPhongMaterial({ color: 0x4a90e2 });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.5;
  group.add(head);

  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });

  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.3, 1.6, 0.4);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.3, 1.6, 0.4);
  group.add(rightEye);

  // Body
  const bodyGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.6);
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.25;
  group.add(body);

  // Arms
  const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
  const armMaterial = new THREE.MeshPhongMaterial({ color: 0x4a90e2 });

  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.9, 0.5, 0);
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.9, 0.5, 0);
  group.add(rightArm);

  // Add some animation to the arms
  const animateArms = () => {
    leftArm.rotation.z = Math.sin(Date.now() * 0.003) * 0.3;
    rightArm.rotation.z = Math.sin(Date.now() * 0.003 + Math.PI) * 0.3;
  };

  // Store animation function on the group
  (group as any).animateArms = animateArms;

  return group;
}

// Cleanup agent
export function cleanupAgent(): void {
  if (agentInstance) {
    if (agentInstance.animationId) {
      cancelAnimationFrame(agentInstance.animationId);
    }

    if (agentInstance.mixer) {
      agentInstance.mixer.stopAllAction();
    }

    if (agentInstance.controls) {
      agentInstance.controls.dispose();
    }

    if (agentInstance.renderer) {
      agentInstance.renderer.dispose();
    }

    // Remove resize event listener
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }

    agentInstance = null;
  }
}

// Get agent instance
export function getAgentInstance(): AgentInstance | null {
  return agentInstance;
}
