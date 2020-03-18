"use strict";

import * as xmldom from 'xmldom';
import {assert} from 'chai';

class DBLImport {

  constructor(dblDom) {
    this.root = dblDom.documentElement;
    this.sbMetadata = {};
    this.processRoot();
    this.processLanguage();
    this.processIdentification();
    //this.processType();
    //this.processRelationships();
    this.processAgencies();
    this.processCountries();
    //this.processFormat();
    this.processNames();
    //this.processManifest();
    //this.processSource();
    //this.processPublications();
    //this.processCopyright();
    //this.processPromotion();
    //this.processArchiveStatus();
  }

  childElementByName(parent, elementName) {
    const element = parent.getElementsByTagName(elementName);
    if ("0" in element) {
      return element["0"];
    } else {
      return null;
    }
  }

  childElementsByName(parent, elementName) {
    return parent.getElementsByTagName(elementName);
  }

  bcp47ify(iso) {
    const lookup = {
      "eng": "en"
    };
    if (iso in lookup) {
      return lookup[iso];
    } else {
      return iso;
    }
  }

  addNamelike(domParent, jsonParent, children) {
    const self = this;
    children.forEach(
      function (namelike, n) {
        const namelikeNode = self.childElementByName(domParent, namelike);
        assert.isNotNull(namelikeNode);
        const namelikeJson = {
          "en": namelikeNode.childNodes[0].nodeValue
        };
        const namelikeLocalNode =self.childElementByName(domParent, namelike + "Local");
        if (namelikeLocalNode) {
          namelikeJson[self.bcp47Local] = namelikeLocalNode.childNodes[0].nodeValue;
        }
        jsonParent[namelike] = namelikeJson;
      }
    )
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
        },
        "idServer": "dbl"
      }
    };
  }

  processLanguage() {
    // Todo: numberingSystem
    const language = this.childElementByName(this.root, "language");
    assert.isNotNull(language);
    const iso = this.childElementByName(language, "iso");
    assert.isNotNull(iso);
    this.bcp47Local = this.bcp47ify(iso.childNodes[0].nodeValue);
    const languageJson = {
      "tag": this.bcp47Local
    };
    this.addNamelike(
      language,
      languageJson,
      ["name"]
    );
    this.sbMetadata.languages = [
      languageJson
      ];
  }
  
  processIdentification() {
    const identification = this.childElementByName(this.root, "identification");
    assert.isNotNull(identification);
    this.addNamelike(
      identification,
      this.sbMetadata["identification"],
      ["name", "description", "abbreviation"]
    );
  }

  processCountries() {
    const self = this;
    const countries = self.childElementByName(self.root, "countries");
    const countryNodes = self.childElementsByName(countries, "country");
    if (countryNodes.length > 0) {
      var countriesJson = [];
      for (var n = 0; n < countryNodes.length; n++) {
        const country = countryNodes.item(n);
        const iso = self.childElementByName(country, "iso");
        assert.isNotNull(iso);
        const countryJson = {
          "code": iso.childNodes[0].nodeValue
        };
        self.addNamelike(
          country,
          countryJson,
          ["name"]
        );
        countriesJson.push(countryJson);
      };
      this.sbMetadata["targetAreas"] = countriesJson;
    };
  }

  processNames() {
    const self = this;
    const names = self.childElementByName(self.root, "names");
    const nameNodes = self.childElementsByName(names, "name");
    if (nameNodes.length > 0) {
      var namesJson = {};
      for (var n = 0; n < nameNodes.length; n++) {
        const name = nameNodes.item(n);
        const nameId = name.getAttribute("id");
        const nameJson = {};
        ["abbr", "short", "long"].forEach(
          function (size, n) {
            const sizeNodes = self.childElementsByName(name, size);
            if (sizeNodes.length > 0) {
              self.addNamelike(
                name,
                nameJson,
                [size]
              );
            }
          }
        );
        namesJson[nameId] = nameJson;
      };
      this.sbMetadata["namesJson"] = namesJson;
    }
  }

  processAgencies() {
    const self = this;
    const agencies = self.childElementByName(self.root, "agencies");
    const agencyTypes = {
      "rightsHolder": self.childElementsByName(agencies, "rightsHolder"),
      "contributor": self.childElementsByName(agencies, "contributor"),
      "rightsAdmin": self.childElementsByName(agencies, "rightsAdmin")
    };
    var agencyLookup = {};
    ["rightsHolder", "contributor", "rightsAdmin"].forEach(
      function (agencyType, n) {
        for (var n = 0; n < agencyTypes[agencyType].length; n++) {
          if (agencyTypes[agencyType].length > 0) {
            const agency = agencyTypes[agencyType].item(n);
            const agencyUID = self.childElementByName(agency, "uid").childNodes[0].nodeValue;
            var agencyJson;
            if (agencyUID in agencyLookup) {
              agencyJson = agencyLookup[agencyUID];
            } else {
              agencyJson = {
                "id": "dbl::" + agencyUID,
                "roles": []
              }
            };
            const agencyURLs = self.childElementsByName(agency, "url");
            if (agencyURLs.length > 0) {
              agencyJson["url"] = agencyURLs.item(0).childNodes[0].nodeValue;
            }
            self.addNamelike(
              agency,
              agencyJson,
              ["name"]
            );
            const agencyAbbrs = self.childElementsByName(agency, "abbr");
            if (agencyAbbrs.length > 0) {
              self.addNamelike(
                agency,
                agencyJson,
                ["abbr"]
              )
            };
            if (agencyType == "rightsHolder") {
              agencyJson["roles"].push("rightsHolder");
            }
            else if (agencyType == "rightsAdmin") {
              agencyJson["roles"].push("rightsAdmin");
            } else {
              ["content", "publication", "management", "finance", "qa"].forEach(
                function (role, n) {
                  const agencyRoles = self.childElementsByName(agency, role);
                  if (agencyRoles.length > 0) {
                    agencyJson["roles"].push(role);
                  }
                }
              )
            }
            agencyLookup[agencyUID] = agencyJson;
          }
        }
      }
    );
    self.sbMetadata["agencies"] = Object.values(agencyLookup);
  }

}

export {DBLImport}

