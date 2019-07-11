'use strict';

const DraftLog = require('draftlog')
    , chalk    = require('chalk')
    , http     = require('https')
    , fs       = require('fs');

function ProgressBar(prefix = '', progress) {
    progress = Math.min(100, progress)

    let units = Math.round(progress / 2)
    return chalk.green(prefix) + chalk.dim('[') + chalk.blue('=').repeat(units) + ' '.repeat(50 - units) + chalk.dim('] ') + chalk.yellow(progress + '%')
}

async function download(source, dest) {
    DraftLog.into(console);

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
            return;
        });

        response.on('error', (error) => {
            throw new Error(error.message);
        });
    });

    request.on('error', (error) => {
        throw new Error(error.message);
    });
}

module.exports.download = download;

// (async() => {
//     await download('https://needgeo.com/data/current/region/RU/RU-SPE.pbf', 'RU-SPE.pbf');
// })();
 