var fs = require('fs');

global.defaults = {
  max_clips: 10,
  stats: {
    copies: 0,
    launchedItems: 0,
    utilitiesLaunched: 0,
    charactersCopied: 0,
    historyCopy: 0  // the number of times you clicked a number to copy.. for now
  },
  window: {
    width: 345,
    height: 355,
    x: 0, y: 0,
    useCustomCSS: false,
    customCSS: '.dragger {\n    background-color: rgba(0,0,0,.1) !important;\n    color: rgba(0,0,0,.8) !important;\n}\n\n.clip {\n    background-color:rgba(0,0,0,.5) !important;\n    color: rgba(255,255,255,.8) !important;\n}\n\n.clip-group {\n    background-color: rgba(0,0,0,.1) !important;\n}\n\n.clip-group span{\n    color: rgba(100,100,100,.8) !important;\n}\n.clip-group span:hover{\n    color: rgba(200,200,200,.8);\n}'
  },
  textarea: {
    height: 27,
    fontsize: 14
  },
  dynamicsearch: {
    width: 500,
    height: 400,
    top: 0,
    left: 0,
    autoscan: true
  }
};

module.exports = function(){
  var prefPath = global.root+'/preferences.json';
  if(!fs.existsSync(prefPath)){
    fs.writeFileSync(prefPath,JSON.stringify(global.defaults,null,2));
  }

  var pref = function(){
    this.load = function(){
      // load preferences from saved file
      global.preferences = require(prefPath);

      if(!global.preferences.stats){
        global.preferences.stats = global.defaults.stats;
      }
      if(!global.preferences.window){
        global.preferences.window = global.defaults.window;
      }
      if(!global.preferences.textarea){
        global.preferences.textarea = global.defaults.textarea
      }
      if(!global.preferences.dynamicsearch){
        global.preferences.dynamicsearch = global.defaults.dynamicsearch;
      }
    };

    this.save = function(){
      // save preferences to file
      fs.writeFileSync(prefPath,JSON.stringify(global.preferences,null,2));
    };
    return this;
  };

  return pref;
}
