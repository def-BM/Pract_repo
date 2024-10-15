// Changing image
var images = ['src/i3.jpg', 'src/i5.jpg', 'src/i1.jpg', 'src/i4.jpg','src/h2.jpg'];
var currentIndex = 0;

function changeImage() {
    currentIndex = (currentIndex + 1) % images.length;
    document.querySelector('.image').style.backgroundImage = 'url(' + images[currentIndex] + ')';
}

// Change image every 5 seconds
setInterval(changeImage, 5000);

// Function to fetch and display venues
async function fetchVenues() {
    try {
        const response = await fetch('/venues');
        const venues = await response.json();

        const venueContainer = document.getElementById('venue-container');

        venues.forEach(venue => {
            const box = document.createElement('div');
            box.className = 'box';

            // Convert backslashes to forward slashes in the image path
            let imageUrl = venue.venueImage.replace(/\\/g, '/');

            // Use the correct image path
            imageUrl = `/${imageUrl}`;

            box.innerHTML = `
                <div class="box-image" style="background-image: url('${imageUrl}');">
                    <div class="rating">${'★'.repeat(venue.rating)}</div>
                </div>
                <h3>${venue.venueName}</h3>
                <div class="location">
                    <i class="fa-solid fa-location-dot"></i>
                    <p>${venue.venueLocation}</p>
                    <span class="food">${venue.catering ? 'Catering Services:' : 'No Catering Services'}</span>
                    ${venue.catering ? '<img src="src/veg.png" alt="veg-logo" class="veg"><img src="src/non-veg.png" alt="non-veg logo" class="non-veg">' : ''}
                    <i class="fa-solid fa-user-group"></i>
                    <p>${venue.venueCapacity}</p>
                </div>
            `;
            venueContainer.appendChild(box);
        });
    } catch (error) {
        console.error('Error fetching venues:', error);
    }
}

// Call the fetch function when the page loads
window.onload = fetchVenues;




