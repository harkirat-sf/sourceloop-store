import {AnyObject, property} from '@loopback/repository';
import moment from "moment";

export function FormattedDate(format: string = 'YYYY-MM-DD HH:mm:ss', params: AnyObject) {
  return function (target: any, propertyKey: string) {
    const internalKey = `__${propertyKey}`;

    // Define the actual persisted property with @property
    property(params)(target, internalKey);

    // Define a virtual property for access with formatting
    Object.defineProperty(target, propertyKey, {
      get: function () {
        const value = this[internalKey];
        return value ? moment(value).format(format) : value;
      },
      set: function (value: any) {
        this[internalKey] = value ? new Date(value) : value;
      },
      enumerable: true,
      configurable: true,
    });
  };
}
