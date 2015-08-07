var fs = require('fs');
// establish the quicklip class
var QuicKlip = function(document, clipboard, $){
  var self = this;
  this.clips = []; // an array that will contain prior clips
  this.stats = {}; // may use to store usage statistics

  if(fs.existsSync(global.root+'/clip_cache.json')){
    var tempStr = fs.readFileSync(global.root+'/clip_cache.json');
    if(tempStr == '') tempStr = '[]';
    this.clips = JSON.parse(tempStr);
    if(typeof this.clips[0] === 'string'){
      // update legacy clips to new format
      for(var i in this.clips){
        var temp = this.clips[i];
        this.clips[i] = {
          string: temp,
          locked: false,
          lockedText: ''
        };
      }
    }
    temp = tempClips = tempStr = null;
  }else{
    for(var i = 0; i < global.preferences.max_clips; i++){
      this.clips[i] = {
        string: '',
        locked: false,
        lockString: ''
      };
    }
  }
  // build elemnts for the number of clips
  this.buildHTML = function(){
    for(var i = 0; i < global.preferences.max_clips; i++){
      $('#clip-area')
        .append(
          '<div class="clip-group"><span class="num" id="'+i+'">'+(i + 1)+'</span>'+
            '<textarea class="clip" id="cl'+i+'"></textarea>'+
            '<div class="lock">'+
              '<input type="checkbox" class="form-control" id="lock'+i+'" '+(this.clips[i].locked ? 'checked':'')+'>'+
            '</div>'+
          '</div>'
        );
      document.getElementById('cl'+i).textContent =
        this.clips[i].locked ? this.clips[i].lockString : this.clips[i].string;
    }
  };
  this.buildHTML();

  this.checkClipboard = function(){
    var tempClip = clipboard.get();

    if(this.clips[0].string !== tempClip && tempClip !== ''){
      if(global.changeFlag && tempClip === this.clips[global.changeClip].string){
        return false;
      }else if(global.changeFlag
            && this.clips[global.changeClip].locked
            && this.clips[global.changeClip].lockString === tempClip){
        return false;
      }else if(global.changeFlag){
        global.changeFlag = false;
        global.changeFlag = null;
      }
      global.preferences.stats.copies++;
      global.preferences.stats.charactersCopied += tempClip.length;
      var moved = this.moveClips(tempClip)
      //console.log('clip changed', moved);
      return moved;
    }
    return false;
  };
  // move the clips down the array chain
  this.moveClips = function(newClip){
    while(this.clips.length > global.preferences.max_clips){
      this.clips.pop();
    }
    //console.log('before',this.clips);
    for(var i = this.clips.length-1; i >= 0; i--){
      this.clips[i].string = (i == 0 ? newClip : this.clips[i-1].string);
      if(this.clips[i].locked){
        document.getElementById('cl'+i).textContent = this.clips[i].lockString;
      }else{
        document.getElementById('cl'+i).textContent = this.clips[i].string;
      }
    }
    return true;
    // console.log('after',this.clips);
  };
  // save current clips to backup json file for on load
  this.saveClips = function(){
    fs.writeFileSync(global.root+'/clip_cache.json', JSON.stringify(this.clips,null,2));
  };

  return this;
};

module.exports = QuicKlip;
