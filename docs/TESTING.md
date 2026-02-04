# Testing

This documents describes how to test the application locally and in `CI/CD` environment. By ensuring good testing, we should be able to catch bugs before it reaches prod deployment.

To have any changes accepted and merged, they must pass all tests. You can run the full test suite using:

```bash
./app test
```

## Testing the backend

The backend contains unit tests for each controller, service, plugin and hooks. Additionally, the backend contains integration tests using a database to ensure that the backend workflow is correct. To run the backend tests:

```bash
npm run test
```

Alternatively, you may target a specific folder or file using

```bash
npx jest src/tests/{folder/file}    
```

## Testing the frontend

To do

## End to end

We use playwright alongside the backend server to simulate a real prod environment. Playwright is used to interact with the browser as if it was a real user while the API responds back. Playwright can assert whether the full workflow performs as expected. To run playwright test, navigate to playwright folder and run:

```bash
npx playwright test
```
