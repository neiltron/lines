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

const pointTotal = 400;
const points = [];
const constraints = [];
const innerConstraints = [];
const anchorConstraints = [];
let centerPoint = [window.innerWidth / 2, window.innerHeight / 2];
const centerPoints = [];

let mouse = [centerPoint[0], centerPoint[1]];

document.body.addEventListener('mousemove', e => {
  vec2.lerp(mouse, mouse, [e.pageX, e.pageY], .99);
});


let colorA;
let colorB;


canvasSketch(({ p5 }) => {
  // Return a renderer, which is like p5.js 'draw' function
  class Constraint {
    constructor(opts = {}) {
      this.points = opts.points;
      this.stiffness = .8;
      this.mass = opts.mass === null ? 1 : opts.mass;

      this.initialDistance = p5.dist(this.points[0][0],  this.points[0][1], this.points[1][0], this.points[1][1]);
      this.shouldDraw = opts.draw || false;
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

      if (this.mass !== 0) {
        this.points[0][0] += translateX * this.mass;
        this.points[0][1] += translateY * this.mass;

        this.points[0][0] = Math.max(0, Math.min(window.innerWidth, this.points[0][0]));
        this.points[0][1] = Math.max(0, Math.min(window.innerHeight, this.points[0][1]));

        this.points[1][0] -= translateX * this.mass;
        this.points[1][1] -= translateY * this.mass;

        this.points[1][0] = Math.max(0, Math.min(window.innerWidth, this.points[1][0]));
        this.points[1][1] = Math.max(0, Math.min(window.innerHeight, this.points[1][1]));
      }
    }
  }

  for (let i =  0;  i < pointTotal; i++)  {
    points.push([
      Math.sin(((i) / pointTotal) * Math.PI * 2) * (window.innerWidth / 5) + window.innerWidth / 2,
      Math.cos(((i) / pointTotal) * Math.PI * 2) * (window.innerHeight / 5) + window.innerHeight / 2,
    ])

    if (i > 0) {
      constraints.push(
        new Constraint({
          // draw: i % 40 === 0,
          draw: true,
          mass: .1,
          points: [
            points[i - 1], points[i]
          ],
        })
      );
    }

    if (i % 3 === 0) {
      anchorConstraints.push(
        new Constraint({
          // draw: i % 4 === 0,
          draw: false,
          mass: .1,
          points: [
            points[i], centerPoint
          ],
        })
      );
    }
  }

  constraints.push(
    new Constraint({
      draw: true,
      mass: .5,
      points: [
        points[0], points[points.length - 1]
      ],
    })
  );

  for (let i = 0; i < pointTotal; i++) {
    constraints.push(
      new Constraint({
        // draw: i % 10 === 0,
        draw: false,
        mass: 1,
        points: [
          points[(i + pointTotal / 2) % pointTotal], points[i]
        ],
      })
    );

    if (i > 4) {
      constraints.push(
        new Constraint({
          draw: i % 10 === 0,
          draw: false,
          mass: 1,
          points: [
            points[(i - 5) % pointTotal], points[i]
          ],
        })
      );
    } else if (i == 0) {
      constraints.push(
        new Constraint({
          draw: i % 10 === 0,
          draw: false,
          mass: 1,
          points: [
            points[pointTotal - 5], points[i]
          ],
        })
      )
    }
  }

  document.body.style.backgroundColor = '#1f1f1f';

  colorA = p5.color(200, 30, 50, 10);
  colorB = p5.color(30, 50, 200, 100);

  return ({ p5, time, width, height }) => {
    // Draw with p5.js things
    // p5.background(0);

    if ((Math.floor(time * 10) / 10) % 10 === 0) {
      p5.clear();
    }

    p5.noFill();
    // p5.colorMode(p5.HSL, 255, 255, 255, .001);
    p5.stroke(p5.lerpColor(colorA, colorB, (Math.sin(time * 2) + 1) / 2));
    p5.strokeWeight(1);

    mouse[0] += (p5.noise(0, time / 2) - .5) * (width / 40);
    mouse[1] += (p5.noise(1, time / 2) - .5) * (height / 40);

    mouse[0] = Math.max(width / 2 - width / 4, Math.min(width / 2 + width / 4, mouse[0]));
    mouse[1] = Math.max(height / 2 - height / 4, Math.min(height / 2 + height / 4, mouse[1]));

    anchorConstraints.forEach(constraint => {
      vec2.lerp(constraint.points[1], constraint.points[1], mouse, .1);

      constraint.update();

      if (constraint.shouldDraw) {
        constraint.draw();
      }
    });

    constraints.forEach((constraint, i) => {
      constraint.update();

      if (constraint.shouldDraw) {
        constraint.draw();
      }
    })
  };
}, settings);
