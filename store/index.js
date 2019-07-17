'use strict';

const chalk       = require('chalk')
    , MongoClient = require('mongodb').MongoClient
    , config      = require('../config')
    , client      = new MongoClient(config.get('db:url'), { useNewUrlParser: true });

let db;

async function connect() {
    console.log('* ' + chalk.cyan('Подключение к базе данных...'));
    try {
        await client.connect();
        db = client.db(config.get('db:dbname'));
    } catch(error) {
        console.log(chalk.red(error.message));
    }
}

async function close() {
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

function getGraph() {
    let collection = db.collection('graph');
    return collection.find({});
}

module.exports.writeOsm   = writeOsm;
module.exports.writeGraph = writeGraph;
module.exports.getGraph   = getGraph;
module.exports.connect    = connect;
module.exports.clean      = clean;
module.exports.close      = close;
module.exports.empty      = empty;