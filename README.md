# SchoolSpace

A mock version of BrightSpace. It supports students and teachers being able to enroll in classes, provide assignments and grades. It has a live dashboard to see real-time information.

For a full documentation, refers to the docs/ folder

## Authors

- [@thomastran117](https://www.github.com/thomastran117)


## SchoolSpace Features

- Authenication and Authorization System
- Email System



## Tech Stack

**Client:** React, Redux, JavaScript, Bootstrap

**Server:** JavaScript, Node, Express, Prisma

**Database:** MySQL

### Frontend
-FRONTEND_CLIENT=          # Frontend client URL

Note: it is required that a database and redis URL is provided. Furthermore, Microsoft OAuth, Google OAuth and email variables are not required, but you will be unable to use those functions (will return 503).

The rest of the .env have defaults.

More information about the .env variables in the frontend

## Demo

Insert gif or link to demo

Deployed webite:


## Screenshots

![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)


## Running Tests

To run tests, run the following command

```bash
  .\scripts\run-test.ps1 # Windows
  # OR
  ./scripts/run-test.sh # Linux
```
