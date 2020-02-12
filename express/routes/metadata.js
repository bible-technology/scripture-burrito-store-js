'use strict';
var express = require('express');
var router = express.Router();

/* Variant metadata for idServer/entry/revision/variant */
router.get('/', function(req, res, next) {
    const app = req.app;
    const store = app.__burrito.store;
    const idServer = req.query.idserver;
    const entry = req.query.entry;
    const revision = req.query.revision;
    const variant = req.query.variant;
    res.json(store.metadataContent(idServer, entry, revision, variant));
});

module.exports = router;
