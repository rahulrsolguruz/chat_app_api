import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import response from '../utils/response';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validation = (schema: any, from?: 'body' | 'query' | 'params' | 'formData') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    let data;
    switch (from) {
      case 'body':
        data = _.assign(req.body);
        break;

      case 'query':
        data = _.assign(req.query);
        break;

      case 'params':
        data = _.assign(req.params);
        break;
      case 'formData':
        {
          const paramsData = { ...req.body };
          if (req.file) {
            paramsData[req.file.fieldname] = req.file;
          }
          data = _.assign(paramsData);
        }
        break;
      default:
        {
          const paramsData = { ...req.query, ...req.params };
          data = _.assign(req.body, paramsData);
        }
        break;
    }
    const is_valid = schema.validate(data);
    if (is_valid.error) {
      response.validationError(
        { message: is_valid.error.details[0].message.replace(/(\"|\[|\d\])/g, ''), data: {} },
        _res
      );
    } else {
      next();
    }
  };
};
