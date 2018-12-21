let data = [];
let blob;
let base64data;
let recorder;
let cancel = false;
let jazzlevel;
$(document).ready(() => {
  setTitle("Jazzify");
  createSynth("piano");
  jazzlevel = "standard";
  setInterval(() => {
    $("#startMsg").removeClass("invisible");
    $("#startMsg").addClass("visible");
  }, 500);

  let notYetScrolled = true;
  $(document).on("wheel", function(event){
    if(event.originalEvent.deltaY > 0 && notYetScrolled){
      $(document).off("wheel");
      notYetScrolled = false;
      $("#titleBox").removeClass("startTitle");
      $("#titleBox").addClass("scrollTitle");
      $("#startMsg").addClass("fadeout");
      setTimeout(() => {
        $("#startMsg").css("display", "none");
        $("#titleBox").css("height", "15vh");
        $("#songEditor").css("display", "block");
      }, 1000);
    }

    setTimeout(() => {
        $("#songEditor").removeClass("invisible");
        $("#songEditor").addClass("visible");
        started = true;
        console.log("SCROLLING");
        console.log(notYetScrolled);
        mode = "startup";
    }, 1500);
  });

  $("#randomize").click(() => {
    resetNotes();
  });

  $("#pause").click(() => {
    if(pause){
      $("#pause").html("Pause");
    }else{
      stopOscs();
      $("#pause").html("Unpause");
    }

    pause = !pause;
  });

  $("#major").click(() => {
    qual = "maj";
  });

  $("#minor").click(() => {
    qual = "min";
  });

  $("#showLogin").click(() => {
    $("#accountOptions").css("display", "none");
    $("#login").css("display", "block");
  });

  $("#createYourAccount").click(() => {
    $("#accountOptions").css("display", "none");
    $("#newAccount").css("display", "block");
  });

  $(".back").click(() => {
    $("#login").css("display", "none");
    $("#newAccount").css("display", "none");
    $("#accountOptions").css("display", "block");
  });

  $("#createAccount").click(() => {
    const login = {username: $("#newUsername").val(), password: $("#newPassword").val()};
    createAccount(login.username, login.password);
  });

  $("#loginUser").click(() => {
    const login = {username: $("#username").val(), password: $("#password").val()};
    logIn(login.username, login.password);
  });
  

  $("#saveSong").click(() => {
    if(notes != null){
      const project = {audio: base64data, chords: notes, name: $("#songName").val()};
      console.log(project);
      saveProject(userid, project);
    }else{
      alert("Record a song first!");
    }
  });

  $("#logOut").click(() => {
    $("#userSongs").css("display", "none");
    $("#accountOptions").css("display", "block");
  });

  $("#selectJazz").click(() => {
    console.log("clicked");
    const radios = document.getElementsByName('jazzlevel');
    for (i = 0, length = radios.length; i < length; i++)
    {
      if (radios[i].checked)
      {
        // do whatever you want with the checked radio
        jazzlevel = radios[i].value;
        console.log(jazzlevel);
        // only one radio can be logically checked, don't check the rest
        break;
      }
    }
  });
  //   //const whichJazz = $('form input[type=radio]:checked').val();
  //   const whichJazz = $("#selectJazz").value();
  //   if(whichJazz == "Standard"){
  //     jazzlevel = "standard";
  //     console.log(jazzlevel);
  //     /*Make a post request telling the server we want the Standard algo*/
  //   }else if(whichJazz == "Jazzy"){
  //     jazzlevel = "jazz";
  //     console.log(jazzlevel);
  //     /*Make a post request telling the server we want the Jazzy algo*/
  //   }else if(whichJazz == "Random"){
  //     jazzlevel = "random";
  //     console.log(jazzlevel);
  //     /*Make a post request telling the server we want the Random algo*/
  //   }
  // });

  let recording = false;

  let slider = document.getElementById("noteSelector");
  slider.oninput = function() {
    updateNoteFreq(this.value);
  }

  let currInstrument = 0;
  let instruments = [];
  instruments.push("http://www.freepngimg.com/thumb/piano/8-2-piano-picture-thumb.png");
  instruments.push("http://www.binderbass.com/images/Front-View.png");
  instruments.push("https://www.trumpetworx.com/wp-content/uploads/2016/01/trumpet_1_vertical.png");
  instruments.push("https://www.martinguitar.com/media/6406/d-1-authentic-1931.png");
  $("#selectTone").click(() => {
    currInstrument += 1
    if(currInstrument == instruments.length) currInstrument = 0;
    const newInstrument = instruments[currInstrument];
    $("#instpic").attr("src", newInstrument);
    if(currInstrument == 0){
      /*SET 'synth' EQUAL TO STANDARD SYNTH*/
      createSynth("piano");
    }else if(currInstrument  == 1){
      /*SET 'synth' EQUAL TO PLUCKED SYNTH*/
      createSynth("strings");
    }else if(currInstrument  == 2){
      /*SET 'synth' EQUAL TO HORN SOUNDING SYNTH*/
      createSynth("synth");
    }else if(currInstrument  == 3){
      /*SET 'synth' EQUAL TO ANOTHER SYNTH*/
      createSynth("guitar");
    }
  });

  const handleSuccess = function(stream) {
    console.log("got to handlesucces");
    recorder = new MediaRecorder(stream);
    recorder.addEventListener('dataavailable', function(e) {
      data.push(e.data);
    });
    recorder.addEventListener('stop', function(e) {

      //adds audio div element to page
      //let audio = document.createElement('audio');
      //$("#audio").appendChild(audio);

      //populates blob
      blob = new Blob(data, { 'type' : 'audio/ogg; codecs=opus' });
      data = [];
      //modal popup

      const modal = document.getElementById('myModal');

      const generateBtn = $("#generate");
      const cancelBtn = $("#cancel");
      const myAudio = document.getElementById("myAudio");
      myAudio.controls = true;
      myAudio.src = URL.createObjectURL(blob);
      modal.style.display = "block";
      //audio.src = URL.createObjectURL(blob);;
      //$("#audio").controls = true;
      console.log(blob);
      //$("#audio").src = URL.createObjectURL(blob);
      generateBtn.on('click', function() {
        modal.style.display = "none";
        myAudio.pause();
      });
      cancelBtn.on('click', function() {
        notes = [];
        $("#selectJazz").css("display", "block");
        $("#microphoneBox").css("margin-left", "30vw");
        $("#microphoneBox").css("width", "49vw");
        $("#microphoneBox").css("border-style", "solid solid solid none");
        $("#amRecording").html("Click to record");
        $("#amRecording").css("color", "black");
        $("#mic").attr("src", "https://png.icons8.com/metro/1600/microphone.png")
        recording = false;
        mode = "startup";
        myAudio.pause();
        modal.style.display = "none";
      });



      //uploads to backend
      if (cancel == false) {
        uploadBlobToServer(blob);
      }
      console.log("recorder stopped");
    });

    $("#microphoneBox").click(() => {
      console.log("got it");
      if(!runScroll){
        if(mode == "startup"){
          //Start recording
          recorderStopped = false;
          recorder.start();
          $("#selectJazz").css("display", "none");
          $("#microphoneBox").css("margin-left", "20vw");
          $("#microphoneBox").css("width", "59vw");
          $("#microphoneBox").css("border-style", "solid");
          $("#amRecording").html("Recording... click to finish");
          $("#amRecording").css("color", "red");
          $("#mic").attr("src", "http://www.animatedimages.org/data/media/387/animated-microphone-image-0040.gif")
          recording = true;
          startRecording();
          mode = "record";
        }else if(mode == "record"){
          handleFinish();
        }else if(mode == "finished" || mode == "play"){ /*@FINAL CHANGE*/
          notes = [];
          $("#selectJazz").css("display", "block");
          $("#microphoneBox").css("margin-left", "30vw");
          $("#microphoneBox").css("width", "49vw");
          $("#microphoneBox").css("border-style", "solid solid solid none");
          $("#amRecording").html("Click to record");
          $("#amRecording").css("color", "black");
          $("#mic").attr("src", "https://png.icons8.com/metro/1600/microphone.png")
          recording = false;
          mode = "startup";
        }
      }
    });
  };

  navigator.mediaDevices.getUserMedia({audio: true, video: false})
    .then(handleSuccess);
});

function uploadBlobToServer(b) {
    const fakeChords = [new Chord(["D4", "F#4", "A4"], 1, .2), new Chord(["A4", "C#4", "E4"], 2, .3), new Chord(["C#4", "E4", "G4"], 3, .5), new Chord(["D4", "F#4", "A4"], 4, .2), 
                        new Chord(["D4", "F#4", "A4"], 5, .2), new Chord(["A4", "C#4", "E4"], 6, .3), new Chord(["C#4", "E4", "G4"], 7, .5), new Chord(["D4", "F#4", "A4"], 8, .2)]
    createChords(fakeChords);
}
