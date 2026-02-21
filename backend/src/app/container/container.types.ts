/**
 * @file container.types.ts
 * @description
 * Types for the container
 *
 * @module container
 * @version 1.0.0
 * @auth Thomas
 */

export type Lifetime = "singleton" | "scoped" | "transient";

export interface Registration<T> {
  factory: (...deps: any[]) => T | Promise<T>;
  lifetime: Lifetime;
  instance?: T;
  deps?: string[];
}
