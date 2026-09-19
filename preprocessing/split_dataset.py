import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from config.config import FINAL_DATASET, RANDOM_STATE


class DatasetSplitter:
    def __init__(self):
        self.input_file = FINAL_DATASET / "processed_dataset.csv"

    def load_dataset(self):
        print("Loading Processed Dataset...")
        self.df = pd.read_csv(self.input_file)

    def split(self):
        X = self.df.drop("Label", axis=1)

        # Convert every feature to numeric
        X = X.apply(pd.to_numeric, errors="coerce")

        # Replace infinity values
        X.replace([np.inf, -np.inf], np.nan, inplace=True)

        # Fill missing values
        X.fillna(0, inplace=True)

        print("\nChecking Dataset...")
        print("Missing Values :", X.isnull().sum().sum())
        print("Infinite Values :", np.isinf(X.values).sum())
        print("Object Columns :")
        print(X.select_dtypes(include=["object"]).columns.tolist())

        y = self.df["Label"]

        # 70% Train, 30% Temp
        X_train, X_temp, y_train, y_temp = train_test_split(
            X,
            y,
            test_size=0.30,
            random_state=RANDOM_STATE,
            stratify=y,
        )

        # 15% Validation, 15% Test
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp,
            y_temp,
            test_size=0.50,
            random_state=RANDOM_STATE,
            stratify=y_temp,
        )

        self.scaler = StandardScaler()
        X_train = self.scaler.fit_transform(X_train)
        X_val = self.scaler.transform(X_val)
        X_test = self.scaler.transform(X_test)

        self.X_train = X_train
        self.X_val = X_val
        self.X_test = X_test

        self.y_train = y_train
        self.y_val = y_val
        self.y_test = y_test

    def save(self):
        joblib.dump(self.X_train, FINAL_DATASET / "X_train.pkl")
        joblib.dump(self.X_val, FINAL_DATASET / "X_val.pkl")
        joblib.dump(self.X_test, FINAL_DATASET / "X_test.pkl")

        joblib.dump(self.y_train, FINAL_DATASET / "y_train.pkl")
        joblib.dump(self.y_val, FINAL_DATASET / "y_val.pkl")
        joblib.dump(self.y_test, FINAL_DATASET / "y_test.pkl")

        joblib.dump(self.scaler, FINAL_DATASET / "scaler.pkl")

        print("\nDataset Saved Successfully")

    def run(self):
        self.load_dataset()
        self.split()
        self.save()
        print("\nDataset Ready For PyTorch")