import joblib
le = joblib.load('dataset/final/label_encoder.pkl')
print('classes_count=', len(le.classes_))
print('classes=', list(le.classes_))
