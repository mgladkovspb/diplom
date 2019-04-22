'use strict';

const fs     = require('fs')
    , chalk  = require('chalk')
    , config = require('../config');

class Tracker {
    constructor(id) {
        this._id       = id;
        this._tag      = '[' + this._id + ']';
        this._points   = [];
        this._barline  = console.draft('');
        this._index    = 0;
        this._interval = config.get('data-transfer-period') || 1;

        this._init();
    }

    _init() {
        this._barline(this._tag, chalk.yellow('Загрузка трека...'));
        fs.readFile('./demo/' + this._id + '.geojson', 'utf8', (error, content) => {
            if(error)
                return this._barline(this._tag, chalk.red('Ошибка загрузки трека...'));

            try {
                let message  = '';
                this._loadpoints(content);
                message = chalk.green('Загружено ' + this._points.length + ' точек...');
                this._barline(this._tag, message);
            } catch(e) {
                this._barline(this._tag, chalk.red('Ошибка загрузки трека...'));
            }

            if(this._points.length > 0) {
                setInterval(() => { 
                    this._transmit()
                }, this._interval * 1000);
            }
        });
    }

    _loadpoints(geojson) {
        let geometry = JSON.parse(geojson);

        switch(geometry.type) {
            case 'LineString': 
                this._points = geometry.coordinates; 
                break;
            case 'MultiLineString':
                for(let i = 0; i < geometry.coordinates.length; i++)
                    this._points = this._points.concat(geometry.coordinates[i]); 
                break;
        }
    }

    _transmit() {
        let message  = '';

        if(this._index === this._points.length) {
            this._index = 0;
        }

        message = chalk.green('(' + this._index + '/' + this._points.length + ')');
        message += ' LAT: ' + this._points[this._index][0] + ' LNG: ' + this._points[this._index][1]; 
        this._barline(this._tag, message);

        this._index++;
    }
}

let trackers = [
    '5cb96bb623d61302f837af3c',
    '5cb96bf20870b9afedeea832',
    '5cb96bfe543d55fc014c0545',
    '5cb96c0b2a31fc0f2cdc173c',
    '5cb96c2d4a9af2184fe744fa',
    '5cb96c38f759f80178e4634d',
    '5cb96c4664a329c08e7eb0b1',
    '5cb96c527ed99ef229e08f02',
    '5cb96c5a2cfa3593d80e4563',
    '5cb96c6c4e04df9e2ddd686e'
];

let users = [
    {
        id: '5cb96ce14299d1251b94ef71',
        name: 'Luke Skywalker',
        email: 'luke-skywalker@mega.ru',
        password: 'luke-skywalker',
        demo: true,
        trackers: [
            '5cb96bb623d61302f837af3c',
            '5cb96bf20870b9afedeea832',
            '5cb96bfe543d55fc014c0545'
        ]
    },
    {
        id: '5cb97029bfd3711f0dc63ae7',
        name: 'Leia Organa',
        email: 'leia-organa@mega.ru',
        password: 'leia-organa',
        demo: true,
        trackers: [
            '5cb96c0b2a31fc0f2cdc173c',
            '5cb96c2d4a9af2184fe744fa'
        ]
    },
    {
        id: '5cb970352bb3dfe4cba1505a',
        name: 'Darth Vader',
        email: 'darth-vader@mega.ru',
        password: 'darth-vader',
        demo: true,
        trackers: [
            '5cb96c38f759f80178e4634d',
            '5cb96c4664a329c08e7eb0b1',
            '5cb96c527ed99ef229e08f02',
            '5cb96c5a2cfa3593d80e4563',
            '5cb96c6c4e04df9e2ddd686e'
        ]
    }
];

module.exports = () => {
    let len = trackers.length;
    console.log(chalk.yellow('* DEMO TRACKERS (%s)'), len);
    
    for(let i = 0; i < len; i++) {
        let tracker = new Tracker(trackers[i]);
    }
}