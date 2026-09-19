from pathlib import Path

# =====================================================
# PROJECT ROOT
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent

# =====================================================
# DATASET PATHS
# =====================================================

RAW_DATASET = BASE_DIR / "dataset" / "raw"
PROCESSED_DATASET = BASE_DIR / "dataset" / "processed"
FINAL_DATASET = BASE_DIR / "dataset" / "final"

# =====================================================
# MODEL PATH
# =====================================================

MODEL_DIR = BASE_DIR / "model" / "saved_model"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# =====================================================
# RANDOM SEED
# =====================================================

RANDOM_STATE = 42

# =====================================================
# DATA SPLIT
# =====================================================

TRAIN_SIZE = 0.70
VALID_SIZE = 0.15
TEST_SIZE = 0.15

# =====================================================
# MODEL
# =====================================================

INPUT_SIZE = 78
NUM_CLASSES = 10

# =====================================================
# TRAINING
# =====================================================

BATCH_SIZE = 64
EPOCHS = 30
LEARNING_RATE = 1e-3
WEIGHT_DECAY = 1e-4

# Early Stopping
PATIENCE = 5

# Gradient Clipping
MAX_GRAD_NORM = 1.0

# Scheduler
LR_FACTOR = 0.5
LR_PATIENCE = 2

# =====================================================
# SAVE FILES
# =====================================================

BEST_MODEL = MODEL_DIR / "hybrid_model.pth"
LAST_MODEL = MODEL_DIR / "last_model.pth"
CHECKPOINT = MODEL_DIR / "checkpoint.pth"