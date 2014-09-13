var app = require('express')();
var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


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