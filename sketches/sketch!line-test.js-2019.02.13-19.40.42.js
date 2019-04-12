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

let positions = [];
let futurePositions = [];
const total = 50;

for (let i = 0; i < total; i++) {
  positions[i] = [
    window.innerWidth / 3 - window.innerWidth / 5,
    window.innerHeight / 3
  ];

  futurePositions[i] = [ 0, 0 ];
}

document.body.style.background = '#1a1a1a';

canvasSketch(() => {
  setNumber('04');

  // Return a renderer, which is like p5.js 'draw' function
  return {
    render({ p5, time, width, height }) {
      // Draw with p5.js things
      // p5.background(0);
      p5.clear();
      p5.noFill();
      p5.stroke(255);
      p5.translate(width / 2, height / 2)

      const dim = width > height ? height : width;

      const divisorX = 7;
      const divisorY = 10;

      for (let j = 0; j < total; j++) {
        p5.beginShape();

        if (j % 10 === 0) {
          p5.stroke(50, 50, 50);
          p5.strokeWeight(2);
        } else if (j % 4 === 0) {
          p5.stroke(100, 50, 50);
          p5.strokeWeight(2);
        } else {
          p5.stroke(255);
          p5.strokeWeight(1.25);
        }

        futurePositions[j][0] = Math.sin(j + time / 2) * window.innerWidth / 20;
        futurePositions[j][1] = Math.cos(j + time / 2) * window.innerWidth / 20;

        for (let i = 0; i < 8; i++) {
          p5.rotate(i);

          const pos = [
            p5.lerp(positions[j][0], futurePositions[j][0], Math.sin((time * 2) - i) / divisorX) + dim / 4,
            p5.lerp(positions[j][1], futurePositions[j][1], (Math.cos((time * 1) - i) + 1) / divisorY),
          ]

          p5.curveVertex(
            (i * (dim / 14) + pos[0]) - dim / 2,
            p5.noise(i / 4 + j, time / 5) * p5.noise(i / 4 + j, time / 5) * 200 + pos[1]
          );
        }

        p5.endShape();
      }
    }
  };
}, settings);
