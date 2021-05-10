//selects the body of the html and appends svg with certain width and height
let svg = d3.select("body").append("svg")
	.attr("width", 1440)
	.attr("height", 750);

//store the width and height for later
let width = +svg.attr("width");
let height = +svg.attr("height");

//render the data
function render(data) {

	let xVal = d => d.date; //gets the date for a value d
	let yVal = d => d.cases; //gets the cases amount for a value d

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

	console.log(d3.max(data, xVal));
	console.log(d3.max(data, yVal));
	//let latestDate = d3.max(data, xVal);
	let unparsedLatestDate = "2021/05/04";
	let latestDate = d3.timeParse("%Y/%m/%d")(unparsedLatestDate);
	console.log(latestDate);

	let scaleX = d3.scaleTime() //sets up how dates will scale
		.domain([d3.min(data, xVal), latestDate]) //the data space, but nice() rounds it cleanly
		.range([0, innerWidth]); //the pixel space

	let xAxis = d3.axisBottom(scaleX) //the bottom axis is connected to the scaleX now
		.tickSize(5)
		.tickPadding(10)
		.ticks(5)
		.tickFormat(d3.timeFormat("%b %Y"));

	let scaleY = d3.scaleLinear() //sets up how cases, y axis values will scale
		.domain([0, d3.max(data, yVal)]).nice()
		.range([innerHeight, 0])

	let yAxis = d3.axisLeft(scaleY) //left axis is connected to the scaleY now
		.tickPadding(10)
		.ticks(5);

	let g = svg.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`); //moves the chart out into clear space

	let yG = g.append("g") //adds a grouping for the cases, y axis
		.call(yAxis)
		.attr("font-size", 16); //size of number of cases labels

	yG.append("text") //add the y axis label
		.attr("font-size", 22)
		.attr("fill", "black")
		.text("New Cases Per Day")
		.attr("y", innerHeight / 2)
		.attr("x", -90);
	
	let xG = g.append("g") //adds another axis grouping for the x axis, sets up labels and ticks
		.call(xAxis)
		.attr("transform", `translate(0, ${innerHeight})`) //moves the dates to bottom
		.attr("font-size", 16);

	g.append("text") //adds another grouping for the name of the line chart
		.attr("font-family", "sans-serif")
		.text("SF COVID-19 New Cases Per Day as of " + unparsedLatestDate)
		.attr("font-size", 26)
		.attr("text-anchor", "middle")
		.attr("y", -20)
		.attr("x", innerWidth / 2);

	/*

	DRAW THE LINE

	*/

	let line = d3.line() //defines the x and y of the line
		.x(d => scaleX(xVal(d)))
		.y(d => scaleY(yVal(d)));

	g.append("path") //add the line or path
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "blue")
		.attr("stroke-width", 2)
		.attr("stroke-linejoin", "round") //smooths line a bit
		.attr("stroke-linecap", "round") //smooths line a bit
		.attr("d", line); //call line to draw line

	/*

	ANNOTATIONS

	*/

	let annotation1 = [{
		note: {
			label: "162 new cases",
			bgPadding: 0,
			title: "July 14, First smaller peak"
		},
		className: "show-bg",
		x: 300,
		y: 400,
		dx: 100,
		dy: -50
	}]

	let makeAnnotation1 = d3.annotation()
		.editMode(false)
		.notePadding(5)
		.type(d3.annotationLabel)
		.annotations(annotation1);

	let label1 = g.append("g")
		.attr("font-family", "sans-serif")
		.attr("class", "annotation-group")
		.call(makeAnnotation1);

	let annotation2 = [{
		note: {
			label: "563 new cases",
			bgPadding: 0,
			title: "January 4, SF reaches peak"
		},
		className: "show-bg",
		x: 690,
		y: 30,
		dx: -200,
		dy: 0
	}]

	let makeAnnotation2 = d3.annotation()
		.editMode(false)
		.notePadding(10)
		.type(d3.annotationLabel)
		.annotations(annotation2);

	let label2 = g.append("g")
		.attr("font-family", "sans-serif")
		.attr("class", "annotation-group")
		.call(makeAnnotation2);

	/*

	DATA SOURCE

	*/

	let sourcePage = "https://data.sfgov.org/COVID-19/COVID-19-Cases-Summarized-by-Date-Transmission-and/tvq9-ec9w";

	g.append("text") //adds another grouping for the name of the pie chart
		.attr("font-family", "sans-serif")
		.text("Source: DataSF")
		.attr("text-anchor", "middle")
		.attr("font-size", 16)
		.attr("fill", "gray")
		.attr("y", innerHeight + 50)
		.attr("x", innerWidth / 2)
		.on("click", function() {
			window.open(sourcePage);
		});
}

d3.csv("https://data.sfgov.org/api/views/tvq9-ec9w/rows.csv?accessType=DOWNLOAD", function(d) { //for each entry
	return {	//parse date from multiple entries
		date: d3.timeParse("%Y/%m/%d")(d["Specimen Collection Date"]),
		cases: +d["Case Count"]
	};
}).then(function(data) {
	console.log(data);
	//let finalData = d3.rollup(data, v => d3.sum(v, d => d.cases), d => d.date);

	//this helped: https://stackoverflow.com/questions/47893084/sum-the-values-for-the-same-dates
	let finalData = Object.values(data.reduce((v, d) => {
		v[d.date] = v[d.date] || {date: d.date, cases: 0};
		v[d.date].cases += +d.cases;
		return v;
	},{}));
	console.log(finalData);
	render(finalData); //then render the data as it has been fully processed
});