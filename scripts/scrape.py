from util import *

def getChampions():
	championListURL= "http://www.basketball-reference.com/leagues/"
	#In the table of seasons, champion is the 3rd column
	soup= grabSiteData(championListURL)
	seasonRows= soup.find("tbody").findAll("tr")
	champCells= [cols.findAll("td")[2] for cols in seasonRows if notABA(cols) and post1951(cols)]
	champs= [champLink.find("a")["href"].encode("ascii","ignore") for champLink in champCells]
	return champs

def notABA(cols):
	return cols.findAll("td")[1].find("a").text != "ABA"

def post1951(cols):
	return yearFromSeason(cols.findAll("td")[0].find("a").text) > 1951

def getPlayersOnTeam(teamLink):
	teamSite= grabSiteData("http://www.basketball-reference.com"+teamLink)
	#In the team's roster table, links to player pages are the 2nd column
	rosterRows= teamSite.find("table",{"id" : "roster"}).find("tbody").findAll("tr")
	rosterNames= [data.findAll("td")[1] for data in rosterRows]
	playerLinks= [link.find('a')["href"].encode("ascii","ignore") for link in rosterNames]
	return playerLinks

def getPlayerDraftTeam(playerLink):
	playerSite= grabSiteData("http://www.basketball-reference.com"+playerLink)
	#first team played for is 3rd column of 1st row of stats table
	totalStatsTable= playerSite.find("table",{"id":"totals"}).find("tbody")
	rows= totalStatsTable.findAll("tr")[:2]

	#if the player was traded in first year, first row is total for the year ("TOT")
	firstTeam= rows[0].findAll("td")[2]
	if firstTeam.findAll('a')==[] and firstTeam.text=="TOT":
		firstTeam= rows[1].findAll("td")[2]

	firstTeamName= firstTeam.find('a').text
	return firstTeamName	


def isSavior(playerLink,teamLink):
	drafter= getPlayerDraftTeam(playerLink)
	champ= teamFromURL(teamLink)
	return drafter==champ

def getSaviors(teamLink):
	roster= getPlayersOnTeam(teamLink)
	saviors= [player for player in roster if isSavior(player,teamLink)]
	return saviors


if __name__=="__main__":
	'''
	start= time.time()
	champs= getChampions()
	t1= time.time()
	print "Time to get champions:", t1-start

	roster= getPlayersOnTeam(champs[0])
	t2= time.time()
	print "Time to get roster:", t2-t1

	drafter= getPlayerDraftTeam(roster[0])
	t3= time.time()
	print "Time to get drafter:", t3-t2
	'''
	start= time.time()
	champs= getChampions()
	t1= time.time()
	print "Time to get champions:", t1-start

	numSavs= []
	for c in champs: 
		s= saviors(c)
		print c, len(s), s
		numSavs.append(len(s))

	print "Time to get num saviors", time.time()-t1
