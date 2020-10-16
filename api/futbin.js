const cheerio = require('cheerio')
const axios = require('axios')
const base = 'https://www.futbin.com'

const fetchMainResults = async (sbc) => {
    const response = await axios.get(sbc)
    const $ = cheerio.load(response.data)
    const results = []

    const $squad_url = $('body').find('.squad_url').slice(0, 20)
    $squad_url.each((i, elem) => { results.push(`${base}${$(elem).attr('href')}`) })

    return results;
}

const fetchSolutionHTML = solution => new Promise((resolve, reject) => {
    axios.get(solution)
        .then(res => resolve(res.data))
        .catch(err => reject(err))
})


const getAllPlayers = async (resultsPromise) => {
    return Promise.all(resultsPromise)
        .then(htmlSolutions => {
            const players = htmlSolutions.map(html => {
                const $ = cheerio.load(html)
                const players = []
                const $cards = $('body').find('.ut21')
                $cards.each((i, elem) => {
                    players.push($(elem).data())
                })
                return players
            });
            return players.flat()
        })
        .catch(err => console.log(err))
}

const checkAllOccurrences = players => {
    const occurrences = players.reduce((prev, curr) => {
        if (typeof prev[curr.playerId] != 'undefined') {
            prev[curr.playerId].count += 1
        } else {
            prev[curr.playerId] = curr
            prev[curr.playerId].count = 1
        }
        return prev
    }, {})
    return Object.values(occurrences)
}

const getMostUsedPlayers = async sbc => {
    const results = await fetchMainResults(sbc)
    const resultsPromise = results.map(solution => fetchSolutionHTML(solution))
    const players = await getAllPlayers(resultsPromise)
    const occurrences = checkAllOccurrences(players)
    const orderedByCounts = occurrences.sort((a, b) => b.count - a.count)

    return orderedByCounts
}

module.exports = {
    getMostUsedPlayers
}