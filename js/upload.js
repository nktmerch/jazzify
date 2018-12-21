// //posting file to backend funcitonality
// //note that upload button hasn't actually been created
// //so $upload is a dummy variable but I didn't want to mess with
// //your html in case of merge conflicts
// //the start button is also a dummy variable
// //all this code would ideally go in the document.ready segment but
// //i just put it in a separate file to avoid merge conflicts for now.
// $upload.on('click', function() {uploadBlobToServer(blob)});
//   function uploadBlobToServer(b) {
//     let reader = new FileReader();
//     let base64data;
//     reader.readAsDataURL(b);
//     //reader.readAsArrayBuffer(b);
//     reader.onloadend = function() {
//       base64data = reader.result;
//       console.log(base64data);
//       const postParameters = {blob: base64data}
//       $.post("/audio", postParameters, responseJSON => {
//           //do something with the chord progression and melody notes
//           //these are given in same string separated by '@' symbol
//           const responseObject = JSON.parse(responseJSON);
//           console.log("chords: " + responseJSON.chordAndMelody[0]);
//           console.log("melody: " + responseJSON.chordAndMelody[1]);
//       });
//     }
//   }
//
//   const handleSuccess = function(stream) {
//     let recorder = new MediaRecorder(stream);
//     console.log("HERE!")
//     recorder.addEventListener('dataavailable', function(e) {
//       data.push(e.data);
//       console.log("event data:" + e.data);
//     });
//     recorder.addEventListener('stop', function(e) {
//       console.log("data available after MediaRecorder.stop() called.");
//       var audio = document.createElement('audio');
//       document.body.appendChild(audio);
//       audio.controls = true;
//       blob = new Blob(data, { 'type' : 'audio/ogg; codecs=opus' });
//       data = [];
//       var audioURL = window.URL.createObjectURL(blob);
//       audio.src = audioURL;
//       console.log("recorder stopped");
// });
//     $startButton.on('click', function() {
//       console.log("got here!");
//       if (!stop) {
//         $startButton.html("Stop recording");
//         stop = true;
//         recorder.start();
//       }
//       else {
//         $startButton.html("Nice recording!");
//         recorder.stop();
//       }
//     });
// };
//
// navigator.mediaDevices.getUserMedia({ audio: true, video: false })
//     .then(handleSuccess);
