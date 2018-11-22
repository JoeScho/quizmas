const shuffle = require('lodash.shuffle');
const questions = [
  {
    question: "Who was the referee?",
    answers: {
      a: 'Anthony Taylor',
      b: 'Gary Beswick',
      c: 'Adam Nunn',
      d: 'Craig Pawson'
    },
    correct: 'a'
  }
];

module.exports = {
  getQuestions: () => shuffle(questions)
}
