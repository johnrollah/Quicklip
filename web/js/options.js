var utilities = global.dynSearch.utils;
var prevUrl = prevRegex= '';
var urlRegex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z(x|0|1){00a1}\-(x|0|1){ffff}0-9]+-?)*[a-z(x|0|1){00a1}\-(x|0|1){ffff}0-9]+)(?:\.(?:[a-z(x|0|1){00a1}\-(x|0|1){ffff}0-9]+-?)*[a-z(x|0|1){00a1}\-(x|0|1){ffff}0-9]+)*(?:\.(?:[a-z(x|0|1){00a1}\-(x|0|1){ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/;
resetForm();
applyPreferences(); // apply current prefs to textarea preview
// disable default form submits
$('.form-horizontal').keypress(function(e){
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

reloadItems();

$('#searchItems').click(function(e){
  if(!this.selectedOptions.length){
    console.log('empty search items');
    $('#expression').val('');
  }else{
    var iIndex = this.selectedOptions[0].value;
    var util = global.dynSearch.utils[iIndex];
    $('#expression').val(util.regex).prop('disabled', false);
    enableForm(util.regex,util.utilities);
    reloadUtilities(iIndex);
  }
});

$('#createNew').click(function(e){
  e.preventDefault();
  if($(this).attr('disabled'))return;
  var bb = bootbox.prompt({
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
        var bb2 = bootbox.alert({
          title: 'Sorry!',
          message: 'A search item by that name already exists!',
          className: 'dark'
        });
        $(bb2).keypress(function(e){
          if(e.keyCode==13){
            e.preventDefault();
            e.stopPropagation();
            $('.modal-footer .btn-primary').click();
          }
        });
        return;
      }

      global.dynSearch.createNew(result);
      global.dynSearch.save();
      reloadItems(true);
      var len = global.dynSearch.utils.length;
      enableForm(
        global.dynSearch.utils[len - 1].regex,
        global.dynSearch.utils[len - 1].utilities
      );
      len = null;
    }
  });
  // make bootbox modal enter key work
  $(bb).keypress(function(e){
    if(e.keyCode==13){
      bootbox.hideAll();
    }
  });
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
        global.dynSearch.deleteItem(index);
        reloadItems();
        resetForm();
      }
    }
  })
});

$('#expression').on('keyup',function(e){
  try{
    var testRegex = new RegExp($(this).val());
    // will only reach next line if valid regex
    console.log(testRegex);
    $(this).css('border-color','green');
    $('#saveRegex').attr('disabled',false);
  }catch(e){
    console.error(e);
    $(this).css('border-color','red');
    $('#saveRegex').attr('disabled',true);
  }
});

$('#saveRegex').click(function(e){
  e.preventDefault();
  var itemIndex = $('#searchItems :selected').val();
  global.dynSearch.utils[itemIndex].regex = $('#expression').val();
  global.dynSearch.save();
  $(this).attr('disabled',true);
});

$('#itemUtilities').change(function(e){
  //if(!$(this).val())return;
  console.log($(this).val());
  e.preventDefault();
  var index = $('#searchItems :selected').val();
  var uIndex = $(this).val();
  if(uIndex==''){
    $('#utilityURL').val('').attr('disabled',true);
    $('#delUtil').attr('disabled',true);
    return;
  }
  var url = global.dynSearch.utils[index].utilities[uIndex].url;
  selectUtility(url);
});

$('#delUtil').click(function(e){
  e.preventDefault();
  var name = $('#utilities :selected').text();
  var bb = bootbox.confirm({
    title: 'Really delete "'+name+'"?',
    message: 'Are you sure you want to delete the "'+name+'" utility?',
    className: 'dark',
    callback: function(result){
      if(!result) return; // dismissed
      $('#utilityURL').val('').attr('disabled',true);
      var iIndex = $('#searchItems :selected').val();
      var uIndex = $('#utilities :selected').val();
      global.dynSearch.deleteUtility(iIndex,uIndex);
      reloadUtilities(iIndex);
    }
  });
});

