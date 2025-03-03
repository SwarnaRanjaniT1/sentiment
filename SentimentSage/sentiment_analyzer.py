import re
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from collections import Counter
import logging

# Download necessary NLTK resources
logging.info("Downloading NLTK resources...")
nltk.download('punkt')
nltk.download('vader_lexicon')
nltk.download('stopwords')

def analyze_sentiment(text):
    """
    Analyze the sentiment of the provided text.
    
    Args:
        text (str): The text to analyze
        
    Returns:
        tuple: (sentiment_label, sentiment_score, top_keywords)
    """
    # Clean text
    clean_text = re.sub(r'[^\w\s]', '', text.lower())
    
    # Get sentiment score using VADER
    sid = SentimentIntensityAnalyzer()
    sentiment_scores = sid.polarity_scores(text)
    compound_score = sentiment_scores['compound']
    
    # Determine sentiment label
    if compound_score >= 0.05:
        sentiment = "positive"
    elif compound_score <= -0.05:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    
    # Extract keywords (excluding stopwords)
    stop_words = set(stopwords.words('english'))
    
    # Tokenize the text manually to avoid punkt_tab dependency
    words = clean_text.split()
    keywords = [word for word in words if word.isalpha() and word not in stop_words]
    
    # Get top keywords
    keyword_freq = Counter(keywords).most_common(10)
    top_keywords = [{"word": word, "count": count} for word, count in keyword_freq]
    
    return sentiment, compound_score, top_keywords

def get_sentiment_stats(results):
    """
    Calculate sentiment statistics from analysis results.
    
    Args:
        results (list): List of sentiment analysis results
        
    Returns:
        dict: Statistics for visualization
    """
    # Count sentiments
    sentiment_counts = {
        'positive': 0,
        'negative': 0,
        'neutral': 0
    }
    
    # Title-based sentiment mapping
    title_sentiments = {}
    
    # Collect all keywords
    all_keywords = []
    
    for item in results:
        sentiment = item['sentiment']
        sentiment_counts[sentiment] += 1
        
        # Track sentiment by title if title is present
        if 'title' in item:
            title = item['title']
            if title not in title_sentiments:
                title_sentiments[title] = {'positive': 0, 'negative': 0, 'neutral': 0}
            title_sentiments[title][sentiment] += 1
        
        # Collect keywords for word cloud
        if 'keywords' in item:
            for keyword in item['keywords']:
                all_keywords.append({
                    'text': keyword['word'],
                    'size': keyword['count']
                })
    
    # Combine duplicate keywords and sum their counts
    word_cloud_data = {}
    for item in all_keywords:
        word = item['text']
        if word in word_cloud_data:
            word_cloud_data[word] += item['size']
        else:
            word_cloud_data[word] = item['size']
    
    # Convert to format needed for D3 word cloud
    word_cloud = [{'text': word, 'size': count} for word, count in word_cloud_data.items()]
    
    # Prepare title data for bar chart
    title_data = []
    for title, counts in title_sentiments.items():
        title_data.append({
            'title': title,
            'positive': counts['positive'],
            'negative': counts['negative'],
            'neutral': counts['neutral']
        })
    
    return {
        'sentiment_counts': sentiment_counts,
        'title_data': title_data,
        'word_cloud': word_cloud
    }
