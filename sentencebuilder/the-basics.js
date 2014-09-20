$(document).ready(function(){
  var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
      var matches, substrRegex;

      // an array that will be populated with substring matches
      matches = [];

      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');

      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function(i, str) {
        if (substrRegex.test(str)) {
          // the typeahead jQuery plugin expects suggestions to a
          // JavaScript object, refer to typeahead docs for more info
          matches.push({ value: str });
        }
      });

      cb(matches);
    };
  };

  var places = ['in the car', 'out and about', 'at my computer', 'in the shower', 'at a party', 'in class', 'at home', 'at work', 'fashionably late', 'in bed', 'in the air', 'in the club', 'slacking off', 'bored as hell', 'thawing out', 'on a rooftop', 'in my underwear', 'on the subway', 'at the gym'
  ];

  $('#the-basics .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'places',
    displayKey: 'value',
    source: substringMatcher(places)
  });
});
