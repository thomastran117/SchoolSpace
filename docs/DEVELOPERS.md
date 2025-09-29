# Developers

This document is a more techinal in-depth overview of the SchoolSpace repo. This document will go over useful tips and advice when developing SchoolSpace.

For Architecture, refer to ARCHITECTURE.md
For Setup, refer to SETUP.md
For Testing, refer to TESTING.md
For Deplyoment, refer to DEPLOYMENT.md
For APIs, refer to API.md

## Languages

SchoolSpace is developed using JavaScript for both the frontend and backend. Developing SchoolSpace assumes that you have basic knowledge of JavaScript.

## Basic Architecture

SchoolSpace follows a basic client-server architecture. Currently at this time, the client is a web browser while the backend is a monolothic design. The backend is designed to be a MVC (Model-View-Controller) to improve maintainability.

Future work after initial completetion of the prototype would be:

- Introduce SSR and SEO via Next.js
- Microservice design via Kafta/Redis PubSub
- Mobile App via React Native

## Pull/Merge Request

To be completed

## Frontend Structure

The frontend follows a standard folder structure for frontend applications. All code in placed in src/ directory, while any dependencies or configuration is placed at the frontend folder level.

Inside src/, there is:

- assets/ : Any svg should be placed in here

- auth/ : Currently, it holds the Microsoft OAuth client, this will be subject to change

- components/ : This holds components for the React App. It is structured into sub folder which contains components for different functionality of the app, as well as a general shared component for multiple and different pages

- configs/ : Any configuration file should be placed in here. This currently holds the EnvManager.js

- pages/ : This holds pages for the React App. It is structured into sub folders which contains pages for various content of the app, for example - general main pages, auth pages and course pages.

- routes/ : To improve readability and maintainability, App.jsx is divided into a route folder. Route folder contains route for various content and functionality, and is mounted in routes/index.jsx

- stores/ : Redux store which handles state management.

- styles/ : Additional CSS styling on top of Bootstrap.css

- api.js : The main api that will be used to communicate with the backend. This api file handles access/refresh tokens. Using one api.js improves maintainability and consistency across the application

- App.jsx : Mounts the router, and any standard layout we may want across the app

- Main.jsx : Mounts App.jsx, as well as the Redux stores. Also defines the Bootstrap imports here.

## Backend Structure

Currently backend does not have a src/ directory. This is likely to change. Note that the backend follows **ESModule** syntax and not CommonJS. In other words, SchoolSpace is using imports rather than require. Furthermore, all input and output from the backend API is JSON.

The backend is designed to be stateless, it should know very little about the client itself - all information should come from the request. The only exception is authentication where Redis is used to store tokens about the client, particually verification and refresh tokens.

- config/ : Holds any configuration js files that may be needed to be shared across the application. It currently holds the EnvManager.js

- controller/ : Controller folder that handles HTTP request and responses. Additionally calls the correct service to return the proper data model information

- middleware/ : Middleware folder contains anything that may need to be processed or ran before reaching the controller. This includes authentication, rate limiting and logging for example.

- prisma/ : Contains the migrations for the database as well as the schema that defines the models.

- resources/ : Contains clients for interacting with MySQL, Mongo and REdis

- routes/ : Contains routes for the various models in the backend, mounted in route.js

- service/ : Contains services that interact with the database. These services assume that the data is mostly sanitized and is validated (i.e syntaxally correct) by the Controller. The services returns data to be transformed by the Controller into JSON

- test/ : Contains tests to verify whether the Controller + Service is working, i.e is the backend working

- utility/ : - Contains general utility functions that is needed throughout the application

- app.js : Mounts the middleware and routes

- server.js : Mounts app.js with a port

## Prisma

This section will show how you how to interact and use Prisma. Prisma for the most part, follows a JavaScript-like syntax. After writing or adjusting the models, you will need to make a migration. You can do so as follows:

Start a new migration and save it to dev:
```bash
npx prisma migrate dev --name name
```
Change name to a relevant model change

To push to productuon later, deploy the migration
```bash
npx prisma migrate deploy
```

More information about prisma can be found here [Prisma](https://www.prisma.io/docs/orm)
