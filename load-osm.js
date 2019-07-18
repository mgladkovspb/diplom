'use strict';

const chalk        = require('chalk')
    , fs           = require('fs')
    , OsmPbfParser = require('./lib/osm-parser').OsmPbfParser
    , Primitives   = require('./lib/osm-parser').Primitives
    , store        = require('./store')
    , common       = require('./common')
    , fname        = 'RU-SPE.pbf';

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

let nodes = new Map()
  , ways  = new Map()
  , osm   = new Map()
  , r     = 0
  , graph = [];

function parse(file) {
    return new Promise((resolve, reject) => {
        let parser  = new OsmPbfParser()
          , prim    = new Primitives()
          , reader  = fs.createReadStream(file);

        reader.pipe(parser).pipe(prim);

        console.log('* ' + chalk.cyan('Обработка данных OSM.'));

        prim.on('node', async (node) => {
            prim.pause();

            if(nodes.size === 0)
                console.log('  > ' + chalk.yellow('Точки.'));

            node.forEach(item => {
                nodes.set(item.id, [item.lon, item.lat]);
            }); 

            prim.resume();
        });

        prim.on('way', async (way) => {
            prim.pause();
            
            if(ways.size === 0)
                console.log('  > ' + chalk.yellow('Линии.'));

            way.forEach(item => {
                if(roads[item.tags.highway] === undefined)
                    return;
                ways.set(item.id, item.refs);
            });

            prim.resume();
        });

        prim.on('relation', async (relation) => {
            if(r === 0)
                console.log('  > ' + chalk.yellow('Связи.'));
            r += relation.length;
        });

        prim.on('finish', () => {
            resolve();
        });
    });
}

function getPointAsGeoJSON(id) {
    let pt = nodes.get(id);
    return {
        id: id,
        type: "Feature",
        geometry: {
            type: "Point", 
            coordinates: [...pt]
        }
    }
}

function getPointAsCoord(id) {
    return [...nodes.get(id)];
}

function buildOsmData() {
    let peek = (a) => a[a.length - 1];
    console.log('* ' + chalk.cyan('Подготовка данных OSM.'));

    console.log('  > ' + chalk.yellow('Структурирование.'));
    ways.forEach((refs, key) => {
        let obj = {
            _id: key,
            vertice: getPointAsGeoJSON(refs[0]),
            neighbors: [],
            line: {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: []
                }
            },
            points: {
                first: refs[0],
                last: peek(refs)
            }
        };

        for(let i = 0; i < refs.length; i++) {
            obj.line.geometry.coordinates.push(
                getPointAsCoord(refs[i])
            );
        }

        osm.set(key, obj);
    });

    // Очистить точки, линии. Сырые данные больше не нужны.
    nodes.clear();
    ways.clear();

    console.log('  > ' + chalk.yellow('Поиск соседей.'));
    for(let obj of osm.values()) {
        obj.neighbors = neighbors(obj.points.last);
    };

    console.log('  > ' + chalk.yellow('Подготовка графа.'));
    for(let obj of osm.values())
        for(let i = 0; i < obj.neighbors.length; i++)
            graph.push({
                from: obj._id, 
                to: obj.neighbors[i], 
                data: { weight: 1 }
            });
}

function neighbors(point) {
    let result = [];
    osm.forEach((obj, key) => {
        if(obj.points.first === point)
            result.push(key);
    });
    return result;
}

(async () => {
    let file = __dirname + '/' + fname;

    try {
        await common.download(
            '* ' + chalk.cyan('Загрузка '), 
            'https://needgeo.com/data/current/region/RU/RU-SPE.pbf', 
            file
        );

        await store.connect();
        await store.clean();
        await parse(file);
        buildOsmData();
        console.log('* ' + chalk.cyan('Запись в базу данных.'));
        console.log('  > ' + chalk.yellow('Osm.'));
        await store.writeOsm(Array.from(osm.values()));
        console.log('  > ' + chalk.yellow('Граф.'));
        await store.writeGraph(graph);
        console.log('  > ' + chalk.yellow('2D index.'));
        await store.create2dIndex();
        await store.close();
        console.log(chalk.green('Готово!'));
    } catch(error) {
        console.log(error.message);
    }
})();