// utils/response.js
export function sendSuccess(res, data, message = "Success", code = 200) {
  res.status(code).json({
    code,
    success: true,
    message,
    data,
  });
}

export function sendError(res, message = "Error", code = 500) {
  res.status(code).json({
    code,
    success: false,
    message,
    data: null,
  });
}
