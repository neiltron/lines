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

let lines = [];
const total = 120;
const lineHeight = 300;
const linePoints = 8;

document.body.style.background = '#1a1a1a';

canvasSketch(() => {
  setNumber('07');

  // Return a renderer, which is like p5.js 'draw' function
  return {
    render({ p5, time, width, height }) {
      // Draw with p5.js things
      // p5.background(0);
      p5.clear();
      p5.noFill();
      p5.stroke(255);
      p5.strokeWeight(2);
      p5.translate(width / 2, height / 2)

      const dim = width > height ? height : width;
      const lineNoise = p5.noise(0, time) * (dim / 600) + dim;
      const lineSpacing = width / total;


      for (let j = 0; j < total; j++) {
        p5.beginShape();

        for (let i = 0; i < linePoints; i++) {
          let pos = [];

          const xPos = 0;
          // const xPos = j * 10 - (total * 10) / 2;
          const yPos = p5.lerp(0, dim, i / (linePoints - 1)) - dim / 2;
          let xNoise = 0;

          if (i > 1 && i < linePoints - 2) {
            xNoise += p5.noise(i, time / 2) * (width / 3 - j * (width / 200));
          }

          // console.log(i, xPos + xNoise)

          p5.curveVertex(
            j * lineSpacing + (xPos + xNoise) - (total * lineSpacing / 2) + lineSpacing / 2,
            yPos
          );

          // p5.rotate(j / total);
        }

        p5.endShape();
      }

      p5.line(-width / 2 + lineSpacing / 2, -height / 2.8, width / 2 - lineSpacing / 2, -height / 2.8);
      p5.line(-width / 2 + lineSpacing / 2, height / 2.8, width / 2 - lineSpacing / 2, height / 2.8);
    }
  };
}, settings);
