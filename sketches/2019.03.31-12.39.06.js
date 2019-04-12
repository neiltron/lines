const canvasSketch = require('canvas-sketch');
const p5 = require('p5');
const { vec2 } = require('gl-matrix');
import { setNumber } from './util';

let font;

const preload = p5 => {
  // You can use p5.loadImage() here, etc...

  font = p5.loadFont('/assets/font/Supply-Regular.otf');
};

const settings = {
  // Pass the p5 instance, and preload function if necessary
  p5: { p5, preload },
  // Turn on a render loop
  animate: true
};

const pointTotal = 100;
// const innerPointTotal = Math.floor(Math.random() * 3 + 3);
// let innerInnerPoints = Array(innerPointTotal).fill([0, 0]);
// let innerPoints = Array(innerPointTotal).fill([0, 0]);
let outerPoints = Array(pointTotal).fill([0, 0]);

const letterOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
let letters = [];
let letterIndex = 0;
let innerPointTotal;
let innerPoints;

const scaleX = (window.innerWidth / 200);
const scaleY = (window.innerHeight / 200);

const translateX = scaleX * 25;
const translateY = scaleY * 35;
const segments = 5;
let tmpVector = [];

function processLetter (points, letter) {
  letters[letter] = [];

  let index = 0;
  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currentPoint = points[i];

    for (let j = 0; j < segments; j++) {
      vec2.lerp(tmpVector, prevPoint, currentPoint, (1 / segments) * j)
      letters[letter][index] = [
        tmpVector[0] * scaleY - translateX + window.innerWidth / 2,
        tmpVector[1] * scaleY - translateY + window.innerHeight / 2,
      ];

      index++;
    }
  }

  console.log(letters)
}

let lines = [];
let innerLines = [];

const dim = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;

const innerInnerDim = dim / 6;
const innerDim = dim / 8;
const outerDim = dim / 2.5;
const radius = dim / 2;
const updateLetterTime = 1500;

let color;




canvasSketch(() => {
  // Return a renderer, which is like p5.js 'draw' function

  return {
    begin: ({ p5 }) => {
      setNumber('14');

      for (let i = 0; i < letterOptions.length; i++) {
        const points = font.textToPoints(letterOptions[i], window.innerWidth / 2 - window.innerHeight / 4.65, window.innerHeight / 2 + window.innerHeight  / 4.1, window.innerHeight / 1.4, {
          sampleFactor: .1,
          simplifyThreshold: 0
        });

        letters[letterOptions[i]] = [];

        for (let j = 0; j < points.length; j++) {
          // convert from x,y to 0,1 because that's what is being used already. hax
          letters[letterOptions[i]][j] = [points[j].x, points[j].y];
        }
      }

      innerPointTotal = letters['A'].length;
      innerPoints = letters['A'];

      setupPoints(0);
      setupLines();

      setTimeout(updateLetter, updateLetterTime);
    },
    render: ({ p5, time, width, height }) => {
      // Draw with p5.js things

      p5.background(0);

      p5.stroke(255);
      p5.strokeWeight(1);
      p5.noFill();

      setupPoints(time);
      setupLines();

      for (let i = 0; i < pointTotal; i++) {
        // if (i < innerPointTotal) {
        //   p5.circle(innerPoints[i][0], innerPoints[i][1], .2);
        // }

        p5.circle(outerPoints[i][0], outerPoints[i][1], 1);
      }

      for (let i = 0; i < lines.length; i++) {
        p5.line(
          lines[i][0][0],
          lines[i][0][1],
          lines[i][1][0],
          lines[i][1][1]
        );
        p5.stroke(255);
      }

      for (let i = 0; i < innerLines.length; i++) {
        p5.stroke(255, 100, 100);
        p5.line(
          innerLines[i][0][0],
          innerLines[i][0][1],
          innerLines[i][1][0],
          innerLines[i][1][1]
        );
      }
    }
  }
}, settings);


