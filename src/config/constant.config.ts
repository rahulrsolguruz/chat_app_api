// Success messages
export const successMessage = {
  REQ_REJECTED: 'Friend Request Rejected',
  REQ_ACCEPTED: 'Friend Request Accepted',
  USER_REGISTERED: 'User registered successfully',
  OTP_SEND_SUCCESS: 'Otp Send successfully',
  RESET_PASSWORD_LINK_SENT: 'Password Reset Link Send successfully',
  RESET_PASSWORD_SUCCESS: 'Password Reset  successfully',
  OTP_SEND: 'Otp Send successfully',
  SENT: (resource) => `${resource} sent successfully`,
  DELIVERED: (resource) => `${resource} delivered successfully`,
  READ: (resource) => `${resource} read successfully`,
  RECEIVED: (resource) => `${resource} received successfully`,
  UPDATED: (resource) => `${resource} updated successfully`,
  DELETED: (resource) => `${resource} deleted successfully`,
  FETCHED: (resource) => `${resource} fetched successfully`,
  FOUND: (resource) => `${resource} found successfully`,
  SAVED: (resource) => `${resource} saved successfully`,
  ADDED: (resource) => `${resource} added successfully`,
  REMOVED: (resource) => `${resource} removed successfully`,
  JOINED: (resource) => `${resource} joined successfully`,
  LEFT: (resource) => `${resource} left successfully`,
  REGISTERED: (resource) => `${resource} registered successfully`,
  LOGIN: (resource) => `${resource} login successfully`,
  LOGOUT: (resource) => `${resource} logout successfully`,
  TYPING: (resource) => `${resource} is typing...`,
  STOPPED_TYPING: (resource) => `${resource} stopped typing`,
  CONNECTED: (resource) => `${resource} connected successfully`,
  DISCONNECTED: (resource) => `${resource} disconnected successfully`,
  ONLINE: (resource) => `${resource} is online`,
  OFFLINE: (resource) => `${resource} is offline`,
  ERROR: (resource) => `${resource} error occurred`
};

// Error messages
export const errorMessage = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  USER_EXISTS: 'User already exists',
  INVALID_CREDENTIALS: 'Invalid credentials',
  SOMETHING_WENT_WRONG: 'something went wrong ',
  USER_REGISTER_ERROR: 'Error registering user',
  USER_LOGIN_ERROR: 'Error during login',
  LOGOUT_ERROR: 'Error during logout',
  MISSING_TOKEN: 'Unauthorized: Missing token',
  INVALID_TOKEN: 'Unauthorized: Invalid token',
  UNAUTHORIZED_ACCESS: 'unauthorized to access',
  USER_NOT_FOUND: 'User does not found',
  EMAIL_NOT_EXIST: 'Email does not exist',
  WRONG_PASSWORD: 'Wrong Password',
  OLD_NEW_PASSWORD_NOT_EQUAL: 'Old passwod and new password can not be same!',
  INVALID_OTP: 'Unauthorized: Invalid otp',
  OTP_SEND_FAILD: 'Faild To Send otp',
  USER_EXIST_SAME_CONTACT: 'User with same contact exist',
  USER_UPDATE_FAILD: 'Faild To Update User Information! ',
  ROLE_EXISTS: 'Role already exists',
  ROLE_NOT_FOUND: 'Role Not Found',
  PERMISSION_NOT_FOUND: 'Permission Not Found',
  PERMISSION_EXISTS: 'Permission already exists',
  CITY_DATA_EXIST: 'City with same country exist',
  DATA_NOT_FOUND: 'Data not found. ',
  MISSING_IDS: 'One or more required IDs are missing.',
  ROLE_EXIST: 'Role already exist',
  EXPIRED: 'Coupon  expired',
  MAX_USAGE_REACHED: 'Coupon max usage reached',
  ORDER_ACCEPTED: 'Already a order accepted',
  NOT_FOUND: (resource: string) => `${resource} not found`,
  FAILD: (resource: string) => `${resource} Faild`,
  EXIST: (resource: string) => `${resource} already sent`,
  NOT_EXIST: (resource: string) => `${resource} not  exist`,
  ERROR: (resource: string) => ` Error during ${resource} `,
  INVALID: (resource: string) => ` Invalid ${resource} `,
  ORDER_ASSGINED: 'Order already has been assigned'
};
