'use strict';

const DraftLog     = require('draftlog')
    , mongoClient  = require('mongodb').MongoClient
    , fname        = 'RU-SPE.pbf'
    , chalk        = require('chalk')
    , fs           = require('fs')
    , OsmPbfParser = require('./lib/osm-parser').OsmPbfParser
    , Primitives   = require('./lib/osm-parser').Primitives
    , common       = require('./common');

DraftLog(console);
console.log(chalk.red('База данных пуста. Загрузка и обработка данных OSM ...'));

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

let nodes = new Map(), ways = new Map(), r = 0;

function parse(message, file) {
    return new Promise((resolve, reject) => {
        let barLine = console.draft()
          , parser  = new OsmPbfParser()
          , prim    = new Primitives()
          , reader  = fs.createReadStream(file);

        reader.pipe(parser).pipe(prim);

        function progress() {
            barLine(message + chalk.yellow(nodes.size + '/' + ways.size + '/' + r));
        }

        prim.on('node', (node) => {
            //prim.pause();
            node.reduce((output, current) => {
                nodes.set(current.id, {
                    _id  : current.id,
                    vertice: false,
                    geom : {
                        type: 'point',
                        coordinates: [current.lon, current.lat], 
                    }
                });
                return output;
            }, nodes); 

            progress();
            //prim.resume();
        });

        prim.on('way', (way) => {
            //prim.pause();
            way.reduce((output, current) => {
                if(roads[current.tags.highway] !== undefined)
                    output.set(current.id, { 
                        _id  : current.id,
                        refs : current.refs 
                    });
                return output;
            }, ways);

            progress();
            //prim.resume();
        });

        prim.on('relation', (relation) => {
            r += relation.length; progress();
        });

        prim.on('finish', () => {
            barLine(message + chalk.yellow(nodes.size + '/' + ways.size + '/' + r) + chalk.green('. Готово!'));
            resolve();
        });
    });
}

function markPointAsVertice() {
    let vertices = 0
      , barLine  = console.draft();

    ways.forEach(function(value, key) {
        let pt = nodes.get(value.refs[0]);
        if(pt !== undefined) {
            pt.vertice = true;
            vertices++;
        }
        barLine(' > ' + chalk.cyan('Подготовка вершин: ') + chalk.yellow(vertices));
    });
}

async function writeToDataBase(collection, data, size = 1000) {
    let barLine = console.draft('');

    try { await collection.deleteMany({}, { justOne: false }); } catch(e) {}
    while(data.length > 0) {
        try {
            barLine(chalk.cyan('   * ') + chalk.blue('Запись данных: ') + chalk.yellow(data.length));
            await collection.insertMany(data);
        } catch(error) {
            console.log(error);
        }
    }
}

async function writePoints(db) {
    let barLine    = console.draft('')
      , count      = 0
      , collection = db.collection('nodes');

    barLine(' > ' + chalk.red('Очистка таблицы...'));
    try { await collection.deleteMany({}, { justOne: false }); } catch(e) {}
    //await writeToDataBase(collection, Array.from(nodes.values()));
    for (let value of nodes.values()) {
        collection.insert(value);
        count++;
        barLine(' > ' + chalk.cyan('Запись точек: ') + chalk.yellow(count));
    }
}

async function writeWays() {
    let barLine    = console.draft('')
      , collection = db.collection('ways');

    barLine(' > ' + chalk.cyan('Запись линий...'));
    await writeToDataBase(collection, Array.from(ways.values()));
}

function saveData() {
    return new Promise((resolve, reject) => {
        let barLine = console.draft('')
          , url     = 'mongodb://localhost:27017';

        barLine(chalk.green('Запись данных в локальную базу...'));
        mongoClient.connect(url, { useNewUrlParser: true }, async (error, client) => {
            if (error) {
                return reject(error);
            }

            let db = client.db('routing');

            await writePoints(db);
            //await writeWays(db);

            client.close();
            resolve();
        });
    });
}

(async () => {
    let file = __dirname + '/' + fname;

    try {
        // await common.download(
        //     ' > ' + chalk.cyan('Загрузка '), 
        //     'https://needgeo.com/data/current/region/RU/RU-SPE.pbf', 
        //     file
        // );
        await parse(
            ' > ' + chalk.cyan('Обработка данных osm '), 
            file
        );
        markPointAsVertice();
        await saveData();
        console.log(chalk.green('Готово!'));
    } catch(error) {
        console.log(error.message);
    }
})();