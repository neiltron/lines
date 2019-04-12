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

let positions = [];
let futurePositions = [];
const total = 200;
const dim = window.innerHeight > window.innerWidth ? window.innerWidth : window.innerHeight;

document.body.style.background = '#1a1a1a';

for (let i = 0; i < total; i++) {
  positions[i] = [
    Math.sin((i / total) * Math.PI * 2) * (dim / 3),
    Math.cos((i / total) * Math.PI * 2) * (dim / 3)
  ];

  futurePositions[i] = [
    Math.sin((i / total) * Math.PI * 2) * (dim / 50),
    Math.cos((i / total) * Math.PI * 2) * (dim / 50)
  ];
}

canvasSketch(() => {
  setNumber('05');

  // Return a renderer, which is like p5.js 'draw' function
  return {
    render({ p5, time, width, height }) {
      // Draw with p5.js things
      // p5.background(0);
      p5.clear();
      p5.noFill();
      p5.stroke(255);
      p5.translate(width / 2, height / 2);

      const dim = width > height ? height : width;

      for (let j = 0; j < total; j++) {
        p5.beginShape();

        if (j % 4 === 0) {
          p5.stroke(40, 50, 50);
          p5.strokeWeight(2);
        } else if (j % 2 === 0) {
          p5.stroke(80, 50, 50);
          p5.strokeWeight(2);
        } else {
          p5.stroke(255, 240, 240);
          p5.strokeWeight(1.25);
        }

        for (let i = 0; i < 8; i++) {
          let pos = [];
          let yNoise = 0;

          if (i <= 1) {
            pos = positions[j];
          } else if (i >= 6) {
            pos = futurePositions[j];
          } else {
            pos = [
              p5.lerp(positions[j][0], futurePositions[j][0], i / 6),
              p5.lerp(positions[j][1], futurePositions[j][1], i / 6),
            ]

            yNoise = (p5.noise(pos[0] / (dim / 10), pos[1] / (dim / 10) + time / 2) - .5) * 120;
          }

          p5.curveVertex(
            pos[0],
            pos[1] - yNoise
          );
        }

        p5.endShape();
      }
    }
  };
}, settings);
