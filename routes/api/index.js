'use strict';

const createGraph = require('ngraph.graph')
    , path        = require('ngraph.path')
    , chalk       = require('chalk')
    , store       = require('../../store')
    , Observer    = require('../../common').Observer;

let readyObserver = new Observer()
  , ready = false
  , graph
  , timer;

loadGraph();

module.exports = function(app) {
    app.post('/api/calc', (req, res) => {
        let fc = { 
            type: "FeatureCollection",
            features: []
        };

        if(!ready) {
            return res.send(JSON.stringify(fc));
        }

        findPath(req.body.start, req.body.finish).then(data => {
            fc.features = data;
            res.send(JSON.stringify(fc));
        })
    });

    app.get('/api/ready', (req, res) => {
        if(ready) {
            return res.send(JSON.stringify({ ready: true }));
        } else {
            readyObserver.subscribe(() => {
                res.send(JSON.stringify({ ready: true }));
            });
        }
    });
}

async function loadGraph() {
    let empty = await store.empty()
      , data  = [];

    if(empty) {
        if(timer === undefined)
            timer = setInterval(loadGraph, 3000);
        return;
    }

    try {
        data  = await store.getGraph();
        graph = createGraph();
        data.forEach(element => {
            graph.addLink(
                element.from, 
                element.to, 
                element.data);
        });
    } catch(error) {
        graph = undefined;
        console.log(chalk.red(error.message));
    }
    
    if(graph !== undefined) {
        clearInterval(timer);
        ready = true;
        readyObserver.broadcast();
        readyObserver.clean();
    }

    // store.getGraph().then(data => {
    //     graph = createGraph();
    //     data.forEach(element => {
    //         graph.addLink(
    //             element.from, 
    //             element.to, 
    //             element.data);
    //     });
    //     readyObserver.broadcast();
    //     readyObserver.clean();
    // }).catch(error => {
    //     graph = undefined;
    //     console.log(chalk.red(error.message));
    // });
}

async function findPath(start, finish) {
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

    return edges.reduce((accumulator, currentValue) => {
        accumulator.push(currentValue.line);
        return accumulator;
    }, []);
}