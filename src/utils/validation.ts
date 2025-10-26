export const formatValidationError = (error: { issues?: { message: string }[] }) => 
  error?.issues?.map((i) => i.message).join(', ') || 'Validation error';