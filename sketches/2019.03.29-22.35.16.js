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
  animate: true,
  duration: 20
};

const pointTotal = 500;
let points = [];
let centerPoint = [window.innerWidth / 2, window.innerHeight / 2];
let _lines = [];

let mouse = [centerPoint[0], centerPoint[1]];

document.body.addEventListener('mousemove', e => {
  vec2.lerp(mouse, mouse, [e.pageX, e.pageY], .5);
});

document.body.addEventListener('touchmove', e => {
  e.preventDefault();

  vec2.lerp(mouse, mouse, [e.touches[0].pageX, e.touches[0].pageY], .5);
});


let colorA;
let colorB;

let _time;

canvasSketch(({ p5, width, height }) => {
  // Return a renderer, which is like p5.js 'draw' function
  var blob = new Blob(['('+workerFunc.toString()+')()'], {type: 'application/javascript'}),
      worker = new Worker(URL.createObjectURL(blob));

  const angle = Math.PI * 2 / pointTotal;
  const dim = width > height ? height : width;

  worker.addEventListener('message', (e) => {
    // console.log('onmessage', e, e.data.points[0]);

    _lines = new Float32Array(e.data.lines);

    // worker.postMessage({ action: 'update', width, height, _time, mouse });
    // console.log(_lines);
  });

  document.body.style.backgroundColor = '#1f1f1f';

  worker.postMessage({ action: 'update', width, height, time: _time, mouse });


  return {
    begin: ({ p5, time, width, height }) => {
      const date = Date.now();
      p5.noiseSeed(date);
      centerPoint = [window.innerWidth / 2, window.innerHeight / 2]



      colorA = p5.color(200, 30, 50, date % 2 === 0 ? 30 : 1);
      // colorA = p5.color(30, 50, 200, date % 2 === 0 ? 1 : 30);
      colorB = p5.color(20, 3, 5, 50);

      for (let i =  0;  i < pointTotal; i++)  {
        const _angle = angle * i;
        points.push([
          Math.floor(Math.sin(_angle) * (dim / 5)) + width / 2,
          Math.floor(Math.cos(_angle) * (dim / 5)) + height / 2,
        ])
      }

      console.log(width, height)

      worker.postMessage({
        points: points,
        width,
        height,
        action: 'setup',
      });
    },
    render: ({ p5, time, width, height }) => {
      // Draw with p5.js things
      // p5.background(0);
      _time = time;

      worker.postMessage({ action: 'update', width, height, time: _time, mouse });

      if ((Math.floor(time * 10) / 10) % 30 === 0) {
        p5.clear();
        p5.background(0);
      }

      p5.noFill();
      // p5.colorMode(p5.HSL, 255, 255, 255, .001);
      p5.stroke(p5.lerpColor(colorA, colorB, (Math.sin(time * 2) + 1) / 2));
      p5.strokeWeight(1);

      mouse[0] += (p5.noise(0, time / 2) - .5) * (width / 40);
      mouse[1] += (p5.noise(1, time / 2) - .5) * (height / 40);

      mouse[0] = Math.max(width / 2 - width / 3, Math.min(width / 2 + width / 3, mouse[0]));
      mouse[1] = Math.max(height / 2 - height / 3, Math.min(height / 2 + height / 3, mouse[1]));

      // mouse[1] += 1;

      p5.beginShape();

      for (let i = 0; i < _lines.length; i += 4) {
        p5.vertex(_lines[i], _lines[i + 1])
        p5.vertex(_lines[i + 2], _lines[i + 3]);
      }

      p5.endShape();
    }
  };
}, settings);


