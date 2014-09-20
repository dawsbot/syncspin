var rest = require('restler');
rest.get('https://partner.api.beatsmusic.com/v1/oauth2/authorize?state=xyz&response_type=token&redirect_uri=http%3A%2F%2Fwww.google.com&client_id=ytuyn29p9e5b4udwtgwmughe').on('complete', function(result) {
  if (result instanceof Error) {
    console.log('Error:', result.message);
    this.retry(1000); // try again after 1 sec
  } else {
    console.log(result);
  }
});
