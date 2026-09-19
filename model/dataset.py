import joblib
import numpy as np
import torch
from torch.utils.data import Dataset

from config.config import FINAL_DATASET


class NetworkDataset(Dataset):
    """
    PyTorch Dataset for Network Intrusion Detection.

    Loads:
        X_train.pkl
        y_train.pkl
        X_val.pkl
        y_val.pkl
        X_test.pkl
        y_test.pkl
    """

    def __init__(self, x_file, y_file):

        # Load data
        self.X = joblib.load(FINAL_DATASET / x_file)
        self.y = joblib.load(FINAL_DATASET / y_file)

        # Convert labels to numpy if pandas
        if hasattr(self.y, "values"):
            self.y = self.y.values

        # Ensure correct shape
        self.y = np.asarray(self.y).reshape(-1)

        # Convert to tensors
        self.X = torch.tensor(self.X, dtype=torch.float32)
        self.y = torch.tensor(self.y, dtype=torch.long)

        # Basic validation
        if len(self.X) != len(self.y):
            raise ValueError(
                f"Mismatch between features ({len(self.X)}) "
                f"and labels ({len(self.y)})"
            )

    def __len__(self):
        return len(self.X)

    def __getitem__(self, index):
        return self.X[index], self.y[index]

    @property
    def num_features(self):
        """
        Returns number of input features.
        """
        return self.X.shape[1]

    @property
    def num_classes(self):
        """
        Returns number of unique classes.
        """
        return len(torch.unique(self.y))