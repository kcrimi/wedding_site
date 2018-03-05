---
---
$(document).ready(function() {
  var list = $('#status-name-list');
  var guests = [];
  var events = [];
  var WEDDING_BOT_URL = '{{ site.wedding-bot-url }}';

  var guestListRequest = new XMLHttpRequest();
  guestListRequest.onreadystatechange = function(response) {
    if (guestListRequest.readyState === XMLHttpRequest.DONE) {
      if (guestListRequest.status === 200) {
        guests = JSON.parse(guestListRequest.responseText);
        guests.forEach(function(item) {
          var row = $("<li></li>");
          row.text(item.name);
          list.append(row);
          // var option = document.createElement('option');
          // option.value = item.name;
          // dataLists.append(option);
        });
        // input.placeholder = "Find your name";
        // fixBrowsersThatDontSupportDatalist();
      // } else {
      //   input.placeholder = "Couldn't load guestlist :(";
      }
    }
  };

  guestListRequest.open('GET', WEDDING_BOT_URL+'/guests', true);
  guestListRequest.send();

  // var fixBrowsersThatDontSupportDatalist = function() {
  //   var nativedatalist = !!('list' in document.createElement('input')) && 
  //         !!(document.createElement('datalist') && window.HTMLDataListElement);
      
  //   if (true || !nativedatalist) {
  //     $('input[list]').each(function () {
  //       var availableTags = $('#' + $(this).attr("list")).find('option').map(function () {
  //         return this.value;
  //       }).get();
  //       $(this).autocomplete({ 
  //         source: availableTags,
  //         close: checkForMatchedName,
  //         minLength: 3
  //       });
  //       $(this).attr("list", "");
  //     });
  //   }
  // }
});