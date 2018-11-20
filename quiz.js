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
  },
  {
    question: "What was the match attendance?",
    answers: {
      a: '64316',
      b: '44316',
      c: '54316',
      d: '34316'
    },
    correct: 'c'
  },
  {
    question: "What minute was the first goal scored?",
    answers: {
      a: '12',
      b: '87',
      c: '43',
      d: '5'
    },
    correct: 'a'
  },
  {
    question: "What was the half time score?",
    answers: {
      a: '3-1',
      b: '2-0',
      c: '1-1',
      d: '1-0'
    },
    correct: 'd'
  },
  {
    question: "Who was subsituted for Lukaku?",
    answers: {
      a: 'M. Rashford',
      b: 'R. Mahrez',
      c: 'J. Lingard',
      d: 'L. Shaw'
    },
    correct: 'c'
  },
  {
    question: "Who got the assist for S. Agüero goal?",
    answers: {
      a: 'Bernardo Silva',
      b: 'R. Mahrez',
      c: 'David Silva',
      d: 'R. Sterling'
    },
    correct: 'b'
  },
  {
    question: "How many yellow cards were shown in the match?",
    answers: {
      a: '0',
      b: '2',
      c: '4',
      d: '3'
    },
    correct: 'b'
  },
  {
    question: "Which minute did L. Sané come on?",
    answers: {
      a: '62',
      b: '92',
      c: '57',
      d: '73'
    },
    correct: 'a'
  },
  {
    question: "How many minutes including injury time were played?",
    answers: {
      a: '45',
      b: '90',
      c: '92',
      d: '94'
    },
    correct: 'd'
  },
  {
    question: "What time was kick-off?",
    answers: {
      a: '16:00',
      b: '15:00',
      c: '16:30',
      d: '12:00'
    },
    correct: 'c'
  }
];

module.exports = {
  questions: shuffle(questions)
}
