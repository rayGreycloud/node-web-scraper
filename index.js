const rp = require('request-promise');
const cheerio = require('cheerio');
const Table = require('cli-table');

let users = [];
let table = new Table({
  head: ['username', '❤', 'challenges'],
  colWidths: [15, 5, 10]
});

const options = {
  url: `https://forum.freecodecamp.org/directory_items?period=weekly&order=likes_received&_=1518604435748`,
  json: true
}

function getChallengesCompleted(userData) {
  var i = 0;
  
  function next() {
    if (i < userData.length) {
      var options = {
        url: `https://www.freecodecamp.org/${userData[i].name}`,
        transform: body => cheerio.load(body)
      };
      
      rp(options)
        .then((data) => {
          process.stdout.write(`.`);
          const hasAccount = data('h1.landing-heading').length == 0;
          const challengesPassed = hasAccount ? data('tbody tr').length : 'unknown';
          
          table.push([userData[i].name, userData[i].likes_received, challengesPassed]);
          
          i++;
          return next();
        });
    } else {
      printData();
    }
  }
  return next();
};

function printData() {
  console.log("Done.")
  console.log(table.toString());
}

rp(options)
  .then((data) => {
    let userData = [];
    
    for (let user of data.directory_items) {
      userData.push({ 
        name: user.user.username,
        likes_received: user.likes_received
      });
    }
    
    process.stdout.write('loading...');

    getChallengesCompleted(userData);
  })
  .catch ((err) => {
    console.log(err);
  });