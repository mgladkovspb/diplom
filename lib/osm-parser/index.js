'use strict';

const fs           = require('fs')
    , OsmPbfParser = require('./lib/osm-pbf-parser')
    , OsmXmlParser = require('./lib/osm-xml-parser')
    , Primitives   = require('./lib/primitives');

if(module.parent) {
    module.exports.OsmPbfParser = OsmPbfParser;
    module.exports.OsmXmlParser = OsmXmlParser;
    module.exports.Primitives = Primitives;
} else {
    let args = process.argv.slice(2);

    if(args.length === 0) {
        usage();
    } else {
        fs.access(args[0], fs.F_OK, (err) => {
            if(err) {
                return console.log('Файл не найден. Проверьте путь!');
            }
            parse(args[0]);
        });
    }
}

function usage() {
    console.log('Usage: node index.js path_to_file');
    console.log('Can be pbf or xml.');
}

function parse(file) {
    let ext    = file.split('.').pop() 
      , parser = (ext === 'pbf') ? new OsmPbfParser() : new OsmXmlParser()
      , prim   = new Primitives()
      , reader = fs.createReadStream(file);

    reader.pipe(parser).pipe(prim);

    var n = 0, w = 0, r = 0, start_time = process.hrtime(), start = new Date();

    console.log('Start at: %s', start);

    prim.on('node', (node) => {
        n += node.length; progress();
    });

    prim.on('way', (way) => {
        w += way.length; progress();
    });

    prim.on('relation', (relation) => {
        r += relation.length; progress();
    });

    process.on('exit', () => {
        console.log('');
        console.log('Stop at: %s, time elapsed: %s', new Date(), process.hrtime(start_time));
    });

    function progress() {
        console.log('nodes: ' + n + ' ways: ' + w + ' relations: ' + r);
    }
}
