export interface BenchmarkCaseData {
  id: string;
  slug: string;
  title: string;
  specialty: string;
  difficulty: 'NOVICE' | 'INTERMEDIATE' | 'ADVANCED';
  presentation: string;
  estimatedMinutes: number;
  tags: string[];
  learningObjectives: string[];
  patientProfile: {
    id: string;
    name: string;
    age: number;
    gender: string;
    avatarUrl: string;
    occupation: string;
    presentationComplaint: string;
    initialStatement: string;
    mood: string;
    appearance: string;
  };
  initialVitals: {
    heartRate: number;
    bloodPressure: string;
    respiratoryRate: number;
    oxygenSaturation: number;
    temperature: number;
    painScore: number;
  };
  chiefComplaint: {
    complaint: string;
    duration: string;
  };
  historyFacts: {
    onset: string;
    provocationPalliative: string;
    quality: string;
    radiation: string;
    severity: string;
    timing: string;
    associatedSymptoms: string[];
    pertinentNegatives: string[];
    pastMedicalHistory: string[];
    medications: string[];
    allergies: string[];
    familyHistory: string[];
    socialHistory: string[];
  };
  physicalFindings: Array<{
    id: string;
    system: string;
    name: string;
    actionLabel: string;
    findingDescription: string;
    isAbnormal: boolean;
    clinicalSignificance: string;
  }>;
  investigations: Array<{
    id: string;
    category: string;
    name: string;
    turnaroundMinutes: number;
    normalRange?: string;
    value?: string;
    interpretation: string;
    isAbnormal: boolean;
    imageUrl?: string;
    findingsDetail?: string[];
  }>;
  diagnosisOptions: Array<{
    id: string;
    name: string;
    icdCode: string;
    category: string;
    isCorrectPrimary: boolean;
    isHighDifferential: boolean;
    rationale: string;
  }>;
  managementProtocols: Array<{
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
  }>;
  scoringRubric: {
    criticalActions: string[];
    highValueQuestions: string[];
    redFlagsToScreen: string[];
  };
}

