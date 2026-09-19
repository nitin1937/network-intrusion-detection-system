import torch
import torch.nn as nn


class CNNModel(nn.Module):
    """
    1D CNN Feature Extractor

    Args:
        input_size (int): Number of input features.
                          Default = 78
    """

    def __init__(self, input_size=78):

        super(CNNModel, self).__init__()

        self.input_size = input_size

        self.features = nn.Sequential(

            nn.Conv1d(
                in_channels=1,
                out_channels=32,
                kernel_size=3,
                padding=1
            ),

            nn.ReLU(),

            nn.BatchNorm1d(32),

            nn.MaxPool1d(kernel_size=2),

            nn.Conv1d(
                in_channels=32,
                out_channels=64,
                kernel_size=3,
                padding=1
            ),

            nn.ReLU(),

            nn.BatchNorm1d(64),

            nn.MaxPool1d(kernel_size=2)

        )

        self.flatten = nn.Flatten()

    def forward(self, x):

        # x shape: (batch_size, input_size)

        x = x.unsqueeze(1)

        # shape: (batch_size, 1, input_size)

        x = self.features(x)

        # shape: (batch_size, 64, *)

        x = self.flatten(x)

        return x