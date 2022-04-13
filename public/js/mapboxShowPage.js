async function main() {
    const response = await fetch(`/campgrounds/${campgroundId}/data`)
    const campground = await response.json()

    const { coordinates } = campground.geometry

    mapboxgl.accessToken = mapboxToken

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: coordinates,
        zoom: 9
    })

    new mapboxgl.Marker()
        .setLngLat(coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 })
                .setHTML(
                    `<h5>${campground.title}</h5>`
                )
        )
        .addTo(map)
}

main()