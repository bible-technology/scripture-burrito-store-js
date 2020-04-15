# scripture-burrito-store-js

A Javascript implementation of the Scripture Burrito processing model.

## Project Structure

* **build**: Scripts and resources to make documentation and anything else that needs making

* **schema**: jsonschema schema

* **test**: Unit tests

* **doc**: Built documentation

* **code**: The JS!

## Running the Tests

The unit tests are written with mocha as the test executor. The module provides several scripts to run some or all tests. In order to run all tests, use `npm test`.

Mocha is required to be installed, so run `npm install mocha; npm test` for all tests. Other targets are "testSmoke", "testSchema", "testDbl", "testBundleImport", "testDblOab", "testSB01"

## Running Express

The module comes with a demo web-app launched using the express framework. In order to run the app, invoke `npm start`, which will launch a web server running on <http://localhost:3000/>
