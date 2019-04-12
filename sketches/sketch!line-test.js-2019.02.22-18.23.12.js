const canvasSketch = require('canvas-sketch');
const p5 = require('p5');
const { vec2 } = require('gl-matrix');
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

const points = [];
const tmpVector = [0, 0];
const totalPoints = 6;
const divisor = 2;
const pointDim = 10;

document.body.style.background = '#1a1a1a';

for (let i = 0; i < totalPoints; i++) {
  const x = 0;
  const y = 0;

  points.push([ x, y ]);
}

canvasSketch(() => {
  setNumber('11');

  // Return a renderer, which is like p5.js 'draw' function
  return ({ p5, time, width, height }) => {
    // Draw with p5.js things
    // p5.background(20);
    p5.clear();
    // p5.fill(255);
    p5.noFill();
    p5.strokeWeight(1);
    // p5.noStroke();

    const anim = p5.sin(time - p5.PI / 2) * 0.5 + 0.5;

    const cellWidth = width / 2;
    const cellHeight = height / 2;

    for (let i = 0; i < totalPoints; i++)  {
      const x1 = cellWidth;
      const y1 = cellHeight;

      p5.stroke(255 / Math.max(1, i - 3 - Math.sin(time)), 255 / Math.max(1, i - 3), 255 / Math.max(1, i - 3));

      // const noise = [p5.noise(points[i][0] / 2 + time / 4, y1) - .5, p5.noise(points[i][1] / 10 + time / 4, y1) - .5]

      vec2.copy(tmpVector, points[i]);
      // vec2.add(tmpVector, tmpVector, noise);

      p5.beginShape();

      for (let j = 0; j < 50; j++) {
        vec2.copy(tmpVector, points[i]);

        const noise = [(p5.noise(points[i][0] * width + time + (i / 20 + j / 40) * 2 * Math.sin(time), x1) - .5) * 2, (p5.noise(points[i][1] * height + time + (i / 20 + j / 30) * 2 * Math.sin(time), y1) - .5) * 2]
        vec2.add(tmpVector, tmpVector, noise);

        // vec2.add(tmpVector, tmpVector, [j / 30, j / 30]);

        const x2 = tmpVector[0] * cellWidth + cellWidth;
        const y2 = tmpVector[1] * cellHeight + cellHeight;

        p5.curveVertex(
          Math.max(width / 2 - width / 5, Math.min(width / 2 + width / 5, x2)),
          Math.max(height / 2 - height / 5, Math.min(height / 2 + height / 5, y2))
        );
      }

      p5.endShape();

    }
  };
}, settings);
