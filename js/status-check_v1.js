---
---
$(document).ready(function() {
  var groups = {};
  var WEDDING_BOT_URL = '{{ site.wedding-bot-url }}';

  var guestListRequest = new XMLHttpRequest();
  guestListRequest.onreadystatechange = function(response) {
    if (guestListRequest.readyState === XMLHttpRequest.DONE) {
      $(".loader-container").addClass("hidden");
      if (guestListRequest.status === 200) {
        var guests = JSON.parse(guestListRequest.responseText);
        // Group the results
        guests.forEach(function(item) {
          console.log(item.relationship);
          if (!groups[item.relationship]) {
            groups[item.relationship] = {
              count: 0,
              unrespondedCount: 0,
              unresponded: []
            };
          }
          groups[item.relationship].count += item.guests.length;
          if (item.needs_rsvp) {
          groups[item.relationship].unrespondedCount += item.guests.length;
            groups[item.relationship].unresponded.push(item);
          }
        });
        updateUI();
      }
    }
  };

  var updateUI = function() {
    var container = $('#container');
    for (var key in groups) {
      if (key != "null") {
        var section = $("<div>", {class: "status-section"});
        var countText = groups[key].unrespondedCount + " / " + groups[key].count;
        section.append($("<h3></h3>", {class: "unstylized"}).text(key + " "+countText));
        var list = $("<ul></ul>", {style:"text-align:left"});
        groups[key].unresponded.forEach(function(item) {
          list.append($("<li></li>").text(item.name));
        })
        var listContainer = $("<div></div>", {class:"detail-container row split-row"})
        listContainer.append(list);
        section.append(listContainer);
        container.append(section);
      }
    }
  }

  guestListRequest.open('GET', WEDDING_BOT_URL+'/guests?includeRelationship=true', true);
  guestListRequest.send();

  $(".loader-container").removeClass("hidden");
});