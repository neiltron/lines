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
const total = 500;

for (let i = 0; i < total; i++) {
  positions[i] = [
    Math.sin(i) - 200,
    Math.cos(i) - 100
  ];

  futurePositions[i] = [
    Math.sin(i + Math.random()) - 200,
    Math.cos(i + Math.random()) - 140
  ];
}

document.body.style.background = '#1a1a1a';

canvasSketch(() => {
  setNumber('01');

  // Return a renderer, which is like p5.js 'draw' function
  return {
    render({ p5, time, width, height }) {
      // Draw with p5.js things
      p5.clear();
      // p5.background(0);
      p5.noFill();
      p5.stroke(255);
      p5.translate(width / 2, height / 2);

      const dim = width > height ? height : width;

      for (let j = 0; j < total; j++) {
        p5.beginShape();

        for (let i = 0; i < 8; i++) {
          p5.rotate(i);

          const pos = [
            p5.lerp(positions[j][0], futurePositions[j][0], ((time / 2) - (i / 2)) % 4),
            p5.lerp(positions[j][1], futurePositions[j][1], ((time / 2) - (i / 2)) % 4),
          ]

          p5.curveVertex(
            i * (dim / 14) + pos[0] + 10,
            height / 500 + p5.noise(i / 4 + j, time / 5) * p5.noise(i / 4 + j, time / 5) * 150 + pos[1]
          );
        }

        p5.endShape();
      }
    }

    // const anim = p5.sin(time - p5.PI / 2) * 0.5 + 0.5;
    // p5.rect(0, 0, width * anim, height);
  };
}, settings);
