import pandas as pd
import joblib

from sklearn.preprocessing import LabelEncoder

from config.config import PROCESSED_DATASET, FINAL_DATASET
from utils.logger import logger


class FeatureEngineering:

    def __init__(self):

        self.input_file = PROCESSED_DATASET / "cleaned_dataset.csv"

        self.output_file = FINAL_DATASET / "processed_dataset.csv"

        self.encoder_file = FINAL_DATASET / "label_encoder.pkl"

        FINAL_DATASET.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------

    def load_dataset(self):

        print("\nLoading Clean Dataset...")

        self.df = pd.read_csv(
            self.input_file,
            low_memory=False
        )

    # ------------------------------------------------

    def remove_unnecessary_columns(self):

        if "Timestamp" in self.df.columns:

            self.df.drop(columns=["Timestamp"], inplace=True)

            print("Timestamp Removed")

    # ------------------------------------------------

    def encode_labels(self):

        encoder = LabelEncoder()

        self.df["Label"] = encoder.fit_transform(self.df["Label"])

        joblib.dump(encoder, self.encoder_file)

        print("\nLabel Encoding Completed")

        print("\nAttack Mapping")

        for index, label in enumerate(encoder.classes_):

            print(f"{index} --> {label}")

    # ------------------------------------------------

    def save_dataset(self):

        self.df.to_csv(
            self.output_file,
            index=False
        )

        logger.info("Feature Engineering Completed")

        print("\nProcessed Dataset Saved")

    # ------------------------------------------------

    def run(self):

        self.load_dataset()

        self.remove_unnecessary_columns()

        self.encode_labels()

        self.save_dataset()