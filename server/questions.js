class Questions {
  constructor() {
    this.potentialQuestions = require('./questions.json');
    this.allQuestions = require('./questions.json');
  }

  getRandomQuestion() {
    let pos = 0;
    let question = this.potentialQuestions[pos];
    let clientQuestion = {
      state: 'NEW',
      pos: pos,
      ref: question.ref,
      name: question.name,
      responses: question.responses,
    };
    // TODO delete question from potentialQuestions
    return clientQuestion;
  }

  getAnswer(pos) {
    console.log('getAnswer', pos);
    console.log('this.allQuestions[pos]', this.allQuestions[pos]);
    return this.allQuestions[pos].rightResponse;
  }
}

module.exports = Questions;
