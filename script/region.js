// Set the width and height for the SVG container
const width = 1100;
const height = 600;

// Initialize the default chart type
let type = "Line Chart";

// Select the HTML element with the id "container" and append an SVG element to it
const svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Initialize the selected year and define colors for the chart
let selectedYear = "2017";
const colors = d3.scaleOrdinal(d3.schemeCategory10);

// Initialize the sort variable for data sorting
let sort = -1;

// Load the data from a CSV file named "Region.csv"
d3.csv("./dataset/Region.csv").then((res) => {
    // Call the updateChart function with data filtered by the selected year
    updateChart(res.filter(d => d.year == selectedYear));

    // Set the domain of colors based on the region names
    colors.domain(res.map(d => d.name));

    // Create color legend using rectangles and text
    svg.append("g")
        .attr("transform", `translate(0,20)`)
        .selectAll("rect")
        .data(colors.domain())
        .enter()
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("y", (d, i) => i * 30)
        .attr("fill", (d, i) => colors(d));

    svg.append("g")
        .attr("font-size", 12)
        .attr("transform", `translate(25,20)`)
        .selectAll("text")
        .data(colors.domain())
        .enter()
        .append("text")
        .attr("y", (d, i) => i * 30 + 10)
        .attr("dy", ".3em")
        .text((d, i) => d);

    // Handle click events on yearly buttons
    d3.select(".yearly-buttons")
        .selectAll("button")
        .on("click", (event, i) => {
            selectedYear = event.target.innerText;
            d3.select(".yearly-buttons")
                .selectAll("button")
                .classed("active", false);
            event.target.classList.add("active");
            updateChart(res.filter(d => d.year == selectedYear));
        });

    // Handle click events on chart type buttons
    d3.select(".chart-buttons")
        .selectAll("button")
        .on("click", (event, i) => {
            type = event.target.innerText;
            updateChart(res.filter(d => d.year == selectedYear));
        });

    // Handle click events on the sort button
    d3.select("#sort-btn")
        .on("click", () => {
            // Sort the data based on the value and update the chart
            let data = res.filter(d => d.year == selectedYear);
            data.sort((a, b) => (+a.value) > (+b.value) ? sort : -sort);
            sort = -sort;
            updateChart(data);
        });
});

// Function to update the chart based on the selected data and type
function updateChart(data) {
    // Remove existing content within the SVG container
    svg.select("#content").remove();

    // Set the chart titles and data caption
    d3.select("#chart-titles")
        .text(`Region Arrivals (${selectedYear})`);
    d3.select("#data-caption")
        .text(`Grand Total: (${d3.sum(data, d => +d.value)})`);

    // Determine the chart type and call the appropriate function
    if (type == "Bar Chart") {
        bar(data);
    } else {
        line(data);
    }
}

// Function to create a line chart
function line(data) {
    const g = svg.append("g")
        .attr("id", "content");

    // Create x-axis scale
    let x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([220, width - 50]);

    g.append("g")
        .attr("transform", `translate(0, ${height - 50})`)
        .call(d3.axisBottom(x))
        .selectAll("text") // Select all the text elements in the x-axis
        .style("font-size", "12px") // Set the font size to 16px
        .style("font-weight", "bold"); // Set the font weight to bold

    // Create y-axis scale
    let y = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.value)])
        .range([height - 50, 50])
        .nice();

    g.append("g")
        .attr("transform", `translate(220, 0)`)
        .call(d3.axisLeft(y))
        .selectAll("text") // Select all the text elements in the y-axis
        .style("font-size", "14px") // Set the font size to 16px
        .style("font-weight", "bold"); // Set the font weight to bold

    // Create the line using the specified data
    let lineGenerator = d3.line()
        .x(d => x(d.name) + x.bandwidth() / 2)
        .y(d => y(d.value));

    g.append("path")
        .attr("d", lineGenerator(data))
        .attr("fill", "none")
        .attr("stroke", "#000");

    // Add circles to the line chart for each data point
    g.append("g")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.name) + x.bandwidth() / 2)
        .attr("cy", d => y(d.value))
        .attr("r", 6)
        .attr("fill", (d, i) => colors(d.name))
        .style("cursor", "pointer")
        .on("mousemove", (event, d) => {
            // Show a tooltip on mouseover
            let e = d3.pointer(event);
            d3.select("#tooltip")
                .style("display", "block")
                .style("left", e[0] + 15 + "px")
                .style("top", e[1] + 15 + "px")
                .html(`
                    year: ${d.year}
                    <br />
                    region: ${d.name}
                    <br />
                    value: ${d.value}
                `);
        })
        .on("mouseleave", (event, d) => {
            // Hide the tooltip on mouseleave
            d3.select("#tooltip")
                .style("display", "none");
        });
}

// Function to create a bar chart
function bar(data) {
    const g = svg.append("g")
        .attr("id", "content");

    // Create x-axis scale with padding
    let x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([200, width - 50])
        .padding(0.3);

    g.append("g")
        .attr("transform", `translate(0, ${height - 50})`)
        .call(d3.axisBottom(x));

    // Create y-axis scale
    let y = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.value)])
        .range([height - 50, 50])
        .nice();

    g.append("g")
        .attr("transform", `translate(220, 0)`)
        .call(d3.axisLeft(y));

    // Create rectangles for the bar chart
    g.append("g")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.name))
        .attr("y", y(0))
        .attr("width", x.bandwidth())
        .style("cursor", "pointer")
        .on("mousemove", (event, d) => {
            // Show a tooltip on mouseover
            let e = d3.pointer(event);
            d3.select("#tooltip")
                .style("display", "block")
                .style("left", e[0] + 15 + "px")
                .style("top", e[1] + 15 + "px")
                .html(`
                    year: ${d.year}
                    <br />
                    region: ${d.name}
                    <br />
                    value: ${d.value}
                `);
        })
        .on("mouseleave", (event, d) => {
            // Hide the tooltip on mouseleave
            d3.select("#tooltip")
                .style("display", "none");
        })
        .transition()
        .attr("height", d => y(0) - y(d.value))
        .attr("y", d => y(d.value))
        .attr("fill", (d, i) => colors(d.name));
}