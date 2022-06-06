const axios = require('axios');

const launches = require('./launches.mongo')
const planets = require('./planets.mongo')

const DEFAULT_FLIGHT_NUMBER = 100;


async function saveLaunch(launch) {
    await launches.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    })

}



const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches() {
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });
    if (response.status !== 200) {
        console.log('Problem downloading launch data: ' + response.status);
        throw new Error('Launch data download failed')

    }
    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.reduce((acc, payload) => {
            return acc.concat(payload.customers)
        }, [])

        const launch = {
            flightNumber: launchDoc.flight_number,
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers: customers,
        }
        await saveLaunch(launch);
        // console.log(`Downloaded ${launchDocs.length} launch documents`)

    }
}

async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    })
    if (firstLaunch) {
        console.log('Launch data already loaded...');
        return
    } else {
        console.log('Downloading launch data...')

        await populateLaunches()
    }

};

async function findLaunch(filter) {
    return await launches.findOne(
        filter
    )
}


async function launchExists(launchId) {
    return await findLaunch({
        flightNumber: launchId,
    })
}

async function getLatestFlightNumber() {
    const latestLaunch = await launches
        .findOne()
        .sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER
    }

    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
    return await launches.find({}, {
        '__v': 0,
        '_id': 0,
    }).sort({ flightNumber: 1 })
        .skip(skip).limit(limit);
}


async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        kepler_name: launch.target,
    });
    if (!planet) {
        throw new Error('No Matching planet found')
    }
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['NASA', 'Tesla', 'SpaceX',],
        flightNumber: newFlightNumber
    })
    await saveLaunch(newLaunch)

}

async function abortLaunch(launchId) {
    const aborted = await launches.updateOne({
        flightNumber: launchId
    }, {
        success: false,
        upcoming: false,
    })
    return aborted.modifiedCount === 1
}



module.exports = {
    loadLaunchData,
    getAllLaunches,
    scheduleNewLaunch,
    launchExists,
    abortLaunch,
}