function setupPoints (time = 0) {
  let angle = Math.PI * 2 / pointTotal;

  for (let i = 0; i < pointTotal; i++) {
    const _angle = angle * i;
    outerPoints[i] = [Math.sin(_angle + Math.sin(time)) * outerDim + (window.innerWidth / 2), Math.cos(_angle + time) * outerDim + (window.innerHeight / 2)];
  }

  // angle = Math.PI * 2 / innerPointTotal;

  // for (let i = 0; i < innerPointTotal; i++) {
  //   const _angle = angle * i;

  //   innerInnerPoints[i] = [Math.sin(_angle) * innerInnerDim + (window.innerWidth / 2), Math.cos(_angle) * innerInnerDim + (window.innerHeight / 2)];
  //   innerPoints[i] = [Math.sin(_angle + Math.sin(time) * Math.PI) * innerDim + (window.innerWidth / 2), Math.cos(_angle + Math.sin(time) * Math.PI) * innerDim + (window.innerHeight / 2)];
  // }
}

function setupLines() {
  for (let i = 0; i < pointTotal; i++) {
    // for (let j = 0; j < 2; j++) {
      createLine(outerPoints[i], i);
      // createInnerLine(innerPoints[i], i);
    // }
  }
}

function isOverlapping(line, points) {
  let _isOverlapping = false;

    for (let i = 0; i < points.length - 1; i++) {
      _lineB = [
        [points[i][0], points[i][1]],
        [points[i + 1][0], points[i + 1][1]]
      ];

      // if (linesOverlap(line[0], line[1], _lineB[0], _lineB[1])) {
      //   _isOverlapping = true;
      // }

      if (intersects(
        line[0][0],
        line[0][1],
        line[1][0],
        line[1][1],
        _lineB[0][0],
        _lineB[0][1],
        _lineB[1][0],
        _lineB[1][1]
      )) {
        _isOverlapping = true;
      }
    }

    // check between 0 and last point
    _lineB = [
      [points[0][0], points[0][1]],
      [points[points.length - 1][0], points[points.length - 1][1]]
    ];

    if (intersects(line[0][0], line[0][1], line[1][0], line[1][1], _lineB[0][0], _lineB[0][1], _lineB[1][0], _lineB[1][1])) {
      _isOverlapping = true;
    }

    return _isOverlapping;
}

function createLine(outerPoint, lineIndex) {
  let innerPoint = innerPoints[Math.floor(Math.random() * innerPointTotal)];

  let redraws = 0;
  passing = true;

  while (isOverlapping([outerPoint, innerPoint], innerPoints)) {
    innerPoint = innerPoints[Math.floor(Math.random() * innerPointTotal)];

    if (redraws >= 5) {
      passing = false;

      break;
    }

    redraws++;
  }

  if (passing) {
    lines[lineIndex] = [outerPoint, innerPoint];
  }
}

function createInnerLine(outerPoint, index) {
  let innerPoint = innerPoints[Math.floor(Math.random() * innerPointTotal)];

  let redraws = 0;
  passing = true;

  while (isOverlapping([outerPoint, innerPoint], innerPoints)) {
    innerPoint = innerPoints[Math.floor(Math.random() * innerPointTotal)];

    if (redraws >= 5) {
      passing = false;

      break;
    }

    redraws++;
  }

  if (passing) {
    innerLines[index] = [outerPoint, innerPoint];
  }
}

// function linesOverlap(lineA, lineB) {
//   if (lineB[1] < lineA[0] || lineA[1] < lineB[1]) {
//     return true;
//   }

//   return false;
// }

function intersects(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};

function updateLetter () {
  letterIndex++;

  if (letterIndex > letterOptions.length - 1) {
    letterIndex = 0;
  }

  innerPointTotal = letters[letterOptions[letterIndex]].length;
  innerPoints = letters[letterOptions[letterIndex]];

  setTimeout(updateLetter, updateLetterTime);
}