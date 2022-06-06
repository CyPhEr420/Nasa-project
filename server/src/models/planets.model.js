
const { parse } = require('csv-parse');
const path = require('path');
const fs = require('fs');

const planets = require('./planets.mongo');



function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6;
}


function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true,
            }))
            .on('data', async (data) => {
                if (isHabitablePlanet(data)) {
                    savePlanets(data)
                }
            })
            .on('error', (err) => {
                reject(err)
            })
            .on('end', () => {
                resolve();
            });
    });
}

async function savePlanets(planet) {
    try {
        await planets.updateOne({
            kepler_name: planet.kepler_name,
        }, {
            kepler_name: planet.kepler_name
        },
            {
                upsert: true,
            }
        )
    } catch (err) {
        console.log(`Could save planets ${err}`)
    }


}

async function getAllPlanets() {
    return await planets.find({}, {
        '__v': 0, '_id': 0,
    })
}


module.exports = {
    loadPlanetsData,
    getAllPlanets,
}