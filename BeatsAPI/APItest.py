from urllib import request
import urllib
import json
import xml.etree.ElementTree as ET
from pprint import pprint as pp

resp = urllib.request.urlopen("https://partner.api.beatsmusic.com/v1/api/search?type=track&q=LCD+SoundSystem&client_id=mwfsu49zprp6rbcv4pfrux54")

read = resp.read().decode('utf-8')

load = json.loads(read)

pp(read)

