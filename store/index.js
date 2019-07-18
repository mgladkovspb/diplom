'use strict';

const chalk       = require('chalk')
    , MongoClient = require('mongodb').MongoClient
    , config      = require('../config')
    , client      = new MongoClient(config.get('db:url'), { useNewUrlParser: true });

let db;

function isConnected() {
    return !!client && !!client.topology && client.topology.isConnected()
}

async function connect() {
    if(isConnected())
        return;

    console.log('* ' + chalk.cyan('Подключение к базе данных...'));
    try {
        await client.connect();
        db = client.db(config.get('db:dbname'));
    } catch(error) {
        console.log(chalk.red(error.message));
    }
}

async function close() {
    if(!isConnected())
        return;

    console.log('* ' + chalk.cyan('Отключение от базы данных...'));
    try {
        await client.close();
    } catch(error) {
        console.log(chalk.red(error.message));
    }
}

async function clean() {
    let osm   = db.collection('osm')
      , graph = db.collection('graph');

    console.log('* ' + chalk.cyan('Очистка базы данных...'));
    try {
        console.log('  > ' + chalk.yellow('Очистка коллекции osm.'));
        await osm.deleteMany({}, { justOne: false }); 
        console.log('  > ' + chalk.yellow('Очистка коллекции graph.'));
        await graph.deleteMany({}, { justOne: false }); 
    } catch(error) {
        console.log(chalk.red(error.message)); 
    }
}

async function empty() {
    let collection = db.collection('graph');
    return await collection.find({}).count() === 0;
}

async function writeOsm(data) {
    let collection = db.collection('osm');
    await collection.insertMany(data);
}

async function writeGraph(data) {
    let collection = db.collection('graph');
    await collection.insertMany(data);
}

async function getGraph() {
    let collection = db.collection('graph');
    return collection.find({}).toArray();
}

async function create2dIndex() {
    let collection = db.collection('osm');
    await collection.createIndex( { 'vertice.geometry' : '2dsphere' } );
}

async function findEdgesByPoint(point) {
    let collection = db.collection('osm')
      , result     = await collection.find({ 
        'vertice.geometry': { 
            $near: { 
                $geometry: point, 
                $maxDistance: 500 
            } 
        } 
    }).toArray();
    return result.length === 0 ? undefined : result[0]._id;
}

async function getEdges(filter) {
    let collection = db.collection('osm')
    return await collection.find({ _id: { $in : filter } }).toArray();
}

module.exports.create2dIndex    = create2dIndex;
module.exports.writeOsm         = writeOsm;
module.exports.writeGraph       = writeGraph;
module.exports.getGraph         = getGraph;
module.exports.getEdges         = getEdges;
module.exports.findEdgesByPoint = findEdgesByPoint;
module.exports.connect          = connect;
module.exports.clean            = clean;
module.exports.close            = close;
module.exports.empty            = empty;