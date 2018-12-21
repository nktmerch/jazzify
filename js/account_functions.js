//int of user's id
let userid;
//array of project objects
let projects;
//boolean representing whether user is loggedin
let loggedin;
let alreadysaved = false;

function logIn(username, password) {
  const postParameters = {username: username, password: password};
  $.post("/login", postParameters, responseJSON => {
    const responseObject = JSON.parse(responseJSON);
    console.log(responseObject.userid);
    if (responseObject.userid != -1) {
      //set userid
      userid = responseObject.userid;
      //load in projects
      let projects2DArr = responseObject.projects;
      projects = [];
      for (i = 0; i < projects2DArr.length; i++) {
        let p = new Project(projects2DArr[i][0], projects2DArr[i][1],
          projects2DArr[i][2])
          projects.push(p);
      }

      $("#login").css("display", "none");
      $("#newAccount").css("display", "none");
      $("#userSongs").css("display", "block");

      loadSongs(projects);
      //
    } else {
      //show message that says "wrong username or password"
      $("#login").append("<p style='color red'>Invalid username or password</p>");
      //for now:
      alert("invalid username or password");
    }
  });
}
//userid and project object
function saveProject(userid, project) {
  console.log(project.audio);
  projects.push(project);
  const postParameters = {
    userid: userid,
    audio: project.audio,
    chords: project.chords,
    name: project.name
  };
$.post("/save", postParameters, responseJSON => {
  const responseObject = JSON.parse(responseJSON);
  if (responseObject.result == "success") {
    //load song names again maybe?
    console.log("success haha");
    loadSongs(projects);
  } else {
    //display error message
    console.log("faliure lol");
  }
  });
}

function createAccount(username, password) {
  const postParameters = {username: username, password: password};
  $.post("/createaccount", postParameters, responseJSON => {
  const responseObject = JSON.parse(responseJSON);
  console.log(responseObject.isValid)
  if (responseObject.isValid == true) {
    console.log("is valid is true");
    //load song names maybe?
    //log in, add project and display song names
    logIn(postParameters.username, postParameters.password);
  } else {
    //display error message;
    alert("Username already taken");
  }
  })
}
function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, {type: contentType});
  return blob;
}
function changeSaveOptions() {
  
}

//name is project name
//audio is blob of audio
//chords is array of chord objects
class Project {
  constructor(audio, chords, name) {
    this.audio = audio;
    this.chords = chords;
    this.name = name;
  }
}
