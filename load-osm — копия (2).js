'use strict';

const DraftLog     = require('draftlog')
    , createGraph  = require('ngraph.graph')
    , chalk        = require('chalk')
    , fs           = require('fs')
    , OsmPbfParser = require('./lib/osm-parser').OsmPbfParser
    , Primitives   = require('./lib/osm-parser').Primitives
    , store        = require('./store')
    , common       = require('./common')
    , fname        = 'RU-SPE.pbf';

DraftLog(console);
console.log(chalk.red('Загрузка и обработка данных OSM ...'));

const roads = {
    motorway: '',
    trunk: '',
    primary: '',
    secondary: '',
    tertiary: '',
    unclassified: '',
    motorway_link: '',
    trunk_link: '',
    primary_link: '',
    secondary_link: '',
    tertiary_link: ''
}

function parse(file) {
    return new Promise((resolve, reject) => {
        let statusLine = console.draft()
          , nodeLine
          , wayLine
          , rLine
          , parser  = new OsmPbfParser()
          , prim    = new Primitives()
          , reader  = fs.createReadStream(file);

        reader.pipe(parser).pipe(prim);

        let n = 0, w = 0, r = 0;

        statusLine('* ' + chalk.cyan('Обработка данных OSM...') + chalk.yellow(' Выполнение.'));

        prim.on('node', async (node) => {
            let data = [];

            prim.pause();
            if(nodeLine === undefined)
                nodeLine = console.draft();

            node.forEach(item => {
                data.push({
                    _id: item.id,
                    type: 'Feature',
                    vertice: false,
                    geometry: {
                        type: 'Point',
                        coordinates: [item.lon, item.lat], 
                    }
                });
            });

            store.writeNodes(data);

            n += node.length;
            nodeLine('  > ' + chalk.yellow('Запись точек: ') + chalk.green(n));
            prim.resume();
        });

        prim.on('way', async (way) => {
            let data = [];
            prim.pause();
            if(wayLine === undefined)
                wayLine = console.draft();

            way.forEach(item => {
                if(roads[item.tags.highway] === undefined)
                    return;

                data.push({
                    _id: item.id,
                    refs : item.refs
                });
            });
            
            store.writeWays(data);
            
            w += data.length
            wayLine('  > ' + chalk.yellow('Запись линий: ') + chalk.green(w));
            prim.resume();
        });

        prim.on('relation', async (relation) => {
            if(rLine === undefined)
                rLine = console.draft();
            r += relation.length;
            rLine('  > ' + chalk.yellow('Обработка связей: ') + chalk.green(r));
        });

        prim.on('finish', () => {
            statusLine('* ' + chalk.cyan('Обработка данных OSM...') + chalk.green(' Ok.'));
            resolve();
        });
    });
}

async function buildGraph() {
    let statusLine = console.draft()
      , barLine = console.draft()
      , graph   = createGraph()
      , ending  = [];

    statusLine('* ' + chalk.cyan('Построение графа...') + chalk.yellow('Выполнение.'));
    ending = await store.wayEnding();
    for(let i = 0; i < ending.length; i++) {
        let item = ending[i]
          , ways = await store.wayIntersections(item.refs[0]);
        
        ways.forEach(way => {
            graph.addLink(item._id, way._id, { weight: 1 });
        });
        barLine('  > ' + chalk.yellow('Обработка линий: ') + chalk.green(i));
    };
    statusLine('* ' + chalk.cyan('Построение графа...') + chalk.green(' Ok.'));

    graph.forEachLink(function(link) {
        console.dir(link);
    });

    // let path = require('ngraph.path');
    // let pathFinder = path.aStar(graph);
    // let foundPath = pathFinder.find(49706057, 4454689);
    // console.log('%o', foundPath);
}

(async () => {
    let file = __dirname + '/' + fname;

    try {
        // await common.download(
        //     '* ' + chalk.cyan('Загрузка '), 
        //     'https://needgeo.com/data/current/region/RU/RU-SPE.pbf', 
        //     file
        // );

        await store.connect();
        // await store.clean();
        // await parse(file);
        // await store.buildVertices();
        await buildGraph();
        if(!module.parent)
            await store.close();
        console.log(chalk.green('Готово!'));
    } catch(error) {
        console.log(error.message);
    }
})();

// запросы для построения графа

/* 
выбрать все документы с последним элементом массива
db.ways.find({}, { refs: {$slice: -1}});
*/

/* 
выбрать все документы, где первый элемент массива равен значению
db.ways.find({ 'refs.0': 230424 });
*/