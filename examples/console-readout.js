var inspect = require('util').inspect,
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

    console.log(inspect(data, {colors: true, depth: 10000}));
});
