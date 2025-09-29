# Setup

This setup document will show how to get SchoolSpace running on your local machine for further development or local dmemos. This documentation will show the minimal setup needed to run the project with or without Docker.

## Requirements

There are two ways to run the project currently. The recommended approach is Docker as its minimal, works regardless of what environment (OS, Node version etc) that you may have, and more importantly, creates a MySQL and Redis container without local installation. You may use your own local Node, MySQL and Redis if you wish, but setup of MySQL and Redis is tedious if you do not have already installed.

### Docker (recommended)

Install Docker if you do not have it yet.

- [Windows Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Linux Docker Engine](https://docs.docker.com/engine/)

Verify Docker is working with:

```bash
   docker --version
```

### Locally (not recommended)

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

Once verification of the tools are successful, then you are ready to install and run SchoolSpace

## Before installation

### 1. Clone the project

Clone SchoolSpace using Git.

```bash
  git clone https://github.com/thomastran117/SchoolSpace.git
```

### Setup .env

Due to Prisma, a minimal .env is needed to complete setup as migrations can't be applied to MySQL without the database URL. Run the following command in the root directory (where scripts/ is located)

Run 
```bash
.\scripts\create-env.ps1 # Windows
# OR
./scripts/create-env.sh # Linux
```

These two scripts will scaffold the exact template needed for both frontend and backend, with defaults configured for local development.

The two .env variables needed for the backend are the MySQL database and Redis.

**NOTE** The app can't launch without the database urls set.

## Running with Docker (recommended)

Although Docker normally works using the standard docker-compose, unfortunately, a new setup must apply the Prisma migrations before the app can run. A shell script is provided that starts the docker container, applies the migration and continues to run it to further smooth development and setup.

Start Docker with the following command at the root directory:

```bash
  .\scripts\run-docker.ps1 # Windows
  # OR
  ./scripts/run-docker.sh # Linux
```
  
Stop the Docker containers with Ctrl^C as you normally would with docker-compose

Once you have applied the migrations, you may use docker-compose to start the application

```bash
  docker-compose up --build
```

**NOTE**: If you apply migrations, you must apply them to the container before it works. I recommend the shell script to do for you.

## Running locally

To run the app locally, we will need to install dependencies and then apply migrations before the app can boot up succesfully. Two shell scripts are provided to automate this.

setup script will install all dependencies and apply the Prisma migration to MySQL
run-app will run both the frontend and backend in one terminal

Paste the following scripts into the terminal:
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
Stop the servers with Ctrl^X

## Accessing the application

The frontend is avaliable at http://localhost:3040 and the backend is at http://localhost:8040. Remember that the server is prefixed with API.

I recommend accesing the server through the React frontend as it handles request bodies, JWT access/refresh token management and UI display on your behalf.

Congrats! You now have installed SchoolSpace and should be able to use it.

Refer to DEVELOPERS.md and CONFIGURATION.md for more information
