import {AnyObject, property} from '@loopback/repository';
import moment from "moment";

export function FormattedDate(format: string = 'YYYY-MM-DD HH:mm:ss', params: AnyObject) {
  return function (target: any, propertyKey: string) {
    console.log("propertyKey", propertyKey)
    property({
      ...params
    })(target, propertyKey);

    const privateKey = `__${propertyKey}`;

    Object.defineProperty(target, propertyKey, {
      get: function () {
        const value = this[privateKey];
        return value ? moment(value).format(format) : value;
      },
      set: function (value: any) {
        this[privateKey] = new Date(value);
      },
      enumerable: true,
      configurable: true,
    });
  };
}
