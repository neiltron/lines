const canvasSketch = require('canvas-sketch');
const p5 = require('p5');
import { setNumber } from './util';

const preload = p5 => {
  // You can use p5.loadImage() here, etc...
};

const settings = {
  // Pass the p5 instance, and preload function if necessary
  p5: { p5, preload },
  // Turn on a render loop
  animate: true
};


const rows = Math.floor(window.innerHeight / 20);
const columns = 35;

const noiseAmounts = [];
const noiseTargets = [];

let lastX;
let lastY;

for (let column = 0; column < columns; column++) {
  for (let row = 0; row < rows; row++) {
    noiseAmounts[column + (row * columns)] = 0;
    noiseTargets[column + (row * columns)] = 0;
  }
}

const handleMouseMove = e => {
  let x, y;

  if (e.touches) {
    e.preventDefault();

    x = e.touches[0].pageX;
    y = e.touches[0].pageY;
  } else {
    x = e.pageX;
    y = e.pageY;
  }

  x = Math.floor((x / window.innerWidth) * columns);
  y = Math.floor((y / window.innerHeight) * rows);

  const index = Math.floor(x + (y * columns));

  const diffX = lastX - x;
  const diffY = lastY - y;
  const diff = (diffY) * Math.abs(diffX + 1) * 4;

  noiseTargets[index] += diff;

  lastX = x;
  lastY = y;
}

document.body.addEventListener('mousemove', handleMouseMove, { passive: true });
document.body.addEventListener('touchmove', handleMouseMove, { passive: false });


const sampleCanvas = document.createElement('canvas');
const sampleCtx = sampleCanvas.getContext('2d');

sampleCanvas.width = window.innerWidth;
sampleCanvas.height = window.innerHeight;
// sampleCanvas.style.zIndex = 100;

const units = window.innerWidth > window.innerHeight ? 'vh' : 'vw';

sampleCtx.fillStyle = '#fff';
sampleCtx.font = `500 100${units} helvetica, arial, sans-serif`;
sampleCtx.textBaseline = 'middle';
sampleCtx.textAlign = 'center';

document.body.style.backgroundColor = '#1a1a1a';
// document.body.appendChild(sampleCanvas);

canvasSketch(() => {
  setNumber('13');

  // Return a renderer, which is like p5.js 'draw' function
  return {
    render({ p5, time, width, height }) {
      // Draw with p5.js things
      // p5.background(0);
      p5.clear(0);
      p5.noFill();
      p5.stroke(255);
      // p5.fill(0);

      sampleCtx.clearRect(0, 0, width, height);
      sampleCtx.fillText(Math.floor(time), width / 2, height / 1.8);

      const yFactor = (height / rows);

      for (let row = 0; row < rows; row++) {
        p5.beginShape();

        const yPos = row * yFactor;

        p5.curveVertex(0, yPos);

        let index = 0;
        let indexBump = (columns * row);
        let xPos = 0;
        let imageData;
        let noiseAdjust;
        const xFactor = (width / columns);

        let r;

        for (let column = 0; column < columns; column++) {
          index = column + indexBump;
          xPos = column * xFactor;

          imageData = sampleCtx.getImageData(xPos, yPos, 1, 1);

          r = imageData.data[0];
          // g = imageData.data[1];
          // b = imageData.data[2];

          // noiseTargets[index] = p5.lerp(noiseTargets[index], 0, .01);
          noiseAmounts[index] = p5.lerp(noiseAmounts[index], r, .2);

          noiseAdjust = noiseAmounts[index] || 0;

          p5.curveVertex(
            xPos,
            yPos - ((p5.noise(row / 5, column / 5 + time / 8)) * noiseAdjust) * (height / 3000)
          );
        }

        p5.curveVertex(width, yPos);
        p5.curveVertex(width, yPos);

        p5.endShape();
      }
    }

    // const anim = p5.sin(time - p5.PI / 2) * 0.5 + 0.5;
    // p5.rect(0, 0, width * anim, height);
  };
}, settings);
