// Twilio Credentials 
var accountSid = process.env.TWILIO_SID; 
var authToken = process.env.TWILIO_AUTH_TOKEN;
var twilioNumber = process.env.TWILIO_PHONE_NUMBER;
 
//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 
 
client.calls.create({  
    from: twilioNumber,   
    to: "7034855298",
    url: "https://google.com",
    method: "GET",
    fallbackMethod: "GET",
    statusCallbackMethod: "GET",
    record: "false"
}, function(err, call) { 
    if (err) {
        console.log(err);
        throw err;
    }
    console.log("Placing call..."); 
});
