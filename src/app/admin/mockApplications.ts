export interface Application {
  id: string;
  userId: string;
  userName: string;
  email: string;
  role: string;
  appliedAt: string;
  societyName: string;
}

export const MOCK_APPLICATIONS: Application[] = [
  { id: 'app_1', userId: 'uid_a1b2c3', userName: 'John Smith', email: 'john.smith@student.manchester.ac.uk', role: 'President', appliedAt: '2026-03-01', societyName: 'Photography Society' },
  { id: 'app_2', userId: 'uid_d4e5f6', userName: 'Jane Doe', email: 'jane.doe@student.manchester.ac.uk', role: 'Treasurer', appliedAt: '2026-03-03', societyName: 'Photography Society' },
  { id: 'app_3', userId: 'uid_g7h8i9', userName: 'Alex Brown', email: 'alex.brown@student.manchester.ac.uk', role: 'President', appliedAt: '2026-03-02', societyName: 'Chess Society' },
  { id: 'app_4', userId: 'uid_j1k2l3', userName: 'Sam Wilson', email: 'sam.wilson@student.manchester.ac.uk', role: 'Secretary', appliedAt: '2026-03-04', societyName: 'Debate Society' },
  { id: 'app_5', userId: 'uid_m4n5o6', userName: 'Mia Lee', email: 'mia.lee@student.manchester.ac.uk', role: 'President', appliedAt: '2026-03-05', societyName: 'Debate Society' },
  { id: 'app_6', userId: 'uid_p7q8r9', userName: 'Oliver Chen', email: 'oliver.chen@student.manchester.ac.uk', role: 'Vice President', appliedAt: '2026-03-06', societyName: 'Coding Society' },
  { id: 'app_7', userId: 'uid_s1t2u3', userName: 'Emily Taylor', email: 'emily.taylor@student.manchester.ac.uk', role: 'President', appliedAt: '2026-02-28', societyName: 'Drama Society' },
  { id: 'app_8', userId: 'uid_v4w5x6', userName: 'Liam Patel', email: 'liam.patel@student.manchester.ac.uk', role: 'Events Officer', appliedAt: '2026-03-07', societyName: 'Photography Society' },
];
