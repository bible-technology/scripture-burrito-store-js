"use strict";

import * as xmldom from 'xmldom';
import {assert} from 'chai';

class DBLImport {

  constructor(dblDom) {
    this.root = dblDom.documentElement;
    this.sbMetadata = {};
    this.processRoot();
    //this.processIdentification();
    //this.processType();
    //this.processRelationships();
    //this.processAgencies();
    //this.processLanguage();
    //this.processCountries();
    //this.processFormat();
    //this.processNames();
    //this.processManifest();
    //this.processSource();
    //this.processPublications();
    //this.processCopyright();
    //this.processPromotion();
    //this.processProgress();
    //this.processArchiveStatus();
  }

  processRoot() {
    assert.equal(this.root.nodeName, "DBLMetadata");
    assert.isTrue(this.root.hasAttribute("id"));
    assert.isTrue(this.root.hasAttribute("revision"));
    assert.isTrue(parseInt(this.root.getAttribute("version").slice(0,1)) == 2);
    assert.isTrue(this.root.hasAttribute("revision"));
    this.sbMetadata = {
      "meta": {
        "version": "0.2.0",
        "variant": "source",
        "generator": {
          "softwareName": "DBLImport",
          "softwareVersion": "0.0.0",
          "userName": "Mark Howe"
        },
        "defaultLanguage": "en"
      },
      "idServers": {
        "dbl": {
          "id": "https://thedigitalbiblelibrary.org",
          "name": {
            "en": "The Digital Bible Library"
          }
        }
      },
      "identification": {
        "systemId": {
          "dbl": {
            "id": this.root.getAttribute("id"),
            "revision": this.root.getAttribute("revision")
          }
        }
      }
    };
  }

}

export {DBLImport}

