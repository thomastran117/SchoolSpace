# SchoolSpace

A mock version of BrightSpace. It supports students and teachers being able to enroll in classes, provide assignments and grades. It has a live dashboard to see real-time information.


## Authors

- [@thomastran117](https://www.github.com/thomastran117)


## SchoolSpace Features

- Authenication and Authorization System
- Email System



## Tech Stack

**Client:** React, Redux, JavaScript, Bootstrap

**Server:** JavaScript, Node, Express, Prisma

**Database:** MySQL


## Environment Variables

To run the project, you will need to add the following environment variables to in each directory .env file. A script that creates .env for the frontend and backend is provided.

Run 
```bash
.\scripts\create-env.ps1 # Windows
# OR
./scripts/create-env.sh # Linux
```

More indepth information about the .env variables in the backend

### Database & Cache
- DATABASE_URL=             # Connection string for your database
- REDIS_URL=                # Redis connection string

### Authentication
- JWT_SECRET=               # Primary JWT secret key
- JWT_SECRET_2=             # Secondary JWT secret (for rotation)

### CORS
- CORS_WHITELIST=           # Comma-separated list of allowed origins

### Google OAuth
- GOOGLE_CLIENT_ID=         # Google OAuth client ID
- GOOGLE_CLIENT_SECRET=     # Google OAuth client secret
- GOOGLE_REDIRECT_URI=      # Google OAuth redirect URI

Acquire Google OAuth permissions by registering the app at [Google Cloud Console](https://cloud.google.com/cloud-console)

### Email (SMTP)
- EMAIL_USER=               # Email address used to send mails
- EMAIL_PASS=               # App password or SMTP password

### Microsoft OAuth
- MS_TENANT_ID=             # Microsoft tenant ID
- MS_CLIENT_ID=             # Microsoft OAuth client ID
- MS_CLIENT_SECRET=         # Microsoft OAuth client secret
- MS_REDIRECT_URI=          # Microsoft OAuth redirect URI

Acquire Microsoft OAuth Permissions by registering the app at [Azure Entra ID](https://www.microsoft.com/en-ca/security/business/identity-access/microsoft-entra-id)

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


## Requirements

There are a few ways to run the project. You may run the project locally with your own environment, or with Docker. We will go through the two provided ways.

### Docker (recommended)

Install Docker if you don't have it yet.
- [Windows Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Linux Docker Engine](https://docs.docker.com/engine/)
Verify Docker is working with:

```bash
   docker --version
```

This is the recommended approach as the docker file will instantiate and install all dependencies

### Locally (not recommended)

Not recommended, setup is rather tedious

- [Node.js v22.16.0](https://nodejs.org/en/download)
- [MySQL](https://www.mysql.com/downloads/)
- [Redis](https://redis.io/downloads/)

[Installing Redis on Windows](https://redis.io/docs/latest/operate/oss_and_stack/install/archive/install-redis/install-redis-on-windows/)

Alternatively, you can use a cloud instance of MySQL and Redis - however it is a lot for this project

Verify your local environment is working with:

```bash
  node --version

  # Should return the node version
  v22.16.0

  mysql -u root -p -e "SELECT VERSION();" # Should succeed, alternatively check if MySQL shell is avaliable

  redis-cli ping
  
  # Should return pong
  PONG

```

You are now ready to install and run SchoolSpace

## Running the application

### 1. Clone the project

```bash
  git clone https://github.com/thomastran117/SchoolSpace.git
```

Run locally or with docker

Ensure you have .env with redis_url and database_url set.


## Running with Docker (recommended)

Using docker, run the following command in the root directory:
```bash
  .\scripts\run-docker.ps1 # Windows
  # OR
  ./scripts/run-docker.sh # Linux
```
  
The frontend is avaliable at http://localhost:3040 and the backend is at http://localhost:8040. Remember to use the api prefix for the server.

## Running locally


```bash
  # Installing the application
  .\scripts\setup.ps1 # Windows
  # OR
  ./scripts/setup.sh # Linux

  # Running the application
  .\scripts\run-app.ps1 # Windows
  # OR
  ./scripts/run-app.sh # Linux
```

The frontend is avaliable at http://localhost:3040

The backend is avaliable at http://localhost:8040

Remember to use the api prefix

## Running Tests

To run tests, run the following command

```bash
  .\scripts\run-test.ps1 # Windows
  # OR
  ./scripts/run-test.sh # Linux
```
