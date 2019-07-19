'use strict';

const path         = require('path')
    , chalk        = require('chalk')
    , store        = require('./store')
    , config       = require('./config')
    , express      = require('express')
    , session      = require('express-session')
    , bodyParser   = require('body-parser')
    , cookieParser = require('cookie-parser')
    , app          = express();

app.use('/js',  express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/lib', express.static(path.join(__dirname, './public/lib')));

app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, './public/view'));
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cookieParser());
app.use(session(config.get('session')));

app.listen(config.get('base:port'), async () => {
    console.log(chalk.cyan('Сервер запущен. Порт: ') + ' ' + chalk.green(config.get('base:port')));
    await store.connect();

    require('./routes')(app);

    let empty = await store.empty();
    if(empty) {
        console.log();
        const child = require('child_process');
        child.fork(`${__dirname}/load-osm.js`);
    }
});