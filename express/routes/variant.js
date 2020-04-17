import createAppBurritoStore from '../create_app_burrito_store';

const express = require('express');

const router = express.Router();

/* Variant info for idServer/entry/revision/variant */
router.get('/', async (req, res) => {
  const store = await createAppBurritoStore();
  const idServer = req.query.idserver;
  const entry = req.query.entry;
  const revision = req.query.revision;
  const variant = req.query.variant;
  const metadata = store.metadataContent(idServer, entry, revision, variant);
  const ingredientEntries = Object.entries(store.ingredients(idServer, entry, revision, variant));
  const localIngredients = ingredientEntries.filter(([, v]) => v);
  res.render('variant', {
    title: 'Variant ' + variant + ' of ' + idServer + ' / ' + entry + ' / ' + revision,
    idServer,
    idServerName: store.idServerName(idServer),
    entry,
    revision,
    variant,
    metadata,
    localIngredients: localIngredients.length,
    allIngredients: ingredientEntries.length,
  });
});

module.exports = router;
