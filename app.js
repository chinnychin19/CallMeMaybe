var app = require('express')();
var bodyParser = require('body-parser');
var twilioClient = require('twilio')(
  process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
var twilioNumber = process.env.TWILIO_PHONE_NUMBER;
var url = require('url');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


var placeCall = function(phoneNumber, tonesSoFar) {
  client.calls.create({
      from: twilioNumber,
      to: phoneNumber, //  automated number
      url: url.format({
        host: 'http://guarded-retreat-7641.herokuapp.com/',
        query: {
          tonesSoFar: tones
        }
      }),
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
};

// queries: tonesSoFar, number
// TODO: parse the transcribed text into an object and update object in db
// Then continue scraping
app.post('/transcribe', function(req, res) {
	var body = req.body;
	// body.TranscriptionText
	res.send(body);
});

// queries: tonesSoFar, name (optional), number
app.get('/scrape', function(req, res) {
	res.send("scraping "+req.query.number);
});

app.get('/retrieve/:number', function(req, res) {
	res.send("TODO: return object from db");
});






var port = process.env.PORT || 3000;
app.listen(port);
