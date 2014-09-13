var fs = require('fs');

var keyMap = {
    1:1,
    2:2,
    3:3,
    4:4,
    5:5,
    6:6,
    7:7,
    8:8,
    1:9,
    0:0,
    "one":1,
    "two":2,
    "three":3,
    "four":4,
    "five":5,
    "six":6,
    "seven":7,
    "eight":8,
    "nine":9,
    "zero":0,
    "star": '*',
    "*":"*",
    "asterisk":"*",
    "#":"#",
    "pound": "#"
};

exports.parse = function parse(text) {
    var obj = {};
    
    // Represents numbers 0-9 spelt out
    var re_word_num = new RegExp(/zero|one|two|three|four|five|six|seven|eight|nine|ten/);
    // 0-9
    var re_num_num = new RegExp(/[0-9]/);
    //Either of the above
    var re_num = new RegExp(re_word_num.source + "|" + re_num_num.source);
    // press and the spce
    var re_press = new RegExp(/press\s/);
    // the # key
    var re_pound = new RegExp(/the\s(\#)\skey/);
    // Combine it all together and hope for the best
    var re = new RegExp(re_press.source + "((" + re_num.source + ")|" + re_pound.source + ")");

    //var re = /press\s(([0-9])|the\s(\#)\skey)/;
    var result = text.match(re);
    var end = result["index"] + result[0].length;
    var prefix = text.substring(0, end);
    var pFor = prefix.lastIndexOf('for');
    var pIf = prefix.lastIndexOf('if');
    var start = pFor > pIf ? pFor : pIf;

    var first = text.substring(start, end);
    text = text.substring(end).trim();
    var key = result[2] || result[3];
    obj[keyMap[key]] = [first, null];

    while (text.length > 0) {
        if (text.indexOf('press') < 0) break;
        re = /^(.*?)press(\s)+(\w+)/;
        var result = text.match(re);

        var key = result[0].substring(6+result[0].indexOf('press '));
        if(!!obj[key]) {
            return obj;
        }
        obj[keyMap[key]] = [result[0], null];

        text = text.substring(result['index']+result[0].length).trim();
    }

    return obj;
}

var text = "(Wendy?) and where "+
"if you know your party's 5 digit extension number or access the company directory by last name please press the # key "+
"for licensing services and accounts press 1 "+
"for sales press 2 "+
"for contract renewals press 3 "+
"for technical support press 4 "+
"for educational and consulting services press 5 "+
"for Richard to pay and expense reimbursements press 6 "+
"for accounts receivable press 7 to talk to our customer care.";


var text = "You for calling me where if you know your party's 5 digit extension number or access the company directory by last name please press the # key for licensing services and accounts press 1 for sales press 2 for contract renewals press 3 for technical support press 4 for educational and consulting services press 5 for Richard to pay and expense reimbursement press 6 for accounts receivable press 7 to talk to our customer care representative please press 0 if you would like to repeat these options press nine we're continue to stay on the line."

console.log(exports.parse(text));










