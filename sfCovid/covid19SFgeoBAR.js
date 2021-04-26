//selects the body of the html and appends svg with certain width and height
let svg = d3.select("body").append("svg")
	.attr("width", 1400)
	.attr("height", 750);

//store the width and height for later
let width = +svg.attr("width");
let height = +svg.attr("height");

//render the data
function render(data) {

	let xVal = d => d.cumulativeCases; //gets the cumulative cases for each entry
	let yVal = d => d.neighborhood; //gets the neighborhood

	//set the margins
	let margin = {
		top: 100,
		right: 100,
		bottom: 100,
		left: 300
	};

	let innerWidth = width - margin.left - margin.right; //these get the width and height of the inner actual chart
	let innerHeight = height - margin.top - margin.bottom;

	let scaleX = d3.scaleLinear() //sets up how bars will scale
		.domain([0, d3.max(data, xVal)]).nice()
		.range([0, innerWidth]); //the pixel space

	let xAxis = d3.axisBottom(scaleX) //the bottom axis is connected to the scaleX now
		.tickSize(-innerHeight);

	let scaleY = d3.scaleBand() //sets up how the neighborhoods appear, spaced out
		.domain(data.map(yVal))
		.range([0, innerHeight])
		.padding(0.25);

	let yAxis = d3.axisLeft(scaleY); //left axis is connected to the scaleY now

	let g = svg.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`); //moves the chart out into clear space

	g.append("g") //adds a grouping of the neighborhoods names
		.call(yAxis)
		.attr("font-size", 16); //size of major labels
	
	let xG = g.append("g") //adds another axis grouping for the x axis, sets up labels and ticks
		.call(xAxis)
		.attr("transform", `translate(0, ${innerHeight})`) //moves the number labels to bottom
		.attr("font-size", 16);

	xG.append("text") //add the x axis name below x axis
		.attr("font-size", 22)
		.attr("fill", "black")
		.text("Cumulative Number of Cases")
		.attr("y", 50)
		.attr("x", innerWidth / 2);

	g.append("text") //adds another grouping for the name of the bar chart
		.attr("font-family", "sans-serif")
		.text("COVID-19 Cumulative Cases >1000 by Neighborhood, as of " + "2021/04/08")
		.attr("font-size", 26)
		.attr("text-anchor", "middle")
		.attr("y", -20)
		.attr("x", innerWidth / 2);
	
	let rects = g.selectAll("rect").data(data); //selects all the rects

	rects.enter().append("rect")
		.attr("y", d => scaleY(yVal(d))) //the y scales to the right value with the y val of d
		.attr("width", d => scaleX(xVal(d))) //the width scales to the right value with bar length of d
		.attr("height", scaleY.bandwidth()) //sets up the bars with the right bandwidth for each bar
		.attr("fill", "blue") //make the bar blue
		.attr("count", d => xVal(d))
		.on("mouseover", function(d) {        
			d3.select(this)
				.transition()
				.attr("fill", "orange");

			var attrs = d.srcElement.attributes;
        	let count = attrs['count'].value;

        	//tooltip from the book
        	//https://learning.oreilly.com/library/view/interactive-data-visualization/9781491921296/ch10.html#interactivity

			var xPos = parseFloat(d3.select(this).attr("width")) + 30;
			var yPos = parseFloat(d3.select(this).attr("y")) + scaleY.bandwidth() / 2 + 5;

			g.append("text")
				.attr("id", "tooltip")
				.attr("x", xPos)
				.attr("y", yPos)
				.attr("text-anchor", "middle")
				.attr("font-family", "sans-serif")
				.attr("font-size", "20px")
				.attr("font-weight", "bold")
				.attr("fill", "blue")
				.text(count);
		})
		.on("mouseout", function() {
			d3.select(this)
				.transition()
				.attr("fill", "blue");

			d3.select("#tooltip").remove();
		});
}

let desiredType = "Analysis Neighborhood";

d3.csv("https://data.sfgov.org/api/views/tpyr-dvnc/rows.csv?accessType=DOWNLOAD", function(d) { //for each entry
	//if the area type is the one we want to look at
	if (d["area_type"] == desiredType && +d["count"] > 1000) {
		return { //return the race and the cumulative cases
			neighborhood: d["id"],
			cumulativeCases: +d["count"],
			deaths: +d["deaths"],
			rate: +d["rate"]
		};
	}
}).then(function(data) {
	data.sort(function(x,y) {
		return d3.descending(x.cumulativeCases, y.cumulativeCases); //sorts the function so in bar chart, highest will be at top
	});

	render(data); //then render the data as it has been fully processed
});