// Twilio Credentials 
var accountSid = process.env.TWILIO_SID; 
var authToken = process.env.TWILIO_AUTH_TOKEN;
var twilioNumber = process.env.TWILIO_PHONE_NUMBER;
 
//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 
 
var tones = "2";

client.calls.create({  
    from: twilioNumber,   
    to: "+18774869273", //  automated number
    url: "http://guarded-retreat-7641.herokuapp.com/?q=" + tones,
    record: "true",
    method: "GET",
    fallbackMethod: "GET",
    statusCallbackMethod: "GET",
}, function(err, call) { 
    if (err) {
        console.log(err);
        throw err;
    }
    console.log("Placing call...");
    console.log("call info:");
    console.log(call);
});
