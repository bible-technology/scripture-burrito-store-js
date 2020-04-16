import createAppBurritoStore from '../create_app_burrito_store';

const express = require('express');

const router = express.Router();

/* List of variants for idServer/entry/revision */
router.get('/', async (req, res) => {
  const store = await createAppBurritoStore();
  const idServer = req.query.idserver;
  const entry = req.query.entry;
  const revision = req.query.revision;
  res.render('variants', {
    title: 'Variants for ' + idServer + ' / ' + entry + ' / ' + revision,
    idServer,
    idServerName: store.idServerName(idServer),
    entry,
    revision,
    variants: store.entryRevisionVariants(idServer, entry, revision),
  });
});

module.exports = router;
