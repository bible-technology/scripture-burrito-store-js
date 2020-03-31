"use strict";

import { assert } from "chai";

class SB01Import {
    
    constructor(sb01Json) {
        this.sb01Metadata = sb01Json;
        this.sb02Metadata = {};
        this.buildMeta();
        this.buildIdServers();
        this.buildIdentification();
        // this.buildConfidentiality();
        // this.buildType();
        // this.buildRelationships();
        this.buildLanguages();
        // this.buildTargetAreas();
        // this.buildAgencies();
        // this.buildCopyright();
        // this.buildIngredients();
        // this.buildNames();
        // this.buildRecipeSpecs();
        // this.buildProgress();
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

    buildLanguages() {
        this.sb02Metadata["languages"] = [
            {
                "tag": this.sb01Metadata["languages"][0]["bcp47"],
                "name": this.sb01Metadata["languages"][0]["name"]
            }
        ];
        this.sb02Metadata["meta"]["defaultLanguage"] = this.sb02Metadata["languages"][0]["tag"];
    }
}

export { SB01Import };
