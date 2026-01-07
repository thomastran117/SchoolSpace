# Setup

This setup document will show how to get SchoolSpace running on your local machine for further development or local demos. This documentation will show the minimal setup needed to run the project with or without Docker.

## Requirements

There are two ways to run the project currently. The recommended approach is Docker as its minimal, works regardless of what environment (OS, Node version etc) that you may have, and more importantly, creates a RabbitMQ and Redis container without local installation. You may use your own local Node, RabbitMQ and Redis if you wish, but setup of RabbitMQ and Redis is tedious if you do not have already installed.

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
- [Redis](https://redis.io/downloads/)
- [RabbitMQ](https://www.rabbitmq.com/tutorials)

[Installing Redis on Windows](https://redis.io/docs/latest/operate/oss_and_stack/install/archive/install-redis/install-redis-on-windows/)  
[Installing RabbitMQ on Windows](https://www.rabbitmq.com/docs/download)

Alternatively, you can use a cloud instance of Redis, RabbitMQ and Mongo - however it is a lot for this project

Verify your local environment is working with:

```bash
  node --version
  redis-cli ping
  sudo rabbitmq-diagnostics ping
```

Once verification of the tools are successful, then you are ready to install and run SchoolSpace

## Before installation

### 1. Clone the project

Clone SchoolSpace using Git.

```bash
  git clone https://github.com/thomastran117/SchoolSpace.git
```

### Setup .env

These two scripts will scaffold the exact template needed for both frontend, backend and workers, with defaults configured for local development.


## Running with Docker (recommended)

Start Docker with the following command at the root directory:

```bash
  ../app docker
```

## Running locally

To run the app locally, we will need to install dependencies and then apply migrations before the app can boot up succesfully. Two shell scripts are provided to automate this.

setup script will install all dependencies
run-app will run both the frontend and backend in one terminal

Paste the following scripts into the terminal:
```bash
  ./app setup
  ./app local
```
Stop the servers with Ctrl^C

## Accessing the application

The frontend is avaliable at http://localhost:4090 and the backend is at http://localhost:9090. Remember that the server is prefixed with API.

I recommend accesing the server through the React frontend as it handles request bodies, JWT access/refresh token management and UI display on your behalf.

Congrats! You now have installed SchoolSpace and should be able to use it.

Refer to [DEVELOPERS.md](\DEVELOPERS.md)and [CONFIGURATION.md](\CONFIGURATION.md) for more information
