$(document).ready(function() {
  var dataList = document.getElementById('guest-datalist');
  var input = document.getElementById('guest-name');
  var request = new XMLHttpRequest();
  var guests = []
  var selectedGuest;

  request.onreadystatechange = function(response) {
    if (request.readyState === 4) {
      if (request.status === 200) {
        guests = JSON.parse(request.responseText);
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

  request.open('GET', 'https://aisle-planner.herokuapp.com/guests', true);
  request.send();

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
    console.log(selectedGuest)
    if (selectedGuest &&
      (fieldDifferentThanData($("#address1"), selectedGuest.address.street) 
        || fieldDifferentThanData($("#address2"), selectedGuest.address.extended)
        || fieldDifferentThanData($("#city"), selectedGuest.address.city)
        || fieldDifferentThanData($("#state"), selectedGuest.address.region)
        || fieldDifferentThanData($("#zip"), selectedGuest.address.postcode)
        || fieldDifferentThanData($("#country"), selectedGuest.address.country)
        )) {
      console.log('tripped')
     $('#submit-address').prop('disabled', false)
    } else {
      $('#submit-address').prop('disabled', true)
    }
  })

  var fieldDifferentThanData = function(element, data) {
    var different = element.val() != data && !(data == "" && element.val() == null)
    if (different) {
      console.log(element)
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