'use strict';

const path         = require('path')
    , store        = require('./store')
    , config       = require('./config')
    , express      = require('express')
    , session      = require('express-session')
    , bodyParser   = require('body-parser')
    , cookieParser = require('cookie-parser')
    , app          = express();

app.use('/js', browserify(__dirname + '/public/js'));
app.use('/css', browserify(__dirname + '/public/css'));
app.use('/lib', express.static(path.join(__dirname, './public/lib')));

app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, './public/view'));
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cookieParser());
app.use(session(config.get('session')));

app.listen(config.get('base:port'), function () {
  log.info('Сервер запущен. Порт: %s', config.get('base:port'));
});
