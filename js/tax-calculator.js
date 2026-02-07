// Sliding nav underline — moves to hovered link
(function () {
    var navUnderline = document.getElementById('nav-link-underline');
    if (!navUnderline) return;
    var container = navUnderline.closest('.nav-links');
    if (!container) return;
    var pageLinks = container.querySelectorAll('a:not(.nav-btn)');
    function positionUnderline(link) {
        var cr = container.getBoundingClientRect();
        var lr = link.getBoundingClientRect();
        navUnderline.style.left = (lr.left - cr.left) + 'px';
        navUnderline.style.width = lr.width + 'px';
    }
    function underlineUnderCurrent() {
        var current = container.querySelector('a.current');
        if (current) positionUnderline(current);
    }
    underlineUnderCurrent();
    for (var i = 0; i < pageLinks.length; i++) {
        pageLinks[i].addEventListener('mouseenter', function () {
            positionUnderline(this);
        });
    }
    container.addEventListener('mouseleave', underlineUnderCurrent);
    window.addEventListener('resize', underlineUnderCurrent);
})();

// Chart instances
let taxChart = null;
let revenueChart = null;

// Calculate tax projections
function calculateTaxProjections() {
    const propertySize = parseFloat(document.getElementById('propertySize').value);
    const taxRate = parseFloat(document.getElementById('taxRate').value);
    const baseInflation = parseFloat(document.getElementById('inflationRate').value) / 100;

    // Fixed parcel tax rates
    const measureT_rate = 0.072; // $/sq ft for WCCUSD
    const measureH_amount = 58.46; // $/year for Parks

    const years = 30;
    const labels = [];
    const baseData = [];
    const confidence75Data = [];
    const confidence95Data = [];
    const measureTData = [];
    const measureHData = [];

    // City-wide calculations
    const cityHouseholds = 8500;
    const avgPropertySize = 1250;

    // Separate cumulative arrays for each tax source
    const cityBaseData = [];
    const cityMeasureTData = [];
    const cityMeasureHData = [];

    let baseCumulative = 0;
    let measureTCumulative = 0;
    let measureHCumulative = 0;

    for (let year = 0; year <= years; year++) {
        labels.push(2025 + year);

        // Individual property calculations - TOD parcel tax only
        const baseAmount = propertySize * taxRate * Math.pow(1 + baseInflation, year);
        const conf75Amount = propertySize * taxRate * Math.pow(1 + baseInflation + 0.015, year);
        const conf95Amount = propertySize * taxRate * Math.pow(1 + baseInflation + 0.005, year);

        // Parcel taxes - FIXED amounts (no inflation adjustment)
        const measureTAmount = propertySize * measureT_rate;  // Fixed amount
        const measureHAmount = measureH_amount;  // Fixed amount

        baseData.push(baseAmount);
        confidence75Data.push(conf75Amount);
        confidence95Data.push(conf95Amount);
        measureTData.push(measureTAmount);
        measureHData.push(measureHAmount);

        // City-wide cumulative calculations - separated by source
        const cityBasePropertyTax = cityHouseholds * avgPropertySize * taxRate * Math.pow(1 + baseInflation, year);
        const cityMeasureT = cityHouseholds * avgPropertySize * measureT_rate;
        const cityMeasureH = cityHouseholds * measureH_amount;

        baseCumulative += cityBasePropertyTax;
        measureTCumulative += cityMeasureT;
        measureHCumulative += cityMeasureH;

        cityBaseData.push(baseCumulative / 1000000); // Convert to millions
        cityMeasureTData.push(measureTCumulative / 1000000);
        cityMeasureHData.push(measureHCumulative / 1000000);
    }

    // Update summary statistics
    updateSummaryStats(baseData, measureTData, measureHData);

    // Update charts
    updateTaxChart(labels, baseData, confidence75Data, confidence95Data, measureTData, measureHData);
    updateRevenueChart(labels, cityBaseData, cityMeasureTData, cityMeasureHData);
}

