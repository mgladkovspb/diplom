var Transform = require('stream').Transform
  , util = require('util');

module.exports = OsmXmlParser;

function OsmXmlParser() {
  Transform.call(this);
}

util.inherits(OsmXmlParser, Transform);

OsmXmlParser.prototype._transform = function(chunk, encoding, done) {
  done();
}
