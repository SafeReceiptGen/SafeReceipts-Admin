"use server";

import { headers } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type ServerRequestResult<T> =
  | { error: false; data: T; totalCount?: number }
  | {
      error: true;
      message: string;
      status: number;
      details?: Record<string, string[]>;
    };

export interface SerializableRequestOptions {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
}

export async function serverRequest<T>(
  path: string,
  options: SerializableRequestOptions = {},
): Promise<ServerRequestResult<T>> {
  let cookieHeader = "";

  try {
    const headersList = await headers();
    cookieHeader = headersList.get("cookie") || "";
  } catch {
    console.warn("Could not retrieve cookies on the server");
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
        ...options.headers,
      },
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        error: true,
        message: json.message ?? "Request failed",
        status: res.status,
        details: json.data,
      };
    }

    return {
      error: false,
      data: json.data as T,
      totalCount:
        typeof json.total_count === "number" ? json.total_count : undefined,
    };
  } catch (error: unknown) {
    return {
      error: true,
      message: error instanceof Error ? error.message : "Network error",
      status: 500,
    };
  }
}
