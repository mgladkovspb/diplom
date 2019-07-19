'use strict';

const DraftLog = require('draftlog')
    , chalk = require('chalk')
    , http = require('https')
    , fs = require('fs');

DraftLog(console);

function ProgressBar(prefix = '', progress) {
    progress = Math.min(100, progress)

    let units = Math.round(progress / 2)
    return prefix + chalk.dim('[') + chalk.blue('=').repeat(units) + ' '.repeat(50 - units) + chalk.dim('] ') + chalk.yellow(progress + '%')
}

function download(message, source, dest) {
    return new Promise((resolve, reject) => {
        let file = fs.createWriteStream(dest)
            , request = http.get(source)
            , barLine = console.draft();

        barLine(chalk.cyan('Ожидание...'));
        request.on('response', (response) => {
            let len = parseInt(response.headers['content-length'], 10)
                , downloaded = 0;

            response.on('data', (chunk) => {
                file.write(chunk);
                downloaded += chunk.length;
                barLine(ProgressBar(message, (100 * downloaded / len).toFixed(2)));
            });

            response.on('end', () => {
                barLine(ProgressBar(message, 100), chalk.green('Готово!'))
                file.end();
                resolve();
            });

            response.on('error', (error) => {
                reject(error);
            });
        });

        request.on('error', (error) => {
            reject(error);
        });
    });
}

class Observer {
    constructor() {
        this.observers = [];
    }

    subscribe(fn) {
        this.observers.push(fn);
    }

    unsubscribe(fn) {
        this.observers = this.observers.filter(subscriber => subscriber !== fn);
    }

    broadcast(data) {
        this.observers.forEach(subscriber => subscriber(data));
    }

    clean() {
        this.observers = [];
    }
}

module.exports.download = download; 
module.exports.Observer = Observer;