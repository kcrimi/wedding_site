$(document).ready(function() {
  var dataLists = $('.guest-datalist');
  var input = $('.guest-name');
  var guests = []
  var events = []
  var selectedGuest = {};
  var rsvpInformation = {};
  var meals = [];
  const MAILING = "mailing-guest"
  const RSVP = "rsvp-guest"

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

  guestListRequest.open('GET', 'https://aisle-planner.herokuapp.com/guests', true);
  guestListRequest.send();

  // Request Menus
  var eventsRequest = new XMLHttpRequest();
  eventsRequest.onreadystatechange = function(response) {
    if (eventsRequest.readyState === XMLHttpRequest.DONE) {
      if (eventsRequest.status === 200) {
        events = JSON.parse(eventsRequest.responseText);
        console.log(events);
        meals = events.find(function (event) { 
          return event.ap_use === 'reception'
        }).meal_options
        const listItems = meals.map(function(meal) {
          console.log(meal)
          var row = $("<li>", {class: "meal-row"});
          row.append($("<h4></h4>").text(meal.name));
          row.append($("<p></p>").text(meal.description));
          return row
        })
        console.log(listItems)
        $('#menu-list').html(listItems);
      }
    }
  };

  eventsRequest.open('GET', 'https://aisle-planner.herokuapp.com/events', true);
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
          updateRsvpFormFromData()
        } else {
          $('section#rsvp .cd-message').html("ERROR "+request.status+": Something went wrong retrieving your rsvp info. Let Kevin or Melissa know their website is broken!");
          $('section#rsvp .cd-popup').addClass('is-visible');
        } 
      }
    };

    rsvpRequest.open('GET', 'https://aisle-planner.herokuapp.com/rsvp/'+id, true);
    rsvpRequest.send();
  }

  var updateRsvpFormFromData = function () {
    console.log(rsvpInformation)
    var rows = [];
    rsvpInformation.forEach(function(guest) {
      var row = $("<li>", {id: guest.id})
      if (guest.is_anonymous) {
        var plusOneRow = $("<li></li>", {class:"plus-one-row"})
        plusOneRow.append([
          $("<input>", {type:"checkbox", name:"plus-one"}),
          $("<label>", {for:"plus-one"}).text("Will you be bringing a guest?")])
        row.addClass("hidden plus-one-guest")
        row.append($("<input>", {type:"text", name:guest.id+"-first-name", placeholder:"First Name"}))
        row.append($("<input>", {type:"text", name:guest.id+"-last_name", placeholder:"Last Name"}))
        rows.push(plusOneRow)
      } else {
        row.html(guest.first_name)
      }
      row.append($("<input>", {type:"radio", name:guest.id+"-attending-status", value:"attending", checked:true}))
      row.append("Attending")
      row.append($("<input>", {type:"radio", name:guest.id+"-attending-status", value:"declined"}))
      row.append("Not Attending")
      events.filter(function(event) {
        return event.meal_served;
      }).forEach(function(event) {
        var dropdown = $("<select>", {name:guest.id+"-meal_option_id"})
        dropdown.append($("<option>", {value:"", disabled:true, selected:true}).text("Select Meal"))
        event.meal_options.forEach(function(meal) {
          dropdown.append($("<option>", {value:meal.id}).text(meal.name))
        })
        dropdown.append($("<option>", {value:"none"}).text("No Meal"))
        row.append(dropdown)
      })
      rows.push(row);
    })
    $("#guests-list").html(rows)
    setRsvpListeners();
    setVisibleSectionsRsvp();
  }

  var setRsvpListeners = function () {
    $(".plus-one-row label").click((event) => {
      $(".plus-one-row input").trigger('click')
    })

    $(".plus-one-row input").on('click', () => {
      $(this).prop('checked', !$(this).prop('checked'))

      console.log("clicked")
      if ($(this).prop('checked')) {
        $(".plus-one-guest").fadeIn('slow')
        $(".plus-one-guest").removeClass("hidden")
        console.log('checked')
      } else {
        $(".plus-one-guest").fadeOut('slow')
        console.log('unchecked')
      }
    })
  }

  var setVisibleSectionsRsvp = function () {
    var disabled;
    if (selectedGuest[RSVP]) {
      $('#rsvp-name').removeClass('field-enabled');
      $('section#rsvp .hideable').fadeIn('slow');
    } else {
      $('#rsvp-name').addClass('field-enabled');
      $('section#rsvp .hideable').fadeOut('slow');
    }
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
        console.log(selectedGuest);
        console.log(this.id)
        break
      }
    }
    console.log(selectedGuest)
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
    var request = new XMLHttpRequest();
    var url = 'https://aisle-planner.herokuapp.com/guests/'+selectedGuest.guests[0]+'/address';
    request.open('POST', url, true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.onreadystatechange = function() {
      if(request.readyState == XMLHttpRequest.DONE) {
        if (request.status == 200) {
          $('section#mailing .cd-message').html("Address updated successfully!");
          if (payload.address) {
            selectedGuest.address = payload.address;
          }
          if (payload.email) {
            selectedGuest.email = payload.email;
          }
        } else {
          $('section#mailing .cd-message').html("ERROR "+request.status+": Something went wrong. Let Kevin or Melissa know their website is broken!");
        }
        $('section#mailing .cd-popup').addClass('is-visible');
      }
    }
    request.send(JSON.stringify(payload));
    log(url, payload, {selectedGuest : selectedGuest});
  })

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