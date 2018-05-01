const Alexa = require('alexa-sdk');
const dao = require('./dao.js');
const restapi = require('./restapi.js');
const util = require('./util.js');
const Nexmo = require('nexmo');
const dateTime = require('date-time');
const encodeUrl  = require('encodeurl');

const privateKeyFile = require('fs').readFileSync('privateKey.txt');

const APP_ID = undefined;
const HELP_MESSAGE = 'You can say a problem, or, you can say stop... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Have a nice day. Goodbye!';
const YES_MESSAGE = 'Please tell me, if you have any problems';
const NO_MESSAGE = 'Thank you..Have a nice day. Goodbye!';

exports.handler = function (event, context,callback) {
    var alexa = Alexa.handler(event, context);
    //.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
    //alexa.dynamoDBTableName="sessionTableName";  Here it automatically push all this.attributes['anything']
    // to this table. table should have primary key as "userId"
};

var username = '';

const handlers = {

     'LaunchRequest': function () {
        this.emit('fnIntro');
    },
    'fnIntro': function() {
		this.emit(':ask', "Welcome to P-Doc, Please say your four digit passcode to continue.","Please say your passcode clearly.");
	},
    'AuthIntent': function () {
		this.emit('fnAuthIntent');
	},
	'fnAuthIntent': function() {
		var authcode = this.event.request.intent.slots.authcode.value;
		if(authcode=='1234'){
			this.emit('fnSayWelcome');
		}else{
			this.emit(':ask', "Sorry, Your passcode does not match. Please try again.");
		}
	},
    'MyNameIsIntent': function () {
        //var delegateStatus = delegateSlotCollection.call(this);
        // if(delegateStatus==="COMPLETED"){
        //     this.emit('fnMyNameIsIntent');
        // }       
        this.emit('fnMyNameIsIntent');    
    },
  
    'HeadAcheIntent': function () {
        var delegateStatus = delegateSlotCollection.call(this);
        if(delegateStatus==="COMPLETED"){
            this.emit('fnHeadAcheIntent');
        }        
    },

    'FeverIntent':function(){
        var delegateStatus = delegateSlotCollection.call(this);
        if(delegateStatus==="COMPLETED"){
            this.emit('fnFeverIntent');
        }
    },

    'SendToProvider':function(){
        this.emit('fnSendToProvider');
    },

    'fnSayWelcome': function () {
        let hndlr = this;
        let dependentList = "";
        let apitoken = this.event.session.user.accessToken;

        restapi.getLoggedInUser(apitoken,response=>{
            let email = response.email;
            let user = response.name;
            
            dao.getDependents(email,function(dependents,memberInfo){
                for(var i=0;i < dependents.length;i++){
                    dependentList += dependents[i].firstname +". or ";
                    hndlr.attributes[dependents[i].firstname] = dependents[i].id;
                }
                hndlr.attributes["email"]=email;
                hndlr.attributes["member"]=memberInfo;
                hndlr.attributes["dependentList"] = dependents;
                hndlr.attributes["diagnosisItem"]={};

                hndlr.emit(':ask','Dear '+user +' , Please tell who has problem in your family. Is it you? or '+dependentList+' someone else .', 'Please tell any name to continue');
            });
        });
    },
    'fnMyNameIsIntent': function () {
        let name = this.event.request.intent.slots.name.value;

        if(name=="myself" || name =="for me" || name =="its me" || name =="its for me"){
            console.log("Setting Diagnosis details for Member");
            this.attributes['diagnosisItem'].email=this.attributes["email"];
            this.attributes['diagnosisItem'].dependentid = this.attributes["member"].id;
            this.attributes['diagnosisItem'].firstname = this.attributes["member"].firstname;
            this.attributes['diagnosisItem'].lastname = this.attributes["member"].lastname;
            name=this.attributes["member"].firstname;
        }else{
            for(var i=0;i < this.attributes["dependentList"].length;i++){
                if(this.attributes["dependentList"][i].firstname == name){
                    console.log("Setting Diagnosis details for Dependent ->",this.attributes["dependentList"][i].firstname);

                    this.attributes['diagnosisItem'].email=this.attributes["email"];
                    this.attributes['diagnosisItem'].dependentid = this.attributes["dependentList"][i].id;
                    this.attributes['diagnosisItem'].firstname = this.attributes["dependentList"][i].firstname;
                    this.attributes['diagnosisItem'].lastname = this.attributes["dependentList"][i].lastname;
                }
            }
        }
        this.emit(':ask','Hello '+name+', Please tell me your problem, I can try my best to help you. Say something like, I have fever, I have head ache.')
    },

    'fnFeverIntent':function(){
    
       var days = this.event.request.intent.slots.days.value;
       var bodypain = this.event.request.intent.slots.bodypain.value;
       var travel = this.event.request.intent.slots.travel.value;
       var surgery = this.event.request.intent.slots.surgery.value;
       
       var feversymptoms={
        "days":days,
        "bodypain":bodypain,
        "travel":travel,
        "surgery":surgery
        };
       
       //var feverSymptoms = util.populateFeverSymptoms(days,bodypain,travel,surgery);

       this.attributes['diagnosisItem'].problem="Fever";
       this.attributes['diagnosisItem'].symptoms=feversymptoms;
       //this.attributes['diagnosisItem'].lastupdate= new Date().toString();
       this.attributes['diagnosisItem'].lastupdate= dateTime().toString();
              
       console.log('fnFeverIntent diagnosisItem ',this.attributes['diagnosisItem'])

       let providerNotes = 'Member Name :'+username+ 'MemberId XZ12345678 is having fever for the last '+days+
                            ' days. Question for bodypain '+bodypain+
                            ' . Question for your travel outside country is '+travel+
                            ' . Question for your surgery is ' + surgery;

       this.attributes['diagnosisItem'].notesToProvider=providerNotes;
       this.attributes['diagnosisItem'].SentToProvider=true;

       let hndlr = this;

       dao.saveDiagnosis(this.attributes['diagnosisItem'],function(response){

        let speach = 'Thanks for all the details. My understanding is, You have fever for '+days+' days ';
        speach = speach + 'and Question for your bodypain is '+bodypain ;
        speach = speach + ' and Question for your travel outside country is '+travel;
        speach = speach + ' and Question for your surgery is ' + surgery;
        speach = speach + '. '+ response;
        speach = speach +'. So '+ username+', for all your stated conditions, please take Tylenol or Ibuprofen for 5 days. That will reduce your fever.';
        speach = speach +' If you are still looking for assistance, then shall I send your symptoms, to your registered provider, so that they will call you back, please say yes, to send the details or stop, to end this session ?';


        hndlr.emit(':ask',speach);
       })

    },
    

    'fnHeadAcheIntent': function () {

        var headacheduration = this.event.request.intent.slots.headacheduration.value;
        var frequency = this.event.request.intent.slots.frequency.value;
        var visionblidspotoccurance = this.event.request.intent.slots.visionblidspotoccurance.value;
        var headlocation = this.event.request.intent.slots.headlocation.value;

        var headAcheSymptoms ={
            "headacheduration":headacheduration,
            "frequency":frequency,
            "visionblidspotoccurance":visionblidspotoccurance,
            "headlocation":headlocation
        };
    
        this.attributes['diagnosisItem'].problem="Head Ache";
        this.attributes['diagnosisItem'].symptoms=headAcheSymptoms;
        this.attributes['diagnosisItem'].lastupdate= dateTime().toString();
        //this.attributes['diagnosisItem'].lastupdate= new Date().toString();

        let hndlr = this;
        dao.saveDiagnosis(this.attributes['diagnosisItem'],function(response){
           let speech = 'Dear '+username+', if you have headache for '+headacheduration+' days  in '+headlocation+' side of your head , gently massage with thumb finger on your '+headlocation+' side of head for 15 min. This will reduce your pain quickly. Nothing to worry about it. Thank you. if you have any other problems to check, then please tell you problem, otherwise say stop';
            hndlr.emit(':ask',speech);
       })
    },

    'fnSendToProvider':function(){

        const nexmo = new Nexmo({
            apiKey: process.env.NEXMO_API_KEY,
            apiSecret: process.env.NEXMO_API_SECRET,
            applicationId: process.env.NEXMO_APP_ID,
            privateKey: privateKeyFile
        });
        
        var isSendToProvider = this.event.request.intent.slots.isSendToProvider.value;
        console.log('isSendToProvider',isSendToProvider);
        
        let hndlr = this;
        
        let email = this.attributes['diagnosisItem'].email;
        let lastupdate = this.attributes['diagnosisItem'].lastupdate;
        
        console.log('In fnSendToProvider, email', email);
        console.log('In fnSendToProvider, lastupdate', lastupdate);

        var caseInfoURL = encodeUrl('https://hzpptkl4bh.execute-api.us-east-1.amazonaws.com/INT/case?email='+email+'&lastupdate='+lastupdate);

        console.log('caseInfoURL',caseInfoURL);

        nexmo.calls.create({
            to: [{
            type: 'phone',
            number: process.env.NEXMO_TO_NUM
            //number: 16123239413
            }],
            from: {
            type: 'phone',
            number: process.env.NEXMO_VIRT_NUM
            //number: 12017785675 // your virtual number
            },
            //answer_url: ['https://nexmo-community.github.io/ncco-examples/first_call_talk.json']
            //answer_url: ['https://344yvcjkv4.execute-api.us-east-1.amazonaws.com/INT/fnBlueCaseInfo']
            answer_url: [caseInfoURL]
            }, (err, res) =>{
                console.error('inside callback method err',err);
                console.log('inside callback method res',res);
                if(err) { 
                    console.error(err); 
                }else { 
                    console.log('Response string',res);
                }
                hndlr.emit(':ask', 'Your details has been sent to your provider');
            });
        
        //hndlr.emit(':ask', 'This step skipped intentionally. Your details has been sent to your provider');
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
    if (this.event.request.dialogState === "STARTED") {
      var updatedIntent=this.event.request.intent;
      this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
      this.emit(":delegate");
    } else {
      return "COMPLETED";
    }
}
