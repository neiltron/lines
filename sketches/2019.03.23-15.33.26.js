const canvasSketch = require('canvas-sketch');
const p5 = require('p5');

import { vec2 } from 'gl-matrix';

const preload = p5 => {
  // You can use p5.loadImage() here, etc...
};

const settings = {
  // Pass the p5 instance, and preload function if necessary
  p5: { p5, preload },
  // Turn on a render loop
  animate: true
};

const pointTotal = 100;
const points = [];
const constraints = [];
const innerConstraints = [];
let centerPoint = [window.innerWidth / 2, window.innerHeight / 2];

let mouse = [centerPoint[0], centerPoint[1]];

document.body.addEventListener('mousemove', e => {
  console.log(e);

  vec2.lerp(mouse, mouse, [e.pageX, e.pageY], .05);
});


let colorA;
let colorB;


canvasSketch(({ p5 }) => {
  // Return a renderer, which is like p5.js 'draw' function
  class Constraint {
    constructor(opts = {}) {
      this.points = opts.points;
      this.stiffness = .7;
      this.mass = opts.mass || 1;
      this.initialDistance = p5.dist(this.points[0][0],  this.points[0][1], this.points[1][0], this.points[1][1]) || 1;
      this.shouldDraw = opts.draw || false;

      console.log(this.initialDistance);
    }

    draw() {
      p5.line(this.points[0][0], this.points[0][1], this.points[1][0], this.points[1][1])
    }

    update() {
      const distance = p5.dist(this.points[0][0],  this.points[0][1], this.points[1][0], this.points[1][1]);

      let diffX = this.points[0][0] - this.points[1][0];
      let diffY = this.points[0][1] - this.points[1][1];

      let difference = (this.initialDistance - distance) / distance;

      let translateX = diffX * this.stiffness * difference;
      let translateY = diffY * this.stiffness * difference;

      this.points[0][0] = Math.min(window.innerWidth, Math.max(0, this.points[0][0] + translateX * this.mass));
      this.points[0][1] = Math.min(window.innerHeight, Math.max(0, this.points[0][1] + translateY * this.mass));

      this.points[1][0] = Math.min(window.innerWidth, Math.max(0, this.points[1][0] - translateX * this.mass));
      this.points[1][1] = Math.min(window.innerHeight, Math.max(0, this.points[1][1] - translateY * this.mass));
    }
  }

  for (let i =  0;  i < pointTotal; i++)  {
    points.push([
      Math.sin(((i) / pointTotal) * Math.PI * 2) * (window.innerWidth / 4) + window.innerWidth / 2,
      Math.cos(((i) / pointTotal) * Math.PI * 2) * (window.innerHeight / 4) + window.innerHeight / 2,
    ])

    // console.log(points[i])

    if (i > 0) {
      constraints.push(
        new Constraint({
          // draw: i % 4 === 0,
          draw: 1,
          mass: 1,
          points: [
            points[i - 1], points[i]
          ],
        })
      );
    }
  }

  constraints.push(
    new Constraint({
      draw: true,
      mass: 1,
      points: [
        points[points.length - 1], points[0]
      ],
    })
  );

  for (let i = 0; i < points.length; i++) {
    innerConstraints.push(
      new Constraint({
        draw: false,
        mass: .6,
        points: [
          points[i],
          centerPoint
        ],
      })
    );
  }

  document.body.style.backgroundColor = '#1f1f1f';

  colorA = p5.color(200, 30, 50);
  colorB = p5.color(30, 50, 200);


  return ({ p5, time, width, height }) => {
    // Draw with p5.js things
    // p5.background(0);

    // if ((Math.floor(time * 10) / 10) % 5 === 0) {
      p5.clear();
    // }

    p5.noFill();
    p5.stroke(p5.lerpColor(colorA, colorB, (Math.sin(time / 2) + 1) / 2));
    p5.strokeWeight(4);

    centerPoint[0] = mouse[0];
    centerPoint[1] = mouse[1];

    centerPoint[0] += (p5.noise(0, time / 4) - .5) * (width / 10);
    centerPoint[1] += (p5.noise(1, time / 4) - .5) * (height / 10);

    centerPoint[0] += Math.sin(time) * 100;
    centerPoint[1] += Math.cos(time) * 100;

    constraints.forEach((constraint, i) => {
      constraint.update();

      if (constraint.shouldDraw) {
        constraint.draw();
      }
    })

    // innerConstraints[0].points[0][0] += Math.sin(time) * width / 4;
    // points[points.length - 1][0] = ((Math.sin(time * 2) + 1) / 2) * (width / 4) + width / 2;

    innerConstraints.forEach((constraint, i) => {
      constraint.update();

      if (constraint.shouldDraw) {
        constraint.draw();
      }
    })
  };
}, settings);
