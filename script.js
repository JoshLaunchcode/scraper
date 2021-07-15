const { JSDOM } = require("jsdom");
const Fs = require('fs');
const Path = require('path');
const axios = require('axios');

const urlData = {
    furnitureUrls: [
        'https://nookipedia.com/wiki/Category:New_Horizons_clothing_icons',
        'https://nookipedia.com/wiki/Category:New_Horizons_accessory_icons',
        'https://nookipedia.com/wiki/Category:New_Horizons_bag_icons',
        'https://nookipedia.com/wiki/Category:New_Horizons_bottom_icons',
        'https://nookipedia.com/wiki/Category:New_Horizons_dress-up_icons',
        'https://nookipedia.com/wiki/Category:New_Horizons_headwear_icons',
        'https://nookipedia.com/wiki/Category:New_Horizons_shoe_icons',
        'https://nookipedia.com/wiki/Category:New_Horizons_sock_icons',
        'https://nookipedia.com/wiki/Category:New_Horizons_top_icons',
        'https://nookipedia.com/wiki/Category:New_Horizons_umbrella_icons'
    ],
    urlCategory: [
        'New_Horizons_clothing_icons',
        'New_Horizons_accessory_icons',
        'New_Horizons_bag_icons',
        'New_Horizons_bottom_icons',
        'New_Horizons_dress-up_icons',
        'New_Horizons_headwear_icons',
        'New_Horizons_shoe_icons',
        'New_Horizons_sock_icons',
        'New_Horizons_top_icons',
        'New_Horizons_umbrella_icons'
    ],
    normalCategoryName: [
        'clothing',
        'accessories',
        'bags',
        'bottoms',
        'dress-up',
        'headwear',
        'shoes',
        'socks',
        'tops',
        'umbrellas'
    ]
}

async function getForum(url, category, categoryName) {
    try {
        const response = await axios.get(url);
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
            const path = Path.resolve(__dirname, categoryName, images.name[j]);
            const writer = Fs.createWriteStream(path);

            const request = await axios({
                url,
                method: 'GET',
                responseType: 'stream'
            })

            request.data.pipe(writer);
        }

        if (images.name.length > 200) {
            getForum(`https://nookipedia.com/w/index.php?title=Category:${category}&filefrom=${images.name[199]}.png#mw-category-media`, category, categoryName);
        } else {
            return
        }
    } catch (error) {
        console.error(error);
    }
}

for (let u = 0; u < urlData.furnitureUrls.length; u++) {
    getForum(urlData.furnitureUrls[u], urlData.urlCategory[u], urlData.normalCategoryName[u]);
}