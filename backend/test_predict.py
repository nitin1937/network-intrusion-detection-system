from predictor import predict_attack

# Dummy feature vector (79 values)
features = [0.0] * 79

prediction, confidence = predict_attack(features)

print("Prediction :", prediction)
print("Confidence :", confidence)