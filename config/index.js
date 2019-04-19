'use strict';

const nconf = require('nconf')
    , path  = require('path');

nconf.argv().env();
nconf.file('base', { file: path.join(__dirname, 'base.json') });
nconf.file('db', { file: path.join(__dirname, 'db.json') });

module.exports = nconf;