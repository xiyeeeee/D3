const width = 900;
const height = 600;
let selectedYear = "2017"; // Default selected year
let selectedMonth = "January"; // Default selected month

const container = d3.select("#bubble-chart-container");

// Create a color scale with a custom range of colors
const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // You can use any other color scheme or custom colors

// Create a tooltip element
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

let labels = d3.select(null); // Define an empty selection

function handleMouseOver(d, value, valueScale, country) {
    d3.select(this).attr("r", d => valueScale(d[value]) + 5);
    tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
    tooltip.html(`<strong>${d[country]}</strong><br>Visitors: ${d[value]}`)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 30) + "px");
}

function handleMouseOut(d, value, valueScale) {
    d3.select(this).attr("r", d => valueScale(d[value]));
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
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
        data = data.filter(d => d.Citizenship !== "Malaysia" && d.Citizenship !== "Total Domestic" && d.Citizenship !== "Total Foreigner" && d.Citizenship !== "Grand Total (Foreigner + Domestic)");

        const country = "Citizenship";
        const value = month;

        const maxVisitor = d3.max(data, d => parseFloat(d[value]));
        const minVisitor = d3.min(data, d => parseFloat(d[value]));

        // Modify the valueScale to increase the bubble size
        const valueScale = d3.scaleSqrt()
        .domain([minVisitor, maxVisitor])
        .range([10, 100]); // Adjust the range to make the bubbles larger


        // Create a scale for bubble color gradient from light blue to dark blue
        const colorScale = d3.scaleLinear()
            .domain([minVisitor, maxVisitor])
            .range(["lightblue", "darkblue"]);

        container.selectAll("svg").remove();

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        const simulation = d3.forceSimulation(data)
            .force("x", d3.forceX().strength(0.1).x(width / 2)) // Center horizontally
            .force("y", d3.forceY().strength(0.1).y(height / 2)) // Center vertically
            .force("collide", d3.forceCollide().radius(d => valueScale(d[value]) + 2).strength(0.8)) // Non-overlapping

        const bubbles = svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", d => valueScale(d[value])) // Set the radius based on data value
            .style("fill", d => colorScale(d[value])) // Color based on the number of visitors
            .style("stroke", "black")
            .style("stroke-width", 2); // Adjust the border width

        bubbles
            .on("mouseover", function (d) {
                handleMouseOver(d, value, valueScale, country);
            })
            .on("mouseout", function (d) {
                handleMouseOut(d, value, valueScale);
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
    if (month === "Grand Total") {
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
