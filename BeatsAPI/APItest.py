import urllib2 
import json
#import xml.etree.ElementTree as ET
from pprint import pprint as pp

resp = urllib2.urlopen("https://partner.api.beatsmusic.com/v1/api/search?type=track&q=LCD+SoundSystem&client_id=mwfsu49zprp6rbcv4pfrux54")

jsonresp = json.loads(resp.read())
pp(jsonresp)



