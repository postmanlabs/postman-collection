var fs = require('fs'),
    stripJSONComments = require('strip-json-comments'),
    Collection = require('../lib/index').Collection;

fs.readFile(process.argv.slice(2).pop(), 'utf8', function (err, data) {
    if (err) {
        throw err;
    }

    try {
        data = new Collection(JSON.parse(stripJSONComments(data)));
    }
    catch (e) {
        throw e;
    }

    console.dir(data, { colors: true, depth: 10000 });
});
