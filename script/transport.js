// Define the width and height of the SVG container
const width = 800, height = 700;

// Select the HTML element with id "container" and append an SVG element to it with the specified width and height
const svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Initialize the selectedYear with "2017" and define a color scale for data categories
let selectedYear = "2017";
var colors = d3.scaleOrdinal(d3.schemeCategory10);

// Load data from a CSV file ("Transport.csv") using D3's csv method
d3.csv("./dataset/Transport.csv", (res) => {
    // Call the updateChart function to initially display the chart with data for the selected year
    updateChart(res.filter(d => d.year == selectedYear));

    // Define an array of transportation modes
    let mode = ["Air", "Land", "Sea"];

    // Append rectangles to represent the modes with different colors
    svg.append("g")
        .attr("transform", `translate(10,80)`)
        .selectAll("rect")
        .data(mode)
        .enter()
        .append("rect")
        .attr("width", 16)
        .attr("height", 16)
        .attr("y", (d, i) => i * 20)
        .attr("fill", (d, i) => colors(i));

    // Append text labels for the transportation modes
    svg.append("g")
        .attr("font-size", 16)
        .attr("transform", `translate(30,80)`)
        .selectAll("text")
        .data(mode)
        .enter()
        .append("text")
        .attr("y", (d, i) => i * 20 + 8)
        .attr("dy", ".3em")
        .text(d => d);

    // Add event listeners to buttons with class "yearly-buttons"
    d3.select(".yearly-buttons")
        .selectAll("button")
        .on("click", (e) => {
            // Update the selectedYear when a button is clicked
            selectedYear = d3.event.target.innerText;

            // Remove the "button_active" class from all buttons and add it to the clicked button
            d3.select("#menu")
                .selectAll("button")
                .attr("class", "");
            d3.event.target.className = "button_active";

            // Call the updateChart function with filtered data for the selected year
            updateChart(res.filter(d => d.year == selectedYear));
        });
});

// Function to update the chart based on the selected year's data
function updateChart(data) {
    // Remove any existing pie charts in the SVG
    svg.selectAll(".pie").remove();

    // Append a group for the pie chart and add title and total text
  
svg.append("g")
.attr("class", "pie")
.attr("transform", `translate(10,30)`)
.call(g => {
    g.append("text")
        .text(`Arrivals by Mode of Transport into Sarawak (${selectedYear})`)
        .attr("font-size", "32px") // Set the font size to make it larger
        .attr("fill", "#3A465C"); // Set the fill (color) to dark blue-grey
    g.append("text")
        .attr("y", 22)
        .text(`Grand Total: (${d3.sum(data, d => +d.value)})`);
});

    // Generate pie chart data using D3's pie function
    let pieData = d3.pie()
        .value(d => d.value)
        .sort(null)(data);

    // Define the arc generator for the pie chart
    let arc = d3.arc()
        .innerRadius(0)
        .outerRadius(150);

    // Append paths to create the pie chart slices
    svg.append("g")
        .attr("class", "pie")
        .attr("transform", `translate(${width / 2}, ${height / 2})`)
        .selectAll("path")
        .data(pieData)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", function (d, i) {
            return colors(i);
        });

    // Update the arc generator for the inner labels
    arc.innerRadius(80)
        .outerRadius(80);

    // Append text labels inside the pie chart slices
    svg.append("g")
        .attr("text-anchor", "middle")
        .attr("font-size", 16)
        .attr("fill", "black")
        .attr("class", "pie")
        .attr("transform", `translate(${width / 2}, ${height / 2})`)
        .selectAll("text")
        .data(pieData)
        .enter()
        .append("text")
        .attr("x", d => arc.centroid(d)[0])
        .attr("y", d => arc.centroid(d)[1])
        .text(d => d.value);
}
