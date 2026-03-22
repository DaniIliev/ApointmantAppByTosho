export interface SelectOptionsAppointmentType {
  id: string;
  name: string;
  duration?: number;
  price?: number;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | string;

export interface Appointment {
  _id: string;
  clientName: string;
  email: string;
  clientPhone: string;
  appointmentTime: {
    start: string;
    end: string; // За да е съвместимо с това, което връща бекендът
  };
  // Derived fields for table sorting/filters
  date?: string; // ISO start date (for table filters and sorting)
  time?: string; // Display start time (for sorting)
  serviceName: string; // Променено на serviceName, тъй като така го връща бекендът
  servicePrice?: number;
  serviceDuration?: number;
  status: AppointmentStatus;
  notes?: string;
  staff: {
    _id: string;
    name: string;
  };
  paymentStatus?:
    | "not_required"
    | "pending"
    | "authorized"
    | "captured"
    | "refunded"
    | "cancelled"
    | "failed";
  stripePaymentIntentId?: string;
  stripePaymentMethodId?: string;
  stripePaymentAmount?: number;
}

export interface AppointmentType {
  _id: string;
  imageUrl: File | null;
  name: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  color: string;
  staffs: { _id: string; name: string }[]; // Променено на staffIds
  paymentOption?: "cash" | "card" | "cash_and_card";
  locationId: string;
}

export interface Staff {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "staff" | "admin";
  locationId: string;
}

export interface Business {
  _id?: string;
  owner?: string;
  businessName?: string;
  category?: string;
  aboutUs?: string;
  openingHours?: string;
  businessImageUrl?: string;
  qrCodeUrl?: string;
  plan?:
    | "none"
    | "Starter_Monthly"
    | "Professional_Monthly"
    | "Enterprise_Monthly"
    | "Starter_Annual"
    | "Professional_Annual"
    | "Enterprise_Annual";
  subscriptionStatus?:
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "none";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planExpiresAt?: string | Date;
  stripeConnectAccountId?: string;
  stripeConnectChargesEnabled?: boolean;
  stripeConnectDetailsSubmitted?: boolean;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Location {
  _id?: string;
  imageUrl?: string;
  businessId?: string;
  name: string;
  address: string;
  addressLine2?: string;
  postalCode?: string;
  city: string;
  country?: string;
  phone: string;
  email?: string;
  website?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
  schedule?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  } | string;
}

export interface Service {
  _id?: string;
  business?: string;
  staffs?: { _id: string; name: string }[];
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
  imageUrl?: File | string | null;
  paymentOption?: "cash" | "card" | "cash_and_card";
  locationId?: string;
  color?: string; // Kept for UI
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeRange {
  start: string | null;
  end: string | null;
}

export interface WorkHour {
  day: string;
  date: string | Date;
  isDayOff: boolean;
  workTime?: TimeRange;
  breaks?: TimeRange[];
}

export type LocationsOpeningHours = Record<string, LocationOpeningHours>;

export interface LocationOpeningHours {
  _id?: string;
  workTime: TimeRange;
  isDayOff: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  break1: TimeRange;
  break2: TimeRange;
  break3: TimeRange;
}

export interface DailySchedule {
  _id?: string;
  workHours: WorkHour[];
}

export interface StaffSchedule {
  _id?: string;
  startDate: string;
  endDate: string;
  workTime: TimeRange;
  isDayOff: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  break1?: TimeRange;
  break2?: TimeRange;
  break3?: TimeRange;
  staff?: string; // Optional for location schedules
  location: string;
  business: string;
  dailySchedule?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SelectOption {
  id: string;
  name: string;
  parentCategory?: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
}
export const getBusinessCategories = (
  t: (key: string) => string
): SelectOption[] => [
  { id: "BEAUTY & WELLNESS", name: t("BEAUTY & WELLNESS") },
  { id: "MEDICAL & HEALTH", name: t("MEDICAL & HEALTH") },
  { id: "AUTOMOTIVE & TECHNICAL", name: t("AUTOMOTIVE & TECHNICAL") },
  { id: "FITNESS & SPORT", name: t("FITNESS & SPORT") },
  { id: "CONSULTING & BUSINESS", name: t("CONSULTING & BUSINESS") },
  { id: "EDUCATION & LIFESTYLE", name: t("EDUCATION & LIFESTYLE") },
  { id: "OTHER SERVICES", name: t("OTHER SERVICES") },
];

export const getCategoryOptions = (
  t: (key: string) => string
): SelectOption[] => [
  // BEAUTY & WELLNESS (КРАСОТА И УЕЛНЕС) - Най-популярни
  {
    id: "Hairdressing Services", // Променено от "Hairdresser"
    name: t("Hairdressing Services"),
    parentCategory: "BEAUTY & WELLNESS",
  },
  {
    id: "Manicure Pedicure Services", // Препоръчителна промяна
    name: t("Manicure Pedicure Services"),
    parentCategory: "BEAUTY & WELLNESS",
  },
  {
    id: "Cosmetology Aesthetics", // Променено от "Cosmetologist Aesthetician"
    name: t("Cosmetology Aesthetics"),
    parentCategory: "BEAUTY & WELLNESS",
  },
  {
    id: "Massage Therapy", // Променено от "Massage Therapist"
    name: t("Massage Therapy"),
    parentCategory: "BEAUTY & WELLNESS",
  },
  {
    id: "Tattoo Piercing Services", // Променено от "Tattoo Piercing Artist"
    name: t("Tattoo Piercing Services"),
    parentCategory: "BEAUTY & WELLNESS",
  },

  // MEDICAL & HEALTH (МЕДИЦИНА И ЗДРАВЕ)
  { id: "Dentistry", name: t("Dentistry"), parentCategory: "MEDICAL & HEALTH" }, // Променено от "Dentist"
  {
    id: "General Practice GP", // Променено от "General Practitioner GP"
    name: t("General Practice GP"),
    parentCategory: "MEDICAL & HEALTH",
  },
  {
    id: "Medical Specialties", // Променено от "Medical Specialist"
    name: t("Medical Specialties"),
    parentCategory: "MEDICAL & HEALTH",
  },
  {
    id: "Psychological Therapy", // Променено от "Psychologist Therapist"
    name: t("Psychological Therapy"),
    parentCategory: "MEDICAL & HEALTH",
  },
  {
    id: "Physical Therapy",
    name: t("Physical Therapy"),
    parentCategory: "MEDICAL & HEALTH",
  },
  {
    id: "Nutritional Consulting", // Променено от "Nutritional Consultant"
    name: t("Nutritional Consulting"),
    parentCategory: "MEDICAL & HEALTH",
  },

  // AUTOMOTIVE & TECHNICAL (АВТОМОБИЛНИ И ТЕХНИЧЕСКИ)
  {
    id: "Auto Repair Service",
    name: t("Auto Repair Service"),
    parentCategory: "AUTOMOTIVE & TECHNICAL",
  },
  {
    id: "Tire Service",
    name: t("Tire Service"),
    parentCategory: "AUTOMOTIVE & TECHNICAL",
  },
  {
    id: "Car Wash Detailing",
    name: t("Car Wash Detailing"),
    parentCategory: "AUTOMOTIVE & TECHNICAL",
  },
  {
    id: "Computer Repair",
    name: t("Computer Repair"),
    parentCategory: "AUTOMOTIVE & TECHNICAL",
  },
  {
    id: "Plumbing Services", // Променено от "Plumber"
    name: t("Plumbing Services"),
    parentCategory: "AUTOMOTIVE & TECHNICAL",
  },
  {
    id: "Electrical Services", // Променено от "Electrician"
    name: t("Electrical Services"),
    parentCategory: "AUTOMOTIVE & TECHNICAL",
  },

  // FITNESS & SPORT (ФИТНЕС И СПОРТ)
  {
    id: "Personal Training", // Променено от "Personal Trainer"
    name: t("Personal Training"),
    parentCategory: "FITNESS & SPORT",
  },
  {
    id: "Group Fitness Class",
    name: t("Group Fitness Class"),
    parentCategory: "FITNESS & SPORT",
  },
  {
    id: "Yoga Pilates Classes", // Променено от "Yoga Pilates Instructor"
    name: t("Yoga Pilates Classes"),
    parentCategory: "FITNESS & SPORT",
  },
  {
    id: "Sports Field Booking",
    name: t("Sports Field Booking"),
    parentCategory: "FITNESS & SPORT",
  },

  // CONSULTING & BUSINESS (КОНСУЛТАЦИИ И БИЗНЕС)
  {
    id: "Legal Consultation",
    name: t("Legal Consultation"),
    parentCategory: "CONSULTING & BUSINESS",
  },
  {
    id: "Financial Advising", // Променено от "Financial Advisor"
    name: t("Financial Advising"),
    parentCategory: "CONSULTING & BUSINESS",
  },
  {
    id: "IT Consulting",
    name: t("IT Consulting"),
    parentCategory: "CONSULTING & BUSINESS",
  },
  {
    id: "Accounting Services",
    name: t("Accounting Services"),
    parentCategory: "CONSULTING & BUSINESS",
  },
  {
    id: "Real Estate Services", // Променено от "Real Estate Agent"
    name: t("Real Estate Services"),
    parentCategory: "CONSULTING & BUSINESS",
  },

  // EDUCATION & LIFESTYLE (ОБРАЗОВАНИЕ И НАЧИН НА ЖИВОТ)
  {
    id: "Private Tutoring Lessons", // Променено от "Private Tutor Lessons"
    name: t("Private Tutoring Lessons"),
    parentCategory: "EDUCATION & LIFESTYLE",
  },
  {
    id: "Language Course",
    name: t("Language Course"),
    parentCategory: "EDUCATION & LIFESTYLE",
  },
  {
    id: "Driving Lessons", // Променено от "Driving Instructor"
    name: t("Driving Lessons"),
    parentCategory: "EDUCATION & LIFESTYLE",
  },
  {
    id: "Photo Session",
    name: t("Photo Session"),
    parentCategory: "EDUCATION & LIFESTYLE",
  },
  {
    id: "Event Planning",
    name: t("Event Planning"),
    parentCategory: "EDUCATION & LIFESTYLE",
  },

  // OTHER SERVICES (ДРУГИ УСЛУГИ)
  {
    id: "Veterinary Services", // Променено от "Veterinary Doctor"
    name: t("Veterinary Services"),
    parentCategory: "OTHER SERVICES",
  },
  {
    id: "Dog Grooming",
    name: t("Dog Grooming"),
    parentCategory: "OTHER SERVICES",
  },
  {
    id: "Home Cleaning Service",
    name: t("Home Cleaning Service"),
    parentCategory: "OTHER SERVICES",
  },
  {
    id: "Restaurant Reservation",
    name: t("Restaurant Reservation"),
    parentCategory: "OTHER SERVICES",
  },
  {
    id: "Museum Tour Booking",
    name: t("Museum Tour Booking"),
    parentCategory: "OTHER SERVICES",
  },
];
