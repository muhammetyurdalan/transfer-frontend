/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Action =
  | 'DELETE_MESSAGE'
  | 'MESSAGE'
  | 'NOTIFICATION'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_SUCCESS'
  | 'REFUND'
  | 'TIP_PAYMENT_FAILED'
  | 'TIP_PAYMENT_SUCCESS'
  | 'TRANSFER_ASSIGNED'
  | 'TRANSFER_CANCELLED'
  | 'TRANSFER_PAID'
  | 'TRANSFER_STATUS_UPDATED'
  | 'UPDATE_MESSAGE'
  | 'USER_DEACTIVATED'
  | 'USER_UPDATED';

export type ActionBaseFilterLookup = {
  /** Exact match. Filter will be skipped on `null` value */
  exact?: Action | null | undefined;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: Array<Action> | null | undefined;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: boolean | null | undefined;
};

export type AssignDriver = {
  /** one of availableDrivers */
  driverId: string | number;
  id: string | number;
  /** driver's suitable vehicle, default: the first one */
  vehicleId?: string | number | null | undefined;
};

export type CreateLeg = {
  endAddress: string;
  /** 4.6 */
  endLatitude: string;
  /** 4.6 */
  endLongitude: string;
  /** after start_time */
  endTime: string;
  /** default: position in the list */
  order?: number | null | undefined;
  route?: string | null | undefined;
  startAddress: string;
  /** 4.6 */
  startLatitude: string;
  /** 4.6 */
  startLongitude: string;
  /** timezone aware */
  startTime: string;
};

export type CreateTransfer = {
  /** default 0 */
  childSeatCount?: number | null | undefined;
  /** route distance in km, > 0, 6.2 */
  distance: string;
  /** 255 chars max */
  dropoffAddress: string;
  /** at least one must be found */
  dropoffDistrictName: string;
  /** 3.6 */
  dropoffLatitude: string;
  /** 3.6 */
  dropoffLongitude: string;
  /** route duration in minutes, > 0 */
  duration: number;
  /** 10 chars max */
  flightNumber?: string | null | undefined;
  legs?: Array<CreateLeg> | null | undefined;
  /** default 0 */
  luggageCount?: number | null | undefined;
  /** default false */
  needsWheelchair?: boolean | null | undefined;
  note?: string | null | undefined;
  /** default 1 */
  passengerCount?: number | null | undefined;
  /** 100 chars max */
  passengerName: string;
  /** 20 chars max */
  passengerPhone?: string | null | undefined;
  /** 255 chars max */
  pickupAddress: string;
  /** at least one must be found */
  pickupDistrictName: string;
  /** 3.6 */
  pickupLatitude: string;
  /** 3.6 */
  pickupLongitude: string;
  /** future, timezone aware */
  pickupTime: string;
};

export type CreateUser = {
  /** 50 chars max */
  firstName: string;
  /** 50 chars max */
  lastName: string;
  /** 128 chars max */
  password: string;
  /** 20 chars max */
  phone?: string | null | undefined;
  profileImage?: File | null | undefined;
  /** default CUSTOMER */
  role?: SignUpRole | null | undefined;
  /** validated secret from validateCode */
  secret: string;
};

export type CreateVehicle = {
  /** 50 chars max */
  brand: string;
  categoryId: string | number;
  /** 30 chars max */
  color?: string | null | undefined;
  /** active user with DRIVER role */
  driverId: string | number;
  image?: File | null | undefined;
  /** default true */
  isActive?: boolean | null | undefined;
  /** 50 chars max */
  model: string;
  /** 20 chars max, unique */
  plate: string;
  year?: number | null | undefined;
};

export type CreateVehicleCategory = {
  /** 8.2, default 0 */
  baseFare?: string | null | undefined;
  /** default 0 */
  childSeatCapacity?: number | null | undefined;
  /** default TRY */
  currency?: Currency | null | undefined;
  descriptionEn?: string | null | undefined;
  descriptionTr?: string | null | undefined;
  image?: File | null | undefined;
  /** default true */
  isActive?: boolean | null | undefined;
  /** default false */
  isWheelchairAccessible?: boolean | null | undefined;
  /** >= 0 */
  maxLuggage: number;
  /** >= 1 */
  maxPassengers: number;
  /** 8.2, default 0 */
  minimumFare?: string | null | undefined;
  /** 50 chars max */
  nameEn: string;
  /** 50 chars max, falls back to name_en */
  nameTr?: string | null | undefined;
  /** list order, default 0 */
  order?: number | null | undefined;
  /** 8.2, default 0 */
  perKmPrice?: string | null | undefined;
  /** 8.2, default 0 */
  perMinutePrice?: string | null | undefined;
};

export type Currency =
  | 'EUR'
  | 'GBP'
  | 'TRY'
  | 'USD';

export type CurrencyBaseFilterLookup = {
  /** Exact match. Filter will be skipped on `null` value */
  exact?: Currency | null | undefined;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: Array<Currency> | null | undefined;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: boolean | null | undefined;
};

export type DateComparisonFilterLookup = {
  /** Exact match. Filter will be skipped on `null` value */
  exact?: string | null | undefined;
  /** Greater than. Filter will be skipped on `null` value */
  gt?: string | null | undefined;
  /** Greater than or equal to. Filter will be skipped on `null` value */
  gte?: string | null | undefined;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: Array<string> | null | undefined;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: boolean | null | undefined;
  /** Less than. Filter will be skipped on `null` value */
  lt?: string | null | undefined;
  /** Less than or equal to. Filter will be skipped on `null` value */
  lte?: string | null | undefined;
  /** Inclusive range test (between) */
  range?: DateRangeLookup | null | undefined;
};

export type DateRangeLookup = {
  end?: string | null | undefined;
  start?: string | null | undefined;
};

export type DatetimeFilterLookup = {
  date?: DateComparisonFilterLookup | null | undefined;
  day?: IntComparisonFilterLookup | null | undefined;
  /** Exact match. Filter will be skipped on `null` value */
  exact?: string | null | undefined;
  /** Greater than. Filter will be skipped on `null` value */
  gt?: string | null | undefined;
  /** Greater than or equal to. Filter will be skipped on `null` value */
  gte?: string | null | undefined;
  hour?: IntComparisonFilterLookup | null | undefined;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: Array<string> | null | undefined;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: boolean | null | undefined;
  isoWeekDay?: IntComparisonFilterLookup | null | undefined;
  isoYear?: IntComparisonFilterLookup | null | undefined;
  /** Less than. Filter will be skipped on `null` value */
  lt?: string | null | undefined;
  /** Less than or equal to. Filter will be skipped on `null` value */
  lte?: string | null | undefined;
  minute?: IntComparisonFilterLookup | null | undefined;
  month?: IntComparisonFilterLookup | null | undefined;
  quarter?: IntComparisonFilterLookup | null | undefined;
  /** Inclusive range test (between) */
  range?: DatetimeRangeLookup | null | undefined;
  second?: IntComparisonFilterLookup | null | undefined;
  time?: TimeComparisonFilterLookup | null | undefined;
  week?: IntComparisonFilterLookup | null | undefined;
  weekDay?: IntComparisonFilterLookup | null | undefined;
  year?: IntComparisonFilterLookup | null | undefined;
};

export type DatetimeRangeLookup = {
  end?: string | null | undefined;
  start?: string | null | undefined;
};

export type DeviceType =
  | 'ANDROID'
  | 'IOS'
  | 'WEB';

export type GetCode = {
  /** 100 chars max */
  email: string;
  /** true: existing user (reset password), false: new user (sign up) */
  isUser?: boolean | null | undefined;
  language: Language;
};

export type IdBaseFilterLookup = {
  /** Exact match. Filter will be skipped on `null` value */
  exact?: string | number | null | undefined;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: Array<string | number> | null | undefined;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: boolean | null | undefined;
};

export type IntComparisonFilterLookup = {
  /** Exact match. Filter will be skipped on `null` value */
  exact?: number | null | undefined;
  /** Greater than. Filter will be skipped on `null` value */
  gt?: number | null | undefined;
  /** Greater than or equal to. Filter will be skipped on `null` value */
  gte?: number | null | undefined;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: Array<number> | null | undefined;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: boolean | null | undefined;
  /** Less than. Filter will be skipped on `null` value */
  lt?: number | null | undefined;
  /** Less than or equal to. Filter will be skipped on `null` value */
  lte?: number | null | undefined;
  /** Inclusive range test (between) */
  range?: IntRangeLookup | null | undefined;
};

export type IntRangeLookup = {
  end?: number | null | undefined;
  start?: number | null | undefined;
};

export type Language =
  | 'EN'
  | 'TR';

