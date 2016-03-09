var fs = require('fs'),
    stripJSONComments = require('strip-json-comments'),
    Collection = require('../lib/index').Collection;

require('fs').readFile(process.argv.slice(2).pop(), 'utf8', function (err, data) {
    if (err) {
        throw err;
    }

    try {
        data = new Collection(JSON.parse(stripJSONComments(data)));
    }
    catch (e) {
        throw e;
    }

    var g = data.toJSON();
    // console.dir(g, {colors: true, depth: 10000});
    //
    fs.writeFileSync('output.json', JSON.stringify(g, null, 4));
});
