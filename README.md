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

# Database & Cache
DATABASE_URL=             # Connection string for your database
REDIS_URL=                # Redis connection string

# Authentication
JWT_SECRET=               # Primary JWT secret key
JWT_SECRET_2=             # Secondary JWT secret (for rotation)

# CORS
CORS_WHITELIST=           # Comma-separated list of allowed origins

# Google OAuth
GOOGLE_CLIENT_ID=         # Google OAuth client ID
GOOGLE_CLIENT_SECRET=     # Google OAuth client secret
GOOGLE_REDIRECT_URI=      # Google OAuth redirect URI

# Email (SMTP)
EMAIL_USER=               # Email address used to send mails
EMAIL_PASS=               # App password or SMTP password

# Microsoft OAuth
MS_TENANT_ID=             # Microsoft tenant ID
MS_CLIENT_ID=             # Microsoft OAuth client ID
MS_CLIENT_SECRET=         # Microsoft OAuth client secret
MS_REDIRECT_URI=          # Microsoft OAuth redirect URI

# Frontend
FRONTEND_CLIENT=          # Frontend client URL

More information about the .env variables in the frontend

## Demo

Insert gif or link to demo

Deployed webite:


## Screenshots

![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)


## Requirements

To run the project locally, you will either need:

- Docker

or

- Node.js

Verify Docker is working with:

```bash
   docker --version
```


Verify Node is working with:

```bash
  node --version
```

NOTE: It is recommened that you use Docker since a full shell script is provided to run the project

You are now ready to install and run the project
## Installation

### Clone the project

```bash
  git clone https://github.com/thomastran117/EasyFood.git
```

### Frontend

Install the frontend's dependencies with npm

```bash
  cd frontend
  npm install
```

### Backend
Install the backend's dependencies with npm

```bash
  cd backend
  npm install
```

## Running the Application

### Running the frontend

```bash
  # If not already in frontend directory
  cd frontend

  npm run dev
```

The frontend is avaliable at http://localhost:8040
### Running the backend

The backend is avaliable at http://localhost:8040

```bash
  # If not already in backend directory
  cd backend
  
  npm run dev
```
Remember to use the api prefix

### Docker (optional but recommended)

Using docker, run the following command in the root directory:
```bash
  .\scripts\start-app.ps1 # Windows
  # OR
  ./scripts/start-app.sh # Linux
```
  
The frontend is avaliable at http://localhost:3040 and the backend is at http://localhost:8040. Remember to use the api prefix for the server.
## Running Tests

To run tests, run the following command

```bash
  .\scripts\run-test.ps1 # Windows
  # OR
  ./scripts/run-test.sh # Linux
```