/** Notification(id, user, title, body, action, data, is_seen, created_at) */
export type NotificationFilter = {
  AND?: NotificationFilter | null | undefined;
  DISTINCT?: boolean | null | undefined;
  NOT?: NotificationFilter | null | undefined;
  OR?: NotificationFilter | null | undefined;
  action?: ActionBaseFilterLookup | null | undefined;
  createdAt?: DatetimeFilterLookup | null | undefined;
  id?: IdBaseFilterLookup | null | undefined;
  isSeen?: boolean | null | undefined;
};

export type NotificationOrder =
  {   createdAt: Ordering; id?: never; }
  |  { createdAt?: never;   id: Ordering; };

export type OffsetPaginationInput = {
  limit?: number | null | undefined;
  offset?: number;
};

export type Ordering =
  | 'ASC'
  | 'ASC_NULLS_FIRST'
  | 'ASC_NULLS_LAST'
  | 'DESC'
  | 'DESC_NULLS_FIRST'
  | 'DESC_NULLS_LAST';

export type PayTransfer = {
  id: string | number;
  /** one of vehicleOptions */
  vehicleCategoryId: string | number;
};

export type RefundTransaction = {
  /** 8.2, default: all refundable */
  amount?: string | null | undefined;
  /** PAYMENT or TIP transaction */
  id: string | number;
  note?: string | null | undefined;
};

export type ResetPassword = {
  /** 128 chars max */
  password: string;
  /** validated secret from validateCode */
  secret: string;
};

export type Role =
  | 'ADMIN'
  | 'CUSTOMER'
  | 'DRIVER'
  | 'OPERATOR'
  | 'STAFF';

export type RoleBaseFilterLookup = {
  /** Exact match. Filter will be skipped on `null` value */
  exact?: Role | null | undefined;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: Array<Role> | null | undefined;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: boolean | null | undefined;
};

export type SendMessage = {
  /** 2MB max */
  file?: File | null | undefined;
  location?: string | null | undefined;
  message?: string | null | undefined;
  parentId?: string | number | null | undefined;
  transferId: string | number;
};

export type SendNotification = {
  action?: Action | null | undefined;
  body: string;
  data?: Record<string, unknown> | null | undefined;
  /** 100 chars max */
  title: string;
  userIds: Array<string | number>;
};

export type SignIn = {
  /** 100 chars max */
  email: string;
  /** 128 chars max */
  password: string;
};

export type SignUpRole =
  | 'CUSTOMER'
  | 'DRIVER';

export type StrFilterLookup = {
  /** Case-sensitive containment test. Filter will be skipped on `null` value */
  contains?: string | null | undefined;
  /** Case-sensitive ends-with. Filter will be skipped on `null` value */
  endsWith?: string | null | undefined;
  /** Exact match. Filter will be skipped on `null` value */
  exact?: string | null | undefined;
  /** Case-insensitive containment test. Filter will be skipped on `null` value */
  iContains?: string | null | undefined;
  /** Case-insensitive ends-with. Filter will be skipped on `null` value */
  iEndsWith?: string | null | undefined;
  /** Case-insensitive exact match. Filter will be skipped on `null` value */
  iExact?: string | null | undefined;
  /** Case-insensitive regular expression match. Filter will be skipped on `null` value */
  iRegex?: string | null | undefined;
  /** Case-insensitive starts-with. Filter will be skipped on `null` value */
  iStartsWith?: string | null | undefined;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: Array<string> | null | undefined;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: boolean | null | undefined;
  /** Case-sensitive regular expression match. Filter will be skipped on `null` value */
  regex?: string | null | undefined;
  /** Case-sensitive starts-with. Filter will be skipped on `null` value */
  startsWith?: string | null | undefined;
};

export type TimeComparisonFilterLookup = {
  /** Exact match. Filter will be skipped on `null` value */
  exact?: string | null | undefined;
  /** Greater than. Filter will be skipped on `null` value */
  gt?: string | null | undefined;
  /** Greater than or equal to. Filter will be skipped on `null` value */
  gte?: string | null | undefined;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: Array<string> | null | undefined;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: boolean | null | undefined;
  /** Less than. Filter will be skipped on `null` value */
  lt?: string | null | undefined;
  /** Less than or equal to. Filter will be skipped on `null` value */
  lte?: string | null | undefined;
  /** Inclusive range test (between) */
  range?: TimeRangeLookup | null | undefined;
};

export type TimeRangeLookup = {
  end?: string | null | undefined;
  start?: string | null | undefined;
};

export type TipDriver = {
  /** 8.2, > 0 */
  amount: string;
  id: string | number;
};

export type TransactionCategory =
  | 'PAYMENT'
  | 'REFUND'
  | 'TIP';

export type TransactionCategoryBaseFilterLookup = {
  /** Exact match. Filter will be skipped on `null` value */
  exact?: TransactionCategory | null | undefined;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: Array<TransactionCategory> | null | undefined;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: boolean | null | undefined;
};

/** Transaction(id, transfer, user, category, parent, order_amount, currency, order_id, order_time, note) */
export type TransactionFilter = {
  AND?: TransactionFilter | null | undefined;
  DISTINCT?: boolean | null | undefined;
  NOT?: TransactionFilter | null | undefined;
  OR?: TransactionFilter | null | undefined;
  category?: TransactionCategoryBaseFilterLookup | null | undefined;
  id?: IdBaseFilterLookup | null | undefined;
  orderTime?: DatetimeFilterLookup | null | undefined;
  parentId?: IdBaseFilterLookup | null | undefined;
  transferId?: IdBaseFilterLookup | null | undefined;
  userId?: IdBaseFilterLookup | null | undefined;
};

export type TransactionOrder =
  {   id: Ordering; orderAmount?: never; orderTime?: never; }
  |  { id?: never;   orderAmount: Ordering; orderTime?: never; }
  |  { id?: never; orderAmount?: never;   orderTime: Ordering; };

/** Transfer(id, customer, operator, driver, vehicle_category, vehicle, status, state, pickup_district, dropoff_district, pickup_address, pickup_latitude, pickup_longitude, dropoff_address, dropoff_latitude, dropoff_longitude, pickup_time, end_time, distance, duration, passenger_count, luggage_count, child_seat_count, needs_wheelchair, passenger_name, passenger_phone, flight_number, note, price, currency, psp_data, created_at, updated_at) */
export type TransferFilter = {
  AND?: TransferFilter | null | undefined;
  DISTINCT?: boolean | null | undefined;
  NOT?: TransferFilter | null | undefined;
  OR?: TransferFilter | null | undefined;
  createdAt?: DatetimeFilterLookup | null | undefined;
  customerId?: IdBaseFilterLookup | null | undefined;
  driverId?: IdBaseFilterLookup | null | undefined;
  dropoffDistrictId?: IdBaseFilterLookup | null | undefined;
  flightNumber?: StrFilterLookup | null | undefined;
  id?: IdBaseFilterLookup | null | undefined;
  operatorId?: IdBaseFilterLookup | null | undefined;
  passengerName?: StrFilterLookup | null | undefined;
  pickupDistrictId?: IdBaseFilterLookup | null | undefined;
  pickupTime?: DatetimeFilterLookup | null | undefined;
  stateId?: IdBaseFilterLookup | null | undefined;
  status?: TransferStatusBaseFilterLookup | null | undefined;
  vehicleCategoryId?: IdBaseFilterLookup | null | undefined;
  vehicleId?: IdBaseFilterLookup | null | undefined;
};

export type TransferOrder =
  {   createdAt: Ordering; id?: never; pickupTime?: never; }
  |  { createdAt?: never;   id: Ordering; pickupTime?: never; }
  |  { createdAt?: never; id?: never;   pickupTime: Ordering; };

export type TransferStatus =
  | 'ASSIGNED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'PAID'
  | 'PENDING'
  | 'STARTED';

export type TransferStatusBaseFilterLookup = {
  /** Exact match. Filter will be skipped on `null` value */
  exact?: TransferStatus | null | undefined;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: Array<TransferStatus> | null | undefined;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: boolean | null | undefined;
};

export type UpdateAdminUser = {
  id: string | number;
  isActive?: boolean | null | undefined;
  role?: Role | null | undefined;
};

export type UpdateFcmToken = {
  /** FCM registration token */
  registrationId: string;
  type: DeviceType;
};

export type UpdateMessage = {
  id: string | number;
  message: string;
};

