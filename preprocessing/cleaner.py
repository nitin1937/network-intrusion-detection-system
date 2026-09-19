import pandas as pd
import numpy as np

from config.config import PROCESSED_DATASET
from utils.logger import logger


class DatasetCleaner:

    def __init__(self):

        self.input_file = PROCESSED_DATASET / "merged_dataset.csv"

        self.output_file = PROCESSED_DATASET / "cleaned_dataset.csv"

    # ---------------------------------------------------

    def load_dataset(self):

        print("\nLoading Dataset...")

        self.df = pd.read_csv(
            self.input_file,
            low_memory=False
        )

    # ---------------------------------------------------

    def remove_duplicate_rows(self):

        before = len(self.df)

        self.df.drop_duplicates(inplace=True)

        after = len(self.df)

        print(f"Duplicate Rows Removed : {before-after}")

    # ---------------------------------------------------

    def remove_invalid_labels(self):

        before = len(self.df)

        self.df = self.df[self.df["Label"] != "Label"]

        after = len(self.df)

        print(f"Invalid Rows Removed : {before-after}")

    # ---------------------------------------------------

    def replace_infinity(self):

        self.df.replace(
            [np.inf, -np.inf],
            np.nan,
            inplace=True
        )

    # ---------------------------------------------------

    def remove_missing_values(self):

        before = len(self.df)

        self.df.dropna(inplace=True)

        after = len(self.df)

        print(f"Rows Removed (Missing Values) : {before-after}")

    # ---------------------------------------------------

    def save_dataset(self):

        self.df.to_csv(
            self.output_file,
            index=False
        )

        print("\nDataset Saved")

        logger.info("Clean Dataset Saved")

    # ---------------------------------------------------

    def run(self):

        self.load_dataset()

        self.remove_duplicate_rows()

        self.remove_invalid_labels()

        self.replace_infinity()

        self.remove_missing_values()

        self.save_dataset()

        print("\nCleaning Completed Successfully")