import torch
import torch.nn as nn

from model.cnn.cnn_model import CNNModel
from model.rfnn.rfnn_model import RFNNModel


class HybridModel(nn.Module):
    """
    Hybrid CNN + RFNN Model

    Args:
        input_size (int): Number of input features.
                          Default = 78 (CSE-CIC-IDS2018)
        num_classes (int): Number of output classes.
    """

    def __init__(self, input_size=78, num_classes=10):

        super(HybridModel, self).__init__()

        self.input_size = input_size
        self.num_classes = num_classes

        # CNN Feature Extractor
        self.cnn = CNNModel(input_size=input_size)

        # Automatically determine CNN output feature size
        with torch.no_grad():
            dummy = torch.randn(1, input_size)
            cnn_output = self.cnn(dummy)
            feature_size = cnn_output.shape[1]

        # RFNN Classifier
        self.rfnn = RFNNModel(
            input_size=feature_size,
            num_classes=num_classes
        )

    def forward(self, x):

        x = self.cnn(x)

        x = self.rfnn(x)

        return x