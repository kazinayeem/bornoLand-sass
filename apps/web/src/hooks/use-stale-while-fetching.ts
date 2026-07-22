"use client";

import { useRef } from "react";

export function useStaleWhileFetching<T>(data: T | undefined, isFetching: boolean) {
  const ref = useRef<T | undefined>(data);
  if (data !== undefined) ref.current = data;
  return isFetching && data === undefined ? ref.current : data;
}
