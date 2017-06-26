temperature-back
================

_temperature-back_ is a simple server to track temperature.

## Requirements

* Node.js, npm `>= 7.10.0`, `>= 4.2.0`
* MySQL `>= 5.7.18`

## Usage

Create an `.env` file with secrets and parameters for all the components.

```bash
# Database
TEMPERATURE_DATABASE_HOST=the location of the database server (temperature-data-db by default)
TEMPERATURE_DATABASE_PORT=the database port (3306 by default)
TEMPERATURE_DATABASE_DIALECT=the dialect of the database management engine (mysql by default)
TEMPERATURE_DATABASE_NAME=the name of the database (temperature by default)
TEMPERATURE_DATABASE_USER=the user of the database with write permissions (temperature_user by default)
TEMPERATURE_DATABASE_PASSWORD=his pasword (empty by default)

# Server
TEMPERATURE_SERVER_PORT=the port to use by the server (7373 by default)
```

Create the database and the database user with the password specified in the
previous step in the `.env` file (you can use MySQL Workbench, other management
tools, or issue SQL queries manually from the `mysql` command).

Install dependencies, ensure the database system is running, and start the
server.

```bash
npm install # to install dependencies
npm start   # to start the server
```

You can also use a local testing database stored in the `development` directory.

Ensure that MySQL was installed, and the `mysqld` binary is in the `PATH`
environment variable.

```bash
cd development
./bootstrap # create the database, install dependencies (run the script only once)
./start     # start MySQL with the local database and the temperature server
```

## Interconnection

Ensure that the following host can be resolved into an IP address of the actual
services on your setup

* *temperature-data-db*: resolve to an instance of a MySQL database with all the
  measurements

There are many approaches that you can use for name resolution. You can add
entries to `/etc/hosts` manually, setup a DNS server or utilize Docker Networks
to manage `/etc/hosts` files across containers automatically.

## Containerization

* `docker-compose up`: to start the service

* `docker-compose up -d`: to start the service in the background

* `docker-compose down`: to stop the service

* `docker-compose -f docker-compose.yml -f docker-compose.development.yml`: to
  mount the project directory on the host machine under a project directory
  inside the container to allow instant source changes throughout development
  without rebuilds

## Docker Hub

[toksaitov/temperature-back](https://hub.docker.com/r/toksaitov/temperature-back)

## Credits

*temperature-back* was created by [Dmitrii Toksaitov](https://github.com/toksaitov).

