
var data1 = [
    { time: 1, sensorVal: 4 },
    { time: 2, sensorVal: 16 },
    { time: 3, sensorVal: 8 },
    { time: 4, sensorVal: 9 },

];

var ganttTestData = [
    {
        type: "pressure",
        startTime: new Date(),
        endTime: new Date(new Date().setHours(new Date().getHours() + 2))
    },

    {
        type: "pressure",
        startTime: new Date(2023, 2, 11, 5, 0),
        endTime: new Date(2023, 2, 11, 5, 34)
    },

    {
        type: "temp",
        averageTemp: "38°C",
        startTime: new Date(2023, 2, 11, 2, 23),
        endTime: new Date(2023, 2, 11, 2, 34)
    },

    {
        type: "temp",
        averageTemp: "37.5°C", 
        startTime: new Date(2023, 2, 11, 6, 23),
        endTime: new Date(2023, 2, 11, 6, 34)
    },

    {
        type: "humidity",
        averageHumidity: "95%", 
        startTime: new Date(2023, 2, 11, 1, 3),
        endTime: new Date(2023, 2, 11, 2, 34)
    }
];


const html = document.getElementsByTagName("html");
const remToPx = parseFloat(window.getComputedStyle(html[0]).fontSize.slice(0, -2));

const lineGraphMargin = { top: remToPx, right: 3 * remToPx, bottom: 1.6 * remToPx, left: 3 * remToPx };
const ganttGraphMargin = { top: 1.2 * remToPx, right: 2 * remToPx, bottom: 0 * remToPx, left: 0.5 * remToPx };

let lineGraphPressureSvg;
let lineGraphTempHumiSvg;
let ganttGraphSvg;
let svgLineGraphWidth;
let svgLineGraphHeight;
let svgGanttGraphWidth;
let svgGanttGraphHeight;
let currentTime = new Date();
currentTime.setMinutes(0);
currentTime.setSeconds(0); 
currentTime.setMilliseconds(0); 


let hourLength = 80 * remToPx; 


