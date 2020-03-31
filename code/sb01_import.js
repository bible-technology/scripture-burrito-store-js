"use strict";

import { assert } from "chai";

class SB01Import {
    
    constructor(sb01Json) {
        this.sb01Metadata = sb01Json;
        this.sb02Metadata = {};
        this.buildMeta();
        this.buildIdServers();
        this.buildIdentification();
        this.buildConfidentiality();
        this.buildType();
        // this.buildRelationships();
        this.buildLanguages();
        this.buildTargetAreas();
        this.buildAgencies();
        this.buildCopyright();
        this.buildIngredients();
        // this.buildNames();
        // this.buildRecipeSpecs();
        // this.buildProgress();
    }

    flavorName(medium) {
        const lookup = {
            glossedTextStory: "textStories"
        };
        if (medium in lookup) {
            return lookup[medium];
        } else {
            return medium;
        }
    }

    buildMeta() {
        this.sb02Metadata["meta"] = {
            "variant": "source",
            "version": "0.2.0",
            "dateCreated": "2020-03-31T09:04:10.3+02:00",
            "generator": {
                "softwareName": "SB01Import",
                "softwareVersion": "0.0.0",
            },
            "comments": [this.sb01Metadata.snapshot.comments]
        };
    }

    buildIdServers() {
        const idServerKey = Object.keys(this.sb01Metadata["idServer"])[0];
        const idServerUrl = Object.values(this.sb01Metadata["idServer"])[0];
        this.sb02Metadata["idServers"] = {
            idServerKey: {
                "id": idServerUrl
            }
        }
    }

    buildIdentification() {
        const self = this;
        self.sb02Metadata["identification"] = {
            "idServer": Object.keys(this.sb01Metadata["idServer"])[0]
        };
        ["name", "abbreviation", "description", "systemId"].forEach(
            function (field) {
                if (field in self.sb01Metadata["identification"]) {
                    self.sb02Metadata["identification"][field] = self.sb01Metadata["identification"][field];
                }
            }
        );
    }

    buildConfidentiality() {
        this.sb02Metadata["confidentiality"] = this.sb01Metadata["type"]["confidentiality"];
    }

    buildType() {
        this.sb02Metadata["type"] = {
            "flavorType": {
                "name": this.sb01Metadata["type"]["flavorType"],
                "flavor": {
                    "name": this.flavorName(this.sb01Metadata["type"]["flavor"])
                },
                "canonType": [
                    "ot",
                    "nt"
                ],
                "canonSpec": {
                    "ot": {
                        "name": "western"
                    },
                    "nt": {
                        "name": "western"
                    }
                },
                "currentScope": {}
            }
        }
    }

    buildRelationships() {
        throw new Error("Not Implemented");
    }
    
    buildLanguages() {
        this.sb02Metadata["languages"] = [
            {
                "tag": this.sb01Metadata["languages"][0]["bcp47"],
                "name": this.sb01Metadata["languages"][0]["name"]
            }
        ];
        this.sb02Metadata["meta"]["defaultLanguage"] = this.sb02Metadata["languages"][0]["tag"];
    }

    buildTargetAreas() {
        this.sb02Metadata["targetAreas"] = [];
        for (const ta of this.sb01Metadata["countries"]) {
            this.sb02Metadata["targetAreas"].push(
                {
                    "name": ta["name"],
                    "code": ta["iso"]
                }
            );
        }
    }

    buildAgencies() {
        const self = this;
        this.sb02Metadata["agencies"] = [];
        for (const agency of this.sb01Metadata["agencies"]) {
            const aj = {
                "id": agency["id"],
                "url": agency["url"],
                "name": agency["name"],
                "roles": []
            };
            if ("abbr" in agency) {
                aj["abbr"] = {};
                aj["abbr"][self.sb02Metadata["meta"]["defaultLanguage"]] = agency["abbr"];
            };
            for (let
                 [fromField, toField]
                 of
                 [
                     ["isRightsHolder", "rightsHolder"],
                     ["contributes_content", "content"],
                     ["contributes_publication", "publication"],
                     ["contributes_management", "management"],
                     ["contributes_finance", "finance"],
                     ["contributes_qa", "qa"]
                 ]
                ) {
                if (fromField in agency && agency[fromField]) {
                    aj["roles"].push(toField);
                }
            }
            this.sb02Metadata["agencies"].push(aj);
        }
    }

    buildCopyright() {
        const self = this;
        self.sb02Metadata["copyright"] = {};
        for (const statement of self.sb01Metadata["copyright"]) {
            const statementKey = statement["type"] + "Statement" + statement["format"].substring(0,1).toUpperCase() + statement["format"].substring(1);
            self.sb02Metadata["copyright"][statementKey] = {};
            self.sb02Metadata["copyright"][statementKey][statement["lang"]] = statement["content"];
        }
    }
    
    buildIngredients() {
        const self = this;
        self.sb02Metadata["ingredients"] = {};
        for (let [url, ingredient] of Object.entries(self.sb01Metadata["ingredients"])) {
            self.sb02Metadata["ingredients"][url] = {
                "mimeType": ingredient["mimeType"],
                "checksum": {"md5": ingredient["checksum"]},
                "size": ingredient["size"]
            }
            if ("scopeOrRole" in ingredient) {
                if (ingredient["scopeOrRole"].match("^[A-Z0-6]{3}.*")) {
                    const localScope = {};
                    for (const bookScope of ingredient["scopeOrRole"].split(";")) {
                        const bookCode = bookScope.substring(0,3);
                        for (const cv of  bookScope.substring(4).split(",")) {
                            if (!(bookCode in this.sb02Metadata["type"]["flavorType"]["currentScope"])) {
                                this.sb02Metadata["type"]["flavorType"]["currentScope"][bookCode] = [];
                            }
                            this.sb02Metadata["type"]["flavorType"]["currentScope"][bookCode].push(cv);
                            if (!(bookCode in localScope)) {
                                localScope[bookCode] = [];
                            }
                            localScope[bookCode].push(cv);
                        }
                    }
                    self.sb02Metadata["ingredients"][url]["scope"] = localScope;
                } else {
                    self.sb02Metadata["ingredients"][url]["role"] = ingredient["scopeOrRole"];
                }
            }
        }
    }

    buildNames() {
        throw new Error("Not Implemented");
    }
    
    buildRecipeSpecs() {
        throw new Error("Not Implemented");
    }

    buildProgress() {
        throw new Error("Not Implemented");
    }

}

export { SB01Import };
