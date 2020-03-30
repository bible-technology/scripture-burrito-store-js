# scripture-burrito-store-js
A Javascript implementation of the Scripture Burrito processing model.

## Project Structure

* **build**: Scripts and resources to make documentation and anything else that needs making

* **schema**: jsonschema schema

* **test**: Unit tests

* **doc**: Built documentation

* **code**: The JS!

## Running the Tests

```
cd test
npm run testAll
```

## Running Express

```
cd build
node setup_burrito_store.js some_burritos
cp -fr some_burritos ../express/some_burritos
cd ../express
npm start
# Connect on localhost:3000
```
