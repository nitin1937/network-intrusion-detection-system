import os
import sys
import random
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from torch.optim.lr_scheduler import ReduceLROnPlateau
from torch.utils.data import DataLoader

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)


# =====================================================
# PROJECT ROOT
# =====================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# =====================================================
# IMPORTS
# =====================================================

from model.dataset import NetworkDataset
from model.hybrid.hybrid_model import HybridModel
from model.trainer import Trainer

from config.config import (
    RANDOM_STATE,
    INPUT_SIZE,
    NUM_CLASSES,
    BATCH_SIZE,
    LEARNING_RATE,
    EPOCHS,
    WEIGHT_DECAY,
    PATIENCE,
    LR_FACTOR,
    LR_PATIENCE,
    BEST_MODEL,
    LAST_MODEL,
    CHECKPOINT,
)


# =====================================================
# RANDOM SEED
# =====================================================

def set_seed(seed):

    random.seed(seed)

    np.random.seed(seed)

    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


set_seed(RANDOM_STATE)


# =====================================================
# DEVICE
# =====================================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


print("=" * 70)
print("HYBRID CNN + RFNN NETWORK INTRUSION DETECTION")
print("=" * 70)

print(f"Device        : {device}")
print(f"Input Features: {INPUT_SIZE}")
print(f"Classes       : {NUM_CLASSES}")


# =====================================================
# DATASET
# =====================================================

print("\nLoading datasets...")


train_dataset = NetworkDataset(
    "X_train.pkl",
    "y_train.pkl"
)

val_dataset = NetworkDataset(
    "X_val.pkl",
    "y_val.pkl"
)

test_dataset = NetworkDataset(
    "X_test.pkl",
    "y_test.pkl"
)


print(
    f"Training Samples   : {len(train_dataset):,}"
)

print(
    f"Validation Samples : {len(val_dataset):,}"
)

print(
    f"Test Samples       : {len(test_dataset):,}"
)


# =====================================================
# DATALOADERS
# =====================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0,
    pin_memory=torch.cuda.is_available()
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0,
    pin_memory=torch.cuda.is_available()
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0,
    pin_memory=torch.cuda.is_available()
)


print("\nDataLoaders created successfully.")


# =====================================================
# MODEL
# =====================================================

print("\nBuilding Hybrid Model...")


model = HybridModel(
    input_size=INPUT_SIZE,
    num_classes=NUM_CLASSES
)


model = model.to(device)


print(model)


# =====================================================
# VERIFY OUTPUT LAYER
# =====================================================

print("\nChecking model output size...")


output_layer = model.rfnn.network[10]


print(
    "Output layer:",
    output_layer
)


if output_layer.out_features != NUM_CLASSES:

    raise RuntimeError(
        f"Model output has "
        f"{output_layer.out_features} classes, "
        f"but config expects {NUM_CLASSES}."
    )


print(
    f"Output classes verified: {NUM_CLASSES}"
)


# =====================================================
# LOSS
# =====================================================

criterion = nn.CrossEntropyLoss()


# =====================================================
# OPTIMIZER
# =====================================================

optimizer = optim.AdamW(
    model.parameters(),
    lr=LEARNING_RATE,
    weight_decay=WEIGHT_DECAY
)


# =====================================================
# SCHEDULER
# =====================================================

scheduler = ReduceLROnPlateau(
    optimizer,
    mode="max",
    factor=LR_FACTOR,
    patience=LR_PATIENCE
)


# =====================================================
# TRAINER
# =====================================================

trainer = Trainer(
    model,
    train_loader,
    val_loader,
    criterion,
    optimizer,
    device
)


print(
    "\nTrainer initialized successfully."
)


# =====================================================
# SAVE DIRECTORY
# =====================================================

SAVE_DIR = (
    PROJECT_ROOT
    / "model"
    / "saved_model"
)


SAVE_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =====================================================
# IMPORTANT
# =====================================================
#
# We intentionally DO NOT load the old model here.
#
# The old hybrid_model.pth contains 10 output classes.
# Our new model contains 8 output classes.
#
# Therefore we retrain and overwrite the old model.
# =====================================================

print("\n")
print("=" * 70)
print("STARTING FRESH 8-CLASS TRAINING")
print("=" * 70)


# =====================================================
# TRAINING HISTORY
# =====================================================

train_losses = []
train_accuracies = []

val_losses = []
val_accuracies = []


# =====================================================
# BEST MODEL TRACKING
# =====================================================

best_accuracy = 0.0
best_epoch = 0

early_stop_counter = 0


# =====================================================
# TRAINING LOOP
# =====================================================

