'use strict';

var template_engine = 'dust'; 
var domain = 'localhost';

/* ========================================================== 
External Modules/Packages Required
============================================================ */
var express = require('express'); 
var routes = require('./routes');
var http = require('http');
var path = require('path');
var flash = require('connect-flash');
var fs = require('fs');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var session = require('express-session');
var store = new session.MemoryStore;
var compression = require('compression');
var colours = require('colors');
//var favicon = require('serve-favicon');

/* ========================================================== 
Create a new application with Express
============================================================ */
var app = express();


// Configuration
try {
    var configJSON = fs.readFileSync(__dirname + "/config.json");
    var config = JSON.parse(configJSON.toString());
} 
catch(e) {
    console.error("File config.json not found or is invalid: " + e.message);
    process.exit(1);
}

routes.init(config);


if ( template_engine == 'dust' ) {
	var dust = require('dustjs-linkedin'),
		cons = require('consolidate');
	app.engine('dust', cons.dust);
} 


/*========================================================================
Session Config
Cannot read sid cookie in angular unless httpOnly = false (true is the default)
key - cookie name defaulting to connect.sid
======================================================================= */
var sessionConfig = {
    store: store, 
    key:'sid', 
    cookie: {httpOnly: false},
    secret:'secret',
    parser:cookieParser(),
    saveUninitialized: true,
    resave: true
};


app.set('template_engine', template_engine);
app.set('domain', domain);

app.set('port', config.port || 3000);
app.set('views', __dirname + '/views');

app.set('view engine', template_engine);


//app.use(favicon(__dirname + '/public/images/favicon.ico'));

app.use(compression());
app.use(logger('dev'));	
app.use(bodyParser.json());     //parse application/json
app.use(bodyParser.urlencoded({ 
	extended: true 
}));

app.use(session(sessionConfig));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());	


//development only
if (app.get('env') === 'development') {
	app.use(errorHandler());
	app.locals.inspect = require('util').inspect;
};


/*========================================================================
Routes
======================================================================= */
app.get('/', routes.index);

app.get('/signup', routes.signup);
app.post('/signup', routes.completesignup);

app.get('/signin', routes.signin);
app.post('/login', routes.dologin);
app.get('/signout', routes.signout);

app.get('/profile', routes.auth, routes.profile);
app.post('/profile', routes.auth, routes.updateprofile);

app.get('/order', routes.auth, routes.order);
app.get('/orderList', routes.auth, routes.orderList);
app.post('/orderConfirm', routes.auth, routes.orderconfirm);
app.get('/orderExecute', routes.auth, routes.orderExecute);


/* ========================================================== 
Start HTTP Server bind to port and Listen for connections
============================================================ */
http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " .green + app.get('port'));
});
