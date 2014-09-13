var mongoose = require('mongoose');

var companySchema = mongoose.Schema({
    name: String,
    number: String,
    treeString: String // stringified JSON
});
