const canvasSketch = require('canvas-sketch');
const p5 = require('p5');
import { vec2 } from 'gl-matrix';
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
let mousePos = [0, 0];
let circlePos = [window.innerWidth / 2, window.innerHeight / 2];
let distanceVec = [0, 0];

let mouseDistance = 0;
const sizeDivisor = 5;
let pointTotal = 8;

const handleTouchMove = e => {
  vec2.set(mousePos, e.touches[0].pageX, e.touches[0].pageY);
};

document.body.addEventListener('mousemove', e => vec2.set(mousePos, e.clientX, e.clientY));
document.body.addEventListener('touchstart', handleTouchMove);
document.body.addEventListener('touchmove', handleTouchMove);

for (let i = 0; i < total; i++) {
  positions[i] = [
    Math.sin((i / total) * Math.PI * 2) * (dim / 2.25),
    Math.cos((i / total) * Math.PI * 2) * (dim / 2.25)
  ];

  futurePositions[i] = [
    Math.sin((i / total) * Math.PI * 2) * (dim / 50),
    Math.cos((i / total) * Math.PI * 2) * (dim / 50)
  ];
}


canvasSketch(() => {
  setNumber('09');

  // Return a renderer, which is like p5.js 'draw' function
  return {
    render({ p5, time, width, height }) {
      // vec2.lerp(circlePos, circlePos, mousePos, .1);
      mouseDistance = p5.lerp(mouseDistance, Math.max(50, vec2.distance(mousePos, circlePos)), .1);

      // Draw with p5.js things
      if (mousePos[1] > height / 2) {
        p5.background(220);
      } else {
        p5.background(20);
      }

      p5.translate(circlePos[0] + .5, circlePos[1] + .5);

      for (let j = 0; j < total; j++) {
        p5.beginShape();

        if (mousePos[1] > height / 2) {
          // p5.fill(0);
          p5.noFill();

          if (j % 4 === 0) {
            p5.stroke(140, 150, 150);
            p5.strokeWeight(2);
          } else if (j % 2 === 0) {
            p5.stroke(180, 150, 150);
            p5.strokeWeight(2);
          } else {
            p5.stroke(255, 240, 240);
            p5.strokeWeight(1.25);
          }
        } else {
          p5.noFill();

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
        }

        p5.curveVertex(
          Math.sin(0) * (dim / sizeDivisor),
          Math.cos(0) * (dim / sizeDivisor),
        );

        for (let i = 0; i < pointTotal; i++) {
          let pos = [];
          let yNoise = 0;
          const size = (dim + j * 2) / sizeDivisor;

          if (i <= 0 || i >= pointTotal - 1) {
            pos = [
              Math.sin(0) * size,
              Math.cos(0) * size,
            ]
          } else {
            pos = [
              Math.sin(i) * size,
              Math.cos(i) * size
            ];
          }

          const distance = vec2.distance(pos, circlePos) / (mouseDistance * 2);
          yNoise = (p5.noise(distance + pos[0] / 100, distance + pos[1] / 100 + time / 2) - .5) * 200;

          p5.curveVertex(
            pos[0] - yNoise,
            pos[1] - yNoise
          );
        }

        p5.curveVertex(
          Math.sin(pointTotal - 1) * (dim / sizeDivisor),
          Math.cos(pointTotal - 1) * (dim / sizeDivisor),
        );

        p5.endShape();
      }
    }
  };
}, settings);
