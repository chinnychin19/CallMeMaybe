var app = require('express')();
var bodyParser = require('body-parser');
var twilioClient = require('twilio')(
  process.env.TWILIO_SID, 
  process.env.TWILIO_AUTH_TOKEN);
var mongoose = require('mongoose');
var twilioNumber = process.env.TWILIO_PHONE_NUMBER;
var url = require('url');
var xmlEscape = require('xml-escape');
var transcriptionParser = require("./transcriptionParser.js");
var Company = require('./schema.js').Company;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

mongoose.connect(process.env.MONGOLAB_URI);

var db = mongoose.connection;

db.once('open', function callback () {
    // we're golden
});

var CompanyModel = mongoose.model('Company', Company);

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
    console.log("!!!!~~~~~ CALLING TRANSCRIBE FUNCTION");
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

app.get('/number', function(req, res) {
  CompanyModel.find({}, function(err, companies) {
    if (err) {
      res.status(404).send('Not found');
      return console.log(err);
    }
    console.log(companies);
    res.send(companies);
  })
});

app.get('/number/:number', function(req, res) {
  console.log('number: ' + req.params.number);
  CompanyModel.findOne({number: req.params.number}, function(err, company) {
    if (err) {
      res.status(404).send('Not found');
      return console.log(err);
    }
    console.log(company);
    res.send(company);
  })
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
  '<Record maxLength="60" timeout="4" transcribe="true" transcribeCallback="' +
  xmlEscape(callbackUrl) + '" action="' + xmlEscape(actionUrl) + '"/></Response>';
  console.log(output);
  res.send(output);
});

var port = process.env.PORT || 3000;
var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
