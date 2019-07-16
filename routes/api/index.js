'use strict';

const store = require('../../store');

module.exports = function(app) {
    app.post('/api/calc', (req, res) => {
        res.send();
    });

    app.get('/api/vertices', async (req, res) => {
        let fc = { 
            type: "FeatureCollection",
            features: []
        };

        fc.features = await store.getVertices();

        res.send(JSON.stringify(fc));
    });
}
