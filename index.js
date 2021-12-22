const axios = require('axios')
const http = require('http')
const url = require('url')
const fs = require('fs')

const pokePromise = []

//Se obtiene data (nombre y url)
const getPokeData = async () => {
    const { data } = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=150')
    return data.results
}

//Se obtiene data donde esta ubicada la url de la foto
const getPokeSprite = async (name) => {
    const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon-form/${name}`)
    return data
}

http.createServer((req, res) => {

    getPokeData().then(results => {
        results.forEach(data => {
            const pokeName = data.name
            pokePromise.push(getPokeSprite(pokeName))
        });

        Promise.all(pokePromise).then((data) => {

            const pokeArray = data.map(p => {
                return { nombre: p.name, img: p.sprites.front_default }
            })

            url.parse(req.url, true).query

            //Escribe JSON en 'localhost:3000/pokemones'
            if (req.url == ('/pokemones')) {
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(pokeArray))
            }

            //Muestra las fotos y nombres de los pokemones
            if (req.url == '/') {
                fs.readFile('index.html', 'utf8', (err, pokemons) => {
                    res.end(pokemons)
                })
            }
        })
    }).catch((err) => {
        console.log(err)
    });
}).listen(3000, () => console.log('Servidor ON'))