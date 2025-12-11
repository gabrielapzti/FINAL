// main.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";

// ------------------ CENA ------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color("#222");

// ------------------ CÂMERA ------------------
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  50
);
camera.position.set(0, 2, 4);

// ------------------ RENDERER ------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// ------------------ LUZES ------------------
const hemi = new THREE.HemisphereLight(0xffffff, 0x333333, 0.6);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(3, 6, 3);
dir.castShadow = true;
scene.add(dir);

// ------------------ CHÃO ------------------
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({ color: "#444" })
);
ground.receiveShadow = true;
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ------------------ CONTROLES ------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.update();

// ------------------ LOADERS ------------------
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// Carrega textura difusa (imagem básica)
const diffuse = textureLoader.load("assets/gato_diffuse.png", (t) => {
  t.encoding = THREE.sRGBEncoding;
});

let cat = null;
let mixer = null;

// ------------------ CARREGAR O MODELO ------------------
gltfLoader.load(
  "assets/cat.obj",
  (gltf) => {
    console.log("Modelo carregado");

    cat = gltf.scene;
    cat.scale.set(1.3, 1.3, 1.3);
    cat.position.set(0, 0, 0);

    cat.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;

        node.material = new THREE.MeshStandardMaterial({
          map: diffuse,
          metalness: 0,
          roughness: 1,
        });
      }
    });

    scene.add(cat);

    // ANIMAÇÕES DO ARQUIVO (se existirem)
    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(cat);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
    }

    // esconde texto de loading
    document.getElementById("loading").style.display = "none";
  },
  undefined,
  (err) => console.error("Erro carregando modelo", err)
);

// ------------------ ANIMAÇÃO MANUAL (RABO) ------------------
const clock = new THREE.Clock();

function animate() {
  const dt = clock.getDelta();

  if (mixer) mixer.update(dt);

  // rabo procedural
  if (cat) {
    const tail = cat.getObjectByName("Tail"); // nome do osso no modelo
    if (tail) tail.rotation.y = Math.sin(Date.now() * 0.005) * 0.4;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// ------------------ RESIZE ------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
