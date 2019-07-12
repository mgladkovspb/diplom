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

function parse(message, file) {
    return new Promise((resolve, reject) => {
        let barLine = console.draft()
          , parser  = new OsmPbfParser()
          , prim    = new Primitives()
          , reader  = fs.createReadStream(file);

        reader.pipe(parser).pipe(prim);

        let n = 0, w = 0, r = 0;

        function progress() {
            barLine(message + chalk.yellow(n + '/' + w + '/' + r));
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

        prim.on('finish', () => {
            barLine(message + chalk.yellow(n + '/' + w + '/' + r) + chalk.green('. Готово!'));
            resolve();
        });
    });
}

(async () => {
    let file = __dirname + '/' + fname;

    try {
        await common.download(
            ' > ' + chalk.cyan('Загрузка '), 
            'https://needgeo.com/data/current/region/RU/RU-SPE.pbf', 
            file
        );
        await parse(
            ' > ' + chalk.cyan('Обработка данных osm '), 
            file
        );
        console.log(chalk.green('Готово!'));
    } catch(error) {
        console.log(error.message);
    }
})();