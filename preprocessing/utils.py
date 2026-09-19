from pathlib import Path
import pandas as pd

# ----------------------------------------------------
# Read CSV
# ----------------------------------------------------

def load_csv(file_path):
    """Load a CSV file."""
    return pd.read_csv(file_path, low_memory=False)

# ----------------------------------------------------
# Save CSV
# ----------------------------------------------------

def save_csv(df, output_path):
    """Save DataFrame to CSV."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)

# ----------------------------------------------------
# Dataset Information
# ----------------------------------------------------

def dataset_info(df):
    print("=" * 60)
    print("Dataset Information")
    print("=" * 60)

    print(f"Rows    : {df.shape[0]}")
    print(f"Columns : {df.shape[1]}")

# ----------------------------------------------------
# Missing Values
# ----------------------------------------------------

def missing_values(df):
    return df.isnull().sum().sum()

# ----------------------------------------------------
# Duplicate Rows
# ----------------------------------------------------

def duplicate_rows(df):
    return df.duplicated().sum()