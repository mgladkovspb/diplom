'use strict';

const DraftLog     = require('draftlog')
    , fname        = 'RU-SPE.pbf'
    , chalk        = require('chalk')
    , fs           = require('fs')
    , OsmPbfParser = require('./lib/osm-parser').OsmPbfParser
    , Primitives   = require('./lib/osm-parser').Primitives
    , common       = require('./common');

DraftLog(console);
console.log(chalk.red('База данных пуста. Загрузка и обработка данных OSM ...'));

function parse(file) {
    return new Promise((resolve, reject) => {
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
            resolve();
        });
    });
}

(async () => {
    let file = __dirname + '/' + fname;

    try {
        console.log(chalk.yellow('Начали!'));
        await common.download('https://needgeo.com/data/current/region/RU/RU-SPE.pbf', file);
        await parse(file);
        console.log(chalk.green('Готово!'));
        console.log(chalk.green('Готово!'));
        console.log(chalk.green('Готово!'));
    } catch(error) {
        console.log(error.message);
    }
})();
