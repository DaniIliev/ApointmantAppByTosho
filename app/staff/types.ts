export type StaffMember = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  profilePictureUrl?: string;
  rating?: number;
  ratingCount?: number;
  locationIds: string[];
};

export type NewStaffMember = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};
