//create a socket namespace
let socket = io('/freq2');
let modSocket = io('/mod');

socket.on('connect', () => {
    console.log("connected");
});

modSocket.on('connect', () => {
  console.log("mod socket in freq2 is connected");
})

//global socket variables
let score;
let clientName;
let clientDate;
let playing;
let nameInput;
let sendButton;
let curName;

window.addEventListener('load', () => {
  //start the oscillators
  let toggleButton = document.getElementById("play-button");
  toggleButton.addEventListener("click", () => {
    playing = !playing;

    if (playing) {
      osc1.start();
      osc2.start(1);
      toggleButton.style.background = "green";
      toggleButton.innerHTML = "On";
    } else {
      osc1.stop();
      osc2.stop();
      toggleButton.innerHTML = "Off";
      toggleButton.style.background = "red";
    }
    })

  //spacebar to toggle sound
  document.body.onkeyup = function (e) {
    if (e.keyCod == 32) {
      playing = !playing;
      e.preventDefault();
    } 
  }

  nameInput = document.getElementById('uname');
  sendButton = document.getElementById('send-name');

  sendButton.addEventListener("click", () => {
    curName = nameInput.value;
    let msgObj = { "name": curName};
    socket.emit('msg', msgObj);
  });


  //ScoreButton receives the scoreboard data from the server
  let scoreButton = document.getElementById("score-button");
  let receivedMsg;
  let msgEl;

  scoreButton.addEventListener("click", () => {
    msgEl = document.createElement('p');
    msgEl.innerHTML = '';
    //sends the score data to the server first
    let clientObject = {
      "name" : curName,
      "date" : clientDate,
      "score" : score
    };
    socket.emit('clientObject', clientObject)
    modSocket.emit('clientObject', clientObject)

    //listen for data from the server
    socket.on('scoreBoard', (data) => {
      // console.log(data);

      let scoreBoardBox = document.getElementById('score');

      for (let i = 0; i < data.length; i++) {
        receivedMsg = data[i].name + ": " + data[i].score;
        // msgEl = document.createElement('p');
        msgEl.innerHTML = receivedMsg;
  
        //add this element to the page
        scoreBoardBox.appendChild(msgEl);
      }

      // let receivedMsg = data[i].name + ": " + data[i].score;
      // let receivedMsg = data[socket.id].name + ": " + data[socket.id].score
      // let msgEl = document.createElement('p');
      // msgEl.innerHTML = receivedMsg;
      // //add this element to the page
      // scoreBoardBox.appendChild(msgEl);
      });

    });
});

// global variables for p5 Sketch
let cnv;
let osc1, osc2; //base oscillator
let freq1, freq2;
let mouseFreq;
let analyzer, waveform, freqAnalyzer, waveFreq;
let x, y;

function setup() {

    //listen for freq data from the modulator page
    socket.on('freqData', (data) => {
        console.log(data.freq);
        freq1 = data.freq;
        osc1.freq(freq1);
        freq2 = freq1 * random(0.9,1.1);
        osc2.freq(freq2);
    })

    // oscillators
    osc = new p5.Oscillator('sine');
    osc1 = new p5.Oscillator('sine');
    osc2 = new p5.Oscillator('sine');

    cnv = createCanvas(windowWidth, windowHeight);
    
    freq1 = random(100, 500);
    // console.log(freq1);
    freq2 = freq1 * random(0.9,1.1);
    osc1.pan(-1);
    osc1.freq(freq1);
    osc2.freq(freq2);
    osc2.pan(1);
    
    // cnv.mousePressed(playOscillator);
    background(0);

    analyzer = new p5.FFT();
    freqAnalyzer = new p5.FFT();
}

function freqFromMouse() {
    return map(mouseX, 0, width-1, freq2 * 0.9, freq2 *1.1);
}

function draw() {
}

function mouseMoved(event) {
      //send the sound to the mod page
      let modFreq = {
        "osc1" : osc1,
        "osc2" : osc2
      };
      modSocket.emit('modFreq', modFreq)
    osc2.freq(freqFromMouse());

    waveform = analyzer.waveform();
  
    noStroke();
    beginShape();
    for (let i = 0; i < waveform.length; i+=10) {
      let x = map(i, 0, waveform.length - 1, 0, windowWidth);
      var y = map(waveform[i], -0.5, 0.5, 0, windowHeight);
      let col = map(waveform[i], -1, 1, 0, 255)
  
      // stroke(0, 0, i);
      noStroke();
      // noFill();
      vertex(x, y);
  
      fill(255, col, 100, col);
    }
    endShape();

  }
  
  function mouseClicked(event) {
    score = abs(freqFromMouse() - freq1).toFixed(2);
    console.log(score);

    waveform = analyzer.waveform();
    waveFreq = freqAnalyzer.analyze();
  
    // draw the shape of the waveform
    push();
    colorMode(HSL);
    beginShape();
    //  stroke(255);
    strokeWeight(5);
    noFill();
    for (let i = 0; i < waveFreq.length; i++) {
      let angle = map(i, 0, waveFreq.length, 0, 360);
      let amp = waveFreq[i];
      let r = map(amp, 0, 128, 0, 400);
      let x = r * cos(angle);
      let y = r * sin(angle);

      // stroke(200, 255, i);
      if (amp != 0) {
        stroke(255);
        line(width/2, height/2, x, y);
        vertex(x, y + height / 2);
        vertex(x +width/2, y);
      }

      // let x = map(i, 0, waveFreq.length, 0, width);
      // let y = map(waveFreq[i], -1, 1, -height / 4, height / 4);
      // vertex(x, y + height / 2);
    }
    endShape();
    pop();

    return false;
  }

  function drawArt() {
    mouseFreq = freqFromMouse();
    console.log(mouseFreq);
    noFill();
    let strokeColor = map(mouseFreq, 100, 800, 0, 255);
    let size = map(mouseFreq, 100, 800, 0, 400);
    // console.log(strokeColor);
    stroke(strokeColor, strokeColor, strokeColor);
    ellipse(width/2, height/2, size);   
  }
