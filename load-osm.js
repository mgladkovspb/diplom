'use strict';

const fname        = 'RU-SPE.pbf'
    , DraftLog     = require('draftlog')
    , chalk        = require('chalk')
    , fs           = require('fs')
    , OsmPbfParser = require('./lib/osm-parser').OsmPbfParser
    , Primitives   = require('./lib/osm-parser').Primitives
    , common       = require('./common');

//DraftLog.into(console);
console.log(chalk.red('База данных пуста. Загрузка и обработка данных OSM ...'));

async function parse(file) {
    let barLine = console.draft()
      , parser  = new OsmPbfParser()
      , prim    = new Primitives()
      , reader  = fs.createReadStream(file);

    reader.pipe(parser).pipe(prim);

    let n = 0, w = 0, r = 0, prefix = 'Обработка данных osm: ';

    function progress() {
        barLine(chalk.yellow(prefix + n + '/' + w + '/' + r));
    }

    prim.on('node', (node) => {
        n += node.length; progress();
    });

    prim.on('way', (way) => {
        w += way.length; progress();
    });

    prim.on('relation', (relation) => {
        r += relation.length; progress();
    });

    prim.on('exit', () => {
        barLine(prefix + n + '/' + w + '/' + r + '. Готово!');
    });
}

(async () => {
    let file = __dirname + '/' + fname;

    await common.download('https://needgeo.com/data/current/region/RU/RU-SPE.pbf', file);
    await parse(file);
})();
