var fs = require('fs');

module.exports = function(){
  var schema = [{
    regex: "regexp",                    // the regex to run against the string to match the associated things
    match: ['string'],                    // array of matched strings - to be sent back with object
    utilities: [{                       // the array of things
      name: 'string',                   // a user provided name for the thing - to show when selecting
      url: 'www.google.com?q={replace}' // the url with a special {flagged} area for inputting the string.
    }]
  }];
  // define utils json path
  var utilsPath = global.root+'/DynSearch.json';
  // verify tools json exists - create if not.
  if(!fs.existsSync(utilsPath)){
    fs.writeFileSync(utilsPath,'[]');
  };
  // get the urils json
  var utils = require(utilsPath);

  this.scanString = function(str){
    // take in a string: the recent clip - and scan for various tool matches
    var matched = [];
    for(var i in utils){
      var regex = new RegExp(utils[i].regex, 'g');
      var check = str.match(regex);
      if(check) {
        for(var x in check){
          // if already in array dont push in another
          if(utils[i].match.indexOf(check[x]) !== -1) continue;
          utils[i].match.push(check[x]);
        }
        matched.push(utils[i]);
        check = null;
      }
    }
    regex = check = null;
    return matched;
  };

  this.resetMatched = function(){
    for(var i in utils){
      utils[i].match = [];
    }
  };

  this.getUtils = function(){
    return utils;
  };

  this.reloadUtils = function(){
    return utils = require(utilsPath);
  }

  return this;
};
