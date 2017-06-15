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
    var val = this.value;
    console.log('input '+guests.length)
    for (var i = 0; i < guests.length; i++ ){
      console.log('check ' + guests[i].name)
      if (guests[i].name === val) {
        console.log('hit')
        selectedGuest = guests[i]
        populateFields()
        return
      }
    }
    clearFields()
  })

  var populateFields = function() {
    console.log('update')
    $("#address1").val(selectedGuest.address.street)
    $("#address2").val(selectedGuest.address.extended)
    $("#city").val(selectedGuest.address.city)
    $("#state").val(selectedGuest.address.state)
    $("#zip").val(selectedGuest.address.zip)
    $("#country").val(selectedGuest.address.country)
  }

  var clearFields = function() {
    $("#address1").val('')
    $("#address2").val('')
    $("#city").val('')
    $("#state").val('')
    $("#zip").val('')
    $("#country").val('')
  }
});