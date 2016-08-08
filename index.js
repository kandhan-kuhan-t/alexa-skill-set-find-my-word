/**
 * App ID for the skill
 */
var APP_ID = "amzn1.ask.skill.c4297557-54a5-4930-a9cd-a0b323dcf82a"; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var https = require('https');
var http = require('http');
var getMeaning = require('./try_dic_api')

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/*
 * Variable defining number of events to be read at one time
 */
var paginationSize = 3;

/**
 * Variable defining the length of the delimiter between events
 */
var delimiterSize = 2;

/**
 * HistoryBuffSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var HistoryBuffSkill = function() {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
HistoryBuffSkill.prototype = Object.create(AlexaSkill.prototype);
HistoryBuffSkill.prototype.constructor = HistoryBuffSkill;

HistoryBuffSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("HistoryBuffSkill onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session init logic would go here
};

HistoryBuffSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("HistoryBuffSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
    //getWelcomeResponse(response);
};

HistoryBuffSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};
HistoryBuffSkill.prototype.intentHandlers = {

	"getMeaning":function(intent,session,response){
		handleGetMeaning(intent,session,response,function(speechOutput,reprompt_text){
			response.ask(speechOutput,reprompt_text)
		})
	},
	"continueToRun":function(intent,session,response){
		handleContinueToRun(intent,session,response,function(speechOutput,reprompt_text){
			response.ask(speechOutput,reprompt_text)
		})
	},
	"exitApp":function(intent,session,response){
		handleExitApp(intent,session,response,function(speechOutput){
			response.tell(speechOutput)
		},function(speechOutput,reprompt_text){
			response.ask(speechOutput,reprompt_text)
		})
	},
	"noSuchWord":function(intent,session,response){
		handleNoSuchWord(intent,session,response,function(speechOutput,reprompt_text){
			response.ask(speechOutput,reprompt_text)
		})
	},
	"AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "With mean me, you can get meaning for any word and also get the spelling of the word you want, given the word is in the dictionary " +
            "For example, you could say get meaning for 'hypocrite' or get spelling for 'despair'. Now, how can I help you?";
        var repromptText = "How can I help you?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    },
    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },
    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    }
}

function getWelcomeResponse(response) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var cardTitle = "Mean Me";
    var repromptText = "With mean me, you can get meaning of spelling or any word thats in the dictionary. For example, you can ask whats the meaning of hypocrite or whats the spelling of despair"
    var speechText = "<p>Mean me</p> <p>How I can help you?</p>";
    var cardOutput = "Mean me. How can I help you?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.

    var speechOutput = {
        speech: "<speak>" + speechText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardOutput);
}

function handleGetMeaning(intent,session,response,onSuccess){
	var word = intent.slots.word.value;
	session.attributes.step = 0;
	session.attributes.stuckAtStepOne = 0;
	var reprompt_text = {
		speech:"With Find my word, you can find the meaning of any word by asking whats the meaning of that word",
		type:AlexaSkill.speechOutputType.PLAIN_TEXT
	}

	getMeaning(word,function(meaningObject){
		if(meaningObject.definition == ''){
			var speechOutput = {
				speech:"Sorry, I couldn't find that word, Please try again",
				type:AlexaSkill.speechOutputType.SSML
			}
		}
		else{
			var speechOutput = {
				speech:"The meaning of "+ word + " is " + meaningObject.definition +" . Do you want to continue?",
				type:AlexaSkill.speechOutputType.SSML
			}
		}
		session.attributes.step = 1;
		onSuccess(speechOutput,reprompt_text);
	},function(error){
		var speechOutput = {
			speech:"Sorry, there seems to be a problem!, please try again.",
			type:AlexaSkill.speechOutputType.SSML
		}
		onSuccess(speechOutput,reprompt_text);
	});
}

function handleContinueToRun(intent,session,response,onSuccess){
	session.attributes.stuckAtStepOne+=1;
	if(!session.attributes.step || session.attributes.step != 1){
		var speechOutput = {
			speech:"I'm afraid I don't understand. You can ask me the meaning or spelling of a word now.",
			type:AlexaSkill.speechOutputType.SSML
		}
		var reprompt_text = {
			speech:"For example, ask Whats the meaning of hypocrite or whats the spelling of despair",
			type:AlexaSkill.speechOutputType.SSMLs
		}
		return onSuccess(speechOutput,reprompt_text)
	}
	if(session.attributes.stuckAtStepOne>1){
		var speechOutput = {
				speech:"Sorry, I couldn't find that word, Please try again with some other word",
				type:AlexaSkill.speechOutputType.SSML
		}
		var reprompt_text = {
			speech:"For example, ask Whats the meaning of hypocrite or whats the spelling of despair",
			type:AlexaSkill.speechOutputType.SSML
		}
		return onSuccess(speechOutput,reprompt_text)
	}
	var reprompt_text = {
		speech:"For example, ask Whats the meaning of hypocrite or whats the spelling of despair",
		type:AlexaSkill.speechOutputType.SSML
	}
	var speechOutput = {
		speech:"Please Go Ahead",
		type:AlexaSkill.speechOutputType.SSML
	}
	onSuccess(speechOutput,reprompt_text)
}

function handleExitApp(intent,session,response,onExit,onError){
	if(!session.attributes.step || session.attributes.step != 1){
		var speechOutput = {
			speech:"I'm afraid I don't understand. You can ask me the meaning or spelling of a word now.",
			type:AlexaSkill.speechOutputType.SSML
		}
		var reprompt_text = {
			speech:"For example, ask Whats the meaning of hypocrite or whats the spelling of despair",
			type:AlexaSkill.speechOutputType.SSML
		}
		return onError(speechOutput,reprompt_text)
	}
	var speechOutput = {
		speech:"Goodbye",
		type:AlexaSkill.speechOutputType.SSML
	}
	
	onExit(speechOutput,reprompt_text)
}

function handleNoSuchWord(intent,session,response,onSuccess){
	var speechOutput = {
		speech:"I'm afraid I don't have an entry for that word, try some other word please",
		type:AlexaSkill.speechOutputType.SSML
	}
	var reprompt_text = {
		speech:"You can ask for a meaning or spelling of a word now",
		type:AlexaSkill.speechOutputType.SSML
	}
	session.attributes.step = 0;
	onSuccess(speechOutput,reprompt_text)
}

exports.handler = function (event, context) {
    // Create an instance of the HistoryBuff Skill.
    var skill = new HistoryBuffSkill();
    skill.execute(event, context);
};