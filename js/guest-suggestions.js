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
        console.log(selectedGuest)
        break
      }
    }
    populateFields()
  })

  $('.address-form-field').on('input', function() {
    if (selectedGuest && fieldsHaveChanged()) {
     $('#submit-address').prop('disabled', false)
    } else {
      $('#submit-address').prop('disabled', true)
    }
  })

  $('#submit-address').click(function() {
    console.log('clicked')
    const address = {
      street: $("#address1").val(),
      extended: $("#address2").val(),
      city: $("#city").val(),
      region: $("#state").val(),
      postcode: $("#zip").val(),
      country: $("#country").val()
    }
    const email = $("#email").val()
    const request = new XMLHttpRequest()
    request.open('POST', 'https://aisle-planner.herokuapp.com/guests/'+selectedGuest.guests[0]+'/address', true)
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.onreadystatechange = function() {
      if(request.readyState == XMLHttpRequest.DONE && request.status == 200) {
        $('.cd-message').html("Address updated successfully!")
        selectedGuest.address = address
        selectedGuest.email = email
      } else {
        $('.cd-message').html("ERROR: Something went wrong. Let Kevin or Melissa know their website is broken!")
      }
      $('.cd-popup').addClass('is-visible');
    }
    request.send(JSON.stringify({address, email}))
  })

  var fieldsHaveChanged = function () {
    var changed =  
      (!selectedGuest.address 
        && !(!$('#address1').val() && !$('#address2').val() && !$('#city').val() 
          && !$('#state').val() && !$('#zip').val() && !$('#country').val() && !$('email').val())
      ) 
      || 
      (selectedGuest.address 
        && (fieldDifferentThanData($('#address1'), selectedGuest.address.street) 
          || fieldDifferentThanData($('#address2'), selectedGuest.address.extended)
          || fieldDifferentThanData($('#city'), selectedGuest.address.city)
          || fieldDifferentThanData($('#state'), selectedGuest.address.region)
          || fieldDifferentThanData($('#zip'), selectedGuest.address.postcode)
          || fieldDifferentThanData($('#country'), selectedGuest.address.country)
          || fieldDifferentThanData($('#email'), selectedGuest.email)
        )
      )
      return changed
  }
  var fieldDifferentThanData = function(element, data) {
    var different = element.val() != data && !((element.val() == null || element.val() == "") && (data == null || data == ""))
    if (different) {
    }
    return different
  }

  var populateFields = function() {
    var disabled;
    if (selectedGuest) {
      $('#guest-name').removeClass('field-enabled')
      $('.hideable').fadeIn('slow')
      if (selectedGuest.address) {
        $("#address1").val(selectedGuest.address.street)
        $("#address2").val(selectedGuest.address.extended)
        $("#city").val(selectedGuest.address.city)
        $("#state").val(selectedGuest.address.region)
        $("#zip").val(selectedGuest.address.postcode)
        $("#country").val(selectedGuest.address.country)
      }
      if(selectedGuest.email) {
        $("#email").val(selectedGuest.email);
      }
    } else {
      $('#guest-name').addClass('field-enabled')
      $('.hideable').fadeOut('slow')
    }

    $(".secondary-form-field").each(function() {
        if (selectedGuest && selectedGuest.address) {
          $(this).addClass('field-enabled')
        } else {
          $(this).val('')
          $(this).removeClass('field-enabled')
        }
        $(this).prop('disabled', selectedGuest == null)
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
});