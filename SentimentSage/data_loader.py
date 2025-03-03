import os
import pandas as pd
import logging

def load_dataset(dataset_name):
    """
    Load a dataset of reviews for analysis.
    
    Args:
        dataset_name (str): Name of the dataset to load
        
    Returns:
        pandas.DataFrame: Loaded dataset
    """
    try:
        if dataset_name == 'movies':
            path = os.path.join('static', 'data', 'movie_reviews.csv')
            df = pd.read_csv(path)
            return df
        elif dataset_name == 'tv':
            path = os.path.join('static', 'data', 'tv_reviews.csv')
            df = pd.read_csv(path)
            return df
        else:
            raise ValueError(f"Unknown dataset: {dataset_name}")
    except Exception as e:
        logging.error(f"Error loading dataset {dataset_name}: {str(e)}")
        raise
