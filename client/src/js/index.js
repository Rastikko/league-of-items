firebase.initializeApp({
  apiKey: "AIzaSyD0mhDRKPNJlXflWnz4jgEZlH2JFxcv1FQ",
  authDomain: "league-of-items.firebaseapp.com",
  databaseURL: "https://league-of-items.firebaseio.com",
  storageBucket: "league-of-items.appspot.com",
});

let provider = new firebase.auth.GoogleAuthProvider();
let database = firebase.database();

let gameRef;
let currentUser;

let transitionPromise = Promise.resolve();

provider.addScope('https://www.googleapis.com/auth/plus.login');

function displayQuestion(id, question) {
  let questionDOM = $('#questionTemplate').clone();
  questionDOM.attr('id', 'question');
  questionDOM.find('.champion-name').text(question.name);
  questionDOM.find('.champion-image').attr('src', `img/champion-${question.ref}.png`);
  question.responses.forEach(function(response) {
    let reponseDOM = $('<a/>', { id: response.ref, class: 'answer' });
    reponseDOM.append(`<img src="img/item-${response.ref}.png" />`);
    // TODO: use attr instead of closure
    reponseDOM.on('click', answerQuestion.bind(null, id, response.ref));
    questionDOM.find('.answers').append(reponseDOM);
  });
  $('#gameContainer').html(questionDOM);
}

function answerQuestion(id, answer) {
  console.log('answer', answer);
  console.log('id', id);
  gameRef.child(`/answers/${id}`).set(answer);
}

function listenGameState() {
  gameRef.child('state').on('value', function(stateSnaptshot) {
    let state = stateSnaptshot.val();
    console.log('state', state);
    if (!state) {
      gameRef.set({ state: 'NEW', startTime: Date.now() });
      return;
    }
    if (state === 'FINISH') {
      alert('GAME ENDED!');
    }
  });
}

function listenQuestions() {
  gameRef.child('questions').limitToLast(1).on('child_added', function(questionSnapshot) {
    let question = questionSnapshot.val();
    console.log('question ', question);
    console.log('questionSnapshot.key ', questionSnapshot.key);
    if (question.state === 'NEW') {
      transitionPromise.then(() => displayQuestion(questionSnapshot.key, question));
    }
  });
}

function startGame() {
  currentUser = firebase.auth().currentUser;
  gameRef = firebase.database().ref('games/' + currentUser.uid);
  // This will allow us to subscribe and only transition after certain animation

  $('#login').hide();

  listenGameState();
  listenQuestions();
}

$('#loginBtn').on('click', function() {
  firebase.auth().signInWithPopup(provider);
});

firebase.auth().onAuthStateChanged((user) => user && startGame());
