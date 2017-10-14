  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyA1-n6Mr3DjnoqUkNRiEenYGLn8ISkXSjo",
    authDomain: "my-demo-project-216da.firebaseapp.com",
    databaseURL: "https://my-demo-project-216da.firebaseio.com",
    projectId: "my-demo-project-216da",
    storageBucket: "my-demo-project-216da.appspot.com",
    messagingSenderId: "436833087961"
  };

  firebase.initializeApp(config);

  var database = firebase.database();

  var player = {}




$(".player").on("click",'#name-submit', function(){

 var name = $("#name").val().trim();


 database.ref('/rps/players').child(name).once("value", function(snapshot){

  const exists = snapshot.val();

  if (!exists) {

    player = {
    name: name,
    wins: 0,
    losses: 0,
    active: true,
    answer: 0
  }
    
    database.ref('/rps/players/' + name).set(player);
  
  }
  else {
   player = snapshot.val();
 }
  
   console.log(player);

   checkplayer(player);

  

 });

  // var activeplayer = checkplayer(player);

  // console.log(activeplayer);

});

database.ref('/rps/player1').on("value", function(snapshot){

  if (snapshot.val() === "") {
    panelreset(snapshot.val(),1);
  } 
  else {
    panelset(snapshot.val(),1);
  }


});

database.ref('/rps/player2').on("value", function(snapshot){

   if (snapshot.val() === "") {
    panelreset(snapshot.val(),2);
  } 
  else {
    panelset(snapshot.val(),2);
  }


});

database.ref('/rps/players/' + player.name + '/wins').on("value", function(snapshot){

updatestats();


});


function checkplayer (player) {


database.ref('/rps').once("value", function(snapshot) {

  var db = snapshot.val();

  console.log(db);
  console.log(db.player2);

  var playernumber=0;

  if (db.player1 === "") {
    console.log("This is player1");
    database.ref('/rps/player1').set(player.name);
    playernumber = 1;
  }
  else if (db.player2 === "") {
    console.log("this is player 2");
    database.ref('/rps/player2').set(player.name);
    playernumber=2;
  }
  else {
    roomfull(player.name)
  }

  welcomebanner(player.name,playernumber);

  createbuttons();
 
});

}

function logit (info) {

  console.log(info);
}

//Inform player there are no open spots to play
function roomfull(playername) {

  $(".player").text("Welcome " + playername + "! Sorry, the room is currently full");;
}

function panelset(playername, playernumber) {

 $("#player" + playernumber).find(".playername").text(playername);
 updatestats();

}

function panelreset(playername, playernumber) {

  $("#player" + playernumber).find(".playername").text("Waiting for Player " + playernumber);


}

function welcomebanner(playername,playernumber) {

  if (playernumber !== 0) {
    $(".player").html("<h3>Welcome " + playername + "! You are Player " + playernumber + "</h3>");
  }
  else {
    $(".player").html("<h3>Welcome " + playername + "! Sorry, the room is currently full </h3>");
  }
}


window.addEventListener("unload", function (e) {
  var confirmationMessage = "\o/";

   var playerstring = $(".player").html();
    var playernumber = playerstring.substr(playerstring.indexOf("</h3>")-1,1);

   database.ref('/rps/player' + playernumber).set("");
  database.ref('/rps/answers/player1').set("");
  database.ref('/rps/answers/player2').set("");


  (e || window.event).returnValue = confirmationMessage; //Gecko + IE
  return confirmationMessage;                            //Webkit, Safari, Chrome
});

function updatestats()  {


  database.ref('/rps').once("value", function(snapshot) {

    var db=snapshot.val();
    for (var i = 1; i <= 2; i++) {
      var playername = db['player' + i]
      if(playername !== "" ) {
        var wins = db.players[playername].wins
        var losses = db.players[playername].losses
        $("#player" + i).find(".playerstats").text("Wins: " + wins + " Losses: " + losses);
      }
    }

  })
}

