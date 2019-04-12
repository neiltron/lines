const canvasSketch = require('canvas-sketch');
const p5 = require('p5');
const { vec2 } = require('gl-matrix');

let font;

const preload = p5 => {
  // You can use p5.loadImage() here, etc...

  font = p5.loadFont('./assets/font/Supply-Regular.otf');
};

const settings = {
  // Pass the p5 instance, and preload function if necessary
  p5: { p5, preload },
  // Turn on a render loop
  animate: true
};

const letterOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
let letters = [];
let letterObjects = [];
letterIndex = 0;

canvasSketch(() => {
  // Return a renderer, which is like p5.js 'draw' function

  return {
    begin: ({ p5 }) => {
      for (let i = 0; i < letterOptions.length; i++) {
        const letterPoints = font.textToPoints(letterOptions[i], 0, 0, 200, {
          sampleFactor: 1,
          simplifyThreshold: 0
        });

        letters[letterOptions[i]] = [];

        for (let j = 0; j < letterPoints.length; j++) {
          // convert from x,y to 0,1 because that's what is being used already. hax
          letters[letterOptions[i]][j] = [letterPoints[j].x, letterPoints[j].y];
        }
      }

      let xPos = 0;


      [
        'WAMP WAMP',
        'WHAT IT DO',
        'WHAT IT DO'
      ].forEach((line, lineNum) => {
        xPos = 0;

        console.log(line);

        line.split('').forEach((letter, i) => {
          xPos += 100;

          if (letter === ' ') { return; }

          letterObjects.push(
            new Letter({
              letter,
              x: xPos + 30,
              y: 100 * (lineNum + 1),
              p5
            })
          );
        });
      });
    },
    render: ({ p5, time, width, height }) => {
      // Draw with p5.js things
      p5.background(0);

      p5.stroke(255);
      p5.strokeWeight(1);
      p5.noFill();

      letterObjects.forEach(letter => {
        letter.update(time);
        letter.draw();
      });
    }
  }
}, settings);

class Letter {
  constructor(opts = {}) {
    this.letter = opts.letter;
    this.lineTotal = 100;
    this.p5 = opts.p5;

    this.x = opts.x;
    this.y = opts.y;

    this.setup();
  }

  setup() {
    this.points = [];

    // push points to this letters local point store as a clean copy. ie not as reference
    letters[this.letter].forEach(point => this.points.push(point.slice()));

    this.pointTotal = this.points.length - 1;

    this.lineTotal = Math.min(100, this.points.length);

    this.points.forEach(point =>  {
      vec2.add(point, point, [this.x, this.y * 2]);
    })

    this.lines = [];
    this.lineTargets = [];

    for (let i = 0; i < this.lineTotal; i++) {
      const pointIndexA = i;
      const pointIndexB = Math.floor(Math.random() * this.pointTotal);

      this.lineTargets[i] = [
        this.points[pointIndexA],
        this.points[pointIndexB]
      ];

      this.lines[i] = [
        [this.x + 60, this.y * 1.4],
        [this.x + 60, this.y * 1.4]
      ];
    }
  }

  draw() {
    for (let i = 0; i < this.lineTotal; i++) {
      const pointA = this.lines[i][0];
      const pointB = this.lines[i][1];

      // console.log(lineTargets[i][0], pointB);

      this.p5.line(
        pointA[0],
        pointA[1],
        pointB[0],
        pointB[1]
      );
    }
  }

  update(time) {
    console.log(time % 1)
    for (let i = 0; i < this.lineTotal; i++) {
      vec2.lerp(
        this.lines[i][0],
        this.lineTargets[i][0],
        this.lineTargets[i][1],
        Math.min(1, Math.sin(time % 2))
      );
    }
  }
}