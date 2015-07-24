module.exports = function(gui, qk){
  function showOptions(){
    var prefsWindow = gui.Window.get().window.open('./html/options.html', {
      position: 'center',
      width: 800,
      height: 600,
      frame: false,
      toolbar: true
    });
    
  }
  function exitApp(){
    qk.saveClips();
    gui.App.quit();
  }

  var tray = new gui.Tray({title: 'QuicKlip2', icon: 'icon.png', 'tooltip': 'QuicKlip2'});
  var menu = new gui.Menu();
  menu.append(new gui.MenuItem({type: 'normal', 'label': 'Preferences', click: showOptions}));
  menu.append(new gui.MenuItem({type: 'normal', 'label': 'DevTools *debug*', click: function(){gui.Window.get().showDevTools()}}));
  menu.append(new gui.MenuItem({type: 'separator'}));
  menu.append(new gui.MenuItem({type: 'normal', 'label': 'Close Application', click: exitApp}))
  tray.menu = menu;
  return tray;
}
