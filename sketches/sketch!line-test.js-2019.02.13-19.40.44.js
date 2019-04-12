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
  animate: true,
};

let lines = [];
const total = 80;
const lineHeight = 300;

document.body.style.background = '#1a1a1a';

canvasSketch(() => {
  setNumber('06');

  // Return a renderer, which is like p5.js 'draw' function
  return {
    render({ p5, time, width, height }) {
      // Draw with p5.js things
      // p5.background(0);
      p5.clear();
      p5.noFill();
      p5.stroke(255);
      p5.strokeWeight(2);
      p5.translate(width / 2, height / 2)

      const dim = width > height ? height : width;

      const lineNoise = p5.noise(0, time) * 50 + dim;


      for (let j = 0; j < total; j++) {
        p5.beginShape();

        const rotationAdjustment = ((Math.sin(time / 2) + 3) / 2) * 2;

        p5.rotate(total / (lineNoise));

        for (let i = 0; i < 8; i++) {
          let pos = [];

          const xPos = 0;
          // const xPos = j * 10 - (total * 10) / 2;
          const yPos = p5.lerp(0, lineNoise, i / 7) - lineNoise / 2;
          const xNoise = p5.noise(i, time / 2) * 200;

          p5.curveVertex(
            xPos + xNoise,
            yPos
          );
        }

        p5.endShape();
      }
    }
  };
}, settings);
