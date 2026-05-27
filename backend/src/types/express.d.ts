declare global {
  namespace Express {
    interface Request {
      actor?: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

export {};
