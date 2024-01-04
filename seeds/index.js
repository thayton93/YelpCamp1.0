const mongoose = require('mongoose');
const axios = require('axios');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = 'pk.eyJ1IjoidGhheXRvbiIsImEiOiJjbHFwOGxmdjgzdGhjMm9ta3RrdXNka3BhIn0.VhNVgA7v10N_s_rhyqKelg';
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => {
    console.log("Database connected");
})

const sample = function(array) {
    return array[Math.floor(Math.random() * array.length)];
};

// call unsplash and return small image
async function seedImg() {
    try {
        const resp = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
            client_id: '6P9WBpFM6TO5s4pDLh9o3tr01nWBNd1iia9TNVfUjFk',
            // collections: 1114848,
            collections: 483251,
        },
        })
        return resp.data.urls.small
    } catch (err) {
        console.error(err)
    }
}


const seedDB = async() => {
    //await Campground.deleteMany({});
    
    for(let i=0; i<45; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;

        const randLocation = `${cities[random1000].city}, ${cities[random1000].state}`;
        const geoData = await geocoder.forwardGeocode({
            query: randLocation,
            limit: 1
        }).send();


        const camp = new Campground({
            author: '65809cc20acd3cfa5968df85',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: randLocation,
            geometry: geoData.body.features[0].geometry,
            images: {url: await seedImg(), filename: 'randomSeed'},
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Saepe laudantium ex incidunt dolores, autem distinctio, similique fugiat eaque dolorum sapiente ea atque laborum culpa odit. Non ab quod est magnam?',
            price
        });
        await camp.save();
        console.log(camp.title);
    }

    
};

seedDB().then(() => {
    db.close();
});