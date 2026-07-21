export type SchoolStatus = 'Active' | 'Paused' | 'Archived';

export type CoachType = 'HC' | 'SC';

export interface CoachInfo {
  id?: string;
  name: string;
  email: string;
  type: CoachType;
  status: 'Active' | 'Pending Invite';
}

export interface School {
  id: string;
  name: string;
  teamCode: string;
  status: SchoolStatus;
  subscriptionStart: string; // ISO date string or formatted 'Jun 15, 2025'
  renewalDate: string;       // ISO date string or formatted 'Jun 15, 2026'
  headCoach?: CoachInfo;
  strengthCoach?: CoachInfo;
  coachesDisplay?: string;
  createdAt?: string;
}

export interface CreateSchoolInput {
  schoolName: string;
  headCoachFirstName: string;
  headCoachLastName: string;
  headCoachEmail: string;
  strengthCoachEmail?: string;
}

export type SortField = 'name' | 'status' | 'subscriptionStart' | 'renewalDate';
export type SortDirection = 'asc' | 'desc';
