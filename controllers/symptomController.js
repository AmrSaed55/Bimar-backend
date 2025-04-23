// Head & Neurological Symptoms
export const getHeadSymptoms = (req, res) => {
    const symptoms = [
        "headache", "frontal_headache", "dizziness", "fainting", "seizures",
        "diminished_hearing", "slurring_words", "stuttering_or_stammering",
        "difficulty_speaking", "disturbance_of_memory", "loss_of_sensation",
        "paresthesia", "focal_weakness", "loss_of_balance", "sleepwalking",
        "abnormal_involuntary_movements", "disturbance_of_smell_or_taste",
        "nose_deformity", "sore_in_nose", "redness_in_or_around_nose",
        "nosebleed", "nasal_congestion", "sinus_congestion", "painful_sinuses",
        "neck_pain", "neck_mass", "neck_swelling", "neck_weakness",
        "neck_stiffness_or_tightness", "neck_cramps_or_spasms",
        "jaw_pain", "jaw_swelling", "lump_over_jaw", "facial_pain",
        "symptoms_of_the_face", "ear_pain", "pus_draining_from_ear",
        "ringing_in_ear", "plugged_feeling_in_ear", "itchy_ear",
        "fluid_in_ear", "abnormal_size_or_shape_of_ear", "mass_on_ear",
        "bleeding_from_ear", "coryza", "pulling_at_ears"
    ];
    res.json(symptoms);
};

// Vision & Eye Symptoms
export const getEyeSymptoms = (req, res) => {
    const symptoms = [
        "diminished_vision", "double_vision", "eye_deviation", "cross_eyed",
        "eye_pain", "eye_redness", "eye_strain", "eye_burns_or_stings",
        "eye_moves_abnormally", "bleeding_from_eye", "white_discharge_from_eye",
        "foreign_body_sensation_in_eye", "itchiness_of_eye", "lacrimation",
        "spots_or_clouds_in_vision", "blindness", "cloudy_eye",
        "eyelid_swelling", "eyelid_lesion_or_rash", "eyelid_retracted",
        "mass_on_eyelid", "itchy_eyelid", "swollen_eye", 
        "abnormal_movement_of_eyelid", "symptoms_of_eye", "pupils_unequal"
    ];
    res.json(symptoms);
};

// Respiratory & Chest Symptoms
export const getChestSymptoms = (req, res) => {
    const symptoms = [
        "abnormal_breathing_sounds", "wheezing", "hurts_to_breath", "apnea",
        "cough", "coughing_up_sputum", "hemoptysis", "congestion_in_chest",
        "pus_in_sputum", "rib_pain", "decreased_heart_rate", "increased_heart_rate",
        "irregular_heartbeat", "palpitations", "peripheral_edema",
        "poor_circulation", "heartburn"
    ];
    res.json(symptoms);
};

// Digestive & Abdominal Symptoms
export const getDigestiveSymptoms = (req, res) => {
    const symptoms = [
        "abdominal_pain", "sharp_abdominal_pain", "burning_abdominal_pain",
        "upper_abdominal_pain", "lower_abdominal_pain", "side_pain",
        "stomach_bloating", "abdominal_distention", "swollen_abdomen",
        "nausea", "vomiting", "vomiting_blood", "regurgitation",
        "difficulty_eating", "decreased_appetite", "excessive_appetite",
        "flatulence", "constipation", "diarrhea", "blood_in_stool",
        "melena", "changes_in_stool_appearance", "discharge_in_stools",
        "incontinence_of_stool", "irregular_belly_button"
    ];
    res.json(symptoms);
};

// Throat & Mouth Symptoms
export const getThroatAndMouthSymptoms = (req, res) => {
    const symptoms = [
        "sore_throat", "hoarse_voice", "throat_swelling", "throat_feels_tight",
        "lump_in_throat", "difficulty_in_swallowing", "throat_irritation",
        "drainage_in_throat", "throat_redness", "swollen_or_red_tonsils",
        "mouth_pain", "mouth_ulcer", "mouth_dryness", "toothache",
        "bleeding_gums", "pain_in_gums", "tongue_pain", "tongue_bleeding",
        "tongue_lesions", "abnormal_appearing_tongue", "swollen_tongue",
        "lip_swelling", "lip_sore", "dry_lips"
    ];
    res.json(symptoms);
};

