import "./style.css";
import * as THREE from "three/webgpu";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import fragmentShader from "./shaders/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";
import { GetSceneBounds, GetASCIITexture } from "./utils";
import { GetMaterial } from "./tsl/material.js";
import { BufferAttribute, Clock, Matrix4 } from "three";
import GUI from "lil-gui";
import { uniform } from "three/tsl";
import { CreateRingTexture } from "./tsl/ring.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import gsap from "gsap";

console.clear();

const { PI } = Math;

const gui = new GUI();

const uniforms = {
  uNoiseScale: uniform(0.1), // Ring Noise Scale
  uNoiseFactor: uniform(2.1), // Ring Noise Factor

  uDist: uniform(innerWidth < 900 ? 0.1 : 0.03),
  uDistFactor: uniform(10), // Thickness Noise Factor
  uDistScale: uniform(innerWidth < 900 ? 0.05 : 0.15), // Thickness Noise Scale
  uDistSpeed: uniform(3), // Thickness Noise Speed

  uBaseLength: uniform(0.2), // Base Length


  uEase: uniform(0), // Progress
  uProgress: uniform(0.2), // Progress
  uSpeed: uniform(1), // Speed
};

gui.add(uniforms.uNoiseScale, "value", 0, 0.5).name("Noise Scale");
gui.add(uniforms.uNoiseFactor, "value", 0, 10).name("Noise Factor");
gui.add(uniforms.uDistFactor, "value", 0, 10).name("Dist Factor");
gui.add(uniforms.uDistScale, "value", 0, 0.3).name("Dist Scale");
gui.add(uniforms.uDistSpeed, "value", 0, 10).name("Dist Speed");
gui.add(uniforms.uBaseLength, "value", 0, 1).name("Base Length");
gui.add(uniforms.uSpeed, "value", 0, 1).name("Speed");

const canvas = document.querySelector("canvas");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scene = new THREE.Scene();

const renderer = new THREE.WebGPURenderer({ canvas, antialias: true });

renderer.setClearColor(0xffffff);

const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  1,
  1000
);
camera.position.z = 5;

const Manager = new THREE.LoadingManager();
const Draco = new DRACOLoader(Manager);
const GLB = new GLTFLoader(Manager);
const Texture = new THREE.TextureLoader(Manager);

const asciiTexture = await Texture.loadAsync("/ascii_texture.jpg");

Draco.setDecoderPath("/draco/");
Draco.setDecoderConfig({ type: "wasm" });
GLB.setDRACOLoader(Draco);

const controls = new OrbitControls(camera, canvas);

const { width: SceneWidth, height: SceneHeight } = GetSceneBounds(
  renderer,
  camera
);

const size = 0.15;
const gap = 0;

const rows = Math.ceil(SceneHeight / size - gap * SceneHeight); /* + 1 */ // X count
const cols = Math.ceil(SceneWidth / size - gap * SceneHeight); /* + 1 */ // Y count

// Creating The Ring Texture

const { renderTarget, ringTexture, ringScene } = CreateRingTexture(
  SceneWidth,
  SceneHeight,
  {
    aspect: SceneWidth / SceneHeight,
    ...GetASCIITexture(),
    invRows: 1 / rows,
    invCols: 1 / cols,
    uniforms,
  }
);

// const debugRing = new THREE.Mesh(
//   new THREE.PlaneGeometry(5,5),
//   new THREE.MeshBasicMaterial({
//     map:ringTexture
//   })
// )

// debugRing.position.z = camera.position.z - 2;
// scene.add(debugRing)

const instances = rows * cols;

const InstancedPlanes = new THREE.InstancedMesh(
  new THREE.PlaneGeometry(size, size),
  GetMaterial({
    aspect: SceneWidth / SceneHeight,
    ...GetASCIITexture(),
    rows,
    cols,
    uniforms,
    ringTexture,
    asciiTexture,
  }),
  instances
);

const positions = new Float32Array(instances * 3);
const uvs = new Float32Array(instances * 2);

for (let j = 0; j < rows; j++) {
  for (let i = 0; i < cols; i++) {
    const index = i + j * cols;

    positions[index * 3 + 0] = (i - cols / 2 + 1/2) * size; // X
    positions[index * 3 + 1] = (j - rows / 2 + 1/2) * size; // Y
    positions[index * 3 + 2] = 0; // Z

    uvs[index * 2 + 0] = (i) / cols;
    uvs[index * 2 + 1] = (j) / rows;
  }
}

InstancedPlanes.geometry.setAttribute(
  "aPositions",
  new THREE.InstancedBufferAttribute(positions, 3)
);
InstancedPlanes.geometry.setAttribute(
  "screenUV",
  new THREE.InstancedBufferAttribute(uvs, 2)
);

scene.add(InstancedPlanes);


// Animating The Ring Easings

function AimateRing(){
  gsap.set(uniforms.uProgress,{
    value:uniforms.uBaseLength.value
  })
  gsap.set(uniforms.uEase,{
    value:0
  })

  const tl = gsap.timeline({
    onComplete:AimateRing
  });

  tl.to(uniforms.uEase,{
    value:1,
    ease:"linear",
    duration:1
  })
  tl.to(uniforms.uProgress,{
    delay:.3,
    value:1.2,
    ease:"linear",
    duration:10
  },'<')
}
AimateRing()

const clock = new Clock();
let PrevTime = clock.getElapsedTime();

function Animate() {
  const CurrentTime = clock.getElapsedTime();
  const DT = CurrentTime - PrevTime;
  PrevTime = CurrentTime;

  renderer.setRenderTarget(renderTarget);
  renderer.renderAsync(ringScene, camera);
  renderer.setRenderTarget(null);
  renderer.renderAsync(scene, camera);

  requestAnimationFrame(Animate);
}

requestAnimationFrame(Animate);

gui.close();

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  renderer.setSize(innerWidth, innerHeight);
}

window.addEventListener("resize", resize);
