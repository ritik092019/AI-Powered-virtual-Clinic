import { z } from 'zod';

export const doctorSpecialistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  specialization: z.string().min(2, 'Specialization is required'),
  qualifications: z.string().min(2, 'Qualifications (e.g. MBBS, MD) are required'),
  experience_years: z.coerce.number().min(0, 'Experience must be 0 or greater'),
  license_number: z.string().min(3, 'Registration / License number is required'),
  address: z.string().optional(),
  city_state: z.string().optional(),
  languages: z.string().transform((val) => 
    val.split(',').map((s) => s.trim()).filter(Boolean)
  ).or(z.array(z.string())),
  availability_status: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE']),
  is_active: z.boolean().default(true),
});

export type DoctorSpecialistFormInput = z.input<typeof doctorSpecialistSchema>;
export type DoctorSpecialistFormOutput = z.output<typeof doctorSpecialistSchema>;
