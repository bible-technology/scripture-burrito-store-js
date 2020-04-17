
import createAppBurritoStore from '../create_app_burrito_store';

const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
  const store = await createAppBurritoStore();
  res.render('index', {
    title: 'ID Servers',
    serversExist: store.idServers().length > 0,
    defaultLang: 'en',
    servers: store.idServersDetails(),
    upload: !!req.query.upload,
  });
});

module.exports = router;
