const { JSDOM } = require("jsdom");
const Fs = require('fs');
const Path = require('path');
const axios = require('axios');

const furnitureUrls = ['https://nookipedia.com/w/index.php?title=Category:New_Horizons_furniture_icons&fileuntil=Baby+Chair+%28Pink+-+Strawberry%29+NH+Icon.png#mw-category-media',
    // 'https://nookipedia.com/wiki/Category:New_Horizons_bug_furniture_icons',
    // 'https://nookipedia.com/wiki/Category:New_Horizons_fish_tank_icons',
    // 'https://nookipedia.com/wiki/Category:New_Horizons_poster_icons',
    // 'https://nookipedia.com/wiki/Category:New_Horizons_sea_creature_furniture_icons',
    // 'https://nookipedia.com/wiki/Category:New_Horizons_villager_photo_icons'
]

async function getForum(url) {
    for (let i = 0; i < url.length; i++) {
        try {
            const response = await axios.get(url[i]);
            const { document } = new JSDOM(
                response.data
            ).window

            let images = {
                src: [],
                name: []
            }

            let addToObject = function (list, object) {
                for (let k = 0; k < list.length; k++) {
                    object.src.push(list[k].src);
                    object.name.push(list[k].alt);
                }
            }

            addToObject(document.querySelectorAll("img"), images);

            for (let j = 0; j < images.src.length; j++) {
                if (images.name[j] === "Attribution-ShareAlike 3.0 Unported") {
                    break;
                }

                if (images.name[j].includes('?')) {
                    images.name[j] = images.name[j].replace('?', 'QM');
                }

                const url = images.src[j];
                const path = Path.resolve(__dirname, 'furniture', images.name[j]);
                const writer = Fs.createWriteStream(path);

                const request = await axios({
                    url,
                    method: 'GET',
                    responseType: 'stream'
                })

                request.data.pipe(writer);
            }

            if (images.name.length > 200) {
                getForum([`https://nookipedia.com/w/index.php?title=Category:New_Horizons_furniture_icons&filefrom=${images.name[199]}.png#mw-category-media`]);
            } else {
                break;
            }

        } catch (error) {
            console.error(error);
        }
    }

}

// for(let u = 0; u<furnitureUrls.length) {
getForum(furnitureUrls);
// }

