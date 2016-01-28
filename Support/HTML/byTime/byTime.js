// color palette
var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

// days of the week corresponding to the integer returned by [date].getDay()
var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// margin and dimensions needed for both scatterplot and linegraph
var margin = { top: 70, right: 100, bottom: 60, left: 30 }
                                                              
var width = 900 - margin.left - margin.right,
    timeGraphWidth = width,
    timeGraphHeight = 200,
    height = 800 - timeGraphHeight - margin.top - margin.bottom

// Safari will cache the data file for a long time
// unless:
datafile = urlObject().parameters.csv_file + '?nocache=' + (new Date()).getTime()

d3.csv(datafile, function(data) {
    var emails = data

    // filter out emails with missing date headers
    // (which is a thing that happens)
    emails = sanitizeEmails(emails)
    pieByDays(emails)
    seriesTime(emails)
    lineTime(emails)
})

//                                 o8o  
//                                 `"'  
//  .oooo.o  .oooo.   ooo. .oo.   oooo  
// d88(  "8 `P  )88b  `888P"Y88b  `888  
// `"Y88b.   .oP"888   888   888   888  
// o.  )88b d8(  888   888   888   888  
// 8""888P' `Y888""8o o888o o888o o888o 

function sanitizeEmails(emails) {
    var originalCount = emails.length
    emails = emails.filter(function(ems) {
        return ems.localDateTime != "";
    })
    var newCount = emails.length
    var excludedCount = originalCount - newCount

    if (excludedCount > 0) {
        if (excludedCount < 2) {
            var datemessage = " message was missing a date header and was excluded."
        } else {
            var datemessage = " messages were missing a date header and were excluded."
        }

        d3.select('#excludedEmails')
            .style('color', 'white')
            .style('background-color', '#c43c35')
            .style('text-transform', 'uppercase')
            .style('border-radius', '3px')
            .style('padding-left', '5px')
            .style('padding-right', '5px')
            .style('display', 'inline-block')
            .append('p')
            .html("<b>" + 
                  excludedCount +
                  "</b>" +
                  datemessage)
    } else { // no excluded emails, delete excludedEmails div
        d3.select('#excludedEmails').remove()
    }

    return emails
}

//        .o   .o               o8o        .o8                                 
//       .8'  .8'               `"'       "888                                 
//   .888888888888' oo.ooooo.  oooo   .oooo888   .oooo.   oooo    ooo  .oooo.o 
//     .8'  .8'      888' `88b `888  d88' `888  `P  )88b   `88.  .8'  d88(  "8 
// .888888888888'    888   888  888  888   888   .oP"888    `88..8'   `"Y88b.  
//   .8'  .8'        888   888  888  888   888  d8(  888     `888'    o.  )88b 
//  .8'  .8'         888bod8P' o888o `Y8bod88P" `Y888""8o     .8'     8""888P' 
//                   888                                  .o..P'               
//                  o888o                                 `Y8P'                
                                                                            
