var mongoose = require('mongoose');

companySchema = mongoose.Schema({
    name: String,
    number: String,
    treeString: String // stringified JSON
});

exports.Company = mongoose.model('Company', companySchema);
