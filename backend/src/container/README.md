# Container Module

This small markdown describes the design and functionality of the container module

## Why use a container?

There are a few reasons why a container is used in this application:

- Centralized object instantiation using `Factory` pattern
- Modifications can be made to objects using `Builder` pattern without affecting other dependencies
- An IoC method to help loosely coupled our functionality for easier testing and replacing, especially in the case if we pivot to interfaces
- Object lifecycle defined in one place. Each object has a lifecycle during the application runtime, such as existing once for the entire application, or a new one is made for each HTTP request

There are a few downsides to using a custom made container. The primary downside is that the container must be managed by developers in the `backend` and `worker` folder, which may lead to inconsistencies or broken code when moving one to another. Typically, this would be handled by the framework's IoC, such as `.NET` or `Spring`. But Node by itself does not have one. However, this is an acceptable tradeoff due to the forementioned benefits.

## Container Usage

The container module is split into controller, repository, services etc. It helps keep the module clean if we want to extend or remove a functionality, and makes it easier to locate objects.

To use and add to the container, first create an object that depends on other objects (if needed)

Example, suppose ServiceA depends on ServiceB and ServiceC

```bash
class ServiceA {
  private readonly serviceB: ServiceB;
  private readonly serviceC: ServiceC;

  constructor(dependencies: {
    serviceB: ServiceB;
    serviceC: ServiceC;
  }) {
    this.serviceB = dependencies.serviceB;
    this.serviceC = dependencies.serviceC;
  }
}

export { ServiceA }
```

To provide the dependencies to ServiceA, go to the relative container file, in this case, `container.service.ts` and add the following:

```bash
services.set("ServiceA", {
    factory: (scope) =>
    new Services.ServiceA({
        serviceB: scope.resolve("ServiceB"),
        serviceC: scope.resolve("ServiceC"),
    }),
    lifetime: "scoped",
});
```

This informs the container that when ServiceA is requested, then it can construct the objects using these depenendencies. Notice how the dependencies are stored as JSON object. This is to avoid potential positional argument issues. A key arguement you can add is `lifetime`. This argument describes how the object lifecycle should behave throughout the application.

Once the container has instructions, you can request the object usually through the [controller hook](../hooks/controllerHook.ts). The scope is handled by [scope plugin](../plugin/scopePlugin.ts) automatically.

Example usage of a route requesting the controller with its dependenices injected:

```bash
app.get(
    "/:id",
    useController("SomeController", (c) => c.method)
);
```

This now informs Node that when this route is hit, it must request the controller with its dependenices from the container, which the container will create.