function createbuttons () {

  var playernumber = thisplayer();


    $("#player" + playernumber).find(".playerchoose").html("<button class='answer' style='width: 100px; margin: 5px' value='rock'>Rock</button><br>");
    $("#player" + playernumber).find(".playerchoose").append("<button class='answer' style='width: 100px; margin: 5px' value='paper'>Paper</button><br>");
    $("#player" + playernumber).find(".playerchoose").append("<button class='answer' style='width: 100px; margin: 5px' value='scissors'>Scissors</button>");
}



$(".playerchoose").on("click",".answer", function() {

  var answer = $(this).val();

  var playernumber = thisplayer();
  var playername = $("#player" + playernumber).find(".playername").text();

  // database.ref('/rps/players/' + playername + '/answer').set(answer);
  database.ref('/rps/answers/player' + playernumber).set(answer);



})


//quick function to determine which player is active in this window
function thisplayer() {

  var playerstring = $(".player").html();
    return playerstring.substr(playerstring.indexOf("</h3>")-1,1);

  }


//Function that handles when an answer changes for either player (including resetting answers to empty strings)
database.ref('/rps/answers').on("value", function(snapshot){

  var db = snapshot.val();

  //Checks for both answers set to null (i.e. reset game state)
  if(db.player1 === "" && db.player2 === "" ) {
    $(".playerchoose").empty();
    createbuttons();
  }

  //Checks for both players have ready answers
  if (db.player1 !== "" && db.player2 !== "") {

    console.log(db.player1 + "*" + db.player2);
    resolvegame(db.player1,db.player2);
  } 

  //Removes buttons and informs both users when one user makes a choice
  if (db.player2 !== "") {

    $("#player2").find(".playerchoose").html("<h3>Answer Chosen</h3>");

  }
  if (db.player1 !== "" ) { 

    $("#player1").find(".playerchoose").html("<h3>Answer Chosen</h3>");
  }


});

function resolvegame(answer1, answer2) {

  $("#P1name").text($("#player1").find(".playername").text() + " chooses ...");
  $("#P1choice").text(answer1);
  $("#P2name").text($("#player2").find(".playername").text() + " chooses ...");
  $("#P2choice").text(answer2);
  console.log("Answer 1 is " + answer1 + ". Answer 2 is " + answer2);
  var winner=0;
  //Determine winner
  if (answer1!==answer2) {

    if(answer1 === "rock") {

      if(answer2 === "paper") {winner=2;}
      else {winner=1;}
    }
    
    if (answer1 ==="paper") {

      if (answer2==="rock") {winner=1;}
      else {winner=2;}

    }

    if (answer1 === "scissors") {

      if (answer2 === "rock") {winner=2;}
      else {winner=1;}
    }

  }

  console.log(winner + " is the winner.");
  
  result(winner);
  setTimeout(reset,2000);

}

function result(playerwin) {

  var player1 = $("#player1").find(".playername").text();
  var player2 = $("#player2").find(".playername").text();

  if (playerwin === 0) {

    $("#result").text("It's a tie!");

  } 
  else if (playerwin === 1 ) {
    $("#result").text(player1 + " Wins!");
    if (thisplayer() == 1) {addwin(player1);}
    else {addloss(player2);}
  } 
  else {
     $("#result").text(player2 + " Wins!");
     if(thisplayer() == 2) {addwin(player2);}
    else {addloss(player1);}

  }
}

function addwin(player) {

  database.ref('/rps/players/' + player).once("value", function(snapshot) {

    var wins = snapshot.val().wins;
    wins++;
    database.ref('/rps/players/' + player + '/wins').set(wins);
  })
}

function addloss(player) {

  database.ref('/rps/players/' + player).once("value", function(snapshot) {

    var losses = snapshot.val().losses;
    losses++;
    database.ref('/rps/players/' + player + '/losses').set(losses);
  })
}

function reset() {

  $("#P1name").text("");
  $("#P1choice").text("");
  $("#P2name").text("");
  $("#P2choice").text("");
  $("#result").text("");
    database.ref('/rps/answers/player1').set("");
  database.ref('/rps/answers/player2').set("");
  updatestats();

}


