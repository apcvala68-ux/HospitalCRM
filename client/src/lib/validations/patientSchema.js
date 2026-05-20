import { z } from 'zod';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  bloodGroup: z.enum(BLOOD_GROUPS).optional().or(z.literal('')),
  address: z.object({
    street: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    zip: z.string().optional().or(z.literal('')),
    pincode: z.string().optional().or(z.literal('')),
  }),
  allergies: z.array(z.string()).optional(),
  emergencyContact: z.object({
    name: z.string().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    relation: z.string().optional().or(z.literal('')),
  }),
  aadhaar: z.string().optional().or(z.literal('')),
  maritalStatus: z.string().optional().or(z.literal('')),
  occupation: z.string().optional().or(z.literal('')),
  medicalHistory: z.object({
    conditions: z.array(z.string()).optional(),
    surgeries: z.array(z.string()).optional(),
    familyHistory: z.array(z.string()).optional(),
    immunizations: z.array(z.string()).optional(),
    habits: z.object({
      smoking: z.string().optional().or(z.literal('')),
      alcohol: z.string().optional().or(z.literal('')),
      tobacco: z.string().optional().or(z.literal('')),
    }),
  }),
  insurance: z.object({
    provider: z.string().optional().or(z.literal('')),
    policyNo: z.string().optional().or(z.literal('')),
    expiry: z.string().optional().or(z.literal('')),
  }),
});
