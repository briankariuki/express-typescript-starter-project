type Joi = {
    name: string;
    message: string;
    stack: string;
  };
  
  type Meta = {
    source: string;
  };
  
  type DefaultError = Error & {
    name?: string;
    stack?: string;
    code?: string;
    status?: number;
  } & {
    joi?: Joi;
    meta?: Meta;
  } & {
    inner?: {
      message?: string;
    };
  };
  