import urllib2 
import json
from pprint import pprint as pp




resp = urllib2.urlopen("https://partner.api.beatsmusic.com/v1/api/search?type=track&q=Dance+yrself+clean&client_id=ytuyn29p9e5b4udwtgwmughe")



jsonresp = json.loads(resp.read())
pp(jsonresp)
