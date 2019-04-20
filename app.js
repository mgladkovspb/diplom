'use strict';

/*
    Параметры командной строки DEMO режим
    --demo, --demo=true/false - включает выключает демо режим
    --data-transfer-period=10 - период передачи данных трекером в секундах. по умолчанию 10
*/
const DraftLog = require('draftlog')
    , config   = require('./config');

DraftLog(console);

if(config.get('demo') === true) {
    require('./demo')();
}

process.stdin.resume();

