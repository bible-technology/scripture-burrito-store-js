"use strict";

import * as xmldom from 'xmldom';
import {assert} from 'chai';

class DBLImport {

  constructor(dblDom) {
    this.serializer = new xmldom.XMLSerializer();
    this.root = dblDom.documentElement;
    this.sbMetadata = {};
    this.processRoot();
    this.processLanguage();
    this.processIdentification();
    this.processType();
    //this.processRelationships();
    this.processAgencies();
    this.processCountries();
    //this.processFormat();
    this.processNames();
    this.processManifest();
    //this.processSource();
    this.processPublications();
    this.processCopyright();
    if (this.sbMetadata.meta.variant != "source") {
      this.processPromotion();
    }
    this.processArchiveStatus();
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

  translationType(str) {
    const lookup = {
      "Revision": "revision"
    };
    if (str in lookup) {
      return lookup[str];
    } else {
      return str;
    }
  }

  audience(str) {
    const lookup = {
      "Common": "common"
    };
    if (str in lookup) {
      return lookup[str];
    } else {
      return str;
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
      this.sbMetadata["names"] = namesJson;
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
        if (agencyTypes[agencyType].length > 0) {
          for (var n = 0; n < agencyTypes[agencyType].length; n++) {
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

  processType() {
    // Todo - currentScope; correct enums
    const self = this;
    const type = self.childElementByName(self.root, "type");
    assert.isNotNull(type);
    const typeJson = {
      "flavorType": {
        "name": "scripture",
        "currentScope": {
          "GEN": [],
          "EXO": ["1", "3-12", "13:4", "14:3-8", "15:8-16:2"],
          "LEV": ["2-3"],
          "MAT": ["1", "5", "7-11"]
        },
        "canonType": ["ot", "nt"],
        "canonSpec": {
          "ot": {
            "name": "western"
          },
          "nt": {
            "name": "x-matthewOnlyMillenialists",
            "books": ["MAT"]
          }
        },
        "flavor": {
          "name": "textTranslation",
          "projectType": "standard",
          "usfmVersion": "3.0"
        }
      }
    };
    const translationType = self.childElementByName(type, "translationType");
    assert.isNotNull(translationType);
    typeJson["flavorType"]["flavor"]["translationType"] = this.translationType(translationType.childNodes[0].nodeValue);
    const audience = self.childElementByName(type, "audience");
    assert.isNotNull(audience);
    typeJson["flavorType"]["flavor"]["audience"] = this.audience(audience.childNodes[0].nodeValue);
    self.sbMetadata["type"] = typeJson;

    // Confidentiality
    const isConfidential = self.childElementByName(type, "isConfidential");
    assert.isNotNull(isConfidential);
    const isConfidentialFlag = (isConfidential.childNodes[0].nodeValue == "true");
    const confidentialityJson = {
      "metadata": isConfidentialFlag ? "private" : "unrestricted",
      "source": "private",
      "publications": isConfidentialFlag ? "private" : "restricted"
    };
    self.sbMetadata["confidentiality"] = confidentialityJson;
  }

  processArchiveStatus() {
    const self = this;
    const aStatus = self.childElementByName(self.root, "archiveStatus");
    assert.isNotNull(aStatus);
    const aName = self.childElementByName(aStatus, "archivistName");
    assert.isNotNull(aName);
    self.sbMetadata["meta"]["generator"]["userName"] = aName.childNodes[0].nodeValue;
    const aDate = self.childElementByName(aStatus, "dateUpdated");
    assert.isNotNull(aDate);
    self.sbMetadata["meta"]["dateCreated"] = aDate.childNodes[0].nodeValue + "+00:00";
    const aComment = self.childElementByName(aStatus, "comments");
    assert.isNotNull(aComment);
    self.sbMetadata["meta"]["comments"] = [aComment.childNodes[0].nodeValue];
  }

  processCopyright() {
    const self = this;
    const copyright = self.childElementByName(self.root, "copyright");
    assert.isNotNull(copyright);
    const fullStatement = self.childElementByName(copyright, "fullStatement");
    assert.isNotNull(fullStatement);
    const copyrightJson = {};
    const statementContents = self.childElementsByName(fullStatement, "statementContent");
    if (statementContents.length > 0) {
      for (var n = 0; n < statementContents.length; n++) {
        const statementContent = statementContents.item(n);
        const contentType = statementContent.getAttribute("type");
        assert.isNotNull(contentType);
        if (contentType == "xhtml") {
          var serialize = this.serializer.serializeToString(statementContent);
          serialize = serialize.replace(new RegExp("^[^>]+>"), "").replace(new RegExp("<[^<]+$"), "");
          copyrightJson["fullStatementRich"] = {"en": serialize.trim()};
        } else {
          copyrightJson["fullStatementPlain"] = {"en": statementContent.childNodes[0].nodeValue};
        }
      }
    }
    self.sbMetadata.copyright = copyrightJson;
  }
  
  processPromotion() {
    const self = this;
    const promotion = self.childElementByName(self.root, "promotion");
    assert.isNotNull(promotion);
    const promotionJson = {};
    const promoVersionInfos = self.childElementsByName(promotion, "promoVersionInfo");
    if (promoVersionInfos.length > 0) {
      for (var n = 0; n < promoVersionInfos.length; n++) {
        const promoVersionInfo = promoVersionInfos.item(n);
        const contentType = promoVersionInfo.getAttribute("contentType");
        assert.isNotNull(contentType);
        if (contentType == "xhtml") {
          var serialize = this.serializer.serializeToString(promoVersionInfo);
          serialize = serialize.replace(new RegExp("^[^>]+>"), "").replace(new RegExp("<[^<]+$"), "");
          promotionJson["statementRich"] = serialize.trim();
        } else {
          promotionJson["statementPlain"] = promoVersionInfo.childNodes[0].nodeValue;
        }
      }
    }
    console.log(promotionJson);
    self.sbMetadata.promotion = promotionJson;
  }

  processManifest() {
    const self = this;
    const manifest = self.childElementByName(self.root, "manifest");
    assert.isNotNull(manifest);
    const ingredientsJson = {};
    const resources = self.childElementsByName(manifest, "resource");
    if (resources.length > 0) {
      for (var n = 0; n < resources.length; n++) {
        const resource = resources.item(n);
        if (resource.getAttribute("uri") != "source/source.zip") {
          ingredientsJson[resource.getAttribute("uri")] = {
            "checksum": {
              "md5": resource.getAttribute("checksum")
            },
            "mimeType": resource.getAttribute("mimeType"),
            "size": parseInt(resource.getAttribute("size"))
          }
        }
      }
    }
    self.sbMetadata["ingredients"] = ingredientsJson;
  }

  processPublications() {
    // Todo - everything apart from setting whole book roles for ingredients with no divisions
    const self = this;
    const publications = self.childElementByName(self.root, "publications");
    assert.isNotNull(publications);
    const publication = self.childElementsByName(publications, "publication");
    assert.isNotNull(publication);
    for (var n = 0; n < publication.length; n++) {
      const publicationItem = publication.item(n);
      const structure = self.childElementByName(publicationItem, "structure");
      assert.isNotNull(structure);
      const contents = self.childElementsByName(structure, "content");
      for (var n2 = 0; n2 < contents.length; n2++) {
        const content = contents.item(n2);
        const contentSrc = content.getAttribute("src");
        if (contentSrc in self.sbMetadata.ingredients && content.hasAttribute("role")) {
          const role = content.getAttribute("role");
          const scope = {};
          scope[role] = [];
          self.sbMetadata.ingredients[contentSrc]["scope"] = scope;
        }
      }
    }
  }
  
}

export {DBLImport}