for epoch in range(EPOCHS):

    print("\n")
    print(
        f"Epoch [{epoch + 1}/{EPOCHS}]"
    )

    print("-" * 70)


    # -------------------------------------------------
    # TRAIN
    # -------------------------------------------------

    train_loss, train_acc = (
        trainer.train_epoch()
    )


    # -------------------------------------------------
    # VALIDATION
    # -------------------------------------------------

    val_loss, val_acc = (
        trainer.validate_epoch()
    )


    # -------------------------------------------------
    # SCHEDULER
    # -------------------------------------------------

    scheduler.step(val_acc)


    # -------------------------------------------------
    # HISTORY
    # -------------------------------------------------

    train_losses.append(
        train_loss
    )

    train_accuracies.append(
        train_acc
    )

    val_losses.append(
        val_loss
    )

    val_accuracies.append(
        val_acc
    )


    # -------------------------------------------------
    # CURRENT LEARNING RATE
    # -------------------------------------------------

    current_lr = (
        optimizer.param_groups[0]["lr"]
    )


    # -------------------------------------------------
    # PRINT
    # -------------------------------------------------

    print(
        f"Train Loss    : {train_loss:.4f}"
    )

    print(
        f"Train Accuracy: {train_acc:.2f}%"
    )

    print(
        f"Val Loss      : {val_loss:.4f}"
    )

    print(
        f"Val Accuracy  : {val_acc:.2f}%"
    )

    print(
        f"Learning Rate : {current_lr:.6f}"
    )


    # =================================================
    # BEST MODEL
    # =================================================

    if val_acc > best_accuracy:

        best_accuracy = val_acc

        best_epoch = epoch + 1

        early_stop_counter = 0


        # ---------------------------------------------
        # Save best model weights
        # ---------------------------------------------

        torch.save(
            model.state_dict(),
            str(BEST_MODEL)
        )


        # ---------------------------------------------
        # Save checkpoint
        # ---------------------------------------------

        torch.save(
            {
                "epoch": epoch + 1,

                "model_state_dict":
                    model.state_dict(),

                "optimizer_state_dict":
                    optimizer.state_dict(),

                "best_accuracy":
                    best_accuracy,

            },
            str(CHECKPOINT)
        )


        print(
            "Best 8-class model saved."
        )


    else:

        early_stop_counter += 1

        print(
            f"No improvement "
            f"({early_stop_counter}/{PATIENCE})"
        )


    # =================================================
    # SAVE LAST MODEL
    # =================================================

    torch.save(
        model.state_dict(),
        str(LAST_MODEL)
    )


    # =================================================
    # EARLY STOPPING
    # =================================================

    if early_stop_counter >= PATIENCE:

        print(
            "\nEarly stopping activated."
        )

        break


# =====================================================
# LOAD BEST MODEL
# =====================================================

print("\n")
print("=" * 70)
print("LOADING BEST 8-CLASS MODEL")
print("=" * 70)


if not os.path.exists(BEST_MODEL):

    raise RuntimeError(
        "Best model was not created."
    )


best_state = torch.load(
    BEST_MODEL,
    map_location=device
)


model.load_state_dict(
    best_state
)


model.eval()


print(
    "Best model restored successfully."
)


# =====================================================
# VERIFY FINAL OUTPUT LAYER
# =====================================================

final_output_layer = (
    model.rfnn.network[10]
)


print(
    "\nFinal output layer:",
    final_output_layer
)


print(
    "Final number of classes:",
    final_output_layer.out_features
)


if (
    final_output_layer.out_features
    != NUM_CLASSES
):

    raise RuntimeError(
        "Final model class count does not "
        "match NUM_CLASSES."
    )


# =====================================================
# TEST EVALUATION
# =====================================================

print("\n")
print("=" * 70)
print("TESTING BEST 8-CLASS MODEL")
print("=" * 70)


predictions = trainer.predict(
    test_loader
)


# =====================================================
# TRUE LABELS
# =====================================================

true_labels = []


for _, labels in test_loader:

    true_labels.extend(
        labels.numpy()
    )


true_labels = np.array(
    true_labels
)


predictions = np.array(
    predictions
)


# =====================================================
# METRICS
# =====================================================

test_accuracy = (
    accuracy_score(
        true_labels,
        predictions
    )
    * 100
)


precision = precision_score(
    true_labels,
    predictions,
    average="weighted",
    zero_division=0
)


recall = recall_score(
    true_labels,
    predictions,
    average="weighted",
    zero_division=0
)


f1 = f1_score(
    true_labels,
    predictions,
    average="weighted",
    zero_division=0
)


# =====================================================
# PRINT METRICS
# =====================================================

print(
    f"\nTest Accuracy : "
    f"{test_accuracy:.2f}%"
)

print(
    f"Precision     : "
    f"{precision:.4f}"
)

print(
    f"Recall        : "
    f"{recall:.4f}"
)

print(
    f"F1 Score      : "
    f"{f1:.4f}"
)


# =====================================================
# CLASSIFICATION REPORT
# =====================================================

print("\n")
print("=" * 70)
print("CLASSIFICATION REPORT")
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
# CONFUSION MATRIX
# =====================================================

cm = confusion_matrix(
    true_labels,
    predictions
)


print("\n")
print("=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)


print(cm)


# =====================================================
# TRAINING HISTORY
# =====================================================

print("\n")
print("=" * 70)
print("TRAINING HISTORY")
print("=" * 70)


for epoch in range(
    len(train_losses)
):

    print(
        f"Epoch {epoch + 1:02d} | "
        f"Train Loss: "
        f"{train_losses[epoch]:.4f} | "
        f"Train Acc: "
        f"{train_accuracies[epoch]:.2f}% | "
        f"Val Loss: "
        f"{val_losses[epoch]:.4f} | "
        f"Val Acc: "
        f"{val_accuracies[epoch]:.2f}%"
    )


# =====================================================
# FINAL SUMMARY
# =====================================================

print("\n")
print("=" * 70)
print("8-CLASS TRAINING COMPLETED")
print("=" * 70)


print(
    f"Best Validation Accuracy : "
    f"{best_accuracy:.2f}%"
)


print(
    f"Best Epoch               : "
    f"{best_epoch}"
)


print(
    f"Final Test Accuracy      : "
    f"{test_accuracy:.2f}%"
)


print(
    f"Final Precision          : "
    f"{precision:.4f}"
)


print(
    f"Final Recall             : "
    f"{recall:.4f}"
)


print(
    f"Final F1 Score           : "
    f"{f1:.4f}"
)


print("\nBest Model:")
print(BEST_MODEL)


print("\nLast Model:")
print(LAST_MODEL)


print("\nCheckpoint:")
print(CHECKPOINT)


print("=" * 70)