function pieByDays(emails) {
	// some functions to parse the date
	parseDate = d3.time.format("%Y-%m-%d").parse
	parseTime = d3.time.format("%H:%M:%S").parse
	
    // create new value of day of week from date
	emails.forEach(function(d) {
		dateSplit = d.localDateTime.split(" ")
		d.date = parseDate(dateSplit[0])
		d.time = parseTime(dateSplit[1])
		d.dayOfWeekInt = d.date.getDay()
	})

	// aggregate frequencies by day of the week
   var data = d3.nest()
        .key(function(d) { return d.dayOfWeekInt; })
        .rollup(function(d) {
            return d3.sum(d, function(g) { return g.count; })
    })
    .entries(emails);

    // sort days of the week
    data.sort(function compareNumbers(a, b) {
    	return a.key - b.key
    })
    
	//            oooo                .   
	//            `888              .o8   
	// oo.ooooo.   888   .ooooo.  .o888oo 
	//  888' `88b  888  d88' `88b   888   
	//  888   888  888  888   888   888   
	//  888   888  888  888   888   888 . 
	//  888bod8P' o888o `Y8bod8P'   "888" 
	//  888                               
	// o888o                              
    
    // plot the data into an svg

    var width = 600,
    	height = 500,
    	radius = Math.min(width, height) / 2

    var arc = d3.svg.arc()
    	.outerRadius(radius - 10)                               
    	.innerRadius(radius - 160)

    var pie = d3.layout.pie()
    	.sort(null)
    	.value(function(d) { return d.values; })

    var svg = d3.select('#pieByTime').append('svg')
    	.attr('id', 'pie')
    	.attr('width', width)
    	.attr('height', height)
    	.append('g')
    		.attr('transform', 'translate(' + width/2 + ',' + height/2 + ')')

    var g = svg.selectAll('arc')
    	.data(pie(data))
    	.enter().append('g')
    		.attr('class', 'arc')

    	g.append('path')
    		.attr('d', arc)
    		.style('fill', function(d, i) { return color(i); })
    		.style('stroke', function(d, i) { return color(i); })

    	g.append('text')
    		.attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
    		.attr('dy', '.35em')
    		.attr('text-anchor', 'middle')
    		.attr('fill', 'white')
    		.style('font-family', 'Fira Sans')
    		.style('font-size', 12)
    		.text(function(d) { return days[d.data.key]; })
    		.attr('opacity', 0)
    		.transition().duration(600)
    		.attr('opacity', 1)

    var tooltip = d3.select('#pieByTime').append('div')
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
    		tooltip.html(d.data.values)
				.style('left', (d3.event.pageX - 45) + 'px')
				.style('top', (d3.event.pageY - 30) + 'px')
    	})

    	.on('mouseout', function(d) {
    		d3.select(this).transition()
    			.style('opacity', 1)
    		tooltip.transition()
    			.style('opacity', 0)
    	})

}
                                         
//        .o   .o                                o8o                     
//       .8'  .8'                                `"'                     
//   .888888888888'  .oooo.o  .ooooo.  oooo d8b oooo   .ooooo.   .oooo.o 
//     .8'  .8'     d88(  "8 d88' `88b `888""8P `888  d88' `88b d88(  "8 
// .888888888888'   `"Y88b.  888ooo888  888      888  888ooo888 `"Y88b.  
//   .8'  .8'       o.  )88b 888    .o  888      888  888    .o o.  )88b 
//  .8'  .8'        8""888P' `Y8bod8P' d888b    o888o `Y8bod8P' 8""888P' 


