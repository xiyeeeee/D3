// Set the width and height for the SVG container
const width = 1000;
const height = 600;

// Define margins for the chart
const margin = {
    left: 150,
    right: 20,
    top: 100,
    bottom: 20
}

// Define an array of years
let years = ["2017", "2018", "2019", "2020", "2021"];

// Define colors using D3's ordinal scale with the color scheme
let colors = d3.scaleOrdinal()
    .domain(["Foreign", "Domestic", "Total"])
    .range(d3.schemeCategory10);

// Load data from the "arrivals.csv" file
d3.csv("./dataset/arrivals.csv", (res) => {
    // Create an SVG element in the container
    const svg = d3.select("#container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create color legend using rectangles
    svg.append("g")
        .attr("transform", `translate(0,80)`)
        .selectAll("rect")
        .data(colors.domain())
        .enter()
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("y", (d, i) => i * 30)
        .attr("fill", (d, i) => colors(d));

    // Create text labels for the color legend
    svg.append("g")
        .attr("font-size", 12)
        .attr("transform", `translate(25,80)`)
        .selectAll("text")
        .data(colors.domain())
        .enter()
        .append("text")
        .attr("y", (d, i) => i * 30 + 10)
        .attr("dy", ".3em")
        .text((d, i) => d);

    // Create x-axis scale using the years
    let x = d3.scaleBand()
        .domain(years)
        .range([margin.left, width - margin.right])
        .padding(0.2);

    // Add x-axis to the chart
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    // Create y-axis scale based on data values
    let y = d3.scaleLinear()
        .domain([0, d3.max(res, d => +d.value)])
        .range([height - margin.bottom, margin.top])
        .nice();

    // Create a sub-scale for grouping bars within a year
    let dx = d3.scaleBand()
        .domain(["Foreign", "Domestic", "Total"])
        .range([0, x.bandwidth()])
        .padding(0.1);

    // Add y-axis to the chart
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y));

    // Create bars for each data point
    svg.append("g")
        .selectAll("g")
        .data(res)
        .enter()
        .append("rect")
        .attr("x", d => x(d.year) + dx(d.name))
        .attr("y", d => y(d.value))
        .attr("width", dx.bandwidth())
        .attr("height", d => y(0) - y(d.value))
        .attr("fill", d => colors(d.name))
        .style("cursor", "pointer")
        .on("mousemove", (d,) => {
            // Show a tooltip on mouseover
            let e = d3.event;
            d3.select("#tooltip")
                .style("display", "block")
                .style("left", e.pageX + 15 + "px")
                .style("top", e.layerY + 15 + "px")
                .html(`
                    year: ${d.year}
                    <br />
                    arrivals: ${d.name}
                    <br />
                    value: ${d.value}
                `)
        })
        .on("mouseleave", (d,) => {
            // Hide the tooltip on mouseleave
            let e = d3.event;
            d3.select("#tooltip")
                .style("display", "none");
        })

    // Call the stackedBar function to create a stacked bar chart
    stackedBar(res);
})

// Function to create a stacked bar chart
function stackedBar(res) {
    // Create an SVG element in the second container
    const svg = d3.select("#container1")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create color legend using rectangles
    svg.append("g")
        .attr("transform", `translate(0,80)`)
        .selectAll("rect")
        .data(colors.domain())
        .enter()
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("y", (d, i) => i * 30)
        .attr("fill", (d, i) => colors(d));

    // Create text labels for the color legend
    svg.append("g")
        .attr("font-size", 12)
        .attr("transform", `translate(25,80)`)
        .selectAll("text")
        .data(colors.domain())
        .enter()
        .append("text")
        .attr("y", (d, i) => i * 30 + 10)
        .attr("dy", ".3em")
        .text((d, i) => d);

    // Create x-axis scale using the years
    let x = d3.scaleBand()
        .domain(years)
        .range([margin.left, width - margin.right])
        .padding(0.4);

    // Add x-axis to the chart
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    // Group data by year
    let o = {};
    res.forEach(d => {
        o[d.year] = o[d.year] || [];
        o[d.year].push(d)
    })

    // Calculate cumulative values for stacked bars
    let data = Object.entries(o);
    data.forEach(([year, arr]) => {
        let sum = 0;
        arr.forEach(d => {
            d.v0 = sum;
            sum += +d.value;
            d.v1 = sum;
        })
    })

    // Create y-axis scale based on the stacked values
    let y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.sum(d[1], v => +v.value))])
        .range([height - margin.bottom, margin.top])
        .nice();

    // Add y-axis to the chart
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y));

    // Create stacked bars for each year
    svg.append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d[0])}, 0)`)
        .each(function (arr) {
            let g = d3.select(this);
            g.selectAll("rect")
                .data(arr[1])
                .enter()
                .append("rect")
                .attr("y", d => y(d.v1))
                .attr("width", x.bandwidth())
                .attr("height", d => y(d.v0) - y(d.v1))
                .attr("fill", d => colors(d.name))
                .style("cursor", "pointer")
                .on("mousemove", (d,) => {
                    // Show a tooltip on mouseover
                    let e = d3.event;
                    d3.select("#tooltip")
                        .style("display", "block")
                        .style("left", e.pageX + 15 + "px")
                        .style("top", e.layerY + 15 + "px")
                        .html(`
                    year: ${d.year}
                    <br />
                    arrivals: ${d.name}
                    <br />
                    value: ${d.value}
                `)
                })
                .on("mouseleave", (d,) => {
                    // Hide the tooltip on mouseleave
                    let e = d3.event;
                    d3.select("#tooltip")
                        .style("display", "none");
                })
        })
}
