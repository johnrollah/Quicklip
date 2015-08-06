//var rjs = require('robotjs');
var Promise = require('./bluebird');
var Register = Promise.promisify(gui.App.registerGlobalHotKey);
module.exports = KeybindController;


function KeybindController(gui,clipboard,qk){
  var self = this;

  self.registerHotkeys = function(){
    var keys = [];
    for(var i=0; i < 9; i++){

      var options = {
        clip: (i==0)? 9 :i-1,
        noti: (i==0)? 10:i,
        key: 'Ctrl+'+i,
      };
      keys.push(options);
    }
    console.log(keys);

    new Promise.map(keys,function(key){
        var shortcut = new gui.Shortcut(key);
        shortcut.on('active', function(){
          global.changeFlag = true; // dont scan the clipboards changed contents
          clipboard.set(qk.clips[key.clip]);
          console.log('clipboard.set to clip #',i, '  for hotkey: '+key.key);
          var notification = new global.Notifier('Search Items Found!',{
            icon: 'icon.png',
            body: 'Clip #'+key.noti+' contents placed in clipboard!'
          });
          total = null;
          notification.addEventListener('click',function(){console.log('clicked notification');});
        })
        shortcut.on('failed', function(msg){console.log(msg)});
        return Register(shortcut).done(function(){console.log('registered hotkey');});
      });
  };
  return self;
}