export type UpdateTransfer = {
  childSeatCount?: number | null | undefined;
  /** route distance in km, > 0 */
  distance?: string | null | undefined;
  /** 255 chars max */
  dropoffAddress?: string | null | undefined;
  /** with a new dropoff address */
  dropoffDistrictName?: string | null | undefined;
  /** 3.6 */
  dropoffLatitude?: string | null | undefined;
  /** 3.6 */
  dropoffLongitude?: string | null | undefined;
  /** route duration in minutes, > 0 */
  duration?: number | null | undefined;
  /** 10 chars max */
  flightNumber?: string | null | undefined;
  id: string | number;
  luggageCount?: number | null | undefined;
  needsWheelchair?: boolean | null | undefined;
  note?: string | null | undefined;
  passengerCount?: number | null | undefined;
  /** 100 chars max */
  passengerName?: string | null | undefined;
  /** 20 chars max */
  passengerPhone?: string | null | undefined;
  /** 255 chars max */
  pickupAddress?: string | null | undefined;
  /** with a new pickup address */
  pickupDistrictName?: string | null | undefined;
  /** 3.6 */
  pickupLatitude?: string | null | undefined;
  /** 3.6 */
  pickupLongitude?: string | null | undefined;
  /** future, timezone aware */
  pickupTime?: string | null | undefined;
};

export type UpdateTransferStatus = {
  id: string | number;
  /** ASSIGNED -> STARTED -> COMPLETED */
  status: TransferStatus;
};

export type UpdateUser = {
  /** 50 chars max */
  firstName?: string | null | undefined;
  language?: Language | null | undefined;
  /** 50 chars max */
  lastName?: string | null | undefined;
  /** 20 chars max */
  phone?: string | null | undefined;
  profileImage?: File | null | undefined;
};

export type UpdateVehicle = {
  /** 50 chars max */
  brand?: string | null | undefined;
  categoryId?: string | number | null | undefined;
  /** 30 chars max */
  color?: string | null | undefined;
  /** active user with DRIVER role */
  driverId?: string | number | null | undefined;
  id: string | number;
  image?: File | null | undefined;
  isActive?: boolean | null | undefined;
  /** 50 chars max */
  model?: string | null | undefined;
  /** 20 chars max, unique */
  plate?: string | null | undefined;
  year?: number | null | undefined;
};

export type UpdateVehicleCategory = {
  /** 8.2 */
  baseFare?: string | null | undefined;
  childSeatCapacity?: number | null | undefined;
  currency?: Currency | null | undefined;
  descriptionEn?: string | null | undefined;
  descriptionTr?: string | null | undefined;
  id: string | number;
  image?: File | null | undefined;
  isActive?: boolean | null | undefined;
  isWheelchairAccessible?: boolean | null | undefined;
  /** >= 0 */
  maxLuggage?: number | null | undefined;
  /** >= 1 */
  maxPassengers?: number | null | undefined;
  /** 8.2 */
  minimumFare?: string | null | undefined;
  /** 50 chars max */
  nameEn?: string | null | undefined;
  /** 50 chars max */
  nameTr?: string | null | undefined;
  order?: number | null | undefined;
  /** 8.2 */
  perKmPrice?: string | null | undefined;
  /** 8.2 */
  perMinutePrice?: string | null | undefined;
};

/** User(id, password, last_login, role, email, first_name, last_name, phone, language, profile_image, psp_data, is_active, created_at) */
export type UserFilter = {
  AND?: UserFilter | null | undefined;
  DISTINCT?: boolean | null | undefined;
  NOT?: UserFilter | null | undefined;
  OR?: UserFilter | null | undefined;
  createdAt?: DatetimeFilterLookup | null | undefined;
  email?: StrFilterLookup | null | undefined;
  firstName?: StrFilterLookup | null | undefined;
  id?: IdBaseFilterLookup | null | undefined;
  isActive?: boolean | null | undefined;
  lastName?: StrFilterLookup | null | undefined;
  phone?: StrFilterLookup | null | undefined;
  role?: RoleBaseFilterLookup | null | undefined;
};

export type UserOrder =
  {   createdAt: Ordering; email?: never; firstName?: never; id?: never; lastName?: never; }
  |  { createdAt?: never;   email: Ordering; firstName?: never; id?: never; lastName?: never; }
  |  { createdAt?: never; email?: never;   firstName: Ordering; id?: never; lastName?: never; }
  |  { createdAt?: never; email?: never; firstName?: never;   id: Ordering; lastName?: never; }
  |  { createdAt?: never; email?: never; firstName?: never; id?: never;   lastName: Ordering; };

export type ValidateCode = {
  /** 6 chars */
  code: string;
  secret: string;
};

/** VehicleCategory(id, name, description, image, max_passengers, max_luggage, child_seat_capacity, is_wheelchair_accessible, base_fare, per_km_price, per_minute_price, minimum_fare, currency, order, is_active, created_at) */
export type VehicleCategoryFilter = {
  AND?: VehicleCategoryFilter | null | undefined;
  DISTINCT?: boolean | null | undefined;
  NOT?: VehicleCategoryFilter | null | undefined;
  OR?: VehicleCategoryFilter | null | undefined;
  currency?: CurrencyBaseFilterLookup | null | undefined;
  id?: IdBaseFilterLookup | null | undefined;
  isActive?: boolean | null | undefined;
  isWheelchairAccessible?: boolean | null | undefined;
  maxLuggage?: IntComparisonFilterLookup | null | undefined;
  maxPassengers?: IntComparisonFilterLookup | null | undefined;
  name?: StrFilterLookup | null | undefined;
};

export type VehicleCategoryOrder =
  {   createdAt: Ordering; id?: never; maxPassengers?: never; order?: never; }
  |  { createdAt?: never;   id: Ordering; maxPassengers?: never; order?: never; }
  |  { createdAt?: never; id?: never;   maxPassengers: Ordering; order?: never; }
  |  { createdAt?: never; id?: never; maxPassengers?: never;   order: Ordering; };

/** Vehicle(id, driver, category, plate, brand, model, year, color, image, is_active, created_at) */
export type VehicleFilter = {
  AND?: VehicleFilter | null | undefined;
  DISTINCT?: boolean | null | undefined;
  NOT?: VehicleFilter | null | undefined;
  OR?: VehicleFilter | null | undefined;
  brand?: StrFilterLookup | null | undefined;
  categoryId?: IdBaseFilterLookup | null | undefined;
  driverId?: IdBaseFilterLookup | null | undefined;
  id?: IdBaseFilterLookup | null | undefined;
  isActive?: boolean | null | undefined;
  plate?: StrFilterLookup | null | undefined;
};

export type VehicleOrder =
  {   createdAt: Ordering; id?: never; plate?: never; }
  |  { createdAt?: never;   id: Ordering; plate?: never; }
  |  { createdAt?: never; id?: never;   plate: Ordering; };

export type SignInMutationVariables = Exact<{
  data: SignIn;
}>;


export type SignInMutation = { signIn: { token: string, user: { id: string, role: Role | null, language: Language | null, firstName: string | null, lastName: string | null, name: string | null, email: string | null, phone: string | null, profileImage: string | null, createdAt: string | null } } };

export type GetCodeMutationVariables = Exact<{
  data: GetCode;
}>;


export type GetCodeMutation = { getCode: { secret: string, expireSeconds: number } };

export type ValidateCodeMutationVariables = Exact<{
  data: ValidateCode;
}>;


export type ValidateCodeMutation = { validateCode: { secret: string, expireSeconds: number } };

export type CreateUserMutationVariables = Exact<{
  data: CreateUser;
}>;


export type CreateUserMutation = { createUser: { token: string, user: { id: string, role: Role | null, language: Language | null, firstName: string | null, lastName: string | null, name: string | null, email: string | null, phone: string | null, profileImage: string | null, createdAt: string | null } } };

export type ResetPasswordMutationVariables = Exact<{
  data: ResetPassword;
}>;


export type ResetPasswordMutation = { resetPassword: { success: boolean } };

export type VehicleOptionItemFragment = { distance: string, duration: number, price: string, currency: Currency, vehicleCategory: { id: string, name: string | null, description: string | null, image: string | null, maxPassengers: number | null, maxLuggage: number | null, childSeatCapacity: number | null, isWheelchairAccessible: boolean | null } };

export type BookingTransferFieldsFragment = { id: string, status: TransferStatus | null, pickupAddress: string | null, pickupLatitude: string | null, pickupLongitude: string | null, dropoffAddress: string | null, dropoffLatitude: string | null, dropoffLongitude: string | null, pickupTime: string | null, distance: string | null, duration: number | null, passengerCount: number | null, luggageCount: number | null, childSeatCount: number | null, needsWheelchair: boolean | null, passengerName: string | null, passengerPhone: string | null, flightNumber: string | null, note: string | null, pickupDistrict: { id: string, name: string | null } | null, dropoffDistrict: { id: string, name: string | null } | null, legs: Array<{ id: string, order: number | null, startAddress: string | null, endAddress: string | null, startTime: string | null, endTime: string | null }> | null };

export type BookingTransferQueryVariables = Exact<{
  id: string | number;
}>;


