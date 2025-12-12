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
  uProgress: uniform(0.4), // Progress
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

Draco.setDecoderPath("/draco/");
Draco.setDecoderConfig({ type: "wasm" });
GLB.setDRACOLoader(Draco);

const { width: SceneWidth, height: SceneHeight } = GetSceneBounds(
  renderer,
  camera
);

const size = 0.2;
const gap = 0;

const rows = Math.ceil(SceneWidth / size - gap * SceneHeight) + 1; // X count
const cols = Math.ceil(SceneHeight / size - gap * SceneHeight) + 1; // Y count

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

const instances = rows * cols;

const InstancedPlanes = new THREE.InstancedMesh(
  new THREE.PlaneGeometry(size, size),
  GetMaterial({
    aspect: SceneWidth / SceneHeight,
    ...GetASCIITexture(),
    invRows: 1 / rows,
    invCols: 1 / cols,
    uniforms,
    ringTexture
  }),
  instances
);

const positions = new Float32Array(instances * 3);
const uvs = new Float32Array(instances * 2);

for (let i = 0; i < cols; i++) {
  // Y axis
  for (let j = 0; j < rows; j++) {
    // X axis

    const index = j + i * rows; // one index per instance

    positions[index * 3 + 0] = (j - rows / 2 + 1 / 2) * size; // X
    positions[index * 3 + 1] = (i - cols / 2 + 1 / 2) * size; // Y
    positions[index * 3 + 2] = 0; // Z

    const UVx = j / rows;
    const UVy = i / cols;
    uvs[index * 2 + 0] = UVx;
    uvs[index * 2 + 1] = UVy;
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

const clock = new Clock();
let PrevTime = clock.getElapsedTime();

function Animate() {
  const CurrentTime = clock.getElapsedTime();
  const DT = CurrentTime - PrevTime;
  PrevTime = CurrentTime;

  if (uniforms.uProgress.value >= 1) {
    uniforms.uProgress.value = uniforms.uBaseLength.value;
  }

  uniforms.uProgress.value += DT * uniforms.uSpeed.value * 0.1;

  // console.log(uniforms.uProgress.value >= uniforms.uBaseLength.value);
  // console.log(uniforms.uProgress.value);

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
