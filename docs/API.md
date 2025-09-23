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

#### Auth

| Method | Endpoint | Params | Body | Response |
|  :------- |  :------- | :------- | :------- | :------- |
| POST  | login  | None | { email, password }  | {id, token, role}  |
| POST  | signup  | None | { email, password, role }  | { message: "User created. Please verify email." } |
| GET  | verify  | ?token=xyz  | None | { message: "Email verified." } |

#### Users

| Method | Endpoint | Params | Body | Response |
|  :------- |  :------- | :------- | :------- | :------- |
| PUT  | login  | None | { email, password }  | {id, token, role}  |
| PUT  | signup  | None | { email, password, role }  | { message: "User created. Please verify email." } |
| DELETE  | verify  | ?token=xyz  | None | { message: "Email verified." } |
| GET  | verify  | ?token=xyz  | None | { message: "Email verified." } |
| GET  | verify  | ?token=xyz  | None | { message: "Email verified." } |
| GET  | verify  | ?token=xyz  | None | { message: "Email verified." } |

#### Courses

| Method | Endpoint | Params | Body | Response |
|  :------- |  :------- |   :------- | :------- | :------- |
| POST  | login  | None | { email, password }  | {id, token, role}  |
| POST  | signup  | None | { email, password, role }  | { message: "User created. Please verify email." } |
| GET  | verify  | ?token=xyz  | None | { message: "Email verified." } |
| GET  | verify  | ?token=xyz  | None | { message: "Email verified." } |
| GET  | verify  | ?token=xyz  | None | { message: "Email verified." } |
| GET  | verify  | ?token=xyz  | None | { message: "Email verified." } |
| GET  | verify  | ?token=xyz  | None | { message: "Email verified." } |

#### Enroll-Course

| Method | Endpoint | Params | Body | Response |
|  :------- |  :------- |   :------- | :------- | :------- |
| POST  | login  | None | { email, password }  | {id, token, role}  |
| POST  | signup  | None | { email, password, role }  | { message: "User created. Please verify email." } |

#### Assignments

#### Submissions

#### Grades

#### Discussion

#### Responses

#### Annoucements

#### Contents
