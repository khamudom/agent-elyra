import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Agent instance interface
interface AgentInstance {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  animationId: number | null;
  avatar: THREE.Group | null;
  mixer: THREE.AnimationMixer | null;
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

  // Create scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  // Create camera
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 3); // Move camera much closer for a more intimate view
  camera.lookAt(0, 0, 0);

  // Create renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Add orbit controls for mouse interaction
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Smooth rotation
  controls.dampingFactor = 0.05;
  controls.enableZoom = true; // Allow zooming
  controls.enablePan = false; // Disable panning to keep focus on the model
  controls.autoRotate = false; // Disable auto-rotation
  
  // Reduce rotation sensitivity for more controlled movement
  controls.rotateSpeed = 0.5; // Reduce from default 1.0 to 0.5
  controls.maxPolarAngle = Math.PI * 0.8; // Limit vertical rotation to prevent flipping
  controls.minPolarAngle = Math.PI * 0.2; // Limit vertical rotation to prevent flipping
  
           // Set the rotation target to the 3D object's position (will be updated when model loads)
    controls.target.set(0, 0, 0); // Center on the origin where the avatar is

  // Add lighting - Studio setup
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4); // Subtle ambient
  scene.add(ambientLight);

  // Main key light
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  // Fill light (softer, opposite side)
  const fillLight = new THREE.DirectionalLight(0xffffff, 1);
  fillLight.position.set(-5, 3, 5);
  scene.add(fillLight);

  // Rim light (back lighting)
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
  rimLight.position.set(0, 5, -5);
  scene.add(rimLight);

  // Load GLB model
  let avatar: THREE.Group | null = null;
  let mixer: THREE.AnimationMixer | null = null;
  
  loadGLBModel(scene).then(({ model, animationMixer }) => {
    avatar = model;
    mixer = animationMixer;
    
        // Position and scale the model appropriately
        if (avatar) {
          avatar.position.set(0, -1.8, 0); // Keep at origin
          avatar.scale.set(4, 4, 4); // Increase scale to fill more of the frame
        }
  }).catch(error => {
    console.error('Failed to load GLB model:', error);
    // Fallback to geometric avatar
    avatar = createAvatar();
    scene.add(avatar);
  });

  // Animation loop
  let animationId: number | null = null;
  const clock = new THREE.Clock();
  
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

  // Handle window resize with debouncing
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

  window.addEventListener('resize', resizeHandler);
  
  // Initial resize to ensure proper sizing
  resizeHandler();

  // Store instance
  agentInstance = {
    scene,
    camera,
    renderer,
    controls,
    animationId,
    avatar,
    mixer
  };

  // Start animation
  animate();
}

// Load GLB model
async function loadGLBModel(scene: THREE.Scene): Promise<{ model: THREE.Group, animationMixer: THREE.AnimationMixer | null }> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    
    // Load the GLB file from public/models/characters/
    loader.load(
      '/models/characters/fox_character.glb',
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
      (_progress) => {
        // Progress logging removed for production
      },
      (error) => {
        console.error('Error loading GLB:', error);
        reject(error);
      }
    );
  });
}

// Create avatar
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
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    
    agentInstance = null;
  }
}

// Get agent instance
export function getAgentInstance(): AgentInstance | null {
  return agentInstance;
} 