$('#newUtil').click(function(e){
  e.preventDefault();
  if($(this).attr('disabled'))return;
  var bb = bootbox.prompt({
    title: 'New Utility Name',
    message: 'Name your new utility',
    className: 'dark',
    callback: function(result){
      if(!result) return;
      var newUtil = {
        name: result,
        url: 'http://www.replace.me?param={query}'
      };
      var itemIndex = $('#searchItems :selected').val();
      if(!global.dynSearch.createUtility(itemIndex,newUtil)){
        bootbox.alert({
          title: 'Utility already exists',
          message: 'A utility named "'+result+'" already exists',
          className: 'dark'
        });
      }else{
        var len = global.dynSearch.utils[itemIndex].utilities.length - 1;
        $('#itemUtilities')
          .append('<option value="'+len+'" selected>'+result+'</option>')
          .trigger('change');
        bootbox.hideAll();
      }
      temp = null;
    }
  });
  // make the bootbox modal enter press work
  $(bb).keypress(function(e){
    if(e.keyCode==13){
      bootbox.hideAll();
    }
  });
});

$('#utilityURL').on('keyup',function(e){
  if(this.value.match('{query}')){
    var temp = this.value.replace('{query}','');
    if(!urlRegex.test(temp)){
      $(this).css('border-color','red');
      $('#saveUrl').attr('disabled',true);
    }else{
      $('#saveUrl').attr('disabled',false);
      $(this).css('border-color','green');
    }
  }else{
    $('#saveUrl').attr('disabled',true);
    $(this).css('border-color','red');
  }
});

$('#saveUrl').click(function(e){
  if($(this).attr('disabled')) return;
  var url = $('#utilityURL').val();
  var sansqUrl = url.replace('{query}','');
  var temp = new RegExp('{query}');
  if(!urlRegex.test(sansqUrl) || !temp.test(url)){
    bootbox.alert({
      title: 'Cannot save URL!',
      message: 'Your URL does not appear to be valid, please correct any errors until the border of the textbox is green.',
      className: 'dark'
    });
    return;
  }
  var iIndex = $('#searchItems :selected').val();
  var uIndex = $('#itemUtilities :selected').val();
  global.dynSearch.updateUtilityUrl(iIndex,uIndex,url);
  $(this).attr('disabled',true);
  iIndex = uIndex = null;
});


// clips tab code
// apply on focus methods for textarea preview
$('.clip')
  .focusin(function(){
    if(this.clientHeight < this.scrollHeight){
      this.style.height = this.scrollHeight + 'px';
      if(this.clientHeight < this.scrollHeight){
        this.style.height = (this.scrollHeight * 2) - this.clientHeight + 'px';
      }
    }
  })
  .focusout(function(){
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

function reloadItems(focusLast) {
  utilities = global.dynSearch.utils;
  $('#searchItems').html('');
  for(var i in utilities){
    var temp = utilities[i];

    $('#searchItems')
      .append('<option value="'+i+'" '+(focusLast && i== utilities.length ? 'selected':'')+'>'+temp.name+'</option>');

  }
  reloadUtilities();
}

function reloadUtilities(itemIndex, selectLast){
  if(itemIndex === undefined) return;
  $('#itemUtilities').attr('disabled',false);
  $('#itemUtilities')
    .html('<option value="" '+(selectLast ? '':'selected')+'>Select Utility</option>');
  for(var i in global.dynSearch.utils[itemIndex].utilities){
    var temp = global.dynSearch.utils[itemIndex].utilities[i];
    $('#itemUtilities')
      .append('<option value="'+i+'">'+temp.name+'</option>');
  }

  $('#utilityURL').val('');
  if(!selectLast) $('#delUtil').attr('disabled',true);
  $('#saveUrl').attr('disabled',true);
}

function selectUtility(url){
  if(!$('#saveUrl').attr('disabled')){
    bootbox.confirm({
      title: 'Cancel Changes to URL?',
      message: 'Are you sure you would like to cancel your changes to the utility url?',
      className: 'dark',
      callback: function(result){
        if(!result)return;
        $('#delUtil').attr('disabled',false);
        $('#utilityURL').val(url);
        $('#utilityURL').prop('disabled',false);
        $('#saveUrl').attr('disabled',true);
      }
    });
  }else{
    $('#delUtil').attr('disabled',false);
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
  reloadUtilities();

  // buttons
  $('#newUtil').attr('disabled',false);
}
