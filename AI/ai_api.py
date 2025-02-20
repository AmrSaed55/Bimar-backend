from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os # Import the os module for debugging

app = Flask(__name__)

# Debugging: Print the current working directory to check file locations
print("Current working directory:", os.getcwd())

try:
    model = joblib.load('doctor_specialty_model.joblib')
    symps = joblib.load('symptom_list.joblib')
except FileNotFoundError as e:
    print(f"Error loading model or symptoms: {e}")
    model = None
    symps = None

@app.route('/predict', methods=['POST'])
def predict():
    if model is None or symps is None:
        return jsonify({'error': 'Model or symptoms not loaded.'}), 500

    try:
        data = request.get_json()
        symptoms = data['symptoms']

        input_data = pd.DataFrame(0, columns=symps, index=[0])

        for symptom in symptoms:
            if symptom in symps:
                input_data[symptom] = 1

        prediction = model.predict(input_data)
        return jsonify({'prediction': prediction.tolist()})

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001) # Ensure the port is 5001