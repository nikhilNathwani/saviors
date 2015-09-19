var colors= {"ATL":"#D21033", "BOS":"#05854C", "BRK":"#000000", "CHA":"#25799A", "CHI":"#D4001F", 
                             "CLE":"#9F1425", "DAL":"#006AB5", "DEN":"#4393D1", "DET":"#006BB6", "GSW":"#FFC33C", 
                             "HOU":"#CC0000", "IND":"#FFC225", "LAC":"#EE2944", "LAL":"#4A2583", "MEM":"#85A2C6", 
                             "MIA":"#B62630", "MIL":"#00330A", "MIN":"#12397F", "NOP":"#091D4A", "NYK":"#2E66B2", 
                             "OKC":"#0075C1", "ORL":"#077ABD", "PHI":"#C7974D", "PHO":"#FF7A31", "POR":"#E1393E", 
                             "SAC":"#743389", "SAS":"#BEC8C9", "TOR":"#CD1041", "UTA":"#448CCE", "WAS":"#004874", 
                             "SEA":"#006031", "WSB":"#CC3300", "STL":"#C41E3A", "PHW":"#FFCC00", "SYR":"#030066", 
                             "MNL":"#6495ED"}

var minSaviorMPG= 8;

//Jersey container SVG vars
var topMargin= 80;
var minMargin= 20;

var tTop= 10;
var t= 24;
var tBot= 20;

//Jersey dimensions
var jers_w= 64;
var jers_h= 100;

var high_padY= 10;

var subTop= 40;
var sub= 14;
var subBot= 30;

var j_w= 48;
var j_h= 75;

var low_padY= 40; 

var mX= 20; 

var nH= 4; //# of jerseys in high row
var nL= 6; //# of jerseys in low row

function savsWithEnoughMins(savs) {
    return savs.filter(function(d) {return d['minsPerGame'] >= minSaviorMPG})
}

function collectJerseys(containerSVG, w, h, chosenTeam, saviors) {

    containerSVG.select("#subtitle").attr("opacity",0)

    var numSavs= saviors.length;
    var highs= savsWithEnoughMins(saviors)
    var numHigh= highs.length
    var numLow= numSavs-numHigh;

    var nH_i= 0; //running count of high-min saviors seen;
    var nL_i= 0; //same as above but for low-min

    
    containerSVG.select("#subtitle")
                .attr("y",(tTop+t+tBot) + Math.floor(1+(numHigh-1)/nH)*(jers_h) + (-1+Math.floor(numHigh/nH))*high_padY + subTop)
                .transition().delay(200).attr("opacity",+(numLow>0))


    var jers= containerSVG.selectAll("svg#outer")
                            .data(saviors)

    jers.exit().remove()
    jers.enter().append("svg")
                .attr("id","outer")


    //trueMargin= (w-(nH*jers_w))/(nH+1)
    //t= trueMargin

    jers.each(function(d,i) {
        isLow= d['minsPerGame'] < minSaviorMPG;
        ind= [nH_i,nL_i]
        rowCount= [nH,nL]
        jw= [jers_w,j_w]
        
        console.log("S "+Math.floor(1+(numHigh-1)/nH)*(jers_h))

        x= mX + (ind[+isLow]%rowCount[+isLow])*(jers_w+(w-2*mX-(rowCount[+isLow]*jw[+isLow]))/(rowCount[+isLow]-1)) 
        y= isLow ? (tTop+t+tBot) + Math.floor(1+(numHigh-1)/nH)*(jers_h) + (-1+Math.floor(numHigh/nH))*high_padY + (subTop+sub+subBot) + Math.floor(nL_i/nL)*(j_h+low_padY) : (tTop+t+tBot) + Math.floor(nH_i/nH)*(jers_h+high_padY)
        console.log(d,d["fullName"],isLow,nH_i,nL_i,x,y)
        createJersey(d3.select(this),x,y,chosenTeam,d,i,0.8-(0.2*isLow))

        nH_i += (1-isLow);
        nL_i += isLow;
    })

}

function createJersey(jerseySVG,x,y,chosenTeam,player,num,scale) {
    var name= player.lastName;
    var dash= player.jerseyNum.indexOf('-')
    var number= dash == -1  ? player.jerseyNum : player.jerseyNum.substring(dash+1);
    number= number=='' ? "n/a" : number

    jerseySVG.selectAll("g").remove()

    //SVG in which the jersey lives
    jerseySVG.attr("x",x)
                .attr("y",y)
                .attr("width",jers_w)
                .attr("height",jers_h)

    //Scale everything to the desired amount
    var g= jerseySVG.append("g")
                    .attr("transform","scale("+scale+")")
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
    g.transition().delay(200).attr("opacity",1)

    //Tooltop for bars
    var jerseyTip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d,i) {
                return "<p>Player: <span style='color:red'>" + d['fullName'] + "</span></p> <p>Playoff mins per game: <span style='color:red'>" + parseFloat(d['minsPerGame']).toFixed(1) + "</span></p> <p>Playoff win shares: <span style='color:red'>" + parseFloat(d['winShares']).toFixed(1) + "</p>";
              })
    g.call(jerseyTip)
    g.on('mouseenter', jerseyTip.show)
    g.on('mouseleave', jerseyTip.hide)
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
        return tBox.width * widthScale;
    })
    svgInner.attr("height", function() {
        var tBox= document.getElementById(value).getBBox()
        return tBox.height;
    })
    
    //Place SVG (i.e. the text() right where I want it on the jersey
    svgInner.attr("x", function() {
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