import createAppBurritoStore from '../create_app_burrito_store';

const express = require('express');

const router = express.Router();

/* Variant metadata for idServer/entry/revision/variant */
router.get('/', async (req, res) => {
  const store = await createAppBurritoStore();
  const idServer = req.query.idserver;
  const entry = req.query.entry;
  const revision = req.query.revision;
  const variant = req.query.variant;
  res.json(store.metadataContent(idServer, entry, revision, variant));
});

module.exports = router;
