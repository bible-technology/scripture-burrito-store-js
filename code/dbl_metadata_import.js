"use strict";

import * as xmldom from "xmldom";
import { assert } from "chai";

class DBLImport {
    constructor(dblDom) {
        this.serializer = new xmldom.XMLSerializer();
        this.root = dblDom.documentElement;
        this.sbMetadata = {};
        this.processRoot();
        this.processLanguage();
        this.processIdentification();
        this.processRelationships();
        this.processType();
        this.processAgencies();
        this.processCountries();
        this.processFormat();
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
            eng: "en"
        };
        if (iso in lookup) {
            return lookup[iso];
        } else {
            return iso;
        }
    }

    flavorName(medium) {
        const lookup = {
            text: "textTranslation",
            audio: "audioTranslation",
            print: "typesetScripture",
            video: "signLanguageVideoTranslation",
            braille: "embossedBrailleScripture"
        };
        if (medium in lookup) {
            return lookup[medium];
        } else {
            return medium;
        }
    }

    translationType(str) {
        const lookup = {
            First: "firstTranslation",
            New: "newTranslation",
            Revision: "revision"
        };
        if (str in lookup) {
            return lookup[str];
        } else {
            return str;
        }
    }

    projectType(str) {
        const lookup = {
            Standard: "standard",
            Daughter: "daughter",
            StudyBible: "studyBible",
            StudyBibleAdditions: "studyBibleAdditions",
            BackTranslation: "backTranslation",
            Auxillary: "auxillary",
            TransliterationManual: "transliterationManual",
            TransliterationWithEncoder: "transliterationWithEncoder"
        };
        if (str in lookup) {
            return lookup[str];
        } else {
            return str;
        }
    }

    audience(str) {
        const lookup = {
            Basic: "basic",
            Common: "common",
            "Common - Literary": "common-literary",
            Literary: "literary",
            Liturgical: "liturgical",
            Children: "children"
        };
        if (str in lookup) {
            return lookup[str];
        } else {
            return str;
        }
    }

    addNamelike(domParent, jsonParent, children) {
        const self = this;
        children.forEach(function(namelike, n) {
            const namelikeJson = {};
            const namelikeNode = self.childElementByName(domParent, namelike);
            if (namelikeNode) {
                namelikeJson["en"] = namelikeNode.childNodes[0].nodeValue;
            }
            const namelikeLocalNode = self.childElementByName(domParent, namelike + "Local");
            if (namelikeLocalNode) {
                namelikeJson[self.bcp47Local] = namelikeLocalNode.childNodes[0].nodeValue;
            }
            if (Object.keys(namelikeJson).length > 0) {
                jsonParent[namelike] = namelikeJson;
            }
        });
    }

    processRoot() {
        assert.equal(this.root.nodeName, "DBLMetadata");
        assert.isTrue(this.root.hasAttribute("id"));
        assert.isTrue(this.root.hasAttribute("revision"));
        assert.isTrue(parseInt(this.root.getAttribute("version").slice(0, 1)) == 2);
        assert.isTrue(this.root.hasAttribute("revision"));
        this.sbMetadata = {
            meta: {
                version: "0.2.0",
                variant: "source",
                generator: {
                    softwareName: "DBLImport",
                    softwareVersion: "0.0.0",
                    userName: "Mark Howe"
                },
                defaultLanguage: "en"
            },
            idServers: {
                dbl: {
                    id: "https://thedigitalbiblelibrary.org",
                    name: {
                        en: "The Digital Bible Library"
                    }
                }
            },
            identification: {
                systemId: {
                    dbl: {
                        id: this.root.getAttribute("id"),
                        revision: this.root.getAttribute("revision")
                    }
                },
                idServer: "dbl"
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
            tag: this.bcp47Local
        };
        this.addNamelike(language, languageJson, ["name"]);
        this.sbMetadata.languages = [languageJson];
    }

    processIdentification() {
        const identification = this.childElementByName(this.root, "identification");
        assert.isNotNull(identification);
        this.addNamelike(identification, this.sbMetadata["identification"], ["name", "description", "abbreviation"]);
    }

    processRelationships() {
        const self = this;
        const relationships = this.childElementByName(this.root, "relationships");
        assert.isNotNull(relationships);
        const relationshipNodes = self.childElementsByName(relationships, "relation");
        if (relationshipNodes.length > 0) {
            self.sbMetadata["relationships"] = [];
            var relationshipJson = [];
            for (var n = 0; n < relationshipNodes.length; n++) {
                const relation = relationshipNodes.item(n);
                const relationJson = {
                    relationType: relation.getAttribute("relationType"),
                    flavor: self.flavorName(relation.getAttribute("type")),
                    id: "dbl::" + relation.getAttribute("id")
                };
                if (relation.hasAttribute("revision")) {
                    relationJson["revision"] = relation.getAttribute("revision");
                }
                if (relation.hasAttribute("publicationId")) {
                    relationJson["variant"] = relation.getAttribute("publicationId");
                }
                self.sbMetadata["relationships"].push(relationJson);
            }
        }
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
                    code: iso.childNodes[0].nodeValue
                };
                self.addNamelike(country, countryJson, ["name"]);
                countriesJson.push(countryJson);
            }
            this.sbMetadata["targetAreas"] = countriesJson;
        }
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
                ["abbr", "short", "long"].forEach(function(size, n) {
                    const sizeNodes = self.childElementsByName(name, size);
                    if (sizeNodes.length > 0) {
                        self.addNamelike(name, nameJson, [size]);
                    }
                });
                namesJson[nameId] = nameJson;
            }
            this.sbMetadata["names"] = namesJson;
        }
    }

    processAgencies() {
        const self = this;
        const agencies = self.childElementByName(self.root, "agencies");
        const agencyTypes = {
            rightsHolder: self.childElementsByName(agencies, "rightsHolder"),
            contributor: self.childElementsByName(agencies, "contributor"),
            rightsAdmin: self.childElementsByName(agencies, "rightsAdmin")
        };
        var agencyLookup = {};
        ["rightsHolder", "contributor", "rightsAdmin"].forEach(function(agencyType, n) {
            if (agencyTypes[agencyType].length > 0) {
                for (var n = 0; n < agencyTypes[agencyType].length; n++) {
                    const agency = agencyTypes[agencyType].item(n);
                    const agencyUID = self.childElementByName(agency, "uid").childNodes[0].nodeValue;
                    var agencyJson;
                    if (agencyUID in agencyLookup) {
                        agencyJson = agencyLookup[agencyUID];
                    } else {
                        agencyJson = {
                            id: "dbl::" + agencyUID,
                            roles: []
                        };
                    }
                    const agencyURLs = self.childElementsByName(agency, "url");
                    if (agencyURLs.length > 0) {
                        var urlString = agencyURLs.item(0).childNodes[0].nodeValue;
                        if (!urlString.match("^(http(s)?|ftp)://")) {
                            urlString = "http://" + urlString;
                        }
                        agencyJson["url"] = urlString;
                    }
                    self.addNamelike(agency, agencyJson, ["name"]);
                    const agencyAbbrs = self.childElementsByName(agency, "abbr");
                    if (agencyAbbrs.length > 0) {
                        self.addNamelike(agency, agencyJson, ["abbr"]);
                    }
                    if (agencyType == "rightsHolder") {
                        agencyJson["roles"].push("rightsHolder");
                    } else if (agencyType == "rightsAdmin") {
                        agencyJson["roles"].push("rightsAdmin");
                    } else {
                        ["content", "publication", "management", "finance", "qa"].forEach(function(role, n) {
                            const agencyRoles = self.childElementsByName(agency, role);
                            if (agencyRoles.length > 0) {
                                agencyJson["roles"].push(role);
                            }
                        });
                    }
                    agencyLookup[agencyUID] = agencyJson;
                }
            }
        });
        self.sbMetadata["agencies"] = Object.values(agencyLookup);
    }

    processType() {
        // Todo - canonType/canonSpec
        const self = this;
        const type = self.childElementByName(self.root, "type");
        assert.isNotNull(type);
        const typeJson = {
            flavorType: {
                name: "scripture",
                flavor: {}
            }
        };
        const medium = self.childElementByName(type, "medium");
        assert.isNotNull(medium);
        const flavorName = this.flavorName(medium.childNodes[0].nodeValue);
        typeJson["flavorType"]["flavor"]["name"] = flavorName;
        typeJson["flavorType"]["canonType"] = ["ot", "nt"];
        typeJson["flavorType"]["canonSpec"] = {
            ot: {
                name: "western"
            },
            nt: {
                name: "western"
            }
        };
        if (flavorName == "textTranslation") {
            typeJson["flavorType"]["flavor"]["usfmVersion"] = "3.0";
            const translationType = self.childElementByName(type, "translationType");
            assert.isNotNull(translationType);
            typeJson["flavorType"]["flavor"]["translationType"] = this.translationType(
                translationType.childNodes[0].nodeValue
            );
            const audience = self.childElementByName(type, "audience");
            assert.isNotNull(audience);
            typeJson["flavorType"]["flavor"]["audience"] = this.audience(audience.childNodes[0].nodeValue);
            const projectType = self.childElementByName(type, "projectType");
            if (projectType) {
                typeJson["flavorType"]["flavor"]["projectType"] = this.projectType(projectType.childNodes[0].nodeValue);
            } else {
                typeJson["flavorType"]["flavor"]["projectType"] = "standard";
            }
        } else if (flavorName == "audioTranslation") {
            // Use proper dramatization enum once it exists
            typeJson["flavorType"]["flavor"]["dramatization"] = "singleVoice";
        } else if (flavorName == "typesetScripture") {
        } else if (flavorName == "signLanguageVideoTranslation") {
        } else if (flavorName == "embossedBrailleScripture") {
        } else {
            throw new Error("Unknown medium " + flavorName);
        }
        self.sbMetadata["type"] = typeJson;

        // Confidentiality
        const isConfidential = self.childElementByName(type, "isConfidential");
        assert.isNotNull(isConfidential);
        const isConfidentialFlag = isConfidential.childNodes[0].nodeValue == "true";
        const confidentialityJson = {
            metadata: isConfidentialFlag ? "private" : "unrestricted",
            source: "private",
            publications: isConfidentialFlag ? "private" : "restricted"
        };
        self.sbMetadata["confidentiality"] = confidentialityJson;
    }

    processFormat() {
        const self = this;
        const format = this.childElementByName(this.root, "format");
        const typeJson = this.sbMetadata.type.flavorType.flavor;
        if (typeJson.name == "typesetScripture") {
            this.processTypesetScriptureFormat(format, typeJson);
        } else if (typeJson.name == "audioTranslation") {
            this.processAudioTranslationFormat(format, typeJson);
        } else if (typeJson.name == "signLanguageVideoTranslation") {
            this.processSignLanguageVideoTranslationFormat(format, typeJson);
        } else if (typeJson.name == "embossedBrailleScripture") {
            this.processEmbossedBrailleScriptureFormat(format, typeJson);
        }
    }

    processTypesetScriptureFormat(format, typeJson) {
        const self = this;
        typeJson["contentType"] = "pdf";
        [
            ["pod", "boolean"],
            ["pageCount", "integer"],
            ["height", "string"],
            ["width", "string"],
            ["scale", "string"]
        ].forEach(function(fieldTuple) {
            const [field, fieldType] = fieldTuple;
            const fieldNode = self.childElementByName(format, field);
            assert.isNotNull(field);
            if (fieldType == "boolean") {
                typeJson[field] = fieldNode.childNodes[0].nodeValue == "true";
            } else if (fieldType == "integer") {
                typeJson[field] = parseInt(fieldNode.childNodes[0].nodeValue);
            } else {
                typeJson[field] = fieldNode.childNodes[0].nodeValue;
            }
        });
        const color = self.childElementByName(format, "color");
        assert.isNotNull(color);
        typeJson["colorSpace"] = color.childNodes[0].nodeValue.toLowerCase();
        const edgeSpace = self.childElementByName(format, "edgeSpace");
        assert.isNotNull(edgeSpace);
        typeJson["edgeSpace"] = {};
        ["top", "bottom", "inside", "outside"].forEach(function(field) {
            const fieldNode = self.childElementByName(format, field);
            assert.isNotNull(field);
            typeJson["edgeSpace"][field] = fieldNode.childNodes[0].nodeValue;
        });
        const fonts = self.childElementByName(format, "fonts");
        assert.isNotNull(fonts);
        const fontRecords = self.childElementsByName(fonts, "font");
        if (fontRecords.length > 0) {
            typeJson["fonts"] = [];
            for (var n = 0; n < fontRecords.length; n++) {
                const font = fontRecords.item(n);
                const fontName = font.childNodes[0].nodeValue;
                var fontType = font.getAttribute("type");
                fontType = fontType.substring(0, 1).toLowerCase() + fontType.substring(1);
                typeJson["fonts"].push([fontName, fontType]);
            }
        }
    }

    processAudioTranslationFormat(format, typeJson) {
        const self = this;
        typeJson["formats"] = { mp3: {} };
        [
            ["compression", "lcString"],
            ["trackConfiguration", "string"],
            ["bitRate", "integer"],
            ["bitDepth", "integer"],
            ["samplingRate", "integer"]
        ].forEach(function(fieldTuple) {
            const [field, fieldType] = fieldTuple;
            const fieldNode = self.childElementByName(format, field);
            if (!fieldNode) {
                return;
            }
            if (fieldType == "integer") {
                typeJson["formats"]["mp3"][field] = parseInt(fieldNode.childNodes[0].nodeValue);
            } else if (fieldType == "ccString") {
                const fieldValue = fieldNode.childNodes[0].nodeValue;
                typeJson["formats"]["mp3"][field] = fieldValue.substring(0, 1).toLowerCase() + fieldValue.substring(1);
            } else if (fieldType == "lcString") {
                const fieldValue = fieldNode.childNodes[0].nodeValue;
                typeJson["formats"]["mp3"][field] = fieldValue.toLowerCase();
            } else {
                typeJson["formats"]["mp3"][field] = fieldNode.childNodes[0].nodeValue;
            }
        });
    }

    processSignLanguageVideoTranslationFormat(format, typeJson) {
        const self = this;
        [["contentByChapter", "boolean"]].forEach(function(fieldTuple) {
            const [field, fieldType] = fieldTuple;
            const fieldNode = self.childElementByName(format, field);
            if (!fieldNode) {
                return;
            }
            if (fieldType == "boolean") {
                typeJson[field] = fieldNode.childNodes[0].nodeValue == "true";
            } else if (fieldType == "integer") {
                typeJson[field] = parseInt(fieldNode.childNodes[0].nodeValue);
            } else if (fieldType == "ccString") {
                const fieldValue = fieldNode.childNodes[0].nodeValue;
                typeJson[field] = fieldValue.substring(0, 1).toLowerCase() + fieldValue.substring(1);
            } else if (fieldType == "lcString") {
                const fieldValue = fieldNode.childNodes[0].nodeValue;
                typeJson[field] = fieldValue.toLowerCase();
            } else {
                typeJson[field] = fieldNode.childNodes[0].nodeValue;
            }
        });
        typeJson["formats"] = { format1: {} };
        const container = self.childElementByName(format, "container");
        assert.isNotNull(container);
        typeJson["formats"]["format1"]["container"] = container.childNodes[0].nodeValue.toLowerCase();
        typeJson["formats"]["format1"]["videoStream"] = {};
        [
            ["bitRate", "integer"],
            ["frameRate", "integer"],
            ["screenResolution", "string"]
        ].forEach(function(fieldTuple) {
            const [field, fieldType] = fieldTuple;
            const fieldNode = self.childElementByName(format, field);
            if (!fieldNode) {
                return;
            }
            if (fieldType == "boolean") {
                typeJson["formats"]["format1"]["videoStream"][field] = fieldNode.childNodes[0].nodeValue == "true";
            } else if (fieldType == "integer") {
                typeJson["formats"]["format1"]["videoStream"][field] = parseInt(fieldNode.childNodes[0].nodeValue);
            } else if (fieldType == "ccString") {
                const fieldValue = fieldNode.childNodes[0].nodeValue;
                typeJson["formats"]["format1"]["videoStream"][field] =
                    fieldValue.substring(0, 1).toLowerCase() + fieldValue.substring(1);
            } else if (fieldType == "lcString") {
                const fieldValue = fieldNode.childNodes[0].nodeValue;
                typeJson["formats"]["format1"]["videoStream"][field] = fieldValue.toLowerCase();
            } else {
                typeJson["formats"]["format1"]["videoStream"][field] = fieldNode.childNodes[0].nodeValue;
            }
        });
    }

    processEmbossedBrailleScriptureFormat(format, typeJson) {
        const self = this;
        const isContracted = self.childElementByName(format, "isContracted");
        assert.isNotNull(isContracted);
        typeJson["isContracted"] = isContracted.childNodes[0].nodeValue == "true";
        typeJson["processor"] = { name: "libLouis", table: {} };
        const libLouis = self.childElementByName(format, "liblouis");
        assert.isNotNull(libLouis);
        const libLouisVersion = self.childElementByName(libLouis, "version");
        assert.isNotNull(libLouisVersion);
        typeJson["processor"]["version"] = libLouisVersion.childNodes[0].nodeValue;
        const libLouisTable = self.childElementByName(libLouis, "table");
        assert.isNotNull(libLouisTable);
        const libLouisSrc = self.childElementByName(libLouisTable, "source");
        assert.isNotNull(libLouisSrc);
        typeJson["processor"]["table"]["src"] = libLouisSrc.childNodes[0].nodeValue;
        const libLouisName = self.childElementByName(libLouisTable, "name");
        assert.isNotNull(libLouisName);
        typeJson["processor"]["table"]["name"] = libLouisName.childNodes[0].nodeValue;
        typeJson["numberSign"] = {};
        const numberSign = self.childElementByName(format, "numberSign");
        assert.isNotNull(numberSign);
        const numberSignCharacter = self.childElementByName(numberSign, "character");
        assert.isNotNull(numberSignCharacter);
        typeJson["numberSign"]["character"] = numberSignCharacter.childNodes[0].nodeValue;
        const numberSignMargin = self.childElementByName(numberSign, "useInMargin");
        assert.isNotNull(numberSignMargin);
        typeJson["numberSign"]["useInMargin"] = numberSignMargin.childNodes[0].nodeValue == "true";
        typeJson["content"] = {};
        [
            ["chapterNumberStyle", "string"],
            ["chapterHeadingsNumberFirst", "boolean"],
            ["versedParagraphs", "boolean"],
            ["verseSeparator", "string"],
            ["includeIntros", "boolean"]
        ].forEach(function(fieldTuple) {
            const [field, fieldType] = fieldTuple;
            const fieldNode = self.childElementByName(format, field);
            if (!fieldNode) {
                return;
            }
            if (fieldType == "boolean") {
                typeJson["content"][field] = fieldNode.childNodes[0].nodeValue == "true";
            } else if (fieldType == "integer") {
                typeJson["content"][field] = parseInt(fieldNode.childNodes[0].nodeValue);
            } else if (fieldType == "ccString") {
                const fieldValue = fieldNode.childNodes[0].nodeValue;
                typeJson["content"][field] = fieldValue.substring(0, 1).toLowerCase() + fieldValue.substring(1);
            } else if (fieldType == "lcString") {
                const fieldValue = fieldNode.childNodes[0].nodeValue;
                typeJson["content"][field] = fieldValue.toLowerCase();
            } else {
                typeJson["content"][field] = fieldNode.childNodes[0].nodeValue;
            }
        });
        typeJson["page"] = {};
        [
            ["charsPerLine", "integer"],
            ["linesPerPage", "integer"],
            ["defaultMarginWidth", "integer"],
            ["versoLastLineBlank", "boolean"],
            ["carryLines", "integer"]
        ].forEach(function(fieldTuple) {
            const [field, fieldType] = fieldTuple;
            const fieldNode = self.childElementByName(format, field);
            if (!fieldNode) {
                return;
            }
            if (fieldType == "boolean") {
                typeJson["page"][field] = fieldNode.childNodes[0].nodeValue == "true";
            } else if (fieldType == "integer") {
                typeJson["page"][field] = parseInt(fieldNode.childNodes[0].nodeValue);
            } else if (fieldType == "ccString") {
                const fieldValue = fieldNode.childNodes[0].nodeValue;
                typeJson["page"][field] = fieldValue.substring(0, 1).toLowerCase() + fieldValue.substring(1);
            } else if (fieldType == "lcString") {
                const fieldValue = fieldNode.childNodes[0].nodeValue;
                typeJson["page"][field] = fieldValue.toLowerCase();
            } else {
                typeJson["page"][field] = fieldNode.childNodes[0].nodeValue;
            }
        });
        // Fill out these section with test documents that include the elements
        const hyphenationDictionary = self.childElementByName(format, "hyphenationDictionary");
        if (hyphenationDictionary) {
            typeJson["hyphenationDictionary"] = {};
        }
        const continuousPoetry = self.childElementByName(format, "continuousPoetry");
        if (continuousPoetry) {
            typeJson["continuousPoetry"] = {};
        }
        const footnotes = self.childElementByName(format, "footnotes");
        if (footnotes) {
            typeJson["footnotes"] = {};
        }
        const crossReferences = self.childElementByName(format, "crossReferences");
        if (crossReferences) {
            typeJson["crossReferences"] = {};
        }
        const characterStyles = self.childElementByName(format, "characterStyles");
        if (characterStyles) {
            typeJson["characterStyles"] = {};
        }
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
        var dateString = aDate.childNodes[0].nodeValue;
        if (!dateString.includes("+")) {
            dateString += "+00:00";
        }
        self.sbMetadata["meta"]["dateCreated"] = dateString;
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
                    copyrightJson["fullStatementRich"] = {};
                    copyrightJson["fullStatementRich"][self.bcp47Local] = serialize.trim();
                } else {
                    copyrightJson["fullStatementPlain"] = {};
                    copyrightJson["fullStatementPlain"][self.bcp47Local] = statementContent.childNodes[0].nodeValue;
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
                    promotionJson["statementRich"] = {};
                    promotionJson["statementRich"][self.bcp47Local] = serialize.trim();
                } else {
                    promotionJson["statementPlain"] = {};
                    promotionJson["statementPlain"][self.bcp47Local] = promoVersionInfo.childNodes[0].nodeValue;
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
                        checksum: {
                            md5: resource.getAttribute("checksum")
                        },
                        mimeType: resource.getAttribute("mimeType"),
                        size: parseInt(resource.getAttribute("size"))
                    };
                }
            }
        }
        self.sbMetadata["ingredients"] = ingredientsJson;
    }

    processPublications() {
        /* Todo:
       setting roles for non-text/audio ingredients and divisions
    */

        // scope and roles
        const self = this;
        const publications = self.childElementByName(self.root, "publications");
        assert.isNotNull(publications);
        const publication = self.childElementsByName(publications, "publication");
        assert.isNotNull(publication);
        const currentScopeJson = {};
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
                    const truncatedRole = role.substring(0, 3);
                    const scope = {};
                    if (truncatedRole.match("[A-Z0-6]{3}")) {
                        scope[role.substring(0, 3)] = role.length == 3 ? [] : [role.substring(4)];
                        self.sbMetadata.ingredients[contentSrc]["scope"] = scope;
                    } else {
                        self.sbMetadata.ingredients[contentSrc]["role"] = role;
                    }
                    if (truncatedRole.match("[A-Z0-6]{3}") && !(truncatedRole in currentScopeJson)) {
                        currentScopeJson[truncatedRole] = [];
                    }
                }
            }
        }
        if (Object.keys(currentScopeJson).length == 0) {
            for (var n = 0; n < publication.length; n++) {
                const publicationItem = publication.item(n);
                const canonical = self.childElementByName(publicationItem, "canonicalContent");
                assert.isNotNull(canonical);
                const books = self.childElementsByName(canonical, "book");
                for (var n2 = 0; n2 < books.length; n2++) {
                    const book = books.item(n2);
                    const bookCode = book.getAttribute("code");
                    if (!(bookCode in currentScopeJson)) {
                        currentScopeJson[bookCode] = [];
                    }
                }
            }
        }
        self.sbMetadata.type.flavorType["currentScope"] = currentScopeJson;

        // recipeSpecs
        self.sbMetadata["recipeSpecs"] = [];

        // DC-like fields
        for (var n = 0; n < publication.length; n++) {
            const publicationItem = publication.item(n);
            const recipeSpecJson = {
                id: publicationItem.getAttribute("id"),
                metadata: { recipe: { content: [] } }
            };
            const recipeMetadata = {};
            var namelikeJson;
            [["name"], ["abbreviation"], ["description"]].forEach(function(field) {
                const namelikeJson = {};
                self.addNamelike(publicationItem, namelikeJson, field);
                if (namelikeJson[field] && Object.keys(namelikeJson[field]).length > 0) {
                    recipeMetadata[field] = namelikeJson[field];
                }
            });
            if (Object.keys(recipeMetadata).length > 0) {
                recipeSpecJson["metadata"]["identification"] = recipeMetadata;
            }

            // Structure
            const structure = self.childElementByName(publicationItem, "structure");
            assert.isNotNull(structure);
            const structureChildren = structure.childNodes;
            const structureJson = recipeSpecJson["metadata"]["recipe"]["content"];
            self.buildRecipe(structureChildren, structureJson);
            self.sbMetadata["recipeSpecs"].push(recipeSpecJson);
        }
    }

    buildRecipe(domChildren, jsonTarget) {
        const self = this;
        for (var n3 = 0; n3 < domChildren.length; n3++) {
            const childNode = domChildren.item(n3);
            if (childNode.nodeType != 1) {
                continue;
            } else if (childNode.tagName == "content") {
                const elementJson = {
                    type: "element",
                    ingredient: childNode.getAttribute("src")
                };
                if (childNode.hasAttribute("name")) {
                    elementJson["nameId"] = childNode.getAttribute("name");
                }
                jsonTarget.push(elementJson);
            } else if (childNode.tagName == "division") {
                const sectionJson = {
                    type: "section"
                };
                if (childNode.hasAttribute("name")) {
                    sectionJson["nameId"] = childNode.getAttribute("name");
                }
                sectionJson["content"] = [];
                self.buildRecipe(childNode.childNodes, sectionJson["content"]);
                jsonTarget.push(sectionJson);
            }
        }
    }
}

export { DBLImport };
