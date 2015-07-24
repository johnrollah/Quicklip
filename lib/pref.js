var fs = require('fs');

module.exports = function(){
  if(!fs.existsSync(global.root+'/preferences.json')){
    fs.writeFileSync(global.root+'/preferences.json',JSON.stringify(global.defaults));
  }

  var pref = function(){
    this.load = function(){
      // load preferences from saved file
      global.preferences = require(global.root+'/preferences.json');
    };

    this.save = function(){
      // save preferences to file
      fs.writeFileSync(global.root+'/preferences.json', JSON.stringify(global.preferences));
    };
    return this;
  };

  return pref;
}
