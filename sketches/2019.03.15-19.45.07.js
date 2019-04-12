const canvasSketch = require('canvas-sketch');
const p5 = require('p5');
const Tone = require('tone');

const preload = p5 => {
  // You can use p5.loadImage() here, etc...
};

const settings = {
  // Pass the p5 instance, and preload function if necessary
  p5: { p5, preload },
  // Turn on a render loop
  animate: true
};

let total = 100;
let points = new Float32Array(total * 2);
let _points = [];
const nodeDim = 20;

let gridTotal = 500;
let gridPoints = new Float32Array(gridTotal * 2);
let _gridPoints;
let gridDimension = Math.sqrt(gridTotal);
const gridNodeDim = 5;

const columns = Math.floor(gridTotal / gridDimension);
const rows = Math.floor(gridTotal / gridDimension);


console.log(gridDimension, gridTotal, columns, rows)

let worker;

canvasSketch(() => {
  // Return a renderer, which is like p5.js 'draw' function
  return {
    begin: ({ p5, time, width, height }) => {
      console.log('begin')

      setupPoints(width, height);

      var blob = new Blob(['('+workerFunc.toString()+')()'], {type: 'application/javascript'})
      worker = new Worker(URL.createObjectURL(blob));

      worker.postMessage({
        gridPoints: gridPoints.buffer,
        points: points.buffer,
        action: 'setup',
      }, [points.buffer, gridPoints.buffer]);

      worker.addEventListener('message', (e) => {
        // console.log('onmessage', e, e.data.points[0]);

        _gridPoints = e.data.gridPoints;
        _points = e.data.points;
        _lines = e.data.lines;
      });
    },
    render: ({ p5, time, width, height }) => {
      // Draw with p5.js things
      p5.clear(0);
      // p5.noFill();
      p5.stroke('#000');
      p5.fill('#fff');

      worker.postMessage({ action: 'update', height, time, columns, rows });

      if (typeof _points === 'undefined' || typeof _gridPoints === 'undefined') { return; }

      // draw point markers
      for (let i = 0; i < _points.length; i += 2) {
        p5.rect(_points[i] - nodeDim / 2, _points[i + 1] - nodeDim / 2, nodeDim, nodeDim);
      }

      //////
      // grid stuff
      //////

      let _p; // temp to hold grid point
      let _spacing = gridNodeDim;

      for (let i = 0; i < _gridPoints.length; i += 2) {
        _p = [_gridPoints[i], _gridPoints[i + 1]];

        p5.rect(_p[0] - _spacing / 2, _p[1] - _spacing / 2, _spacing, _spacing);
      }

      for (let i = 0; i < _lines.length; i += 4) {
        p5.line(_lines[i], _lines[i + 1], _lines[i + 2], _lines[i + 3]);
      }
    }
  }
}, settings);

const setupPoints = (width, height) => {
  for (let i = 0; i < total * 2; i++) {
    points[i] = i * (width / total / 2);
    points[i + 1] = height / 2;
  }

  let index = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      gridPoints[index] = (width / columns) * j + (width / columns) / 2;
      gridPoints[index + 1] = (height / rows) * i + (height / rows) / 2;

      index += 2;
    }
  }
}

const workerFunc = function () {
  let gridPoints = [];
  let points = [];

  const updatePoints = (gridPoints, points, time, height, columns, rows) => {
    const _gridPoints = [];
    const _points = [];
    const _lines = [];

    for (let i = 0; i < gridPoints.length; i++) {
      _gridPoints[i] = gridPoints[i] + Math.random() * 2;
    }

    for (let i = 0; i < points.length; i += 2) {
      _points[i] = points[i] + Math.sin(time * 100 + i);
      _points[i + 1] = Math.cos(time * 2 + i) * 40 + Math.min(height, Math.max(0, ((time * (Math.abs(points.length / 2 - i))) % height)));

      for (let j = 0; j < _gridPoints.length; j += 2) {
        if (dist(_points[i], _points[i + 1], _gridPoints[j], _gridPoints[j + 1]) < (height / rows) * 4) {
          _lines.push(_points[i], _points[i + 1], _gridPoints[j], _gridPoints[j + 1])
        }
      }
    }

    postMessage({
      gridPoints: _gridPoints,
      points: _points,
      lines: _lines
    });
  }

  const dist = function (x1, y1, x2, y2) {
    var dx = Math.abs(x1 - x2);
    var dy = Math.abs(y1 - y2);

    return dx + dy;
  }

  self.onmessage = (event) => {
    // console.log('worker receive', event.data);

    if (event.data.action === 'setup') {
      gridPoints = new Float32Array(event.data.gridPoints);
      points = new Float32Array(event.data.points);

    } else if (event.data.action === 'update') {
      updatePoints(gridPoints, points, event.data.time, event.data.height, event.data.columns, event.data.rows);
    }
  }
}
