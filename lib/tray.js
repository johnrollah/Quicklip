module.exports = function(gui, qk){
  var self = this;
  self.prefsWindow = null;


  function showOptions(){
    if(self.prefsWindow !== null){
      self.prefsWindow.close(true);
      self.prefsWindow = null;
    }
    setTimeout(function(){
      self.prefsWindow = gui.Window.open('./web/options.html', {
        position: 'center',
        icon : "icon.png",
        width: 800,
        height: 560,
        frame: false,
        toolbar: false
      });

      self.prefsWindow.on('closed',function(){
        self.prefsWindow = null;
      });
    },100);
  }

  function exitApp(){
    qk.saveClips();
    global.preferences.crud.save();
    gui.App.quit();
  }

  var tray = new gui.Tray({title: 'QuicKlip', icon: 'icon.png', 'tooltip': 'QuicKlip2'});
  var menu = new gui.Menu();
  menu.append(new gui.MenuItem({type: 'normal', 'label': 'Open Dev Tools', click: function(){gui.Window.get().showDevTools()}}));
  menu.append(new gui.MenuItem({type: 'normal', icon: 'cog.png', 'label': 'Preferences', click: showOptions}));
  menu.append(new gui.MenuItem({type: 'separator'}));
  menu.append(new gui.MenuItem({type: 'normal', icon: 'close.png', 'label': 'Close Application', click: exitApp}))
  tray.menu = menu;
  return tray;
}
