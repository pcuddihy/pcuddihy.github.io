/*

https://bl.ocks.org/zanarmstrong/2f22eba1cb1b6b80e6595fadd81e7424
Used that example to help in setting up a pie chart.
Used Susie Lu's legend library for setting up the legend.

*/

//selects the body of the html and appends svg with certain width and height
let svg = d3.select("body").append("svg")
	.attr("width", 1440)
	.attr("height", 750);

//store the width and height for later
let width = +svg.attr("width");
let height = +svg.attr("height");

//render the data
function render(data) {

	let xVal = d => d.cumulativeCases; //gets the cumulative cases for each entry
	let yVal = d => d.ageGroup; //gets the age group

	//set the margins
	let margin = {
		top: 300,
		right: 100,
		bottom: 100,
		left: 100
	};

	let innerWidth = width - margin.left - margin.right; //these get the width and height of the inner actual chart
	let innerHeight = height - margin.top - margin.bottom;
	let radius = Math.min(innerWidth, innerHeight) / 1.5; //sets up how big the pie chart will be

	let arc = d3.arc()
		.outerRadius(radius - 10)
		.innerRadius(0);

	let labelArc = d3.arc()	//can be used to put text inside pie slices
		.outerRadius(radius - 100)
		.innerRadius(radius - 100);

	let pie = d3.pie()
		.value(d => d.cumulativeCases);

	let color = d3.scaleOrdinal()
  		.domain(data.map(yVal))
  		.range(["pink", "red", "orange", "green", "chartreuse", "cyan", "blue", "darkblue", "purple", "black", "gray", "brown", "chocolate", "gold"])

  	let legend = d3.legendColor() //make legend using Susie Lu's library
		.ascending(false)
		.title("Age Group Color Legend, ages sorted from most cases to least")
		.titleWidth(200)
		.scale(color);

	let g = svg.append("g") //draw legend on page
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	g.append("g")
		.attr("transform", "translate(200, -100)")
		.attr("font-family", "sans-serif")
		.attr("font-size", 20)
		.call(legend);

	g.append("text") //adds another grouping for the name of the bar chart
		.attr("font-family", "sans-serif")
		.text("SF COVID-19 Cumulative Cases by Age Group, as of " + desiredDate)
		.attr("font-size", 26)
		.attr("text-anchor", "middle")
		.attr("y", -200)
		.attr("x", innerWidth / 2);
	
	let pieG = g.selectAll("arc")
		.data(pie(data))
		.enter().append("g")
		.attr("transform", `translate(${innerWidth / 2}, ${innerHeight / 2 - 50})`)
		.attr("class", "arc");

	pieG.append("path")
		.attr("d", arc)
		.attr("fill", d => color(d.data.ageGroup))
		.attr("id", d => d.data.ageGroup)
		.attr("value", d => d.data.cumulativeCases)
		.attr("percentage", d => d.data.percentage)
		.on("mouseover", function(d) {        
			d3.select(this)
				.attr("opacity", 0.5);

			var attrs = d.srcElement.attributes;
			let id = attrs['id'].value;
			let value  = attrs['value'].value;
			let percentage  = attrs['percentage'].value;

			g.append("text")
				.attr("id", "tooltip")
				.attr("x", innerWidth / 2)
				.attr("y", -125)
				.attr("text-anchor", "middle")
				.attr("font-family", "sans-serif")
				.attr("font-size", 20)
				.attr("fill", "black")
				.text(id + ": " + value + " cumulative cases, Percentage: " + percentage + "%");
		})
		.on("mouseout", function() {
			d3.select(this)
				.transition()
				.attr("opacity", 1);

			d3.select("#tooltip").remove();
		});

	pieG.append("text")
		.attr("transform", d => "translate(" + labelArc.centroid(d) + ")")
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.attr("font-family", "sans-serif")
		.attr("font-size", 20)
		.attr("fill", "black")
		.text(function(d) {
			if (d.data.percentage > 10) {
				return d.data.percentage + "%";
			}
		});

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
		.attr("y", innerHeight + 50)
		.attr("x", innerWidth / 2)
		.on("click", function() {
			window.open(sourcePage);
		});
}

let desiredDate = "2021/05/04";

d3.csv("https://data.sfgov.org/api/views/sunc-2t3k/rows.csv?accessType=DOWNLOAD", function(d) { //for each entry
	//if the day is the most recent day
	if (d["Specimen Collection Date"] == desiredDate) {
		return { //return the race and the cumulative cases
			ageGroup: d["Age Group"],
			cumulativeCases: +d["Cumulative Confirmed Cases"]
		};
	}
}).then(function(data) {
	data.sort(function(x,y) {
		return d3.descending(x.cumulativeCases, y.cumulativeCases); //sorts the function so in pie chart, highest will be at top
	});

	var sum = 0; 
	for (var i = 0; i < data.length; i++) {
		sum += data[i].cumulativeCases;
	}

	for (var i = 0; i < data.length; i++) {
		data[i].percentage = (data[i].cumulativeCases / sum * 100).toFixed(2);
	}

	render(data); //then render the data as it has been fully processed
});