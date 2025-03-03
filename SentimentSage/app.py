import os
import logging
from flask import Flask, render_template, request, jsonify, session, g
import pandas as pd

from sentiment_analyzer import analyze_sentiment, get_sentiment_stats
from data_loader import load_dataset

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default-secret-key")

# Use in-memory storage for analysis results instead of session
# to avoid session cookie size limitations
app.config['ANALYSIS_RESULTS'] = {
    'results': [],
    'dataset_results': [],
    'dataset_stats': None
}

@app.route('/')
def index():
    """Render the main application page"""
    return render_template('index.html')

@app.route('/about')
def about():
    """Render the about page"""
    return render_template('about.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze sentiment of user input text"""
    text = request.form.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    # Analyze the sentiment
    sentiment, score, keywords = analyze_sentiment(text)
    
    # Store the result in app config for persistence
    result = {
        'text': text,
        'sentiment': sentiment,
        'score': score,
        'keywords': keywords
    }
    
    app.config['ANALYSIS_RESULTS']['results'].append(result)
    
    return jsonify({
        'sentiment': sentiment,
        'score': score,
        'keywords': keywords
    })

@app.route('/analyze_dataset', methods=['POST'])
def analyze_dataset():
    """Analyze sentiment of a selected dataset"""
    dataset_name = request.form.get('dataset', '')
    if not dataset_name:
        return jsonify({'error': 'No dataset selected'}), 400
    
    # Load the selected dataset
    try:
        dataset = load_dataset(dataset_name)
        results = []
        
        # Only analyze a limited number of rows to avoid performance issues
        max_rows = min(len(dataset), 25)  # Limit to 25 reviews for performance
        
        for i, row in dataset.iloc[:max_rows].iterrows():
            text = row['review']
            title = row['title']
            sentiment, score, keywords = analyze_sentiment(text)
            results.append({
                'title': title,
                'text': text,
                'sentiment': sentiment,
                'score': score,
                'keywords': keywords
            })
        
        # Get statistics for visualization
        stats = get_sentiment_stats(results)
        
        # Store results in app config (not session)
        app.config['ANALYSIS_RESULTS']['dataset_results'] = results
        app.config['ANALYSIS_RESULTS']['dataset_stats'] = stats
        
        return jsonify({
            'status': 'success',
            'count': len(results),
            'stats': stats
        })
    except Exception as e:
        logging.error(f"Error analyzing dataset: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_stats', methods=['GET'])
def get_stats():
    """Return stored statistics for visualization"""
    if app.config['ANALYSIS_RESULTS']['dataset_stats']:
        return jsonify(app.config['ANALYSIS_RESULTS']['dataset_stats'])
    else:
        return jsonify({'error': 'No data available'}), 404

@app.route('/get_results', methods=['GET'])
def get_results():
    """Return stored results"""
    if app.config['ANALYSIS_RESULTS']['dataset_results']:
        return jsonify(app.config['ANALYSIS_RESULTS']['dataset_results'])
    elif app.config['ANALYSIS_RESULTS']['results']:
        return jsonify(app.config['ANALYSIS_RESULTS']['results'])
    else:
        return jsonify({'error': 'No results available'}), 404

@app.route('/clear_results', methods=['POST'])
def clear_results():
    """Clear stored results"""
    app.config['ANALYSIS_RESULTS'] = {
        'results': [],
        'dataset_results': [],
        'dataset_stats': None
    }
    return jsonify({'status': 'success'})

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return render_template('index.html', error="Page not found"), 404

@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return render_template('index.html', error="Server error occurred"), 500