function vizGanttGraph(idName, hours) {
    let graphEndTime = new Date();
    graphEndTime.setHours(graphEndTime.getHours() + hours); 
    graphEndTime.setHours(graphEndTime.getHours() + 1);
    graphEndTime.setMinutes(0);
    graphEndTime.setSeconds(0);
    graphEndTime.setMilliseconds(0);


    svgGanttGraphWidth = hours * hourLength + 50;
    svgGanttGraphHeight = parseFloat(document.getElementById(idName).clientHeight) - ganttGraphMargin.top - ganttGraphMargin.bottom;

    // append the svg object to the body of the page
    ganttGraphSvg = d3.select(`#${idName}`)
        .append("svg")
        .attr("id", "ganttGraphSvgGraph")
        .attr("width", svgGanttGraphWidth + ganttGraphMargin.right + ganttGraphMargin.left)
        .attr("height", svgGanttGraphHeight + ganttGraphMargin.top + ganttGraphMargin.bottom)

   
    let timeScale = d3.scaleTime()
        .domain([currentTime, graphEndTime])
        .range([ganttGraphMargin.left, svgGanttGraphWidth - ganttGraphMargin.right]);
    let xAxis = d3.axisTop().scale(timeScale)
        .ticks(hours * 12)
        .tickSize(svgGanttGraphHeight, 0, 0) 
        .tickFormat(d3.timeFormat('%H:%M'));

    ganttGraphSvg.append("g")
        .attr("transform", `translate(${ganttGraphMargin.left},${svgGanttGraphHeight + ganttGraphMargin.top})`)
        .attr("class", "myXaxis")
        .attr("color", "#cdcdcd")

    ganttGraphSvg.selectAll(".myXaxis")
        .style("font-family", "ZCOOL XiaoWei")
        .style("font-size", "0.8rem")
        .transition()
        .duration(1000)
        .call(xAxis);

    ganttGraphSvg.select(".domain").remove() 

    let ganttTestData_pressure = [];
    ganttTestData.forEach(element => {
        if (element.type == "pressure") {
            ganttTestData_pressure.push(element);
        }
    })

    let ganttTestData_temp = [];
    ganttTestData.forEach(element => {
        if (element.type == "temp") {
            ganttTestData_temp.push(element);
        }
    })

    let ganttTestData_humidity = [];
    ganttTestData.forEach(element => {
        if (element.type == "humidity") {
            ganttTestData_humidity.push(element);
        }
    })

    function rightRoundedRect(x, y, width, height, radius) {
        return "M" + (x + radius) + "," + y
            + "h" + (width - 2 * radius)
            + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
            + "v" + (height - 2 * radius)
            + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius
            + "h" + (2 * radius - width)
            + "a" + radius + "," + radius + " 1 0 1 " + -radius + "," + -radius
            + "v" + (2 * radius - height)
            + "a" + radius + "," + radius + " 1 0 1 " + radius + "," + -radius
            + "z";
    }

    let boxOffset = { "pressure": 0.8 * remToPx, "humidity": svgGanttGraphHeight - 3 * remToPx, "temp": (svgGanttGraphHeight - 3 * remToPx + 0.8 * remToPx) / 2 }

    let focusText = ganttGraphSvg
        .append('g')
        .attr("transform", `translate(${ganttGraphMargin.left},${ganttGraphMargin.top})`)
        .append('text')
        .style("font-family", "ZCOOL XiaoWei")
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    pressureGanttG = ganttGraphSvg.append("g")
        .attr("transform", `translate(${ganttGraphMargin.left},${ganttGraphMargin.top})`)
        .attr("class", "pressureGantt")

    let pressureBoxes = pressureGanttG
        .selectAll(".pressureGantt")
        .data(ganttTestData_pressure)
        .enter()
        .append("path")
        .attr("d", function (d) {
            return rightRoundedRect(timeScale(d.startTime), boxOffset["pressure"], timeScale(d.endTime) - timeScale(d.startTime), 2 * remToPx, 5);
        })
        .attr("opacity", "0")

    pressureBoxes
        .transition()
        .duration(3000)
        .attr("opacity", "1")
        .attr("fill", function (d) {
            if ((d.endTime - d.startTime) / 60000 >= 120) { 
                return "#9568f1"
            }
            return "#fff" 
        })
        .attr("stroke", function (d) {
            return "#9568f1"

        })
        .attr("stroke-width", function (d) {
            return "2"
        })

    pressureBoxes
        .on("mouseover", function (event, d) {
            let prolongedTime = (d.endTime - d.startTime) % (24 * 3600 * 1000) / (3600 * 1000)
            focusText.style("opacity", 1)
                .html(`high pressure: ${prolongedTime.toFixed(2)}h`)
                .attr("x", timeScale(d.endTime) + remToPx)
                .attr("y", boxOffset["pressure"] + remToPx)
        })
        .on('mouseout', function () {
            focusText.style("opacity", 0)
        });

    tempGanttG = ganttGraphSvg.append("g")
        .attr("transform", `translate(${ganttGraphMargin.left},${ganttGraphMargin.top})`)
        .attr("class", "tempGantt")

    let tempBoxes = tempGanttG
        .selectAll(".tempGantt")
        .data(ganttTestData_temp)
        .enter()
        .append("path")
        .attr("d", function (d) {
            return rightRoundedRect(timeScale(d.startTime), boxOffset["temp"], timeScale(d.endTime) - timeScale(d.startTime), 2 * remToPx, 5);
        })
        .attr("opacity", 0)

    tempBoxes
        .transition()
        .duration(3000)
        .delay(500)
        .attr("opacity", "1")
        .attr("fill", function (d) {
            return "#db6161"
        })

    tempBoxes
        .on("mouseover", function (event, d) {
            focusText.style("opacity", 1)
                .html(`abnormal temprature: ${d.averageTemp}`)
                .attr("x", timeScale(d.endTime) + remToPx)
                .attr("y", boxOffset["temp"] + remToPx)
        })
        .on('mouseout', function () {
            focusText.style("opacity", 0)
        });

    humidityGanttG = ganttGraphSvg.append("g")
        .attr("transform", `translate(${ganttGraphMargin.left},${ganttGraphMargin.top})`)
        .attr("class", "humidityGantt")

    let humidityBoxes = humidityGanttG
        .selectAll(".humidityGantt")
        .data(ganttTestData_humidity)
        .enter()
        .append("path")
        .attr("d", function (d) {
            return rightRoundedRect(timeScale(d.startTime), boxOffset["humidity"], timeScale(d.endTime) - timeScale(d.startTime), 2 * remToPx, 5);
        })
        .attr("opacity", 0)

    humidityBoxes
        .transition()
        .duration(3000)
        .delay(1000)
        .attr("opacity", "1")
        .attr("fill", function (d) {
            return "#5fb3dd"
        })

    humidityBoxes
        .on("mouseover", function (event, d) {
            focusText.style("opacity", 1)
                .html(`high humidity: ${d.averageHumidity}`)
                .attr("x", timeScale(d.endTime) + remToPx)
                .attr("y", boxOffset["humidity"] + remToPx)
        })
        .on('mouseout', function () {
            focusText.style("opacity", 0)
        });

}

