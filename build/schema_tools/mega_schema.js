/**
Merges all SB subschema into one huge schema.
Makes various assumptions about how the subschema are structured.
In other words, this is not intended to be a general-purpose JSON Schema tool.
*/

const fse = require('fs-extra');
const path = require('path');

const MegaSchema = class MegaSchema {
  
  constructor() {
    this.megaSchema = {};
    this.subSchema = {};
    this.topSchema = null;
    this.currentSchema = null;
    this.currentFile = null;
  }
  
  init(schemaPath) {
    this.currentFile = path.resolve(schemaPath);
    this.scanFile(JSON.parse(fse.readFileSync(this.currentFile)));
    this.collectSubSchema();
  }

  rewriteRefs(internalPath, thing) {
    const self = this;
    if (Array.isArray(thing)) {
      thing.forEach(v => self.rewriteRefs(internalPath, v));
    } else if (typeof(thing) === "object" && thing !== null) {
      self.rewriteObject(internalPath, thing);
    }
  }

  rewriteObject(internalPath, thing) {
    const self = this;
    for (const [k, v] of Object.entries(thing)) {
      if (k === "$ref") {
        thing[k] = this.newRef(internalPath, v);
      } else {
          self.rewriteRefs(internalPath, v);  
      }
    }
  }

  newRef(internalPath, oldRef) {
    var ret;
    if (oldRef.includes("#")) {
      const [refFile, refFrag] = oldRef.split("#");
      if (refFile == "") {
        ret = "#" + internalPath + refFrag;
      } else {
        ret = "#" + this.internalPath(refFile) + refFrag;
      }
    } else {
      ret = "#" + this.internalPath(oldRef);
    }
    return ret;
  }

  scanFile(thing) {
    this.scan(thing);
  }
  
  scan(thing) {
    const self = this;
    if (Array.isArray(thing)) {
      thing.forEach(v => self.scan(v));
    } else if (typeof(thing) === "object" && thing !== null) {
      Object.entries(thing).forEach(function([k, v]) {self.scanTuple(k, v)});
    }
  }

  scanReferencedFile(fp) {
    const previousFile = this.currentFile;
    const newFile = path.resolve(path.dirname(this.currentFile), fp);
    if (!(newFile in this.subSchema)) {
      this.currentFile = newFile;
      this.scan(JSON.parse(fse.readFileSync(this.currentFile)));
      this.currentFile = previousFile;
    }
  }

  internalPath(filePath, fragment) {
    var ret = "/subSchema/" + path.basename(filePath).split('.')[0];
    if (fragment) {
      ret += fragment;
    }
    return ret;
  }
  
  scanTuple(k, v) {
    if (k === "$id") {
      this.currentSchema = v;
      if (this.topSchema == null) {
        this.topSchema = v;
      }
      this.subSchema[this.currentFile] = {
        "url": v,
        "internalPath": this.topSchema === this.currentSchema ? null : this.internalPath(this.currentFile),
        "fragments": {}
      };
    } else if (k === "$ref") {
      const filePath =  v.includes("#") ? v.split("#")[0] : v;
      const fragment = v.includes("#") ? v.split("#")[1] : null;
      if (filePath) {
        this.scanReferencedFile(filePath);
      }
      if (fragment) {
        const fragmentFilePath = filePath ? path.resolve(path.dirname(this.currentFile), filePath) : this.currentFile;
        this.scanReferencedFile(fragmentFilePath);
        const fragments = this.subSchema[fragmentFilePath]["fragments"];
        if (!(fragment in fragments)) {
          fragments[fragment] = {"internalPath": this.internalPath(fragmentFilePath, fragment)};
        }
      }
    } else {
      this.scan(v);
    }
  }

  collectSubSchema() {
    this.megaSchema["subSchema"] = {};
    for (const [ssPath, ssProps] of Object.entries(this.subSchema)) {
      if (ssProps["internalPath"] == null) {
        const mainSchema = JSON.parse(fse.readFileSync(ssPath));
        mainSchema["$id"] = "https://burrito.bible/schema/mega.schema.json";
        this.rewriteRefs("/subSchema", mainSchema);
        for (const [k, v] of Object.entries(mainSchema)) {
          this.megaSchema[k] = v;
        }
      } else {
        const subSchemaKey = ssProps["internalPath"].split("/")[2];
        this.megaSchema["subSchema"][subSchemaKey] = JSON.parse(fse.readFileSync(ssPath));
        delete this.megaSchema["subSchema"][subSchemaKey]["$schema"];
        delete this.megaSchema["subSchema"][subSchemaKey]["$id"];
        delete this.megaSchema["subSchema"][subSchemaKey]["$$target"];
        this.rewriteRefs(ssProps["internalPath"], this.megaSchema["subSchema"][subSchemaKey]);
      }
    }
  }
  
}

const m = new MegaSchema();
m.init("../../schema/sb/metadata.schema.json");
console.log(JSON.stringify(m.megaSchema, null, 2));
