'use strict';

const createGraph = require('ngraph.graph')
    , path        = require('ngraph.path')
    , chalk       = require('chalk')
    , store       = require('../../store');

let graph;

module.exports = function(app) {
    app.post('/api/calc', (req, res) => {
        if(graph === undefined) {
            loadGraph();
            return res.end();
        }

        findPath(req.body.start, req.body.finish).then(data => {
            let fc = { 
                type: "FeatureCollection",
                features: []
            };

            fc.features = data;
            res.send(JSON.stringify(fc));
        })
    });

    app.get('/api/vertices', async (req, res) => {
        // let fc = { 
        //     type: "FeatureCollection",
        //     features: []
        // };

        // fc.features = await store.getVertices();

        // res.send(JSON.stringify(fc));
        res.end();
    });
}

function loadGraph() {
    store.getGraph().then(data => {
        graph = createGraph();
        data.forEach(element => {
            graph.addLink(
                element.from, 
                element.to, 
                element.data);
        });
    }).catch(error => {
        graph = undefined;
        console.log(chalk.red(error.message));
    });
}

/*
TODO:
Доделать поиск
*/
async function findPath(start, finish) {
    return new Promise((resolve, reject) => {
        // let pathFinder = path.aStar(graph)
        //   , from       = await store.getWayIdFromPoint(start)
        //   , to         = await store.getWayIdFromPoint(finish)
        //   , foundPath  = pathFinder.find(from, to);

        resolve([]);
    });
}