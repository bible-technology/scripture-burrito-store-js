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
        // this.buildTargetAreas();
        // this.buildAgencies();
        // this.buildCopyright();
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
    
    buildLanguages() {
        this.sb02Metadata["languages"] = [
            {
                "tag": this.sb01Metadata["languages"][0]["bcp47"],
                "name": this.sb01Metadata["languages"][0]["name"]
            }
        ];
        this.sb02Metadata["meta"]["defaultLanguage"] = this.sb02Metadata["languages"][0]["tag"];
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
}

export { SB01Import };
