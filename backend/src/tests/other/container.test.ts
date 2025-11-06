import container from "../../resource/container";

class SingletonService {}
class ScopedService {}
class TransientService {}

beforeAll(() => {
  container.__registerForTest(
    "SingletonService",
    () => new SingletonService(),
    "singleton",
  );
  container.__registerForTest(
    "ScopedService",
    () => new ScopedService(),
    "scoped",
  );
  container.__registerForTest(
    "TransientService",
    () => new TransientService(),
    "transient",
  );
});

describe("Container Lifetime Behavior", () => {
  test("singleton returns the same instance every time", () => {
    const s1 = container.resolve<SingletonService>("SingletonService");
    const s2 = container.resolve<SingletonService>("SingletonService");
    expect(s1).toBe(s2);
  });

  test("scoped returns same instance within same scope", () => {
    const scope = container.createScope();
    const a1 = scope.resolve<ScopedService>("ScopedService");
    const a2 = scope.resolve<ScopedService>("ScopedService");
    expect(a1).toBe(a2);
  });

  test("scoped returns different instances across scopes", () => {
    const scopeA = container.createScope();
    const scopeB = container.createScope();

    const a = scopeA.resolve<ScopedService>("ScopedService");
    const b = scopeB.resolve<ScopedService>("ScopedService");

    expect(a).not.toBe(b);
  });

  test("transient returns a new instance each time", () => {
    const scope = container.createScope();

    const t1 = scope.resolve<TransientService>("TransientService");
    const t2 = scope.resolve<TransientService>("TransientService");

    expect(t1).not.toBe(t2);
  });

  test("singleton is shared between scopes", () => {
    const scopeA = container.createScope();
    const scopeB = container.createScope();

    const s1 = scopeA.resolve<SingletonService>("SingletonService");
    const s2 = scopeB.resolve<SingletonService>("SingletonService");

    expect(s1).toBe(s2);
  });
});
