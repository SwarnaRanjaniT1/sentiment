/**
 * Main.js - Primary JavaScript file for the sentiment analysis application
 */

document.addEventListener('DOMContentLoaded', function() {
    // Form for submitting single text review
    const textAnalysisForm = document.getElementById('textAnalysisForm');
    
    // Form for selecting dataset to analyze
    const datasetForm = document.getElementById('datasetForm');
    
    // Results container
    const resultsContainer = document.getElementById('resultsContainer');
    
    // Clear results button
    const clearResultsBtn = document.getElementById('clearResultsBtn');
    
    // Analyze text form submission
    if (textAnalysisForm) {
        textAnalysisForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get the input text
            const textInput = document.getElementById('textInput').value.trim();
            
            if (!textInput) {
                showAlert('Please enter some text to analyze.', 'danger');
                return;
            }
            
            // Show loading indicator
            document.getElementById('textAnalysisLoading').classList.remove('d-none');
            
            // Disable submit button
            document.getElementById('analyzeTextBtn').disabled = true;
            
            // Submit form data via AJAX
            const formData = new FormData(textAnalysisForm);
            
            fetch('/analyze', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Hide loading indicator
                document.getElementById('textAnalysisLoading').classList.add('d-none');
                
                // Re-enable submit button
                document.getElementById('analyzeTextBtn').disabled = false;
                
                // Display result
                displaySingleResult(data, textInput);
                
                // Reset form
                textAnalysisForm.reset();
            })
            .catch(error => {
                console.error('Error:', error);
                
                // Hide loading indicator
                document.getElementById('textAnalysisLoading').classList.add('d-none');
                
                // Re-enable submit button
                document.getElementById('analyzeTextBtn').disabled = false;
                
                // Show error message
                showAlert('Error analyzing text. Please try again.', 'danger');
            });
        });
    }
    
    // Dataset analysis form submission
    if (datasetForm) {
        datasetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get the selected dataset
            const datasetSelect = document.getElementById('datasetSelect');
            const datasetName = datasetSelect.value;
            
            if (!datasetName) {
                showAlert('Please select a dataset to analyze.', 'danger');
                return;
            }
            
            // Show loading indicator
            document.getElementById('datasetAnalysisLoading').classList.remove('d-none');
            
            // Disable submit button
            document.getElementById('analyzeDatasetBtn').disabled = true;
            
            // Submit form data via AJAX
            const formData = new FormData(datasetForm);
            
            fetch('/analyze_dataset', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Hide loading indicator
                document.getElementById('datasetAnalysisLoading').classList.add('d-none');
                
                // Re-enable submit button
                document.getElementById('analyzeDatasetBtn').disabled = false;
                
                // Display result
                if (data.status === 'success') {
                    // Show success message
                    showAlert(`Successfully analyzed ${data.count} reviews from the dataset.`, 'success');
                    
                    // Load and display dataset results
                    loadResults();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                
                // Hide loading indicator
                document.getElementById('datasetAnalysisLoading').classList.add('d-none');
                
                // Re-enable submit button
                document.getElementById('analyzeDatasetBtn').disabled = false;
                
                // Show error message
                showAlert('Error analyzing dataset. Please try again.', 'danger');
            });
        });
    }
    
    // Clear results button click
    if (clearResultsBtn) {
        clearResultsBtn.addEventListener('click', function() {
            // Send request to clear results
            fetch('/clear_results', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(() => {
                // Clear results container
                resultsContainer.innerHTML = '';
                
                // Hide visualizations
                document.getElementById('visualizationsContainer').classList.add('d-none');
                
                // Show message
                showAlert('Results cleared successfully.', 'info');
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Error clearing results.', 'danger');
            });
        });
    }
    
    // Load existing results when page loads
    loadResults();

    // Function to show alert messages
    function showAlert(message, type) {
        const alertsContainer = document.getElementById('alertsContainer');
        
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show`;
        alertElement.role = 'alert';
        
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to container
        alertsContainer.appendChild(alertElement);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            if (alertElement.parentNode) {
                const bsAlert = new bootstrap.Alert(alertElement);
                bsAlert.close();
            }
        }, 5000);
    }
    
    // Function to display a single analysis result
    function displaySingleResult(result, text) {
        // Create result element
        const resultElement = document.createElement('div');
        resultElement.className = 'card mb-3';
        
        // Determine sentiment class
        let sentimentClass = 'bg-secondary'; // Neutral
        if (result.sentiment === 'positive') {
            sentimentClass = 'bg-success';
        } else if (result.sentiment === 'negative') {
            sentimentClass = 'bg-danger';
        }
        
        // Format the result
        resultElement.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Analysis Result</h5>
                <span class="badge ${sentimentClass}">${result.sentiment.toUpperCase()}</span>
            </div>
            <div class="card-body">
                <p class="card-text"><strong>Text:</strong> ${text}</p>
                <p class="card-text"><strong>Sentiment Score:</strong> ${result.score.toFixed(2)}</p>
                <div class="mt-3">
                    <strong>Key Terms:</strong>
                    <div class="d-flex flex-wrap gap-1 mt-1">
                        ${result.keywords.map(kw => `
                            <span class="badge bg-info">${kw.word} (${kw.count})</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Add to results container
        resultsContainer.prepend(resultElement);
        
        // Show clear results button
        clearResultsBtn.classList.remove('d-none');
    }
    
    // Function to load and display results
    function loadResults() {
        // Fetch results from server
        fetch('/get_results')
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        // No results available - this is normal for a new session
                        return { results: [] };
                    }
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Check if we have results to display
                if (Array.isArray(data) && data.length > 0) {
                    // Show clear results button
                    clearResultsBtn.classList.remove('d-none');
                    
                    // Clear existing results
                    resultsContainer.innerHTML = '';
                    
                    // Display results
                    data.forEach(result => {
                        const resultElement = document.createElement('div');
                        resultElement.className = 'card mb-3';
                        
                        // Determine sentiment class
                        let sentimentClass = 'bg-secondary'; // Neutral
                        if (result.sentiment === 'positive') {
                            sentimentClass = 'bg-success';
                        } else if (result.sentiment === 'negative') {
                            sentimentClass = 'bg-danger';
                        }
                        
                        // Format the result
                        resultElement.innerHTML = `
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">${result.title ? result.title : 'Analysis Result'}</h5>
                                <span class="badge ${sentimentClass}">${result.sentiment.toUpperCase()}</span>
                            </div>
                            <div class="card-body">
                                <p class="card-text"><strong>Text:</strong> ${result.text}</p>
                                <p class="card-text"><strong>Sentiment Score:</strong> ${result.score.toFixed(2)}</p>
                                <div class="mt-3">
                                    <strong>Key Terms:</strong>
                                    <div class="d-flex flex-wrap gap-1 mt-1">
                                        ${result.keywords.map(kw => `
                                            <span class="badge bg-info">${kw.word} (${kw.count})</span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        // Add to results container
                        resultsContainer.appendChild(resultElement);
                    });
                    
                    // Load stats for visualization
                    loadStats();
                }
            })
            .catch(error => {
                console.error('Error loading results:', error);
            });
    }
    
    // Function to load statistics for visualization
    function loadStats() {
        fetch('/get_stats')
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        // No stats available
                        return { stats: null };
                    }
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(stats => {
                if (stats && stats.sentiment_counts) {
                    // Update visualizations with the stats
                    updateVisualizations(stats);
                }
            })
            .catch(error => {
                console.error('Error loading stats:', error);
            });
    }
});
