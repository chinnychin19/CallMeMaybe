var fs = require('fs');

var text = fs.readFileSync('in.in').toString();

makeJSON(text);

function makeJSON(text) {
    var obj = {};

    var index = text.indexOf('press');
    var prefix = text.substring(0,index);
    var pFor = prefix.lastIndexOf('for');
    var pIf = prefix.lastIndexOf('if');
    var pre = pFor > pIf ? pFor : pIf;

    var first = text.substring(pre, index+7);
    var key = first.substring(first.length-1);
    obj[key] = [first, null];

    text = text.substring(index+7).trim();

    while (text.length > 0) {
        if (text.indexOf('press') < 0) break;
        re = /^(.*?)press(\s)+(\w+)/;
        var result = text.match(re);

        var key = result[0].substring(6+result[0].indexOf('press '));
        obj[key] = [result[0], null];

        text = text.substring(result['index']+result[0].length).trim();
    }

    console.log(obj);
    return obj;
}

