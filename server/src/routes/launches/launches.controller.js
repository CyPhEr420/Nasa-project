const {
    getAllLaunches,
    scheduleNewLaunch,
    launchExists,
    abortLaunch,
} = require('../../models/launches.model');

const {
    getPagination
} = require('../../services/query');

async function httpgetAllLaunches(req, res) {
    const { skip, limit } = getPagination(req.query);
    return res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpaddNewLaunch(req, res) {
    const launch = req.body;
    if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
        return res.status(400).json({
            error: 'Missing required launch property'
        })
    }
    launch.launchDate = new Date(launch.launchDate);
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: 'Invalid launch date'
        })
    }
    await scheduleNewLaunch(launch);
    console.log(launch)
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    const launchId = Number(req.params.id);
    const launchExist = await launchExists(launchId);
    if (!launchExist) {
        return res.status(404).json({
            error: 'Launch not found'
        })
    }
    const abortedLaunch = await abortLaunch(launchId);

    if (!abortedLaunch) {
        return res.status(404).json({
            error: 'Launch not aborted'
        })
    }
    return res.status(200).json({
        ok: true
    });

}


module.exports = {
    httpgetAllLaunches,
    httpaddNewLaunch,
    httpAbortLaunch,
}