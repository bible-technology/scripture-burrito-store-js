import createAppBurritoStore from '../create_app_burrito_store';

const express = require('express');

const router = express.Router();

/* GET two-level home page. */
router.get('/', async (req, res) => {
  const store = await createAppBurritoStore();
  res.render('twolevel', {
    title: 'ID Servers (2 level)',
    servers: store.idServersEntries(),
  });
});

module.exports = router;
