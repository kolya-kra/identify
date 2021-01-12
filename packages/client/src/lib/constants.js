// Store-Keys
export const STORE_NAVIGATION_BAR_VALUE = 'currentNavigationBarValue';
export const STORE_SHOW_NAVIGATION_BAR = 'showNavigationBar';
export const STORE_SHOW_NAVIGATION_DRAWER = 'showNavigationDrawer';
export const STORE_SHOW_APP_BAR = 'showAppBar';
export const STORE_SHOW_LOCATION_DRAWER = 'showLocationDrawer';
export const STORE_USER = 'user';
export const STORE_USER_TYPE = 'userType';
export const STORE_DEMO_USER = 'demoUser';
export const STORE_VISIT = 'visit';
export const STORE_LOGGED_IN = 'loggedIn';
export const STORE_HOME_LOCATIONS = 'homeLocations';
export const STORE_HOME_SEARCHTERM = 'homeSearchterm';
export const STORE_HOME_CURRENT_LOCATION = 'homeCurrentLocation';
export const STORE_LOGIN_EXPIRY = 'loginExpiry';
export const STORE_REFETCH_VISITS = 'refetchVisitsBusinessUser';

// NavigationBar
export const NAVIGATION_BAR_HOME_VALUE = '';
export const NAVIGATION_BAR_SCANNER_VALUE = 'scanner';
export const NAVIGATION_BAR_SETTINGS_VALUE = 'settings';
export const NAVIGATION_BAR_PROFILE_VALUE = 'profile';

// Profile Page
export const PROFILE_PAGE_VISITS_HISTORY = 'visitsHistory';
export const PROFILE_PAGE_CHANGE_EMAIL = 'changeEmail';
export const PROFILE_PAGE_CHANGE_PASSWORD = 'changePassword';
export const PROFILE_PAGE_EDIT_INFO = 'editInfo';
export const PROFILE_PAGE_APP_SETTINGS = 'appSettings';

//Languages
export const LANGUAGE_ENGLISH = 'en';
export const LANGUAGE_GERMAN = 'de';

// Query Parameter
export const QUERY_PARAM_LOCATION_ID = 'locationId';
export const QUERY_PARAM_NEW_LOCATION = 'newLocation';
export const QUERY_PARAM_INTENDED_URL = 'intendedUrl';
export const QUERY_PARAM_REGISTRATION_SUCCESSFUL = 'registrationSuccessful';
export const QUERY_PARAM_VERIFICATION_SUCCESSFUL = 'verificationSuccessful';
export const QUERY_PARAM_VERIFICATION_FAILED = 'verificationFailed';

// WebSocket Events
export const SOCKET_CHECK_IN = 'locationCheckIn';
export const SOCKET_CHECK_OUT = 'locationCheckOut';

// Objects
export const CONFIGURATION = {
  radius: 'radius',
  language: 'language',
};

export const USER_TYPE = {
  person: 'person',
  business: 'business',
};

export const LOCATION_ACTIONS = {
  checkIn: 'checkIn',
  checkOut: 'checkOut',
};

export const PERIOD_VALUES = {
  week: 'week',
  month: 'month',
  year: 'year',
};

export const SUBSCRIPTION_PERIODS = {}; // weeks per period
SUBSCRIPTION_PERIODS[PERIOD_VALUES.week] = 1;
SUBSCRIPTION_PERIODS[PERIOD_VALUES.month] = 4;
SUBSCRIPTION_PERIODS[PERIOD_VALUES.year] = 52;
