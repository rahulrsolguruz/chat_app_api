enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

enum LogAction {
  REGISTER = 'register',
  LOG_IN = 'login',
  LOG_OUT = 'logout',
  DELETE_ACCOUNT = 'delete_account'
}

enum MonthlyTrip {
  MIN = 'less_then_50',
  MID1 = '50-100',
  MID2 = '100-200',
  MAX = '200+'
}

enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed_amount'
}

enum QueryStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed'
}

enum QueryType {
  GENUINE = 'genuine',
  FAKE = 'fake'
}

enum AddressType {
  PICKUP = 'pickup',
  DELIVERY = 'delivery'
}

enum FragilityLevel {
  LOW = 'low',
  MIDIUM = 'midium',
  HIGH = 'high'
}

enum ShiftEnum {
  DAY = 'day',
  NIGHT = 'night',
  BOTH = 'both'
}

enum OrederTypeEnum {
  LOCAL = 'local',
  OUTDOOR = 'outdoor',
  BOTH = 'both'
}

enum BookingStatusEnum {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  INPROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}
enum PaymentTypesEnum {
  CASH = 'cash',
  STRIPE = 'stripe',
  RAZOR_PAY = 'razorpay'
}

enum ServiceTypeEnum {
  TWO_WHEELER = '2 wheeler',
  TRUCKS = 'trucks',
  PACKERS_AND_MOVERS = 'packers and movers',
  ALL_INDIA_PARCEL = 'all india parcel'
}
enum PaymentStatusEnum {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}
enum NotificationStatusEnum {
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  DRAFT = 'draft'
}
enum vehicleTypeEnum {
  TWO_WHEELER = '2 wheeler',
  AUTO = 'E loader',
  THREE_WHEELR = '3 wheeler',
  TATA_ACE = 'Tata ace',
  FOURTEEN_FT = 'Canter 14 ft',
  EIGHT_FT = '8 ft',
  BOLERO = '1.7 ton',
  Tata_407 = 'tata 407 '
}

enum DriverOrderEnum {
  ACCEPTED = 'Accepted',
  ACCEPTED_BY_OTHER = 'Accepted By other',
  IN_PROGRESS = 'In Progress',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}
const ENUM = {
  Status,
  LogAction,
  MonthlyTrip,
  DiscountType,
  QueryStatus,
  QueryType,
  AddressType,
  FragilityLevel,
  ShiftEnum,
  OrederTypeEnum,
  BookingStatusEnum,
  PaymentTypesEnum,
  PaymentStatusEnum,
  NotificationStatusEnum,
  ServiceTypeEnum,
  vehicleTypeEnum,
  DriverOrderEnum
};

export default ENUM;
