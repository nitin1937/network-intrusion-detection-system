import torch
from tqdm import tqdm


class Trainer:

    def __init__(
        self,
        model,
        train_loader,
        val_loader,
        criterion,
        optimizer,
        device
    ):

        self.model = model
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.criterion = criterion
        self.optimizer = optimizer
        self.device = device

    # =====================================================
    # Training
    # =====================================================

    def train_epoch(self):

        self.model.train()

        total_loss = 0.0
        correct = 0
        total = 0

        progress_bar = tqdm(
            self.train_loader,
            desc="Training",
            unit="batch",
            leave=True,
            ncols=100
        )

        for X, y in progress_bar:

            X = X.to(self.device)
            y = y.to(self.device)

            self.optimizer.zero_grad()

            outputs = self.model(X)

            loss = self.criterion(outputs, y)

            loss.backward()

            # Prevent exploding gradients
            torch.nn.utils.clip_grad_norm_(
                self.model.parameters(),
                max_norm=1.0
            )

            self.optimizer.step()

            total_loss += loss.item()

            predictions = torch.argmax(outputs, dim=1)

            correct += (predictions == y).sum().item()

            total += y.size(0)

            progress_bar.set_postfix({
                "Loss": f"{loss.item():.4f}",
                "Acc": f"{100 * correct / total:.2f}%"
            })

        average_loss = total_loss / len(self.train_loader)

        accuracy = (correct / total) * 100

        return average_loss, accuracy

    # =====================================================
    # Validation
    # =====================================================

    def validate_epoch(self):

        self.model.eval()

        total_loss = 0.0
        correct = 0
        total = 0

        progress_bar = tqdm(
            self.val_loader,
            desc="Validation",
            unit="batch",
            leave=True,
            ncols=100
        )

        with torch.no_grad():

            for X, y in progress_bar:

                X = X.to(self.device)
                y = y.to(self.device)

                outputs = self.model(X)

                loss = self.criterion(outputs, y)

                total_loss += loss.item()

                predictions = torch.argmax(outputs, dim=1)

                correct += (predictions == y).sum().item()

                total += y.size(0)

                progress_bar.set_postfix({
                    "Loss": f"{loss.item():.4f}",
                    "Acc": f"{100 * correct / total:.2f}%"
                })

        average_loss = total_loss / len(self.val_loader)

        accuracy = (correct / total) * 100

        return average_loss, accuracy

    # =====================================================
    # Prediction
    # =====================================================

    def predict(self, loader):

        self.model.eval()

        predictions = []

        progress_bar = tqdm(
            loader,
            desc="Testing",
            unit="batch",
            leave=True,
            ncols=100
        )

        with torch.no_grad():

            for X, _ in progress_bar:

                X = X.to(self.device)

                outputs = self.model(X)

                pred = torch.argmax(outputs, dim=1)

                predictions.extend(pred.cpu().numpy())

        return predictions