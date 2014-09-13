var mongoose = require('mongoose');
var Company = require('../schema.js').Company;

mongoose.connect("mongodb://test:test@ds035750.mongolab.com:35750/call_me_maybe");

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	// console.log("hello world!");
	// var comp = new Company({
	// 	name: "burger king",
	// 	number: "9998675309",
	// 	treeString: "{}"
	// });
	// console.log(comp);
	// console.log(comp.name);

	// comp.save(function(err, comp) {
	// 	if (err) {
	// 		return console.log(err);
	// 	}
	// 	console.log("saved!");
	// })

	Company.find({ name: "mcdonald's" }, function(err, companies) {
		if (err) return console.log(err);
		console.log(companies);
		var comp = companies[0];
		comp.name = "mcdonald's";
		comp.save(function(err, comp) {
			if (err) {
				return console.log(err);
			}
			console.log("saved! "+comp.name);
		})
	})
});
