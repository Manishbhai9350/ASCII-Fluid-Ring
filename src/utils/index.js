import { CanvasTexture } from "three";
import { NearestFilter } from "three";
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { degToRad } from "three/src/math/MathUtils.js";

export function GetSceneBounds(
  renderer = new WebGLRenderer(),
  camera = new PerspectiveCamera()
) {
  const aspect = camera.aspect;
  const z = camera.position.z;
  const theta = degToRad(camera.fov) / 2;
  const height = Math.tan(theta) * z * 2;
  const width = height * aspect;
  return { width, height };
}

export const GetASCIITexture = () => {
  let ascii = "QWERTYUIOPASDFGHJKLZXCVBNM";
  const length = ascii.length;

  // document.querySelector('canvas').style.display = 'none'
  const canvas = document.createElement("canvas");
  // document.body.querySelector('main').appendChild(canvas)
  const size = 100;
  canvas.width = length * size * 1;
  canvas.height = length * size * 1;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";

  ctx.font = `${(size * 40) / 64}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let j = 0; j < length; j++) {
    for (let i = 0; i < (length * innerWidth) / innerHeight; i++) {
      ctx.fillText(
        ascii[Math.floor(Math.random() * length)],
        size / 2 + i * size,
        j * size + size / 2
      );
    }
  }

  const tex = new CanvasTexture(canvas);
  tex.minFilter = NearestFilter;
  tex.magFilter = NearestFilter;
  tex.generateMipmaps = false;

  return { ascii: tex, length };
};
