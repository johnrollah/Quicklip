// node-webkit clipboard management application.
var gui = require('nw.gui');
global.gui = gui;
var Window = gui.Window.get();

var fs = require('fs');

Window.showDevTools();
// always on top of other windows
Window.setAlwaysOnTop(true);
Window.setTransparent(true);


// there appears to be some buggines with the object pathing.
// putting these in specific order
global.root = (process.env.APPDATA
            || process.env.HOME
            || process.env.HOMEPATH) + '/quicklip2';
if(!fs.existsSync(global.root)) fs.mkdirSync(global.root);

global.preferences = {};
var pref = require('./lib/pref')();
prefs = new pref();
prefs.load();
global.preferences.crud = prefs;
// move window to saved location
if(global.preferences.window){
  Window.moveTo(
    global.preferences.window.x || global.defaults.window.x,
    global.preferences.window.y || global.defaults.window.y
  );
  Window.resizeTo(
    global.preferences.window.width  || global.defaults.window.width,
    global.preferences.window.height || global.defaults.window.height
  );
}else{
  global.preferences.window = global.defaults.window;
}
if(!global.preferences.dynamicsearch){
  global.preferences.dynamicsearch = global.defaults.dynamicsearch;
}
// load textarea height/fontsize preferences
// debugging
global.debug = null;
global.utilityWindow = null;
global.utilities = [];
var clipboard = gui.Clipboard.get();
var qk = new require('./lib/quicklip')(document, clipboard, $);
var keybinds = require('./lib/keybinds')(gui,clipboard,qk);
keybinds.registerHotkeys();
global.dynSearch = new require('./lib/dynamicsearch')();

var tray = require('./lib/tray')(gui, qk);

// set textarea styles.
applyPreferences();
applyClipListeners();
// check for clipboard updates -- must be called this way for 'this' to be qk
// used to tell the change interval that the new clip shouldnt be scanned
global.Notifier = Notification;
global.changeFlag = false;
setInterval(function(){
  var changed = qk.checkClipboard();
  if(changed){
    changed = null;
    if(!global.changeFlag && global.preferences.dynamicsearch.autoscan) {
      var matched = global.dynSearch.scanString(qk.clips[0]);
      if(matched.length){
        global.utilities = matched; // this is how i pass matched to new indow
        var total = 0;
        for(var i in matched){
          total += matched[i].match.length;
        }
        matched = null;
        var notification = new Notification('Search Items Found!',{
          icon: 'icon.png',
          body: 'Found '+total+' items in last copy!\n\nClick to view!'
        });
        total = null;
        notification.addEventListener('click',function(){showUtilties()});
      }
    }
    // set the change flag back to false if was true from flagging
    global.changeFlag = false;
  }
},10);


// ************************************************************************
// Event Listeners
// ************************************************************************
// clips auto expand on focus
function applyClipListeners(){
  $('.clip').focusin(function(){
    if(this.clientHeight < this.scrollHeight){
      this.style.height = this.scrollHeight + 'px';
      if(this.clientHeight < this.scrollHeight){
        this.style.height = (this.scrollHeight * 2) - this.clientHeight + 'px';
      }
    }
  }).focusout(function(){
    this.style.height = global.preferences.textarea.height+'px';
  });
  $('.clip-group').click(function(e){
    if(e.target.id){
      e.preventDefault();
    }else{
      $('.clip').blur();
    }
  });
  // replace clipboard text when number is clicked
  $('span').mousedown(function(e){
    switch(e.which){
      case 1:
        // left mouse clicked
        clipboard.set($('#cl'+e.target.id).text());
        global.preferences.stats.historyCopy++;
        break;
      case 2:
      case 3:
        var clipNum = this.id;
        var matched = global.dynSearch.scanString(qk.clips[clipNum]);
        if(matched.length){
          global.utilities = matched;
          var total = 0;
          for(var i in matched){
            total += matched[i].match.length;
          }
          matched = null;
          var notification = new Notification('Search Items Found!',{
            icon: 'icon.png',
            body: 'Found '+total+' items in clip '+(Number(clipNum)+1)+'\n\nClick to view!'
          });
          total = clipNum = null;
          notification.addEventListener('click',function(){showUtilties()});
        }
        break;
      default:
        $('.clip').blur();
    }
  });
}
// save x,y when window is moved - for preferences
Window.on('move', function(x, y){
  global.preferences.window.x = x;
  global.preferences.window.y = y;
  prefs.save();
});
Window.on('resize', function(width, height){
  global.preferences.window.width = width;
  global.preferences.window.height = height;
  prefs.save();
});
Window.on('close', function(){
  // save clips before closing the application
  qk.saveClips();
  prefs.save();
  process.exit();
});


Window.window.addEventListener('message',function(event){
  switch(event.data.type){
    case 'prefs':
      var newPrefs = event.data.value;
      var tempPrefs = global.preferences;
      delete tempPrefs.crud;
      if(newPrefs != tempPrefs){
        global.preferences = newPrefs;
        global.preferences.crud = prefs;

        // clear the body and redraw elements.
        $('#clip-area').html('');
        qk.buildHTML();
        applyPreferences();
        applyClipListeners();
        // resize the window to be the best height for number of elements
        var temp = 0;
        $('.clip-group').each(function(){temp+=$(this).height();});
        temp += 15;
        Window.resizeTo($(window).width(), temp);
        temp = null;
      }
      newPrefs = null;
      break;
    case 'CSS':
      if(event.data.value){
        $('#custom').text(global.preferences.window.customCSS);
      }else{
        $('#custom').text('');
      }
  }
});


function applyPreferences(){
  if(global.preferences.window.useCustomCSS){
    $('#custom').text(global.preferences.window.customCSS);
  }
  $('.clip').each(function(){
    $(this).css({
      'height': global.preferences.textarea.height,
      'font-size': global.preferences.textarea.fontsize + 'px'
    });
  });
}

function showUtilties(){
  if(global.utilityWindow){
    global.utilityWindow.close(true);
    global.utilityWindow = null;
  }
  setTimeout(function() {
    global.utilityWindow = gui.Window.open('./web/utilities.html',{
      width: global.preferences.dynamicsearch.width,
      height: global.preferences.dynamicsearch.height,
      icon: './icon.png',
      title: 'QuicKlip - Launch Utility',
      toolbar: false,
      frame: false
    });
    global.utilityWindow.setAlwaysOnTop(true);
    global.utilityWindow.moveTo(
      global.preferences.dynamicsearch.x,
      global.preferences.dynamicsearch.y
    );
    global.utilityWindow.on('move',function(x,y){
      global.preferences.dynamicsearch.x = x;
      global.preferences.dynamicsearch.y = y;
      prefs.save();
    });
    global.utilityWindow.on('resize',function(width, height){
      global.preferences.dynamicsearch.width = width;
      global.preferences.dynamicsearch.height = height;
      prefs.save();
    });
    global.utilityWindow.on('closed',function(){
      global.utilityWindow.close(true);
      global.utilityWindow = null;
    });

  },100);
}
