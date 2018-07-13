var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var path = require('path');

global.appPath = path.dirname(require.main.filename).replace(new RegExp('/bin$'),"");

var app = express();
// remove http header
app.disable('x-powered-by');
// log http request
app.use(morgan('\x1b[32minfo\x1b[0m: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]', {
  skip: function (req, res) { return res.statusCode < 400 && req.originalUrl != "/"; }
}));

//===============MONGODB=================
// configure mongo database
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
// retrieve mongodb parameters from config file
var mongoConfig = require('./config').mongoConfig;
global.db = mongoose.connection;

db.on('error', console.error.bind(console, '\x1b[31mERROR\x1b[0m: unable to connect to mongoDB on ' + mongoConfig.host + ' server'));
db.once('open', function () {
  console.info("\x1b[32minfo\x1b[0m:", "Connected to mongoDB on " + mongoConfig.host + " server");
  const refreshToken = require("./bin/refreshAcsToken").auto();
});

// connect to mongodb
mongoose.connect('mongodb://' + mongoConfig.host + '/' + mongoConfig.base);


//===============APP=================
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(bodyParser.json({ limit: '1mb' }));
// express-session parameters:
// save sessions into mongodb 
app.use(session(
  {
    secret: 'T9QrskYinhvSyt6NUrEcCaQdgez3',
    resave: true,
    store: new MongoDBStore({
      uri: 'mongodb://' + mongoConfig.host + '/express-session',
      collection: 'get-a-key'
    }),
    rolling: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 60 * 1000 // 30 minutes
    },
    unset: "destroy"
  }
));

//===============PASSPORT=================
// passport is used to save authentication sessions
global.passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

//================ROUTES=================
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static('../bower_components'));


//===============ROUTES=================
//Customization
var custom = require('./routes/custom');
app.use('/custom/', custom);
//Azure AD
var azureAd = require('./routes/azureAd');
app.use('/aad/', azureAd);
//ADFS
var adfs = require('./routes/adfs');
app.use('/adfs/', adfs);
//Get a Key
var webApp = require('./routes/web-app');
app.use('/web-app/', webApp);
//API
var api = require('./routes/api');
app.use('/api/', api);
//API Auth Config
var api_auth = require('./routes/api.auth');
app.use('/api/auth/', api_auth);
//Admin
var admin = require('./routes/admin');
app.use('/admin/', admin);
// Login and Logout 
var login = require('./routes/login');
app.use('/', login);
//Otherwise
app.get("*", function (req, res) {
  res.redirect("/web-app/");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      stack: err
    });
    console.log(err);
  });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    if (err.status == 404) err.message = "The requested url " + req.originalUrl + " was not found on this server.";
    res.status(err.status || 500);
    res.render('error', {
      status: err.status,
      message: err.message,
      stack: {}
    });
  });
}

module.exports = app;
