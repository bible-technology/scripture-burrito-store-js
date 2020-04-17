import createAppBurritoStore from '../../create_app_burrito_store';

const express = require('express');

const router = express.Router();

/* Variant metadata for idServer/entry/revision/variant */
router.post('/', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  if (!('uploadedMetadata' in req.files)) {
    return res.status(400).send('No metadata upload found');
  }
  const store = await createAppBurritoStore();
  const uploadedMetadata = JSON.parse(req.files.uploadedMetadata.data.toString());
  store.importFromObject(uploadedMetadata);
  res.redirect(302, '/?upload=true');
});

module.exports = router;
