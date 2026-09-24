from typing import List, Dict, Any, Optional

CLINICAL_CASES: List[Dict[str, Any]] = [
    {
        "id": "case-acs-1",
        "title": "Acute Crushing Retrosternal Chest Pain",
        "shortDescription": "58-year-old male with sudden onset substernal chest heaviness, diaphoresis, and radiation to the left jaw.",
        "specialty": "Cardiology",
        "difficulty": "Intermediate",
        "estimatedMinutes": 15,
        "tags": ["Chest Pain", "Cardiology", "Emergency", "ECG Interpretation", "OSCE Core"],
        "learningObjectives": [
            "Conduct a focused cardiac history adhering to OPQRST methodology.",
            "Differentiate between ACS, Aortic Dissection, Pulmonary Embolism, and GERD.",
            "Appropriately order and interpret 12-lead ECG and High-Sensitivity Cardiac Troponin.",
            "Initiate immediate guideline-directed medical therapy for Acute Coronary Syndrome."
        ],
        "triageNurseNote": "58yo male presented by EMS triage after calling 911 at his office. States heavy crushing sensation in center of chest starting 45 mins ago while climbing stairs. Looks visibly pale and sweaty. Triage vitals recorded.",
        "patient": {
            "id": "pt-robert-chen",
            "name": "Robert Chen",
            "age": 58,
            "gender": "Male",
            "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            "occupation": "Architectural Project Manager",
            "presentationComplaint": "Severe pressure and heaviness in my chest that started less than an hour ago.",
            "initialStatement": "Doctor, please... It feels like an elephant is sitting right in the middle of my chest. I started feeling dizzy and breaking out in a cold sweat on my way into the office.",
            "mood": "Anxious, pale, clutching center of chest with a closed fist (Levine sign)",
            "appearance": "Diaphoretic, breathing shallowly, speech interrupted by discomfort."
        },
        "initialVitals": {
            "heartRate": 98,
            "bloodPressure": "154/94",
            "respiratoryRate": 20,
            "oxygenSaturation": 97,
            "temperature": 37.1,
            "painScore": 8
        },
        "physicalFindings": [
            {
                "id": "exam-cv",
                "system": "Cardiovascular",
                "name": "Precordial & Heart Auscultation",
                "actionLabel": "Auscultate S1, S2, murmurs, gallops & inspect JVP",
                "findingDescription": "Tachycardic regular rhythm. S1 and S2 present. Soft S4 gallop audible at apex. No pericardial friction rub. JVP estimated at 3 cm above sternal angle at 45 degrees. Peripheral pulses equal and palpable bilaterally.",
                "isAbnormal": True,
                "clinicalSignificance": "S4 gallop reflects decreased left ventricular compliance secondary to acute myocardial ischemia."
            },
            {
                "id": "exam-pulm",
                "system": "Respiratory",
                "name": "Lung Auscultation & Chest Wall Palpation",
                "actionLabel": "Auscultate all lung fields bilaterally & palpate chest wall",
                "findingDescription": "Clear to auscultation bilaterally. No wheezing, rhonchi, or basilar crackles. Chest wall tenderness is absent; pain is NOT reproducible with manual palpation of costochondral junctions.",
                "isAbnormal": False,
                "clinicalSignificance": "Absence of chest wall tenderness rules against costochondritis; clear lung fields indicate no acute cardiogenic pulmonary edema at present."
            },
            {
                "id": "exam-abdomen",
                "system": "Abdominal",
                "name": "Abdominal Palpation & Epigastric Exam",
                "actionLabel": "Palpate epigastrium and RUQ, auscultate bowel sounds",
                "findingDescription": "Soft, non-tender, non-distended. No guarding, rebound, or organomegaly. No pulsatile abdominal mass detected.",
                "isAbnormal": False,
                "clinicalSignificance": "Non-tender abdomen reduces likelihood of acute perforated peptic ulcer or cholecystitis masquerading as lower chest pain."
            },
            {
                "id": "exam-general",
                "system": "General / HEENT",
                "name": "General Appearance & Diaphoresis",
                "actionLabel": "Assess skin perfusion, capillary refill, and mucous membranes",
                "findingDescription": "Cool, clammy extremities with marked forehead and palmar diaphoresis. Capillary refill approximately 2.5 seconds. Pupils equal and reactive. Mucous membranes moist.",
                "isAbnormal": True,
                "clinicalSignificance": "Significant sympathetic autonomic activation typical in acute myocardial ischemia."
            },
            {
                "id": "exam-neuro",
                "system": "Neurological",
                "name": "Gross Neurological Exam",
                "actionLabel": "Evaluate gross motor strength, facial symmetry, and speech",
                "findingDescription": "Alert and fully oriented x 4. Cranial nerves II-XII grossly intact. No focal motor weakness, facial droop, or dysarthria.",
                "isAbnormal": False,
                "clinicalSignificance": "Baseline neuro status intact prior to initiating anticoagulation/antiplatelet therapies."
            }
        ],
        "investigations": [
            {
                "id": "inv-ecg",
                "category": "Cardiology / Point-of-Care",
                "name": "12-Lead Electrocardiogram (STAT)",
                "turnaroundMinutes": 2,
                "value": "ST Elevation in II, III, aVF",
                "interpretation": "Sinus rhythm at 96 bpm. 2.5mm ST-segment elevation in leads II, III, and aVF with reciprocal ST depression in leads I and aVL. Hyperacute T-waves in inferior leads.",
                "isAbnormal": True,
                "imageUrl": "ecg_inferior_stemi",
                "findingsDetail": [
                    "Acute ST-segment Elevation Myocardial Infarction (Inferior STEMI - Right Coronary Artery territory).",
                    "Reciprocal changes in high lateral leads (I, aVL).",
                    "PR interval normal; QRS duration 86 ms."
                ]
            },
            {
                "id": "inv-troponin",
                "category": "Laboratory",
                "name": "High-Sensitivity Cardiac Troponin I (hs-cTnI)",
                "turnaroundMinutes": 20,
                "normalRange": "< 14 ng/L",
                "value": "185 ng/L (Markedly Elevated)",
                "interpretation": "Positive for acute myocardial necrosis. Baseline initial rise observed 50 mins post-symptom onset.",
                "isAbnormal": True,
                "findingsDetail": [
                    "Significant elevation above 99th percentile upper reference limit. Diagnostic of acute myocardial injury."
                ]
            },
            {
                "id": "inv-cxr",
                "category": "Imaging",
                "name": "Portable Chest Radiograph (CXR)",
                "turnaroundMinutes": 15,
                "interpretation": "Normal cardiothoracic ratio. No widening of the superior mediastinum. Clear lung parenchymal fields with no focal consolidations, pneumothorax, or pulmonary vascular congestion.",
                "isAbnormal": False,
                "findingsDetail": [
                    "Mediastinal contour normal (helps exclude Stanford Type A Aortic Dissection).",
                    "No pneumothorax or rib fractures."
                ]
            },
            {
                "id": "inv-cbc-bmp",
                "category": "Laboratory",
                "name": "Complete Blood Count & Basic Metabolic Panel",
                "turnaroundMinutes": 25,
                "interpretation": "WBC 9.8 x10^9/L, Hemoglobin 14.8 g/dL, Platelets 260 x10^9/L. Sodium 140 mEq/L, Potassium 4.1 mEq/L, Creatinine 0.9 mg/dL, Glucose 138 mg/dL.",
                "isAbnormal": False,
                "findingsDetail": [
                    "Renal function preserved (eGFR > 60 mL/min/1.73m²), safe for urgent coronary angiographic contrast."
                ]
            },
            {
                "id": "inv-ddimer",
                "category": "Laboratory",
                "name": "D-Dimer (Quantitative)",
                "turnaroundMinutes": 30,
                "normalRange": "< 500 ng/mL FEU",
                "value": "310 ng/mL",
                "interpretation": "Within normal limits. High negative predictive value for pulmonary embolism and acute aortic dissection in this clinical context.",
                "isAbnormal": False,
                "findingsDetail": [
                    "Normal D-Dimer lowers probability of massive/submassive pulmonary embolism."
                ]
            }
        ],
        "diagnosisOptions": [
            {
                "id": "dx-stemi",
                "name": "ST-Elevation Myocardial Infarction (Inferior STEMI)",
                "icdCode": "I21.19",
                "category": "Cardiovascular",
                "isCorrectPrimary": True,
                "isHighDifferential": True,
                "rationale": "Substernal pressure radiating to jaw with diaphoresis, confirmed by ST elevations in II, III, aVF with reciprocal depressions and elevated troponin."
            },
            {
                "id": "dx-dissection",
                "name": "Acute Aortic Dissection (Type A)",
                "icdCode": "I71.01",
                "category": "Vascular",
                "isCorrectPrimary": False,
                "isHighDifferential": True,
                "rationale": "Must always be in the differential for acute chest pain, but less likely given absence of tearing back pain, equal bilateral pulses, and normal mediastinum on CXR."
            },
            {
                "id": "dx-pe",
                "name": "Pulmonary Embolism",
                "icdCode": "I26.9",
                "category": "Pulmonary",
                "isCorrectPrimary": False,
                "isHighDifferential": False,
                "rationale": "Possible cause of acute chest discomfort, but typically pleuritic with tachycardia, hypoxia, and normal troponin/D-Dimer."
            },
            {
                "id": "dx-gerd",
                "name": "Gastroesophageal Reflux Disease / Esophageal Spasm",
                "icdCode": "K21.9",
                "category": "Gastrointestinal",
                "isCorrectPrimary": False,
                "isHighDifferential": False,
                "rationale": "Can cause retrosternal pain, but does not explain diaphoresis, S4 gallop, marked ST elevations, or elevated troponin."
            },
            {
                "id": "dx-costo",
                "name": "Costochondritis / Musculoskeletal Chest Pain",
                "icdCode": "M94.0",
                "category": "Musculoskeletal",
                "isCorrectPrimary": False,
                "isHighDifferential": False,
                "rationale": "Pain was not reproducible by palpation and patient has objective ischemic ECG changes."
            }
        ],
        "managementProtocols": [
            {
                "id": "mgmt-aspirin",
                "label": "Administer Chewable Aspirin 324 mg immediately",
                "isCorrect": True,
                "feedback": "Essential immediate antiplatelet therapy in suspected ACS to reduce mortality."
            },
            {
                "id": "mgmt-cath",
                "label": "Activate Cardiac Catheterization Lab for Emergent PCI (<90 min door-to-balloon)",
                "isCorrect": True,
                "feedback": "Definitive primary reperfusion strategy for acute inferior STEMI."
            },
            {
                "id": "mgmt-p2y12",
                "label": "Loading dose of P2Y12 inhibitor (Ticagrelor 180 mg or Clopidogrel 600 mg)",
                "isCorrect": True,
                "feedback": "Dual antiplatelet therapy reduces stent thrombosis and ischemic events."
            },
            {
                "id": "mgmt-heparin",
                "label": "IV Anticoagulation (Unfractionated Heparin bolus + infusion)",
                "isCorrect": True,
                "feedback": "Prevents thrombus propagation before and during percutaneous intervention."
            },
            {
                "id": "mgmt-nitro-caution",
                "label": "Sublingual Nitroglycerin with Right Ventricular lead check precaution",
                "isCorrect": True,
                "feedback": "Nitrates provide symptom relief, but must check right-sided leads (V4R) to avoid severe hypotension in inferior/RV infarction."
            },
            {
                "id": "mgmt-nsaids",
                "label": "High-dose Ibuprofen or Ketorolac IV for pain control",
                "isCorrect": False,
                "feedback": "NSAIDs (except aspirin) are contraindicated in acute MI due to increased risk of mortality, reinfarction, and cardiac rupture."
            }
        ],
        "facts": {
            "onset": "Started approximately 45 minutes ago while walking up two flights of stairs to his office desk.",
            "provocationPalliative": "Worse with minimal exertion. Stopping and resting in his chair did not relieve the tightness at all.",
            "quality": "Deep, tight, crushing pressure; feels like a vice grip or heavy weight pressing down on his chest bone.",
            "radiation": "Radiates up into the left side of his jaw, lower teeth, and down the inner aspect of his left arm.",
            "severity": "Rates it an 8 out of 10 in severity right now, previously 9/10 at peak.",
            "timing": "Continuous and unremitting since it began 45 minutes ago.",
            "associatedSymptoms": [
                "Profuse cold sweats (diaphoresis)",
                "Mild lightheadedness",
                "Nausea without vomiting",
                "Shortness of breath"
            ],
            "pertinentNegatives": [
                "No sharp pleuritic pain with breathing",
                "No sudden tearing pain between shoulder blades",
                "No fever or chills",
                "No calf swelling or recent long-distance travel"
            ],
            "pastMedicalHistory": [
                "Essential Hypertension diagnosed 6 years ago",
                "Hyperlipidemia (elevated LDL)",
                "No prior heart attack or stroke"
            ],
            "medications": [
                "Amlodipine 5 mg daily",
                "Atorvastatin 20 mg daily (admits to missing doses frequently)"
            ],
            "allergies": [
                "No known drug allergies (NKDA)"
            ],
            "familyHistory": [
                "Father had a fatal myocardial infarction at age 52; Mother has type 2 diabetes."
            ],
            "socialHistory": [
                "Smokes 0.5 packs per day for 25 years (12.5 pack-years)",
                "Drinks 1-2 glasses of wine on weekends",
                "Denies illicit drug use, including cocaine or amphetamines."
            ],
            "reviewOfSystems": {
                "constitutional": "Diaphoretic, anxious, denies fever or weight loss.",
                "cardiac": "Crushing retrosternal pain radiating to jaw and left arm, mild palpitations.",
                "respiratory": "Short of breath, no cough, no hemoptysis.",
                "gi": "Mild nausea, denies vomiting, heartburn, or dysphagia.",
                "msk": "No joint swelling or focal trauma."
            }
        },
        "scoringRubric": {
            "criticalActions": [
                "Recognized inferior STEMI on 12-lead ECG within 10 minutes",
                "Ordered STAT Chewable Aspirin and Anticoagulation",
                "Activated Cath Lab for Emergent Percutaneous Coronary Intervention"
            ],
            "highValueQuestions": [
                "Onset and duration of chest discomfort",
                "Character and quality of pain (pressure vs sharp)",
                "Radiation to jaw, neck, or left arm",
                "Presence of diaphoresis, nausea, or shortness of breath",
                "Cardiac risk factors: smoking, hypertension, family history of early CAD",
                "Screening for cocaine or stimulant use"
            ],
            "redFlagsToScreen": [
                "Sudden tearing pain radiating to back (Aortic Dissection)",
                "Pleuritic sharp pain with calf swelling or immobility (PE)",
                "Syncope or profound hypotensive collapse"
            ]
        }
    },
    {
        "id": "case-dyspnea-2",
        "title": "Acute Severe Dyspnea & Expiratory Wheezing",
        "shortDescription": "34-year-old female with sudden worsening shortness of breath, audible wheezing, and poor response to rescue inhaler.",
        "specialty": "Pulmonology",
        "difficulty": "Novice",
        "estimatedMinutes": 12,
        "tags": ["Shortness of Breath", "Pulmonology", "Asthma Exacerbation", "Respiratory Care"],
        "learningObjectives": [
            "Assess severity of acute bronchospasm through clinical observation and speech fluency.",
            "Elicit asthma triggers, past intubation/ICU history, and inhaler adherence.",
            "Order peak expiratory flow, chest X-ray, and arterial blood gas when indicated.",
            "Formulate immediate medical management (bronchodilators, systemic corticosteroids)."
        ],
        "triageNurseNote": "34yo female arrives in urgent distress. Speaks in 3 to 4 word sentences. Wheezing audible without stethoscope. Took 4 puffs of albuterol at home with minimal relief.",
        "patient": {
            "id": "pt-elena-rostova",
            "name": "Elena Rostova",
            "age": 34,
            "gender": "Female",
            "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
            "occupation": "Graphic Designer",
            "presentationComplaint": "I cannot catch my breath... my chest feels so tight.",
            "initialStatement": "Doctor... (gasp)... I used my blue inhaler... four times... it's not opening my chest... feels like breathing through a crushed straw.",
            "mood": "Distressed, sitting forward in tripod position, using accessory neck muscles",
            "appearance": "Tachypneic, intercostal retractions visible, speaking in short broken phrases."
        },
        "initialVitals": {
            "heartRate": 112,
            "bloodPressure": "128/82",
            "respiratoryRate": 28,
            "oxygenSaturation": 91,
            "temperature": 36.9,
            "painScore": 3
        },
        "physicalFindings": [
            {
                "id": "exam-pulm-elena",
                "system": "Respiratory",
                "name": "Pulmonary Auscultation & Mechanics",
                "actionLabel": "Auscultate anterior/posterior lung fields & observe respiratory effort",
                "findingDescription": "Marked diffuse expiratory wheezing throughout all lung fields with prolonged expiratory phase. Supraclavicular and intercostal retractions noted. No stridor.",
                "isAbnormal": True,
                "clinicalSignificance": "Severe generalized bronchospasm with high work of breathing."
            },
            {
                "id": "exam-cv-elena",
                "system": "Cardiovascular",
                "name": "Cardiovascular Exam",
                "actionLabel": "Check rhythm, pulses, and pulsus paradoxus",
                "findingDescription": "Sinus tachycardia at 112 bpm. Normal S1 and S2, no murmurs. Pulsus paradoxus measured at approximately 14 mmHg.",
                "isAbnormal": True,
                "clinicalSignificance": "Pulsus paradoxus > 12 mmHg indicates severe airflow obstruction and significant intrathoracic pressure swings."
            },
            {
                "id": "exam-heent-elena",
                "system": "General / HEENT",
                "name": "HEENT & Upper Airway",
                "actionLabel": "Inspect oropharynx and assess for angioedema or stridor",
                "findingDescription": "Oropharynx clear without mucosal edema or uvular deviation. No lip or tongue swelling. Nasal mucosa mildly erythematous with clear discharge.",
                "isAbnormal": False,
                "clinicalSignificance": "Rules against acute anaphylaxis or upper airway obstruction."
            },
            {
                "id": "exam-neuro-elena",
                "system": "Neurological",
                "name": "Mental Status & Alertness",
                "actionLabel": "Evaluate mental clarity and fatigue level",
                "findingDescription": "Alert and anxious, follows commands promptly. No somnolence, confusion, or lethargy.",
                "isAbnormal": False,
                "clinicalSignificance": "Reassuring: absence of carbon dioxide narcosis or imminent respiratory muscle exhaustion."
            }
        ],
        "investigations": [
            {
                "id": "inv-pef",
                "category": "Cardiology / Point-of-Care",
                "name": "Bedside Peak Expiratory Flow (PEF)",
                "turnaroundMinutes": 3,
                "normalRange": "400 - 450 L/min",
                "value": "180 L/min (42% of personal best)",
                "interpretation": "Severe airflow obstruction (<50% predicted/personal best). Requires immediate aggressive bronchodilation.",
                "isAbnormal": True,
                "findingsDetail": ["Personal baseline best is 430 L/min. Value < 50% classifies exacerbation as severe."]
            },
            {
                "id": "inv-cxr-elena",
                "category": "Imaging",
                "name": "Chest Radiograph (PA & Lateral)",
                "turnaroundMinutes": 15,
                "interpretation": "Bilateral hyperinflation with flattened diaphragms. No focal consolidation, pneumothorax, or pneumomediastinum.",
                "isAbnormal": True,
                "findingsDetail": ["Hyperinflation consistent with reactive airway disease. Absence of pneumothorax confirms chest tightness is not barotrauma."]
            },
            {
                "id": "inv-abg",
                "category": "Laboratory",
                "name": "Arterial Blood Gas (Room Air)",
                "turnaroundMinutes": 12,
                "value": "pH 7.42, PaCO2 38 mmHg, PaO2 65 mmHg, HCO3 24 mEq/L",
                "interpretation": "Mild hypoxemia. Normal PaCO2 in the presence of severe tachypnea is a warning sign of impending respiratory fatigue (hyperventilation should normally cause hypocapnia).",
                "isAbnormal": True,
                "findingsDetail": ["Normalizing PaCO2 in a tiring asthmatic indicates respiratory fatigue and potential progression to failure."]
            }
        ],
        "diagnosisOptions": [
            {
                "id": "dx-asthma",
                "name": "Acute Severe Asthma Exacerbation",
                "icdCode": "J45.901",
                "category": "Pulmonary",
                "isCorrectPrimary": True,
                "isHighDifferential": True,
                "rationale": "History of asthma, trigger exposure, severe expiratory wheezing, PEF 42%, and lack of response to home inhaler."
            },
            {
                "id": "dx-anaphylaxis",
                "name": "Acute Anaphylactic Reaction",
                "icdCode": "T78.2",
                "category": "Immunology",
                "isCorrectPrimary": False,
                "isHighDifferential": True,
                "rationale": "Can cause acute bronchospasm, but patient has no urticaria, angioedema, hypotension, or gastrointestinal symptoms."
            },
            {
                "id": "dx-pneumonia",
                "name": "Community-Acquired Bacterial Pneumonia",
                "icdCode": "J18.9",
                "category": "Infectious",
                "isCorrectPrimary": False,
                "isHighDifferential": False,
                "rationale": "Afebrile, no focal crackles or consolidation on physical exam or CXR."
            },
            {
                "id": "dx-foreign-body",
                "name": "Foreign Body Aspiration",
                "icdCode": "T17.9",
                "category": "Pulmonary",
                "isCorrectPrimary": False,
                "isHighDifferential": False,
                "rationale": "Usually unilateral wheeze or stridor with sudden choking episode, unlike diffuse bilateral wheezing in known asthmatic."
            }
        ],
        "managementProtocols": [
            {
                "id": "mgmt-nebs",
                "label": "Continuous or back-to-back Albuterol + Ipratropium (DuoNeb) inhalation via nebulizer",
                "isCorrect": True,
                "feedback": "First-line rapid bronchodilation using dual beta-2 agonist and anticholinergic."
            },
            {
                "id": "mgmt-steroids",
                "label": "Systemic Corticosteroids (Prednisone 60 mg PO or Methylprednisolone 125 mg IV)",
                "isCorrect": True,
                "feedback": "Crucial to blunt ongoing eosinophilic airway inflammation and reduce relapse rate."
            },
            {
                "id": "mgmt-o2",
                "label": "Supplemental Oxygen via nasal cannula titrated to SpO2 93-95%",
                "isCorrect": True,
                "feedback": "Corrects hypoxemia without causing excessive oxygen-induced hypercapnia."
            },
            {
                "id": "mgmt-magnesium",
                "label": "IV Magnesium Sulfate 2g infusion if poor response to first hour of nebulizers",
                "isCorrect": True,
                "feedback": "Smooth muscle relaxation indicated in severe refractory asthma exacerbations."
            },
            {
                "id": "mgmt-sedation",
                "label": "Administer Lorazepam 2 mg IV for patient agitation and anxiety",
                "isCorrect": False,
                "feedback": "Sedatives are strictly contraindicated in acute asthma; anxiety is caused by hypoxia/hypercapnia and sedation precipitates respiratory arrest."
            }
        ],
        "facts": {
            "onset": "Started this morning around 8:00 AM after visiting an animal shelter with her sister, progressively worsened over 4 hours.",
            "provocationPalliative": "Triggered by heavy cat dander exposure; cold autumn air on the drive worsened it. Albuterol MDI gave only 10 mins of partial relief.",
            "quality": "Tight, constricting feeling across upper chest; inability to push air out.",
            "radiation": "No radiation to jaw, back, or neck.",
            "severity": "Rates dyspnea as 8/10; feels like she cannot fill her lungs.",
            "timing": "Progressive over 4 hours with acute acceleration in past 45 minutes.",
            "associatedSymptoms": [
                "Non-productive cough",
                "Audible wheezing",
                "Chest tightness",
                "Sweating from effort"
            ],
            "pertinentNegatives": [
                "No fever or chills",
                "No purulent sputum",
                "No leg swelling or unilateral leg pain",
                "No rash or swelling of lips/tongue"
            ],
            "pastMedicalHistory": [
                "Moderate persistent asthma since childhood",
                "Allergic rhinitis",
                "One prior ICU admission 5 years ago for status asthmaticus (never intubated)"
            ],
            "medications": [
                "Fluticasone/Salmeterol 250/50 mcg DPI twice daily (admits to running out 2 weeks ago)",
                "Albuterol 90 mcg inhaler as needed"
            ],
            "allergies": [
                "Cat dander (severe)",
                "Tree pollens",
                "No known drug allergies"
            ],
            "familyHistory": [
                "Mother has asthma and eczema."
            ],
            "socialHistory": [
                "Never smoker",
                "Denies alcohol or illicit substance use",
                "Lives in an apartment with no pets"
            ],
            "reviewOfSystems": {
                "respiratory": "Marked dyspnea, expiratory wheeze, nonproductive dry cough.",
                "cardiac": "Tachycardia, denies retrosternal crushing pain.",
                "general": "Fatigued, anxious, afebrile."
            }
        },
        "scoringRubric": {
            "criticalActions": [
                "Recognized severe status asthmaticus with normal PaCO2 warning sign",
                "Initiated immediate combined nebulized bronchodilators + systemic steroids",
                "Refrained from administering sedatives or anxiolytics"
            ],
            "highValueQuestions": [
                "Frequency of rescue inhaler use today and past compliance with ICS controller",
                "History of ICU admissions or endotracheal intubation for asthma",
                "Specific exposure triggers (cat dander, cold air, viral illness)",
                "Presence of fever, rash, or lip/tongue swelling"
            ],
            "redFlagsToScreen": [
                "Silent chest (loss of wheeze due to severe hypoventilation)",
                "Lethargy, drowsiness, or PaCO2 elevation above 45 mmHg (respiratory failure)"
            ]
        }
    },
    {
        "id": "case-abdomen-3",
        "title": "Migratory Right Lower Quadrant Abdominal Pain",
        "shortDescription": "24-year-old male with 18 hours of periumbilical pain that migrated to the right lower quadrant, associated with anorexia and low-grade fever.",
        "specialty": "Gastroenterology",
        "difficulty": "Novice",
        "estimatedMinutes": 14,
        "tags": ["Abdominal Pain", "General Surgery", "Acute Appendicitis", "Physical Exam Signs"],
        "learningObjectives": [
            "Elicit classic pain migration chronology in visceral vs somatic peritoneal irritation.",
            "Perform and interpret specialized physical exam signs (McBurney point, Rovsing, Psoas, Obturator).",
            "Select appropriate diagnostic imaging (Ultrasound vs CT abdomen/pelvis).",
            "Manage pre-operative surgical optimization (NPO, IV fluids, analgesia, surgical consult)."
        ],
        "triageNurseNote": "24yo male presents walking bent forward holding his right side. Vomited once this morning. States bumps on car ride here caused severe jolting pain in his lower right stomach.",
        "patient": {
            "id": "pt-marcus-vance",
            "name": "Marcus Vance",
            "age": 24,
            "gender": "Male",
            "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            "occupation": "Software Engineer",
            "presentationComplaint": "Sharp stabbing pain in my lower right belly that gets worse every time I take a step.",
            "initialStatement": "Doctor, it started yesterday around dinner as a dull ache around my belly button, but now it has moved down to the right side and it feels like someone is stabbing me there.",
            "mood": "Guarded, lying still on gurney with right hip slightly flexed",
            "appearance": "Pale, visibly uncomfortable when moving or coughing."
        },
        "initialVitals": {
            "heartRate": 104,
            "bloodPressure": "122/76",
            "respiratoryRate": 18,
            "oxygenSaturation": 99,
            "temperature": 38.1,
            "painScore": 7
        },
        "physicalFindings": [
            {
                "id": "exam-abd-marcus",
                "system": "Abdominal",
                "name": "Abdominal Palpation & Peritoneal Signs",
                "actionLabel": "Palpate four quadrants, McBurney point, test Rovsing and rebound tenderness",
                "findingDescription": "Maximal tenderness located at McBurney point (1/3 distance from ASIS to umbilicus). Positive Rovsing sign (pain in RLQ upon deep palpation of LLQ). Localized involuntary guarding in RLQ. Mild rebound tenderness present.",
                "isAbnormal": True,
                "clinicalSignificance": "Classic peritoneal signs indicating localized peritonitis of the right lower quadrant."
            },
            {
                "id": "exam-special-signs",
                "system": "Abdominal",
                "name": "Psoas & Obturator Signs",
                "actionLabel": "Perform passive right hip extension (Psoas sign) and internal rotation (Obturator sign)",
                "findingDescription": "Positive Psoas sign: patient experiences marked exacerbation of RLQ pain with passive extension of right hip while in left lateral decubitus. Obturator sign is equivocal.",
                "isAbnormal": True,
                "clinicalSignificance": "Positive Psoas sign suggests a retrocecal or irritating appendiceal inflammatory process."
            },
            {
                "id": "exam-cv-marcus",
                "system": "Cardiovascular",
                "name": "Cardiovascular Exam",
                "actionLabel": "Auscultate heart and assess perfusion",
                "findingDescription": "Sinus tachycardia at 104 bpm attributable to pain and fever. S1/S2 present, no murmurs. Peripheral pulses strong.",
                "isAbnormal": True,
                "clinicalSignificance": "Physiologic tachycardia secondary to pain and pyrexia."
            },
            {
                "id": "exam-gen-marcus",
                "system": "General / HEENT",
                "name": "General & Hydration Status",
                "actionLabel": "Inspect oral mucosa, skin turgor, and heel jar test",
                "findingDescription": "Dry oral mucosa. Positive Markle sign (heel jar test produces sharp RLQ pain when patient drops onto heels).",
                "isAbnormal": True,
                "clinicalSignificance": "Positive Markle test corroborates peritoneal irritation."
            }
        ],
        "investigations": [
            {
                "id": "inv-us-abd",
                "category": "Imaging",
                "name": "Ultrasound of the Appendix / Abdomen",
                "turnaroundMinutes": 20,
                "interpretation": "Non-compressible, blind-ending tubular structure in the right lower quadrant measuring 8.5 mm in outer diameter (normal < 6 mm). Surrounding hypervascularity and periappendiceal hyperechoic fat stranding.",
                "isAbnormal": True,
                "findingsDetail": [
                    "Target sign on cross-section with wall thickening > 2 mm.",
                    "Appendicolith identified at appendiceal base.",
                    "No loculated abscess or free fluid in Morrison pouch."
                ]
            },
            {
                "id": "inv-wbc-marcus",
                "category": "Laboratory",
                "name": "Complete Blood Count (CBC) with Differential",
                "turnaroundMinutes": 20,
                "value": "WBC 14.8 x10^9/L with 84% Neutrophils (Left Shift)",
                "interpretation": "Marked leukocytosis with absolute neutrophilia and 6% bandemia, indicative of acute pyogenic infection.",
                "isAbnormal": True,
                "findingsDetail": ["Elevated inflammatory marker concordant with acute appendicitis."]
            },
            {
                "id": "inv-ua-marcus",
                "category": "Laboratory",
                "name": "Urinalysis (Clean Catch)",
                "turnaroundMinutes": 10,
                "interpretation": "Specific gravity 1.028. Negative for nitrites and leukocyte esterase. Trace ketones. 2-3 RBCs/HPF (can occur due to ureteral irritation by inflamed appendix).",
                "isAbnormal": False,
                "findingsDetail": ["Absence of bacteriuria or pyuria rules out acute urinary tract infection or pyelonephritis."]
            }
        ],
        "diagnosisOptions": [
            {
                "id": "dx-appendicitis",
                "name": "Acute Uncomplicated Appendicitis",
                "icdCode": "K35.80",
                "category": "Gastrointestinal",
                "isCorrectPrimary": True,
                "isHighDifferential": True,
                "rationale": "Classic periumbilical to RLQ migration, anorexia, McBurney tenderness, Rovsing sign, leukocytosis, and US confirming 8.5mm non-compressible appendix."
            },
            {
                "id": "dx-mesenteric",
                "name": "Mesenteric Adenitis",
                "icdCode": "I88.0",
                "category": "Infectious",
                "isCorrectPrimary": False,
                "isHighDifferential": True,
                "rationale": "Can mimic appendicitis, but more common after recent viral URI and appendix is typically normal on ultrasound."
            },
            {
                "id": "dx-nephro",
                "name": "Right Ureteral Calculi (Nephrolithiasis)",
                "icdCode": "N20.1",
                "category": "Urology",
                "isCorrectPrimary": False,
                "isHighDifferential": False,
                "rationale": "Colicky flank to groin pain with prominent gross/microscopic hematuria; lacks localized peritoneal signs and fever."
            },
            {
                "id": "dx-gastro",
                "name": "Acute Viral Gastroenteritis",
                "icdCode": "A08.4",
                "category": "Gastrointestinal",
                "isCorrectPrimary": False,
                "isHighDifferential": False,
                "rationale": "Characterized by prominent diarrhea and diffuse crampy pain rather than focal RLQ peritoneal guarding and focal appendiceal enlargement."
            }
        ],
        "managementProtocols": [
            {
                "id": "mgmt-npo",
                "label": "Place patient NPO (Nil Per Os) immediately and start IV crystalloid fluid resuscitation",
                "isCorrect": True,
                "feedback": "Prepares the patient safely for surgical anesthesia and corrects dehydration."
            },
            {
                "id": "mgmt-surg",
                "label": "Urgent General Surgery Consultation for Laparoscopic Appendectomy",
                "isCorrect": True,
                "feedback": "Definitive treatment for acute appendicitis to prevent gangrene and perforation."
            },
            {
                "id": "mgmt-abx",
                "label": "Pre-operative IV broad-spectrum antibiotics covering gram-negatives and anaerobes (e.g. Cefoxitin or Ceftriaxone + Metronidazole)",
                "isCorrect": True,
                "feedback": "Reduces post-operative surgical site infection and intra-abdominal abscess formation."
            },
            {
                "id": "mgmt-pain",
                "label": "Provide IV analgesia (e.g. Morphine or Fentanyl titrated for comfort)",
                "isCorrect": True,
                "feedback": "Contemporary evidence demonstrates providing adequate analgesia does not mask clinical findings or impede surgical decision making."
            },
            {
                "id": "mgmt-laxative",
                "label": "Prescribe oral osmotic laxative (Polyethylene Glycol) for constipation relief",
                "isCorrect": False,
                "feedback": "Laxatives and enemas are dangerous and strictly contraindicated in suspected appendicitis as they can precipitate bowel perforation."
            }
        ],
        "facts": {
            "onset": "Began yesterday afternoon around 6:00 PM as an ill-defined dull discomfort around the navel.",
            "provocationPalliative": "Worse with any movement, walking, coughing, or car bumps. Lying still with knees curled provides slight ease.",
            "quality": "Initially dull and aching; over the last 8 hours has shifted into a constant sharp, localized stabbing sensation.",
            "radiation": "Originated periumbilically, then migrated precisely to the right lower abdomen.",
            "severity": "Currently 7/10; was 3/10 initially.",
            "timing": "Continuous and steadily intensifying over the past 18 hours.",
            "associatedSymptoms": [
                "Complete loss of appetite (anorexia; 'Could not even look at food')",
                "Nausea with 1 episode of bilious emesis",
                "Low-grade fever and mild chills"
            ],
            "pertinentNegatives": [
                "No diarrhea (last bowel movement normal yesterday morning)",
                "No blood in stool",
                "No dysuria, hematuria, or flank pain",
                "No penile discharge or testicular pain"
            ],
            "pastMedicalHistory": [
                "No chronic medical conditions",
                "No prior abdominal surgeries"
            ],
            "medications": [
                "Took 1 tablet of Acetaminophen 500 mg 4 hours ago with minimal effect"
            ],
            "allergies": [
                "No known allergies"
            ],
            "familyHistory": [
                "Non-contributory; no familial polyposis or IBD."
            ],
            "socialHistory": [
                "College student, non-smoker, drinks socially on weekends."
            ],
            "reviewOfSystems": {
                "gi": "Migratory RLQ pain, anorexia, nausea, one vomit, no diarrhea.",
                "genitourinary": "Denies dysuria, urgency, or testicular tenderness.",
                "constitutional": "Low-grade fever, chills, fatigue."
            }
        },
        "scoringRubric": {
            "criticalActions": [
                "Recognized classic pain migration from visceral periumbilical to somatic peritoneal RLQ",
                "Demonstrated positive McBurney point tenderness and Rovsing or Psoas sign",
                "Placed patient NPO, initiated IV fluids, pre-op antibiotics, and consulted general surgery"
            ],
            "highValueQuestions": [
                "Chronology of pain onset and location change (migration)",
                "Presence of anorexia ('hamburger sign')",
                "Aggravation with coughing or walking (peritoneal bump sensitivity)",
                "Gastrointestinal and genitourinary review of systems"
            ],
            "redFlagsToScreen": [
                "Sudden transient relief of pain followed by diffuse peritonitis (Appendiceal Perforation)",
                "Signs of septic shock (hypotension, marked tachycardia, altered mental status)"
            ]
        }
    },
    {
        "id": "case-cap-4",
        "title": "Fever, Productive Cough & Altered Mental Status",
        "shortDescription": "72-year-old female brought by daughter with 4-day history of high fever, rust-colored sputum, worsening tachypnea, and new confusion.",
        "specialty": "Emergency Medicine",
        "difficulty": "Advanced",
        "estimatedMinutes": 16,
        "tags": ["Fever", "Infectious Disease", "Pneumonia", "Sepsis", "Geriatrics"],
        "learningObjectives": [
            "Evaluate sepsis criteria and CURB-65 severity scoring in geriatric respiratory infections.",
            "Differentiate typical vs atypical pneumonia presentations.",
            "Order appropriate blood cultures, sputum Gram stain, procalcitonin, and Chest CT/CXR.",
            "Implement Sepsis-3 bundle within the first golden hour."
        ],
        "triageNurseNote": "72yo female accompanied by daughter. Daughter notes patient has become increasingly disoriented and drowsy today. Febrile to 38.9C, SpO2 88% on ambient air.",
        "patient": {
            "id": "pt-margaret-davis",
            "name": "Margaret Davis",
            "age": 72,
            "gender": "Female",
            "avatarUrl": "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=150&auto=format&fit=crop&q=80",
            "occupation": "Retired Teacher",
            "presentationComplaint": "High fever, shaking chills, and a deep cough with brownish-red phlegm.",
            "initialStatement": "I feel... so cold and weak, Doctor... My chest hurts on the right side when I breathe... Where is my daughter?",
            "mood": "Lethargic, shivering, oriented only to person and year",
            "appearance": "Flushed cheeks, accessory muscle use, coughing weakly with rusty sputum."
        },
        "initialVitals": {
            "heartRate": 118,
            "bloodPressure": "92/58",
            "respiratoryRate": 32,
            "oxygenSaturation": 88,
            "temperature": 38.9,
            "painScore": 5
        },
        "physicalFindings": [
            {
                "id": "exam-pulm-margaret",
                "system": "Respiratory",
                "name": "Chest Auscultation & Percussion",
                "actionLabel": "Auscultate right lower lobe and test tactile fremitus / egophony",
                "findingDescription": "Dullness to percussion over right lower lung base. Coarse inspiratory crackles and bronchial breath sounds audible over right lower lobe. Increased tactile fremitus and positive egophony ('E to A' change) at right base.",
                "isAbnormal": True,
                "clinicalSignificance": "Definite lobar consolidation signs of right lower lobe."
            },
            {
                "id": "exam-cv-margaret",
                "system": "Cardiovascular",
                "name": "Cardiovascular & Perfusion",
                "actionLabel": "Assess pulse quality, heart sounds, and peripheral refill",
                "findingDescription": "Tachycardic regular rhythm at 118 bpm. Peripheral pulses rapid and bounding. Capillary refill prolonged at 3.5 seconds. Warm extremities with slight mottling at knees.",
                "isAbnormal": True,
                "clinicalSignificance": "Distributive septic state with vasodilatory warm shock physiology."
            },
            {
                "id": "exam-neuro-margaret",
                "system": "Neurological",
                "name": "Mental Status (AMTS / GCS)",
                "actionLabel": "Administer Abbreviated Mental Test Score & Glasgow Coma Scale",
                "findingDescription": "GCS 13 (Eye 4, Verbal 4, Motor 5). Disoriented to current location and day of the week. Daughter confirms acute change from baseline independent status.",
                "isAbnormal": True,
                "clinicalSignificance": "Acute encephalopathy satisfying the 'C' (Confusion) criterion in CURB-65 scoring."
            }
        ],
        "investigations": [
            {
                "id": "inv-cxr-margaret",
                "category": "Imaging",
                "name": "Chest Radiograph (PA & Lateral)",
                "turnaroundMinutes": 15,
                "interpretation": "Dense homogeneous airspace consolidation occupying the right lower lobe with visible air bronchograms. Small right-sided parapneumonic pleural effusion. No pneumothorax.",
                "isAbnormal": True,
                "findingsDetail": ["Right lower lobe lobar pneumonia with secondary parapneumonic effusion."]
            },
            {
                "id": "inv-lactate",
                "category": "Laboratory",
                "name": "Venous Blood Gas & Serum Lactate",
                "turnaroundMinutes": 10,
                "value": "Lactate 3.4 mmol/L (Normal < 2.0)",
                "interpretation": "Significantly elevated serum lactate indicating tissue hypoperfusion in severe sepsis.",
                "isAbnormal": True,
                "findingsDetail": ["Serum lactate > 2 mmol/L with MAP < 65 qualifies as Sepsis with high risk of progression to septic shock."]
            },
            {
                "id": "inv-blood-cultures",
                "category": "Laboratory",
                "name": "Blood Cultures (2 Sets) & Sputum Gram Stain",
                "turnaroundMinutes": 30,
                "interpretation": "Sputum Gram stain demonstrates abundant polymorphonuclear leukocytes and Gram-positive lancet-shaped diplococci in pairs. Blood cultures pending incubation.",
                "isAbnormal": True,
                "findingsDetail": ["Highly suggestive of Streptococcus pneumoniae bacteremic pneumonia."]
            }
        ],
        "diagnosisOptions": [
            {
                "id": "dx-cap-sepsis",
                "name": "Severe Community-Acquired Pneumonia with Sepsis (Streptococcal)",
                "icdCode": "J13",
                "category": "Infectious",
                "isCorrectPrimary": True,
                "isHighDifferential": True,
                "rationale": "Elderly patient with high fever, rust sputum, lobar consolidation, confusion, tachypnea (RR 32), hypotension (MAP 69), elevated lactate, and Gram-positive diplococci."
            },
            {
                "id": "dx-copd-exac",
                "name": "Acute Exacerbation of COPD",
                "icdCode": "J44.1",
                "category": "Pulmonary",
                "isCorrectPrimary": False,
                "isHighDifferential": True,
                "rationale": "Can present with cough and dyspnea, but focal lobar consolidation and high procalcitonin point definitively to primary lobar pneumonia."
            },
            {
                "id": "dx-aspiration",
                "name": "Aspiration Pneumonitis",
                "icdCode": "J69.0",
                "category": "Pulmonary",
                "isCorrectPrimary": False,
                "isHighDifferential": False,
                "rationale": "Typically follows witnessed choking or impaired swallowing with dependent posterior/superior segment infiltrates."
            }
        ],
        "managementProtocols": [
            {
                "id": "mgmt-sepsis-bundle",
                "label": "Hour-1 Sepsis Bundle: IV Crystalloid bolus (30 mL/kg), draw Blood Cultures, measure Lactate",
                "isCorrect": True,
                "feedback": "Critical resuscitation for sepsis-induced tissue hypoperfusion and hypotension."
            },
            {
                "id": "mgmt-abx-cap",
                "label": "Initiate empiric IV Antibiotics (Ceftriaxone 2g IV + Azithromycin 500mg IV) within 1 hour",
                "isCorrect": True,
                "feedback": "Guideline-directed dual coverage for typical and atypical pathogens in hospitalized CAP."
            },
            {
                "id": "mgmt-o2-margaret",
                "label": "Supplemental Oxygen via Venturi Mask / High-Flow Nasal Cannula to target SpO2 94-98%",
                "isCorrect": True,
                "feedback": "Reverses refractory hypoxemia safely."
            },
            {
                "id": "mgmt-curb65",
                "label": "Admit to Intensive Care Unit / Step-Down (CURB-65 score = 4: Confusion, Urea, RR>=30, BP<90/60)",
                "isCorrect": True,
                "feedback": "Score indicates high 30-day mortality (>25%) necessitating critical care monitoring."
            },
            {
                "id": "mgmt-steroids-contra",
                "label": "Oral Dexamethasone 20 mg and discharge home on oral amoxicillin",
                "isCorrect": False,
                "feedback": "Extremely hazardous: patient meets criteria for severe sepsis with acute confusion and hypoperfusion requiring inpatient critical care."
            }
        ],
        "facts": {
            "onset": "Started 4 days ago with shivering rigors and mild nonproductive cough; worsened dramatically over the last 24 hours.",
            "provocationPalliative": "Coughing and deep inhalation trigger sharp pleuritic right-sided chest pain.",
            "quality": "Deep rattling congestion with rusty brown sputum.",
            "radiation": "Right lower chest pain radiates slightly around the flank.",
            "severity": "Patient is too confused to reliably rate on 0-10 scale; daughter notes severe decline.",
            "timing": "Continuous over 4 days with acute mental status clouding today.",
            "associatedSymptoms": [
                "Rigors / shaking chills",
                "Rusty-colored thick sputum",
                "New confusion / somnolence",
                "Loss of appetite and profound weakness"
            ],
            "pertinentNegatives": [
                "No calf swelling or deep vein thrombosis history",
                "No recent international travel",
                "No history of choking or dysphagia"
            ],
            "pastMedicalHistory": [
                "Type 2 Diabetes Mellitus (well-controlled, HbA1c 6.8%)",
                "Osteoarthritis of knees"
            ],
            "medications": [
                "Metformin 500 mg twice daily",
                "Daily multivitamin"
            ],
            "allergies": [
                "No known allergies"
            ],
            "familyHistory": [
                "Mother died of stroke at 80."
            ],
            "socialHistory": [
                "Former smoker (quit 30 years ago, 5 pack-years)",
                "Lives with husband, active in community church until 4 days ago."
            ],
            "reviewOfSystems": {
                "respiratory": "Tachypneic, pleuritic right chest pain, rust sputum.",
                "constitutional": "High fever, rigors, weakness.",
                "neuro": "Acute disorientation."
            }
        },
        "scoringRubric": {
            "criticalActions": [
                "Recognized Sepsis-3 criteria and calculated CURB-65 score >= 3",
                "Initiated 1-Hour Sepsis Bundle: 30mL/kg IV fluids and blood cultures prior to antibiotics",
                "Administered broad-spectrum IV antibiotics within 60 minutes of presentation"
            ],
            "highValueQuestions": [
                "Color and consistency of sputum (rust-colored indicates S. pneumoniae)",
                "Acute vs gradual onset of confusion/disorientation compared to baseline",
                "Presence of rigors and shaking chills",
                "Immunization status (Pneumococcal and Influenza vaccines)"
            ],
            "redFlagsToScreen": [
                "Hypotension refractory to initial crystalloids (Septic Shock)",
                "Respiratory failure requiring endotracheal intubation or NIV"
            ]
        }
    }
]

def get_all_cases() -> List[Dict[str, Any]]:
    return CLINICAL_CASES

def get_case_by_id(case_id: str) -> Optional[Dict[str, Any]]:
    for c in CLINICAL_CASES:
        if c["id"] == case_id:
            return c
    return None
