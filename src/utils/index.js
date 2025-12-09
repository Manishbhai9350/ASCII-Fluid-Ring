import { CanvasTexture } from "three";
import { ClampToEdgeWrapping } from "three";
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
  const ascii = "MNOG"; // characters you want
  const length = ascii.length;

  const size = 1000; // pixel size for each square cell

  // Canvas should be exactly 2 squares wide and 1 row tall
  const canvas = document.createElement("canvas");
  document.body.querySelector('main').appendChild(canvas)
  canvas.width = length * size;   // 2 * size
  canvas.height = size;           // 1 row

  const ctx = canvas.getContext("2d");

  // crispest possible
  ctx.imageSmoothingEnabled = false;

  // background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // monospace → equal width characters
  ctx.fillStyle = "#ffffff";
  ctx.font = `${size * 0.7}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw I and U exactly in square cells
  for (let i = 0; i < length; i++) {
    const char = ascii[i];

    ctx.fillText(
      char,
      size / 2 + i * size,  // x = center of each cell
      size / 2              // y = vertical center
    );
  }

  // Create Three.js texture
  const tex = new CanvasTexture(canvas);
  tex.minFilter = NearestFilter;
  tex.magFilter = NearestFilter;
  tex.generateMipmaps = false;
  tex.wrapS = tex.wrapT = ClampToEdgeWrapping;

  return { ascii: tex, length };
};
