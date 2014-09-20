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

  var activities = ['entertaining', 'dreaming', 'breaking stuff', 'being sad', 'going outside', 'celebrating', 'chilling out', 'starting a riot', 'humming along', 'cooking', 'partying hard', 'driving', 'jetsetting', 'making love', 'going back in time', 'kicking back', 'making bad choices', 'gaming', 'dancing', 'taking a selfie', 'getting naked', 'pre-partying', 'breaking something', 'romancing', 'running', 'saving the world', 'studying', 'wasting time', 'waking up', 'working out', 'working'];

var people = ['your mom', 'my BFF', 'myself', 'my boo', 'my co-workers', 'the boys', 'strangers', 'no regrets', 'my boss', 'extraterrestrials', 'my lover', 'my pets', 'my thoughts', 'beautiful people', 'a stiff drink', 'my girls', 'your ex', 'my friends', 'my haters'] 

  var genres = ['Classic Rock', '90s Pop-Rock', 'Alt Rock', 'Americana', 'Classic Country', 'Country', 'The 2000s', 'Disco', 'Dance', 'Electronic', 'Hair Metal', 'Rock', 'Hardcore Hip-Hop', 'Hardcore', 'Indie', 'Jazz Vocals', 'Jazz', 'Metal', 'Musica Mexicana', 'Musica Tropical', 'New Wave', 'Old School Hip-Hop', 'Old Skool Dance', 'Oldies', 'Pop Latino', 'Pop', 'Punk', 'Reggae & Dancehall', 'Seminal Indie', 'Smooth Jazz', 'Soft Rock', 'Sounds of the 70s', 'The 60s', 'The 80s', 'Vintage Soul & Funk', 'Hip-Hop', 'R&B'];




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
  
  $('#the-basics2 .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'activities',
    displayKey: 'value',
    source: substringMatcher(activities)
  });
  $('#the-basics3 .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'people',
    displayKey: 'value',
    source: substringMatcher(people)
  });
  $('#the-basics4 .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'genres',
    displayKey: 'value',
    source: substringMatcher(genres)
  });
});
