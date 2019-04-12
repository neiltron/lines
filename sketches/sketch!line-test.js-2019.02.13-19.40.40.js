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
    window.innerWidth / 2 - window.innerWidth / 4,
    window.innerHeight / 2
  ];

  futurePositions[i] = [
    Math.sin(i + Math.random()) * window.innerWidth / 10,
    Math.cos(i + Math.random()) * window.innerHeight / 10
  ];
}

document.body.style.background = '#1a1a1a';

canvasSketch(() => {
  setNumber('03');

  // Return a renderer, which is like p5.js 'draw' function
  return {
    render({ p5, time, width, height }) {
      // Draw with p5.js things
      // p5.background(0);
      p5.clear();
      p5.noFill();
      p5.stroke(255);

      const dim = width > height ? height : width;

      for (let j = 0; j < total; j++) {
        p5.beginShape();

        futurePositions[j][0] = Math.sin(j + time / 2) * window.innerWidth / 10;

        for (let i = 0; i < 8; i++) {
          // p5.rotate(i);

          const pos = [
            p5.lerp(positions[j][0], futurePositions[j][0], Math.sin((4 + time / 1) - i) / 2),
            p5.lerp(positions[j][1], futurePositions[j][1], Math.cos((4 + time / 1.25 ) - i) / 2),
          ]

          p5.curveVertex(
            i * (dim / 14) + pos[0] + 10,
            p5.noise(i / 4 + j, time / 5) * p5.noise(i / 4 + j, time / 5) * 200 + pos[1]
          );
        }

        p5.endShape();
      }
    }

    // const anim = p5.sin(time - p5.PI / 2) * 0.5 + 0.5;
    // p5.rect(0, 0, width * anim, height);
  };
}, settings);
