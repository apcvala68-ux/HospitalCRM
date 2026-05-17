import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';
import Ward from '../models/Ward.js';
import Bed from '../models/Bed.js';
import MedicineMaster from '../models/MedicineMaster.js';
import Patient from '../models/Patient.js';
import QueueToken from '../models/QueueToken.js';
import Vitals from '../models/Vitals.js';
import Prescription from '../models/Prescription.js';
import LabOrder from '../models/LabOrder.js';
import Billing from '../models/Billing.js';
import IPDAdmission from '../models/IPDAdmission.js';
import Appointment from '../models/Appointment.js';

const DEPARTMENTS = [
  { name: 'General Medicine', description: 'Primary care and internal medicine', location: 'Ground Floor' },
  { name: 'Cardiology', description: 'Heart and cardiovascular system', location: '1st Floor' },
  { name: 'Orthopedics', description: 'Bones, joints, and muscles', location: '1st Floor' },
  { name: 'Pediatrics', description: 'Child healthcare', location: '2nd Floor' },
  { name: 'Gynecology', description: 'Women\'s health', location: '2nd Floor' },
  { name: 'ENT', description: 'Ear, Nose, Throat', location: '2nd Floor' },
  { name: 'Dermatology', description: 'Skin and hair care', location: '3rd Floor' },
  { name: 'Neurology', description: 'Brain and nervous system', location: '3rd Floor' },
];

const WARDS = [
  { name: 'Wing A - General', type: 'general', floor: 'Ground', bedCount: 6, ratePerDay: 500 },
  { name: 'Wing B - Semi Private', type: 'semi-private', floor: '1st', bedCount: 6, ratePerDay: 1500 },
  { name: 'Wing C - Private', type: 'private', floor: '2nd', bedCount: 6, ratePerDay: 3000 },
  { name: 'ICU', type: 'icu', floor: '3rd', bedCount: 6, ratePerDay: 8000 },
];

