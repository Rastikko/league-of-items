const firebase = require('firebase');
const Questions = require('./questions.js');

firebase.initializeApp({
  serviceAccount: "league-of-items-73928015ef3e.json",
  databaseURL: "https://league-of-items.firebaseio.com"
});

let gamesRef = firebase.database().ref('games');

gamesRef.on('child_added', function(gameSnapshot) {
  let game = gameSnapshot.val();
  let gameRef = firebase.database().ref('games/' + gameSnapshot.key);
  let questionsDB = new Questions();

  let answersRef = gameRef.child('answers');

  function pushRandomQuestion() {
    let question = questionsDB.getRandomQuestion();
    let newQuestionKey = gameRef.child('questions').push().key;
    let updates = {};
    updates['state'] = 'QUESTION';
    updates['questions/' + newQuestionKey] = question;
    gameRef.update(updates);
  }

  // Let's add the first random question
  if (game.state === 'NEW') {
    pushRandomQuestion();
  }

  answersRef.on('value', function(answersSnapshot) {
    if (answersSnapshot.numChildren() >= 3) {
      console.log('FINISH GAME');
      answersRef.off();
      // TODO: delete the game
      gameRef.update({ state: 'FINISH'});
    }
  });

  answersRef.on('child_added', function(answerSnapshot) {
    let answer = answerSnapshot.val();
    console.log('answerSnapshot.key', answerSnapshot.key);
    gameRef.child(`questions/${answerSnapshot.key}`).once('value').then(function(questionSnapshot) {
      let question = questionSnapshot.val();
      let correctAnswer = questionsDB.getAnswer(question.pos);
      console.log('question', question);
      console.log('correctAnswer', correctAnswer);
      console.log('questionSnapshot.key', questionSnapshot.key);
      if (answer === correctAnswer) {
        gameRef.child(`questions/${questionSnapshot.key}`).update({
          state: 'CORRECT'
        }).then(() => pushRandomQuestion());
      } else {
        gameRef.child(`questions/${questionSnapshot.key}`).update({
          state: 'INCORRECT'
        }).then(() => pushRandomQuestion());;
      }
    });
  });
});
