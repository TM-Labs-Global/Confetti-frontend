/** Generic API response envelope */
export interface ApiResponse<T> {
  data: T
  error?: never
}

/** Generic API error envelope */
export interface ApiError {
  error: string
  data?: never
}

export type ApiResult<T> = ApiResponse<T> | ApiError
