//*CONSTANTS*//
let started = false;

/*The width of the page*/
let w = $("#recordBox").width();
/*The height of the page*/
let h = $("#recordBox").height();


/*COLORS*/
const colors = ["#4189f4", "#6c169e", "#c60f56", "#adc60f", "#10ed91", "#0fdeed"];

/*
  A function that handles our window
  being resized
*/
function windowResized(){
  resizeCanvas($("#recordBox").width(), $("#recordBox").height());

  w = $("#recordBox").width();
  h = $("#recordBox").height();
}


/*The radius of the inner circle*/
let innerRadius = .3 * h;
/*The radius of the outer cirlce*/
let outerRadius = .9 * h;

/*The length of time in seconds to display*/
const timeLength = 4.5;

/*The length of the circle in radians*/
const radLength = Math.PI;

/*The angle of one second on the cirlce*/
const radPerTime = radLength / timeLength;

/*The minimum frequency of the notes*/
const minFreq = 200;
/*The maximum frequency of the ntoes*/
const maxFreq = 420;

//*VARIABLES*//

/*
	The center of the circle,
	in the form...

	center = {x, y}
*/
let center = {x: w / 2, y: h + 5};

/*
	The time the song was started,
	represented in miliseconds
*/
let startTime = null;

/*
	The current 'time' of the
  radial procession of notes,
  represented in seconds.
*/
let currTime = 0;

/*
	An array of the generated 'notes'
  in the form...

  	note = {
    	startTime,
      endTime,
      frequency
    }
*/
let notes = [];

/*
	A function that takes the current
	time and converts it to an angle
  on the circle
*/
function getRadPos(time){
  return (time - currTime) * radPerTime;
}

/*
	A function that takes a frequency
  and maps it to a distance from
  the center of the circle based on
  the distance between the inner
  and outer radii
*/
function freqToDist(frequency){
  const percentFreq =
        (frequency - minFreq) / (maxFreq - minFreq);

  const distFromInner =
        ((outerRadius * 2 - innerRadius * 2) * percentFreq);

  return distFromInner + innerRadius;
}

/*
	A function that takes a note
  and returns the position it should
  be drawn on the screen as an arc
  object in the form of...

  arc = {
  	startAngle,
    stopAngle,
    distance
  }
*/
function getArcOfNote(note){
  //Adjust the start and stop time to angles

  //make sure no notes wrap around disc which causes a bug
  if (note.stopTime - note.startTime > 4.5) {
    note.stopTime = note.startTime + 4.5;
  }
  let startRadPos = getRadPos(note.startTime);
  let stopRadPos = getRadPos(note.stopTime);

  //Get the distance from the center
  const distance = noteHeight(note.notes[0], innerRadius, outerRadius - 15);

  return {
    startAngle: startRadPos - PI,
    stopAngle: stopRadPos - PI,
    distance: distance,
  };
}

/*
	A function that returns true if an
	angle is currently on screen
*/
function bounded(angle){
  return angle <= 0 && angle >= -1 * radLength;
}

/*
	A function that draws a highlight
	stroke behind a note
*/
let highlightColor = "blue";
function highlight(arcNote){
  push();

  stroke(highlightColor);
  strokeWeight(10);

  arc(
    center.x,
    center.y,
    arcNote.distance,
    arcNote.distance,
    arcNote.startAngle,
    arcNote.stopAngle
  );
  pop();
}

/*
	Gets the distance between
	the mouse and the center of
  the circle
*/
function mouseToCenter(){
  return dist(mouseX, mouseY, center.x, center.y);
}

/*
	Returns true if the mouse
	is currently over the given
	note
*/
function mouseIsOver(arcNote){
  const pastStart = mouseTheta() < arcNote.stopAngle;
  const beforeEnd = mouseTheta() > arcNote.startAngle;
  const distToNote = Math.abs(mouseToCenter() * 2 - arcNote.distance);

  return pastStart && beforeEnd && distToNote < 10;
}

/*
  A function that calculates
  How long to trigger the note
  for
*/
function getNoteDuration(note){
  return Math.abs(note.stopTime - currTime);
}

