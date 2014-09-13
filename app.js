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





// Query params: tonesSoFar, number, name
app.get('/twiml.xml', function(req, res){
  var play;
  if (req.query.tonesSoFar && req.query.tonesSoFar.length > 0){
    play = '<Play digits="ww' + req.query.tonesSoFar.split('').join('ww') + '"> </Play>';
  } else {
    return res.send(400).end();
  }

  if (!req.query.number || !req.query.name) {
    return res.send(400).end();
  }

  var callbackUrl = url.format({
    host: req.headers.host,
    protocol: 'http',
    pathname: 'transcribe',
    query: {
      tonesSoFar: req.query.tonesSoFar,
      number: req.query.number,
      name: req.query.name
    }
  });

  var actionUrl = url.format({
    host: req.headers.host,
    protocol: 'http',
    pathname: 'twiml.xml',
    query: req.query
  });

  var output = '<?xml version="1.0" encoding="UTF-8"?><Response>' + play +
  '<Record maxLength="30" timeout="4" transcribe="true" transcribeCallback="' +
  callbackUrl + '" action="' + actionUrl + '"/></Response>';
  res.send(output);
});

var port = process.env.PORT || 3000;
app.listen(port);
