/* eslint-disable @typescript-eslint/no-explicit-any */
export const getErrorMessage = (err: any): string => {
  if (err?.data?.errorMessages && Array.isArray(err.data.errorMessages) && err.data.errorMessages.length > 0) {
    return err.data.errorMessages.map((e: any) => e.message).join(', ');
  }
  return err?.data?.message || err?.message || 'Something went wrong';
};
