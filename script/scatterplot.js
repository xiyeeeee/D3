// Define tooltip globally
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Function to update scatterplot based on user input
function updateScatterplot() {
    // Get selected country and year
    var selectedCountry = document.getElementById("country").value;
    var selectedYear = document.getElementById("year").value;

    // Load CSV data based on selected year
    var dataPath = 'dataset/Sarawak_Visitor_Arrivals_' + selectedYear + '.csv';

    d3.csv(dataPath).then(function(data) {
        // Filter data for the selected country
        var countryData = data.filter(function(d) {
            return d.Citizenship === selectedCountry;
        })[0];

        // Extract monthly visitor data
        var months = Object.keys(countryData).slice(1, 13);
        var visitorCounts = months.map(function(month) {
            return +countryData[month];
        });

        // Create or update scatterplot with callback
        createScatterplot(months, visitorCounts);
    });
}

// Function to create scatterplot
function createScatterplot(xValues, yValues) {
    // Clear previous scatterplot
    d3.select("#scatterplot").selectAll("*").remove();

    // Set up SVG container
    var width = 950;
    var height = 700;

    // Adjust margins
    var margin = { top: 20, right: 20, bottom: 50, left: 80 }; // Increase left margin

    var svg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create scales for x and y axes
    var xScale = d3.scaleBand()
        .domain(xValues)
        .range([50, width - 50])
        .padding(0.1);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(yValues)])
        .range([height - 50, 50]);

    // Create circles for each data point with tooltips
    svg.selectAll("circle")
    .data(yValues)
    .enter().append("circle")
    .attr("cx", function(d, i) { return xScale(xValues[i]) + xScale.bandwidth() / 2; })
    .attr("cy", height - 50)  // Start from the x-axis
    .attr("r", 14)  // Set the radius for original circles
    .style("cursor", "pointer")
    .on("mouseover", function (event, d, i) {
        // Show a tooltip on mouseover
        let tooltipX = event.pageX + 15;
        let tooltipY = event.pageY + 15;

        d3.pointer(event);
        d3.select("#tooltip")
            .style("display", "block")
            .style("left", tooltipX + "px")
            .style("top", tooltipY + "px")
            .html(`
                Visitors: ${d}
            `);
    })
    .on("mouseleave", function () {
        // Hide the tooltip on mouseleave
        d3.select("#tooltip").style("display", "none");
    })
    .transition()  // Apply the transition
    .duration(2000)  // Set the duration of the transition
    .attr("cy", function(d) { return yScale(d); });  // Move to the original y position on the chart

    // Add axes
    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);

    // Render x-axis with adjusted font size for tick labels
    svg.append("g")
        .attr("transform", "translate(0," + (height - 50) + ")")
        .call(xAxis)
        .selectAll("text")  // This targets the tick labels
        .attr("font-size", 13);  // Adjust the font size here

    // Render y-axis with adjusted font size for tick labels
    svg.append("g")
        .attr("transform", "translate(50,0)")
        .call(yAxis)
        .selectAll("text")  // This targets the tick labels
        .attr("font-size", 13);  // Adjust the font size here

    // Add axis labels
    svg.append("text")
    .attr("font-size", 16)
    .attr("font-weight", "bold")  // Add this line to make the text bold
    .attr("x", width / 2)
    .attr("y", height - 10) // Adjust the position based on your preference
    .attr("dy", "0.71em")
    .attr("fill", "#000")
    .text("Month");

    svg.append("text")
    .attr("font-size", 16)
    .attr("font-weight", "bold")  // Add this line to make the text bold
    .attr("transform", "rotate(-90)")
    .attr("y", -40) // Adjust the position based on your preference
    .attr("x", -height / 2)
    .attr("dy", "0.71em")
    .attr("fill", "#000")
    .text("Number of Visitors");
}

// Initial scatterplot with default values
updateScatterplot();
