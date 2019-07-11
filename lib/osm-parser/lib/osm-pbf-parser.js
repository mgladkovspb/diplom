'use strict';

var proto = require('./proto')
  , Transform = require('stream').Transform
  , util = require('util');

module.exports = OsmPbfParser;
util.inherits(OsmPbfParser, Transform);

let BlockType = {
    SIZE: 0,
    HEADER: 1,
    BLOB: 2
}

function OsmPbfParser() {
    var options = {
        objectMode: true
    };

    Transform.call(this, options);

    this._buffer = null;
    this._needed = 4;
    this._pushNext = false;
    this._type = BlockType.SIZE;
}

OsmPbfParser.prototype._transform = function(chunk, encoding, done) {
    if(this._buffer) {
        chunk = Buffer.concat([this._buffer, chunk]);
        this._buffer = null;
    }

    if(chunk.length < this._needed) {
        this._buffer = chunk;
        return done();
    }

    switch(this._type) {
        case BlockType.SIZE:
            var len = chunk.readUInt32BE(0);
            this._needed = len;
            this._type = BlockType.HEADER;
            this._transform(chunk.slice(4), encoding, done);
            break;
        case BlockType.HEADER:
            var header = proto.fileFormat.BlobHeader.decode(chunk.slice(0, this._needed));
            chunk = chunk.slice(this._needed);
            if(header.type === 'OSMData') {
                this._pushNext = true;
            } else {
                this._pushNext = false;
            }
            this._needed = header.datasize;
            this._type = BlockType.BLOB;
            this._transform(chunk, encoding, done);
            break;
        case BlockType.BLOB:
            if(this._pushNext) {
                var blob = proto.fileFormat.Blob.decode(chunk.slice(0, this._needed));
                this.push({
                    type: 'zlib',
                    data: blob.zlib_data
                });
            }

            chunk = chunk.slice(this._needed);
            this._needed = 4;
            this._type = BlockType.SIZE;
            this._transform(chunk, encoding, done);
            break;
    }
}
