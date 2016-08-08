// color palette
var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

// Safari will cache the data file for a long time
// unless:
datafile = urlObject().parameters.csv_file + '?nocache=' + (new Date()).getTime()
console.log(datafile)
d3.csv(datafile, function(data) {
    var emails = data
    pieBySender(emails)
    barBySender(emails)
})

//        .o   .o               o8o            
//       .8'  .8'               `"'            
//   .888888888888' oo.ooooo.  oooo   .ooooo.  
//     .8'  .8'      888' `88b `888  d88' `88b 
// .888888888888'    888   888  888  888ooo888 
//   .8'  .8'        888   888  888  888    .o 
//  .8'  .8'         888bod8P' o888o `Y8bod8P' 
//                   888                       
//                  o888o                      

function pieBySender(emails) {

    // aggregate the count of emails per sender
    var data = d3.nest()
        .key(function(d) { return d.correspondent; })
        .rollup(function(d) {
            return d3.sum(d, function(g) { return 1; })
        })
        .entries(emails);
    
    // sort the data in descending order of frequency
    data.sort(function compareNumbers(a, b) {
        return b.values - a.values;
    })

    // plot the data into an svg
    var width = 600,
        height = 500,
        radius = Math.min(width, height) / 2;

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(radius - 160)

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.values; });

    var svg = d3.select("#pieBySender").append("svg")
        .attr('id', 'pie') // we'll use this to convert and download the image
        .attr("width", width)
        .attr("height", height)
        .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
     
      var g = svg.selectAll("arc")
          .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

      g.append("path")
          .attr("d", arc)
          .style("fill", function(d) { return color(d.data.key); })
          .style('stroke', function(d) { return color(d.data.key); })

      // we will use this value to only automatically show names of people
      // who have frequencies above a certain threshold
      var totalEmails = d3.sum(data, function(d) { return d.values; })

      g.append("text")
          .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .style("text-anchor", "middle")
          .style('fill', 'white')
          .style('font-family', 'Fira Sans')
          .style("font-size", 12)
          .filter(function(d) { return (d.data.values/totalEmails) > .06; })
          .text(function(d) { return d.data.key; })
          .attr('opacity', 0)
          .transition()
          .duration(600)
          .attr('opacity', 1)
  
      var tooltip = d3.select('#pieBySender').append('div')
          .style('position', 'absolute')
          .style('background', 'lightblue')
          .style('color', 'black')
          .style('padding', '0 10px')
          .style('opacity', 0)

        svg.selectAll('path')
          .on('mouseover', function(d) {
            d3.select(this).transition()
              .style('opacity', .8)
            tooltip.transition()
              .style('opacity', .9)

            tooltip.html(d.data.key + ", " + d.data.values)
              .style('left', (d3.event.pageX - 35) + 'px')
              .style('top', (d3.event.pageY - 30) + 'px')
          })

          .on('mouseout', function(d) {
            d3.select(this).transition()
              .style('opacity', 1)
            tooltip.transition()
              .style('opacity', 0)
          })
}

//        .o   .o    .o8                          
//       .8'  .8'   "888                          
//   .888888888888'  888oooo.   .oooo.   oooo d8b 
//     .8'  .8'      d88' `88b `P  )88b  `888""8P 
// .888888888888'    888   888  .oP"888   888     
//   .8'  .8'        888   888 d8(  888   888     
//  .8'  .8'         `Y8bod8P' `Y888""8o d888b    
                                               
