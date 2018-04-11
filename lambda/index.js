
'use strict';

const APP_ID = undefined;

const HELP_MESSAGE = 'You can say a problem, or, you can say stop... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Have a nice day. Goodbye!';
const YES_MESSAGE = 'Please tell me if you have any problems';
const NO_MESSAGE = 'Thank you..Have a nice day. Goodbye!';

const Alexa = require('alexa-sdk');

exports.handler = function (event, context,callback) {
    var alexa = Alexa.handler(event, context);
    //.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var username = '';
const handlers = {
    'LaunchRequest': function () {
        this.emit('fnSayWelcome');
    },
  
    'MyNameIsIntent': function () {
        var filledSlots = delegateSlotCollection.call(this);
        this.emit('fnMyNameIsIntent');
    },
  
    'HeadAcheIntent': function () {
        let filledSlots = delegateSlotCollection.call(this);
        this.emit('fnHeadAcheIntent');
    },

    'FeverIntent':function(){
        var filledSlots = delegateSlotCollection.call(this);
        this.emit('fnFeverIntent');
    },

    'fnSayWelcome': function () {
         this.emit(':ask','Hi Welcome to Blue. Please tell your name to to continue..', 'Please tell your authentication code.');
    
    },
    'fnMyNameIsIntent': function () {
        var name = this.event.request.intent.slots.name.value;
        username=name;
        this.attributes["name"] = name;
        this.emit(':ask','Hello '+name+', Please tell me if you have any problems, I can try my best to give you a solution.')
    },

    'fnFeverIntent':function(){
       var days = this.event.request.intent.slots.days.value;
       var bodypain = this.event.request.intent.slots.bodypain.value;
       var travel = this.event.request.intent.slots.travel.value;
       var surgery = this.event.request.intent.slots.surgery.value;
       
        let speach = 'Thanks for all the details. My understanding is, You have fever for '+days+' days ';
        speach = speach + 'and Question for your bodypain is '+bodypain ;
        speach = speach + ' and Question for your travel outside country is '+travel;
        speach = speach + ' and Question for your surgery is ' + surgery;
        speach = speach +'. So '+ username+', for all your stated conditions, please take Tylanol or Ibuprofen for 5 days. That will reduce your fever. Dont worry. Take rest. Thank you.  If you have any other problems to check, then Please tell your problem, otherwise say stop';
        
       this.emit(':ask',speach);
    },
    

    'fnHeadAcheIntent': function () {
        var headacheduration = this.event.request.intent.slots.headacheduration.value;
        var frequency = this.event.request.intent.slots.frequency.value;
        var visionblidspotoccurance = this.event.request.intent.slots.visionblidspotoccurance.value;
        var headlocation = this.event.request.intent.slots.headlocation.value;
       
        this.emit(':ask','Dear '+username+', if you have headache for '+headacheduration+' days  in '+headlocation+' side of your head , gently massage with thumb finger on your '+headlocation+' side of head for 15 min. This will reduce your pain quickly. Nothing to worry about it. Thank you. if you have any other problems to check, then please tell you problem, otherwise say stop')

    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    }
};

function delegateSlotCollection(){
  console.log("in delegateSlotCollection");
  console.log("current dialogState: "+this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
      console.log("in Beginning");
      var updatedIntent=this.event.request.intent;
      //optionally pre-fill slots: update the intent object with slot values for which
      //you have defaults, then return Dialog.Delegate with this updated intent
      // in the updatedIntent property
      this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
      console.log("in not completed");
      // return a Dialog.Delegate directive with no updatedIntent property.
      this.emit(":delegate");
    } else {
      console.log("in completed");
      console.log("returning: "+ JSON.stringify(this.event.request.intent));
      // Dialog is now complete and all required slots should be filled,
      // so call your normal intent handler.
      return this.event.request.intent;
    }
}

