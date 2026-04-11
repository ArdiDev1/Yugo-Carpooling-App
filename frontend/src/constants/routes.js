export const ROUTES = {
  LANDING:         "/",
  LOGIN:           "/login",
  SIGNUP:          "/signup",
  EMAIL_VERIFY:    "/verify-email",
  LICENSE_UPLOAD:  "/verify-license",
  HOME:            "/home",
  CREATE:          "/create",
  CREATE_REQUEST:  "/create/request",
  CREATE_OFFER:    "/create/offer",
  MESSAGES:        "/messages",
  CHAT:            "/messages/:roomId",
  MY_PROFILE:      "/profile/me",
  EDIT_PROFILE:    "/profile/edit",
  USER_PROFILE:    "/profile/:userId",
  SETTINGS:        "/settings",
  DELETE_ACCOUNT:  "/settings/delete",
};

export const buildRoute = {
  chat:        (roomId)  => `/messages/${roomId}`,
  userProfile: (userId)  => `/profile/${userId}`,
};
