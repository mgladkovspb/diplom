'use strict';

var fs = require('fs');
var protobuf = require('protocol-buffers');

module.exports = {
    fileFormat: protobuf(fs.readFileSync(__dirname + '/proto/fileformat.proto', 'utf8')),
    osmMesage: protobuf(fs.readFileSync(__dirname + '/proto/osmformat.proto', 'utf8'))
};
