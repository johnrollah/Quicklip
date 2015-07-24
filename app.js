// node-webkit clipboard management application.
var gui = require('nw.gui');
var Window = gui.Window.get();

var fs = require('fs');
Window.showDevTools();
// always on top of other windows
Window.setAlwaysOnTop(true);
Window.setTransparent(true);
// debug purposes

global.root = process.env.HOME + '/quicklip2'; // using home because mac/linux
if(!fs.existsSync(global.root)) fs.mkdirSync(global.root);

global.defaults = {
  max_clips: 10,
  window: {
    width: 345,
    height: 515,
    x: 0, y: 0
  },
  textarea: {
    height: 27,
    fontsize: 14
  }
};
global.preferences = {};

var pref = require('./lib/pref')();
var prefs = new pref();
prefs.load();
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
// load textarea height/fontsize preferences

var clipboard = gui.Clipboard.get();
var qk = new require('./lib/quicklip')(document, clipboard, $);
var dynamicSearch = new require('./lib/dynamicsearch')(qk);
var tray = require('./lib/tray')(gui, qk);

// set textarea styles.
applyPreferences();
applyClipListeners();
// check for clipboard updates -- must be called this way for 'this' to be qk
setInterval(function(){qk.checkClipboard()},10);


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
  });
  // collapse on  losing focus
  $('.clip').focusout(function(){
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
  $('span').click(function(e){
    switch(e.which){
      case 1:
        // left mouse clicked
        clipboard.set($('#cl'+e.target.id).text());
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
  process.exit();
});

function prefsDiff(){
  if(global.preferences != require('./preferences.json')){
    return 'different';
  }else{
    return 'same';
  }
}

Window.window.addEventListener('message',function(event){
  switch(event.data.type){
    case 'prefs':
      var newPrefs = event.data.value;
      if(newPrefs != global.preferences){
        global.preferences = newPrefs;
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
  }
});


function applyPreferences(){
  $('.clip').each(function(){
    $(this).css({
      'height': global.preferences.textarea.height,
      'font-size': global.preferences.textarea.fontsize + 'px'
    });
  });
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
