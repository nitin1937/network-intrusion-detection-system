from preprocessing.pipeline import DataPipeline
from preprocessing.cleaner import DatasetCleaner
from preprocessing.feature_engineering import FeatureEngineering
from preprocessing.split_dataset import DatasetSplitter


def main():
    print("Starting dataset pipeline...")

    pipeline = DataPipeline()
    pipeline.merge_data()

    cleaner = DatasetCleaner()
    cleaner.run()

    eng = FeatureEngineering()
    eng.run()

    splitter = DatasetSplitter()
    splitter.run()

    print("\nPipeline completed successfully.")


if __name__ == "__main__":
    main()
