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

let divisor = 30;
const lineAdjust = divisor * 5

document.body.style.background = '#1a1a1a';

canvasSketch(() => {
  setNumber('12');

  // Return a renderer, which is like p5.js 'draw' function
  return ({ p5, time, width, height }) => {
    // Draw with p5.js things
    // p5.background(20);
    p5.clear();
    p5.stroke(255);

    const _time = time / 5;

    for (let i = 0; i < width / divisor; i++) {
      const iDivisor = i / divisor;
      const iMultiplier = i * divisor + divisor / 2;

      for (let j = 0; j < height / divisor; j++) {
        const noise = Math.max(0, p5.noise(iDivisor - _time, j / divisor - _time) - .5);
        const lineLength = noise * lineAdjust;
        const _j = j * divisor - divisor / 2;

          p5.stroke(55 * (lineLength / divisor) + 200);

        p5.line(iMultiplier, _j, iMultiplier + noise * lineAdjust, _j + noise * lineAdjust);
      }
    }
  };
}, settings);
