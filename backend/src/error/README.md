# Error Module

This small markdown shows the steps needed to extend the error module for other common errors found in [Http Status Messages](https://www.w3schools.com/tags/ref_httpmessages.asp). These errors may be shared accross the application if needed.

## Creating a new error

To create a new app error, create a file and copy the base code:

```bash
import { HttpError } from "./httpError";

class NAME extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: CODE,
      message: params.message ?? "DEFAULTMESSAGE.",
      details: params.details,
    });
  }
}

export { NAME };
```

Replace `NAME`, `CODE`, `DEFAULTMESSAGE` with the error code that you want to add. Please name the file to something approriate and add it to the [namespace](./index.ts).

## Example usage of the new error

To use the error, ensure that the controller can catch the error. Typically, it will be structured as follows:

```bash
public async someName(
    req: FastifyRequest<{ DTO }>,
    reply: FastifyReply
) {
    // code to execute
} catch (err: any) {
    if (err instanceof HttpError) throw err;

    logger.error(
    `[Controller] getCourses failed: ${err?.message ?? err}`
    );
    throw new InternalServerError({ message: "Internal server error" });
}
```

Notice how if the error is known already, i.e passed from service, then it responds back with the known error before creating a new one. It is recommended that you use the [logger](../utility/logger.ts).

**Important note**: The [error middleware](../plugin/errorPlugin.ts) will convert the application error to a JSON response code for the client. The controller, service or repository does not need to convert it assuming that the error thrown is an instance of `HttpError`.


Basic usage of custom errors are like any other ordinary error. Note that its uses JSON objects so positional arguements are avoided.

```bash
throw new InternalServerError({ message: "Internal server error" });
```

Refer to [DEVELOPERS](../../../docs/DEVELOPERS.md) if there are more questions relating to design.
