const noteListSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const noteListFlat = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

function setTitle(string){
  $("#titleBox").empty();
  for(let i = 0; i < string.length; i++){
    const letter = "<p class='letter' id='letter" + i + "'>" + string.charAt(i) + "</p>";
    $("#titleBox").append(letter);
    $("#letter" + i).hover(
      function(){
        $("#letter" + i).css("color", colors[Math.round(Math.random() * colors.length)]);
      },
      function(){
        $("#letter" + i).css("color", "black")
      }
    );
  }
}

function loadSongs(songs){
  $("#oldSongs").empty();
  $("#oldSongs").append("<img id='weird' src='https://i.pinimg.com/originals/af/3b/db/af3bdbf38d27f432b314a522787d5d70.gif'>");
  for(let i = 0; i < songs.length; i++){
    const songName = songs[i].name;
    $("#oldSongs").prepend(
      "<div id='savedSong" + i + "' class='savedSong knob'><p>" + songName + "</p></div>"
    )
    $("#savedSong" + i).css("font-family", "futura");
    $("#savedSong" + i).css("font-size", "16px");
    $("#savedSong" + i).click(() => {
      console.log(songs[i]);
      notes = songs[i].chords;
      const b64 = songs[i].audio.split(",")[1];
      blob = b64toBlob(b64, 'audio/ogg; codecs=opus', 512);
      uploadBlobToServer(blob);
      alreadysaved = true;
      changeSaveOptions();
      $("#amRecording").html("Finished.. click to reset");
      $("#amRecording").css("color", "black");
      $("#mic").attr("src", "https://cdn3.iconfinder.com/data/icons/gray-toolbar-4/512/cancel-512.png")
      recording = false;
      mode = "finished";
    });
  }
}

/*
function logIn(login){
  $("#userSongs").css("display", "block");
  $.post("/login", login, response => {
    const responseObj = JSON.parse(response);
    let userSongs = [];
    for(let i = 0; i < responseObj.length; i++){
      userSongs.push(responseObj[i].name);
    }
    loadSongs(userSongs);
  });
}
*/

function rootString(index) {
	let str = noteListFlat[index];
	if(index.length == 1) {
		return str;
	} else {
		return str + "/" + noteListSharp[index];
	}
}

let qual = "maj";
function chordUp(rawNote) {
  const numAtEnd = rawNote.match(/\d+$/)[0];
	const index = indexOfNote(rawNote);
	let newIndex = modulo(index + 1, noteListSharp.length);
	if (qual == "maj"){
		return buildMajor(newIndex, numAtEnd);
	} else if (qual == "min") {
		return buildMinor(newIndex, numAtEnd);
	}
}

function chordDown(rawNote) {
  const numAtEnd = rawNote.match(/\d+$/)[0];
	const index = indexOfNote(rawNote);
	let newIndex = modulo(index - 1, noteListSharp.length);
	if (qual == "maj"){
		return buildMajor(newIndex, numAtEnd);
	} else if (qual == "min") {
		return buildMinor(newIndex, numAtEnd);
	}
}

function indexOfNote(rawNote) {
	const note = rawNote.replace(/[0-9]/g, '');
	let index = noteListSharp.indexOf(note);
	if(index == -1) {
		index = noteListFlat.indexOf(note);
	}
	return index;
}

function buildMajor(rootIndex, numAtEnd) {
	let out = [];
	out.push(noteListSharp[rootIndex] + numAtEnd);
	out.push(noteListSharp[modulo(rootIndex + 4, noteListSharp.length)] + numAtEnd);
	out.push(noteListSharp[modulo(rootIndex + 7, noteListSharp.length)] + numAtEnd);
	return out;
}

function buildMinor(rootIndex, numAtEnd) {
	let out = [];
	out.push(noteListSharp[rootIndex] + numAtEnd);
	out.push(noteListSharp[modulo(rootIndex + 3, noteListSharp.length)] + numAtEnd);
	out.push(noteListSharp[modulo(rootIndex + 7, noteListSharp.length)] + numAtEnd);
	return out;
}

function modulo(a, b) {
	let rem = a % b;
	if (rem >= 0) {
		return rem;
	} else {
		return rem + b;
	}
}

function noteHeight(rawNote, range1, range2){
  const note = rawNote.replace(/[0-9]/g, '');
  console.log(note);
	let noteList = noteListSharp;
	if(note.includes("b")) {
		noteList = noteListFlat;
	}
	let x = 0;
	for(i = 0; i < noteList.length; i++){
		if(noteListSharp[i] == note) {
      console.log(((range1 * 2 - range2 * 2)/12 * x) + range2 * 2);
			return ((range1 * 2 - range2 * 2)/12 * x) + range2 * 2;
		}
		x++;
	}
}