function vizLineGraph(idPressureName, idTempHumiName) {
    svgLineGraphWidth = parseFloat(document.getElementById(idPressureName).clientWidth) - lineGraphMargin.left - lineGraphMargin.right;
    svgLineGraphHeight = parseFloat(document.getElementById(idPressureName).clientHeight) - lineGraphMargin.top - lineGraphMargin.bottom;

    lineGraphPressureSvg = d3.select(`#${idPressureName}`)
        .append("svg")
        .attr("id", "lineGraphPressureSvgGraph")
        .attr("width", svgLineGraphWidth + lineGraphMargin.left + lineGraphMargin.right)
        .attr("height", svgLineGraphHeight + lineGraphMargin.top + lineGraphMargin.bottom)
        .append("g")
        .attr("transform", `translate(${lineGraphMargin.left},${lineGraphMargin.top})`);

    lineGraphTempHumiSvg = d3.select(`#${idTempHumiName}`)
        .append("svg")
        .attr("id", "lineGraphTempHumiSvgGraph")
        .attr("width", svgLineGraphWidth + lineGraphMargin.left + lineGraphMargin.right)
        .attr("height", svgLineGraphHeight + lineGraphMargin.top + lineGraphMargin.bottom)
        .append("g")
        .attr("transform", `translate(${lineGraphMargin.left},${lineGraphMargin.top})`);
}


function switchPressureLineGraphDataTo(data_switch_to) {
    // Initialise a X axis:
    let x = d3.scaleLinear().range([0, svgLineGraphWidth]);
    let xAxis = d3.axisBottom().scale(x); 

    if (lineGraphPressureSvg.selectAll(".myXaxis")._groups[0].length == 0) {
        lineGraphPressureSvg.append("g")
            .attr("transform", "translate(0," + svgLineGraphHeight + ")")
            .attr("class", "myXaxis")
    }

    let y = d3.scaleLinear().range([svgLineGraphHeight, 0]); 
    let yAxis = d3.axisLeft().scale(y)
        .ticks(4); 

    if (lineGraphPressureSvg.selectAll(".myYaxis")._groups[0].length == 0) {
        lineGraphPressureSvg.append("g")
            .attr("class", "myYaxis")

    }

    // Create the X axis:
    x.domain([d3.min(data_switch_to, function (d) { return d.time }), d3.max(data_switch_to, function (d) { return d.time })]);

    lineGraphPressureSvg.selectAll(".myXaxis")
        .style("font-family", "ZCOOL XiaoWei")
        .transition()
        .duration(500)
        .call(xAxis);

    // create the Y axis
    y.domain([d3.min(data_switch_to, function (d) { return d.sensorVal }) / 1.2, d3.max(data_switch_to, function (d) { return d.sensorVal })]); //y轴起始从0开始，x轴起始从min(x)开始
    lineGraphPressureSvg.selectAll(".myYaxis")
        .style("font-family", "ZCOOL XiaoWei")
        .transition()
        .duration(500)
        .call(yAxis);

    // Create a update selection: bind to the new data
    let u = lineGraphPressureSvg.selectAll(".lineTest")
        .data([data_switch_to]); 

    // Updata the line
    let pathLineChart = u
        .enter()
        .append("path")
        .attr("class", "lineTest")
        .merge(u)
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .x(function (d) { return x(d.time); })
            .y(function (d) { return y(d.sensorVal); })
        )
        .attr("fill", "none")
        .attr("stroke", "#9568f1")
        .attr("stroke-width", 2)

    let bisect = d3.bisector(function (d) { return d.time; }).left;

    // Create the circle that travels along the curve of chart
    let focus = lineGraphPressureSvg
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "#9568f1")
        .attr("stroke-width", "1.5")
        .attr('r', 8.5)
        .style("opacity", 0)

    // Create the text that travels along the curve of chart
    let focusText = lineGraphPressureSvg
        .append('g')
        .append('text')
        .style("font-family", "ZCOOL XiaoWei")
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
        focus.style("opacity", 0.6)
        focusText.style("opacity", 1)
    }


    let mousemove = function (event, d) {

        // recover coordinate we need
        let x0 = x.invert(event.pageX - document.getElementById("lineGraphPressureSvgRect").getBoundingClientRect().x);

        let i = Math.round(x0 / 2) 

        if (i >= data_switch_to.length)
            i = data_switch_to.length - 1
        selectedData = data_switch_to[i]
        focus
            .attr("cx", x(selectedData.time))
            .attr("cy", y(selectedData.sensorVal))
        if (i > data_switch_to.length / 2) {
            focusText
                .html("x:" + selectedData.time + "  -  " + "y:" + selectedData.sensorVal)
                .attr("x", x(selectedData.time) - 100)
                .attr("y", y(selectedData.sensorVal))
        } else {
            focusText
                .html("x:" + selectedData.time + "  -  " + "y:" + selectedData.sensorVal)
                .attr("x", x(selectedData.time) + 15)
                .attr("y", y(selectedData.sensorVal))
        }
    }

    function mouseout() {
        focus.style("opacity", 0)
        focusText.style("opacity", 0)
    }

    // Create a rect on top of the svg area: this rectangle recovers mouse position
    lineGraphPressureSvg
        .append('rect')
        .attr("id", "lineGraphPressureSvgRect")
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', svgLineGraphWidth + lineGraphMargin.left + lineGraphMargin.right)
        .attr('height', svgLineGraphHeight + lineGraphMargin.top + lineGraphMargin.bottom)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

}


