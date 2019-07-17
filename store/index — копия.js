'use strict';

const chalk       = require('chalk')
    , MongoClient = require('mongodb').MongoClient
    , config      = require('../config')
    , client      = new MongoClient(config.get('db:url'), { useNewUrlParser: true });

let db;

async function connect() {
    let barLine = console.draft();
    barLine('* ' + chalk.cyan('Подключение к базе данных...') + chalk.yellow(' Выполнение.'));
    try {
        await client.connect();
        db = client.db(config.get('db:dbname'));
        barLine('* ' + chalk.cyan('Подключение к базе данных...') + chalk.green(' Ok.'));
    } catch(error) {
        barLine('* ' + chalk.cyan('Подключение к базе данных...') + chalk.red(' Error.'));
        console.log(chalk.red(error.message));
    }
}

async function close() {
    let barLine = console.draft();
    barLine('* ' + chalk.cyan('Отключение от базы данных...') + chalk.yellow(' Выполнение.'));
    try {
        await client.close();
        barLine('* ' + chalk.cyan('Отключение от базы данных...') + chalk.green(' Ok.'));
    } catch(error) {
        console.log(chalk.red(error.message));
    }
}

async function clean() {
    let barLine = console.draft()
      , nodes   = db.collection('nodes')
      , ways    = db.collection('ways');

    barLine('* ' + chalk.cyan('Очистка базы данных...') + chalk.yellow(' Выполнение.'));
    try {
        console.log('  > ' + chalk.yellow('Очистка коллекции точек.'));
        await nodes.deleteMany({}, { justOne: false }); 
        console.log('  > ' + chalk.yellow('Очистка коллекции линий.'));
        await ways.deleteMany({}, { justOne: false }); 
        barLine('* ' + chalk.cyan('Очистка базы данных...') + chalk.green(' Ok.'));
    } catch(error) {
        console.log(chalk.red(error.message)); 
    }
}

async function exists() {
    return true;
}

async function empty() {
    return false;
}

async function writeNodes(data) {
    let collection = db.collection('nodes');
    await collection.insertMany(data);
} 

async function writeWays(data) {
    let collection = db.collection('ways');
    await collection.insertMany(data);
}

async function buildVertices() {
    let ways    = db.collection('ways')
      , nodes   = db.collection('nodes')
      , count   = 0
      , barLine = console.draft()
      , ids     = [];

    barLine('  > ' + chalk.yellow('Обработка вершин: ') + chalk.green(count));
    await ways.find({}).forEach(item => {
        ids.push(item.refs[0]);
        barLine('  > ' + chalk.yellow('Обработка вершин: ') + chalk.green(++count));
    });

    await nodes.updateMany({ _id : { $in : ids } }, { $set: { vertice: true } });
}

async function wayEnding() {
    let ways   = db.collection('ways')
      , result = await ways.find({}, { refs: {$slice: -1}}).toArray();
    return result;
}

async function wayIntersections(point) {
    let ways   = db.collection('ways')
      , result = await ways.find({ 'refs.0': point }).toArray()
    return result;
}

async function getVertices() {
    let nodes = db.collection('nodes');
    return await nodes.find({ vertice: true }).toArray();
}

module.exports.writeNodes       = writeNodes;
module.exports.writeWays        = writeWays;
module.exports.buildVertices    = buildVertices;
module.exports.getVertices      = getVertices;
module.exports.wayEnding        = wayEnding;
module.exports.wayIntersections = wayIntersections;
module.exports.connect          = connect;
module.exports.clean            = clean;
module.exports.close            = close;
module.exports.exists           = exists;
module.exports.empty            = empty;