let synth;
let audio1;
function createSynth(instrument) {
  if (instrument == "piano") {
    synth = new Tone.Sampler({"C1" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/C1.wav",
                              "C2" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/C2.wav",
                              "C3" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/C2.wav",
                              "C4" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/C3.wav",
                              "C5" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/C3.wav",
                              "C6" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/C4.wav",
                              "C7" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/C4.wav"

    }, function(){
      console.log("loaded");
    });
  }
  else if (instrument == "guitar") {
    synth = new Tone.Sampler({"C1" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/guitarC1.wav",
                              "C2" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/guitarC1.wav",
                              "C3" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/guitarC2.wav",
                              "C4" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/guitarC2.wav",
                              "C5" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/guitarC3.wav",
                              "C6" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/guitarC4.wav"

    }, function(){
      console.log("loaded");
    });
  }
  else if (instrument == "synth") {
    synth = new Tone.Sampler({"C1" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/SynthC2.wav",
                              "C2" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/SynthC2.wav",
                              "C3" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/SynthC3.wav",
                              "C4" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/SynthC4.wav",
                              "C5" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/SynthC5.wav"

    }, function(){
      console.log("loaded");
    });
  }
  else if (instrument == "strings") {
    synth = new Tone.Sampler({"C1" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/stringsC1.wav",
                              "C2" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/stringsC2.wav",
                              "C3" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/stringsC2.wav",
                              "C4" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/stringsC3.wav",
                              "C5" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/stringsC4.wav",
                              "C6" : "https://raw.githubusercontent.com/nktmerch/jazzify/master/wav/stringsC5.wav"

    }, function(){
      console.log("loaded");
    });
  //   //if reverb is on
  //   let freeverb = new Tone.Freeverb().toMaster();
  //   freeverb.dampening.value = 1000;
  //   freeverb.roomSize.value = 1.0;
  // //routing synth through the reverb
  //   //if delay is on
  //   let delay = new Tone.PingPongDelay(.25, 1);
  //   synth.chain(delay, freeverb);
}
//  var vol = new Tone.Volume(-);
  var reverb = new Tone.JCReverb(0.7).connect(Tone.Master);
//var delay = new Tone.FeedbackDelay(0.5);
synth.connect(reverb);
  //synth = new Tone.PolySynth(4, Tone.Synth).toMaster();
  //synth.set(synthSettings);
}
function addReverb() {
  let freeverb = new Tone.Freeverb().toMaster();
  freeverb.dampening.value = 1000;
  freeverb.roomSize.value = 1.0;
//routing synth through the reverb
  synth.connect(freeverb);
}
function addDelay() {
  let delay = new Tone.PingPongDelay(.25, 1).toMaster();
  synth.connect(delay);
}
//chords represents an array of chords
function playChords(chords) {
  for (i = 0; i < chords.length; i++) {
    synth.triggerAttackRelease(chords[i].notes, chords[i].duration, chords.timeStamp);
  }
}
//notes represents an array of strings that represent each note
//timeStamps represents a double which signifies when to start playing the chords
//duration represents a double which signifies how long to play a chord
class Chord {
  constructor(notes, timeStamp, duration) {
    this.notes = notes;
    this.timeStamp = timeStamp;
    this.duration = duration;
  }
}
function parseChordProgFromString(stringChordProg) {
  console.log("stringChordProg: " + stringChordProg);
  let chordArr = stringChordProg.split("/");
  let outputArr = new Array();
  for (i = 0; i < chordArr.length - 1; i++) {
    let midiArr = chordArr[i].split(",");
    let notesArr = new Array();
    let timeStamp = 0;
    if (midiArr.length > 1) {
      timeStamp = parseFloat(midiArr[1]);
    }
    for (j = 0; j < midiArr.length; j = j + 2) {
      notesArr.push(midiArr[j]);
    }
    let duration = parseFloat(chordArr[i+1].split(",")[1]) - timeStamp;
    outputArr.push(new Chord(notesArr, timeStamp, duration))
  }
  return outputArr;
}
function playBlob(blob) {
  if (blob == null) {

  } else {
    console.log("blob created");
    let url = URL.createObjectURL(blob);
    audio1 = new Audio();
    audio1.src = url;
    audio1.play();
    //audio.play();
  }
}
function pauseBlob() {
  console.log("blob paused");
  audio1.pause();
}
function playBlobAt(time) {
  console.log("setting play time");
  audio1.currentTime = time;
  audio1.play();
}