// Stomach-Specific Symptoms
export const getStomachSymptoms = (req, res) => {
    const symptoms = [
        "abdominal_pain", "belly_pain", "acidity", "indigestion", "nausea", "vomiting",
        "diarrhoea", "constipation", "stomach_pain", "stomach_bleeding", "passage_of_gases",
        "irritation_in_anus", "pain_during_bowel_movements", "pain_in_anal_region"
    ];
    res.json(symptoms);
};

// Limb Symptoms
export const getLimbSymptoms = (req, res) => {
    const symptoms = [
        "joint_pain", "muscle_pain", "muscle_weakness", "muscle_wasting", "painful_walking",
        "knee_pain", "hip_joint_pain", "weakness_in_limbs", "swelling_joints",
        "swelling_of_stomach", "swollen_legs", "swollen_extremeties", "movement_stiffness"
    ];
    res.json(symptoms);
};

// Skin & Hair Symptoms
export const getSkinSymptoms = (req, res) => {
    const symptoms = [
        "skin_rash", "skin_swelling", "skin_lesion", "skin_growth",
        "skin_irritation", "skin_pain", "itching_of_skin", "skin_moles",
        "change_in_skin_mole_size_or_color", "abnormal_appearing_skin",
        "skin_dryness_peeling_scaliness_or_roughness", "skin_oiliness",
        "skin_on_arm_or_hand_looks_infected", "skin_on_leg_or_foot_looks_infected",
        "skin_on_head_or_neck_looks_infected", "wrinkles_on_skin",
        "irregular_appearing_scalp", "dry_or_flaky_scalp", "itchy_scalp",
        "unwanted_hair", "too_little_hair", "acne_or_pimples", "warts",
        "irregular_appearing_nails", "nailbiting", "diaper_rash",
        "allergic_reaction"
    ];
    res.json(symptoms);
};

// Mental & Behavioral Symptoms
export const getMentalSymptoms = (req, res) => {
    const symptoms = [
        "anxiety_and_nervousness", "depression", "depressive_or_psychotic_symptoms",
        "emotional_symptoms", "hostile_behavior", "antisocial_behavior",
        "hysterical_behavior", "low_self_esteem", "obsessions_and_compulsions",
        "delusions_or_hallucinations", "drug_abuse", "abusing_alcohol",
        "smoking_problems", "fears_and_phobias", "temper_problems", "insomnia",
        "sleepiness", "nightmares", "restlessness", "irritable_infant",
        "loss_of_sex_drive", "problems_with_orgasm"
    ];
    res.json(symptoms);
};

// General & Systemic Symptoms
export const getGeneralSymptoms = (req, res) => {
    const symptoms = [
        "fever", "chills", "sweating", "fatigue", "weakness", "malaise",
        "feeling_ill", "feeling_hot", "feeling_cold", "feeling_hot_and_cold",
        "weight_gain", "weight_loss", "recent_weight_loss", "underweight",
        "fluid_retention", "dehydration", "excessive_growth", "lack_of_growth",
        "pallor", "flushing", "jaundice", "swollen_lymph_nodes", "ache_all_over",
        "stiffness_all_over", "problems_with_movement", "flu_like_syndrome",
        "thirst", "excessive_anger", "allergic_reaction", "lymphedema"
    ];
    res.json(symptoms);
};

// Urinary & Reproductive Symptoms
export const getUrinaryReproductiveSymptoms = (req, res) => {
    const symptoms = [
        "painful_urination", "frequent_urination", "blood_in_urine", 
        "retention_of_urine", "low_urine_output", "pus_in_urine",
        "involuntary_urination", "polyuria", "bedwetting", "hesitancy",
        "symptoms_of_bladder", "bladder_mass", "unusual_color_or_odor_to_urine",
        "vaginal_itching", "vaginal_dryness", "vaginal_pain", "vaginal_redness",
        "vaginal_discharge", "vulvar_irritation", "vulvar_sore",
        "pain_during_intercourse", "intermenstrual_bleeding", "heavy_menstrual_flow",
        "scanty_menstrual_flow", "painful_menstruation", "absence_of_menstruation",
        "frequent_menstruation", "unpredictable_menstruation", "premenstrual_tension_or_irritability",
        "vaginal_bleeding_after_menopause", "early_or_late_onset_of_menopause",
        "penis_pain", "penis_redness", "penile_discharge", "bumps_on_penis",
        "premature_ejaculation", "impotence", "loss_of_sex_drive",
        "problems_with_orgasm", "infertility"
    ];
    res.json(symptoms);
};

