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
  InterestRow,
  InteractionTypeRow,
  DegreeTypeRow,
  UniversityCourseRow,
  UniversityCourseWithDegreeType,
  StudyLevel,
  Interest,
  UniversityCourse,
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
export { getUserCount, getUserRole, getUserRoles, isAdmin, getSocietyUserDetails, checkUserProfileExists } from './users';

// Study Levels
export { getStudyLevels } from './studyLevels';

// Interests
export { getInterests } from './interests';

// Courses
export { getUniversityCourses } from './courses';

// Notifications
export { getPushTokens, getAllUserDetails } from './notifications';
export type { PushTokenRow, UserDetails } from './notifications';

// Buildings & Rooms
export { searchBuildings, getRoomsForBuilding, uploadLocation } from './buildings';
export type { BuildingOption, RoomOption } from './buildings';

// Onboarding
export { submitOnboarding, uploadProfilePicture, saveUserInterests } from './onboarding';

// Event management (authenticated — edge functions)
export { createEvent, updateEvent, deleteEvent } from './event-management';

// Analytics (authenticated — edge functions)
export { fetchSocietyAnalytics, fetchPostHogAnalytics } from './analytics';

// Transform utilities (useful if callers have raw DB rows)
export {
  generateSlug,
  transformEvent,
  transformSociety,
  transformUniversity,
  transformCategory,
  transformCity,
  transformStudyLevel,
  transformInterest,
  transformUniversityCourse,
} from './transform';
