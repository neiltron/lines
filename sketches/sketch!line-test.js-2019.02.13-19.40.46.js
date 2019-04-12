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


const handleMouseMove = e => {
  setMousePos(e.pageX, e.pageY);
  setBgColor(e.pageY);
};

const handleTouchMove = e => {
  e.preventDefault();

  setMousePos(e.touches[0].pageX, e.touches[0].pageY);
  setBgColor(e.touches[0].pageY);
};

const setMousePos = (x, y) => vec2.set(mousePos, x, y);

const setBgColor = e => {
  if (mousePos[1] > window.innerHeight / 2) {
    document.body.style.backgroundColor = '#dcdcdc';
  } else {
    document.body.style.backgroundColor = '#141414';
  }
}

document.body.addEventListener('mousemove',   handleMouseMove, { passive: true });
document.body.addEventListener('touchstart',  handleTouchMove, { passive: false });
document.body.addEventListener('touchmove',   handleTouchMove, { passive: false });


setBgColor(0);

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
  setNumber('08');

  // Return a renderer, which is like p5.js 'draw' function
  return {
    render({ p5, time, width, height }) {
      mouseDistance = p5.lerp(mouseDistance, Math.max(50, vec2.distance(mousePos, circlePos)), .1);

      p5.clear();

      // Draw with p5.js things
      // if (mousePos[1] > height / 2) {
      //   p5.background(220);
      // } else {
      //   p5.background(20);
      // }

      // p5.translate(circlePos[0] + .5, circlePos[1] + .5);

      let pos = [];
      let yNoise;
      const _time = time / 2;
      let distance;

      for (let j = 0; j < total; j++) {
        p5.beginShape();

        if (mousePos[1] > height / 2) {
          p5.fill(0);
          p5.stroke(230);
          // p5.noStroke();
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

        for (let i = 0; i < 8; i++) {
          yNoise = 0;

          if (i <= 1) {
            pos = positions[j];
          } else if (i >= 6) {
            pos = futurePositions[j];
          } else {
            pos = [
              p5.lerp(positions[j][0] * 1.5, futurePositions[j][0], i / 6),
              p5.lerp(positions[j][1] * 1.5, futurePositions[j][1], i / 6),
            ]

            distance = vec2.distance(pos, circlePos) / (mouseDistance * 2);
            yNoise = (p5.noise(distance + pos[0] / 100, distance + pos[1] / 100 + _time) - .5) * 200;
          }

          p5.curveVertex(
            circlePos[0] + pos[0],
            circlePos[1] + pos[1] - yNoise
          );
        }

        p5.endShape();
      }
    }
  };
}, settings);
