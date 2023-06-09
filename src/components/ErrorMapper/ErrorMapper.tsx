import React from "react";

import { isEmptyObject } from "utils/helpers";

interface IErrorMapper {
  errorObj: unknown;
  fallbackText: unknown;
}

const ErrorMapper: React.FC<IErrorMapper> = ({ errorObj, fallbackText }) => {
  if (isEmptyObject(errorObj)) return <div>{fallbackText}</div>;

  return (
    <div>
      {Object.values(errorObj).map((errorValue: unknown, index: number) => {
        return <div key={index}>{errorValue[0]}</div>;
      })}
    </div>
  );
};

export default ErrorMapper;
