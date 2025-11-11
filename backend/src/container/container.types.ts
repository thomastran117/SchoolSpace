export type Lifetime = "singleton" | "scoped" | "transient";

export interface Registration<T> {
  factory: (...deps: any[]) => T | Promise<T>;
  lifetime: Lifetime;
  instance?: T;
}