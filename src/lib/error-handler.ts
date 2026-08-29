import { NextResponse } from "next/server";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code ?? "INTERNAL_ERROR";
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  const message = error instanceof Error ? error.message : "خطای داخلی سرور";
  const isDev = process.env.NODE_ENV === "development";

  return NextResponse.json(
    {
      error: isDev ? message : "خطای داخلی سرور",
      code: "INTERNAL_ERROR",
      ...(isDev && error instanceof Error ? { details: error.stack } : {}),
    },
    { status: 500 }
  );
}