/*A function that draws a given note*/
function drawNote(note, i){
  const arcNote = getArcOfNote(note);
  if(bounded(arcNote.startAngle) || bounded(arcNote.stopAngle)){
    if(mouseIsOver(arcNote) || note.clicked == true) highlight(arcNote);
    push();
    	stroke(note.col);
      strokeWeight(6);
      arc(
        center.x,
    	  center.y,
    	  arcNote.distance,
        arcNote.distance,
        arcNote.startAngle,
        arcNote.stopAngle
    	);
    pop();

    if(arcNote.startAngle <= -1 * radLength && arcNote.stopAngle >=  -1 * radLength){
      if(note.isPlaying != true){
        for(let i = 0; i < note.notes.length; i++){
          console.log("Triggering: " + note.notes[i]);
          synth.triggerAttackRelease(note.notes[i], getNoteDuration(note));
        }
        note.isPlaying = true;
      }
   }else{
     note.isPlaying = false;
   }
 }
}

/*A function that draws all of the notes*/
function drawNotes(){
 	 if(startTime != null){
 	 noFill();
 	 for(let i = 0; i < notes.length; i++){
  	  drawNote(notes[i], i);
 	 }
 	 fill(255);
  }
}

/*Update the start time of the song*/
function updateStartTime(){
  if(mode == "play"){
    startTime = millis();
  }
}

/*Update the current time of the song*/
const milisInSecond = 1000;
function updateCurrTime(){
  currTime = (millis() - startTime) / milisInSecond;
}

function setStartTime(time){
  startTime = time;
}

function mouseTheta(){
  const A = (mouseX - center.x);
  const O = (mouseY - center.y);

  return atan2(O, A);
}

let timePaused = false;
let pauseStart = null;
let pauseStartTime = null;
let audioPaused = false;
function pauseTime(){
  if(pauseStart == null){
    pauseStart = millis();
    pauseStartTime = startTime;
    for(let i = 0; i < notes.length; i++){
      notes[i].isPlaying = false;
    }
    /*@JON Pause here*/
    if(!audioPaused){
      //audio1.pause();
      pauseBlob();
      audioPaused = true;
    }
  }

  const timePaused = millis() - pauseStart;
  setStartTime(pauseStartTime + timePaused);
}

let mouseInside = false;
let justEnteredCircle = true;
function mouseMoved(){
  if(startTime != null){
  const distFromCenter = mouseToCenter();
  if(clickOff){
   if(distFromCenter < outerRadius){
     mouseInside = true;
     if(justEnteredCircle){
       timePaused = true;
       pauseStart = null;
       justEnteredCircle = false;
     }
    }else{
      mouseInside = false;
      /*@JON Set time to currTime*/
      if(!justEnteredCircle){
        playBlobAt(currTime);
      }
      audioPaused = false;
   	  timePaused = false;
  		startMouse = null;
  	  justEnteredCircle = true;
  	}
  }
  }
}

let startMouseAngle = null;
function mousePressed(){
  if(startTime != null){
    startMouseAngle = mouseTheta();
  }
}


function mouseReleased(){
  initialPauseStart = null;
}

let initialPauseStart = null;
function mouseDragged(){
  if(startTime != null && mouseToCenter() < outerRadius){
  if(initialPauseStart == null) initialPauseStart = pauseStartTime;
  const currMouseAngle = mouseTheta();

  if(currMouseAngle > -1* PI && currMouseAngle < 0){
    const deltaMouseAngle = currMouseAngle - startMouseAngle;
    const deltaTime = (deltaMouseAngle / radPerTime) * milisInSecond;

    pauseStartTime = initialPauseStart + deltaTime;
  }
  }
}

let lastValue = 5;
function updateNoteFreq(value){
  if(value > lastValue){
    notes[noteValue].notes = chordUp(noteDisplayed);
    noteDisplayed = notes[noteValue].notes[0];
    console.log(notes);
    console.log(noteValue);
    console.log(notes[noteValue].notes);
    $("#noteFreq").html(rootString(modulo(indexOfNote(noteDisplayed) + 1, noteListSharp.length)));
  }else if(value < lastValue){
    notes[noteValue].notes = chordDown(noteDisplayed);
    noteDisplayed = notes[noteValue].notes[0];
    $("#noteFreq").html(rootString(modulo(indexOfNote(noteDisplayed) + 1, noteListSharp.length)));
  }

  lastValue = value;
}

let noteDisplayed = null;
let noteValue = null;
function loadNoteEditor(note, i){
  console.log("loading note editor");
  lastValue = 5;
  noteDisplayed = note.notes[0];
  noteValue = i;
  $("#noteFreq").html(rootString(modulo(indexOfNote(note.notes[0]) + 1, noteListSharp.length)));
  /*
  $("#noteSelector").val(5);
  $("#noteSelector").refresh();
  */
}

