// Set the width and height for the SVG container
const width = 1000;
const height = 800;

// Define margins for the chart
const margin = {
    left: 250,
    right: 20,
    top: 100,
    bottom: 50
}

// Define an array of years
let years = ["2017", "2018", "2019", "2020", "2021"];

// Define colors using D3's ordinal scale with the color scheme
const colors = d3.scaleOrdinal()
    .domain(["Foreign", "Domestic", "Total"])
    .range(d3.schemeCategory10);

// Load data from the "arrivals.csv" file
d3.csv("./dataset/arrivals.csv").then((res) => {
    // Create an SVG element in the container
    const svg = d3.select("#container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create color legend using rectangles
    svg.append("g")
    .attr("transform", `translate(${margin.left - 200}, 80)`)  // Move the legend to the left
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
    .attr("font-size", 16)
    .attr("transform", `translate(${margin.left - 175}, 80)`)  // Move the text labels to the left
    .selectAll("text")
    .data(colors.domain())
    .enter()
    .append("text")
    .attr("y", (d, i) => i * 30 + 10)
    .attr("dy", ".3em")
    .attr("font-size", 16)
    .text((d, i) => d);


    // Create x-axis scale using the years
    const x = d3.scaleBand()
        .domain(years)
        .range([margin.left, width - margin.right])
        .padding(0.2);

    // Add x-axis to the chart
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("font-size", 14); 

    // Create y-axis scale based on data values
    const y = d3.scaleLinear()
        .domain([0, d3.max(res, d => +d.value)])
        .range([height - margin.bottom, margin.top])
        .nice();

    // Create a sub-scale for grouping bars within a year
    const dx = d3.scaleBand()
        .domain(["Foreign", "Domestic", "Total"])
        .range([0, x.bandwidth()])
        .padding(0.1);

    // Add y-axis to the chart
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0))
    .selectAll("text")
    .attr("font-size", 14); 

    // Create bars for each data point
    svg.append("g")
    .selectAll("g")
    .data(res)
    .enter()
    .append("rect")
    .attr("x", d => x(d.year) + dx(d.name))
    .attr("y", height - margin.bottom)  // Start from the bottom
    .attr("width", dx.bandwidth())
    .attr("height", 0)  // Start with zero height
    .attr("fill", d => colors(d.name))
    .style("cursor", "pointer")
    .on("mousemove", (event, d) => {
        // Show a tooltip on mouseover
        const e = event;
        d3.select("#tooltip")
            .style("display", "block")
            .style("left", e.pageX + 15 + "px")
            .style("top", e.layerY + 15 + "px")
            .html(`
                Year: ${d.year}
                <br />
                Arrivals: ${d.name}
                <br />
                Visitors: ${d.value}
            `)
    })
    .on("mouseleave", (event, d) => {
        // Hide the tooltip on mouseleave
        const e = event;
        d3.select("#tooltip")
            .style("display", "none");
    })
    .transition()
    .delay((d, i) => i * 100)  // Add a delay based on the index
    .duration(500)  // Set the duration of the transition (in milliseconds)
    .attr("y", d => y(d.value))  // Transition to the actual y position
    .attr("height", d => height - margin.bottom - y(d.value));  // Transition to the actual height

    // Call the stackedBar function to create a stacked bar chart
    stackedBar(res);
});

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
    const x = d3.scaleBand()
        .domain(years)
        .range([margin.left, width - margin.right])
        .padding(0.4);
       

    // Add x-axis to the chart
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("font-size", 16); 

    // Group data by year
    const o = {};
    res.forEach(d => {
        o[d.year] = o[d.year] || [];
        o[d.year].push(d)
    })

    // Calculate cumulative values for stacked bars
    const data = Object.entries(o);
    data.forEach(([year, arr]) => {
        let sum = 0;
        arr.forEach(d => {
            d.v0 = sum;
            sum += +d.value;
            d.v1 = sum;
        })
    })

    // Create y-axis scale based on the stacked values
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.sum(d[1], v => +v.value))])
        .range([height - margin.bottom, margin.top])
        .nice();

    // Add y-axis to the chart
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .selectAll("text")
        .attr("font-size", 16);
  
    // Create stacked bars for each year with transition
    svg.append("g")
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${x(d[0])}, 0)`)
    .each(function (arr) {
        const g = d3.select(this);

        // Create a transition for the entire group
        g.transition()
            .duration(1000)  // Set the duration of the transition (in milliseconds)
            .attr("transform", d => `translate(${x(d[0])}, 0)`);

        // Create stacked bars within the group with delay in transition
        g.selectAll("rect")
            .data(arr[1])
            .enter()
            .append("rect")
            .attr("y", d => y(d.v1))
            .attr("width", x.bandwidth())
            .attr("height", 0)  // Start with zero height
            .attr("fill", d => colors(d.name))
            .style("cursor", "pointer")
            .on("mousemove", (event, d) => {
                // Show a tooltip on mouseover
                const e = event;
                d3.select("#tooltip")
                    .style("display", "block")
                    .style("left", e.pageX + 15 + "px")
                    .style("top", e.layerY + 15 + "px")
                    .html(`
                        Year: ${d.year}
                        <br />
                        Arrivals: ${d.name}
                        <br />
                        Visitors: ${d.value}
                    `);
            })
            .on("mouseleave", (event, d) => {
                // Hide the tooltip on mouseleave
                const e = event;
                d3.select("#tooltip")
                    .style("display", "none");
            })
            .transition()
            .delay((d, i) => i * 100)  // Add a delay based on the index
            .duration(500)  // Set the duration of the transition (in milliseconds)
            .attr("height", d => y(d.v0) - y(d.v1));  // Transition to the actual height
    });
}
