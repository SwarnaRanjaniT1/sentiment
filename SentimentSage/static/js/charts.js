/**
 * Charts.js - Creates and updates visualizations for sentiment analysis results
 */

// Initialize chart objects
let sentimentPieChart = null;
let titleBarChart = null;

/**
 * Create a pie chart showing the distribution of sentiments
 * @param {Object} data - Sentiment count data
 */
function createSentimentPieChart(data) {
    const ctx = document.getElementById('sentimentPieChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (sentimentPieChart) {
        sentimentPieChart.destroy();
    }
    
    // Extract data from the sentiment counts
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    // Create new chart
    sentimentPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(40, 167, 69, 0.7)',  // green for positive
                    'rgba(220, 53, 69, 0.7)',  // red for negative
                    'rgba(108, 117, 125, 0.7)'  // gray for neutral
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(220, 53, 69, 1)',
                    'rgba(108, 117, 125, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Sentiment Distribution'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Create a bar chart showing sentiment distribution by title
 * @param {Array} data - Title sentiment data
 */
function createTitleBarChart(data) {
    const ctx = document.getElementById('titleBarChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (titleBarChart) {
        titleBarChart.destroy();
    }
    
    // Sort data by total number of reviews (descending)
    data.sort((a, b) => {
        const totalA = a.positive + a.negative + a.neutral;
        const totalB = b.positive + b.negative + b.neutral;
        return totalB - totalA;
    });
    
    // Limit to top 10 titles
    const limitedData = data.slice(0, 10);
    
    // Create new chart
    titleBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: limitedData.map(item => item.title),
            datasets: [
                {
                    label: 'Positive',
                    data: limitedData.map(item => item.positive),
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Negative',
                    data: limitedData.map(item => item.negative),
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Neutral',
                    data: limitedData.map(item => item.neutral),
                    backgroundColor: 'rgba(108, 117, 125, 0.7)',
                    borderColor: 'rgba(108, 117, 125, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Title'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Reviews'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Sentiment by Title (Top 10)'
                }
            }
        }
    });
}

/**
 * Update visualizations with new data
 * @param {Object} stats - Statistics for visualization
 */
function updateVisualizations(stats) {
    // Show visualization container
    document.getElementById('visualizationsContainer').classList.remove('d-none');
    
    // Update pie chart
    createSentimentPieChart(stats.sentiment_counts);
    
    // Update bar chart if title data exists
    if (stats.title_data && stats.title_data.length > 0) {
        document.getElementById('titleChartContainer').classList.remove('d-none');
        createTitleBarChart(stats.title_data);
    } else {
        document.getElementById('titleChartContainer').classList.add('d-none');
    }
    
    // Update word cloud if data exists
    if (stats.word_cloud && stats.word_cloud.length > 0) {
        document.getElementById('wordCloudContainer').classList.remove('d-none');
        createWordCloud(stats.word_cloud);
    } else {
        document.getElementById('wordCloudContainer').classList.add('d-none');
    }
}
