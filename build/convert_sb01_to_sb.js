
require = require('esm')(module/* , options */);
const path = require('path');
const fse = require('fs-extra');

const SB01Import = require('../code/sb01_import.js').SB01Import;
const BurritoValidator = require('../code/burrito_validator.js').BurritoValidator;

const entry = JSON.parse(
  fse.readFileSync(process.argv[2], 'utf8'),
  'text/xml',
);
const converted = new SB01Import(entry);
// console.log(JSON.stringify(converted.sb02Metadata.meta, null, 2));
const validationResult = new BurritoValidator().schemaValidate('metadata', converted.sb02Metadata);
// if (validationResult.result == "accepted") {
console.log(JSON.stringify(converted.sb02Metadata, null, 4));
// } else {
//  console.log(validationResult.result)
// }
