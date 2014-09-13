var app = require('express')();
var bodyParser = require('body-parser');
var twilioClient = require('twilio')(
  process.env.TWILIO_SID, 
  process.env.TWILIO_AUTH_TOKEN);
var twilioNumber = process.env.TWILIO_PHONE_NUMBER;
var url = require('url');
var transcriptionParser = require("./transcriptionParser.js");
var Company = require('./schema.js').Company;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


var requestTranscription = function(name, number, tonesSoFar, host) {
  console.log(host);
  var theUrl = url.format({
        host: host,
        pathname: "twiml.xml",
        protocol: 'http',
        query: {
          tonesSoFar: tonesSoFar,
          number: number,
          name: name
        }
      });
  console.log("URL: "+theUrl);
  twilioClient.calls.create({
      from: twilioNumber,
      to: number, //  automated number
      url: theUrl,
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
  });
};


var postTranscription = function(text, name, number, tonesSoFar) {
        var treeString = JSON.stringify(transcriptionParser.parse(text));

        if (!!!tonesSoFar) {
        var comp = new Company({
            name: name,
            number: number,
            treeString: treeString
        });
        comp.save(function (err, comp) {
            if (err) {
                return console.log(err);
            }
        });
    } else {
        Company.find({number: number}, function(err, comps) {
            if (err) {
                return console.log(err);
            }
            var comp = comps[0];
            var origTree = JSON.parse(comp.treeString);
            var tones = tonesSoFar.split('');
            var arr = comp[tones[0]];
            var index = 1;
            while(arr[0] == null) {
                arr = arr[1][tones[index]];
                index++;
            }
            arr[1] = treeString;
            comp.save(function (err, comp) {
                if (err) {
                    return console.log(err);
                }
            });
        });
    }
}

// queries: tonesSoFar, number, name
// TODO: parse the transcribed text into an object and update object in db
// Then continue scraping
app.post('/transcribe', function(req, res) {
    var body = req.body;
    var transcription = body.TranscriptionText;
    postTranscription(transcription, req.query.name, req.query.number, req.query.tonesSoFar,
        function(res, name, number, tonesSoFar) {
            res.send("updated on db!")
        });
});

// queries: tonesSoFar, name, number
app.get('/scrape', function(req, res) {
    console.log("headers.host: "+req.headers.host);
    requestTranscription(req.query.name, req.query.number, req.query.tonesSoFar, req.headers.host);
    res.send("scraping "+req.query.number + " with tones so far: "+ req.query.tonesSoFar);
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
    play = '';
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
  console.log(output);
  res.send(output);
});

var port = process.env.PORT || 3000;
app.listen(port);