export type BookingTransferQuery = { transfer: { id: string, status: TransferStatus | null, pickupAddress: string | null, pickupLatitude: string | null, pickupLongitude: string | null, dropoffAddress: string | null, dropoffLatitude: string | null, dropoffLongitude: string | null, pickupTime: string | null, distance: string | null, duration: number | null, passengerCount: number | null, luggageCount: number | null, childSeatCount: number | null, needsWheelchair: boolean | null, passengerName: string | null, passengerPhone: string | null, flightNumber: string | null, note: string | null, pickupDistrict: { id: string, name: string | null } | null, dropoffDistrict: { id: string, name: string | null } | null, legs: Array<{ id: string, order: number | null, startAddress: string | null, endAddress: string | null, startTime: string | null, endTime: string | null }> | null } | null };

export type VehicleOptionsQueryVariables = Exact<{
  transferId: string | number;
}>;


export type VehicleOptionsQuery = { vehicleOptions: Array<{ distance: string, duration: number, price: string, currency: Currency, vehicleCategory: { id: string, name: string | null, description: string | null, image: string | null, maxPassengers: number | null, maxLuggage: number | null, childSeatCapacity: number | null, isWheelchairAccessible: boolean | null } }> };

export type CreateTransferMutationVariables = Exact<{
  data: CreateTransfer;
}>;


export type CreateTransferMutation = { createTransfer: { transfer: { id: string, status: TransferStatus | null, pickupAddress: string | null, pickupLatitude: string | null, pickupLongitude: string | null, dropoffAddress: string | null, dropoffLatitude: string | null, dropoffLongitude: string | null, pickupTime: string | null, distance: string | null, duration: number | null, passengerCount: number | null, luggageCount: number | null, childSeatCount: number | null, needsWheelchair: boolean | null, passengerName: string | null, passengerPhone: string | null, flightNumber: string | null, note: string | null, pickupDistrict: { id: string, name: string | null } | null, dropoffDistrict: { id: string, name: string | null } | null, legs: Array<{ id: string, order: number | null, startAddress: string | null, endAddress: string | null, startTime: string | null, endTime: string | null }> | null }, vehicleOptions: Array<{ distance: string, duration: number, price: string, currency: Currency, vehicleCategory: { id: string, name: string | null, description: string | null, image: string | null, maxPassengers: number | null, maxLuggage: number | null, childSeatCapacity: number | null, isWheelchairAccessible: boolean | null } }> } };

export type UpdateTransferMutationVariables = Exact<{
  data: UpdateTransfer;
}>;


export type UpdateTransferMutation = { updateTransfer: { transfer: { id: string, status: TransferStatus | null, pickupAddress: string | null, pickupLatitude: string | null, pickupLongitude: string | null, dropoffAddress: string | null, dropoffLatitude: string | null, dropoffLongitude: string | null, pickupTime: string | null, distance: string | null, duration: number | null, passengerCount: number | null, luggageCount: number | null, childSeatCount: number | null, needsWheelchair: boolean | null, passengerName: string | null, passengerPhone: string | null, flightNumber: string | null, note: string | null, pickupDistrict: { id: string, name: string | null } | null, dropoffDistrict: { id: string, name: string | null } | null, legs: Array<{ id: string, order: number | null, startAddress: string | null, endAddress: string | null, startTime: string | null, endTime: string | null }> | null }, vehicleOptions: Array<{ distance: string, duration: number, price: string, currency: Currency, vehicleCategory: { id: string, name: string | null, description: string | null, image: string | null, maxPassengers: number | null, maxLuggage: number | null, childSeatCapacity: number | null, isWheelchairAccessible: boolean | null } }> } };

export type PayTransferMutationVariables = Exact<{
  data: PayTransfer;
}>;


export type PayTransferMutation = { payTransfer: { paymentLink: string | null, linkExpireTime: string | null } };

export type MessageItemFragment = { id: string, transferId: string, senderId: string, parentId: string | null, isDeleted: boolean | null, message: string | null, location: string | null, file: string | null, time: string | null, sender: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null } | null, parent: { id: string, senderId: string, isDeleted: boolean | null, message: string | null, location: string | null, file: string | null } | null };

export type MessagesQueryVariables = Exact<{
  transferId: string | number;
}>;


export type MessagesQuery = { messages: Array<{ id: string, transferId: string, senderId: string, parentId: string | null, isDeleted: boolean | null, message: string | null, location: string | null, file: string | null, time: string | null, sender: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null } | null, parent: { id: string, senderId: string, isDeleted: boolean | null, message: string | null, location: string | null, file: string | null } | null }> };

export type SendMessageMutationVariables = Exact<{
  data: SendMessage;
}>;


export type SendMessageMutation = { sendMessage: { id: string, transferId: string, senderId: string, parentId: string | null, isDeleted: boolean | null, message: string | null, location: string | null, file: string | null, time: string | null, sender: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null } | null, parent: { id: string, senderId: string, isDeleted: boolean | null, message: string | null, location: string | null, file: string | null } | null } };

export type UpdateMessageMutationVariables = Exact<{
  data: UpdateMessage;
}>;


export type UpdateMessageMutation = { updateMessage: { id: string, transferId: string, senderId: string, parentId: string | null, isDeleted: boolean | null, message: string | null, location: string | null, file: string | null, time: string | null, sender: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null } | null, parent: { id: string, senderId: string, isDeleted: boolean | null, message: string | null, location: string | null, file: string | null } | null } };

export type DeleteMessageMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteMessageMutation = { deleteMessage: { id: string, transferId: string, senderId: string, parentId: string | null, isDeleted: boolean | null, message: string | null, location: string | null, file: string | null, time: string | null, sender: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null } | null, parent: { id: string, senderId: string, isDeleted: boolean | null, message: string | null, location: string | null, file: string | null } | null } };

export type SeeMessagesMutationVariables = Exact<{
  transferId: string | number;
}>;


export type SeeMessagesMutation = { seeMessages: { success: boolean } };

export type MessageThreadFragment = { id: string, status: TransferStatus | null, pickupTime: string | null, pickupAddress: string | null, dropoffAddress: string | null, customerId: string, driverId: string | null, operatorId: string | null, customer: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null } | null, driver: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null } | null };

export type MessageThreadsQueryVariables = Exact<{
  filters?: TransferFilter | null | undefined;
}>;


export type MessageThreadsQuery = { transfers: { count: number | null, transfers: Array<{ id: string, status: TransferStatus | null, pickupTime: string | null, pickupAddress: string | null, dropoffAddress: string | null, customerId: string, driverId: string | null, operatorId: string | null, customer: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null } | null, driver: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null } | null }> | null } };

export type NotificationItemFragment = { id: string, title: string | null, body: string | null, action: Action | null, data: Record<string, unknown> | null, isSeen: boolean | null, createdAt: string | null };

export type UnseenNotificationCountQueryVariables = Exact<{ [key: string]: never; }>;


export type UnseenNotificationCountQuery = { unseenNotificationCount: number };

export type NotificationsQueryVariables = Exact<{
  filters?: NotificationFilter | null | undefined;
  ordering?: Array<NotificationOrder> | NotificationOrder | null | undefined;
  pagination?: OffsetPaginationInput | null | undefined;
}>;


export type NotificationsQuery = { notifications: { count: number | null, notifications: Array<{ id: string, title: string | null, body: string | null, action: Action | null, data: Record<string, unknown> | null, isSeen: boolean | null, createdAt: string | null }> | null } };

export type SeeNotificationsMutationVariables = Exact<{
  ids?: Array<string | number> | string | number | null | undefined;
}>;


export type SeeNotificationsMutation = { seeNotifications: { success: boolean } };

export type DeleteNotificationsMutationVariables = Exact<{
  ids?: Array<string | number> | string | number | null | undefined;
}>;


export type DeleteNotificationsMutation = { deleteNotifications: { success: boolean } };

export type EventsSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type EventsSubscription = { subscribe: { action: Action, senderId: string | null, message: string | null, notificationId: string | null, transferId: string | null, messageId: string | null, parentId: string | null, location: string | null, file: string | null } };

export type TransactionItemFragment = { id: string, transferId: string, userId: string, parentId: string | null, category: TransactionCategory | null, currency: Currency | null, orderAmount: string | null, orderId: string | null, orderTime: string | null, note: string | null };

export type TransactionsQueryVariables = Exact<{
  filters?: TransactionFilter | null | undefined;
  ordering?: Array<TransactionOrder> | TransactionOrder | null | undefined;
  pagination?: OffsetPaginationInput | null | undefined;
}>;


export type TransactionsQuery = { transactions: { count: number | null, transactions: Array<{ id: string, transferId: string, userId: string, parentId: string | null, category: TransactionCategory | null, currency: Currency | null, orderAmount: string | null, orderId: string | null, orderTime: string | null, note: string | null }> | null } };

export type RefundTransactionMutationVariables = Exact<{
  data: RefundTransaction;
}>;


export type RefundTransactionMutation = { refundTransaction: { id: string, transferId: string, userId: string, parentId: string | null, category: TransactionCategory | null, currency: Currency | null, orderAmount: string | null, orderId: string | null, orderTime: string | null, note: string | null } };