function seriesTime(emails) {

    //                                                  o8o              
    //                                                  `"'              
    // ooo. .oo.  .oo.    .oooo.   oooo d8b  .oooooooo oooo  ooo. .oo.   
    // `888P"Y88bP"Y88b  `P  )88b  `888""8P 888' `88b  `888  `888P"Y88b  
    //  888   888   888   .oP"888   888     888   888   888   888   888  
    //  888   888   888  d8(  888   888     `88bod8P'   888   888   888  
    // o888o o888o o888o `Y888""8o d888b    `8oooooo.  o888o o888o o888o 
    //                                      d"     YD                    
    //                                      "Y88888P'                    

   	var formatDay_Time = d3.time.format("%H:%M")		// tooltip time
    var formatWeek_Year = d3.time.format("%B %d, %Y")	// tooltip date

    var x = d3.time.scale().range([0, width])
    var y = d3.time.scale().range([0, height])

    // Set the domains
    y.domain([new Date(1899, 12, 02, 0, 0, 0), 
              new Date(1899, 12, 01, 0, 0, 1)])
    x.domain(d3.extent(emails, function(d) { return d.date; }))

    var xAxis = d3.svg.axis()
    	.scale(x)
    	.orient('bottom')
    	.ticks(10)
        .outerTickSize(0)

    var yAxis = d3.svg.axis()
    	.scale(y)
    	.orient('right')
    	.ticks(24)
        .outerTickSize(0)
    	.tickFormat(formatDay_Time)

    var svg = d3.select('#timeseries').append('svg')
    	.attr('id', 'timeseriesSVG')
        .style('background-color', 'white')
    	.attr('width', width + margin.left + margin.right)
    	.attr('height', height + timeGraphHeight + margin.top + margin.bottom)
    	.append('g')
    		.attr('class', "timeSeriesG")
    		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    // Draw the Axes and the tick labels
    var hAxis = svg.append("g")
        .attr("transform", "translate(0," + (height+5) + ")")
        .call(xAxis)
        .selectAll('path')
        	.style('fill', 'none')
        	.style('stroke', '#000')

     svg.selectAll("text")
        .style('font-size', '12px')           // need to set these for savetopng to work
	    .style('font-family', 'Fira Sans')    // need to set these for savetopng to work
      	.style('text-anchor', 'start')
		.attr("dx", ".8em")
		.attr('transform', 'rotate(35)' )

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate("  + (width + 15) +  ",0)")
        .call(yAxis)
        .selectAll('path')
        	.style('fill', 'none')
        	.style('stroke', '#000')

     svg.selectAll("text")
        .style('font-size', '12px')           // need to set these for savetopng to work
	    .style('font-family', 'Fira Sans')    // need to set these for savetopng to work
      	.style('text-anchor', 'start')

    // draw the plotted circles
    svg.selectAll("dot")
        .data(emails)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 2 )
        .style("opacity", 0.9)
        .style("fill", color(3) )
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.time); })

    var seriesTooltip = d3.select('#timeseries').append('div')
		.style('position', 'absolute')
		.style('background', 'lightblue')
		.style('color', 'black')
		.style('padding', '5px 10px')
		.style('opacity', 0)
		.style('text-align', 'left')

    d3.selectAll('circle')
        .on('mouseover', function(d) {
            d3.select(this).transition().duration(100)
                .attr('r', 5)
                .style('fill', color(2))

        seriesTooltip.transition()
        	.style('opacity', .9)

    	seriesTooltip.html(d.name + "</br>" + d.subjectLine + "</br>" + formatWeek_Year(d.date) + "</br>" + formatDay_Time(d.time))
      		.style('left', (d3.event.pageX - 55) + 'px')
      		.style('top', (d3.event.pageY - 90) + 'px')
      	})

        .on('mouseout', function(d) {
            d3.select(this).transition().duration(100)
                .attr('r', 2)
                .style('fill', color(3))

        seriesTooltip.html()
        seriesTooltip.transition()
            .style('opacity', 0)
      })

    // extend axes with lines for separation
    d3.select('#timeseriesSVG').append('line')
        .style('stroke', 'black')
        .attr('x1', width + margin.left)
        .attr('y1', height + margin.top + 5)
        .attr('x2', width + margin.left + 80)
        .attr('y2', height + margin.top + 5)

    d3.select('#timeseriesSVG').append('line')
        .style('stroke', 'black')
        .attr('x1', width + margin.left + 15)
        .attr('y1', height + margin.top)
        .attr('x2', width + margin.left + 15)
        .attr('y2', height + margin.top + 55)

}

