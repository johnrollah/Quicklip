var utilities = global.dynSearch.utils;
var util = null; // to be used later when modifying utils
var prevUrl = prevRegex= '';
resetForm();
// disable default form submits
$('form').keypress(function(e){
  if(e.keyCode == 13) e.preventDefault();
});
// enable tabs
$('.nav-tabs a').click(function (e) {
  e.preventDefault();
  $(this).tab('show');
});

// utility tab code
// set checkbox value for autoscan
$('#autoscan').prop('checked', global.preferences.dynamicsearch.autoscan);

reloadUtils();

$('#searchItems').change(function(e){
  if(!this.selectedOptions.length){
    $('#expression').val('');
    $('#itemUtilities').html('<option value="">Select Utility</option>');
    $('#utilityURL').val('');
  }else{
    util = utilities[this.selectedOptions[0].value];
    $('#expression').val(util.regex).prop('disabled', false);
    enableForm(util.regex,util.utilities);
  }
});

$('#itemUtilities').change(function(e){
  e.preventDefault();
  var index = $('#searchItems :selected').val();
  var url = global.dynSearch.utils[index].utilities[this.value].url;
  selectUtility(url);
});

$('#newUtil').click(function(e){
  e.preventDefault();
  if($(this).attr('disabled'))return;
  bootbox.prompt({
    title: 'New Utility Name',
    message: 'Name your new utility',
    className: 'dark',
    callback: function(result){
      if(!result) return;
      var newUtil = {
        name: result,
        url: 'http://www.replace.me?param={query}'
      };
      util.utilities.push(newUtil);
      for(var i in global.dynSearch.utils){
        var temp = global.dynSearch.utils[i];
        if(temp.name === util.name){
          global.dynSearch.utils[i].utilities.push(newUtil);
          global.dynSearch.save();
          break;
        }
      }
      $('#itemUtilities')
        .append('<option value="'+(util.utilities.length - 1)+'" selected>'+result+'</option>');
      $('#utilityURL').val(newUtil.url);
      $('#saveUrl').attr('disabled',true);
      temp = null;
    }
  });
});

$('#utilityURL').change(function(e){
  console.log(prevUrl,this.value);
  prevUrl = this.value;
  if(this.value.match('{query}')){
    $('#saveUrl').attr('disabled',false);
    $(this).removeClass('error').addClass('success');
  }else{
    $('#saveUrl').attr('disabled',true);
    $(this).removeClass('success').addClass('error');
  }


});


$('#deleteItem').click(function(e){
  if($(this).attr('disabled'))return;
  var index = $('#searchItems :selected').val();
  var utilName = utilities[index].name;
  e.preventDefault();
  bootbox.confirm({
    title: "Are you sure you want to delete the search item: "+ utilName,
    message: "Are you sure?",
    className: "dark",
    callback: function(result){
      if(result){
        global.dynSearch.delete(utilName);
        global.dynSearch.save();
        reloadUtils();
        resetForm();
      }
    }
  })
});

$('#createNew').click(function(e){
  e.preventDefault();
  if($(this).attr('disabled'))return;
  bootbox.prompt({
    title: 'New Search Item',
    message: "Name your new search item",
    className: 'dark',
    callback: function(result){
      if(!result) return; // dialog dismissed
      var used = false;
      for(var i in global.dynSearch.utils){
        if(global.dynSearch.utils[i].name == result)
        used = true;
        break;
      }
      if(used){
        bootbox.alert({
          title: 'Sorry!',
          message: 'A search item by that name already exists!',
          className: 'dark'
        });
        return;
      }

      global.dynSearch.createNew(result);
      global.dynSearch.save();
      reloadUtils(true);
      var len = global.dynSearch.utils.length;
      enableForm(
        global.dynSearch.utils[len - 1].regex,
        global.dynSearch.utils[len - 1].utilities
      );
      len = null;
    }
  });
})

// clips tab code
applyPreferences(); // apply current prefs to textarea preview
// apply on focus methods for textarea preview
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

$('#textarea-fontsize').on('keyup',function(e){
  $('.clip').css('font-size',this.value + 'px');
});
$('#textarea-height').on('keyup',function(e){
  $('.clip').css('height',this.value + 'px');
})


// cancel prefs window
$('#cancel').click(function(e){
  e.preventDefault();
  e.stopPropagation();
  window.close();
});
// save changed preferences
$('#save').click(function(e){
  e.preventDefault();
  e.stopPropagation();
  var preferences = {};
  preferences.window = global.preferences.window;
  preferences.dynamicsearch = global.preferences.dynamicsearch;
  preferences.dynamicsearch.autoscan = $('#autoscan').prop('checked');
  preferences.max_clips = $('#clipcount').val();
  preferences.textarea = {
    height: $('#textarea-height').val(),
    fontsize: $('#textarea-fontsize').val()
  };

  // write preferences to file
  require('fs').writeFile(global.root+'/preferences.json', JSON.stringify(preferences), function(err){
    if(err)console.error(err);
    window.opener.postMessage({ type:'prefs', value:preferences },'*');
    window.close();
  });
});
$('#clipcount').val(global.preferences.max_clips);
$('#textarea-fontsize').val(global.preferences.textarea.fontsize);
$('#textarea-height').val(global.preferences.textarea.height);

function applyPreferences(){
  $('.clip').each(function(){
    $(this).css({
      'height': global.preferences.textarea.height,
      'font-size': global.preferences.textarea.fontsize + 'px'
    });
  });
}

function reloadUtils(focusLast) {
  utilities = global.dynSearch.utils;
  $('#searchItems').html('');
  for(var i in utilities){
    var temp = utilities[i];
    if(focusLast && i == utilities.length - 1){
      $('#searchItems')
        .append('<option value="'+i+'" selected>'+temp.name+'</option>');
    }else{
      $('#searchItems')
        .append('<option value="'+i+'">'+temp.name+'</option>');
    }
  }
}

function selectUtility(url){
  if(!$('#saveUrl').attr('disabled')){
    bootbox.confirm({
      title: 'Cancel Changes to URL?',
      message: 'Are you sure you would like to cancel your changes to the utility url?',
      className: 'dark',
      callback: function(result){
        if(!result)return;
        $('#utilityURL').val(url);
        $('#utilityURL').prop('disabled',false);
        $('#saveUrl').attr('disabled',true);
      }
    });
  }else{
    $('#utilityURL').val(url);
    $('#utilityURL').prop('disabled',false);
    $('#saveUrl').attr('disabled',true);
  }
}

function resetForm(){
  prevRegex = '';
  $('#regex').val('');
  $('#itemUtilities').html('<option value="">Select Utility</option>');
  $('#utilityURL').val('');

  // text fields and selects
  $('#deleteItem').prop('disabled',true);
  $('#itemUtilities').prop('disabled',true);

  // buttons
  $('#saveRegex').attr('disabled',true);
  $('#delUtil').attr('disabled',true);
  $('#newUtil').attr('disabled',true);
  $('#saveUrl').attr('disabled',true);

}

function enableForm(regex,utilities){
  prevRegex = regex;
  for(var i in utilities){
    var temp = utilities[i];
    $('#itemUtilities')
      .append('<option value="'+i+'">'+temp.name+'</option>');
  }
  temp = null;
  $('#regex').val(regex);

  // text fields and selects
  $('#deleteItem').prop('disabled',false);
  $('#itemUtilities').prop('disabled',false);

  // buttons
  $('#saveRegex').attr('disabled',false);
  $('#newUtil').attr('disabled',false);
}
