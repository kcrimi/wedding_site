$(document).ready(function() {
  var dataList = document.getElementById('guest-datalist');
  var input = document.getElementById('guest-name');
  var guestListRequest = new XMLHttpRequest();
  var guests = []
  var selectedGuest;

  guestListRequest.onreadystatechange = function(response) {
    if (guestListRequest.readyState === XMLHttpRequest.DONE) {
      if (guestListRequest.status === 200) {
        guests = JSON.parse(guestListRequest.responseText);
        guests.forEach(function(item) {
          var option = document.createElement('option');
          option.value = item.name;
          dataList.appendChild(option);
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

  var checkForMatchedName = function () {
    selectedGuest = null;
    var val = this.value;
    for (var i = 0; i < guests.length; i++ ){
      if (guests[i].name === val) {
        selectedGuest = guests[i];
        console.log(selectedGuest);
        break
      }
    }
    setVisibleSections();
  }

  $("#guest-name").on('input', checkForMatchedName)

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
    var request = new XMLHttpRequest();
    var url = 'https://aisle-planner.herokuapp.com/guests/'+selectedGuest.guests[0]+'/address';
    request.open('POST', url, true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.onreadystatechange = function() {
      if(request.readyState == XMLHttpRequest.DONE && request.status == 200) {
        $('.cd-message').html("Address updated successfully!");
        if (payload.address) {
          selectedGuest.address = payload.address;
        }
        if (payload.email) {
          selectedGuest.email = payload.email;
        }
      } else {
        $('.cd-message').html("ERROR: Something went wrong. Let Kevin or Melissa know their website is broken!");
      }
      $('.cd-popup').addClass('is-visible');
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

  var setVisibleSections = function() {
    var disabled;
    if (selectedGuest) {
      $('#guest-name').removeClass('field-enabled');
      $('.hideable').fadeIn('slow');
    } else {
      $('#guest-name').addClass('field-enabled');
      $('.hideable').fadeOut('slow');
    }

    $(".secondary-form-field").each(function() {
        if (selectedGuest) {
          $(this).addClass('field-enabled');
        } else {
          $(this).val('');
          $(this).removeClass('field-enabled');
        }
        $(this).prop('disabled', selectedGuest == null);
    })
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