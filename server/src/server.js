
const http = require('http');
require('dotenv').config();
const { mongoConnect } = require('./services/mongo');
const { loadLaunchData } = require('./models/launches.model');

const PORT = 8000;


const { loadPlanetsData } = require('./models/planets.model');

const app = require('./app')


const server = http.createServer(app);



async function startServer() {
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchData();
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
}

startServer();