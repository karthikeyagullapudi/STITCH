// Resolves to the response body; rejects with the server's JSON error body
// (or a fallback message when the request never reached the server).
export const request = async (call, fallback) => {
  try {
    const response = await call();
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: fallback };
  }
};

// Readable message from a rejected request (message or validator errors).
export const readError = (error, fallback) =>
  error?.message || error?.errors?.map((e) => e.msg).join(', ') || fallback;
