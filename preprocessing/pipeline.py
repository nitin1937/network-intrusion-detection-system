from pathlib import Path
import pandas as pd

from config.config import RAW_DATASET, PROCESSED_DATASET
from utils.logger import logger


class DataPipeline:

    def __init__(self):
        self.raw_path = RAW_DATASET
        self.processed_path = PROCESSED_DATASET

        self.processed_path.mkdir(parents=True, exist_ok=True)

        logger.info("Data Pipeline Initialized")

    # ---------------------------------------------

    def list_files(self):

        csv_files = sorted(self.raw_path.glob("*.csv"))

        return csv_files

    # ---------------------------------------------

    def merge_data(self):

        csv_files = self.list_files()

        if len(csv_files) == 0:
            raise FileNotFoundError("No CSV files found!")

        dataframe_list = []

        print("\nLoading CSV Files...\n")

        for file in csv_files:

            print(f"Reading {file.name}")

            df = pd.read_csv(file, low_memory=False)

            dataframe_list.append(df)

        merged_df = pd.concat(
            dataframe_list,
            ignore_index=True
        )

        print("\nMerge Completed")

        print(f"Rows : {merged_df.shape[0]}")
        print(f"Columns : {merged_df.shape[1]}")

        output_file = self.processed_path / "merged_dataset.csv"

        merged_df.to_csv(
            output_file,
            index=False
        )

        logger.info("Merged Dataset Saved")

        return merged_df


# =====================================================
# RUN PIPELINE
# =====================================================

if __name__ == "__main__":

    pipeline = DataPipeline()

    pipeline.merge_data()