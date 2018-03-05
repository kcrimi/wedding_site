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
      $(".loader-container").addClass("hidden");
      if (guestListRequest.status === 200) {
        guests = JSON.parse(guestListRequest.responseText);
        guests.forEach(function(item) {
          if (item.needs_rsvp) {
            var row = $("<li></li>");
            row.text(item.name);
            list.append(row);
          }
        });
      }
    }
  };

  guestListRequest.open('GET', WEDDING_BOT_URL+'/guests', true);
  guestListRequest.send();

  $(".loader-container").removeClass("hidden");
});