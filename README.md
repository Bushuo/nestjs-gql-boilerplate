### NestJS GQL Boilerplate

powered by [NestJs](http://nestjs.com/)

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="200" alt="Nest Logo" /></a>
</p>

## Description

a simple authentication server

## Instuctions

this server uses redis to store session data  
this server uses a database (default postgresql)  
make sure to provide your own .env file for the secrets configuration

## Installation

```bash
yarn install
```

## Running the app

```bash
# development
yarn start

# watch mode
yarn start:dev

# production mode
yarn start:prod
```

## Test

no testcases provided as of now (will maybe add later)

```bash
# unit tests
yarn test

# e2e tests
yarn test:e2e

# test coverage
yarn test:cov
```
