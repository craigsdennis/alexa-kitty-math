'use strict';

const Alexa = require('alexa-sdk');
const APP_ID = 'amzn1.ask.skill.9ecec85c-2b52-4da2-82e0-c09e303bee9e';

const praises = [
    '<say-as interpret-as="interjection">Bam</say-as> you are a math a leet!',
    '<say-as interpret-as="interjection">Boom</say-as> <say-as interpret-as="interjection">Pow</say-as> !',
    '<say-as interpret-as="interjection">katchow</say-as> <say-as interpret-as="interjection">meow</say-as> !' ,
    'Meowsers, you got this!',
    '<say-as interpret-as="interjection">Oh snap</say-as> you are a smart kitty !!',
    'This Kitty sure loves math!',
    '<say-as interpret-as="interjection">meow</say-as>!'
];

function randomPraise() {
    const index = Math.floor(Math.random() * praises.length);
    return praises[index];
}

// Score to top
const adaptiveTop = [
    5,
    5,
    5,
    5,
    6,
    7,
    8,
    9,
    10
]

function loadEquationForContext(context) {
    const score = context.attributes.currentScore;
    let top = adaptiveTop[adaptiveTop.length - 1];
    if (score < adaptiveTop.length) {
        top = adaptiveTop[score];
    }
    // 1 thru top
    const firstNumber = Math.floor(Math.random() * (top - 1)) + 1;
    const limitRight = top - firstNumber;
    // 1 thru (top - first)
    const secondNumber = Math.floor(Math.random() * limitRight) + 1;
    context.attributes.firstNumber = firstNumber;
    context.attributes.secondNumber = secondNumber;
}

function correctAnswerForContext(context) {
    const firstNumber = context.attributes.firstNumber;
    const secondNumber = context.attributes.secondNumber;
    return firstNumber + secondNumber;
}

const handlers = {
    'NewSession': function() {
        let msg = 'Welcome to KittyMath!  Meow!'
        this.attributes.currentScore = 0;
        if (this.attributes.highScore !== undefined) {
            msg += `The current high score is ${this.attributes.highScore} .`
        } else {
            this.attributes.highScore = 0;
        }
        msg += 'I am going to ask you some math questions.  Are you ready?';
        this.emit(':ask', msg);
    },
    'AMAZON.YesIntent': function() {
        this.emit('PromptQuestion');
    },
    'AMAZON.NoIntent': function() {
        this.emit('Quit');
    },
    'AMAZON.CancelIntent': function() {
        this.emit('Quit');
    },
    'Quit': function() {
        this.emit(':tell', 'See you next time, meow meow!');
    },
    'Unhandled': function() {
        this.emit('PromptQuestion');
    },
    'PromptQuestion': function(praise) {
        loadEquationForContext(this);

        if (praise === undefined) {
            praise = '';
        }
        const msg = `What is ${this.attributes.firstNumber} plus ${this.attributes.secondNumber}?`
        this.emit(':ask', `${praise} ${msg}`, msg);
    },
    'MathAnswerIntent': function() {
        const answer = this.event.request.intent.slots.Answer.value;
        const correctAnswer = correctAnswerForContext(this);
        if (correctAnswer === parseInt(answer, 10)) {
            this.attributes.currentScore++;
            this.emit('PromptQuestion', randomPraise());
        } else {
            let msg =  `<say-as interpret-as="interjection">d'oh</say-as>! ${this.attributes.firstNumber} plus ${this.attributes.secondNumber} is actually ${correctAnswer}.  Better luck next time!`;
            if (this.attributes.currentScore > this.attributes.highScore) {
                this.attributes.highScore = this.attributes.currentScore;
                msg += `  You set a new high score of ${this.attributes.highScore} ! <say-as interpret-as="interjection">Hurray</say-as> !  `;
                this.attributes.currentScore = 0;
            }
            this.emit(':ask', msg + 'Would you like to play again?');
        }
    }
}


exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.dynamoDBTableName = 'KittyMath';
    alexa.registerHandlers(handlers);
    alexa.execute();
};
