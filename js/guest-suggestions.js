---
---
$(document).ready(function() {
  var dataLists = $('.guest-datalist');
  var input = $('.guest-name');
  var guests = [];
  var events = [];
  var selectedGuest = {};
  var rsvpInformation = {};
  var meals = [];
  var MAILING = "mailing-guest";
  var RSVP = "rsvp-guest";
  var ATTENDING = "attending";
  var DECLINED = "declined";
  var WEDDING_BOT_URL = '{{ site.wedding-bot-url }}';
  var SINEMA_ID = 278945;
  var BRUNCH_ID = 203467;
  var DINNER_ID = 273068;

  var guestListRequest = new XMLHttpRequest();
  guestListRequest.onreadystatechange = function(response) {
    if (guestListRequest.readyState === XMLHttpRequest.DONE) {
      if (guestListRequest.status === 200) {
        guests = JSON.parse(guestListRequest.responseText);
        guests.forEach(function(item) {
          var option = document.createElement('option');
          option.value = item.name;
          dataLists.append(option);
        });
        input.placeholder = "Find your name";
        fixBrowsersThatDontSupportDatalist();
      } else {
        input.placeholder = "Couldn't load guestlist :(";
      }
    }
  };

  guestListRequest.open('GET', WEDDING_BOT_URL+'/guests', true);
  guestListRequest.send();

  // Request Menus
  var eventsRequest = new XMLHttpRequest();
  eventsRequest.onreadystatechange = function(response) {
    if (eventsRequest.readyState === XMLHttpRequest.DONE) {
      if (eventsRequest.status === 200) {
        events = JSON.parse(eventsRequest.responseText);
        meals = events.find(function (event) { 
          return event.ap_use === 'reception';
        }).meal_options
        var listItems = meals.map(function(meal) {
          var row = $("<li>", {class: "meal-row"});
          row.append($("<h4></h4>").text(meal.name));
          row.append($("<p></p>").text(meal.description));
          return row;
        });
        $('#menu-list').html(listItems);
      }
    }
  };

  eventsRequest.open('GET', WEDDING_BOT_URL+'/events', true);
  eventsRequest.send();

  //////////
  // RSVP //
  //////////
  var retrieveRsvpInfo = function(id) {
    var rsvpRequest = new XMLHttpRequest();
    rsvpRequest.onreadystatechange = function(response) {
      if (rsvpRequest.readyState === XMLHttpRequest.DONE) {
        if (rsvpRequest.status === 200) {
          rsvpInformation = JSON.parse(rsvpRequest.responseText);
          updateRsvpFormFromData();
          $('#guest-name-section .loader').addClass('hidden');
        } else {
          $('section#rsvp .alert .cd-message').html("ERROR "+rsvpRequest.status+": Something went wrong retrieving your rsvp info. Let Kevin or Melissa know their website is broken!");
          $('section#rsvp .cd-popup.alert').addClass('is-visible');
        } 
      }
    };
    $('#guest-name-section .loader').removeClass('hidden');
    rsvpRequest.open('GET', WEDDING_BOT_URL+'/rsvp/'+id, true);
    rsvpRequest.send();
  }

  var updateRsvpFormFromData = function () {
    var weddingRows = [];
    var brunchRows = [];
    rsvpInformation.forEach(function(guest) {
      var row = $("<li></li>", {id: guest.id, class:"guest-row"});
      if (guest.is_anonymous) {
        var plusOneRow = $("<li></li>", {class:"plus-one-row"});
        plusOneRow.append([
          $("<input>", {type:"checkbox", name:"plus-one"}),
          $("<label>", {for:"plus-one"}).text("Will you be bringing a guest?")]);
        row.addClass("hidden plus-one-guest-row");
        row.removeClass("guest-row")
        row.append($("<input>", {type:"text", class:guest.id+" first-name form-field field-enabled", placeholder:"First Name"}));
        row.append($("<input>", {type:"text", class:guest.id+" last-name form-field field-enabled", placeholder:"Last Name"}));
        weddingRows.push(plusOneRow);
      } else {
        var nameDiv = $("<div></div>", {class:"rsvp-item unstylized"}).text(guest.first_name);
        row.append(nameDiv);
        var attendingDiv = $("<div></div>", {class:"rsvp-item"});
        attendingDiv.append($("<input/>", {id:guest.id+"-attending", type:"radio", name:guest.id+"-attending-status", class:guest.id+" attending-status", value:ATTENDING, checked:true}));
        attendingDiv.append($("<label></label>", {for: guest.id+"-attending", class:"unstylized"}).text("Attending"));
        attendingDiv.append($("<input/>", {id:guest.id+"-not-attending", type:"radio", name:guest.id+"-attending-status", class:guest.id+" attending-status", value:DECLINED}));
        attendingDiv.append($("<label></label>", {for: guest.id+"-not-attending", class:"unstylized"}).text("Not Attending"));
        row.append(attendingDiv);
      }
      // Wedding meal
      events.filter(function(event) {
        return event.meal_served;
      }).forEach(function(event) {
        var mealDiv = $("<div></div>", {class:"rsvp-item"});
        var dropdown = $("<select>", {name:guest.id+"-meal-option-id", class:"meal-option-id "+guest.id});
        dropdown.append($("<option>", {value:"", disabled:true, selected:true}).text("Select Meal"));
        event.meal_options.forEach(function(meal) {
          dropdown.append($("<option>", {value:meal.id}).text(meal.name));
        })
        dropdown.append($("<option>", {value:"none"}).text("No Meal"));
        mealDiv.append(dropdown);
        mealDiv.append($("<a></a>", {class:"menu-info"}).text("menu"))
        row.append(mealDiv);
      });
      weddingRows.push(row);

      // Brunch rsvp if needed
      var brunchEvent = guest.statuses.find(function(status) {
        return status.wedding_event_id === BRUNCH_ID;
      })

      if (brunchEvent) {
        var brunchRow = $("<li></li>", {id: guest.id+"-brunch", class:"guest-row brunch"});
        if (guest.is_anonymous) {
          brunchRow.addClass("hidden plus-one-guest-row");
          var nameDiv = $("<div></div>", {class:"rsvp-item unstylized name"}).text("Guest");
        } else {
          var nameDiv = $("<div></div>", {class:"rsvp-item unstylized"}).text(guest.first_name);
        }
        brunchRow.append(nameDiv);
        var attendingDiv = $("<div></div>", {class:"rsvp-item"});
        attendingDiv.append($("<input/>", {id:guest.id+"-attending-brunch", type:"radio", name:guest.id+"-attending-status-brunch", class:guest.id+" attending-status-brunch", value:ATTENDING, checked:true}));
        attendingDiv.append($("<label></label>", {for: guest.id+"-attending-brunch", class:"unstylized"}).text("Attending"));
        attendingDiv.append($("<input/>", {id:guest.id+"-not-attending-brunch", type:"radio", name:guest.id+"-attending-status-brunch", class:guest.id+" attending-status-brunch", value:DECLINED}));
        attendingDiv.append($("<label></label>", {for: guest.id+"-not-attending-brunch", class:"unstylized"}).text("Not Attending"));
        brunchRow.append(attendingDiv);
        brunchRows.push(brunchRow);
      }
    })
    $("#guests-list").html(weddingRows);
    $("#brunch-guests-list").html(brunchRows);
    setRsvpListeners();
    setVisibleSectionsRsvp();
  }

  var setRsvpListeners = function () {
    $(".attending-status").click(function(event) {
      console.log("click "+$(this).val())
      $(this).closest(".guest-row").find("select").prop('disabled', $(this).val() == 'declined')
    })

    $(".plus-one-row label").click(function(event) {
      $(".plus-one-row input").trigger('click');
    })

    $(".plus-one-row input").on('click', function() {
      if ($(this).prop('checked')) {
        $(".plus-one-guest-row").fadeIn('slow');
        $(".plus-one-guest-row").removeClass("hidden");
      } else {
        $(".plus-one-guest-row").fadeOut('slow');
      }
    })

    // Update the +1 guest's name in the brunch section
    $(".plus-one-guest-row .first-name").on('input', function() {
      var name = $(this).val().length > 0 ? $(this).val() : "Guest";
      $(".plus-one-guest-row.brunch .name").text(name);
    })

    $(".menu-info").on('click', function() {
      $(".menu-popup").addClass("is-visible");
    })
  }

  var setVisibleSectionsRsvp = function () {
    if ($('#brunch-guests-list li').length > 0) {
      console.log("exist");
      $('.brunch.hideable').fadeIn('fast');
    } else {
      console.log("not exist");
      $('.brunch.hideable').fadeOut('fast')
    }
    if (selectedGuest[RSVP]) {
      $('#rsvp-name').removeClass('field-enabled');
      $('.rsvp-section.hideable, #submit-rsvp').fadeIn('slow');
    } else {
      $('#rsvp-name').addClass('field-enabled');
      $('.rsvp-section.hideable, #submit-rsvp').fadeOut('slow');
    }
  }

  $("#submit-rsvp").click(function() {
    if (!validateRsvpForm()) {
      return;
    }
    console.log(events);
    var selectEvents = events.filter(function(event) {
      return ['reception', 'ceremony'].includes(event.ap_use) 
      || event.id == SINEMA_ID
      || event.id == BRUNCH_ID;
    }).reduce(function(map, event) {
      map[event.id] = event;
      return map;
    }, {});
    console.log(selectEvents)
    console.log(rsvpInformation)
    guestRsvps = rsvpInformation.map(function(guest) {
      var guestPayload = {
        id: guest.id
      };
      var attending;
      var attendingBrunch;
      // Handle names for +1s
      if ($(".attending-status-brunch."+guest.id)) {
        attendingBrunch = $(".attending-status-brunch."+guest.id+":checked").val();
      }
      if (guest.is_anonymous) {
        if ($(".plus-one-row input").prop("checked")) {
          attending = ATTENDING
          guestPayload.first_name = $(".first-name."+guest.id).val();
          guestPayload.last_name = $(".last-name."+guest.id).val();
        } else {
          attending = DECLINED;
          attendingBrunch = DECLINED; // Override when no +1
        }
      } else {
        attending = $(".attending-status."+guest.id+":checked").val();
      }

      // Handle rsvping for events
      var rsvps = guest.statuses.reduce(function(output, status) {
        if (selectEvents[status.wedding_event_id]) {
          if (status.wedding_event_id == BRUNCH_ID) {
            output.push({
              wedding_event_id: status.wedding_event_id,
              guest_list: status.guest_list,
              attending_status: attendingBrunch,
            });
            return output;
          }
          // Base rsvp
          var rsvp = {
            wedding_event_id: status.wedding_event_id,
            guest_list: status.guest_list,
            attending_status: attending,
          };
          // Check if they said they were coming to sinema
          if (status.wedding_event_id == SINEMA_ID && !$("input[name='sinema-rsvp']").prop("checked")) {
            rsvp.attending_status = DECLINED;
          }
          // Add meal information
          if (attending == ATTENDING
            && selectEvents[status.wedding_event_id].meal_served) {
            var selectedMeal = $(".meal-option-id."+guest.id).find(":selected").val();
            if (selectedMeal === "none") {
              rsvp.meal_declined = true;
            } else {
              rsvp.meal_option_id = selectedMeal;
            }
          }
          output.push(rsvp);
        } 
        return output;
      }, [])
      guestPayload.rsvps = rsvps;
      return guestPayload;
    });
    var payload = {
      id: selectedGuest[RSVP].id,
      guests: guestRsvps
    }
    console.log(payload)
    sendUpdateRsvpRequest(rsvpInformation[0].group_id, payload)
  });

  var sendUpdateRsvpRequest = function(group_id, payload) {
    var request = new XMLHttpRequest();
    var url = WEDDING_BOT_URL+'/rsvp/'+group_id;
    request.open('POST', url, true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.onreadystatechange = function() {
      if(request.readyState == XMLHttpRequest.DONE) {
        if (request.status == 200) {
          $('section#rsvp .alert .cd-message').html("RSVP submitted successfully!");
          if (payload.address) {
            selectedGuest.address = payload.address;
          }
          if (payload.email) {
            selectedGuest.email = payload.email;
          }
        } else {
          $('section#rsvp .alert .cd-message').html("ERROR "+request.status+": Something went wrong. Let Kevin or Melissa know their website is broken!");
        }
        $('section#rsvp .cd-popup.alert').addClass('is-visible');
      }
    }
    request.send(JSON.stringify(payload));
    log(url, payload, {selectedGuest : selectedGuest, rsvpInformation: rsvpInformation});
  }

  var validateRsvpForm = function() {
    var valid = true;
    $("#guests-list .guest-row").each(function() {
      console.log($(this).find(".attending-status:checked").val());
      if ($(this).find(".attending-status:checked").val() === "attending") {
        if ($(this).find(".meal-option-id").find(":selected").val()) {
          $(this).find(".meal-option-id").removeClass('error-field');
        } else {
          $(this).find(".meal-option-id").addClass('error-field');
          valid = false;
        }
      }
    })
    $("#guests-list .plus-one-row").each(function() {
      console.log($(this).find("input").prop("checked"));
      if ($(this).find("input").prop("checked")) {
        var plusOneGuestRow = $("#guests-list .plus-one-guest-row");
        plusOneGuestRow.find("input:text").each(function() {
          if ($(this).val()) {
            $(this).removeClass('error-field');
          } else {
            $(this).addClass('error-field');
            valid = false;
          }
        })

        console.log($(this).val())
        var mealSelector = plusOneGuestRow.find(".meal-option-id");
        if (mealSelector.find(":selected").val()) {
          mealSelector.removeClass('error-field');
        } else {
          mealSelector.addClass('error-field');
          valid = false;
        }
      }
    })
    return valid;
  }

  /////////////
  // MAILING //
  /////////////
  var setVisibleSectionsMailing = function() {
    var disabled;
    if (selectedGuest[MAILING]) {
      $('#mailing-name').removeClass('field-enabled');
      $('section#mailing .hideable').fadeIn('slow');
    } else {
      $('#mailing-name').addClass('field-enabled');
      $('section#mailing .hideable').fadeOut('slow');
    }

    $("section#mailing .secondary-form-field").each(function() {
        if (selectedGuest) {
          $(this).addClass('field-enabled');
        } else {
          $(this).val('');
          $(this).removeClass('field-enabled');
        }
        $(this).prop('disabled', selectedGuest == null);
    })
  }

  var checkForMatchedName = function (form) {
    if (selectedGuest[this.id] != null && this.value == selectedGuest[this.id].name) {
      return
    }
    selectedGuest[this.id] = null;
    var val = this.value;
    for (var i = 0; i < guests.length; i++ ){
      if (guests[i].name === val) {
        selectedGuest[this.id] = guests[i];
        break
      }
    }
    if (this.id == MAILING) {
      setVisibleSectionsMailing();
    } else if (selectedGuest[RSVP]) {
      retrieveRsvpInfo(selectedGuest[RSVP].id)
    }
  }

  $('.guest-name').on('input keyup', checkForMatchedName())

  $('.address-form-field').on('input', function() {
    if (selectedGuest && fieldsHaveChanged()) {
     $('#submit-address').prop('disabled', false);
    } else {
      $('#submit-address').prop('disabled', true);
    }
  })

  $('#submit-address').click(function() {
    if (!validateForm()) {
      return;
    }
    var payload = {}
    if ($("#address1").val()) {
      payload.address = {
        street: $("#address1").val(),
        extended: $("#address2").val(),
        city: $("#city").val(),
        region: $("#state").val(),
        postcode: $("#zip").val(),
        country: $("#country").val()
      };
    }
    if ($("#email").val()) {
      payload.email = $("#email").val();
    }
    if ($('#phone').val()) {
      payload.phone_number = $('#phone').val();
    }
    sendAddressUpdateRequest(payload)
  })

  var sendAddressUpdateRequest = function(payload) {
    var request = new XMLHttpRequest();
    var url = WEDDING_BOT_URL+'/guests/'+selectedGuest[MAILING].guests[0]+'/address';
    request.open('POST', url, true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.onreadystatechange = function() {
      if(request.readyState == XMLHttpRequest.DONE) {
        if (request.status == 200) {
          $('section#mailing .cd-message').html("Address updated successfully!");
          if (payload.address) {
            selectedGuest[MAILING].address = payload.address;
          }
          if (payload.email) {
            selectedGuest[MAILING].email = payload.email;
          }
        } else {
          $('section#mailing .cd-message').html("ERROR "+request.status+": Something went wrong. Let Kevin or Melissa know their website is broken!");
        }
        $('section#mailing .cd-popup').addClass('is-visible');
      }
    }
    request.send(JSON.stringify(payload));
    log(url, payload, {selectedGuest : selectedGuest[MAILING]});
  }

  var fieldsHaveChanged = function () {
    var changed = false;
    $(".secondary-form-field").each(function() {
      if ($.trim($(this).val()).length > 0) {
        changed = true;
        return;
      }
    })
    return changed;
  }

  var validateForm = function() {
    var valid = true;
    $(".address-section > .address-form-field").each(function() {
      if ($(this).val()) {
        $(".address-section > .required-field").each(function() {
          if (!$(this).val()) {
            valid = false;
            $(this).addClass('error-field');
          } else {
            $(this).removeClass('error-field');
          }
        })
      }
    })
    return valid;
  }

  //close popup
  $('.cd-popup').on('click', function(event){
    if( $(event.target).is('.cd-popup-close') || $(event.target).is('.cd-popup') ) {
      event.preventDefault();
      $(this).removeClass('is-visible');
    }
  });
  //close popup when clicking the esc keyboard button
  $(document).keyup(function(event){
    if(event.which=='27'){
      $('.cd-popup').removeClass('is-visible');
    }
  });

  var log = function(endpoint, payload, context) {
    var request = new XMLHttpRequest();
    request.open('POST', '/log/', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.onreadystatechange = function() {
      if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        this.responseText;
      }
    }
    request.send(JSON.stringify({
      endpoint: endpoint, 
      payloade: payload, 
      context: context}));
  }

  var fixBrowsersThatDontSupportDatalist = function() {
    var nativedatalist = !!('list' in document.createElement('input')) && 
          !!(document.createElement('datalist') && window.HTMLDataListElement);
      
    if (true || !nativedatalist) {
      $('input[list]').each(function () {
        var availableTags = $('#' + $(this).attr("list")).find('option').map(function () {
          return this.value;
        }).get();
        $(this).autocomplete({ 
          source: availableTags,
          close: checkForMatchedName,
          minLength: 3
        });
        $(this).attr("list", "");
      });
    }
  }
});