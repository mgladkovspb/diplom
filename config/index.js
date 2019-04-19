'use strict';

const nconf = require('nconf')
    , path  = require('path');

nconf.argv()
    .env()
    .file('base', { file: path.join(__dirname, 'base.json') });

nconf.file('db', { file: path.join(__dirname, 'db.json') });
nconf.file('service', { file: path.join(__dirname, 'service.json') });
//nconf.file('trackers', { file: path.join(__dirname, 'trackers.json') });

module.exports = nconf;