'use strict';

require = require("esm")(module/*, options*/);
const path = require('path');
const fse = require('fs-extra');
const xmldom = require('xmldom');

const DBLImport = require('../code/dbl_metadata_import.js').DBLImport;
const BurritoValidator = require('../code/burrito_validator.js').BurritoValidator;


const domParser = new xmldom.DOMParser();
const entry = domParser.parseFromString(
  fse.readFileSync(process.argv[2], "utf8"),
  'text/xml'
);
const converted = new DBLImport(entry);
// console.log(JSON.stringify(converted.sbMetadata.meta, null, 2));
const validationResult = new BurritoValidator().schemaValidate("metadata", converted.sbMetadata);
// if (validationResult.result == "accepted") {
  console.log(JSON.stringify(converted.sbMetadata, null, 2));
//} else {
//  console.log(validationResult.result)
//}
