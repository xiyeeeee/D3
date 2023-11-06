const width = 900;
const height = 600;
let selectedYear = "2017"; // Default selected year
let selectedMonth = "January"; // Default selected month

const container = d3.select("#bubble-chart-container");



// Add a class to the sidebar for selection
const sidebar = d3.select(".bubble-sidebar");
const countryNameElement = document.getElementById("country-name");
const visitorsCountElement = document.getElementById("visitors-count");

function handleMouseOver(d, value, valueScale, country) {
    d3.select(this).attr("r", d => valueScale(d[value]) + 5);

    // Update the sidebar's content
    countryNameElement.innerHTML = `Country: ${d[country]}`;
    visitorsCountElement.innerHTML = `Visitors: ${d[value]}`;

    // Show the sidebar
    sidebar.style("display", "block");
}

function handleMouseOut() {
    // Hide the sidebar when the mouse pointer leaves the bubble
    sidebar.style("display", "none");
}

function updateCaption(year, month) {
    const caption = document.getElementById("data-caption");
    caption.textContent = `Viewing data for ${year}, ${month}`;
}

function createBubbleChart(year, month) {
    const csvFile = `dataset/Sarawak_Visitor_Arrivals_${year}.csv`;

    d3.csv(csvFile).then(data => {
        data = data.slice(1);

        // Exclude entries with "Malaysia" in the "Citizenship" column
        data = data.filter(d => d.Citizenship.trim() !== "Malaysia" && d.Citizenship.trim() !== "Total Domestic" && d.Citizenship.trim() !== "Total Foreigner" && d.Citizenship.trim() !== "Grand Total (Foreigner + Domestic)");

        const country = "Citizenship";
        const value = month.trim(); // Trim leading and trailing spaces

        const maxVisitor = d3.max(data, d => parseFloat(d[value]));
        const minVisitor = d3.min(data, d => parseFloat(d[value]));

        // Modify the valueScale to increase the bubble size
        const valueScale = d3.scaleSqrt()
            .domain([minVisitor, maxVisitor])
            .range([10, 120]); // Adjust the range to make the bubbles larger

        // Create a color scale with a custom range of colors
        const colorScale = d3.scaleSequential(d => {
            // Adjust this formula to map data values to colors
            const blueValue = d3.scaleLinear().domain([minVisitor, maxVisitor]).range([0, 1])(d);
            return d3.interpolateHcl("lightblue", "darkblue")(blueValue);
        });

        container.selectAll("svg").remove();

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        const simulation = d3.forceSimulation(data)
            .force("x", d3.forceX().strength(0.1).x(width / 2)) // Center horizontally
            .force("y", d3.forceY().strength(0.1).y(height / 2)) // Center vertically
            .force("collide", d3.forceCollide().radius(d => valueScale(d[value]) + 2).strength(0.8)); // Non-overlapping

        const bubbles = svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "bubble") // Add a class for selection
            .attr("r", d => valueScale(d[value])) // Set the radius based on data value
            .style("fill", d => colorScale(d[value])) // Color based on the number of visitors
            .style("stroke", "black")
            .style("stroke-width", 5) // Adjust the border width

        // Add hover effect to change the border color and display data
        bubbles
            .on("mouseover", function (d) {
                d3.select(this).style("stroke", "yellow"); // Change border color to yellow on hover
                handleMouseOver(d, value, valueScale, country);
            })
            .on("mouseout", function (d) {
                d3.select(this).style("stroke", "black"); // Reset border color on mouseout
                handleMouseOut();
            });

        // Add click event to display more details (you can customize this)
        // Add click event to display more details (modify as needed)
        bubbles.on("click", function (d) {
            // Update the tooltip with additional information
            const tooltipContent = `<strong>${d.Citizenship}</strong><br>Visitors: ${d[selectedMonth]}<br>Additional Info: Your content here`;
            document.getElementById("country-details").innerHTML = tooltipContent;
        });

        simulation.on("tick", () => {
            bubbles
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });
    });

    updateCaption(year, month);
}

function loadYear(year) {
    selectedYear = year;
    createBubbleChart(selectedYear, selectedMonth);

    document.querySelectorAll(".yearly-buttons button").forEach(button => {
        button.classList.remove("active");
    });

    document.getElementById(`year-${year}`).classList.add("active");
}

function loadMonth(month) {
    selectedMonth = month;
    createBubbleChart(selectedYear, selectedMonth);

    // Remove "active" class from all monthly and Grand Total buttons
    document.querySelectorAll(".monthly-buttons button").forEach(button => {
        button.classList.remove("active");
    });

    // Add "active" class to the clicked month or Grand Total button
    if (month.trim() === "Grand Total") {
        document.getElementById("month-GrandTotal").classList.add("active");
    } else {
        document.getElementById(`month-${month}`).classList.add("active");
    }
}

document.querySelectorAll(".yearly-buttons button").forEach(button => {
    button.addEventListener("click", function () {
        loadYear(this.getAttribute("data-year"));
    });
});

document.querySelectorAll(".monthly-buttons button").forEach(button => {
    button.addEventListener("click", function () {
        loadMonth(this.getAttribute("data-month"));
    });
});

createBubbleChart(selectedYear, selectedMonth);
