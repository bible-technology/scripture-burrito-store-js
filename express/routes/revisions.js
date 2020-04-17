import createAppBurritoStore from '../create_app_burrito_store';

const express = require('express');

const router = express.Router();

/* List of revisions for idServer/entry */
router.get('/', async (req, res) => {
  const store = await createAppBurritoStore();
  const idServer = req.query.idserver;
  const entry = req.query.entry;
  res.render('revisions', {
    title: 'Revisions for ' + idServer + ' / ' + entry,
    idServer,
    idServerName: store.idServerName(idServer),
    entry,
    revisions: store.entryRevisions(idServer, entry),
  });
});

module.exports = router;
