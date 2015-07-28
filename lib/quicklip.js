var fs = require('fs');
// establish the quicklip class
var QuicKlip = function(document, clipboard, $){
  this.clips = []; // an array that will contain prior clips
  this.stats = {}; // may use to store usage statistics

  if(fs.existsSync(global.root+'/clip_cache.json')){
    var tempStr = fs.readFileSync(global.root+'/clip_cache.json');
    if(tempStr == '') tempStr = '[]';
    this.clips = JSON.parse(tempStr);
    tempClips = tempStr = null;
  }
  // build elemnts for the number of clips
  this.buildHTML = function(){
    for(var i = 0; i < global.preferences.max_clips; i++){
      $('#clip-area')
        .append('<div class="clip-group"><span id="'+i+'">'+(i + 1)
               +'</span><textarea class="clip" id="cl'+i+'"></textarea></div>');
      document.getElementById('cl'+i).textContent = this.clips[i];
    }
  };
  this.buildHTML();

  this.checkClipboard = function(){
    var tempClip = clipboard.get();
    if(this.clips[0] !== tempClip && tempClip !== '') {
      this.moveClips(tempClip);
    }
    tempClip = null;
  };
  // move the clips down the array chain
  this.moveClips = function(newClip){
    this.clips.unshift(newClip);
    while(this.clips.length > global.preferences.max_clips){
      this.clips.pop();
    }
    for(var i in this.clips){
      document.getElementById('cl'+i).textContent = this.clips[i];
    }
  };
  // save current clips to backup json file for on load
  this.saveClips = function(){
    fs.writeFileSync(global.root+'/clip_cache.json', JSON.stringify(this.clips));
  };

  return this;
};

module.exports = QuicKlip;
