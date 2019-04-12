const cards = document.body.querySelectorAll('article');

// object instead of array so it will be easier to find the
// index we need later on.
let projects = [];
projects[15] = 140;
projects[14] = 90;
projects[13] = 90;
projects[12] = 100;
projects[11] = 100;
projects[10] = 180;
projects[9] = 30;
projects[8] = 100;
projects[7] = 70;
projects[6] = 100;
projects[5] = 90;
projects[4] = 100;
projects[3] = 100;
projects[2] = 60;
projects[1] = 100;

class Card {
  constructor(opts = {}) {
    this.el = opts.el;
    this.index = opts.index;
    this.startFrame = opts.startFrame;
    this.currentFrame = 0;
    this.totalFrames = 40;
    this.frameIncrement = .4;
    this.image = this.el.querySelector('img');

    this.rafID = null;

    this.el.addEventListener('mouseover', (e) => {
      this.rafID = requestAnimationFrame(this.update.bind(this));
    });

    this.el.addEventListener('mouseout', (e) => {
      cancelAnimationFrame(this.rafID);
    });
  }

  update() {
    this.currentFrame = (this.currentFrame + this.frameIncrement) % this.totalFrames;

    let frame = this.startFrame + Math.floor(this.currentFrame);
    frame = padNumber(frame);

    this.image.src = `/assets/frames/${this.index}/${frame}.png`;

    this.rafID = requestAnimationFrame(this.update.bind(this));
  }
}

const padNumber = (number, charCount = 4) => {
  let output = number;
  const padZeros = charCount - number.toString().length;

  for (let i = 0; i < padZeros; i++) {
    output = "0" + output;
  }

  return output;
}


cards.forEach((card, i) => {
  const index = cards.length - i;

  new Card({
    el: card,
    index,
    startFrame: projects[index]
  });
})