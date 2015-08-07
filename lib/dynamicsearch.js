var fs = require('fs');
var urlRegex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z(x|0|1){00a1}\-(x|0|1){ffff}0-9]+-?)*[a-z(x|0|1){00a1}\-(x|0|1){ffff}0-9]+)(?:\.(?:[a-z(x|0|1){00a1}\-(x|0|1){ffff}0-9]+-?)*[a-z(x|0|1){00a1}\-(x|0|1){ffff}0-9]+)*(?:\.(?:[a-z(x|0|1){00a1}\-(x|0|1){ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/;
module.exports = function(){
  // the default new search item json
  var newItem = {
    name: "",
    regex: "^(.*|ReplaceMeIMatchEverything)$",
    match: [],
    utilities: []
  };
  // the default new utility json
  var newUtil = {
    name: '',
    url: 'http://www.google.com/search?q={query}'
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

    str = str.trim();
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
      }
    }
    regex = check = null;
    return matched;
  };

  this.createNew = function(name){
    for(var i in this.utils){
      if(this.utils[i].name == name){
        return false;
      }
    }
    var temp = newItem;
    temp.name = name;
    this.utils.push(temp);
    this.save();
    temp = null;
    return true;
  };
  this.renameItem = function(index,name){
    for(var i in this.utils){
      if(this.utils[i].name == name){
        return false;
      }
    }
    this.utils[index].name = name;
    this.save();
    return true;
  }
  this.deleteItem = function(index){
    this.utils.splice(index,1);
    this.save();
  }

  this.resetMatched = function(){
    for(var i in this.utils){
      this.utils[i].match = [];
    }
  };

  this.renameUtility = function(itemIndex,utilIndex,name){
    for(var i in this.utils[itemIndex].utilities){
      if(this.utils[itemIndex].utilities[i].name == name){
        return false;
      }
    }
    this.utils[itemIndex].utilities[utilIndex].name = name;
    this.save();
    return true;
  }

  this.updateUtilityUrl = function(itemIndex,utilIndex,newUrl){
    this.utils[itemIndex].utilities[utilIndex].url = newUrl;
    this.save();
  };

  this.deleteUtility = function(itemIndex,utilIndex){
    this.utils[itemIndex].utilities.splice(utilIndex,1);
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

  this.importFile = function(filePath){
    var doc = fs.readFileSync(filePath, 'utf8');
    var returnObj = {
      success: true,
      message: ''
    };
    try{
      var inputArray = JSON.parse(doc);
      for(var i in inputArray){
        var newItem = {};
        var item = inputArray[i];
        var skipItem = false;
        // verify item with this name doesnt already exist;
        for(var x in this.utils){
          if(this.utils[x].name == item.name){
            skipItem = true;
            break;
          }
        }
        if(skipItem) continue;
        newItem.name = item.name;
        try{
          var newRegex = new RegExp(item.regex,'g');
          newItem.regex = item.regex;
        }catch(e){
          returnObj.success = false;
          returnObj.message = item.name + " has a bad Regular Expression:\n\n"+item.regex+'\n\n'+e;
          return returnObj;
        }
        newItem.utilities = [];
        for(var u in item.utilities){
          var util = item.utilities[u];
          var temp = util.url.replace('{query}','');
          if(!urlRegex.test(temp)) continue;
          if(!/\{query\}/.test(util.url)) continue;
          var skipUtil = false; // verify they arent adding duplicate named utils
          for(var z in newItem.utilities){
            if(newItem.utilities[z].name == util.name){
              skilUtip = true;
              break;
            }
          }
          if(skipUtil) continue;
          newItem.utilities.push(util);
        }
        this.utils.push(newItem);
      }
      return returnObj;
    }catch(e){
      global.debug = e;
      console.error(e);
      returnObj.success = false;
      returnObj.message = "File corrupt, unable to parse JSON:\n\n"+e;
      return returnObj;
    }
  }

  return this;
};
