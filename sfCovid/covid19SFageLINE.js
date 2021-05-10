//selects the body of the html and appends svg with certain width and height
let svg = d3.select("body").append("svg")
	.attr("width", 1440)
	.attr("height", 750);

//store the width and height for later
let width = +svg.attr("width");
let height = +svg.attr("height");

//render the data
function render(data) {

	// let casesByGroup = d3.nest()
	// 	.key(function(d) { return d.ageGroup})
	// 	.entries(data);

	//let casesByGroup = d3.group(data, d => d.ageGroup)

	let xVal = d => d.date; //gets the date for a value d
	let yVal = d => d.cumulativeCases; //gets the cases amount for a value d
	let zVal = d => d.ageGroup; //gets the cases amount for a value d

	//set the margins
	let margin = {
		top: 100,
		right: 150,
		bottom: 100,
		left: 325
	};

	//these set the width and height of the inner chart
	let innerWidth = width - margin.left - margin.right;
	let innerHeight = height - margin.top - margin.bottom;

	/*

	SET UP SCALES

	*/

	console.log(d3.max(data, yVal));
	console.log(d3.min(data, yVal));
	console.log(d3.max(data, xVal));
	console.log(d3.min(data, xVal));

	console.log(d3.max(data, xVal));
	//let latestDate = d3.max(data, xVal);
	let unparsedLatestDate = "2021/05/04";
	let latestDate = d3.timeParse("%Y/%m/%d")(unparsedLatestDate);
	console.log(latestDate);


	let scaleX = d3.scaleTime() //sets up how dates will scale
		.domain([d3.min(data, xVal), latestDate]) //the data space, but nice() rounds it cleanly
		.range([0, innerWidth]); //the pixel space

	let xAxis = d3.axisBottom(scaleX) //the bottom axis is connected to the scaleX now
		.tickSize(5)
		.tickPadding(20)
		.ticks(5)
		.tickFormat(d3.timeFormat("%b %Y"));

	let scaleY = d3.scaleLinear() //sets up how cases, y axis values will scale
		.domain([0, d3.max(data, yVal)]).nice()
		.range([innerHeight, 0])

	let yAxis = d3.axisLeft(scaleY) //left axis is connected to the scaleY now
		.tickPadding(20)
		.tickSize(5);

	let color = d3.scaleOrdinal()
  		.domain(data.map(zVal))
  		.range(["pink", "red", "orange", "green", "chartreuse", "cyan", "steelblue", "darkblue", "purple", "black", "gray", "brown", "chocolate", "gold"])

  	let legend = d3.legendColor() //make legend using Susie Lu's library
		.ascending(false)
		.title("Age Color Legend, ages sorted from most cases to least")
		.titleWidth(150)
		.scale(color);

	svg.append("g") //draw legend on page
		.attr("font-family", "sans-serif")
		.attr("transform", "translate(60, 30)")
		.call(legend);

	let g = svg.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`); //moves the chart out into clear space

	let yG = g.append("g") //adds a grouping for the cases, y axis
		.call(yAxis)
		.attr("font-size", 16); //size of number of cases labels

	yG.append("text") //add the y axis label
		.attr("font-size", 22)
		.attr("fill", "black")
		.text("Cumulative Cases")
		.attr("y", innerHeight / 2)
		.attr("x", -90);
	
	let xG = g.append("g") //adds another axis grouping for the x axis, sets up labels and ticks
		.call(xAxis)
		.attr("transform", `translate(0, ${innerHeight})`) //moves the dates to bottom
		.attr("font-size", 16);

	g.append("text") //adds another grouping for the name of the line chart
		.attr("font-family", "sans-serif")
		.text("SF COVID-19 Cumulative Cases by Age Group, as of " + unparsedLatestDate)
		.attr("text-anchor", "middle")
		.attr("font-size", 26)
		.attr("y", -20)
		.attr("x", innerWidth / 2);

	/*

	DRAW THE LINE

	*/

	data = d3.groups(data, d => d.ageGroup)

	let line = d3.line() //defines the x and y of the line
		.x(d => scaleX(xVal(d)))
		.y(d => scaleY(yVal(d)));

	console.log(data);

	// g.append("path") //add the line or path
	// 	.datum(data)
	// 	.attr("fill", "none")
	// 	.attr("stroke", "black")
	// 	.attr("stroke-width", 2)
	// 	.attr("stroke-linejoin", "round") //smooths line a bit
	// 	.attr("stroke-linecap", "round") //smooths line a bit
	// 	.attr("d", line); //call line to draw line

	function hover(elem) {
	    var attrs = elem.srcElement.attributes;
	    console.log(attrs);
	    let id = attrs['id'].value;
	    console.log(id);
        //let path = city.select('#' + id);
	    console.log(elem.srcElement);
	    //let path = elem.srcElement;
	    //let path = d3.select("#" + id);
	    //console.log(path);

	    g.selectAll("path")
	    	.transition()
	    	.attr("stroke", "gray")
	    	.style("opacity", "0.25");
	}

	function exit(elem) {
	     //resets the paths color and opacity on exit of event
	     g.selectAll("path")
	     	.transition()
	     	.attr("stroke", d => color(d[0].ageGroup))
	     	.style("opacity", "1");
	}

	g.selectAll("path").select("path")
		.data(data)
		.enter().append("path")
			.attr("class", "line")
			.datum(function(d) {
				return d[1];
			})
			.attr("fill", "none")
			.attr("stroke", d => color(d[0].ageGroup))
			.attr("stroke-width", 3)
			.attr("stroke-linejoin", "round") //smooths line a bit
			.attr("stroke-linecap", "round") //smooths line a bit
			.attr("id", d => d[0].ageGroup) //get the ageGroup from first data element
			.attr("d", line); //call line to draw line
			// .on("mouseover", function(d) {
		 //  		hover(d);
		 // 	})
		 // 	.on("mouseout", exit);

	/*

	DATA SOURCE

	*/

	let sourcePage = "https://data.sfgov.org/COVID-19/COVID-19-Cases-Summarized-by-Age-Group/sunc-2t3k";

	g.append("text") //adds another grouping for the name of the pie chart
		.attr("font-family", "sans-serif")
		.text("Source: DataSF")
		.attr("text-anchor", "middle")
		.attr("font-size", 16)
		.attr("fill", "gray")
		.attr("y", innerHeight + 70)
		.attr("x", innerWidth / 2)
		.on("click", function() {
			window.open(sourcePage);
		});
}

d3.csv("https://data.sfgov.org/api/views/sunc-2t3k/rows.csv?accessType=DOWNLOAD", function(d) { //for each entry
	return {	//parse date from multiple entries
		date: d3.timeParse("%Y/%m/%d")(d["Specimen Collection Date"]),
		ageGroup: d["Age Group"],
		cumulativeCases: +d["Cumulative Confirmed Cases"]
	};
	
}).then(function(data) {
	data.sort(function(x,y) {
		return d3.descending(x.cumulativeCases, y.cumulativeCases); //sorts the function so in bar chart, highest will be at top
	});
	console.log(data);
	//data = d3.group(data, d => d.ageGroup);
	//data = d3.groups(data, d => d.ageGroup)
	render(data); //then render the data as it has been fully processed
});