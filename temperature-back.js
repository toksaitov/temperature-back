const express =
    require('express');
const bodyParser =
    require('body-parser');
const Sequelize =
    require('sequelize');
const dotenv =
    require('dotenv').config();

let databaseHost =
    process.env['TEMPERATURE_DATABASE_HOST'];
let databasePort =
    process.env['TEMPERATURE_DATABASE_PORT'];
let databaseDialect =
    process.env['TEMPERATURE_DATABASE_DIALECT'];
let databaseName =
    process.env['TEMPERATURE_DATABASE_NAME'];
let databaseUser =
    process.env['TEMPERATURE_DATABASE_USER'];
let databasePassword =
    process.env['TEMPERATURE_DATABASE_PASSWORD'];

if (databaseHost == null) {
    databaseHost = 'temperature-data-db';

    console.warn(
        'The database host "TEMPERATURE_DATABASE_HOST" is not set in the ' +
        `".env" file. Assuming the database host is "${databaseHost}".`
    );
}

if (databasePort == null) {
    databasePort = '3306';

    console.warn(
        'The database port "TEMPERATURE_DATABASE_PORT" is not set in the ' +
        `".env" file. Assuming the database port is "${databasePort}".`
    );
}

if (databaseDialect == null) {
    databaseDialect = 'mysql';

    console.warn(
        'The database dialect "TEMPERATURE_DATABASE_DIALECT" is not set in the ' +
        `".env" file. Assuming the database dialect is "${databaseDialect}".`
    );
}

if (databaseName == null) {
    databaseName = 'temperature';

    console.warn(
        'The database name "TEMPERATURE_DATABASE_NAME" is not set in the ' +
        `".env" file. Assuming the name of the database is "${databaseName}".`
    );
}

if (databaseUser == null) {
    databaseUser = 'temperature_user';

    console.warn(
        'The database user "TEMPERATURE_DATABASE_USER" is not set in the ' +
        `".env" file. Assuming the name of the user is "${databaseUser}".`
    );
}

if (databasePassword == null) {
    databasePassword = '';

    console.warn(
        'The database password "TEMPERATURE_DATABASE_PASSWORD" is not set in the ' +
        '".env" file. Assuming this is an unsecured development or testing ' +
        'database without a password.'
    );
}

let serverPort = process.env['TEMPERATURE_SERVER_PORT'];
if (serverPort == null) {
    serverPort = '7373';

    console.warn(
        'The server port "TEMPERATURE_SERVER_PORT" is not set in the ' +
        `".env" file. Assuming the server port is "${serverPort}".`
    );
}

const database = new Sequelize(databaseName, databaseUser, databasePassword, {
    'host':    databaseHost,
    'port':    databasePort,
    'dialect': databaseDialect
});

const Measurement = database.define('measurement', {
    'temperature': {
        'type': Sequelize.FLOAT,
        'allowNull': false
    },
    'humidity': {
        'type': Sequelize.FLOAT,
        'allowNull': false
    }
});

const server = express();

server.use(bodyParser.urlencoded({ 'extended': true }));

server.post('/record', (request, response) => {
    let temperature =
        request.body['t'];
    let humidity =
        request.body['h'];

    if (temperature && humidity) {
        temperature =
            parseFloat(temperature);
        humidity =
            parseFloat(humidity);
    }

    console.log(
        `The temperature at ${new Date()} is ${temperature} ` +
        `and the humidity is ${humidity}.`
    );

    if (!(isNaN(temperature) || isNaN(humidity))) {
        Measurement.create({
            'temperature': temperature,
            'humidity': humidity
        }).catch(error => {
            console.error(`Failed to save measurements at ${new Date()}: `);
            console.error(error);
        });
    }
});

server.get('/measurements', (request, response) => {
    const limit =
        Math.min(Math.max(parseInt(request.query['limit'] || 1), 1), 1000);

    Measurement.findAll({
        'attributes': ['id', 'temperature', 'humidity', ['createdAt', 'time']],
        'limit': limit,
        'order': [
            ['createdAt', 'DESC']
        ],
        'raw' : true
    }).then(result => {
        response.format({
            'text': () => {
                response.send(
                    `${result.map(entry => Object.values(entry).join()).join('\n')}\n`
                );
            },
            'html': () => {
                response.send(
                    '<table>'   +
                        '<tr>'  +
                            '<th>ID</th>'          +
                            '<th>Temperature</th>' +
                            '<th>Humidity</th>'    +
                            '<th>Time</th>'        +
                        '</tr>' +
                        result.map(entry => {
                            const values = Object.values(entry);
                            return `<tr><td>${values.join('</td><td>')}</td></tr>`
                        }).join('') +
                    '</table>'
                );
            },
            'json': () => {
                response.json(result);
            }
        });
    }).catch(error => {
        console.error(`Failed to load measurements at ${new Date()}: `);
        console.error(error);

        response.status(500).end('Internal Server Error');
    });
});

server.post('/notify', (request, response) => {
    console.log(`Got a message from a device at ${new Date()}: `);
    console.log(request.body);
});

(function start() {
    database.sync().then(() => {
        server.listen(serverPort, () => {
            console.log(`The temperature server is listening on port ${serverPort}`);
        });
    }).catch(error => {
        if (error instanceof Sequelize.ConnectionError) {
            console.error('Waiting for the database to start...');

            const timeoutInMilliseconds = 5000;
            setTimeout(start, timeoutInMilliseconds);
        } else {
            console.error(`Failed to start at ${new Date()}: `);
            console.error(error);
        }
    });
})();

