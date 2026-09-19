import torch
import torch.nn as nn


class ResidualBlock(nn.Module):

    def __init__(self, features):

        super(ResidualBlock, self).__init__()

        self.block = nn.Sequential(

            nn.Linear(features, features),

            nn.ReLU(),

            nn.BatchNorm1d(features),

            nn.Dropout(0.3),

            nn.Linear(features, features)

        )

        self.relu = nn.ReLU()

    def forward(self, x):

        identity = x

        out = self.block(x)

        out += identity

        out = self.relu(out)

        return out


class RFNNModel(nn.Module):
    """
    Residual Fully Connected Neural Network (RFNN)

    Args:
        input_size (int): Input feature size from CNN.
        num_classes (int): Number of output classes.
    """

    def __init__(self, input_size=1216, num_classes=10):

        super(RFNNModel, self).__init__()

        self.input_size = input_size
        self.num_classes = num_classes

        self.network = nn.Sequential(

            nn.Linear(input_size, 512),

            nn.ReLU(),

            nn.BatchNorm1d(512),

            nn.Dropout(0.3),

            ResidualBlock(512),

            ResidualBlock(512),

            nn.Linear(512, 256),

            nn.ReLU(),

            nn.BatchNorm1d(256),

            nn.Dropout(0.3),

            nn.Linear(256, num_classes)

        )

    def forward(self, x):

        return self.network(x)