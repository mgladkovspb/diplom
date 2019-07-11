'use strict';

const MongoClient = require('mongodb').MongoClient
    , config      = require('../config')
    , client      = new MongoClient(config.get('db:url'));

let db;

async function connect() {
    try {
        await client.connect();
        db = client.db(config.get('db:dbname'));
    } catch(e) {
        console.log(e);
    }
}

async function exists() {
    return false;
}

async function empty() {
    return true;
}

async function writePoints(data) {

} 

async function writeWays(data) {

}

async function writeVertices(data) {

}

async function writeToDataBase(collection, data) {

}

module.exports.exists = exists;
module.exports.empty  = empty;