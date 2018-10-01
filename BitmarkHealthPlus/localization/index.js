let url = 'https://docs.google.com/spreadsheets/d/1dU6PllWnsLdgppzx7kOBFcW5ZgU8aS7g-vRYT-S4VF4/export?format=csv';

let axios = require('axios');
let fse = require('fs-extra');
let csv = require("csv-string");

axios.get(url).then(response => {
  let lines = csv.parse(response.data);
  let jsonData = {};
  let componentName, languages = [];
  let items = lines[0];
  jsonData['id'] = {};
  for (let lgIndex = 1; lgIndex < items.length; lgIndex++) {
    languages.push(items[lgIndex]);
    jsonData[items[lgIndex]] = {};
  }

  for (let index = 1; index < lines.length; index++) {
    items = lines[index];
    if (!componentName) {
      if (!items[0]) {
        break;
      }
      componentName = items[0];
    } else {
      if (!items[0]) {
        componentName = null;
      } else {
        jsonData['id'][componentName + '_' + items[0]] = componentName + '_' + items[0];
        for (let itemIndex = 1; itemIndex < items.length; itemIndex++) {
          jsonData[languages[itemIndex - 1]][componentName + '_' + items[0]] = items[itemIndex] || componentName + '_' + items[0];
        }
      }
    }
  }
  fse.writeFile('./../assets/localizations.json', JSON.stringify(jsonData, null, 2));
}).catch(error => {
  console.log('error:', error);
});
