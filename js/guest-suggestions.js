$(function() {
  document.cookie="session=89003d6bbd6a51dc3ccc10e98f1239f1e4266b76gAJVKGY5MDQ2NzFmY2U4YzE0ZjgyYTRkMzA2YTZmNDYxNDZiOTAwNjQ3OTFxAS4=";
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "http://www.aisleplanner.com/api/wedding/43499/guests",
    "method": "GET",
    "headers": {
      "x-xsrf-token": "6defb5fe6bb0a6476a6b011857329c2617af2a0f",
      "x-requested-with": "XMLHttpRequest",
      "x-ap-api-version": "2017-06-12",
      "Content-Type": "application/json",
    }
  }
  $.ajax(settings).done(function (response) {
    console.log(response);
  });

    var availableTags = [
      "ActionScript",
      "AppleScript",
      "Asp",
      "BASIC",
      "C",
      "C++",
      "Clojure",
      "COBOL",
      "ColdFusion",
      "Erlang",
      "Fortran",
      "Groovy",
      "Haskell",
      "Java",
      "JavaScript",
      "Lisp",
      "Perl",
      "PHP",
      "Python",
      "Ruby",
      "Scala",
      "Scheme"
    ];
    $( "#tags" ).autocomplete({
      source: availableTags
    });
  } );