export type TransferRowFragment = { id: string, status: TransferStatus | null, pickupTime: string | null, pickupAddress: string | null, dropoffAddress: string | null, pickupLatitude: string | null, pickupLongitude: string | null, passengerName: string | null, passengerCount: number | null, price: string | null, currency: Currency | null, distance: string | null, duration: number | null, customerId: string, driverId: string | null, operatorId: string | null, vehicleCategory: { id: string, name: string | null } | null, driver: { id: string, name: string | null } | null };

export type TransfersQueryVariables = Exact<{
  filters?: TransferFilter | null | undefined;
  ordering?: Array<TransferOrder> | TransferOrder | null | undefined;
  pagination?: OffsetPaginationInput | null | undefined;
}>;


export type TransfersQuery = { transfers: { count: number | null, transfers: Array<{ id: string, status: TransferStatus | null, pickupTime: string | null, pickupAddress: string | null, dropoffAddress: string | null, pickupLatitude: string | null, pickupLongitude: string | null, passengerName: string | null, passengerCount: number | null, price: string | null, currency: Currency | null, distance: string | null, duration: number | null, customerId: string, driverId: string | null, operatorId: string | null, vehicleCategory: { id: string, name: string | null } | null, driver: { id: string, name: string | null } | null }> | null } };

export type TransferDetailFragment = { endTime: string | null, dropoffLatitude: string | null, dropoffLongitude: string | null, passengerPhone: string | null, luggageCount: number | null, childSeatCount: number | null, needsWheelchair: boolean | null, flightNumber: string | null, note: string | null, id: string, status: TransferStatus | null, pickupTime: string | null, pickupAddress: string | null, dropoffAddress: string | null, pickupLatitude: string | null, pickupLongitude: string | null, passengerName: string | null, passengerCount: number | null, price: string | null, currency: Currency | null, distance: string | null, duration: number | null, customerId: string, driverId: string | null, operatorId: string | null, vehicleCategory: { id: string, name: string | null, image: string | null } | null, vehicle: { id: string, plate: string | null, brand: string | null, model: string | null, color: string | null } | null, driver: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null, phone: string | null } | null, customer: { id: string, name: string | null } | null, operator: { id: string, name: string | null } | null, pickupDistrict: { id: string, name: string | null, city: { id: string, name: string | null } | null } | null, dropoffDistrict: { id: string, name: string | null } | null, state: { id: string, name: string | null } | null, legs: Array<{ id: string, order: number | null, startAddress: string | null, endAddress: string | null, startTime: string | null, endTime: string | null }> | null };

export type TransferQueryVariables = Exact<{
  id: string | number;
}>;


export type TransferQuery = { transfer: { endTime: string | null, dropoffLatitude: string | null, dropoffLongitude: string | null, passengerPhone: string | null, luggageCount: number | null, childSeatCount: number | null, needsWheelchair: boolean | null, flightNumber: string | null, note: string | null, id: string, status: TransferStatus | null, pickupTime: string | null, pickupAddress: string | null, dropoffAddress: string | null, pickupLatitude: string | null, pickupLongitude: string | null, passengerName: string | null, passengerCount: number | null, price: string | null, currency: Currency | null, distance: string | null, duration: number | null, customerId: string, driverId: string | null, operatorId: string | null, vehicleCategory: { id: string, name: string | null, image: string | null } | null, vehicle: { id: string, plate: string | null, brand: string | null, model: string | null, color: string | null } | null, driver: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null, phone: string | null } | null, customer: { id: string, name: string | null } | null, operator: { id: string, name: string | null } | null, pickupDistrict: { id: string, name: string | null, city: { id: string, name: string | null } | null } | null, dropoffDistrict: { id: string, name: string | null } | null, state: { id: string, name: string | null } | null, legs: Array<{ id: string, order: number | null, startAddress: string | null, endAddress: string | null, startTime: string | null, endTime: string | null }> | null } | null };

export type TransferTransactionsQueryVariables = Exact<{
  transferId: string | number;
}>;


export type TransferTransactionsQuery = { transactions: { count: number | null, transactions: Array<{ id: string, category: TransactionCategory | null, orderAmount: string | null, currency: Currency | null, orderTime: string | null, note: string | null }> | null } };

export type UpdateTransferStatusMutationVariables = Exact<{
  data: UpdateTransferStatus;
}>;


export type UpdateTransferStatusMutation = { updateTransferStatus: { id: string, status: TransferStatus | null } };

export type CancelTransferMutationVariables = Exact<{
  id: string | number;
}>;


export type CancelTransferMutation = { cancelTransfer: { id: string, status: TransferStatus | null } };

export type AssignDriverMutationVariables = Exact<{
  data: AssignDriver;
}>;


export type AssignDriverMutation = { assignDriver: { endTime: string | null, dropoffLatitude: string | null, dropoffLongitude: string | null, passengerPhone: string | null, luggageCount: number | null, childSeatCount: number | null, needsWheelchair: boolean | null, flightNumber: string | null, note: string | null, id: string, status: TransferStatus | null, pickupTime: string | null, pickupAddress: string | null, dropoffAddress: string | null, pickupLatitude: string | null, pickupLongitude: string | null, passengerName: string | null, passengerCount: number | null, price: string | null, currency: Currency | null, distance: string | null, duration: number | null, customerId: string, driverId: string | null, operatorId: string | null, vehicleCategory: { id: string, name: string | null, image: string | null } | null, vehicle: { id: string, plate: string | null, brand: string | null, model: string | null, color: string | null } | null, driver: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null, phone: string | null } | null, customer: { id: string, name: string | null } | null, operator: { id: string, name: string | null } | null, pickupDistrict: { id: string, name: string | null, city: { id: string, name: string | null } | null } | null, dropoffDistrict: { id: string, name: string | null } | null, state: { id: string, name: string | null } | null, legs: Array<{ id: string, order: number | null, startAddress: string | null, endAddress: string | null, startTime: string | null, endTime: string | null }> | null } };

export type AvailableDriversQueryVariables = Exact<{
  transferId: string | number;
  filters?: UserFilter | null | undefined;
  pagination?: OffsetPaginationInput | null | undefined;
}>;


export type AvailableDriversQuery = { availableDrivers: { count: number | null, users: Array<{ id: string, name: string | null, firstName: string | null, lastName: string | null, phone: string | null, profileImage: string | null }> | null } };

export type AvailableVehiclesQueryVariables = Exact<{
  transferId: string | number;
}>;


export type AvailableVehiclesQuery = { availableVehicles: Array<{ id: string, driverId: string, plate: string | null, brand: string | null, model: string | null, color: string | null, year: number | null }> };

export type TipDriverMutationVariables = Exact<{
  data: TipDriver;
}>;


export type TipDriverMutation = { tipDriver: { paymentLink: string | null, linkExpireTime: string | null } };

export type CurrentUserFragment = { id: string, role: Role | null, language: Language | null, firstName: string | null, lastName: string | null, name: string | null, email: string | null, phone: string | null, profileImage: string | null, createdAt: string | null };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { user: { id: string, role: Role | null, language: Language | null, firstName: string | null, lastName: string | null, name: string | null, email: string | null, phone: string | null, profileImage: string | null, createdAt: string | null } };

export type UpdateUserMutationVariables = Exact<{
  data: UpdateUser;
}>;


export type UpdateUserMutation = { updateUser: { id: string, role: Role | null, language: Language | null, firstName: string | null, lastName: string | null, name: string | null, email: string | null, phone: string | null, profileImage: string | null, createdAt: string | null } };

export type DeleteUserMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteUserMutation = { deleteUser: { success: boolean } };

export type UpdateFcmTokenMutationVariables = Exact<{
  data: UpdateFcmToken;
}>;


export type UpdateFcmTokenMutation = { updateFcmToken: { success: boolean } };

export type DeleteFcmTokenMutationVariables = Exact<{
  registrationId: string;
}>;


export type DeleteFcmTokenMutation = { deleteFcmToken: { success: boolean } };

export type UserItemFragment = { id: string, role: Role | null, name: string | null, firstName: string | null, lastName: string | null, email: string | null, phone: string | null, profileImage: string | null, isActive: boolean | null, createdAt: string | null };

export type UsersQueryVariables = Exact<{
  filters?: UserFilter | null | undefined;
  ordering?: Array<UserOrder> | UserOrder | null | undefined;
  pagination?: OffsetPaginationInput | null | undefined;
}>;


export type UsersQuery = { users: { count: number | null, users: Array<{ id: string, role: Role | null, name: string | null, firstName: string | null, lastName: string | null, email: string | null, phone: string | null, profileImage: string | null, isActive: boolean | null, createdAt: string | null }> | null } };

