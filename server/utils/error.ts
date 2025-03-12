export function parseError(error: any) {
  if (error.name === 'PostgresError') {
    return createError({
      statusCode: 400,
      statusMessage: ErrorMessage.BAD_REQUEST,
      data: error,
    })
  }

  return createError({
    statusCode: error.statusCode || 500,
    statusMessage: error.message,
    data: error,
  })
}
