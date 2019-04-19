'use strict';

const fs     = require('fs')
    , chalk  = require('chalk')
    , wkx    = require('wkx')
    , config = require('../config');

class Tracker {
    constructor(id) {
        this._id      = id;
        this._tag     = '[' + this._id + ']';
        this._points  = [];
        this._barline = console.draft('');

        this._init();
    }

    _init() {
        this._barline(this._tag, chalk.yellow('Загрузка трека...'));
        fs.readFile('./demo/' + this._id + '.geojson', 'utf8', (error, content) => {
            if(error)
                return this._barline(this._tag, chalk.red('Ошибка загрузки трека...'));

            try {
                let message  = '',
                geo      = JSON.parse(content),
                // TODO
                // поступают 2 типа, linestring b multilinestring. Нужно привести к одному типу.
                geometry = wkx.Geometry.parseGeoJSON(geo.features[0].geometry);

                this._points = geometry.lineStrings[0].points;
                message = chalk.green('Загружено ' + this._points.length + ' точек...');
                this._barline(this._tag, message);
            } catch(e) {
                this._barline(this._tag, chalk.red('Ошибка загрузки трека...'));
            }
        });
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