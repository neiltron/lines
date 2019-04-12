const canvasSketch = require('canvas-sketch');
const p5 = require('p5');
const Tone = require('tone');
const StartAudioContext = require('startaudiocontext');
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

var synth = new Tone.Synth().toMaster()

var distortion = new Tone.Distortion(0.9)

var polySynth = new Tone.Synth().chain(distortion, Tone.Master)

document.body.style.background = '#1a1a1a';

StartAudioContext(polySynth.context, 'body')
  .then(() => console.log('INITIALIZED WEB AUDIO API'))
  .catch(() => console.log('FAILED TO INITIALIZE WEB AUDIO API'));

const rows = Math.floor(window.innerHeight / 20);
const columns = 10;

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

  if (diff !== 0) {
    polySynth.triggerAttackRelease(index + 20, '8n');
  }

  lastX = x;
  lastY = y;
}

document.body.addEventListener('mousemove', handleMouseMove, { passive: true });
document.body.addEventListener('touchmove', handleMouseMove, { passive: false });

canvasSketch(() => {
  setNumber('02');

  // Return a renderer, which is like p5.js 'draw' function
  return {
    render({ p5, time, width, height }) {
      // Draw with p5.js things
      // p5.background(0);
      p5.clear();
      p5.noFill();
      p5.stroke(255);

      for (let row = 0; row < rows; row++) {
        p5.beginShape();

        const yPos = row * (height / rows);

        p5.curveVertex(0, yPos);

        for (let column = 0; column < columns; column++) {
          const index = column + (columns * row);

          noiseTargets[index] = p5.lerp(noiseTargets[index], 0, .1);
          noiseAmounts[index] = p5.lerp(noiseAmounts[index], noiseTargets[index], .2);

          const noiseAdjust = noiseAmounts[index] || 0;

          p5.curveVertex(
            column * (width / columns),
            yPos - ((p5.noise(row, column + time / 2)) * noiseAdjust) * 10
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
