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
var MAX_SCRAPE_DEPTH = 3;

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


var postTranscription = function(text, name, number, tonesSoFar, host) {
    var parseResult = transcriptionParser.parse(text);
    //var treeString = JSON.stringify(parseResult);
    
    if (!!!tonesSoFar) {
        var comp = new Company({
            name: name,
            number: number,
            treeString: JSON.stringify(parseResult)
        });
        comp.save();
        tryExploreNext(host, name, number); 
    } else {
        Company.findOne({number: number}, function(err, comp) {
            if (err) {
                return console.log(err);
            }
            var origTree = JSON.parse(comp.treeString);
            var tones = tonesSoFar.split('');
            var arr = origTree[tones[0]];
            var index = 1;
            while(arr[1] != null) {
                arr = arr[1][tones[index]];
                index++;
            }
            arr[1] = parseResult;
            comp.treeString = JSON.stringify(origTree);
            comp.save();
            tryExploreNext(host, name, number); 
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
    postTranscription(transcription, req.query.name, req.query.number, req.query.tonesSoFar, req.headers.host);
    res.send("updating database");
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
    companies.forEach(function(company) {
      company.treeString = JSON.parse(company.treeString);
    });
    console.log(companies);
    res.send(companies);
  })
});

app.get('/number/:number', function(req, res) {
  console.log('number: ' + req.params.number);
  CompanyModel.findOne({number: req.params.number}, function(err, company) {
    if (err || !company) {
      res.status(404).send('Not found');
      return console.log(err || 'company not found');
    }
    console.log(company);
    company.treeString = JSON.parse(company.treeString);
    console.log(company);
    res.send(company);
  })
});


// For some reason, twilio might GET or POST for this...
// Query params: tonesSoFar, number, name
app.get('/twiml.xml', function(req, res){
    handleTwimlRequest(req, res);
});

// Query params: tonesSoFar, number, name
app.post('/twiml.xml', function(req, res){
    handleTwimlRequest(req, res);
});

function handleTwimlRequest(req, res) {
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
  '<Record maxLength="60" timeout="2" transcribe="true" transcribeCallback="' +
  xmlEscape(callbackUrl) + '" action="' + xmlEscape(actionUrl) + '"/></Response>';
  console.log(output);
  res.send(output);
}

var port = process.env.PORT || 3000;
var server = app.listen(port, function() {
  console.log('Listening on port %d', server.address().port);
});


function tryExploreNext(host, name, number){
  //BFS
  CompanyModel.findOne({number: number}, function(err, company) {
    if (err || !company) {
      return console.log(err || 'company not found');
    }
    console.log(company);
    var object = JSON.parse(company.treeString);

    //queue of object pointers
    var queue = [{
        tones:"", 
        object:object,
        depth: 0
      }];

    while(queue.length > 0){
      var cur = queue.shift();
      if(cur.depth > MAX_SCRAPE_DEPTH){
        return;
      }
      if(cur.object == null){
        // DO THE THING -- REQUEST THE TRANSCRIPT
        requestTranscription(name, number, cur.tones, host);
      }
      for(var key in cur){
        queue.push({
          tones: cur.tones+key, 
          object: cur[key][1],
          depth: cur.depth+1
        });
      }
    }
    //RETURN
    return;
  })
}