function updateSummaryStats(baseData, measureTData, measureHData) {
    const currentBase = baseData[0];

    document.getElementById('currentTax').innerHTML = '$' + currentBase.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
        '<div style="font-size: 0.6rem; color: #94a3b8; margin-top: 2px;">Excludes parcel taxes</div>';

    let fiveYear = 0, tenYear = 0, twentyYear = 0;

    // Only count TOD parcel tax
    for (let i = 0; i < baseData.length && i < 5; i++) {
        fiveYear += baseData[i];
    }
    for (let i = 0; i < baseData.length && i < 10; i++) {
        tenYear += baseData[i];
    }
    for (let i = 0; i < baseData.length && i < 20; i++) {
        twentyYear += baseData[i];
    }

    document.getElementById('fiveYearTotal').textContent = '$' + fiveYear.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    document.getElementById('tenYearTotal').textContent = '$' + tenYear.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    document.getElementById('twentyYearTotal').textContent = '$' + twentyYear.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function updateTaxChart(labels, baseData, confidence75Data, confidence95Data, measureTData, measureHData) {
    const ctx = document.getElementById('taxChart').getContext('2d');

    if (taxChart) {
        taxChart.destroy();
    }

    taxChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '95% Confidence',
                    data: confidence95Data,
                    borderColor: 'rgba(220, 38, 38, 0.3)',
                    backgroundColor: 'rgba(220, 38, 38, 0.03)',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: '75% Confidence',
                    data: confidence75Data,
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                    backgroundColor: 'rgba(245, 158, 11, 0.03)',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: 'TOD parcel tax',
                    data: baseData,
                    borderColor: '#fe5252',
                    backgroundColor: 'rgba(254, 82, 82, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: 'Measure T (WCCUSD)',
                    data: measureTData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2.5,
                    fill: false,
                    tension: 0,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: 'Measure H (Parks)',
                    data: measureHData,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2.5,
                    fill: false,
                    tension: 0,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        filter: function (item) {
                            // Hide confidence intervals from legend
                            return !item.text.includes('Confidence');
                        },
                        color: '#64748b',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: false,
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748b',
                        font: {
                            size: 11
                        },
                        callback: function (value) {
                            return '$' + value.toFixed(0);
                        }
                    },
                    title: {
                        display: true,
                        text: 'Annual Tax Payment',
                        color: '#475569',
                        font: {
                            size: 12,
                            weight: 500
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748b',
                        font: {
                            size: 11
                        }
                    },
                    title: {
                        display: true,
                        text: 'Year',
                        color: '#475569',
                        font: {
                            size: 12,
                            weight: 500
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function updateRevenueChart(labels, cityBaseData, cityMeasureTData, cityMeasureHData) {
    const ctx = document.getElementById('revenueChart').getContext('2d');

    if (revenueChart) {
        revenueChart.destroy();
    }

    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'TOD parcel tax',
                    data: cityBaseData,
                    borderColor: '#fe5252',
                    backgroundColor: 'rgba(254, 82, 82, 0.05)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Measure T (WCCUSD)',
                    data: cityMeasureTData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    borderWidth: 2.5,
                    fill: false,
                    tension: 0.2
                },
                {
                    label: 'Measure H (Parks)',
                    data: cityMeasureHData,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.05)',
                    borderWidth: 2.5,
                    fill: false,
                    tension: 0.2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#64748b',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': $' + context.parsed.y.toFixed(2) + 'M';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748b',
                        font: {
                            size: 11
                        },
                        callback: function (value) {
                            return '$' + value.toFixed(0) + 'M';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Cumulative Revenue (Millions)',
                        color: '#475569',
                        font: {
                            size: 12,
                            weight: 500
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748b',
                        font: {
                            size: 11
                        }
                    },
                    title: {
                        display: true,
                        text: 'Year',
                        color: '#475569',
                        font: {
                            size: 12,
                            weight: 500
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Event listeners
document.getElementById('propertySize').addEventListener('input', calculateTaxProjections);
document.getElementById('taxRate').addEventListener('input', calculateTaxProjections);
document.getElementById('inflationRate').addEventListener('input', calculateTaxProjections);

// Initial calculation
calculateTaxProjections();
