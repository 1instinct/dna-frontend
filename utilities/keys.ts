import * as crypto from 'crypto';

export const generateKey = () => {
  try {
    const key = crypto.randomUUID();
    return key;
  } catch (error) {
    console.error("Error generating key:", error);
    return null;
  }
};
