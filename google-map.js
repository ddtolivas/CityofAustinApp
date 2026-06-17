const GOOGLE_MAPS_API_KEY = '';
const AUSTIN_CENTER = { lat: 30.2672, lng: -97.7431 };

const mapBusinesses = [
    { name: 'Taco Paradise', category: 'Food', rating: 4.5, lat: 30.2672, lng: -97.7431, description: 'Authentic Mexican tacos with fresh ingredients' },
    { name: 'Artisan Coffee Co.', category: 'Food', rating: 4.8, lat: 30.2682, lng: -97.7441, description: 'Locally roasted coffee and cozy atmosphere' },
    { name: 'Local Bookstore', category: 'Retail', rating: 4.2, lat: 30.2662, lng: -97.7421, description: 'Independent bookstore with curated selection' },
    { name: 'Community Garden', category: 'Attractions', rating: 4.7, lat: 30.2692, lng: -97.7451, description: 'Beautiful community garden and outdoor space' },
    { name: 'Boutique Style', category: 'Retail', rating: 4.3, lat: 30.2652, lng: -97.7461, description: 'Fashion boutique with unique clothing and accessories' },
    { name: 'Food Truck Fiesta', category: 'Food', rating: 4.6, lat: 30.2702, lng: -97.7411, description: 'Authentic Mexican street food from a local food truck' }
];

document.addEventListener('DOMContentLoaded', initializeGoogleMap);

function initializeGoogleMap() {
    if (!window.location.pathname.includes('map.html')) return;

    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    mapElement.innerHTML = '<div class="map-loading">Loading Google map...</div>';

    getMapCenter().then(center => {
        const apiKey = getGoogleMapsApiKey();
        if (apiKey) {
            loadGoogleMapsScript(apiKey)
                .then(() => renderInteractiveGoogleMap(center))
                .catch(() => renderGoogleMapsEmbed(center));
        } else {
            renderGoogleMapsEmbed(center);
        }
    });
}

function getGoogleMapsApiKey() {
    return GOOGLE_MAPS_API_KEY.trim() || localStorage.getItem('googleMapsApiKey') || '';
}

function getMapCenter() {
    return new Promise(resolve => {
        if (!navigator.geolocation) {
            resolve(AUSTIN_CENTER);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
            () => resolve(AUSTIN_CENTER),
            { timeout: 5000, maximumAge: 300000 }
        );
    });
}

function loadGoogleMapsScript(apiKey) {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve();
            return;
        }

        window.localLensGoogleMapsReady = resolve;

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=localLensGoogleMapsReady`;
        script.async = true;
        script.defer = true;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function renderInteractiveGoogleMap(center) {
    const mapElement = document.getElementById('map');
    const googleMap = new google.maps.Map(mapElement, {
        center,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
    });

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(center);

    new google.maps.Marker({
        position: center,
        map: googleMap,
        title: 'Your location',
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });

    const infoWindow = new google.maps.InfoWindow();

    mapBusinesses.forEach(business => {
        const position = { lat: business.lat, lng: business.lng };
        const marker = new google.maps.Marker({ position, map: googleMap, title: business.name });

        marker.addListener('click', () => {
            infoWindow.setContent(`
                <div class="map-info-window">
