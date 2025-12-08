import './style.css'
import * as THREE from 'three/webgpu';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
import { GetSceneBounds, GetASCIITexture } from './utils';
import { GetMaterial } from './tsl/material.js';
import { Clock } from 'three';


console.clear()


const {PI} = Math

const canvas = document.querySelector('canvas')

canvas.width = innerWidth;
canvas.height = innerHeight;

const scene = new THREE.Scene()

const renderer = new THREE.WebGPURenderer({canvas,antialias:true})

renderer.setClearColor(0xffffff)

const camera = new THREE.PerspectiveCamera(75,innerWidth/innerHeight,1,1000)
camera.position.z = 5


const Manager = new THREE.LoadingManager();
const Draco = new DRACOLoader(Manager)
const GLB = new GLTFLoader(Manager)

Draco.setDecoderPath('/draco/')
Draco.setDecoderConfig({type: 'wasm'})
GLB.setDRACOLoader(Draco)


const {width:SceneWidth,height:SceneHeight} = GetSceneBounds(renderer,camera)

const Plane = new THREE.Mesh(
  new THREE.PlaneGeometry(SceneWidth,SceneHeight,50,50),
  GetMaterial({
    aspect:SceneWidth/SceneHeight,
    ...GetASCIITexture()
  })
)


scene.add(Plane)


const clock = new Clock()
let PrevTime = clock.getElapsedTime()

function Animate(){
  const CurrentTime = clock.getElapsedTime()
  const DT = CurrentTime - PrevTime;
  PrevTime = CurrentTime;
  renderer.renderAsync(scene,camera)
  requestAnimationFrame(Animate)
}

requestAnimationFrame(Animate)


function resize(){
  camera.aspect = innerWidth/innerHeight
  camera.updateProjectionMatrix()
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  renderer.setSize(innerWidth,innerHeight)
}

window.addEventListener('resize',resize)


