import sys
from pathlib import Path

import torch

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)

from torch.utils.data import DataLoader


# =====================================================
# PROJECT ROOT
# =====================================================

PROJECT_ROOT = Path(__file__).resolve().parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# =====================================================
# IMPORTS
# =====================================================

from model.dataset import NetworkDataset
from model.hybrid.hybrid_model import HybridModel
from model.trainer import Trainer

from config.config import (
    INPUT_SIZE,
    NUM_CLASSES,
    BATCH_SIZE,
    BEST_MODEL,
)


# =====================================================
# DEVICE
# =====================================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


print("=" * 70)
print("HYBRID CNN + RFNN MODEL EVALUATION")
print("=" * 70)

print(f"Device : {device}")


# =====================================================
# TEST DATASET
# =====================================================

print("\nLoading test dataset...")

test_dataset = NetworkDataset(
    "X_test.pkl",
    "y_test.pkl"
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
)

print(f"Test Samples : {len(test_dataset)}")


# =====================================================
# BUILD MODEL
# =====================================================

print("\nBuilding Hybrid CNN + RFNN model...")

model = HybridModel(
    input_size=INPUT_SIZE,
    num_classes=NUM_CLASSES,
)


# =====================================================
# LOAD TRAINED MODEL
# =====================================================

print("\nLoading trained model...")

checkpoint = torch.load(
    BEST_MODEL,
    map_location=device
)

model.load_state_dict(checkpoint)

model.to(device)
model.eval()

print("Trained model loaded successfully.")


# =====================================================
# TRAINER
# =====================================================

trainer = Trainer(
    model=model,
    train_loader=None,
    val_loader=None,
    criterion=None,
    optimizer=None,
    device=device,
)


# =====================================================
# GET PREDICTIONS
# =====================================================

print("\nGenerating predictions...")

# IMPORTANT:
# trainer.predict() returns:
# predictions, labels

# =====================================================
# GET PREDICTIONS
# =====================================================

print("\nGenerating predictions...")

# trainer.predict() returns predictions only
predictions = trainer.predict(test_loader)

print("Predictions generated successfully.")


# =====================================================
# GET TRUE LABELS
# =====================================================

true_labels = []

for _, labels in test_loader:
    true_labels.extend(labels.numpy())


# =====================================================
# CONVERT TO NORMAL PYTHON LISTS
# =====================================================

predictions = list(predictions)
true_labels = list(true_labels)


# =====================================================
# MULTICLASS EVALUATION
# =====================================================

print("\n")
print("=" * 70)
print("MULTICLASS EVALUATION")
print("=" * 70)


multiclass_accuracy = accuracy_score(
    true_labels,
    predictions
)

multiclass_precision = precision_score(
    true_labels,
    predictions,
    average="weighted",
    zero_division=0
)

multiclass_recall = recall_score(
    true_labels,
    predictions,
    average="weighted",
    zero_division=0
)

multiclass_f1 = f1_score(
    true_labels,
    predictions,
    average="weighted",
    zero_division=0
)


print(
    f"\nAccuracy  : {multiclass_accuracy * 100:.2f}%"
)

print(
    f"Precision : {multiclass_precision:.4f}"
)

print(
    f"Recall    : {multiclass_recall:.4f}"
)

print(
    f"F1 Score  : {multiclass_f1:.4f}"
)


# =====================================================
# MULTICLASS CLASSIFICATION REPORT
# =====================================================

print("\n")
print("=" * 70)
print("MULTICLASS CLASSIFICATION REPORT")
print("=" * 70)

print(
    classification_report(
        true_labels,
        predictions,
        digits=4,
        zero_division=0
    )
)


# =====================================================
# MULTICLASS CONFUSION MATRIX
# =====================================================

print("\n")
print("=" * 70)
print("MULTICLASS CONFUSION MATRIX")
print("=" * 70)

multiclass_cm = confusion_matrix(
    true_labels,
    predictions
)

print(multiclass_cm)


# =====================================================
# BINARY CLASSIFICATION
# =====================================================
#
# Class 0 = Benign
# All other classes = Attack
#
# Therefore:
#
# 0 -> Benign
# 1,2,3,... -> Attack
#
# =====================================================

print("\n")
print("=" * 70)
print("BINARY EVALUATION")
print("=" * 70)


binary_true = [
    0 if label == 0 else 1
    for label in true_labels
]

binary_predictions = [
    0 if prediction == 0 else 1
    for prediction in predictions
]


# =====================================================
# BINARY METRICS
# =====================================================

binary_accuracy = accuracy_score(
    binary_true,
    binary_predictions
)

binary_precision = precision_score(
    binary_true,
    binary_predictions,
    zero_division=0
)

binary_recall = recall_score(
    binary_true,
    binary_predictions,
    zero_division=0
)

binary_f1 = f1_score(
    binary_true,
    binary_predictions,
    zero_division=0
)


print(
    f"\nAccuracy  : {binary_accuracy * 100:.2f}%"
)

print(
    f"Precision : {binary_precision:.4f}"
)

print(
    f"Recall    : {binary_recall:.4f}"
)

print(
    f"F1 Score  : {binary_f1:.4f}"
)


# =====================================================
# BINARY CLASSIFICATION REPORT
# =====================================================

print("\n")
print("=" * 70)
print("BINARY CLASSIFICATION REPORT")
print("=" * 70)

print(
    classification_report(
        binary_true,
        binary_predictions,
        target_names=[
            "Benign",
            "Attack"
        ],
        digits=4,
        zero_division=0
    )
)


# =====================================================
# BINARY CONFUSION MATRIX
# =====================================================

print("\n")
print("=" * 70)
print("BINARY CONFUSION MATRIX")
print("=" * 70)

binary_cm = confusion_matrix(
    binary_true,
    binary_predictions
)

print(binary_cm)


# =====================================================
# FINAL SUMMARY
# =====================================================

print("\n")
print("=" * 70)
print("FINAL SUMMARY")
print("=" * 70)

print("\nMULTICLASS RESULTS")
print(f"Accuracy  : {multiclass_accuracy * 100:.2f}%")
print(f"Precision : {multiclass_precision:.4f}")
print(f"Recall    : {multiclass_recall:.4f}")
print(f"F1 Score  : {multiclass_f1:.4f}")

print("\nBINARY RESULTS")
print(f"Accuracy  : {binary_accuracy * 100:.2f}%")
print(f"Precision : {binary_precision:.4f}")
print(f"Recall    : {binary_recall:.4f}")
print(f"F1 Score  : {binary_f1:.4f}")

print("\n")
print("=" * 70)
print("EVALUATION COMPLETED SUCCESSFULLY")
print("=" * 70)