function switchTempHumiLineGraphDataTo(data_switch_to) {
    // Initialise a X axis:
    let x = d3.scaleLinear().range([0, svgLineGraphWidth]); 
    let xAxis = d3.axisBottom().scale(x); 

    if (lineGraphTempHumiSvg.selectAll(".myXaxis")._groups[0].length == 0) {
        lineGraphTempHumiSvg.append("g")
            .attr("transform", "translate(0," + svgLineGraphHeight + ")")
            .attr("class", "myXaxis")
    }


    // Initialize an Y axis
    let y = d3.scaleLinear().range([svgLineGraphHeight, 0]);
    let yAxis = d3.axisLeft().scale(y)
        .ticks(4); 

    if (lineGraphTempHumiSvg.selectAll(".myYaxis")._groups[0].length == 0) {
        lineGraphTempHumiSvg.append("g")
            .attr("class", "myYaxis")

    }

    // Create the X axis:
    x.domain([d3.min(data_switch_to, function (d) { return d.time }), d3.max(data_switch_to, function (d) { return d.time })]);

    lineGraphTempHumiSvg.selectAll(".myXaxis")
        .style("font-family", "ZCOOL XiaoWei")
        .transition()
        .duration(500)
        .call(xAxis);

    // create the Y axis
    y.domain([d3.min(data_switch_to, function (d) { return d.sensorVal }) / 1.2, d3.max(data_switch_to, function (d) { return d.sensorVal })]); //y轴起始从0开始，x轴起始从min(x)开始
    lineGraphTempHumiSvg.selectAll(".myYaxis")
        .style("font-family", "ZCOOL XiaoWei")
        .transition()
        .duration(500)
        .call(yAxis);

    // Create a update selection: bind to the new data
    let u = lineGraphTempHumiSvg.selectAll(".lineTest")
        .data([data_switch_to]); 

    // Updata the line
    let pathLineChart = u
        .enter()
        .append("path")
        .attr("class", "lineTest")
        .merge(u)
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .x(function (d) { return x(d.time); })
            .y(function (d) { return y(d.sensorVal); })
        )
        .attr("fill", "none")
        .attr("stroke", "#db6161")
        .attr("stroke-width", 2)

    // This allows to find the closest X index of the mouse:
    let bisect = d3.bisector(function (d) { return d.time; }).left;

    // Create the circle that travels along the curve of chart
    let focus = lineGraphTempHumiSvg
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "#db6161")
        .attr("stroke-width", "1.5")
        .attr('r', 8.5)
        .style("opacity", 0)

    // Create the text that travels along the curve of chart
    let focusText = lineGraphTempHumiSvg
        .append('g')
        .append('text')
        .style("font-family", "ZCOOL XiaoWei")
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
        focus.style("opacity", 0.6)
        focusText.style("opacity", 1)
    }


    let mousemove = function (event, d) {

        // recover coordinate we need
        let x0 = x.invert(event.pageX - document.getElementById("lineGraphTempHumiSvgRect").getBoundingClientRect().x);

        let i = Math.round(x0 / 2)

        if (i >= data_switch_to.length)
            i = data_switch_to.length - 1
        selectedData = data_switch_to[i]
        focus
            .attr("cx", x(selectedData.time))
            .attr("cy", y(selectedData.sensorVal))
        if (i > data_switch_to.length / 2) {
            focusText
                .html("x:" + selectedData.time + "  -  " + "y:" + selectedData.sensorVal)
                .attr("x", x(selectedData.time) - 100)
                .attr("y", y(selectedData.sensorVal))
        } else {
            focusText
                .html("x:" + selectedData.time + "  -  " + "y:" + selectedData.sensorVal)
                .attr("x", x(selectedData.time) + 15)
                .attr("y", y(selectedData.sensorVal))
        }
    }

    function mouseout() {
        focus.style("opacity", 0)
        focusText.style("opacity", 0)
    }

    // Create a rect on top of the svg area: this rectangle recovers mouse position
    lineGraphTempHumiSvg
        .append('rect')
        .attr("id", "lineGraphTempHumiSvgRect")
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', svgLineGraphWidth + lineGraphMargin.left + lineGraphMargin.right)
        .attr('height', svgLineGraphHeight + lineGraphMargin.top + lineGraphMargin.bottom)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

}