var testData = {
    max: 8,
    data: [{ lat: 24.6408, lng: 46.7728, count: 1 }, { lat: 50.75, lng: -1.55, count: 1 }]
};

var cfg = {
    // radius should be small ONLY if scaleRadius is true (or small radius is intended)
    // if scaleRadius is false it will be the constant radius used in pixels
    "radius": 4,
    "maxOpacity": .6,
    // scales the radius based on map zoom
    "scaleRadius": true,
    // if set to false the heatmap uses the global maximum for colorization
    // if activated: uses the data maximum within the current map boundaries
    //   (there will always be a red spot with useLocalExtremas true)
    "useLocalExtrema": true,
    // which field name in your data represents the latitude - default "lat"
    latField: 'lat',
    // which field name in your data represents the longitude - default "lng"
    lngField: 'lng',
    // which field name in your data represents the data value - default "value"
    valueField: 'count'
};


var heatmapLayer = new HeatmapOverlay(cfg);

// var map = new L.Map('map-canvas', {
//     center: new L.LatLng(25.6586, -80.3568),
//     zoom: 4,
// });

heatmapLayer.setData(testData);

var map = L.map('map', { 
    zoomControl: false,
    layers: [heatmapLayer]
}).setView([0, 0], 3);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map)

$.ajax({
    url: "https://tributary.svvc.dev/api/downstream/reel", success: (res) => {
        console.log(res)
        let realData = {
            max: 8,
            data: []
        }
        res.map((article) => {
            var el = `
            <a class="article" href="` + article.url + `" target="_blank">
                <h2>` + article.title + `</h2>
                <h3>` + article.source + `</h3>
                <p>` + article.description + `</p>
            </a>
        `
            $(".feed").append(el)
            updateData(realData, article)
        })
        heatmapLayer.setData(realData);
        console.log(realData)
    }
});

const updateData = (realData, entry) => {
    found = false
    if(entry.lat == 2 && entry.long == 3) {
        found = true
    }
    if(!found) {
        realData.data.forEach(element => {
            if(element.lat == entry.lat && element.lng == entry.long) {
                element.count += 1
                found = true
                return
    
            }
        });
    }
    if(!found) {
        realData.data.push({lat: Math.round(entry.lat), lng: Math.round(entry.long), count: 1})
    }
}

map.on('click', function(e) {
    console.log(e.latlng.lat,e.latlng.lng);
    $(".feed").empty();
    $.ajax({
        url: "https://tributary.svvc.dev/api/downstream/reel", success: (res) => {
            console.log(res)
            res.map((article) => {
                var el = `
                <a class="article" href="` + article.url + `" target="_blank">
                    <h2>` + article.title + `</h2>
                    <h3>` + article.source + `</h3>
                    <p>` + article.description + `</p>
                </a>
            `
                if(inRangeOfClick(e.latlng, article.lat, article.long)) {
                    $(".feed").append(el)
                } 
            })
        }
    });
})

const inRangeOfClick = (clickPos, lat, long) => {
    radius  = 5

    sLa = clickPos.lat
    sLn = clickPos.lng
    
    sLaMin = sLa - 5
    sLaMax = sLa + 5
    sLnMin = sLn - 5
    sLnMax = sLn + 5

    return (lat >= sLaMin && lat <= sLaMax && long >=sLnMin && long <= sLnMax)
}