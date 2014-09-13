var fs = require('fs');

var text = fs.readFileSync('in.in').toString();

// var re = /(if|for)(.*?)press\s([0-9])/;
var re = /(if|for)(((?!press).)*)press\s([0-9])/;

var first = text.match(re);



console.log("first: "+first[0]);

text = text.substring(first["index"]+first[0].length).trim();

while (text.length > 0) {
	if (text.indexOf('press') < 0) break;
	re = /^(.*?)press(\s)+(\w+)/;
	var result = text.match(re);
	console.log("next: "+result[0]);
	text = text.substring(result['index']+result[0].length);
}