let clickOff = true;
function mouseClicked(){
  if(mode == "play"){
  if(mouseToCenter() <= outerRadius){
    if(clickOff){
  	  for(let i = 0; i < notes.length; i++){
        if(mouseIsOver(getArcOfNote(notes[i]))){
          highlightColor = "yellow";
          notes[i].clicked = true;
          console.log(notes[i]);
          loadNoteEditor(notes[i], i);

   	 		  timePaused = true;
  			  pauseStart = null;
    		  justEnteredCircle = false;
          clickOff = !clickOff;
        }
      }
    }else{
      highlightColor = "blue";
      for(let i = 0; i < notes.length; i++){
        notes[i].clicked = false;
      }

      document.getElementById("noteSelector").value = 5;
      noteDisplayed = null;
      clickOff = !clickOff;
    }
    }
  }else if(mode == "finished" && mouseToCenter() <= outerRadius){
    mode = "play";
    /*@JON Play initially here*/
    audioPaused = false;
    playBlob(blob);
    updateStartTime();
  }
}
function waitSeconds(iMilliSeconds) {
    var counter= 0
        , start = new Date().getTime()
        , end = 0;
    while (counter < iMilliSeconds) {
        end = new Date().getTime();
        counter = end - start;
    }
}
/*Set the frequency of a note*/
function setFrequency(note, frequency){
  note.frequency = frequency;
}

/*
	When the user scrolls,
  move the wheel into view
  and then start the timer
*/
/*
let runScroll = true;
function scrollUp(){
  if(runScroll){
  	if(center.y > h + 5){
    	//Pan the wheel
    	center = {x: center.x, y: center.y - 1.6};
  	}else{
    	//Start the program
      runScroll = false;
  	}
  }
}
*/

function curveText(sometext){
  text(sometext, w / 2, 150);
}

function setup() {
  //Change this later
  let canvas = createCanvas(w, h);
  canvas.parent("recordBox");
  angleMode(RADIANS);
  strokeWeight(5);
  textFont("futura");
  textSize(52);
  rectMode(CENTER);
  textAlign(CENTER);

  runFake();
}

//Record handling
let recordStartTime = null;
function startRecording(){
  console.log("loaded!");
  recordStartTime = millis();
}

function createChords(chords){
  for(let i = 0; i < chords.length; i++){
    const chord = chords[i];
    if(chord.notes != "rest"){
      console.log("CHORD RAW INFO");
      console.log(chord.timeStamp);
      console.log(chord.duration);
      console.log(chord.notes);
      console.log(chord.notes[0]);
      console.log(noteHeight(chord.notes[0], innerRadius, outerRadius));
      console.log("##############");
      const note = {
        startTime: chord.timeStamp,
        stopTime: chord.timeStamp + Number(chord.duration),
        notes: chord.notes,
        col: color(colors[Math.round(Math.random() * (colors.length - 1))])
      }

      notes.push(note);
    }
  }
}

let recorderStopped = false;
function handleFinish(){
  recordStartTime = null;
  startTime = null;
  console.log("finished");
  //Stop Recording
  if(!recorderStopped){
    recorderStopped = true;
    recorder.stop();
  }
  $("#amRecording").html("Finished.. click to reset");
  $("#amRecording").css("color", "black");
  $("#mic").attr("src", "https://cdn3.iconfinder.com/data/icons/gray-toolbar-4/512/cancel-512.png")
  recording = false;
  mode = "finished";
}

let mode = "none";
function draw() {
  if(mode == "startup"){
    //Draw the background
    background(255);
    //Initial scroll
    scrollUp();

    ellipse(c1.x, c1.y, outerRadius * 2, outerRadius * 2);
    ellipse(c1.x, c1.y, innerRadius * 2, innerRadius * 2);

    drawFakeNotes(step());

  }else if(mode == "play"){
    if(started){
      //Draw the background
      background(255);
      //Draw the inner and outer cirlces
      if(mouseInside){
        push();
        strokeWeight(10);
        arc(center.x, center.y, outerRadius * 2, outerRadius * 2, radLength, 0);
        pop();
      } else{
        arc(center.x, center.y, outerRadius * 2, outerRadius * 2, radLength, 0);
      }
      arc(center.x, center.y, innerRadius * 2, innerRadius * 2, radLength, 0);
      //arc(center.x, center.y, outerRadius, outerRadius, radLength - (PI / 6), radLength + (PI / 6));

      //Draw the notes
      drawNotes();

      //Update the current time
      updateCurrTime();

      //Handle pausing
      if(timePaused) pauseTime();
      if(currTime > audio1.duration + 0.2){
        mode = "finished";
        audio1.pause();
      }
    }
  }else if(mode == "record"){
    background(255);
    const timePassed = (millis() - recordStartTime) / 2.5;

    //Draw the inner and outer cirlces
    arc(center.x, center.y, outerRadius * 2, outerRadius * 2, radLength, 0);
    //Draw LInes (dlete l8r)
    const angle = radPerTime * (timePassed / milisInSecond);
    push();
    fill(color("#f9c816"));
    arc(center.x, center.y, outerRadius * 2, outerRadius * 2, -1 * angle, 0);
    pop();
    arc(center.x, center.y, innerRadius * 2, innerRadius * 2, radLength, 0);

    if(timePassed > timeLength * milisInSecond){
      handleFinish();
     }
  }else if(mode == "finished"){
    background(255);
    push();
    fill(color("#4f82d6"));
    arc(center.x, center.y, outerRadius * 2, outerRadius * 2, radLength, 0);
    pop();
    curveText("Click to play!");
    arc(center.x, center.y, innerRadius * 2, innerRadius * 2, radLength, 0);
  }
}


