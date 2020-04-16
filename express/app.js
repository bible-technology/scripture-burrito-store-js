require = require('esm')(module/* , options */);

const createError = require('http-errors');
const express = require('express');
const fileUpload = require('express-fileupload');
const hbs = require('hbs');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const entriesRouter = require('./routes/entries');
const revisionsRouter = require('./routes/revisions');
const variantsRouter = require('./routes/variants');
const variantRouter = require('./routes/variant');
const metadataRouter = require('./routes/metadata');
const uploadMetadataRouter = require('./routes/upload/metadata');
const twoLevelRouter = require('./routes/twolevel');
const revisionsvariantsRouter = require('./routes/revisionsvariants');
const usersRouter = require('./routes/users');

const app = express();

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
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Burrito setup
const createAppBurritoStore = require('./create_app_burrito_store').default;

(async () => {
  try {
    app.__burrito = {
      store: await createAppBurritoStore(),
    };
  } catch (e) {
    // Deal with the fact the chain failed
  }
})();

hbs.registerHelper(
  'keysInObject',
  (ob) => ob.length > 0,
);
hbs.registerHelper('uriencode', encodeURIComponent);
hbs.registerHelper(
  'idServerNameOrId',
  (idDetails, nameLang) => {
    const lang = nameLang || 'en';
    console.log(nameLang);
    if ('name' in idDetails) {
      return idDetails.name.en;
    }
    return idDetails.id;
  },
);
hbs.registerHelper(
  'nameInLang',
  (namesOb, lang) => namesOb[lang],
);

//
module.exports = app;
