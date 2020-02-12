'use strict';
var express = require('express');
var router = express.Router();

/* Variant metadata for idServer/entry/revision/variant */
router.post('/', function(req, res, next) {
    if (!req.files || Object.keys(req.files).length === 0) {
	return res.status(400).send('No files were uploaded.');
    }
    if (!("uploadedMetadata" in req.files)) {
	return res.status(400).send("No metadata upload found");
    }
    const app = req.app;
    const store = app.__burrito.store;
    const uploadedMetadata = JSON.parse(req.files.uploadedMetadata.data.toString());
    console.log(uploadedMetadata);
    store.importFromObject(uploadedMetadata);
    res.redirect(302, "/?upload=true");
});

module.exports = router;
