import { errorMessage } from '../config/constant.config';
import { logWithSourceInfo } from '../middlewares/logger';

const responseStatusCode = {
  success: 200,
  created: 201,
  badRequest: 400,
  unAuthorizedRequest: 401,
  notFound: 404,
  validationError: 422,
  tooManyRequest: 429,
  internalServerError: 500
};

interface Data {
  message: string;
  data: unknown;
}
interface successData {
  data: unknown;
}

interface List {
  message?: string;
  total: number;
  limit: number;
  skip: number;
  data: unknown[];
}

const successCreate = (data: successData, res) =>
  res.status(responseStatusCode.created).json({
    status: 1,
    message: 'Record Created Successfully',
    data: data.data
  });

const successResponse = (data: Data, res) =>
  res.status(responseStatusCode.success).json({
    status: 1,
    message: data.message ? data.message : 'Your request is successfully executed',
    data: data.data
  });

const successResponseWithPagination = (data: List, res) =>
  res.status(responseStatusCode.success).json({
    status: 1,
    message: data.message ? data.message : 'Records found.',
    total: data.total,
    limit: data.limit,
    skip: data.skip,
    data: data.data
  });

const failureResponse = (data: Data, res, fileName?: string, functionName?: string) => {
  logWithSourceInfo(data.message, fileName, functionName, 'error');
  return res.status(responseStatusCode.internalServerError).json({
    status: 0,
    message: data.message ? data.message : 'Internal Server Error',
    data: data.data
  });
};

const badRequest = (data: Data, res) =>
  res.status(responseStatusCode.badRequest).json({
    status: 0,
    message: data.message ? data.message : 'The request cannot be fulfilled due to bad syntax',
    data: data.data
  });

const validationError = (data: Data, res) =>
  res.status(responseStatusCode.validationError).json({
    status: 0,
    message: data.message ? data.message : 'Invalid Data, Validation Failed',
    data: data.data
  });

const isDuplicate = (data: Data, res) =>
  res.status(responseStatusCode.validationError).json({
    status: 0,
    message: data.message ? data.message : 'Data Duplication Found',
    data: data.data
  });

const recordNotFound = (data: Data, res) =>
  res.status(responseStatusCode.success).json({
    status: 0,
    message: data.message ? data.message : 'Record not found with specified criteria.',
    data: data.data
  });

const mongoError = (err, res) =>
  res.status(responseStatusCode.internalServerError).json({
    status: 0,
    message: 'Mongo db related error',
    data: err
  });

const inValidParam = (err, res) =>
  res.status(responseStatusCode.validationError).json({
    status: 0,
    message: 'Invalid values in parameters',
    data: err
  });

const unAuthorizedRequest = (res) =>
  res.status(responseStatusCode.unAuthorizedRequest).json({
    status: 0,
    message: 'You are not authorized to access the request'
  });

const failedSoftDelete = (res) =>
  res.status(responseStatusCode.internalServerError).json({
    status: 0,
    message: 'Data can not be deleted due to internal server error',
    data: {}
  });

const changePasswordFailure = (data, res) =>
  res.status(responseStatusCode.success).json({
    status: 0,
    message: `Password cannot be changed due to ${data}`,
    data: {}
  });

const changePasswordSuccess = (data, res) =>
  res.status(responseStatusCode.success).json({
    status: 1,
    message: data,
    data: {}
  });

const tooManyRequest = (res) =>
  res.status(responseStatusCode.tooManyRequest).json({
    status: 0,
    message: 'Too many requests, please try again later.'
  });
const userExists = (res) => {
  res.status(responseStatusCode.validationError).json({
    status: 0,
    message: errorMessage.USER_EXISTS
  });
};

const userRegisterError = (res, data) => {
  res.status(responseStatusCode.internalServerError).json({
    status: 1,
    message: errorMessage.USER_REGISTER_ERROR,
    data: data.data
  });
};
const invalidCredentials = (res, data) => {
  res.status(responseStatusCode.unAuthorizedRequest).json({
    status: 1,
    message: errorMessage.INVALID_CREDENTIALS,
    data: data.data
  });
};

const response = {
  successCreate,
  successResponse,
  successResponseWithPagination,
  failureResponse,
  badRequest,
  validationError,
  isDuplicate,
  recordNotFound,
  mongoError,
  inValidParam,
  unAuthorizedRequest,
  failedSoftDelete,
  changePasswordFailure,
  changePasswordSuccess,
  tooManyRequest,
  userExists,
  userRegisterError,
  invalidCredentials
};
export default response;
