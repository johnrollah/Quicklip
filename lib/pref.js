var fs = require('fs');

module.exports = function(){
  var prefPath = global.root+'/preferences.json';
  if(!fs.existsSync(prefPath)){
    fs.writeFileSync(prefPath,JSON.stringify(global.defaults,null,2));
  }

  var pref = function(){
    this.load = function(){
      // load preferences from saved file
      global.preferences = require(prefPath);
    };

    this.save = function(){
      // save preferences to file
      fs.writeFileSync(prefPath,JSON.stringify(global.preferences,null,2));
    };
    return this;
  };

  return pref;
}
