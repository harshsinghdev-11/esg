export class NotFoundError extends Error {
  status = 404;
  code = 'NOT_FOUND';
  constructor(message: string = 'Not Found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  status = 400;
  code = 'VALIDATION_ERROR';
  constructor(message: string = 'Validation Error') {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  status = 401;
  code = 'UNAUTHORIZED';
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  status = 403;
  code = 'FORBIDDEN';
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  status = 409;
  code = 'CONFLICT';
  constructor(message: string = 'Conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}