function lineTime(emails) {

    // oooo   o8o                        
    // `888   `"'                        
    //  888  oooo  ooo. .oo.    .ooooo.  
    //  888  `888  `888P"Y88b  d88' `88b 
    //  888   888   888   888  888ooo888 
    //  888   888   888   888  888    .o 
    // o888o o888o o888o o888o `Y8bod8P' 


    d3.selectAll('#timeseriesSVG').append('g')
        .attr('id', 'lineGraph')
        .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top + 55) + ')')
        .append('rect')
            .attr('height', timeGraphHeight)
            .attr('width', timeGraphWidth)
            .style('fill', 'none')

    // aggregate totals by day
   var lineData = d3.nest()
        .key(function(d) { return d.date; })
        .rollup(function(d) {
            return d3.sum(d, function(g) { return g.count; })
    })
    .entries(emails);

    lineData.forEach(function(d) {
        d.key = new Date(d.key)
    })    

    // sort lineData by date
    lineData.sort(function compareNumbers(a, b) {
        return a.key - b.key
    })

    var earliest = d3.min(lineData, function(d) { return d.key; })
    var latest = d3.max(lineData, function(d) { return d.key; })

    var dirtyLineXRange = d3.time.scale().domain(d3.extent(lineData, function(d) { return d.key; })).range([0, timeGraphWidth])

    // fill in missing days with value of 0 emails
    var cleanedData = dirtyLineXRange.ticks(d3.time.day, 1).map(function(iteratedDay) {
        return _.find(lineData, {key: iteratedDay}) || {key: iteratedDay, values: 0}
    })

    // implement moving mean
    var movingMean = []
    var movingMeanWindow = 10

    // create a moving mean array from cleanData
    for (var ii = movingMeanWindow; ii < (cleanedData.length - movingMeanWindow); ii++)
    {
        var meanSlice = cleanedData.slice(ii, ii + movingMeanWindow);
        var mean = d3.sum(meanSlice, function(meanSlice) { return meanSlice.values }) / meanSlice.length

        movingMean.push(Math.round(mean * 100) / 100)
    }

    // transfer values of array to cleanData array
    for (var ii = movingMeanWindow; ii < (cleanedData.length - movingMeanWindow); ii++)
    {
        cleanedData[ii].values = movingMean[ii - movingMeanWindow]
    }

    // continue with the scales and plotting the line
    var lineXRange = d3.time.scale().domain(d3.extent(cleanedData, function(d) { return d.key; })).range([0, timeGraphWidth])    
    var lineYRange = d3.scale.linear().domain([0, d3.max(cleanedData, function(d) { return d.values; })]).range([timeGraphHeight, 0])

    lineYAxis = d3.svg.axis()
        .scale(lineYRange)
        .ticks(10)
        .tickPadding(10)
        .outerTickSize(0)
        .orient('right')

    var linePlotFunc = d3.svg.line()
        .x(function(d) { return lineXRange(d.key); })
        .y(function(d) { return lineYRange(d.values); })
        .interpolate('monotone')

    timeGraph = d3.select("#lineGraph")

    timeGraph.append('g')
        .attr('transform', 'translate(' + (timeGraphWidth + 15) + ',0)' )
        .call(lineYAxis)
            .selectAll('path')
            .style('fill', 'none')
            .style('stroke', '#000')

    timeGraph.append('path')
        .attr('id', 'lineplot')
        .attr('d', linePlotFunc(cleanedData) )
        .attr('stroke', color(3))
        .attr('fill', 'none')
        .style('stroke-width', 1.5)

    timeGraph.selectAll('text')
        .style('font-size', '12px')               // need to set these for savetopng to work
        .style('font-family', '-apple-system')    // need to set these for savetopng to work
}

//  .oooo.o  .oooo.   oooo    ooo  .ooooo.  
// d88(  "8 `P  )88b   `88.  .8'  d88' `88b 
// `"Y88b.   .oP"888    `88..8'   888ooo888 
// o.  )88b d8(  888     `888'    888    .o 
// 8""888P' `Y888""8o     `8'     `Y8bod8P'

d3.select('#savePieTime').on('click', function() {
	saveSvgAsPng(document.getElementById('pie'), 'pie_by_days_of_week.png')
})

d3.select('#saveTimeSeries').on('click', function() {
	saveSvgAsPng(document.getElementById('timeseriesSVG'), 'email_time_series.png')
})

// Initialize color picker and act on color changes
$("#colorpicker").spectrum({
    showInput: true,
    showInitial: true,
    preferredFormat: "hex",
    color: "#6b486b"
});

$("#colorpicker").on('change.spectrum', function(e, tinycolor) {
        var pickedColor = tinycolor.toHexString()
        console.log(pickedColor);

        d3.select("#timeseries").selectAll('circle')
            .style('fill', pickedColor)

        d3.select("#lineGraph").selectAll('#lineplot')
            .style('stroke', pickedColor)
});
