var colors= {"ATL":"#D21033", "BOS":"#05854C", "BRK":"#000000", "CHA":"#25799A", "CHI":"#D4001F", 
                             "CLE":"#9F1425", "DAL":"#006AB5", "DEN":"#4393D1", "DET":"#006BB6", "GSW":"#FFC33C", 
                             "HOU":"#CC0000", "IND":"#FFC225", "LAC":"#EE2944", "LAL":"#4A2583", "MEM":"#85A2C6", 
                             "MIA":"#B62630", "MIL":"#00330A", "MIN":"#12397F", "NOP":"#091D4A", "NYK":"#2E66B2", 
                             "OKC":"#0075C1", "ORL":"#077ABD", "PHI":"#C7974D", "PHO":"#FF7A31", "POR":"#E1393E", 
                             "SAC":"#743389", "SAS":"#BEC8C9", "TOR":"#CD1041", "UTA":"#448CCE", "WAS":"#004874", 
                             "SEA":"#006031", "WSB":"#CC3300", "STL":"#C41E3A", "PHW":"#FFCC00", "SYR":"#030066", 
                             "MNL":"#6495ED"}

//Jersey container SVG vars
topMargin= 20;
minMargin= 20;

//Jersey dimensions
var jers_w= 64;
var jers_h= 100;

function collectJerseys(containerSVG, w, h, chosenTeam, saviors) {
    var jers= containerSVG.selectAll("svg#outer")
                            .data(saviors)

    jers.exit().remove()
    jers.enter().append("svg")
                .attr("id","outer")

    numJerseysInRow= Math.floor((w-minMargin)/(jers_w+minMargin))
    n= numJerseysInRow

    trueMargin= (w-(n*jers_w))/(n+1)
    t= trueMargin

    jers.each(function(d,i) {
        x= t + (i%n)*(jers_w+t)
        y= topMargin + Math.floor(i/n)*(jers_h+t)
        createJersey(d3.select(this),x,y,chosenTeam,d,i)
    })

}

function createJersey(jerseySVG,x,y,chosenTeam,player,num) {
    var name= player.lastName;
    var number= player.jerseyNum;

    //SVG in which the jersey lives
    jerseySVG.attr("x",x)
	            .attr("y",y)
	            .attr("width",jers_w)
	            .attr("height",jers_h)

    //Scale everything to the desired amount
    var g= jerseySVG.append("g")
                    .attr("transform","scale(0.8)")
                    .attr("opacity",0)

    //Drawing the jersey outline           
    var jerseyShape= g.append("g")
                        .attr("id","jerseyShape")
                        .append("path")
                        .attr("id","outline")
                        .attr("stroke","#DDDDDD")
                        .attr("transform","translate(-40,0)")
                        //.attr("opacity","0.35")
                        .attr("fill",function(d) {
                                if (chosenTeam in colors) {
                                    return colors[chosenTeam];
                                }
                                else {
                                    return "grey";
                                }
                        })
                        .attr("stroke-width","3")
                        .attr("d","M116.462,113.911V39.01c0,0-18.493-5.977-15.317-30.633c0,0-8.033-2.616-8.78-3.363S91.617,9.311,79.29,9.124h-1.305C65.656,9.311,65.656,4.268,64.909,5.015s-8.778,3.363-8.778,3.363C59.305,33.034,40.813,39.01,40.813,39.01v74.901C40.813,113.911,74.434,126.427,116.462,113.911z");
    scaledText(g,chosenTeam,"name",name,24,-40,35,0.9,0.2)
    scaledText(g,chosenTeam,"number",number,64,-40,70,0.9,0.3)
    g.transition().delay(100*num).attr("opacity",1)
}

function scaledText(parentGroup,team,id,value,fontSize,xTrans,yTrans,widthScale,heightScale) {
    //SVG containing the text (and the viewport for it)            
    var svgInner= parentGroup.append("svg")
                          .attr("class","inner")
                          .attr("id",id+"SVG");

    //Player name
    svgInner.append("text")
            .attr("class",id)
            .attr("id",value)
            .attr("x",0)
            .attr("y",0)
            .attr("fill","white")
            .attr("font-family","sans-serif")
            .attr("font-size",fontSize)
            .attr("text-anchor","left")
            .attr("dominant-baseline","hanging")
            .text(value);
    
    var tBox= document.getElementById(value).getBBox()
    var oBox= document.getElementById("outline").getBBox()

    //Set text's SVG to be exactly the size of the text's bounding box
    svgInner.attr("width", function() {
        console.log("Text box: w=",tBox.width,"h=",tBox.height,"x=",tBox.x,"y=",tBox.y)
        return tBox.width * widthScale;
    })
    svgInner.attr("height", function() {
        var tBox= document.getElementById(value).getBBox()
        return tBox.height;
    })
    
    //Place SVG (i.e. the text() right where I want it on the jersey
    svgInner.attr("x", function() {
        console.log("Jersey box: w=",oBox.width,"h=",oBox.height,"x=",oBox.x,"y=",oBox.y)
        var oX= oBox.x + xTrans;
        var oW= oBox.width * widthScale;
        var nW= d3.select(this).attr("width")
        return oX - (nW-oW)/2 + oBox.width*((1-widthScale)/2);
    })
   
    svgInner.attr("y", function() {
        var oBox= document.getElementById("outline").getBBox()
        var oY= oBox.y + yTrans;
        var oH= oBox.height * heightScale;
        var nH= d3.select(this).attr("height")
        console.log(oY - (nH-oH)/2)
        return oY - (nH-oH)/2;
    })
    
    svgInner.attr("viewBox", function() {
        var tBox= document.getElementById(value).getBBox()
        var ttw= tBox.width
        var tth= tBox.height

        var w= document.getElementById("outline").getBBox().width*widthScale;
        var h= document.getElementById("outline").getBBox().height*heightScale;
        
        var vW= (ttw*ttw)/w;
        var vH= (tth*tth)/h;

        var vX= (ttw-vW)/2;
        var vY= (tth-vH)/2;

        return vX + " " + vY + " " + vW + " " + vH;
    })
    
    svgInner.attr("preserveAspectRatio","xMidYMid meet")
}

function setClothesline(chosenTeam,year,stat) {
    d3.json("http://localhost:5000/playersOfTeam/?team="+chosenTeam+"&year="+year+"&stat="+stat,function(players) {
        //setJerseysInClothesline(chosenTeam,year,players["items"],stat,isNeighbor);
        /*if(!isNeighbor){
            var dummyOppData= Array.apply(null, new Array(players["items"].length)).map(String.prototype.valueOf,"");
            setRowsInPlayerComp("Click on a team","",dummyOppData,stat,!isNeighbor);
        }*/
        console.log("CLOTH",players["items"])
        clothesLine.selectAll("svg")
                .data(players["items"])
                .enter()
                .append("svg")
                .each(function(d,i){
                    createJersey(d3.select(this),i*80 + 20,0,chosenTeam,d["name"],d["statValue"],i);
                });     
    });
}