/*#########JUST FOR FUN PLAY MODE NOTHING REAL HERE#########*/

  //Variables
  let pause = false;
  let angle = 0;
  let fakenotes = [];

  const weight = 50;

  const numnotes = 10;
  const notewidth = 10;

  let oscs = [];
  const freqs = [261.63	, 246.94, 220.00, 196.00, 174.61, 164.81, 146.83, 130.81];

  let c1 = {x: w / 2, y : h + outerRadius * 1.1};

  function runFake() {
	  for(let i = 0; i < numnotes; i++){
      fakenotes.push(randomNote());
      const newosc = new p5.Oscillator();
      const radfreq = 130 + (fakenotes[i].radius / 500) * 130;
      //console.log(130 + (notes[i].radius / 500) * 130);
      //console.log(closestFreq(radfreq));
      newosc.freq(closestFreq(radfreq));
      newosc.amp(0);
      newosc.start();
      oscs.push({val: newosc, on: false});
	  }
  }

  function closestFreq(freq){
    let dm = null;
    let min = null;
    for(let i = 0; i < freqs.length; i++){
      const dp = Math.abs(freqs[i] - freq);
      if(dm == null || dp < dm){
        dm = dp;
        min = i;
      }
    }

    return freqs[min];
  }


  let dostep = true;
  function step(){
    if(dostep){
	     angle -= 2.5;
    }

	  return radians(angle);
  }

  function chart(rad, theta){
	 return {x: rad * cos(theta) + c1.x, y: rad * sin(theta) + c1.y}
  }

  function drawFakeNote(start, length, radius, acolor){
    push();
	  noFill();
    stroke(acolor);
	  strokeWeight(7);

	  const lower = radius - notewidth;

	  arc(c1.x, c1.y, lower, lower, start, start + length);

	  fill(255);
 	  strokeWeight(5);
    stroke(0);
    pop();
  }

  function randomNote(){
	  const q = Math.random() * (outerRadius * 2 - innerRadius * 2 - notewidth) + innerRadius * 2;
	  return {
	 	  start: radians(Math.random() * 360),
		  length: radians(Math.random() * 60),
		  radius: q,
      col: color(colors[Math.round(Math.random() * (colors.length - 1))])
    };
  }

  function drawFakeNotes(offset){
    for(let i = 0; i < fakenotes.length; i ++){
		  const fakenote = fakenotes[i];
		  drawFakeNote(fakenote.start + offset, fakenote.length, fakenote.radius, fakenote.col);
      //const dpos = -1 * degrees(fakenote.start + offset) % 360;
      //console.log("start " + (180 + sketch.degrees(note.length)));
      //console.log("dpos " + dpos);
      /*
      if(dpos < 180 + degrees(fakenote.length) && dpos > 180){
        if(!oscs[i].on){
          oscs[i].val.amp(0.2, 0.1);
          oscs[i].on = true;
        }
      }else{
        oscs[i].val.amp(0, 0.1);
        oscs[i].on = false;
      }
      */
	  }
  }

  let runScroll = true;
  function scrollUp(){
    if(c1.y > h + 5){
  	   c1 = {x: c1.x, y: c1.y - 1.6};
     }else{
       runScroll = false;
     }
  }

  function stopOscs(){
    for(let i = 0; i < oscs.length; i++){
      oscs[i].val.amp(0);
      oscs[i].on = false;
    }
  }
