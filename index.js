const express = require('express');

const server = express();
const port = 7373;

server.get('/hello', (request, response) => {
    response.send('Hi!\n');
});

server.listen(port, () => {
    console.log(`The server is listening on port ${port}`);
});

