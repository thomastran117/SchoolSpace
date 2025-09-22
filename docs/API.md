# API Reference

This document describes how to interact with the **School App API**.  

## Accessing the API

There are two ways to access the SchoolSpace API, locally or through production

Currently, at this time, to access the production API, you would need to ensure that an Auth Bearer
token is provided before requesting resources to the server.

At this current time, you do not need to provide an API Key, however, this may change later.

Alternatively, you may use a local version of the API provided that you clone and the repo and fill the database with your own data.

## Usages

All endpoints are prefixed with api

Auth
| Method | Endpoint | Body | Response |
| ------------- | ------------- | | ------------- | | ------------- |
| POST  | login  | email, password  | token  |
| POST  | signup  | email, password, role  | None |
| POST  | verify  | token  | None |