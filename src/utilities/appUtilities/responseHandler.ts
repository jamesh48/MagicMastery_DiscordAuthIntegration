import { HttpStatusCode } from 'axios';
import { Response } from 'express';

export const sendResponse = (respObj: {
  res: Response;
  statusCode: HttpStatusCode;
  responseBody: {};
}) => {
  return respObj.res.status(respObj.statusCode).json(respObj.responseBody);
};
