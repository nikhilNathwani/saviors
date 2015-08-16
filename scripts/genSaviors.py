from scrape import *

#This file generates the json to be used in the D3 visualizations

#For each year, I'll get the champion (and some pieces of metadata about them),
#and the players on their winning roster which they drafted (plus some metadata
#about each player). I refer to these players as "saviors"

#The format will be a list of dicts. Each list entry corresponds to a year (in 
#my JS I'll have a mapping from list index to year. Each dict will have the 
#champion team's metadata, and the list of saviors, which itself is a list
#of dicts containing the saviors' individual metadata


#TO DO:
#---create dict of # playoff wins needed to win a championship in a
#   given year, and divide d["saviorWS"] in genChampDict by that 
#   number to get a WS percentage 
#---get player's jersey numbers
#---get team's color


def genPlayerDict(playerLink,year):
	soup= grabSiteData("http://www.basketball-reference.com"+playerLink)
	d={}

	#header div from which name and jerseyNum can be found
	header= soup.find("div",{"id":"info_box"})
	name= header.find("h1").text
	d['totalPlayoffMins']= 0
	d['games']= 0
	d['minsPerGame']= 0.0
	d['winShares']= 0.0

	#playoff stats table from which the remaining data can be found
	playoffTable= soup.find("table",{"id":"playoffs_advanced"})
	#if playoffTable is None, player didn't participate in playoffs
	if playoffTable==None:
		return d
	else:
		playoffTable=playoffTable.find("tbody")
	rows= playoffTable.findAll('tr')
	#if champRow is empty, player didn't participate in playoffs
	champRow= [r for r in rows if r.find('td').find('a') != None and r.find('td').find('a').text==seasonFromYear(year)]
	if len(champRow)==0:
		return d
	else: 
		champRow= champRow[0]
		stats= champRow.findAll('td')	

		#need totalPlayoffMins, for Saviors Combined Playoff Mins in genChampDict	
		d['totalPlayoffMins']= int(stats[6].text)
		d['games']= int(stats[5].text)
		d['minsPerGame']= round(int(stats[6].text)/float(stats[5].text),1)
		d['winShares']= float(stats[22].text)
		return d


def genChampDict(teamLink):
	d={}
	d['team']= teamFromURL(teamLink)
	d['year']= yearFromURL(teamLink)
	d['link']= teamLink
	d["saviors"]= [genPlayerDict(pl,yearFromURL(teamLink)) for pl in getSaviors(teamLink)]
	d["totalMins"]= getTeamPlayoffMins(teamLink)
	d["totalWS"]
	d["saviorMins"]= reduce(lambda x,y: x+y, [x['totalPlayoffMins'] for x in d['saviors']])
	d["saviorWS"]= round(reduce(lambda x,y: x+y, [x['winShares'] for x in d['saviors']]),1)
	print d
	return d


def genJSON():
	jsonList= [genChampDict(tl) for tl in getChampions()][::-1]
	writeJSONToFile(jsonList,'/saviors.json')


if __name__ == "__main__":
	start= time.time()
	genJSON()
	print "Time taken:", time.time()-start