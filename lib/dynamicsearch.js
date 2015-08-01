var fs = require('fs');

module.exports = function(){
  // the default new search item json
  var newItem = {
    name: "",
    regex: "^Replace(Me)$",
    match: [],
    utilities: []
  };
  // the default new utility json
  var newUtil = {
    name: '',
    url: 'www.replace.me/?param={query}'
  };
  // define utils json path
  var utilsPath = global.root+'/DynSearch.json';
  // verify tools json exists - create if not.
  if(!fs.existsSync(utilsPath) || fs.readFileSync(utilsPath)==''){
    fs.writeFileSync(utilsPath,'[]');
  };
  // get the utils json
  this.utils = require(utilsPath);

  this.save = function(){
    fs.writeFileSync(utilsPath, JSON.stringify(this.utils,null,2));
  };

  this.reloadUtils = function(){
    return this.utils = require(utilsPath);
  };

  this.scanString = function(str){
    // take in a string: the recent clip - and scan for various tool matches
    var matched = [];
    for(var i in utils){
      var regex = new RegExp(utils[i].regex, 'g');
      var check = str.match(regex);
      if(check) {
        for(var x in check){
          // if already in array dont push in another
          if(this.utils[i].match.indexOf(check[x]) !== -1) continue;
          this.utils[i].match.push(check[x]);
        }
        matched.push(this.utils[i]);
        check = null;
      }
    }
    regex = check = null;
    return matched;
  };

  this.createNew = function(name){
    var temp = newItem;
    temp.name = name;
    this.utils.push(temp);
    temp = null;
  };

  this.resetMatched = function(){
    for(var i in this.utils){
      this.utils[i].match = [];
    }
  };

  this.updateUtilityUrl = function(itemIndex,utilIndex,newUrl){
    this.utils[itemIndex].utilities[utilIndex].url = newUrl;
    this.save();
  };

  this.deleteUtility = function(itemIndex,utilIndex){
    this.utils[itemIndex].utilities.splice(utilIndex+1,1);
    this.save();
  };

  this.createUtility = function(itemIndex,newUtil){
    var used = false;
    for(var i in this.utils[itemIndex].utilities){
      var temp = this.utils[itemIndex].utilities[i];
      if(temp.name === newUtil.name){
        used = true;
        break;
      }
    }
    if(used)return false;
    this.utils[itemIndex].utilities.push(newUtil);
    this.save();
    return true;
  };


  return this;
};
