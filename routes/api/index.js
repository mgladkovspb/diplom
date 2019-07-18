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

function findPath(start, finish) {
    return new Promise(async (resolve, reject) => {
        let pathFinder = path.aStar(graph)
          , from       = await store.findEdgesByPoint(start)
          , to         = await store.findEdgesByPoint(finish)
          , foundPath  = [];

        if(from !== undefined && to !== undefined)
            foundPath = pathFinder.find(from, to)

        let edges = await store.getEdges(foundPath.reduce((accumulator, currentValue) => {
            accumulator.push(currentValue.id);
            return accumulator;
        }, []));

        resolve(edges.reduce((accumulator, currentValue) => {
            accumulator.push(currentValue.line);
            return accumulator;
        }, []));
    });
}