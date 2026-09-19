from pathlib import Path
import pandas as pd
import numpy as np

from config.config import PROCESSED_DATASET
from utils.logger import logger


class DatasetValidator:

    def __init__(self):

        self.dataset_path = PROCESSED_DATASET / "merged_dataset.csv"

    # ------------------------------------------------

    def load_dataset(self):

        print("\nLoading Dataset...\n")

        self.df = pd.read_csv(
            self.dataset_path,
            low_memory=False
        )

        logger.info("Merged Dataset Loaded")

    # ------------------------------------------------

    def dataset_shape(self):

        print("=" * 60)
        print("DATASET SHAPE")
        print("=" * 60)

        print(f"Rows    : {self.df.shape[0]}")
        print(f"Columns : {self.df.shape[1]}")

    # ------------------------------------------------

    def missing_values(self):

        print("\nMissing Values")

        missing = self.df.isnull().sum().sum()

        print(missing)

    # ------------------------------------------------

    def duplicate_rows(self):

        print("\nDuplicate Rows")

        duplicates = self.df.duplicated().sum()

        print(duplicates)

    # ------------------------------------------------

    def memory_usage(self):

        print("\nMemory Usage")

        memory = self.df.memory_usage(deep=True).sum() / 1024**2

        print(f"{memory:.2f} MB")

    # ------------------------------------------------

    def label_distribution(self):

        print("\nAttack Classes")

        print(self.df["Label"].value_counts())

    # ------------------------------------------------

    def infinite_values(self):

        print("\nInfinite Values")

        numeric = self.df.select_dtypes(include=[np.number])

        print(np.isinf(numeric).sum().sum())

    # ------------------------------------------------

    def run(self):

        self.load_dataset()

        self.dataset_shape()

        self.memory_usage()

        self.missing_values()

        self.duplicate_rows()

        self.infinite_values()

        self.label_distribution()