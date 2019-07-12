'use strict';

const chalk = require('chalk')
    , http  = require('https')
    , fs    = require('fs');

function ProgressBar(prefix = '', progress) {
    progress = Math.min(100, progress)

    let units = Math.round(progress / 2)
    return chalk.green(prefix) + chalk.dim('[') + chalk.blue('=').repeat(units) + ' '.repeat(50 - units) + chalk.dim('] ') + chalk.yellow(progress + '%')
}

function makeRequest(source, dest) {
    return new Promise((resolve, reject) => {
        let file    = fs.createWriteStream(dest)
          , request = http.get(source)
          , barLine = console.draft();

        barLine(chalk.cyan('Ожидание...'));
        request.on('response', (response) => {
            let len        = parseInt(response.headers['content-length'], 10)
              , downloaded = 0;
    
            response.on('data', (chunk) => {
                file.write(chunk);
                downloaded += chunk.length;
                barLine(ProgressBar('Загрузка ', (100 * downloaded / len).toFixed(2)));
            });
    
            response.on('end', () => {
                barLine(ProgressBar('Загрузка ', 100), chalk.green('Готово!'))
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

async function download(source, dest) {
    let result = false;

    try {
        await makeRequest(source, dest);
        result = true;
    } catch(error) {
        console.log(error.message);
    }

    return result;
}

module.exports.download = download;

// (async() => {
//     await download('https://needgeo.com/data/current/region/RU/RU-SPE.pbf', 'RU-SPE.pbf');
// })();
 