export type UpdateAdminUserMutationVariables = Exact<{
  data: UpdateAdminUser;
}>;


export type UpdateAdminUserMutation = { updateAdminUser: { id: string, role: Role | null, name: string | null, firstName: string | null, lastName: string | null, email: string | null, phone: string | null, profileImage: string | null, isActive: boolean | null, createdAt: string | null } };

export type SendNotificationMutationVariables = Exact<{
  data: SendNotification;
}>;


export type SendNotificationMutation = { sendNotification: { success: boolean } };

export type VehicleCategoryItemFragment = { id: string, name: string | null, description: string | null, nameEn: string | null, nameTr: string | null, descriptionEn: string | null, descriptionTr: string | null, image: string | null, maxPassengers: number | null, maxLuggage: number | null, childSeatCapacity: number | null, isWheelchairAccessible: boolean | null, baseFare: string | null, perKmPrice: string | null, perMinutePrice: string | null, minimumFare: string | null, currency: Currency | null, order: number | null, isActive: boolean | null };

export type VehicleItemFragment = { id: string, driverId: string, categoryId: string, plate: string | null, brand: string | null, model: string | null, year: number | null, color: string | null, image: string | null, isActive: boolean | null, createdAt: string | null, category: { id: string, name: string | null } | null, driver: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null } | null };

export type VehiclesQueryVariables = Exact<{
  filters?: VehicleFilter | null | undefined;
  ordering?: Array<VehicleOrder> | VehicleOrder | null | undefined;
  pagination?: OffsetPaginationInput | null | undefined;
}>;


export type VehiclesQuery = { vehicles: { count: number | null, vehicles: Array<{ id: string, driverId: string, categoryId: string, plate: string | null, brand: string | null, model: string | null, year: number | null, color: string | null, image: string | null, isActive: boolean | null, createdAt: string | null, category: { id: string, name: string | null } | null, driver: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null } | null }> | null } };

export type CreateVehicleMutationVariables = Exact<{
  data: CreateVehicle;
}>;


export type CreateVehicleMutation = { createVehicle: { id: string, driverId: string, categoryId: string, plate: string | null, brand: string | null, model: string | null, year: number | null, color: string | null, image: string | null, isActive: boolean | null, createdAt: string | null, category: { id: string, name: string | null } | null, driver: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null } | null } };

export type UpdateVehicleMutationVariables = Exact<{
  data: UpdateVehicle;
}>;


export type UpdateVehicleMutation = { updateVehicle: { id: string, driverId: string, categoryId: string, plate: string | null, brand: string | null, model: string | null, year: number | null, color: string | null, image: string | null, isActive: boolean | null, createdAt: string | null, category: { id: string, name: string | null } | null, driver: { id: string, name: string | null, firstName: string | null, lastName: string | null, profileImage: string | null } | null } };

export type DeleteVehicleMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteVehicleMutation = { deleteVehicle: { success: boolean } };

export type VehicleCategoriesQueryVariables = Exact<{
  language?: Language | null | undefined;
  filters?: VehicleCategoryFilter | null | undefined;
  ordering?: Array<VehicleCategoryOrder> | VehicleCategoryOrder | null | undefined;
  pagination?: OffsetPaginationInput | null | undefined;
}>;


export type VehicleCategoriesQuery = { vehicleCategories: { count: number | null, vehicleCategories: Array<{ id: string, name: string | null, description: string | null, nameEn: string | null, nameTr: string | null, descriptionEn: string | null, descriptionTr: string | null, image: string | null, maxPassengers: number | null, maxLuggage: number | null, childSeatCapacity: number | null, isWheelchairAccessible: boolean | null, baseFare: string | null, perKmPrice: string | null, perMinutePrice: string | null, minimumFare: string | null, currency: Currency | null, order: number | null, isActive: boolean | null }> | null } };

export type CreateVehicleCategoryMutationVariables = Exact<{
  data: CreateVehicleCategory;
}>;


export type CreateVehicleCategoryMutation = { createVehicleCategory: { id: string, name: string | null, description: string | null, nameEn: string | null, nameTr: string | null, descriptionEn: string | null, descriptionTr: string | null, image: string | null, maxPassengers: number | null, maxLuggage: number | null, childSeatCapacity: number | null, isWheelchairAccessible: boolean | null, baseFare: string | null, perKmPrice: string | null, perMinutePrice: string | null, minimumFare: string | null, currency: Currency | null, order: number | null, isActive: boolean | null } };

export type UpdateVehicleCategoryMutationVariables = Exact<{
  data: UpdateVehicleCategory;
}>;


export type UpdateVehicleCategoryMutation = { updateVehicleCategory: { id: string, name: string | null, description: string | null, nameEn: string | null, nameTr: string | null, descriptionEn: string | null, descriptionTr: string | null, image: string | null, maxPassengers: number | null, maxLuggage: number | null, childSeatCapacity: number | null, isWheelchairAccessible: boolean | null, baseFare: string | null, perKmPrice: string | null, perMinutePrice: string | null, minimumFare: string | null, currency: Currency | null, order: number | null, isActive: boolean | null } };

export type DeleteVehicleCategoryMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteVehicleCategoryMutation = { deleteVehicleCategory: { success: boolean } };

