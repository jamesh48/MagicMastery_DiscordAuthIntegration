import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import * as EmailValidator from 'email-validator';

export const sendResponse = (respObj: {
  res: Response;
  statusCode: HttpStatusCode;
  responseBody: {};
}) => {
  return respObj.res.status(respObj.statusCode).json(respObj.responseBody);
};

export const validateEmail = (email: string) => {
  return !!EmailValidator.validate(email);
};