export const BENCHMARK_CASES: BenchmarkCaseData[] = [
  {
    id: 'case-acs-1',
    slug: 'acute-crushing-retrosternal-chest-pain',
    title: 'Acute Crushing Retrosternal Chest Pain',
    specialty: 'Cardiology',
    difficulty: 'INTERMEDIATE',
    presentation: '58-year-old male with sudden onset substernal chest heaviness, diaphoresis, and radiation to the left jaw.',
    estimatedMinutes: 15,
    tags: ['Chest Pain', 'Cardiology', 'Emergency', 'ECG Interpretation', 'OSCE Core'],
    learningObjectives: [
      'Conduct a focused cardiac history adhering to OPQRST methodology.',
      'Differentiate between ACS, Aortic Dissection, Pulmonary Embolism, and GERD.',
      'Appropriately order and interpret 12-lead ECG and High-Sensitivity Cardiac Troponin.',
      'Initiate immediate guideline-directed medical therapy for Acute Coronary Syndrome.',
    ],
    patientProfile: {
      id: 'pt-robert-chen',
      name: 'Robert Chen',
      age: 58,
      gender: 'Male',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      occupation: 'Architectural Project Manager',
      presentationComplaint: 'Severe pressure and heaviness in my chest that started less than an hour ago.',
      initialStatement: "Doctor, please... It feels like an elephant is sitting right in the middle of my chest. I started feeling dizzy and breaking out in a cold sweat on my way into the office.",
      mood: 'Anxious, pale, clutching center of chest with a closed fist (Levine sign)',
      appearance: 'Diaphoretic, breathing shallowly, speech interrupted by discomfort.',
    },
    initialVitals: {
      heartRate: 98,
      bloodPressure: '154/94',
      respiratoryRate: 20,
      oxygenSaturation: 97,
      temperature: 37.1,
      painScore: 8,
    },
    chiefComplaint: {
      complaint: 'Crushing chest pressure radiating to jaw and left arm',
      duration: '45 minutes',
    },
    historyFacts: {
      onset: 'Started approximately 45 minutes ago while walking up two flights of stairs to his office desk.',
      provocationPalliative: 'Worse with minimal exertion. Stopping and resting in his chair did not relieve the tightness at all.',
      quality: 'Deep, tight, crushing pressure; feels like a vice grip or heavy weight pressing down on his chest bone.',
      radiation: 'Radiates up into the left side of his jaw, lower teeth, and down the inner aspect of his left arm.',
      severity: 'Rates it an 8 out of 10 in severity right now, previously 9/10 at peak.',
      timing: 'Continuous and unremitting since it began 45 minutes ago.',
      associatedSymptoms: [
        'Profuse cold sweats (diaphoresis)',
        'Mild lightheadedness',
        'Nausea without vomiting',
        'Shortness of breath',
      ],
      pertinentNegatives: [
        'No sharp pleuritic pain with breathing',
        'No sudden tearing pain between shoulder blades',
        'No fever or chills',
        'No calf swelling or recent long-distance travel',
      ],
      pastMedicalHistory: [
        'Essential Hypertension diagnosed 6 years ago',
        'Hyperlipidemia (elevated LDL)',
        'No prior heart attack or stroke',
      ],
      medications: [
        'Amlodipine 5 mg daily',
        'Atorvastatin 20 mg daily (admits to missing doses frequently)',
      ],
      allergies: ['No known drug allergies (NKDA)'],
      familyHistory: ['Father had a fatal myocardial infarction at age 52; Mother has type 2 diabetes.'],
      socialHistory: [
        'Smokes 0.5 packs per day for 25 years (12.5 pack-years)',
        'Drinks 1-2 glasses of wine on weekends',
        'Denies illicit drug use, including cocaine or amphetamines.',
      ],
    },
    physicalFindings: [
      {
        id: 'exam-cv',
        system: 'Cardiovascular',
        name: 'Precordial & Heart Auscultation',
        actionLabel: 'Auscultate S1, S2, murmurs, gallops & inspect JVP',
        findingDescription: 'Tachycardic regular rhythm. S1 and S2 present. Soft S4 gallop audible at apex. No pericardial friction rub. JVP estimated at 3 cm above sternal angle at 45 degrees. Peripheral pulses equal and palpable bilaterally.',
        isAbnormal: true,
        clinicalSignificance: 'S4 gallop reflects decreased left ventricular compliance secondary to acute myocardial ischemia.',
      },
      {
        id: 'exam-pulm',
        system: 'Respiratory',
        name: 'Lung Auscultation & Chest Wall Palpation',
        actionLabel: 'Auscultate all lung fields bilaterally & palpate chest wall',
        findingDescription: 'Clear to auscultation bilaterally. No wheezing, rhonchi, or basilar crackles. Chest wall tenderness is absent; pain is NOT reproducible with manual palpation of costochondral junctions.',
        isAbnormal: false,
        clinicalSignificance: 'Absence of chest wall tenderness rules against costochondritis; clear lung fields indicate no acute cardiogenic pulmonary edema at present.',
      },
      {
        id: 'exam-abdomen',
        system: 'Abdominal',
        name: 'Abdominal Palpation & Epigastric Exam',
        actionLabel: 'Palpate epigastrium and RUQ, auscultate bowel sounds',
        findingDescription: 'Soft, non-tender, non-distended. No guarding, rebound, or organomegaly. No pulsatile abdominal mass detected.',
        isAbnormal: false,
        clinicalSignificance: 'Non-tender abdomen reduces likelihood of acute perforated peptic ulcer or cholecystitis masquerading as lower chest pain.',
      },
      {
        id: 'exam-general',
        system: 'General / HEENT',
        name: 'General Appearance & Diaphoresis',
        actionLabel: 'Assess skin perfusion, capillary refill, and mucous membranes',
        findingDescription: 'Cool, clammy extremities with marked forehead and palmar diaphoresis. Capillary refill approximately 2.5 seconds. Pupils equal and reactive. Mucous membranes moist.',
        isAbnormal: true,
        clinicalSignificance: 'Significant sympathetic autonomic activation typical in acute myocardial ischemia.',
      },
    ],
    investigations: [
      {
        id: 'inv-ecg',
        category: 'Cardiology / Point-of-Care',
        name: '12-Lead Electrocardiogram (STAT)',
        turnaroundMinutes: 2,
        value: 'ST Elevation in leads II, III, aVF',
        interpretation: 'Sinus rhythm at 96 bpm. 2.5mm ST-segment elevation in leads II, III, and aVF with reciprocal ST depression in leads I and aVL. Hyperacute T-waves in inferior leads.',
        isAbnormal: true,
        imageUrl: 'ecg_inferior_stemi',
        findingsDetail: [
          'Acute ST-segment Elevation Myocardial Infarction (Inferior STEMI - Right Coronary Artery territory).',
          'Reciprocal changes in high lateral leads (I, aVL).',
        ],
      },
      {
        id: 'inv-troponin',
        category: 'Laboratory',
        name: 'High-Sensitivity Cardiac Troponin I (hs-cTnI)',
        turnaroundMinutes: 20,
        normalRange: '< 14 ng/L',
        value: '185 ng/L (Markedly Elevated)',
        interpretation: 'Positive for acute myocardial necrosis. Baseline initial rise observed 50 mins post-symptom onset.',
        isAbnormal: true,
        findingsDetail: ['Significant elevation above 99th percentile upper reference limit. Diagnostic of acute myocardial injury.'],
      },
      {
        id: 'inv-cxr',
        category: 'Imaging',
        name: 'Portable Chest Radiograph (CXR)',
        turnaroundMinutes: 15,
        interpretation: 'Normal cardiothoracic ratio. No widening of the superior mediastinum. Clear lung parenchymal fields with no focal consolidations, pneumothorax, or pulmonary vascular congestion.',
        isAbnormal: false,
        findingsDetail: ['Mediastinal contour normal (helps exclude Stanford Type A Aortic Dissection).'],
      },
    ],
    diagnosisOptions: [
      {
        id: 'dx-stemi',
        name: 'ST-Elevation Myocardial Infarction (Inferior STEMI)',
        icdCode: 'I21.19',
        category: 'Cardiovascular',
        isCorrectPrimary: true,
        isHighDifferential: true,
        rationale: 'Substernal pressure radiating to jaw with diaphoresis, confirmed by ST elevations in II, III, aVF with reciprocal depressions and elevated troponin.',
      },
      {
        id: 'dx-dissection',
        name: 'Acute Aortic Dissection (Type A)',
        icdCode: 'I71.01',
        category: 'Vascular',
        isCorrectPrimary: false,
        isHighDifferential: true,
        rationale: 'Must always be in the differential for acute chest pain, but less likely given absence of tearing back pain, equal bilateral pulses, and normal mediastinum on CXR.',
      },
      {
        id: 'dx-pe',
        name: 'Pulmonary Embolism',
        icdCode: 'I26.9',
        category: 'Pulmonary',
        isCorrectPrimary: false,
        isHighDifferential: false,
        rationale: 'Possible cause of acute chest discomfort, but typically pleuritic with tachycardia, hypoxia, and normal troponin/D-Dimer.',
      },
    ],
    managementProtocols: [
      {
        id: 'mgmt-aspirin',
        label: 'Administer Chewable Aspirin 324 mg immediately',
        isCorrect: true,
        feedback: 'Essential immediate antiplatelet therapy in suspected ACS to reduce mortality.',
      },
      {
        id: 'mgmt-cath',
        label: 'Activate Cardiac Catheterization Lab for Emergent PCI (<90 min door-to-balloon)',
        isCorrect: true,
        feedback: 'Definitive primary reperfusion strategy for acute inferior STEMI.',
      },
      {
        id: 'mgmt-heparin',
        label: 'IV Anticoagulation (Unfractionated Heparin bolus + infusion)',
        isCorrect: true,
        feedback: 'Prevents thrombus propagation before and during percutaneous intervention.',
      },
      {
        id: 'mgmt-nsaids',
        label: 'High-dose Ibuprofen or Ketorolac IV for pain control',
        isCorrect: false,
        feedback: 'NSAIDs (except aspirin) are contraindicated in acute MI due to increased risk of mortality, reinfarction, and cardiac rupture.',
      },
    ],
    scoringRubric: {
      criticalActions: [
        'Recognized inferior STEMI on 12-lead ECG within 10 minutes',
        'Ordered STAT Chewable Aspirin and Anticoagulation',
        'Activated Cath Lab for Emergent Percutaneous Coronary Intervention',
      ],
      highValueQuestions: [
        'Onset and duration of chest discomfort',
        'Character and quality of pain (pressure vs sharp)',
        'Radiation to jaw, neck, or left arm',
        'Presence of diaphoresis, nausea, or shortness of breath',
      ],
      redFlagsToScreen: [
        'Sudden tearing pain radiating to back (Aortic Dissection)',
        'Pleuritic sharp pain with calf swelling (PE)',
      ],
    },
  },
  {
    id: 'case-dyspnea-2',
    slug: 'acute-severe-dyspnea-wheezing',
    title: 'Acute Severe Dyspnea & Expiratory Wheezing',
    specialty: 'Pulmonology',
    difficulty: 'NOVICE',
    presentation: '34-year-old female with sudden worsening shortness of breath, audible wheezing, and poor response to rescue inhaler.',
    estimatedMinutes: 12,
    tags: ['Shortness of Breath', 'Pulmonology', 'Asthma Exacerbation', 'Respiratory Care'],
    learningObjectives: [
      'Assess severity of acute bronchospasm through clinical observation and speech fluency.',
      'Elicit asthma triggers, past intubation/ICU history, and inhaler adherence.',
      'Order peak expiratory flow, chest X-ray, and arterial blood gas when indicated.',
      'Formulate immediate medical management (bronchodilators, systemic corticosteroids).',
    ],
    patientProfile: {
      id: 'pt-elena-rostova',
      name: 'Elena Rostova',
      age: 34,
      gender: 'Female',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      occupation: 'Graphic Designer',
      presentationComplaint: 'I cannot catch my breath... my chest feels so tight.',
      initialStatement: "Doctor... (gasp)... I used my blue inhaler... four times... it's not opening my chest... feels like breathing through a crushed straw.",
      mood: 'Distressed, sitting forward in tripod position, using accessory neck muscles',
      appearance: 'Tachypneic, intercostal retractions visible, speaking in short broken phrases.',
    },
    initialVitals: {
      heartRate: 112,
      bloodPressure: '128/82',
      respiratoryRate: 28,
      oxygenSaturation: 91,
      temperature: 36.9,
      painScore: 3,
    },
    chiefComplaint: {
      complaint: 'Severe dyspnea and wheezing refractory to home inhalers',
      duration: '4 hours',
    },
    historyFacts: {
      onset: 'Started this morning around 8:00 AM after visiting an animal shelter with her sister, progressively worsened over 4 hours.',
      provocationPalliative: 'Triggered by heavy cat dander exposure; cold autumn air on the drive worsened it. Albuterol MDI gave only 10 mins of partial relief.',
      quality: 'Tight, constricting feeling across upper chest; inability to push air out.',
      radiation: 'No radiation to jaw, back, or neck.',
      severity: 'Rates dyspnea as 8/10; feels like she cannot fill her lungs.',
      timing: 'Progressive over 4 hours with acute acceleration in past 45 minutes.',
      associatedSymptoms: ['Non-productive cough', 'Audible wheezing', 'Chest tightness', 'Sweating from effort'],
      pertinentNegatives: ['No fever or chills', 'No purulent sputum', 'No leg swelling or unilateral leg pain', 'No rash or swelling of lips/tongue'],
      pastMedicalHistory: ['Moderate persistent asthma since childhood', 'Allergic rhinitis', 'One prior ICU admission 5 years ago for status asthmaticus (never intubated)'],
      medications: ['Fluticasone/Salmeterol 250/50 mcg DPI twice daily (admits to running out 2 weeks ago)', 'Albuterol 90 mcg inhaler as needed'],
      allergies: ['Cat dander (severe)', 'Tree pollens', 'No known drug allergies'],
      familyHistory: ['Mother has asthma and eczema.'],
      socialHistory: ['Never smoker', 'Denies alcohol or illicit substance use', 'Lives in an apartment with no pets'],
    },
    physicalFindings: [
      {
        id: 'exam-pulm-elena',
        system: 'Respiratory',
        name: 'Pulmonary Auscultation & Mechanics',
        actionLabel: 'Auscultate anterior/posterior lung fields & observe respiratory effort',
        findingDescription: 'Marked diffuse expiratory wheezing throughout all lung fields with prolonged expiratory phase. Supraclavicular and intercostal retractions noted. No stridor.',
        isAbnormal: true,
        clinicalSignificance: 'Severe generalized bronchospasm with high work of breathing.',
      },
    ],
    investigations: [
      {
        id: 'inv-pef',
        category: 'Cardiology / Point-of-Care',
        name: 'Bedside Peak Expiratory Flow (PEF)',
        turnaroundMinutes: 3,
        normalRange: '400 - 450 L/min',
        value: '180 L/min (42% of personal best)',
        interpretation: 'Severe airflow obstruction (<50% predicted/personal best). Requires immediate aggressive bronchodilation.',
        isAbnormal: true,
        findingsDetail: ['Personal baseline best is 430 L/min. Value < 50% classifies exacerbation as severe.'],
      },
    ],
    diagnosisOptions: [
      {
        id: 'dx-asthma',
        name: 'Acute Severe Asthma Exacerbation',
        icdCode: 'J45.901',
        category: 'Pulmonary',
        isCorrectPrimary: true,
        isHighDifferential: true,
        rationale: 'History of asthma, trigger exposure, severe expiratory wheezing, PEF 42%, and lack of response to home inhaler.',
      },
    ],
    managementProtocols: [
      {
        id: 'mgmt-nebs',
        label: 'Continuous or back-to-back Albuterol + Ipratropium (DuoNeb) inhalation via nebulizer',
        isCorrect: true,
        feedback: 'First-line rapid bronchodilation using dual beta-2 agonist and anticholinergic.',
      },
    ],
    scoringRubric: {
      criticalActions: [
        'Recognized severe status asthmaticus with normal PaCO2 warning sign',
        'Initiated immediate combined nebulized bronchodilators + systemic steroids',
      ],
      highValueQuestions: ['Frequency of rescue inhaler use today and past compliance with ICS controller'],
      redFlagsToScreen: ['Silent chest (loss of wheeze due to severe hypoventilation)'],
    },
  },
  {
    id: 'case-abdomen-3',
    slug: 'migratory-right-lower-quadrant-pain',
    title: 'Migratory Right Lower Quadrant Abdominal Pain',
    specialty: 'Gastroenterology',
    difficulty: 'NOVICE',
    presentation: '24-year-old male with 18 hours of periumbilical pain that migrated to the right lower quadrant, associated with anorexia and low-grade fever.',
    estimatedMinutes: 14,
    tags: ['Abdominal Pain', 'General Surgery', 'Acute Appendicitis', 'Physical Exam Signs'],
    learningObjectives: [
      'Elicit classic pain migration chronology in visceral vs somatic peritoneal irritation.',
      'Perform and interpret specialized physical exam signs (McBurney point, Rovsing, Psoas).',
    ],
    patientProfile: {
      id: 'pt-marcus-vance',
      name: 'Marcus Vance',
      age: 24,
      gender: 'Male',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      occupation: 'Software Engineer',
      presentationComplaint: 'Sharp stabbing pain in my lower right belly that gets worse every time I take a step.',
      initialStatement: "Doctor, it started yesterday around dinner as a dull ache around my belly button, but now it has moved down to the right side and it feels like someone is stabbing me there.",
      mood: 'Guarded, lying still on gurney with right hip slightly flexed',
      appearance: 'Pale, visibly uncomfortable when moving or coughing.',
    },
    initialVitals: {
      heartRate: 104,
      bloodPressure: '122/76',
      respiratoryRate: 18,
      oxygenSaturation: 99,
      temperature: 38.1,
      painScore: 7,
    },
    chiefComplaint: {
      complaint: 'Migratory abdominal pain settling in RLQ',
      duration: '18 hours',
    },
    historyFacts: {
      onset: 'Began yesterday afternoon around 6:00 PM as an ill-defined dull discomfort around the navel.',
      provocationPalliative: 'Worse with any movement, walking, coughing, or car bumps. Lying still with knees curled provides slight ease.',
      quality: 'Initially dull and aching; over the last 8 hours has shifted into a constant sharp, localized stabbing sensation.',
      radiation: 'Originated periumbilically, then migrated precisely to the right lower abdomen.',
      severity: 'Currently 7/10; was 3/10 initially.',
      timing: 'Continuous and steadily intensifying over the past 18 hours.',
      associatedSymptoms: ['Complete loss of appetite (anorexia)', 'Nausea with 1 episode of bilious emesis', 'Low-grade fever and mild chills'],
      pertinentNegatives: ['No diarrhea', 'No blood in stool', 'No dysuria, hematuria, or flank pain'],
      pastMedicalHistory: ['No chronic medical conditions', 'No prior abdominal surgeries'],
      medications: ['Took 1 tablet of Acetaminophen 500 mg 4 hours ago with minimal effect'],
      allergies: ['No known allergies'],
      familyHistory: ['Non-contributory; no familial polyposis or IBD.'],
      socialHistory: ['College student, non-smoker, drinks socially on weekends.'],
    },
    physicalFindings: [
      {
        id: 'exam-abd-marcus',
        system: 'Abdominal',
        name: 'Abdominal Palpation & Peritoneal Signs',
        actionLabel: 'Palpate four quadrants, McBurney point, test Rovsing and rebound tenderness',
        findingDescription: 'Maximal tenderness located at McBurney point. Positive Rovsing sign. Localized involuntary guarding in RLQ. Mild rebound tenderness present.',
        isAbnormal: true,
        clinicalSignificance: 'Classic peritoneal signs indicating localized peritonitis of the right lower quadrant.',
      },
    ],
    investigations: [
      {
        id: 'inv-us-abd',
        category: 'Imaging',
        name: 'Ultrasound of the Appendix / Abdomen',
        turnaroundMinutes: 20,
        interpretation: 'Non-compressible, blind-ending tubular structure in the right lower quadrant measuring 8.5 mm in outer diameter (normal < 6 mm). Surrounding hypervascularity and periappendiceal hyperechoic fat stranding.',
        isAbnormal: true,
        findingsDetail: ['Target sign on cross-section with wall thickening > 2 mm.', 'Appendicolith identified at appendiceal base.'],
      },
    ],
    diagnosisOptions: [
      {
        id: 'dx-appendicitis',
        name: 'Acute Uncomplicated Appendicitis',
        icdCode: 'K35.80',
        category: 'Gastrointestinal',
        isCorrectPrimary: true,
        isHighDifferential: true,
        rationale: 'Classic periumbilical to RLQ migration, anorexia, McBurney tenderness, Rovsing sign, and US confirming 8.5mm non-compressible appendix.',
      },
    ],
    managementProtocols: [
      {
        id: 'mgmt-npo',
        label: 'Place patient NPO immediately and start IV crystalloid fluid resuscitation',
        isCorrect: true,
        feedback: 'Prepares the patient safely for surgical anesthesia and corrects dehydration.',
      },
    ],
    scoringRubric: {
      criticalActions: [
        'Recognized classic pain migration from visceral periumbilical to somatic peritoneal RLQ',
        'Demonstrated positive McBurney point tenderness and Rovsing sign',
      ],
      highValueQuestions: ['Chronology of pain onset and location change (migration)', 'Presence of anorexia'],
      redFlagsToScreen: ['Sudden transient relief of pain followed by diffuse peritonitis (Appendiceal Perforation)'],
    },
  },
  {
    id: 'case-cap-4',
    slug: 'fever-productive-cough-altered-mental-status',
    title: 'Fever, Productive Cough & Altered Mental Status',
    specialty: 'Emergency Medicine',
    difficulty: 'ADVANCED',
    presentation: '72-year-old female brought by daughter with 4-day history of high fever, rust-colored sputum, worsening tachypnea, and new confusion.',
    estimatedMinutes: 16,
    tags: ['Fever', 'Infectious Disease', 'Pneumonia', 'Sepsis', 'Geriatrics'],
    learningObjectives: [
      'Evaluate sepsis criteria and CURB-65 severity scoring in geriatric respiratory infections.',
      'Implement Sepsis-3 bundle within the first golden hour.',
    ],
    patientProfile: {
      id: 'pt-margaret-davis',
      name: 'Margaret Davis',
      age: 72,
      gender: 'Female',
      avatarUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=150&auto=format&fit=crop&q=80',
      occupation: 'Retired Teacher',
      presentationComplaint: 'High fever, shaking chills, and a deep cough with brownish-red phlegm.',
      initialStatement: "I feel... so cold and weak, Doctor... My chest hurts on the right side when I breathe... Where is my daughter?",
      mood: 'Lethargic, shivering, oriented only to person and year',
      appearance: 'Flushed cheeks, accessory muscle use, coughing weakly with rusty sputum.',
    },
    initialVitals: {
      heartRate: 118,
      bloodPressure: '92/58',
      respiratoryRate: 32,
      oxygenSaturation: 88,
      temperature: 38.9,
      painScore: 5,
    },
    chiefComplaint: {
      complaint: 'Fever, rust sputum, and altered mental status',
      duration: '4 days',
    },
    historyFacts: {
      onset: 'Started 4 days ago with shivering rigors and mild nonproductive cough; worsened dramatically over the last 24 hours.',
      provocationPalliative: 'Coughing and deep inhalation trigger sharp pleuritic right-sided chest pain.',
      quality: 'Deep rattling congestion with rusty brown sputum.',
      radiation: 'Right lower chest pain radiates slightly around the flank.',
      severity: 'Patient is too confused to reliably rate on 0-10 scale; daughter notes severe decline.',
      timing: 'Continuous over 4 days with acute mental status clouding today.',
      associatedSymptoms: ['Rigors / shaking chills', 'Rusty-colored thick sputum', 'New confusion / somnolence', 'Loss of appetite and profound weakness'],
      pertinentNegatives: ['No calf swelling or deep vein thrombosis history', 'No recent international travel', 'No history of choking or dysphagia'],
      pastMedicalHistory: ['Type 2 Diabetes Mellitus (well-controlled, HbA1c 6.8%)', 'Osteoarthritis of knees'],
      medications: ['Metformin 500 mg twice daily', 'Daily multivitamin'],
      allergies: ['No known allergies'],
      familyHistory: ['Mother died of stroke at 80.'],
      socialHistory: ['Former smoker (quit 30 years ago, 5 pack-years)', 'Lives with husband, active in community church until 4 days ago.'],
    },
    physicalFindings: [
      {
        id: 'exam-pulm-margaret',
        system: 'Respiratory',
        name: 'Chest Auscultation & Percussion',
        actionLabel: 'Auscultate right lower lobe and test tactile fremitus / egophony',
        findingDescription: 'Dullness to percussion over right lower lung base. Coarse inspiratory crackles and bronchial breath sounds audible over right lower lobe.',
        isAbnormal: true,
        clinicalSignificance: 'Definite lobar consolidation signs of right lower lobe.',
      },
    ],
    investigations: [
      {
        id: 'inv-cxr-margaret',
        category: 'Imaging',
        name: 'Chest Radiograph (PA & Lateral)',
        turnaroundMinutes: 15,
        interpretation: 'Dense homogeneous airspace consolidation occupying the right lower lobe with visible air bronchograms. Small right-sided parapneumonic pleural effusion.',
        isAbnormal: true,
        findingsDetail: ['Right lower lobe lobar pneumonia with secondary parapneumonic effusion.'],
      },
    ],
    diagnosisOptions: [
      {
        id: 'dx-cap-sepsis',
        name: 'Severe Community-Acquired Pneumonia with Sepsis (Streptococcal)',
        icdCode: 'J13',
        category: 'Infectious',
        isCorrectPrimary: true,
        isHighDifferential: true,
        rationale: 'Elderly patient with high fever, rust sputum, lobar consolidation, confusion, tachypnea (RR 32), hypotension, and elevated lactate.',
      },
    ],
    managementProtocols: [
      {
        id: 'mgmt-sepsis-bundle',
        label: 'Hour-1 Sepsis Bundle: IV Crystalloid bolus (30 mL/kg), draw Blood Cultures, measure Lactate',
        isCorrect: true,
        feedback: 'Critical resuscitation for sepsis-induced tissue hypoperfusion and hypotension.',
      },
    ],
    scoringRubric: {
      criticalActions: [
        'Recognized Sepsis-3 criteria and calculated CURB-65 score >= 3',
        'Initiated 1-Hour Sepsis Bundle: 30mL/kg IV fluids and blood cultures prior to antibiotics',
      ],
      highValueQuestions: ['Color and consistency of sputum (rust-colored indicates S. pneumoniae)', 'Acute onset of confusion compared to baseline'],
      redFlagsToScreen: ['Hypotension refractory to initial crystalloids (Septic Shock)'],
    },
  },
];