function barBySender(emails) {
     // aggregate the count of emails per sender
    var data = d3.nest()
        .key(function(d) { return d.correspondent; })
        .rollup(function(d) {
            return d3.sum(d, function(g) { return 1; })
        })
        .entries(emails);

    // sort the data in descending order of frequency
    data.sort(function compareNumbers(a, b) {
        return b.values - a.values;
    })

    // limit number of senders represented in bar graph to 50
    var originalSenderNumber = data.length
    if (originalSenderNumber > 50)
    {
      data = data.slice(0, 50)
      var excludedSenderNumber = originalSenderNumber - data.length

      if (excludedSenderNumber < 2) {
        var exSenderMessage = " sender couldn't fit in the bar graph and was excluded."
      } else {
        exSenderMessage = " correspondents couldn't fit in the bar graph and were excluded."
      }

      d3.select('#excludedSenders')
        .style('fill', '#000')
        .style('color', '#c43c35')
        .style('border-radius', '3px')
        .style('padding-left', '5px')
        .style('padding-right', '5px')
        .style('display', 'inline-block')
        .append('p')
        .html("<b>" + 
              excludedSenderNumber +
              "</b>" +
              exSenderMessage)
    } else {
      d3.select('#excludedSenders').remove()
    }

    //                                                  o8o              
    //                                                  `"'              
    // ooo. .oo.  .oo.    .oooo.   oooo d8b  .oooooooo oooo  ooo. .oo.   
    // `888P"Y88bP"Y88b  `P  )88b  `888""8P 888' `88b  `888  `888P"Y88b  
    //  888   888   888   .oP"888   888     888   888   888   888   888  
    //  888   888   888  d8(  888   888     `88bod8P'   888   888   888  
    // o888o o888o o888o `Y888""8o d888b    `8oooooo.  o888o o888o o888o 
    //                                      d"     YD                    
    //                                      "Y88888P'                    

    var margin = { top: 30, right: 40, bottom: 250, left: 70 }
                                                                  

    var width = 900 - margin.left - margin.right,
        height = 680 - margin.top - margin.bottom
   
    var xScale = d3.scale.ordinal().domain(d3.range(0,data.length)).rangeBands([0, width], .2);

    var maxFrequency = d3.max(data, function(d) { return d.values; })

    var yScale = d3.scale.linear().domain([0, maxFrequency]).range([0, height])

  
    // plot the data into an svg
   d3.selectAll('#barBySender').append('svg')
        .attr('id', 'barchart')
        .attr('width', width + margin.left + margin.right)      // handling margins
        .attr('height', height + margin.top + margin.bottom)    // handling margins
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')' )
        .selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
                .style('fill', function(d, i) { return color(i); })
                .attr('width', xScale.rangeBand())
                .attr('height', function(d) { return yScale(d.values); })
                .attr('y', function(d) { return height - yScale(d.values); })
                .attr('x', function(d,i) { return xScale(i); })

    var tooltip = d3.select('#barBySender').append('div')
        .style('position', 'absolute')
        .style('background', 'lightblue')
        .style('color', 'black')
        .style('padding', '0 10px')
        .style('opacity', 0)

    d3.selectAll('rect')
      .on('mouseover', function(d) {
        d3.select(this).transition()
          .style('opacity', .8)
        tooltip.transition()
          .style('opacity', .9)

      tooltip.html(d.key + ", " + d.values)
          .style('left', (d3.event.pageX - 15) + 'px')
          .style('top', (d3.event.pageY - 20) + 'px')
      })
      .on('mouseout', function(d) {
        d3.select(this).transition()
          .style('opacity', 1)
        tooltip.transition()
          .style('opacity', 0)
      })

    // create the vertical axis scale
    var yAxisScale = d3.scale.linear()
      .domain([0, maxFrequency])
      .range([height, 0])
    // create the vertical axis object
    var yAxis = d3.svg.axis()
        .scale(yAxisScale)
        .orient('left')
        .ticks(10)

    // create the vertical axis guide
    var yGuide = d3.select('#barchart').append('g')
    yAxis(yGuide)
    // handle positioning based on margins
    yGuide.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    yGuide.selectAll('path')
      .style('fill', 'none')
      .style('stroke', '#000')

    yGuide.selectAll('line')
      .style('stroke', '#000')

    yGuide.selectAll('text')
      .style('font-size', '12px')           // need to set these for savetopng to work
      .style('font-family', 'Fira Sans')    // need to set these for savetopng to work

    // create the horizontal axis object
    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .tickFormat(function(d,i) { return data[i].key; })

    // create the horizontal axis guide
    var xGuide = d3.select('#barchart').append('g')
    xAxis(xGuide)
    // handle positioning based on margins
    xGuide.attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')' )

    xGuide.selectAll('path')
      .style('fill', 'none')
      .style('stroke', '#000')

    xGuide.selectAll('line')
      .style('stroke', '#000')

    xGuide.selectAll('text')
      .style('font-size', '12px')           // need to set these for savetopng to work
      .style('font-family', 'Fira Sans')    // need to set these for savetopng to work
      .style('text-anchor', 'start')
      .attr("dx", ".8em")
      .attr("dy", ".15em")
      .attr('transform', 'rotate(65)' )

}

//  .oooo.o  .oooo.   oooo    ooo  .ooooo.  
// d88(  "8 `P  )88b   `88.  .8'  d88' `88b 
// `"Y88b.   .oP"888    `88..8'   888ooo888 
// o.  )88b d8(  888     `888'    888    .o 
// 8""888P' `Y888""8o     `8'     `Y8bod8P' 
                                                  
d3.select("#savePie").on("click", function(){
  saveSvgAsPng(document.getElementById("pie"), "pie_by_sender.png"); 
});

d3.select("#saveBar").on("click", function(){
  saveSvgAsPng(document.getElementById("barchart"), "bar_by_sender.png"); 
});
