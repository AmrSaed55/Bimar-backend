from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)

# Disease-to-specialist mapping
disease_to_specialist = {
    "Allergy": "Allergist",  # أخصائي الحساسية
    "Peptic ulcer disease": "Gastroenterologist",  # أخصائي الجهاز الهضمي
    "Chronic cholestasis": "Hepatologist",  # أخصائي الكبد
    "Diabetes": "Endocrinologist",  # أخصائي الغدد الصماء
    "Bronchial Asthma": "Pulmonologist",  # أخصائي الرئة
    "Hypertension": "Cardiologist",  # أخصائي القلب
    "Migraine": "Neurologist",  # أخصائي الأعصاب
    "Cervical spondylosis": "Physical Medicine and Rehabilitation",  # الطب الطبيعي وإعادة التأهيل
    "Paralysis (brain hemorrhage)": "Neurologist",  # أخصائي الأعصاب
    "Jaundice": "Hepatologist",  # أخصائي الكبد
    "Malaria": "Internal Medicine",  # الطب الباطني
    "Chicken pox": "Internal Medicine",  # الطب الباطني
    "Dengue": "Internal Medicine",  # الطب الباطني
    "Typhoid": "Internal Medicine",  # الطب الباطني
    "Hepatitis A": "Hepatologist",  # أخصائي الكبد
    "Hepatitis B": "Hepatologist",  # أخصائي الكبد
    "Hepatitis C": "Hepatologist",  # أخصائي الكبد
    "Hepatitis D": "Hepatologist",  # أخصائي الكبد
    "Hepatitis E": "Hepatologist",  # أخصائي الكبد
    "Alcoholic hepatitis": "Hepatologist",  # أخصائي الكبد
    "Tuberculosis": "Pulmonologist",  # أخصائي الرئة
    "Common Cold": "Internal Medicine",  # الطب الباطني
    "Pneumonia": "Pulmonologist",  # أخصائي الرئة
    "Dimorphic hemorrhoids (piles)": "Gastroenterologist",  # أخصائي الجهاز الهضمي
    "Heart attack": "Cardiologist",  # أخصائي القلب
    "Varicose veins": "Phlebologist",  # أخصائي الأوردة
    "Hypothyroidism": "Endocrinologist",  # أخصائي الغدد الصماء
    "Hyperthyroidism": "Endocrinologist",  # أخصائي الغدد الصماء
    "Hypoglycemia": "Endocrinologist",  # أخصائي الغدد الصماء
    "Osteoarthritis": "Rheumatologist",  # أخصائي الروماتيزم
    "Arthritis": "Rheumatologist",  # أخصائي الروماتيزم
    "(vertigo) Paroxysmal Positional Vertigo": "Otolaryngologist",  # أخصائي الأنف والأذن والحنجرة
    "Acne": "Dermatologist",  # أخصائي الجلدية
    "Urinary tract infection": "Internal Medicine",  # الطب الباطني
    "Psoriasis": "Dermatologist",  # أخصائي الجلدية
    "Impetigo": "Dermatologist",  # أخصائي الجلدية
    "Fungal infection": "Dermatologist",  # أخصائي الجلدية
    "GERD": "Gastroenterologist",  # أخصائي الجهاز الهضمي
}

# Debugging: Print current working directory
print("Current working directory:", os.getcwd())

# Load the model and symptom list
try:
    model = joblib.load('doctor_specialty_model.joblib')
    symps = joblib.load('symptom_list.joblib')
    print("Model and symptoms loaded successfully.")
except FileNotFoundError as e:
    print(f"Error loading model or symptoms: {e}")
    model = None
    symps = None

@app.route('/predict', methods=['POST'])
def predict():
    if model is None or symps is None:
        return jsonify({'error': 'Model or symptoms not loaded.'}), 500

    try:
        # Get input data
        data = request.get_json()
        symptoms = data.get('symptoms', [])
        symptoms = [symptom.lower().replace(' ', '_').lstrip('_') for symptom in symptoms]  # Preprocess symptoms
        print("Received symptoms (after preprocessing):", symptoms)  # Debugging

        # Validate input
        if not symptoms:
            return jsonify({'error': 'No symptoms provided.'}), 400

        # Create input DataFrame
        input_data = pd.DataFrame(0, columns=symps, index=[0])
        for symptom in symptoms:
            if symptom in symps:
                input_data[symptom] = 1
            else:
                print(f"Warning: Symptom '{symptom}' not found in symptom list.")

        print("Input data for prediction:\n", input_data)  # Debugging

        # Make prediction
        prediction = model.predict(input_data)
        predicted_disease = prediction[0]
        print("Prediction (raw):", predicted_disease)  # Debugging: Print the exact predicted disease name

        # Normalize the predicted disease name
        predicted_disease = predicted_disease.strip().lower()  # Remove extra spaces and convert to lowercase
        print("Prediction (normalized):", predicted_disease)  # Debugging

        # Normalize dictionary keys for comparison
        normalized_disease_to_specialist = {k.strip().lower(): v for k, v in disease_to_specialist.items()}

        # Get the corresponding specialist
        specialist = normalized_disease_to_specialist.get(predicted_disease, "Internal Medicine")  # Default to Internal Medicine if disease not found
        print("Corresponding specialist:", specialist)  # Debugging

        return jsonify({
            'prediction': predicted_disease,
            'specialist': specialist
        })

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)