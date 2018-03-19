---
---
$(document).ready(function() {
  var guests;
  var groups = {};
  var WEDDING_BOT_URL = '{{ site.wedding-bot-url }}';

  var guestListRequest = new XMLHttpRequest();
  guestListRequest.onreadystatechange = function(response) {
    if (guestListRequest.readyState === XMLHttpRequest.DONE) {
      $(".loader-container").addClass("hidden");
      if (guestListRequest.status === 200) {
        guests = JSON.parse(guestListRequest.responseText);
        // Group the results
        guests.forEach(function(item) {
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
    console.log($(".email-list"));
    if ($(".email-list").length > 0) {
      console.log("email list");
      makeUnrespondedCsv();
    } else if ($(".full-export").length > 0) {
      console.log("export")
      makeExportCsv();
    } else {
      console.log("lists");
      addUnrespondedLists();
    }
  }

  var makeUnrespondedCsv = function() {
    console.log("csv");
    var container = $(".email-list");
    text = "";
    for (var key in groups) {
      if (key != "null") {
        var group = groups[key];
        group.unresponded.forEach(function(item) {
          if (text != "") {
            text += "</br>"  ;
          }
          text += '"'+item.name+'","'+item.email+'","'+key+'"';
        })
      }
    }
    container.html(text);
  }

  var makeExportCsv = function() {
    console.log("csv");
    var container = $(".full-export");
    text = `"Rsvp Id","Name","Needs Rsvp","Attending Count","Relationship","Email","Address 1","Address 2","City","Region","Postal Code","Country"`;
    for (var i = 0; i < guests.length; i++ ){
      var guest = guests[i];
      text += `</br>
        "${guest.rsvp_id }",
        "${guest.name}",
        "${guest.needs_rsvp}",
        "${guest.attending_count}",
        "${guest.relationship}",
        "${guest.email && guest.email ? guest.email : ""}",
        "${guest.address && guest.address.street ? guest.address.street : ""}",
        "${guest.address && guest.address.extended ? guest.address.extended : ""}",
        "${guest.address && guest.address.city ? guest.address.city : ""}",
        "${guest.address && guest.address.region ? guest.address.region : ""}",
        "${guest.address && guest.address.postcode ? guest.address.postcode : ""}",
        "${guest.address && guest.address.country ? guest.address.country : ""}"`
    }
    container.html(text);
  }

  var addUnrespondedLists = function() {
    console.log('list');
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

  guestListRequest.open('GET', WEDDING_BOT_URL+'/guests?includeRelationship=true&includeAddress=true', true);
  guestListRequest.send();

  $(".loader-container").removeClass("hidden");
});