const workerFunc = function () {
  let points = [];
  let constraints = [];
  let anchorConstraints = [];
  let centerPoint;

  function lerp(out, a, b, t) {
    var ax = a[0],
        ay = a[1]
    out[0] = ax + t * (b[0] - ax)
    out[1] = ay + t * (b[1] - ay)
    return out
  }


  const updatePoints = (points, time, width, height, mouse) => {
    const _lines = [];

    anchorConstraints.forEach((constraint, i) => {
      lerp(constraint.points[1], constraint.points[1], mouse, .5);

      constraint.update(width, height);

      if (constraint.shouldDraw) {
        _lines.push(constraint.points[0][0], constraint.points[0][1], constraint.points[1][0], constraint.points[1][1]);
      }
    });

    constraints.forEach((constraint, i) => {
      constraint.update(width, height);

      if (constraint.shouldDraw) {
        _lines.push(constraint.points[0][0], constraint.points[0][1], constraint.points[1][0], constraint.points[1][1]);
      }
    })

    const lines = new Float32Array(_lines);

    postMessage({
      lines: lines.buffer
    }, [lines.buffer]);
  }

  const dist = function (x1, y1, x2, y2) {
    var dx = Math.abs(x1 - x2);
    var dy = Math.abs(y1 - y2);

    return dx + dy;
  }

  class Constraint {
    constructor(opts = {}) {

      // console.log('what', opts.points[0],  opts.points[1]);

      this.points = opts.points;
      this.stiffness = opts.stiffness || .1;
      this.mass = 1;


      this.initialDistance = dist(this.points[0][0], this.points[0][1], this.points[1][0], this.points[1][1]);
      this.shouldDraw = opts.draw || false;
    }

    draw() {
      p5.line(this.points[0][0], this.points[0][1], this.points[1][0], this.points[1][1])
    }

    update(width, height) {
      const distance = dist(this.points[0][0], this.points[0][1], this.points[1][0], this.points[1][1]);

      let diffX = this.points[0][0] - this.points[1][0];
      let diffY = this.points[0][1] - this.points[1][1];

      let difference = (this.initialDistance - distance) / distance;

      let translateX = diffX * this.stiffness * difference;
      let translateY = diffY * this.stiffness * difference;

      if (this.mass !== 0) {
        this.points[0][0] += translateX * this.mass;
        this.points[0][1] += translateY * this.mass;

        this.points[0][0] = Math.max(0, Math.min(width, this.points[0][0]));
        this.points[0][1] = Math.max(0, Math.min(height, this.points[0][1]));

        this.points[1][0] -= translateX * this.mass;
        this.points[1][1] -= translateY * this.mass;

        this.points[1][0] = Math.max(0, Math.min(width, this.points[1][0]));
        this.points[1][1] = Math.max(0, Math.min(height, this.points[1][1]));
      }
    }
  }

  self.onmessage = (event) => {
    // console.log('worker receive', event.data);

    if (event.data.action === 'setup') {
      constraints = [];
      anchorConstraints = [];
      points = [];

      centerPoint = [event.data.width / 2, event.data.height / 2];

      points = event.data.points;
      const pointTotal = points.length;

      for (let i = 0; i < pointTotal; i += 1) {
        // constraints.push(
        //   new Constraint({
        //     // draw: i % 40 === 0,
        //     // draw: true,
        //     stiffness: 1,
        //     points: [
        //       centerPoint, points[i]
        //     ],
        //   })
        // );

        if (i > 0) {
          constraints.push(
            new Constraint({
              // draw: i % 40 === 0,
              draw: true,
              stiffness: .1,
              points: [
                points[i - 1], points[i]
              ],
            })
          );
        }

        if (i % Math.floor(2 + Math.random() * 6) === 0) {
          anchorConstraints.push(
            new Constraint({
              // draw: i % 4 === 0,
              draw: false,
              stiffness: .5 + Math.sin(i) / 100,
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
          stiffness: .1,
          points: [
            points[0], points[points.length - 1]
          ],
        })
      );

      for (let i = 0; i < pointTotal; i++) {
        constraints.push(
          new Constraint({
            // draw: i % 10 === 0,
            // draw: true,
            stiffness: .1,
            points: [
              points[(i + pointTotal / 2) % pointTotal], points[i]
            ],
          })
        );

        constraints.push(
          new Constraint({
            // draw: i % 10 === 0,
            // draw: true,
            stiffness: .2,
            points: [
              points[(i + 10) % pointTotal], points[i]
            ],
          })
        );
      }
    } else if (event.data.action === 'update') {
      updatePoints(points, event.data.time, event.data.width, event.data.height, event.data.mouse);
    }
  }
}