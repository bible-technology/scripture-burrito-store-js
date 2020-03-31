"use strict";

import { assert } from "chai";

class SB01Import {
    constructor(sb01Json) {
        this.sb01Metadata = sb01Json;
        this.sb02Metadata = {};
    }
}

export { SB01Import };
