// supabase_lib — data access layer for the RedefineMe web app.
// All functions fetch live data from Supabase and return typed frontend objects.

export { getClient } from './client';

// Types
export type {
  Event,
  Society,
  University,
  Category,
  City,
  EventRow,
  SocietyRow,
  UniversityRow,
  UniversityWithCity,
  CityRow,
  CategoryRow,
  PostImageRow,
  EventImageRow,
  N8nEventStatusRow,
  UserRow,
  UserRoleRow,
  UsersRolesRow,
  SocietyProfileRow,
  SocietyBioLinkRow,
  SocietyAccountRow,
  SocietyAccountApprovalStatusRow,
  SocietyAccountWithStatus,
  SocietyAccountWithSociety,
  SocietyManagementPermRow,
  SocietyCommitteePermWithName,
  CommitteeMemberDetail,
  CommitteeApplicantDetail,
  StudyLevelRow,
  InteractionTypeRow,
  EventWithRelations,
  SocietyWithUniversity,
  ScheduleEntryInput,
  CreateEventInput,
  UpdateEventInput,
  DeleteEventInput,
} from './types';

// Events
export {
  getEvents,
  getEventById,
  getEventBySlug,
  getTrendingEvents,
  getEventCities,
  getEventTags,
  getEventUniversities,
  getEventsForSociety,
} from './events';

export type { GetEventsOptions } from './events';

// Societies
export {
  getSocieties,
  getSocietyByHandle,
  getSocietiesByUniversity,
  getSocietyAccountsForUser,
  getSocietyAccount,
  getPendingSocietyAccounts,
  getApprovalStatuses,
  updateSocietyProfileDetails,
  updateSocietyProfileImage,
  getSocietyAccountsForSociety,
  getManagementPermissions,
  getCommitteePermissions,
  toggleCommitteePermission,
  getCommitteeMemberDetails,
  getCommitteeApplicantDetails,
} from './societies';

// Universities
export {
  getUniversities,
  getUniversityByShortName,
} from './universities';

// Categories
export { getCategories } from './categories';

// Cities
export { getCities, getCityBySlug } from './cities';

// Users
export { getUserCount, getUserRole, getUserRoles, isAdmin, getSocietyUserDetails } from './users';

// Event management (authenticated — edge functions)
export { createEvent, updateEvent, deleteEvent } from './event-management';

// Transform utilities (useful if callers have raw DB rows)
export {
  generateSlug,
  transformEvent,
  transformSociety,
  transformUniversity,
  transformCategory,
  transformCity,
} from './transform';
