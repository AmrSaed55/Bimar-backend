export const getHeadSymptoms = (req, res) => {
    const symptoms = [
        "headache", "blurred_and_distorted_vision", "dizziness", "altered_sensorium",
        "loss_of_balance", "loss_of_smell", "visual_disturbances", "spinning_movements",
        "slurred_speech", "stiff_neck", "unsteadiness"
    ];
    res.json(symptoms);
};

export const getChestSymptoms = (req, res) => {
    const symptoms = [
        "chest_pain", "breathlessness", "cough", "congestion", "continuous_sneezing",
        "rusty_sputum", "phlegm", "blood_in_sputum"
    ];
    res.json(symptoms);
};

export const getStomachSymptoms = (req, res) => {
    const symptoms = [
        "abdominal_pain", "belly_pain", "acidity", "indigestion", "nausea", "vomiting",
        "diarrhoea", "constipation", "stomach_pain", "stomach_bleeding", "passage_of_gases",
        "irritation_in_anus", "pain_during_bowel_movements", "pain_in_anal_region"
    ];
    res.json(symptoms);
};

export const getLimbSymptoms = (req, res) => {
    const symptoms = [
        "joint_pain", "muscle_pain", "muscle_weakness", "muscle_wasting", "painful_walking",
        "knee_pain", "hip_joint_pain", "weakness_in_limbs", "swelling_joints",
        "swelling_of_stomach", "swollen_legs", "swollen_extremeties", "movement_stiffness"
    ];
    res.json(symptoms);
};

export const getSkinSymptoms = (req, res) => {
    const symptoms = [
        "itching", "skin_rash", "patches_in_throat", "silver_like_dusting", "scurring",
        "blackheads", "blister", "pus_filled_pimples", "skin_peeling", "red_spots_over_body",
        "red_sore_around_nose", "inflammatory_nails", "brittle_nails", "small_dents_in_nails"
    ];
    res.json(symptoms);
};

export const getGeneralSymptoms = (req, res) => {
    const symptoms = [
        "high_fever", "mild_fever", "sweating", "chills", "fatigue", "lethargy", "malaise",
        "weight_gain", "weight_loss", "dehydration", "restlessness", "mood_swings",
        "anxiety", "depression", "lack_of_concentration", "fast_heart_rate", "palpitations"
    ];
    res.json(symptoms);
};

export const getAllSymptoms = (req, res) => {
    const symptoms = [
        "abdominal_pain", "abnormal_menstruation", "acidity", "acute_liver_failure",
        "altered_sensorium", "anxiety", "back_pain", "belly_pain", "blackheads",
        "bladder_discomfort", "blister", "blood_in_sputum", "bloody_stool",
        "blurred_and_distorted_vision", "breathlessness", "brittle_nails", "bruising",
        "burning_micturition", "chest_pain", "chills", "cold_hands_and_feets", "coma",
        "congestion", "constipation", "continuous_feel_of_urine", "continuous_sneezing",
        "cough", "cramps", "dark_urine", "dehydration", "depression", "diarrhoea",
        "dischromic_patches", "distention_of_abdomen", "dizziness", "drying_and_tingling_lips",
        "enlarged_thyroid", "excessive_hunger", "extra_marital_contacts", "family_history",
        "fast_heart_rate", "fatigue", "fluid_overload", "foul_smell_of_urine", "headache",
        "high_fever", "hip_joint_pain", "history_of_alcohol_consumption", "increased_appetite",
        "indigestion", "inflammatory_nails", "internal_itching", "irregular_sugar_level",
        "irritability", "irritation_in_anus", "joint_pain", "knee_pain", "lack_of_concentration",
        "lethargy", "loss_of_appetite", "loss_of_balance", "loss_of_smell", "malaise",
        "mild_fever", "mood_swings", "movement_stiffness", "mucoid_sputum", "muscle_pain",
        "muscle_wasting", "muscle_weakness", "nausea", "neck_pain", "nodal_skin_eruptions",
        "obesity", "pain_behind_the_eyes", "pain_during_bowel_movements", "pain_in_anal_region",
        "painful_walking", "palpitations", "passage_of_gases", "patches_in_throat", "phlegm",
        "polyuria", "prominent_veins_on_calf", "puffy_face_and_eyes", "pus_filled_pimples",
        "receiving_blood_transfusion", "receiving_unsterile_injections", "red_sore_around_nose",
        "red_spots_over_body", "redness_of_eyes", "restlessness", "runny_nose", "rusty_sputum",
        "scurring", "shivering", "silver_like_dusting", "sinus_pressure", "skin_peeling",
        "skin_rash", "slurred_speech", "small_dents_in_nails", "spinning_movements",
        "spotting_urination", "stiff_neck", "stomach_bleeding", "stomach_pain", "sunken_eyes",
        "sweating", "swelled_lymph_nodes", "swelling_joints", "swelling_of_stomach",
        "swollen_blood_vessels", "swollen_extremeties", "swollen_legs", "throat_irritation",
        "toxic_look_(typhos)", "ulcers_on_tongue", "unsteadiness", "visual_disturbances",
        "vomiting", "watering_from_eyes", "weakness_in_limbs", "weakness_of_one_body_side",
        "weight_gain", "weight_loss", "yellow_crust_ooze", "yellow_urine", "yellowing_of_eyes",
        "yellowish_skin", "itching"
    ];
    res.json(symptoms);
};
