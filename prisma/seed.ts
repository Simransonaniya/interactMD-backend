import { PrismaClient, UserRole, OrgType, CaseDifficulty, CaseVersionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding InteractMD database...');

  // 1. Seed Organizations
  const org = await prisma.organization.upsert({
    where: { id: 'org-demo-1' },
    update: {},
    create: {
      id: 'org-demo-1',
      name: 'InteractMD Medical Academy',
      type: OrgType.MEDICAL_SCHOOL,
    },
  });

  // 2. Seed Users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const learner = await prisma.user.upsert({
    where: { email: 'learner@interactmd.com' },
    update: {},
    create: {
      id: 'user-learner-1',
      email: 'learner@interactmd.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: UserRole.LEARNER,
      organizationId: org.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'educator@interactmd.com' },
    update: {},
    create: {
      id: 'user-educator-1',
      email: 'educator@interactmd.com',
      passwordHash,
      firstName: 'David',
      lastName: 'Chen',
      role: UserRole.EDUCATOR,
      organizationId: org.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@interactmd.com' },
    update: {},
    create: {
      id: 'user-admin-1',
      email: 'admin@interactmd.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Director',
      role: UserRole.ADMIN,
      organizationId: org.id,
    },
  });

  // 3. Seed Clinical Cases & Versions
  const casesData = [
    {
      id: 'case-acs-1',
      slug: 'acute-crushing-retrosternal-chest-pain',
      title: 'Acute Crushing Retrosternal Chest Pain',
      specialty: 'Cardiology',
      difficulty: CaseDifficulty.INTERMEDIATE,
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
  ];

  for (const c of casesData) {
    const clinicalCase = await prisma.case.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        id: c.id,
        slug: c.slug,
        title: c.title,
        specialty: c.specialty,
        difficulty: c.difficulty,
        presentation: c.presentation,
        estimatedMinutes: c.estimatedMinutes,
        tags: c.tags,
        learningObjectives: c.learningObjectives,
        authorId: learner.id,
      },
    });

    await prisma.caseVersion.upsert({
      where: {
        caseId_versionNumber: {
          caseId: clinicalCase.id,
          versionNumber: 1,
        },
      },
      update: {},
      create: {
        caseId: clinicalCase.id,
        versionNumber: 1,
        status: CaseVersionStatus.PUBLISHED,
        patientProfile: c.patientProfile,
        initialVitals: c.initialVitals,
        chiefComplaint: c.chiefComplaint,
        historyFacts: c.historyFacts,
        physicalFindings: c.physicalFindings,
        investigations: c.investigations,
        diagnosisOptions: c.diagnosisOptions,
        managementProtocols: c.managementProtocols,
        scoringRubric: c.scoringRubric,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
