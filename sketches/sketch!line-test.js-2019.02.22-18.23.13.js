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

const wordPoints = [
  [0.625, 3.2578125],
  [22.7685547, 82.8056641],
  [50.5097656, 3.2578125],
  [76.0810547, 82.8056641],
  [99.5517578, 3.2578125],
  [123.782227, 3.2578125],
  [123.782227, 82.8056641],
  [129.739258, 40.8212891],
  [177.131836, 40.8212891],
  [179.097656, 3.2578125],
  [181.87207, 82.8056641],
  [208.552734, 82.8056641],
  [239.098633, 3.2578125],
  [264.586914, 57.9658203],
  [215.795898, 53.0742188],
  [264.586914, 51.484375],
  [273.456055, 82.8056641],
  [312.095703, 82.8056641],
  [312.095703, 1.10644531],
  [281.283203, 6.28515625],
  [343.835938, 4.81054688]
];

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

      const _time = time;
      const index = i + Math.floor(_time * 10) % 21;

      for (let j = 0; j < 10; j++) {
        vec2.copy(tmpVector, points[i]);

        const noise = [(p5.noise(points[i][0] + _time + j / 10, x1) - .5) * 50, (p5.noise(points[i][1] + _time, y1) - .5) * 50]

        vec2.lerp(tmpVector, wordPoints[(index + j) % 21], wordPoints[(index + j + 1) % 21], (_time / 2) % 1);
        vec2.add(tmpVector, tmpVector, noise);

        // vec2.add(tmpVector, tmpVector, [j / 30, j / 30]);

        const x2 = tmpVector[0] * 2 + cellWidth / 1.5;
        const y2 = tmpVector[1] * 2 + cellHeight / 1.5;

        p5.curveVertex(
          x2,
          y2
        );
      }

      p5.endShape();

    }
  };
}, settings);