// Musculoskeletal Symptoms
export const getMusculoskeletalSymptoms = (req, res) => {
    const symptoms = [
        "joint_pain", "muscle_pain", "muscle_weakness", "muscle_swelling",
        "muscle_stiffness_or_tightness", "muscle_cramps_contractures_or_spasms",
        "joint_swelling", "joint_stiffness_or_tightness", "bones_are_painful",
        "shoulder_pain", "shoulder_weakness", "shoulder_stiffness_or_tightness",
        "shoulder_swelling", "shoulder_cramps_or_spasms", "shoulder_lump_or_mass",
        "arm_pain", "arm_weakness", "arm_stiffness_or_tightness", "arm_swelling",
        "arm_cramps_or_spasms", "arm_lump_or_mass", "elbow_pain", "elbow_weakness",
        "elbow_stiffness_or_tightness", "elbow_swelling", "elbow_cramps_or_spasms",
        "elbow_lump_or_mass", "wrist_pain", "wrist_weakness", "wrist_swelling",
        "wrist_stiffness_or_tightness", "wrist_lump_or_mass",
        "hand_or_finger_pain", "hand_or_finger_weakness", "hand_or_finger_swelling",
        "hand_or_finger_stiffness_or_tightness", "hand_or_finger_cramps_or_spasms",
        "hand_or_finger_lump_or_mass", "hip_pain", "hip_weakness",
        "hip_stiffness_or_tightness", "hip_swelling", "hip_lump_or_mass",
        "leg_pain", "leg_weakness", "leg_swelling", "leg_stiffness_or_tightness",
        "leg_cramps_or_spasms", "leg_lump_or_mass", "knee_pain", "knee_weakness",
        "knee_swelling", "knee_stiffness_or_tightness", "knee_cramps_or_spasms",
        "knee_lump_or_mass", "ankle_pain", "ankle_weakness", "ankle_swelling",
        "ankle_stiffness_or_tightness", "foot_or_toe_pain", "foot_or_toe_weakness",
        "foot_or_toe_swelling", "foot_or_toe_stiffness_or_tightness",
        "foot_or_toe_cramps_or_spasms", "foot_or_toe_lump_or_mass",
        "back_pain", "back_weakness", "back_stiffness_or_tightness",
        "back_swelling", "back_cramps_or_spasms", "back_mass_or_lump",
        "low_back_pain", "low_back_weakness", "low_back_stiffness_or_tightness",
        "low_back_swelling", "low_back_cramps_or_spasms"
    ];
    res.json(symptoms);
};

// Pregnancy & Reproductive Health
export const getPregnancySymptoms = (req, res) => {
    const symptoms = [
        "pain_during_pregnancy", "problems_during_pregnancy",
        "spotting_or_bleeding_during_pregnancy", "recent_pregnancy",
        "uterine_contractions", "pelvic_pressure", "pelvic_pain",
        "blood_clots_during_menstrual_periods", "long_menstrual_periods",
        "problems_with_shape_or_size_breast", "bleeding_or_discharge_from_nipple",
        "pain_or_soreness_of_breast", "lump_or_mass_of_breast",
        "postpartum_problems_of_the_breast"
    ];
    res.json(symptoms);
};

// Get All Symptoms (Including Stomach & Limb Symptoms)
export const getAllSymptoms = (req, res) => {
    const allSymptoms = [
        ...getHeadSymptoms({}, {json: (data) => data}),
        ...getEyeSymptoms({}, {json: (data) => data}),
        ...getChestSymptoms({}, {json: (data) => data}),
        ...getDigestiveSymptoms({}, {json: (data) => data}),
        ...getThroatAndMouthSymptoms({}, {json: (data) => data}),
        ...getStomachSymptoms({}, {json: (data) => data}),       // Added
        ...getLimbSymptoms({}, {json: (data) => data}),          // Added
        ...getSkinSymptoms({}, {json: (data) => data}),
        ...getUrinaryReproductiveSymptoms({}, {json: (data) => data}),
        ...getMusculoskeletalSymptoms({}, {json: (data) => data}),
        ...getGeneralSymptoms({}, {json: (data) => data}),
        ...getPregnancySymptoms({}, {json: (data) => data}),
        ...getMentalSymptoms({}, {json: (data) => data})
    ];

    // Remove duplicates and sort
    const uniqueSymptoms = [...new Set(allSymptoms)].sort();
    res.json(uniqueSymptoms);
};