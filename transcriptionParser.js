var fs = require('fs');


exports.parse = function parse(text) {
    var obj = {};

    var re = /press\s(([0-9])|the\s(\#)\skey)/;
    var result = text.match(re);
    var end = result["index"] + result[0].length;
    var prefix = text.substring(0, end);
    var pFor = prefix.lastIndexOf('for');
    var pIf = prefix.lastIndexOf('if');
    var start = pFor > pIf ? pFor : pIf;

    var first = text.substring(start, end);
    text = text.substring(end).trim();
    var key = result[2] || result[3];
    obj[key] = first;

    while (text.length > 0) {
        if (text.indexOf('press') < 0) break;
        re = /^(.*?)press(\s)+(\w+)/;
        var result = text.match(re);

        var key = result[0].substring(6+result[0].indexOf('press '));
        if(!!obj[key]) {
            return obj;
        }
        obj[key] = [result[0], null];

        text = text.substring(result['index']+result[0].length).trim();
    }

    return obj;
}

// var text = "(Wendy?) and where "+
// "if you know your party's 5 digit extension number or access the company directory by last name please press the # key "+
// "for licensing services and accounts press 1 "+
// "for sales press 2 "+
// "for contract renewals press 3 "+
// "for technical support press 4 "+
// "for educational and consulting services press 5 "+
// "for Richard to pay and expense reimbursements press 6 "+
// "for accounts receivable press 7 to talk to our customer care.";


// var text = "Hello, welcome to out if you would like to speak to sales press 1 if you are premium support customer press 2 for other technical support questions we're always available at help at (toyota.com?) for general information about Leo press 3 to hear these options again press 4 hello welcome to Leo out if you would like to speak to sales press 1 if you are premium support customer press 2 for other technical support questions we're always available at help at (toyota.com?) for general information about the Leo press 3 to hear these options again press 4 hello welcome to out if you would like to speak to sales press 1 if you are premium support customer press 2 for other technical support questions we're always available help out Leo.com for general information about."

// exports.parse(text);










