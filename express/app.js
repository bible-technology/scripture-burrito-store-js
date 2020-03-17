require = require("esm")(module/*, options*/);

var createError = require('http-errors');
var express = require('express');
var fileUpload = require('express-fileupload');
var hbs = require('hbs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var entriesRouter = require('./routes/entries');
var revisionsRouter = require('./routes/revisions');
var variantsRouter = require('./routes/variants');
var variantRouter = require('./routes/variant');
var metadataRouter = require('./routes/metadata');
var uploadMetadataRouter = require('./routes/upload/metadata');
var twoLevelRouter = require('./routes/twolevel');
var revisionsvariantsRouter = require("./routes/revisionsvariants");
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'partials'));
app.set('json spaces', 4);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.use('/', indexRouter);
app.use('/twolevel', twoLevelRouter);
app.use('/entries', entriesRouter);
app.use('/revisions', revisionsRouter);
app.use('/variants', variantsRouter);
app.use('/revisionsvariants', revisionsvariantsRouter);
app.use('/variant', variantRouter);
app.use('/metadata', metadataRouter);
app.use('/upload/metadata', uploadMetadataRouter);
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
  "store": new bs.FSBurritoStore(
    {
	"storeClass": "FSBurritoStore"
    },
    "some_burritos"
  )};

hbs.registerHelper(
    "keysInObject",
    function(ob) {
	return ob.length > 0;
    }
);
hbs.registerHelper("uriencode", encodeURIComponent);
hbs.registerHelper(
    "idServerNameOrId",
    function(idDetails, nameLang) {
	const lang = nameLang ? nameLang : "en";
	console.log(nameLang);
	if ("name" in idDetails) {
	    return idDetails["name"]["en"];
	} else {
	    return idDetails["id"];
	}
    }
);
hbs.registerHelper(
    "nameInLang",
    function(namesOb, lang) {
	return namesOb[lang];
    }
);
//

module.exports = app;

