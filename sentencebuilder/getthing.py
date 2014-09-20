import json
import pprint as pp

outlist = []

myfile = open("data1.json", "r").read()
myjson = json.loads(myfile)

obj2 = myjson['data']['genres']

#pp.pprint(obj2)
for n in obj2:
  outlist.append((n['display'] ).encode('utf-8').strip(',')) 
#  outlist.append((n['id'] + ",").encode('utf-8').strip(',')) 
   
#  print "n: " + str(n)
print outlist

f = open('genres.txt', 'w')
f.write(str(outlist))

