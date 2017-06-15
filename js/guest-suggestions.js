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
          option.value = item.name
          dataList.appendChild(option);
        });
        input.placeholder = "Find your name"
      } else {
        input.placeholder = "Couldn't load guestlist :("
      }
    }
  };

  guestListRequest.open('GET', 'https://aisle-planner.herokuapp.com/guests', true);
  guestListRequest.send();

  $("#guest-name").on('input', function() {
    selectedGuest = null
    var val = this.value;
    for (var i = 0; i < guests.length; i++ ){
      if (guests[i].name === val) {
        selectedGuest = guests[i]
        break
      }
    }
    populateFields()
  })

  $('.address-form-field').on('input', function() {
    if (selectedGuest &&
      (fieldDifferentThanData($("#address1"), selectedGuest.address.street) 
        || fieldDifferentThanData($("#address2"), selectedGuest.address.extended)
        || fieldDifferentThanData($("#city"), selectedGuest.address.city)
        || fieldDifferentThanData($("#state"), selectedGuest.address.region)
        || fieldDifferentThanData($("#zip"), selectedGuest.address.postcode)
        || fieldDifferentThanData($("#country"), selectedGuest.address.country)
        )) {
     $('#submit-address').prop('disabled', false)
    } else {
      $('#submit-address').prop('disabled', true)
    }
  })

  $('#submit-address').click(function() {
    console.log('clicked')
    const request = new XMLHttpRequest()
    request.open('POST', 'https://aisle-planner.herokuapp.com/guests/'+selectedGuest.guests[0]+'/address', true)
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.onreadystatechange = function() {
      if(request.readyState == XMLHttpRequest.DONE && request.status == 200) {
        console.log('submitted!')
      }
    }
    const address = {
      address1: $("#address1").val(),
      address2: $("#address2").val(),
      city: $("#city").val(),
      state: $("#state").val(),
      zip: $("#zip").val(),
      country: $("#country").val()
    }
    request.send(JSON.stringify(address))
  })

  var fieldDifferentThanData = function(element, data) {
    var different = element.val() != data && !(data == "" && element.val() == null)
    if (different) {
    }
    return different
  }

  var populateFields = function() {
    var disabled;
    if (selectedGuest) {
      disabled = false
      $("#address1").val(selectedGuest.address.street)
      $("#address2").val(selectedGuest.address.extended)
      $("#city").val(selectedGuest.address.city)
      $("#state").val(selectedGuest.address.region)
      $("#zip").val(selectedGuest.address.postcode)
      $("#country").val(selectedGuest.address.country)
    } else {
      disabled = true
      $("#address1").val('')
      $("#address2").val('')
      $("#city").val('')
      $("#state").val('')
      $("#zip").val('')
      $("#country").val('')
    }
    $("#address1").prop('disabled', disabled)
    $("#address2").prop('disabled', disabled)
    $("#city").prop('disabled', disabled)
    $("#state").prop('disabled', disabled)
    $("#zip").prop('disabled', disabled)
    $("#country").prop('disabled', disabled)
  }

});