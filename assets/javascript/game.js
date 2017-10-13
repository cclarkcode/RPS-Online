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

 var name = $("#name").val();


 database.ref('/rps/players').child(name).once("value", function(snapshot){

  const exists = snapshot.val();

  if (!exists) {
    database.ref('/rps/players/' + name).set({


    name: name,
    wins: 0,
    losses: 0,
    active: true,
    answer: 0
  });

  

  }

   player = snapshot.val();
   console.log(player);

 });

  // var activeplayer = checkplayer(player);

  // console.log(activeplayer);

});


function checkplayer (player) {


database.ref('/rps').once("value", function(snapshot) {

  var db = snapshot.val();

  console.log(db);
  console.log(db.player2);

  if (db.player1 === "") {
    console.log("This is player1");
    database.ref('/rps/player1').set(player.name);
    return 1;
  }
  else if (db.player2 === "") {
    console.log("this is player 2");
    database.ref('/rps/player2').set(player.name);
    return 2
  }
  else {
    console.log('Room full')
    return 0
  }
});

}