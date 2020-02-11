require = require("esm")(module/*, options*/);

var createError = require('http-errors');
var express = require('express');
var hbs = require('hbs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var entriesRouter = require('./routes/entries');
var revisionsRouter = require('./routes/revisions');
var variantsRouter = require('./routes/variants');
var variantRouter = require('./routes/variant');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'partials'));
hbs.registerHelper("uriencode", encodeURIComponent);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/entries', entriesRouter);
app.use('/revisions', revisionsRouter);
app.use('/variants', variantsRouter);
app.use('/variant', variantRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Burrito setup
const fse = require('fs-extra');

const bs = require("../fs_burrito_store.js");
app.__burrito = {
    "store": new bs.FSBurritoStore({
	"storeClass": "FSBurritoStore"
    })};
const variantJSON = JSON.parse(fse.readFileSync(path.join("..","test", "test_data", "metadata", "textTranslation.json"), "utf8"));
app.__burrito.store.importFromObject(variantJSON);

//

module.exports = app;

