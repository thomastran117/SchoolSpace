# Developers

This document is a more techinal in-depth overview of the SchoolSpace repo. This document will go over useful tips and advice when developing SchoolSpace.

For Architecture, refer to [ARCHITECTURE.md](\ARCHITECTURE.md)
For Configuration, refer to [CONFIGURATION.md](\CONFIGURATION.md)
For Setup, refer to [SETUP.md](\SETUP.md)
For Testing, refer to [TESTING.md](\TESTING.md)
For Deplyoment, refer to [DEPLOYMENT.md](\DEPLOYMENT.md)
For APIs, refer to [API.md](\API.md)

## Languages

SchoolSpace is developed using [TypeScript](https://www.typescriptlang.org/) for both the frontend and backend. Developing SchoolSpace assumes that you have basic knowledge of TypeScript, and by proxy, [JavaScript](https://www.w3schools.com/Js/).

## Pull/Merge Request

All pull request generally must be peer-reviewed by at least one other core developer. It should following this format:

- `Summary`: fixes, problems addressed, new feature
- `Issues`: what issue or bug did your PR address
- `Test`: how to verify it works
- `Extra notes`: anything else future developers need to know regarding your change

## Git Strategy

SchoolSpace will use the [GitLab Flow](https://about.gitlab.com/topics/version-control/what-is-gitlab-flow/) strategy throughout the development.

## Basic Architecture

SchoolSpace follows a basic client-server architecture. Currently at this time, the client is a web browser while the backend is a modular monolothic design. The backend is designed to be a MVC (Model-View-Controller) to improve maintainability.

Future work after initial completetion of the prototype would be:

- Introduce SSR and SEO via [Next.js](https://nextjs.org/)
- Microservice design via [NATS](https://nats.io/)
- Mobile App via [React Native](https://reactnative.dev/)

## Frontend Structure

The frontend follows a standard folder structure for frontend applications. All code in placed in src/ directory, while any dependencies or configuration is placed at the frontend folder level.

Inside src/, there is:

- assets/ : Any svg should be placed in here

- components/ : This holds components for the React App. It is structured into sub folder which contains components for different functionality of the app, as well as a general shared component for multiple and different pages

- configs/ : Any configuration file should be placed in here. This currently holds the EnvManager.ts

- pages/ : This holds pages for the React App. It is structured into sub folders which contains pages for various content of the app, for example - general main pages, auth pages and course pages.

- routes/ : To improve readability and maintainability, App.tsx is divided into a route folder. Route folder contains route for various content and functionality, and is mounted in routes/index.jsx

- stores/ : Redux store which handles state management.

- styles/ : Additional CSS styling on top of Bootstrap.css

- App.tsx : Mounts the router, and any standard layout we may want across the app

- Main.tsx : Mounts App.tsx, as well as the Redux stores. Also defines the Bootstrap imports here.

## Backend Structure

 Note that the backend follows **ESModule** syntax and not CommonJS. In other words, SchoolSpace is using imports rather than require. Furthermore, all input and output from the backend API is JSON.

The backend is designed to be stateless, it should know very little about the client itself - all information should come from the request. The only exception is authentication where Redis is used to store tokens about the client, particually verification and refresh tokens.

- config/ : Holds any configuration js files that may be needed to be shared across the application. It currently holds the EnvManager.js

-  container/ : Custom IoC where all objects are created and provided to the requester. It defines the factory and builder methods needed to construct the objects. It additionally uses a ScopeContainer to properly handle object life cycle. It might be overkill for a RESTful api but useful to have never the less

- controller/ : Controller folder that handles HTTP request and responses. Additionally calls the correct service to return the proper data model information

- plugin/ : plugin folder contains anything that may need to be processed or ran before reaching the controller. This includes authentication, rate limiting and logging for example.

- resources/ : Contains clients for interacting with MySQL, Mongo and Redis

- routes/ : Contains routes for the various models in the backend, mounted in route.js

- service/ : Contains services that interact with the database. These services assume that the data is mostly sanitized and is validated (i.e syntaxally correct) by the Controller. The services returns data to be transformed by the Controller into JSON

- queue/ : Contains RabbitMQ producers to submit to the queue to be processed by Worker consumers

- utility/ : - Contains general utility functions that is needed throughout the application

- app.ts : Mounts the middleware and routes

- server.ts : Mounts app.ts with a port