export const VehicleOptionItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleOptionItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"maxPassengers"}},{"kind":"Field","name":{"kind":"Name","value":"maxLuggage"}},{"kind":"Field","name":{"kind":"Name","value":"childSeatCapacity"}},{"kind":"Field","name":{"kind":"Name","value":"isWheelchairAccessible"}}]}}]}}]} as unknown as DocumentNode<VehicleOptionItemFragment, unknown>;
export const BookingTransferFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BookingTransferFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transfer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pickupAddress"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"pickupDistrict"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dropoffAddress"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffDistrict"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupTime"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"passengerCount"}},{"kind":"Field","name":{"kind":"Name","value":"luggageCount"}},{"kind":"Field","name":{"kind":"Name","value":"childSeatCount"}},{"kind":"Field","name":{"kind":"Name","value":"needsWheelchair"}},{"kind":"Field","name":{"kind":"Name","value":"passengerName"}},{"kind":"Field","name":{"kind":"Name","value":"passengerPhone"}},{"kind":"Field","name":{"kind":"Name","value":"flightNumber"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"legs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"startAddress"}},{"kind":"Field","name":{"kind":"Name","value":"endAddress"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}}]} as unknown as DocumentNode<BookingTransferFieldsFragment, unknown>;
export const MessageItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MessageItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Message"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"transferId"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"file"}},{"kind":"Field","name":{"kind":"Name","value":"time"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"file"}}]}}]}}]} as unknown as DocumentNode<MessageItemFragment, unknown>;
export const MessageThreadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MessageThread"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transfer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pickupTime"}},{"kind":"Field","name":{"kind":"Name","value":"pickupAddress"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffAddress"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"operatorId"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}}]}}]}}]} as unknown as DocumentNode<MessageThreadFragment, unknown>;
export const NotificationItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Notification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"isSeen"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<NotificationItemFragment, unknown>;
export const TransactionItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransactionItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"transferId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"orderAmount"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderTime"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]} as unknown as DocumentNode<TransactionItemFragment, unknown>;
export const TransferRowFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransferRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transfer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pickupTime"}},{"kind":"Field","name":{"kind":"Name","value":"pickupAddress"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffAddress"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"passengerName"}},{"kind":"Field","name":{"kind":"Name","value":"passengerCount"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"operatorId"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<TransferRowFragment, unknown>;
export const TransferDetailFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransferDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transfer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TransferRow"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"passengerPhone"}},{"kind":"Field","name":{"kind":"Name","value":"luggageCount"}},{"kind":"Field","name":{"kind":"Name","value":"childSeatCount"}},{"kind":"Field","name":{"kind":"Name","value":"needsWheelchair"}},{"kind":"Field","name":{"kind":"Name","value":"flightNumber"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"operator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupDistrict"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"dropoffDistrict"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"legs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"startAddress"}},{"kind":"Field","name":{"kind":"Name","value":"endAddress"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransferRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transfer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pickupTime"}},{"kind":"Field","name":{"kind":"Name","value":"pickupAddress"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffAddress"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"passengerName"}},{"kind":"Field","name":{"kind":"Name","value":"passengerCount"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"operatorId"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<TransferDetailFragment, unknown>;
export const CurrentUserFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CurrentUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CurrentUserFragment, unknown>;
export const UserItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UserItemFragment, unknown>;
export const VehicleCategoryItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleCategoryItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleCategory"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"nameTr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionEn"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionTr"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"maxPassengers"}},{"kind":"Field","name":{"kind":"Name","value":"maxLuggage"}},{"kind":"Field","name":{"kind":"Name","value":"childSeatCapacity"}},{"kind":"Field","name":{"kind":"Name","value":"isWheelchairAccessible"}},{"kind":"Field","name":{"kind":"Name","value":"baseFare"}},{"kind":"Field","name":{"kind":"Name","value":"perKmPrice"}},{"kind":"Field","name":{"kind":"Name","value":"perMinutePrice"}},{"kind":"Field","name":{"kind":"Name","value":"minimumFare"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<VehicleCategoryItemFragment, unknown>;
export const VehicleItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Vehicle"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}}]}}]}}]} as unknown as DocumentNode<VehicleItemFragment, unknown>;
export const SignInDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SignIn"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SignIn"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signIn"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CurrentUser"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CurrentUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<SignInMutation, SignInMutationVariables>;
export const GetCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GetCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetCode"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"secret"}},{"kind":"Field","name":{"kind":"Name","value":"expireSeconds"}}]}}]}}]} as unknown as DocumentNode<GetCodeMutation, GetCodeMutationVariables>;
export const ValidateCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ValidateCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ValidateCode"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"validateCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"secret"}},{"kind":"Field","name":{"kind":"Name","value":"expireSeconds"}}]}}]}}]} as unknown as DocumentNode<ValidateCodeMutation, ValidateCodeMutationVariables>;
export const CreateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUser"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CurrentUser"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CurrentUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPassword"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const BookingTransferDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BookingTransfer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transfer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BookingTransferFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BookingTransferFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transfer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pickupAddress"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"pickupDistrict"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dropoffAddress"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffDistrict"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupTime"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"passengerCount"}},{"kind":"Field","name":{"kind":"Name","value":"luggageCount"}},{"kind":"Field","name":{"kind":"Name","value":"childSeatCount"}},{"kind":"Field","name":{"kind":"Name","value":"needsWheelchair"}},{"kind":"Field","name":{"kind":"Name","value":"passengerName"}},{"kind":"Field","name":{"kind":"Name","value":"passengerPhone"}},{"kind":"Field","name":{"kind":"Name","value":"flightNumber"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"legs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"startAddress"}},{"kind":"Field","name":{"kind":"Name","value":"endAddress"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}}]} as unknown as DocumentNode<BookingTransferQuery, BookingTransferQueryVariables>;
export const VehicleOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VehicleOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"transferId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vehicleOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"transferId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"transferId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VehicleOptionItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleOptionItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"maxPassengers"}},{"kind":"Field","name":{"kind":"Name","value":"maxLuggage"}},{"kind":"Field","name":{"kind":"Name","value":"childSeatCapacity"}},{"kind":"Field","name":{"kind":"Name","value":"isWheelchairAccessible"}}]}}]}}]} as unknown as DocumentNode<VehicleOptionsQuery, VehicleOptionsQueryVariables>;
export const CreateTransferDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTransfer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTransfer"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTransfer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transfer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BookingTransferFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicleOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VehicleOptionItem"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BookingTransferFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transfer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pickupAddress"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"pickupDistrict"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dropoffAddress"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffDistrict"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupTime"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"passengerCount"}},{"kind":"Field","name":{"kind":"Name","value":"luggageCount"}},{"kind":"Field","name":{"kind":"Name","value":"childSeatCount"}},{"kind":"Field","name":{"kind":"Name","value":"needsWheelchair"}},{"kind":"Field","name":{"kind":"Name","value":"passengerName"}},{"kind":"Field","name":{"kind":"Name","value":"passengerPhone"}},{"kind":"Field","name":{"kind":"Name","value":"flightNumber"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"legs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"startAddress"}},{"kind":"Field","name":{"kind":"Name","value":"endAddress"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleOptionItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"maxPassengers"}},{"kind":"Field","name":{"kind":"Name","value":"maxLuggage"}},{"kind":"Field","name":{"kind":"Name","value":"childSeatCapacity"}},{"kind":"Field","name":{"kind":"Name","value":"isWheelchairAccessible"}}]}}]}}]} as unknown as DocumentNode<CreateTransferMutation, CreateTransferMutationVariables>;
export const UpdateTransferDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTransfer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTransfer"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTransfer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transfer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BookingTransferFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicleOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VehicleOptionItem"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BookingTransferFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transfer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pickupAddress"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"pickupDistrict"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dropoffAddress"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffDistrict"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupTime"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"passengerCount"}},{"kind":"Field","name":{"kind":"Name","value":"luggageCount"}},{"kind":"Field","name":{"kind":"Name","value":"childSeatCount"}},{"kind":"Field","name":{"kind":"Name","value":"needsWheelchair"}},{"kind":"Field","name":{"kind":"Name","value":"passengerName"}},{"kind":"Field","name":{"kind":"Name","value":"passengerPhone"}},{"kind":"Field","name":{"kind":"Name","value":"flightNumber"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"legs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"startAddress"}},{"kind":"Field","name":{"kind":"Name","value":"endAddress"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleOptionItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"maxPassengers"}},{"kind":"Field","name":{"kind":"Name","value":"maxLuggage"}},{"kind":"Field","name":{"kind":"Name","value":"childSeatCapacity"}},{"kind":"Field","name":{"kind":"Name","value":"isWheelchairAccessible"}}]}}]}}]} as unknown as DocumentNode<UpdateTransferMutation, UpdateTransferMutationVariables>;
export const PayTransferDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PayTransfer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PayTransfer"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payTransfer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paymentLink"}},{"kind":"Field","name":{"kind":"Name","value":"linkExpireTime"}}]}}]}}]} as unknown as DocumentNode<PayTransferMutation, PayTransferMutationVariables>;
export const MessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Messages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"transferId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"transferId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"transferId"}}},{"kind":"Argument","name":{"kind":"Name","value":"ordering"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"time"},"value":{"kind":"EnumValue","value":"ASC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MessageItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MessageItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Message"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"transferId"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"file"}},{"kind":"Field","name":{"kind":"Name","value":"time"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"file"}}]}}]}}]} as unknown as DocumentNode<MessagesQuery, MessagesQueryVariables>;
export const SendMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SendMessage"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MessageItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MessageItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Message"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"transferId"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"file"}},{"kind":"Field","name":{"kind":"Name","value":"time"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"file"}}]}}]}}]} as unknown as DocumentNode<SendMessageMutation, SendMessageMutationVariables>;
export const UpdateMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMessage"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MessageItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MessageItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Message"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"transferId"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"file"}},{"kind":"Field","name":{"kind":"Name","value":"time"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"file"}}]}}]}}]} as unknown as DocumentNode<UpdateMessageMutation, UpdateMessageMutationVariables>;
export const DeleteMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MessageItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MessageItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Message"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"transferId"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"file"}},{"kind":"Field","name":{"kind":"Name","value":"time"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"file"}}]}}]}}]} as unknown as DocumentNode<DeleteMessageMutation, DeleteMessageMutationVariables>;
export const SeeMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SeeMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"transferId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"seeMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"transferId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"transferId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<SeeMessagesMutation, SeeMessagesMutationVariables>;
export const MessageThreadsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MessageThreads"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TransferFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transfers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"ordering"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"pickupTime"},"value":{"kind":"EnumValue","value":"ASC"}}]}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"offset"},"value":{"kind":"IntValue","value":"0"}},{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"transfers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MessageThread"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MessageThread"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transfer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pickupTime"}},{"kind":"Field","name":{"kind":"Name","value":"pickupAddress"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffAddress"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"operatorId"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}}]}}]}}]} as unknown as DocumentNode<MessageThreadsQuery, MessageThreadsQueryVariables>;
export const UnseenNotificationCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UnseenNotificationCount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unseenNotificationCount"}}]}}]} as unknown as DocumentNode<UnseenNotificationCountQuery, UnseenNotificationCountQueryVariables>;
export const NotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Notifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NotificationFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ordering"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NotificationOrder"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OffsetPaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"ordering"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ordering"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NotificationItem"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Notification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"isSeen"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<NotificationsQuery, NotificationsQueryVariables>;
export const SeeNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SeeNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"seeNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<SeeNotificationsMutation, SeeNotificationsMutationVariables>;
export const DeleteNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<DeleteNotificationsMutation, DeleteNotificationsMutationVariables>;
export const EventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"Events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscribe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"notificationId"}},{"kind":"Field","name":{"kind":"Name","value":"transferId"}},{"kind":"Field","name":{"kind":"Name","value":"messageId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"file"}}]}}]}}]} as unknown as DocumentNode<EventsSubscription, EventsSubscriptionVariables>;
export const TransactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Transactions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ordering"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionOrder"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OffsetPaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"ordering"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ordering"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TransactionItem"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransactionItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"transferId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"orderAmount"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderTime"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]} as unknown as DocumentNode<TransactionsQuery, TransactionsQueryVariables>;
export const RefundTransactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefundTransaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RefundTransaction"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refundTransaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TransactionItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransactionItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"transferId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"orderAmount"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderTime"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]} as unknown as DocumentNode<RefundTransactionMutation, RefundTransactionMutationVariables>;
export const TransfersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Transfers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TransferFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ordering"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TransferOrder"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OffsetPaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transfers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"ordering"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ordering"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"transfers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TransferRow"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransferRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transfer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pickupTime"}},{"kind":"Field","name":{"kind":"Name","value":"pickupAddress"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffAddress"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"passengerName"}},{"kind":"Field","name":{"kind":"Name","value":"passengerCount"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"operatorId"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<TransfersQuery, TransfersQueryVariables>;
export const TransferDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Transfer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transfer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TransferDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransferRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transfer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pickupTime"}},{"kind":"Field","name":{"kind":"Name","value":"pickupAddress"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffAddress"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"passengerName"}},{"kind":"Field","name":{"kind":"Name","value":"passengerCount"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"operatorId"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransferDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transfer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TransferRow"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"passengerPhone"}},{"kind":"Field","name":{"kind":"Name","value":"luggageCount"}},{"kind":"Field","name":{"kind":"Name","value":"childSeatCount"}},{"kind":"Field","name":{"kind":"Name","value":"needsWheelchair"}},{"kind":"Field","name":{"kind":"Name","value":"flightNumber"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"operator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupDistrict"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"dropoffDistrict"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"legs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"startAddress"}},{"kind":"Field","name":{"kind":"Name","value":"endAddress"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}}]} as unknown as DocumentNode<TransferQuery, TransferQueryVariables>;
export const TransferTransactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TransferTransactions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"transferId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"transferId"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"exact"},"value":{"kind":"Variable","name":{"kind":"Name","value":"transferId"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"ordering"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"orderTime"},"value":{"kind":"EnumValue","value":"DESC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"orderAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"orderTime"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]}}]}}]} as unknown as DocumentNode<TransferTransactionsQuery, TransferTransactionsQueryVariables>;
export const UpdateTransferStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTransferStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTransferStatus"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTransferStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<UpdateTransferStatusMutation, UpdateTransferStatusMutationVariables>;
export const CancelTransferDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelTransfer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelTransfer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CancelTransferMutation, CancelTransferMutationVariables>;
export const AssignDriverDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignDriver"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AssignDriver"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignDriver"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TransferDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransferRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transfer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pickupTime"}},{"kind":"Field","name":{"kind":"Name","value":"pickupAddress"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffAddress"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"pickupLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"passengerName"}},{"kind":"Field","name":{"kind":"Name","value":"passengerCount"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"operatorId"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransferDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transfer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TransferRow"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"passengerPhone"}},{"kind":"Field","name":{"kind":"Name","value":"luggageCount"}},{"kind":"Field","name":{"kind":"Name","value":"childSeatCount"}},{"kind":"Field","name":{"kind":"Name","value":"needsWheelchair"}},{"kind":"Field","name":{"kind":"Name","value":"flightNumber"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"operator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupDistrict"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"dropoffDistrict"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"legs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"startAddress"}},{"kind":"Field","name":{"kind":"Name","value":"endAddress"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}}]} as unknown as DocumentNode<AssignDriverMutation, AssignDriverMutationVariables>;
export const AvailableDriversDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AvailableDrivers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"transferId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UserFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OffsetPaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availableDrivers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"transferId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"transferId"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}}]}}]}}]}}]} as unknown as DocumentNode<AvailableDriversQuery, AvailableDriversQueryVariables>;
export const AvailableVehiclesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AvailableVehicles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"transferId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availableVehicles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"transferId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"transferId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"year"}}]}}]}}]} as unknown as DocumentNode<AvailableVehiclesQuery, AvailableVehiclesQueryVariables>;
export const TipDriverDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TipDriver"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TipDriver"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tipDriver"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paymentLink"}},{"kind":"Field","name":{"kind":"Name","value":"linkExpireTime"}}]}}]}}]} as unknown as DocumentNode<TipDriverMutation, TipDriverMutationVariables>;
export const CurrentUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CurrentUser"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CurrentUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CurrentUserQuery, CurrentUserQueryVariables>;
export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUser"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CurrentUser"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CurrentUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const DeleteUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<DeleteUserMutation, DeleteUserMutationVariables>;
export const UpdateFcmTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateFcmToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFcmToken"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFcmToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<UpdateFcmTokenMutation, UpdateFcmTokenMutationVariables>;
export const DeleteFcmTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteFcmToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"registrationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteFcmToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"registrationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"registrationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<DeleteFcmTokenMutation, DeleteFcmTokenMutationVariables>;
export const UsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Users"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UserFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ordering"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserOrder"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OffsetPaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"ordering"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ordering"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserItem"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>;
export const UpdateAdminUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAdminUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateAdminUser"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAdminUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UpdateAdminUserMutation, UpdateAdminUserMutationVariables>;
export const SendNotificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendNotification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SendNotification"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendNotification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<SendNotificationMutation, SendNotificationMutationVariables>;
export const VehiclesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Vehicles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ordering"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleOrder"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OffsetPaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vehicles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"ordering"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ordering"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"vehicles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VehicleItem"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Vehicle"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}}]}}]}}]} as unknown as DocumentNode<VehiclesQuery, VehiclesQueryVariables>;
export const CreateVehicleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateVehicle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateVehicle"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createVehicle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VehicleItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Vehicle"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}}]}}]}}]} as unknown as DocumentNode<CreateVehicleMutation, CreateVehicleMutationVariables>;
export const UpdateVehicleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateVehicle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateVehicle"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateVehicle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VehicleItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Vehicle"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}}]}}]}}]} as unknown as DocumentNode<UpdateVehicleMutation, UpdateVehicleMutationVariables>;
export const DeleteVehicleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteVehicle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteVehicle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<DeleteVehicleMutation, DeleteVehicleMutationVariables>;
export const VehicleCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VehicleCategories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"language"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Language"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleCategoryFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ordering"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleCategoryOrder"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OffsetPaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vehicleCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"language"},"value":{"kind":"Variable","name":{"kind":"Name","value":"language"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"ordering"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ordering"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VehicleCategoryItem"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleCategoryItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleCategory"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"nameTr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionEn"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionTr"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"maxPassengers"}},{"kind":"Field","name":{"kind":"Name","value":"maxLuggage"}},{"kind":"Field","name":{"kind":"Name","value":"childSeatCapacity"}},{"kind":"Field","name":{"kind":"Name","value":"isWheelchairAccessible"}},{"kind":"Field","name":{"kind":"Name","value":"baseFare"}},{"kind":"Field","name":{"kind":"Name","value":"perKmPrice"}},{"kind":"Field","name":{"kind":"Name","value":"perMinutePrice"}},{"kind":"Field","name":{"kind":"Name","value":"minimumFare"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<VehicleCategoriesQuery, VehicleCategoriesQueryVariables>;
export const CreateVehicleCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateVehicleCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateVehicleCategory"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createVehicleCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VehicleCategoryItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleCategoryItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleCategory"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"nameTr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionEn"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionTr"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"maxPassengers"}},{"kind":"Field","name":{"kind":"Name","value":"maxLuggage"}},{"kind":"Field","name":{"kind":"Name","value":"childSeatCapacity"}},{"kind":"Field","name":{"kind":"Name","value":"isWheelchairAccessible"}},{"kind":"Field","name":{"kind":"Name","value":"baseFare"}},{"kind":"Field","name":{"kind":"Name","value":"perKmPrice"}},{"kind":"Field","name":{"kind":"Name","value":"perMinutePrice"}},{"kind":"Field","name":{"kind":"Name","value":"minimumFare"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<CreateVehicleCategoryMutation, CreateVehicleCategoryMutationVariables>;
export const UpdateVehicleCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateVehicleCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateVehicleCategory"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateVehicleCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VehicleCategoryItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleCategoryItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleCategory"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"nameTr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionEn"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionTr"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"maxPassengers"}},{"kind":"Field","name":{"kind":"Name","value":"maxLuggage"}},{"kind":"Field","name":{"kind":"Name","value":"childSeatCapacity"}},{"kind":"Field","name":{"kind":"Name","value":"isWheelchairAccessible"}},{"kind":"Field","name":{"kind":"Name","value":"baseFare"}},{"kind":"Field","name":{"kind":"Name","value":"perKmPrice"}},{"kind":"Field","name":{"kind":"Name","value":"perMinutePrice"}},{"kind":"Field","name":{"kind":"Name","value":"minimumFare"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<UpdateVehicleCategoryMutation, UpdateVehicleCategoryMutationVariables>;
export const DeleteVehicleCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteVehicleCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteVehicleCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<DeleteVehicleCategoryMutation, DeleteVehicleCategoryMutationVariables>;