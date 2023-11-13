// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 60 },
width = 460 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

var data1 = [
    { ser1: 1, ser2: 4 },
    { ser1: 2, ser2: 16 },
    { ser1: 3, ser2: 8 }
];

var data2 = [
    { ser1: 1, ser2: 7 },
    { ser1: 2, ser2: 1 },
    { ser1: 3, ser2: 8 }
];

var data3 = [
    { ser1: 1, ser2: 6 },
    { ser1: 2, ser2: 8 },
    { ser1: 3, ser2: 2 }
];


//Switching the data source of line chart
function switchLineGraphDataTo(data_switch_to) {
// Initialise a X axis:
var x = d3.scaleLinear().range([0, width]); //x-axis mapping relationship
var xAxis = d3.axisBottom().scale(x); //Create x-axis scales based on x-axis mapping relationships

// If this is the first call and there is no myXaxis, create a g that is myXaxis.
if(svg.selectAll(".myXaxis")._groups[0].length == 0)
{
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "myXaxis")
}


// Initialize an Y axis
var y = d3.scaleLinear().range([height, 0]); //y-axis mapping relationship
var yAxis = d3.axisLeft().scale(y); //Create y-axis scales based on y-axis mapping relationships

//If this is the first call and there is no myYaxis, create a g that is myYaxis
if(svg.selectAll(".myYaxis")._groups[0].length == 0)
{
    svg.append("g")
        .attr("class", "myYaxis")

}

// Create the X axis:
//Define the x-axis value domain
x.domain([d3.min(data_switch_to, function (d) { return d.ser1 }), d3.max(data_switch_to, function (d) { return d.ser1 })]);

//Construct x-axis from xAxis
svg.selectAll(".myXaxis")
    .transition()
    .duration(500)
    .call(xAxis);

// create the Y axis
//Define the y-axis value range
y.domain([0, d3.max(data_switch_to, function (d) { return d.ser2 })]); //The start of the y-axis starts at 0 and the start of the x-axis starts at min(x)
//Construct the y-axis from yAxis
svg.selectAll(".myYaxis")
    .transition()
    .duration(500)
    .call(yAxis);

// Create a update selection: bind to the new data
var u = svg.selectAll(".lineTest")
    .data([data_switch_to]); // Here you need to add a bracket to change the length of data to 1, otherwise ENTER will add many paths later based on the length of data.

// Updata the line
u
    .enter()
    .append("path")
    .attr("class", "lineTest")
    .merge(u)
    .transition()
    .duration(1000)
    .attr("d", d3.line()
        .x(function (d) { return x(d.ser1); })
        .y(function (d) { return y(d.ser2); }))
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2.5)
}

//Default load data1
switchLineGraphDataTo(data1)
