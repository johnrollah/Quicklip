var utilities = global.utilities;
var selected = [];
global.utilities = null;

// build the tools options upon load of the page
$(function(){
  for(var i in utilities){
    var util = utilities[i];
    for(var x in util.match){
      var match = util.match[x];
      $('#matches')
        .append('<option value="'+i+'">'+match+'</option>');
    }
  }
  $('#matches').change(function(e){
    global.debug = this.selectedOptions;
    e.stopPropagation();
    $('#utilities').html('');
    selected = [];
    for(var i in this.selectedOptions){
      if(isNaN(i)) continue;
      var temp = this.selectedOptions[i];

      var utils = utilities[temp.value].utilities;
      for(var x in utils){
        var util = utils[x];
        if(selected.indexOf(util.name) === -1){
          selected.push(util.name);
          $('#utilities')
            .append('<option value="'+temp.value+'">'+util.name+'</option>');
        }
      }
    }
  });
});

$('#run').click(function(e){
  e.preventDefault();
  e.stopPropagation();
  $("#utilities option:selected").each(function(){
    var selectedUtil = this;
    $('#matches option:selected').each(function(){
      var temp = utilities[this.value].utilities;
      for(var i in temp){
        if(temp[i].name == selectedUtil.textContent){
          // replace {query} with searched text
          var open = temp[i].url.replace('{query}', this.textContent);
          global.gui.Shell.openExternal(open);
          window.close();
          open = null;
        }
      }
    });
  });
});
$('#cancel').click(function(e){
  e.preventDefault();
  e.stopPropagation();
  window.close();
})
