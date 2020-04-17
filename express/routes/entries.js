import createAppBurritoStore from '../create_app_burrito_store';

const express = require('express');

const router = express.Router();

/* List of entries for idServer */
router.get('/', async (req, res) => {
  const store = await createAppBurritoStore();
  const idServer = req.query.idserver;
  res.render('entries', {
    title: 'Entries for ' + idServer,
    idServer,
    idServerName: store.idServerName(idServer),
    entries: store.entries(idServer),
  });
});

module.exports = router;
