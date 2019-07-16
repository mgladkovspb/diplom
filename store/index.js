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
    return false;
}

async function empty() {
    return true;
}

async function writeNodes(data) {
    let collection = db.collection('nodes')
      , ops        = [];
    // data.forEach(item => {
    //     ops.push({
    //         updateOne: {
    //             filter: { _id: item.id },
    //             update: { $set: { vertice: item.vertice, geom: item.geom } },
    //             upsert: true
    //         }
    //     });
    // });
    // await collection.bulkWrite(ops, { ordered: false });
    await collection.insertMany(data);
} 

async function writeWays(data) {
    let collection = db.collection('ways')
      , ops        = [];
    // data.forEach(item => {
    //     ops.push({
    //         updateOne: {
    //             filter: { _id: item.id },
    //             update: { $set: { refs: item.refs } },
    //             upsert: true
    //         }
    //     });
    // });
    // await collection.bulkWrite(ops, { ordered: false });
    await collection.insertMany(data);
}

async function buildVertices() {
    let ways    = db.collection('ways')
      , nodes   = db.collection('nodes')
      , count   = 0
      , barLine = console.draft()
      , ops     = [];

    barLine('  > ' + chalk.yellow('Обработка вершин: ') + chalk.green(count));
    let ids = [];
    //let v = await ways.aggregate([{$project:{vertice:{$arrayElemAt:['$refs', 0]}}}]).toArray();
    await ways.find({}).forEach(item => {
        // ops.push({
        //     updateOne: {
        //         filter: { _id: item.refs[0] },
        //         update: { $set: { vertice: true } },
        //     }
        // });
        ids.push(item.refs[0]);
        barLine('  > ' + chalk.yellow('Обработка вершин: ') + chalk.green(++count));
    });

    nodes.updateMany({ _id : { $in : ids } }, { $set: { vertice: true } });
    
    //console.log(await nodes.find({ _id : { $in : ids } }).count());
    //await nodes.bulkWrite(ops, { ordered: false });
}

module.exports.writeNodes = writeNodes;
module.exports.writeWays  = writeWays;
module.exports.buildVertices = buildVertices;
module.exports.connect    = connect;
module.exports.clean      = clean;
module.exports.close      = close;
module.exports.exists     = exists;
module.exports.empty      = empty;