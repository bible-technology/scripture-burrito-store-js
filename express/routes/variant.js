'use strict';
var express = require('express');
var router = express.Router();

/* Variant info for idServer/entry/revision/variant */
router.get('/', function(req, res, next) {
    const app = req.app;
    const store = app.__burrito.store;
    const idServer = req.query.idserver;
    const entry = req.query.entry;
    const revision = req.query.revision;
    const variant = req.query.variant;
    const metadata = store.metadataContent(idServer, entry, revision, variant);
    const ingredientEntries = Object.entries(store.ingredients(idServer, entry, revision, variant));
    const localIngredients = ingredientEntries.filter(function([k, v]) { return v });
    res.render('variant', {
	title: 'Variant ' + variant + " of " + idServer + " / " + entry + " / " + revision,
	idServer: idServer,
	idServerName: store.idServerName(idServer),
	entry: entry,
	revision: revision,
	variant: variant,
	metadata: metadata,
        localIngredients: localIngredients.length,
        allIngredients: ingredientEntries.length
    });
});

module.exports = router;
