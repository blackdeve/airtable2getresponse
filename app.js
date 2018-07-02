const express = require('express');
var request = require('request');
const app = express();
const PORT = process.env.PORT || 5000

var Airtable = require('airtable');
var base = new Airtable({apiKey: 'keyJCRRojtU1jYCBB'}).base('appMm7V8XWifHqCja');

var array = [];
var fields = ['full_name', 'email'];

function getDataFromAirtable() {
  // Clear current fetched data array
  array = [];

  // Fetch data from Airtable
  base('QKids').select({
    // select options here
    fields: fields
  }).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function (record) {
      // console.log('Retrieved', record.get('country'));
      let newItem = {};
      for (let idx in fields) {
        const field = fields[idx];
        const value = record.get(field);
        newItem[field] = value !== undefined ? value : '';
      }
      array.push(newItem);
    });

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();

  }, function done(err) {
    if (err) { console.error(err); return; }
    postDataToGetresponse();
  });
}

function postDataToGetresponse() {
  console.log('Post data to Getresponse')
  for (var idx in array) {
    const contact = array[idx];

    const headers = {
      'Content-Type': 'application/json',
      'X-Auth-Token': 'api-key 46374eecbb4807ce3997154dbe9f7c1a'
    };
    const body = {
      name: contact.full_name,
      email: contact.email,
      campaign: {
        campaignId: '6FQmX'
      }
    };
    const options = {
      headers: headers,
      body: JSON.stringify(body)
    };

    request.post('https://api.getresponse.com/v3/contacts',
      options);
  }
}

getDataFromAirtable();

// Call `getDataFromAirtable` function every 1 min (60s).
setInterval(getDataFromAirtable, 1000 * 60);

app.get('/', (req, res) => {
  res.send('Hello!')
})

app.listen(PORT, () => console.log('App listening on port ', PORT))