const MEDICINES = [
  { name: 'Paracetamol 500mg', genericName: 'Paracetamol', category: 'Analgesic', unit: 'tablet', reorderLevel: 100 },
  { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Antibiotic', unit: 'capsule', reorderLevel: 50 },
  { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'PPI', unit: 'capsule', reorderLevel: 50 },
  { name: 'Amlodipine 5mg', genericName: 'Amlodipine', category: 'Antihypertensive', unit: 'tablet', reorderLevel: 30 },
  { name: 'Metformin 500mg', genericName: 'Metformin', category: 'Antidiabetic', unit: 'tablet', reorderLevel: 30 },
  { name: 'Cetirizine 10mg', genericName: 'Cetirizine', category: 'Antihistamine', unit: 'tablet', reorderLevel: 40 },
  { name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotic', unit: 'tablet', reorderLevel: 20 },
  { name: 'Dolo 650mg', genericName: 'Paracetamol', category: 'Analgesic', unit: 'tablet', reorderLevel: 100 },
  { name: 'Augmentin 625 Duo', genericName: 'Amoxicillin + Clavulanic Acid', category: 'Antibiotic', unit: 'tablet', reorderLevel: 25 },
  { name: 'Pantoprazole 40mg', genericName: 'Pantoprazole', category: 'PPI', unit: 'injection', reorderLevel: 20 },
  { name: 'Losartan 50mg', genericName: 'Losartan', category: 'Antihypertensive', unit: 'tablet', reorderLevel: 30 },
  { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', category: 'Statin', unit: 'tablet', reorderLevel: 30 },
  { name: 'Levothyroxine 50mcg', genericName: 'Levothyroxine', category: 'Thyroid', unit: 'tablet', reorderLevel: 30 },
  { name: 'Ranitidine 150mg', genericName: 'Ranitidine', category: 'PPI', unit: 'tablet', reorderLevel: 40 },
  { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Analgesic', unit: 'tablet', reorderLevel: 50 },
];

const PATIENT_PROFILES = [
  {
    firstName: 'Rajesh', lastName: 'Sharma', dob: '1975-03-15', gender: 'male', phone: '9876543201',
    email: 'rajesh.sharma@email.com', bloodGroup: 'B+',
    address: { street: '42 MG Road', city: 'Mumbai', state: 'Maharashtra', zip: '400001', pincode: '400001' },
    aadhaar: '1234-5678-9012', maritalStatus: 'married', occupation: 'Software Engineer',
    medicalHistory: {
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      surgeries: ['Appendectomy (2010)'],
      familyHistory: ['Father - Diabetes', 'Mother - Hypertension'],
      immunizations: ['Hepatitis B', 'Tetanus'],
      habits: { smoking: 'former', alcohol: 'occasional', tobacco: 'never' },
    },
    insurance: { provider: 'MediAssist', policyNo: 'MA-2024-55432', expiry: '2026-12-31' },
    allergies: ['Penicillin'],
    emergencyContact: { name: 'Sunita Sharma', phone: '9876543202', relation: 'Spouse' },
  },
  {
    firstName: 'Priya', lastName: 'Patel', dob: '1988-07-22', gender: 'female', phone: '9876543203',
    email: 'priya.patel@email.com', bloodGroup: 'O+',
    address: { street: '15 Linking Road, Bandra', city: 'Mumbai', state: 'Maharashtra', zip: '400050', pincode: '400050' },
    aadhaar: '2345-6789-0123', maritalStatus: 'married', occupation: 'Teacher',
    medicalHistory: {
      conditions: ['Asthma'],
      surgeries: [],
      familyHistory: ['Father - Asthma'],
      immunizations: ['Flu Shot', 'COVID-19'],
      habits: { smoking: 'never', alcohol: 'never', tobacco: 'never' },
    },
    insurance: { provider: 'Star Health', policyNo: 'SH-2024-88765', expiry: '2025-08-15' },
    allergies: ['Dust', 'Pollen'],
    emergencyContact: { name: 'Amit Patel', phone: '9876543204', relation: 'Spouse' },
  },
  {
    firstName: 'Vikram', lastName: 'Singh', dob: '1962-11-08', gender: 'male', phone: '9876543205',
    email: 'vikram.singh@email.com', bloodGroup: 'A+',
    address: { street: '88 Civil Lines', city: 'Pune', state: 'Maharashtra', zip: '411001', pincode: '411001' },
    aadhaar: '3456-7890-1234', maritalStatus: 'married', occupation: 'Business Owner',
    medicalHistory: {
      conditions: ['Coronary Artery Disease', 'Hyperlipidemia'],
      surgeries: ['Angioplasty (2019)', 'CABG (2021)'],
      familyHistory: ['Father - Heart Disease', 'Brother - Diabetes'],
      immunizations: ['Pneumococcal', 'Flu Shot'],
      habits: { smoking: 'never', alcohol: 'occasional', tobacco: 'never' },
    },
    insurance: { provider: 'ICICI Lombard', policyNo: 'IL-2024-11223', expiry: '2026-06-30' },
    allergies: ['Aspirin'],
    emergencyContact: { name: 'Kavita Singh', phone: '9876543206', relation: 'Spouse' },
  },
  {
    firstName: 'Anita', lastName: 'Reddy', dob: '1995-01-30', gender: 'female', phone: '9876543207',
    email: 'anita.reddy@email.com', bloodGroup: 'AB+',
    address: { street: '23 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', zip: '500033', pincode: '500033' },
    aadhaar: '4567-8901-2345', maritalStatus: 'single', occupation: 'Data Analyst',
    medicalHistory: {
      conditions: [],
      surgeries: [],
      familyHistory: ['Mother - Thyroid'],
      immunizations: ['HPV', 'Hepatitis B', 'COVID-19'],
      habits: { smoking: 'never', alcohol: 'never', tobacco: 'never' },
    },
    insurance: { provider: 'HDFC Ergo', policyNo: 'HE-2024-44556', expiry: '2025-11-30' },
    allergies: [],
    emergencyContact: { name: 'Ravi Reddy', phone: '9876543208', relation: 'Father' },
  },
  {
    firstName: 'Mohammed', lastName: 'Khan', dob: '1980-05-14', gender: 'male', phone: '9876543209',
    email: 'mohammed.khan@email.com', bloodGroup: 'B-',
    address: { street: '56 Park Street', city: 'Kolkata', state: 'West Bengal', zip: '700016', pincode: '700016' },
    aadhaar: '5678-9012-3456', maritalStatus: 'married', occupation: 'Accountant',
    medicalHistory: {
      conditions: ['Chronic Kidney Disease Stage 3'],
      surgeries: ['Kidney Stone Removal (2018)'],
      familyHistory: ['Father - Kidney Disease'],
      immunizations: ['Hepatitis B'],
      habits: { smoking: 'never', alcohol: 'never', tobacco: 'never' },
    },
    insurance: { provider: 'Max Bupa', policyNo: 'MB-2024-77889', expiry: '2026-03-31' },
    allergies: ['Ibuprofen', 'Contrast Dye'],
    emergencyContact: { name: 'Fatima Khan', phone: '9876543210', relation: 'Spouse' },
  },
  {
    firstName: 'Lakshmi', lastName: 'Nair', dob: '1970-09-25', gender: 'female', phone: '9876543211',
    email: 'lakshmi.nair@email.com', bloodGroup: 'O-',
    address: { street: '12 MG Road', city: 'Kochi', state: 'Kerala', zip: '682001', pincode: '682001' },
    aadhaar: '6789-0123-4567', maritalStatus: 'widowed', occupation: 'Retired Nurse',
    medicalHistory: {
      conditions: ['Osteoarthritis', 'Hypothyroidism'],
      surgeries: ['Knee Replacement (2022)'],
      familyHistory: ['Sister - Arthritis'],
      immunizations: ['Tetanus', 'Flu Shot'],
      habits: { smoking: 'never', alcohol: 'never', tobacco: 'never' },
    },
    insurance: { provider: 'National Insurance', policyNo: 'NI-2024-33445', expiry: '2025-12-31' },
    allergies: ['Latex'],
    emergencyContact: { name: 'Arun Nair', phone: '9876543212', relation: 'Son' },
  },
  {
    firstName: 'Arjun', lastName: 'Menon', dob: '2015-04-10', gender: 'male', phone: '9876543213',
    email: 'arjun.m.parent@email.com', bloodGroup: 'A-',
    address: { street: '34 Residency Road', city: 'Bangalore', state: 'Karnataka', zip: '560025', pincode: '560025' },
    aadhaar: '7890-1234-5678', maritalStatus: 'single', occupation: 'Student',
    medicalHistory: {
      conditions: ['Mild Autism Spectrum'],
      surgeries: [],
      familyHistory: [],
      immunizations: ['BCG', 'Polio', 'MMR', 'DPT', 'Hepatitis B', 'Varicella'],
      habits: { smoking: 'never', alcohol: 'never', tobacco: 'never' },
    },
    insurance: { provider: 'Care Health', policyNo: 'CH-2024-99001', expiry: '2026-01-31' },
    allergies: ['Eggs', 'Peanuts'],
    emergencyContact: { name: 'Deepa Menon', phone: '9876543214', relation: 'Mother' },
  },
  {
    firstName: 'Kavitha', lastName: 'Joshi', dob: '1992-12-03', gender: 'female', phone: '9876543215',
    email: 'kavitha.joshi@email.com', bloodGroup: 'B+',
    address: { street: '77 FC Road', city: 'Pune', state: 'Maharashtra', zip: '411004', pincode: '411004' },
    aadhaar: '8901-2345-6789', maritalStatus: 'married', occupation: 'Architect',
    medicalHistory: {
      conditions: ['PCOS', 'Iron Deficiency Anemia'],
      surgeries: [],
      familyHistory: ['Mother - PCOS', 'Grandmother - Diabetes'],
      immunizations: ['COVID-19', 'Tetanus'],
      habits: { smoking: 'never', alcohol: 'occasional', tobacco: 'never' },
    },
    insurance: { provider: 'Aditya Birla Health', policyNo: 'AB-2024-22334', expiry: '2025-10-15' },
    allergies: ['Sulfa Drugs'],
    emergencyContact: { name: 'Rahul Joshi', phone: '9876543216', relation: 'Spouse' },
  },
  {
    firstName: 'Suresh', lastName: 'Gupta', dob: '1958-06-18', gender: 'male', phone: '9876543217',
    email: 'suresh.gupta@email.com', bloodGroup: 'AB-',
    address: { street: '90 Connaught Place', city: 'New Delhi', state: 'Delhi', zip: '110001', pincode: '110001' },
    aadhaar: '9012-3456-7890', maritalStatus: 'married', occupation: 'Retired IAS Officer',
    medicalHistory: {
      conditions: ['COPD', 'Benign Prostatic Hyperplasia', 'Glaucoma'],
      surgeries: ['Cataract Surgery (2020)', 'Prostate Biopsy (2022)'],
      familyHistory: ['Brother - COPD'],
      immunizations: ['Pneumococcal', 'Flu Shot', 'Shingles'],
      habits: { smoking: 'former', alcohol: 'never', tobacco: 'former' },
    },
    insurance: { provider: 'CGHS', policyNo: 'CGHS-DEL-12345', expiry: '2026-12-31' },
    allergies: ['Codeine'],
    emergencyContact: { name: 'Meena Gupta', phone: '9876543218', relation: 'Spouse' },
  },
  {
    firstName: 'Deepa', lastName: 'Verma', dob: '1985-08-27', gender: 'female', phone: '9876543219',
    email: 'deepa.verma@email.com', bloodGroup: 'O+',
    address: { street: '45 Sector 17', city: 'Chandigarh', state: 'Punjab', zip: '160017', pincode: '160017' },
    aadhaar: '0123-4567-8901', maritalStatus: 'married', occupation: 'HR Manager',
    medicalHistory: {
      conditions: ['Migraine', 'Vitamin D Deficiency'],
      surgeries: ['C-Section (2018)', 'C-Section (2021)'],
      familyHistory: ['Mother - Migraine'],
      immunizations: ['Tdap', 'COVID-19', 'Flu Shot'],
      habits: { smoking: 'never', alcohol: 'never', tobacco: 'never' },
    },
    insurance: { provider: 'Reliance General', policyNo: 'RG-2024-66778', expiry: '2025-09-30' },
    allergies: [],
    emergencyContact: { name: 'Nitin Verma', phone: '9876543220', relation: 'Spouse' },
  },
];

const CHIEF_COMPLAINTS = [
  'Fever with chills for 3 days',
  'Chest pain on exertion',
  'Severe headache and dizziness',
  'Persistent cough with sputum',
  'Abdominal pain - right lower quadrant',
  'Joint pain in knees and wrists',
  'Skin rash on arms and trunk',
  'Shortness of breath on exertion',
  'Frequent urination and increased thirst',
  'Back pain radiating to left leg',
  'Nausea and vomiting for 2 days',
  'Swelling in both feet',
  'Ear pain and hearing difficulty',
  'Irregular menstrual cycles',
  'Child vaccination checkup',
  'Follow-up for hypertension management',
  'Diabetes review - HbA1c check',
  'Post-surgical wound check',
  'Allergic reaction - hives',
  'Throat pain with difficulty swallowing',
];

const DIAGNOSES = [
  { code: 'J06.9', description: 'Acute Upper Respiratory Infection' },
  { code: 'I10', description: 'Essential Hypertension' },
  { code: 'E11.9', description: 'Type 2 Diabetes Mellitus' },
  { code: 'J45.9', description: 'Asthma, Unspecified' },
  { code: 'M54.5', description: 'Low Back Pain' },
  { code: 'K21.0', description: 'GERD with Esophagitis' },
  { code: 'N39.0', description: 'Urinary Tract Infection' },
  { code: 'L30.9', description: 'Dermatitis, Unspecified' },
  { code: 'I25.10', description: 'Atherosclerotic Heart Disease' },
  { code: 'M81.0', description: 'Age-Related Osteoporosis' },
  { code: 'E78.0', description: 'Pure Hypercholesterolemia' },
  { code: 'E03.9', description: 'Hypothyroidism, Unspecified' },
  { code: 'G43.9', description: 'Migraine, Unspecified' },
  { code: 'D50.9', description: 'Iron Deficiency Anemia' },
  { code: 'J18.9', description: 'Pneumonia, Unspecified' },
  { code: 'K30', description: 'Functional Dyspepsia' },
  { code: 'M17.9', description: 'Gonarthrosis, Unspecified' },
  { code: 'H10.9', description: 'Conjunctivitis, Unspecified' },
  { code: 'L20.9', description: 'Atopic Dermatitis' },
  { code: 'Z00.00', description: 'General Adult Medical Examination' },
];

const LAB_TESTS = [
  { name: 'CBC (Complete Blood Count)', category: 'hematology', unit: '', normalRange: 'WBC: 4-11K, Hb: 12-17g/dL' },
  { name: 'Blood Sugar Fasting', category: 'biochemistry', unit: 'mg/dL', normalRange: '70-100' },
  { name: 'Blood Sugar PP', category: 'biochemistry', unit: 'mg/dL', normalRange: '<140' },
  { name: 'HbA1c', category: 'biochemistry', unit: '%', normalRange: '4.0-5.6' },
  { name: 'Lipid Profile', category: 'biochemistry', unit: 'mg/dL', normalRange: 'TC: <200, LDL: <100, HDL: >40' },
  { name: 'Thyroid Profile (T3, T4, TSH)', category: 'biochemistry', unit: 'mIU/L', normalRange: 'TSH: 0.4-4.0' },
  { name: 'Liver Function Test', category: 'biochemistry', unit: '', normalRange: 'ALT: 7-56, AST: 10-40' },
  { name: 'Kidney Function Test', category: 'biochemistry', unit: '', normalRange: 'Creatinine: 0.6-1.2, BUN: 7-20' },
  { name: 'Urine Routine', category: 'urinalysis', unit: '', normalRange: 'No protein, no sugar' },
  { name: 'ECG', category: 'radiology', unit: '', normalRange: 'Normal sinus rhythm' },
  { name: 'Chest X-Ray PA', category: 'radiology', unit: '', normalRange: 'No infiltrates' },
  { name: 'Echocardiogram', category: 'radiology', unit: '', normalRange: 'EF: 55-70%' },
  { name: 'Vitamin D', category: 'biochemistry', unit: 'ng/mL', normalRange: '30-100' },
  { name: 'Vitamin B12', category: 'biochemistry', unit: 'pg/mL', normalRange: '200-900' },
  { name: 'CRP', category: 'serology', unit: 'mg/L', normalRange: '<3.0' },
  { name: 'D-Dimer', category: 'hematology', unit: 'ng/mL', normalRange: '<500' },
  { name: 'PT/INR', category: 'hematology', unit: '', normalRange: 'INR: 0.8-1.2' },
  { name: 'Iron Studies', category: 'biochemistry', unit: 'mcg/dL', normalRange: 'Serum Iron: 60-170' },
  { name: 'H. pylori Antigen', category: 'microbiology', unit: '', normalRange: 'Negative' },
  { name: 'Dengue NS1 Antigen', category: 'serology', unit: '', normalRange: 'Negative' },
];

const RX_MEDICINES = [
  { name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'SOS', duration: '5 days', route: 'oral', instructions: 'Take after food for fever/pain' },
  { name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once daily (morning)', duration: '30 days', route: 'oral', instructions: 'Monitor BP daily' },
  { name: 'Metformin 500mg', dosage: '500mg', frequency: 'Twice daily (after meals)', duration: '30 days', route: 'oral', instructions: 'Take with food' },
  { name: 'Omeprazole 20mg', dosage: '20mg', frequency: 'Once daily (before breakfast)', duration: '14 days', route: 'oral', instructions: 'Take 30 min before food' },
  { name: 'Azithromycin 500mg', dosage: '500mg', frequency: 'Once daily', duration: '3 days', route: 'oral', instructions: 'Complete full course' },
  { name: 'Cetirizine 10mg', dosage: '10mg', frequency: 'Once daily (night)', duration: '7 days', route: 'oral', instructions: 'May cause drowsiness' },
  { name: 'Losartan 50mg', dosage: '50mg', frequency: 'Once daily', duration: '30 days', route: 'oral', instructions: 'Monitor BP and K+ levels' },
  { name: 'Atorvastatin 10mg', dosage: '10mg', frequency: 'Once daily (night)', duration: '30 days', route: 'oral', instructions: 'Avoid grapefruit juice' },
  { name: 'Levothyroxine 50mcg', dosage: '50mcg', frequency: 'Once daily (empty stomach)', duration: '90 days', route: 'oral', instructions: 'Take 30 min before breakfast' },
  { name: 'Ibuprofen 400mg', dosage: '400mg', frequency: 'TDS after meals', duration: '5 days', route: 'oral', instructions: 'Take with food' },
  { name: 'Pantoprazole 40mg', dosage: '40mg', frequency: 'Once daily', duration: '7 days', route: 'oral', instructions: 'Before breakfast' },
  { name: 'Amoxicillin 250mg', dosage: '250mg', frequency: 'TDS', duration: '7 days', route: 'oral', instructions: 'Complete full course' },
  { name: 'Dolo 650mg', dosage: '650mg', frequency: 'TDS SOS', duration: '5 days', route: 'oral', instructions: 'For fever > 100°F' },
  { name: 'Augmentin 625 Duo', dosage: '625mg', frequency: 'BD', duration: '5 days', route: 'oral', instructions: 'Take with food' },
];

const FOLLOW_UPS = [null, null, null, '1 week', '2 weeks', '1 month', '3 months', null, null, '6 months'];

function randomDate(daysBack) {
  const now = new Date();
  const past = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomN(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Department.deleteMany({}), Doctor.deleteMany({}),
      Ward.deleteMany({}), Bed.deleteMany({}), MedicineMaster.deleteMany({}),
      Patient.deleteMany({}), QueueToken.deleteMany({}), Vitals.deleteMany({}),
      Prescription.deleteMany({}), LabOrder.deleteMany({}), Billing.deleteMany({}),
      IPDAdmission.deleteMany({}), Appointment.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create users
    const users = await User.create([
      { name: 'Admin User', email: 'admin@hospital.com', password: 'Admin@123', role: 'admin', phone: '9999999999' },
      { name: 'Dr. Rajesh Sharma', email: 'sharma@hospital.com', password: 'Doctor@123', role: 'doctor', phone: '9999999998' },
      { name: 'Dr. Priya Patel', email: 'patel@hospital.com', password: 'Doctor@123', role: 'doctor', phone: '9999999997' },
      { name: 'Dr. Vikram Singh', email: 'singh@hospital.com', password: 'Doctor@123', role: 'doctor', phone: '9999999996' },
      { name: 'Dr. Anita Reddy', email: 'reddy@hospital.com', password: 'Doctor@123', role: 'doctor', phone: '9999999995' },
      { name: 'Dr. Lakshmi Nair', email: 'nair@hospital.com', password: 'Doctor@123', role: 'doctor', phone: '9999999994' },
      { name: 'Nurse Meena', email: 'meena@hospital.com', password: 'Staff@123', role: 'nurse', phone: '9999999993' },
      { name: 'Receptionist Tina', email: 'tina@hospital.com', password: 'Staff@123', role: 'receptionist', phone: '9999999992' },
      { name: 'Cashier Raj', email: 'raj@hospital.com', password: 'Staff@123', role: 'cashier', phone: '9999999991' },
      { name: 'Pharmacist Kumar', email: 'kumar@hospital.com', password: 'Staff@123', role: 'pharmacist', phone: '9999999990' },
      { name: 'Lab Tech Suresh', email: 'suresh@hospital.com', password: 'Staff@123', role: 'nurse', phone: '9999999989' },
    ]);
    console.log(`Created ${users.length} users`);

    const adminUser = users[0];
    const doctorUsers = users.slice(1, 6);
    const nurseUser = users[6];
    const receptionistUser = users[7];
    const cashierUser = users[8];
    const pharmacistUser = users[9];
    const labTechUser = users[10];

    // Create departments
    const departments = await Department.create(DEPARTMENTS);
    console.log(`Created ${departments.length} departments`);

    // Create doctors with detailed profiles
    const doctorProfiles = [
      { user: doctorUsers[0], specialization: 'General Physician', licenseNo: 'MCI-2020-001', dept: 0, fee: 500, quals: ['MBBS', 'MD General Medicine'], schedule: { start: '09:00', end: '17:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday'] } },
      { user: doctorUsers[1], specialization: 'Cardiologist', licenseNo: 'MCI-2018-002', dept: 1, fee: 1200, quals: ['MBBS', 'MD Medicine', 'DM Cardiology'], schedule: { start: '10:00', end: '16:00', days: ['monday','tuesday','wednesday','thursday','friday'] } },
      { user: doctorUsers[2], specialization: 'Orthopedic Surgeon', licenseNo: 'MCI-2015-003', dept: 2, fee: 1000, quals: ['MBBS', 'MS Orthopedics'], schedule: { start: '09:00', end: '15:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday'] } },
      { user: doctorUsers[3], specialization: 'Pediatrician', licenseNo: 'MCI-2019-004', dept: 3, fee: 700, quals: ['MBBS', 'MD Pediatrics'], schedule: { start: '10:00', end: '17:00', days: ['monday','tuesday','wednesday','thursday','friday'] } },
      { user: doctorUsers[4], specialization: 'Gynecologist', licenseNo: 'MCI-2017-005', dept: 4, fee: 900, quals: ['MBBS', 'MS Obstetrics & Gynecology'], schedule: { start: '09:00', end: '15:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday'] } },
    ];

    const doctors = await Doctor.create(doctorProfiles.map(dp => ({
      user: dp.user,
      specialization: dp.specialization,
      licenseNo: dp.licenseNo,
      department: departments[dp.dept]._id,
      consultationFee: dp.fee,
      qualifications: dp.quals,
      schedule: ['monday','tuesday','wednesday','thursday','friday','saturday'].map(d => ({
        day: d,
        startTime: dp.schedule.start,
        endTime: dp.schedule.end,
        isAvailable: dp.schedule.days.includes(d),
      })),
    })));
    console.log(`Created ${doctors.length} doctors`);

    // Update department heads
    for (let i = 0; i < 5; i++) {
      await Department.findByIdAndUpdate(departments[i]._id, { headDoctor: doctors[i]._id });
    }

    // Create wards and beds
    const wards = await Ward.create(WARDS);
    const bedData = [];
    for (const ward of wards) {
      const w = await Ward.findById(ward._id);
      for (let i = 1; i <= w.bedCount; i++) {
        bedData.push({
          ward: ward._id,
          bedNo: `${ward.name.split(' - ')[0]}-${String(i).padStart(2, '0')}`,
          status: 'available',
        });
      }
    }
    await Bed.create(bedData);
    console.log(`Created ${wards.length} wards with ${bedData.length} beds`);

    // Create medicines
    await MedicineMaster.create(MEDICINES);
    console.log(`Created ${MEDICINES.length} medicines`);

    // Create detailed patients
    const patients = await Patient.create(PATIENT_PROFILES.map((p, i) => ({
      ...p,
      uhid: `HOSP-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(i+1).padStart(5,'0')}`,
      dob: new Date(p.dob),
      insurance: p.insurance ? { ...p.insurance, expiry: new Date(p.insurance.expiry) } : undefined,
      registeredBy: receptionistUser._id,
    })));
    console.log(`Created ${patients.length} detailed patients`);

    // Create 30 more generic patients
    const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Sai', 'Ishita', 'Kavya', 'Ravi', 'Sita', 'Ram', 'Vijay', 'Shanthi', 'Mohan', 'Radha', 'Geetha', 'Anitha', 'Mahesh', 'Latha', 'Satish', 'Padma', 'Neha', 'Pooja', 'Rahul', 'Amit', 'Sunita', 'Kiran', 'Sneha', 'Prakash', 'Rekha', 'Sanjay'];
    const lastNames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Reddy', 'Joshi', 'Nair', 'Menon'];
    const genericPatients = [];
    for (let i = 0; i < 30; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      genericPatients.push({
        uhid: `HOSP-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(patients.length + i + 1).padStart(5,'0')}`,
        firstName,
        lastName,
        dob: new Date(1960 + Math.floor(Math.random() * 50), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: i % 2 === 0 ? 'male' : 'female',
        phone: `9876${String(54030 + i).slice(0, 5)}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        address: { street: `${100 + i} Main Road`, city: 'Mumbai', state: 'Maharashtra', zip: '400001', pincode: '400001' },
        bloodGroup: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][Math.floor(Math.random() * 8)],
        allergies: Math.random() > 0.7 ? [pickRandom(['Penicillin', 'Aspirin', 'Dust', 'Pollen'])] : [],
        emergencyContact: { name: `${pickRandom(['Amit', 'Sunita', 'Rahul', 'Pooja'])} ${lastName}`, phone: `9988${String(76030 + i).slice(0, 5)}`, relation: pickRandom(['Spouse', 'Parent', 'Sibling']) },
        registeredBy: receptionistUser._id,
      });
    }
    await Patient.create(genericPatients);
    console.log(`Created ${genericPatients.length} additional patients`);

    const allPatients = [...patients, ...(await Patient.find({}).sort({ createdAt: 1 }).skip(patients.length))];

    // Seed Vitals, Prescriptions, Lab Orders, Billing for each detailed patient
    const labOrderCounter = { current: 0 };
    const invoiceCounter = { current: 0 };

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const doctor = doctors[i % doctors.length];
      const dept = departments[i % departments.length];

      // Create vitals (1-3 visits per patient)
      const numVisits = randomInt(1, 3);
      for (let v = 0; v < numVisits; v++) {
        const visitDate = randomDate(90);
        const bpSys = randomInt(100, 180);
        const bpDia = randomInt(60, 110);
        const pulse = randomInt(60, 110);
        const temp = (36.1 + Math.random() * 1.5).toFixed(1);
        const weight = randomInt(40, 100);
        const height = randomInt(140, 185);
        const spo2 = randomInt(92, 100);

        const vitals = await Vitals.create({
          patient: patient._id,
          bpSystolic: bpSys,
          bpDiastolic: bpDia,
          pulse,
          temperature: parseFloat(temp),
          weight,
          height,
          spo2,
          respiratoryRate: randomInt(12, 24),
          bloodSugar: Math.random() > 0.5 ? randomInt(70, 300) : undefined,
          chiefComplaint: CHIEF_COMPLAINTS[i % CHIEF_COMPLAINTS.length],
          painScore: randomInt(0, 8),
          triageNotes: v === 0 ? 'Initial assessment' : 'Follow-up visit',
          recordedBy: nurseUser._id,
          createdAt: visitDate,
        });

        // Create queue token for this visit
        const tokenStatuses = ['completed', 'completed', 'completed', 'with-doctor', 'waiting'];
        const token = await QueueToken.create({
          patient: patient._id,
          doctor: doctor._id,
          department: dept._id,
          tokenNo: randomInt(1, 50),
          date: visitDate,
          status: pickRandom(tokenStatuses),
          calledAt: new Date(visitDate.getTime() + 10 * 60000),
          completedAt: new Date(visitDate.getTime() + 30 * 60000),
          createdBy: receptionistUser._id,
          createdAt: visitDate,
        });

        // Create prescription
        const numMeds = randomInt(1, 4);
        const selectedMeds = pickRandomN(RX_MEDICINES, numMeds);
        const numDiagnoses = randomInt(1, 3);
        const selectedDiagnoses = pickRandomN(DIAGNOSES, numDiagnoses);
        const numLabTests = randomInt(0, 3);
        const selectedLabTests = pickRandomN(LAB_TESTS, numLabTests);

        const prescription = await Prescription.create({
          patient: patient._id,
          doctor: doctor._id,
          diagnosis: selectedDiagnoses,
          medicines: selectedMeds.map(m => ({ ...m, isActive: true })),
          labTests: selectedLabTests.map(lt => ({ testName: lt.name, instructions: 'Fasting required', isCompleted: Math.random() > 0.5 })),
          notes: `Follow-up in ${pickRandom(FOLLOW_UPS) || 'as needed'}`,
          followUpDate: Math.random() > 0.5 ? new Date(Date.now() + randomInt(7, 90) * 24 * 60 * 60 * 1000) : undefined,
          createdBy: doctor._id,
          createdAt: new Date(visitDate.getTime() + 35 * 60000),
        });

        // Create lab orders if tests prescribed
        if (selectedLabTests.length > 0) {
          labOrderCounter.current++;
          const labOrder = await LabOrder.create({
            orderNo: `LAB-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(labOrderCounter.current).padStart(5,'0')}`,
            patient: patient._id,
            doctor: doctor._id,
            tests: selectedLabTests.map(lt => ({
              testName: lt.name,
              testCode: lt.category.substring(0, 3).toUpperCase() + String(randomInt(100, 999)),
              category: lt.category,
              priority: pickRandom(['routine', 'routine', 'routine', 'urgent']),
              result: Math.random() > 0.5 ? `Result: ${randomInt(1, 100)} ${lt.unit}` : undefined,
              resultValue: Math.random() > 0.5 ? String(randomInt(1, 100)) : undefined,
              normalRange: lt.normalRange,
              unit: lt.unit,
              status: pickRandom(['completed', 'completed', 'pending', 'in-progress']),
            })),
            status: pickRandom(['completed', 'completed', 'pending', 'processing']),
            collectedAt: Math.random() > 0.5 ? new Date(visitDate.getTime() + 60 * 60000) : undefined,
            completedAt: Math.random() > 0.5 ? new Date(visitDate.getTime() + 120 * 60000) : undefined,
            collectedBy: labTechUser._id,
            testedBy: labTechUser._id,
            createdAt: new Date(visitDate.getTime() + 40 * 60000),
          });
        }

        // Create billing
        invoiceCounter.current++;
        const consultFee = doctor.consultationFee;
        const labCharges = selectedLabTests.length * 300;
        const subtotal = consultFee + labCharges;
        const tax = Math.round(subtotal * 0.05);
        const total = subtotal + tax;
        const paymentStatus = pickRandom(['paid', 'paid', 'paid', 'partial', 'pending']);
        const amountPaid = paymentStatus === 'paid' ? total : paymentStatus === 'partial' ? Math.round(total * 0.5) : 0;

        const billingItems = [
          { description: `Consultation - ${doctor.specialization}`, category: 'consultation', quantity: 1, rate: consultFee, amount: consultFee },
        ];
        if (selectedLabTests.length > 0) {
          billingItems.push({ description: `Lab Tests (${selectedLabTests.length})`, category: 'lab', quantity: selectedLabTests.length, rate: 300, amount: labCharges });
        }

        await Billing.create({
          patient: patient._id,
          invoiceNo: `INV-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(invoiceCounter.current).padStart(5,'0')}`,
          items: billingItems,
          paymentSplits: amountPaid > 0 ? [{ method: pickRandom(['cash', 'upi', 'card']), amount: amountPaid }] : [],
          subtotal,
          tax,
          discount: 0,
          total,
          amountPaid,
          status: paymentStatus,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paidAt: paymentStatus === 'paid' ? new Date(visitDate.getTime() + 60 * 60000) : undefined,
          createdBy: cashierUser._id,
          createdAt: new Date(visitDate.getTime() + 45 * 60000),
        });
      }
    }

    console.log('Created vitals, prescriptions, lab orders, and billing for detailed patients');

    // Create IPD admissions for 5 patients
    const ipdPatients = pickRandomN(patients.slice(0, 10), 5);
    const beds = await Bed.find({ status: 'available' }).limit(5);
    for (let i = 0; i < ipdPatients.length && i < beds.length; i++) {
      const patient = ipdPatients[i];
      const bed = beds[i];
      const ward = await Ward.findById(bed.ward);
      const doctor = doctors[i % doctors.length];
      const admissionDate = randomDate(30);
      const isDischarged = Math.random() > 0.5;

      await IPDAdmission.create({
        patient: patient._id,
        bed: bed._id,
        ward: ward._id,
        admittedBy: doctorUsers[0]._id,
        admissionDate,
        dischargeDate: isDischarged ? new Date(admissionDate.getTime() + randomInt(2, 10) * 24 * 60 * 60 * 1000) : undefined,
        diagnosis: pickRandomN(DIAGNOSES, 2).map(d => d.description).join(', '),
        admittingDoctor: doctor._id,
        vitals: [
          { recordedAt: admissionDate, bp: `${randomInt(110,160)}/${randomInt(70,100)}`, temperature: '98.6', pulse: randomInt(60,100), spo2: randomInt(94,100), weight: randomInt(50,90), recordedBy: nurseUser._id },
        ],
        dailyNotes: [
          { date: admissionDate, note: 'Patient admitted, vitals stable', category: 'nursing', addedBy: nurseUser._id },
          { date: new Date(admissionDate.getTime() + 24 * 60 * 60 * 1000), note: 'Review - responding to treatment', category: 'doctor', addedBy: doctor._id },
        ],
        medicines: pickRandomN(RX_MEDICINES, 2).map(m => ({
          name: m.name, dosage: m.dosage, frequency: m.frequency, route: m.route,
          startDate: admissionDate, prescribedBy: doctor._id,
        })),
        status: isDischarged ? 'discharged' : 'active',
        dischargeSummary: isDischarged ? 'Patient discharged with stable condition. Follow-up in 2 weeks.' : undefined,
        diet: pickRandom(['regular', 'diabetic', 'soft', 'low-sodium']),
      });

      if (isDischarged) {
        await Bed.findByIdAndUpdate(bed._id, { status: 'available' });
      } else {
        await Bed.findByIdAndUpdate(bed._id, { status: 'occupied' });
      }
    }
    console.log(`Created ${ipdPatients.length} IPD admissions`);

    // Create upcoming appointments
    const today = new Date();
    for (let i = 0; i < 15; i++) {
      const patient = pickRandom(allPatients);
      const doctor = pickRandom(doctors);
      const dept = departments[doctors.indexOf(doctor)];
      const apptDate = new Date(today.getTime() + randomInt(1, 14) * 24 * 60 * 60 * 1000);
      const hour = randomInt(9, 16);
      const minute = pickRandom([0, 15, 30, 45]);
      const startTime = `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
      const endHour = minute + 30 >= 60 ? hour + 1 : hour;
      const endMinute = (minute + 30) % 60;
      const endTime = `${String(endHour).padStart(2,'0')}:${String(endMinute).padStart(2,'0')}`;

      await Appointment.create({
        patient: patient._id,
        doctor: doctor._id,
        department: dept._id,
        date: apptDate,
        timeSlot: { start: startTime, end: endTime },
        reason: pickRandom(CHIEF_COMPLAINTS),
        status: pickRandom(['scheduled', 'scheduled', 'scheduled', 'confirmed']),
        bookedBy: receptionistUser._id,
      });
    }
    console.log('Created 15 upcoming appointments');

    console.log('\n--- Seed Complete ---');
    console.log('\nLogin Credentials:');
    console.log('  Admin:        admin@hospital.com / Admin@123');
    console.log('  Dr. Sharma:   sharma@hospital.com / Doctor@123');
    console.log('  Dr. Patel:    patel@hospital.com / Doctor@123');
    console.log('  Dr. Singh:    singh@hospital.com / Doctor@123');
    console.log('  Dr. Reddy:    reddy@hospital.com / Doctor@123');
    console.log('  Dr. Nair:     nair@hospital.com / Doctor@123');
    console.log('  Nurse:        meena@hospital.com / Staff@123');
    console.log('  Receptionist: tina@hospital.com / Staff@123');
    console.log('  Cashier:      raj@hospital.com / Staff@123');
    console.log('  Pharmacist:   kumar@hospital.com / Staff@123');
    console.log('  Lab Tech:     suresh@hospital.com / Staff@123');

    console.log('\n--- Sample Patients ---');
    for (const p of patients) {
      const age = Math.floor((Date.now() - new Date(p.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      console.log(`  ${p.uhid} | ${p.firstName} ${p.lastName} | ${age}y/${p.gender} | ${p.bloodGroup} | ${p.phone} | ${p.medicalHistory.conditions.length > 0 ? p.medicalHistory.conditions.join(', ') : 'No chronic conditions'}`);
    }

    console.log('\n--- Doctors ---');
    for (const d of doctors) {
      const user = users.find(u => u._id.toString() === d.user.toString());
      console.log(`  ${user?.name} | ${d.specialization} | Fee: ₹${d.consultationFee} | ${d.qualifications.join(', ')}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
