require('shelljs/global');
require('colors');

var fs = require('fs'),
    path = require('path'),

    compiler = require('schema-compiler'),

    INFO_MESSAGE = 'Generating schema...'.yellow.bold,
    OUTPUT_FOLDER = path.join(__dirname, '..', 'out', 'schema'),
    OUTPUT_FILE = path.join(OUTPUT_FOLDER, collection.json);

module.exports = function (done) {
    console.log(INFO_MESSAGE);

    // clean directory
    test('-d', OUTPUT_FOLDER) && test('-f', OUTPUT_FILE) && rm('-f', OUTPUT_FILE);
    mkdir('-p', OUTPUT_FOLDER);

    fs.writeFile(OUTPUT_FILE, compiler.compile(OUTPUT_FILE, OUTPUT_FOLDER), function (err) {
        !err && console.log(' - schema can be found at ' + OUTPUT_FILE);
        done(err);
    });
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
