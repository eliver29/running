document.addEventListener("DOMContentLoaded", function () {
    const chartConfigs = {
        "genderChart": ["/gender_distribution", "pie", "Gender Distribution", ["#fc4293", "#36A2EB"]],
        "topStatesChart": ["/top10_states", "bar", "Top 10 States", "#FF6384"],
        "ageChart": ["/age_distribution", "line", "Age Distribution", "#36A2EB"],
        "autoChart": ["/top10_autos", "bar", "Top 10 Auto Registrations", "#FF9F40"],
        "busesTrucksChart": ["/total_buses_trucks_2010_2020", "doughnut", "Buses vs Trucks", ["#FFCD56", "#4BC0C0"]],
        "motorcycleChart": ["/top10_motorcycles_2020", "bar", "Top 10 Motorcycle Registrations", "#9966FF"],
        "subAgenciesChart": ["/top5_sub_agencies", "bar", "Top 5 Sub Agencies", "#FF6384"],
        "violationsChart": ["/top10_violations", "bar", "Top 10 Violations", "#4BC0C0", "horizontal"],
        "vehicleTypesChart": ["/top5_vehicle_types", "doughnut", "Top 5 Vehicle Types", 
            ["#FF6384", "#36A2EB", "#FFCD56", "#4BC0C0", "#9966FF"]]
    };

    function loadChart(chartId, url, type, label, colors, orientation) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log(`Data from ${url}:`, data); // Debugging
    
                // Ensure we use the correct field names
                let values = data.total_counts || data.values; // Use total_counts if available
    
                if (!data.labels || !values) {
                    console.error(`Invalid data format from ${url}`, data);
                    return;
                }
    
                new Chart(document.getElementById(chartId), {
                    type: type,
                    data: {
                        labels: data.labels,
                        datasets: [{
                            label: label,
                            data: values,
                            backgroundColor: colors
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: orientation === "horizontal" ? 'y' : 'x',
                        scales: {
                            x: { beginAtZero: true },
                            y: { beginAtZero: true }
                        }
                    }
                });
            })
            .catch(error => console.error("Error loading chart data:", error));
    }
    

    for (const chartId in chartConfigs) {
        let [url, type, label, colors, orientation] = chartConfigs[chartId];
        loadChart(chartId, url, type, label, colors, orientation);
    }

    // Filter Charts
    const chartFilter = document.getElementById("chart-filter");
    if (chartFilter) {
        chartFilter.addEventListener("change", function () {
            let filter = this.value;
            let charts = document.querySelectorAll(".charts");

            if (filter === "hide-all") {
                charts.forEach(chart => chart.style.display = "none");
            } else if (filter === "show-all") {
                charts.forEach(chart => chart.style.display = "block");
            } else {
                charts.forEach(chart => {
                    chart.style.display = chart.querySelector("canvas").id === filter ? "block" : "none";
                });
            }
        });
    }

    // Open Chart Modal
    function openChartModal(chartId, title, description) {
        document.getElementById('chartModalTitle').innerText = title;
        document.getElementById('chartModalDescription').innerText = description;

        // Destroy previous modal chart if it exists
        if (window.currentChart instanceof Chart) {
            window.currentChart.destroy();
        }

        const ctx = document.getElementById('modalChart').getContext('2d');
        const sourceChart = Chart.getChart(chartId);

        if (sourceChart) {
            window.currentChart = new Chart(ctx, {
                type: sourceChart.config.type,
                data: JSON.parse(JSON.stringify(sourceChart.config.data)),
                options: sourceChart.config.options
            });
        }

        new bootstrap.Modal(document.getElementById('chartModal')).show();
    }

    // Attach click event to all charts
    document.querySelectorAll(".charts canvas").forEach(chartCanvas => {
        chartCanvas.addEventListener("click", function () {
            const chartId = this.id;
            openChartModal(chartId, "Chart Details", "Detailed chart analysis.");
        });
    });

    // Reset Page (Scroll to Top)
    function resetPage() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Scroll to Specific Section
    function scrollToSection(sectionId) {
        document.getElementById(sectionId).scrollIntoView({ behavior: "smooth" });
    }

    // Expand Chart in Place
    const charts = document.querySelectorAll(".charts");
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);

    charts.forEach(chart => {
        chart.addEventListener("click", function () {
            // Remove 'active' class from any other open charts
            document.querySelectorAll(".charts.active").forEach(activeChart => {
                activeChart.classList.remove("active");
            });

            // Add active class to clicked chart
            this.classList.add("active");
            overlay.style.display = "block";

            // Remove any existing close buttons
            this.querySelectorAll(".close-chart").forEach(btn => btn.remove());

            // Add close button dynamically
            let closeButton = document.createElement("button");
            closeButton.classList.add("close-chart");
            closeButton.innerText = "X";
            closeButton.addEventListener("click", function () {
                chart.classList.remove("active");
                overlay.style.display = "none";
                closeButton.remove();
            });
            this.appendChild(closeButton);
        });
    });

    // Close chart if clicking outside of it
    overlay.addEventListener("click", function () {
        document.querySelectorAll(".charts.active").forEach(activeChart => {
            activeChart.classList.remove("active");
        });
        overlay.style.display = "none";
    });

    // Ensure modal chart is destroyed when modal closes
    document.getElementById('chartModal').addEventListener('hidden.bs.modal', function () {
        if (window.currentChart) {
            window.currentChart.destroy();
            window.currentChart = null;
        }
    });

    // Responsive Chart Containers (Auto Resize on Zoom)
    function updateChartContainerSize() {
        const charts = document.querySelectorAll(".charts");
        charts.forEach(chart => {
            if (window.innerWidth < 1024) {
                chart.style.width = "80%";
            } else {
                chart.style.width = "30%";
            }
        });
    }

    window.addEventListener("resize", updateChartContainerSize);
    updateChartContainerSize();

    // Navigation Scroll Behavior
    document.querySelectorAll("nav ul li a").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 50,
                    behavior: "smooth"
                });
            }
        });
    });

    // Modal Close Enhancements (ESC Key)
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            document.getElementById('chartModal').style.display = "none";
            overlay.style.display = "none";
            if (window.currentChart) {
                window.currentChart.destroy();
                window.currentChart = null;
            }
        }
    });

});
