// Changing image
var images = ['src/i3.jpg', 'src/i8.jpg', 'src/i5.jpg', 'src/i7.jpg', 'src/i6.jpg', 'src/i4.jpg'];
var currentIndex = 0;

function changeImage() {
    currentIndex = (currentIndex + 1) % images.length;
    document.querySelector('.image').style.backgroundImage = 'url(' + images[currentIndex] + ')';
}

// Change image every 5 seconds
setInterval(changeImage, 5000);

// Open new page by clicking image in box
document.addEventListener("DOMContentLoaded", function () {

    // Select all elements with the class 'box'
    const boxes = document.querySelectorAll('.box');

    // Loop through each box
    boxes.forEach((box, index) => {
        // Add a click event listener to each box
        box.addEventListener('click', function () {
            // Navigate to the corresponding page based on the index
            switch (index) {
                case 0:
                    window.location.href = 'detail.html';
                    break;
                case 1:
                    window.location.href = 'detail.html';
                    break;
                case 2:
                    window.location.href = 'detail.html';
                    break;
                case 3:
                    window.location.href = 'detail.html';
                    break;
                case 4:
                    window.location.href = 'detail.html';
                    break;
                case 5:
                    window.location.href = 'detail.html';
                    break;
                case 6:
                    window.location.href = 'detail.html';
                    break;
                case 7:
                    window.location.href = 'detail.html';
                    break;
                case 8:
                    window.location.href = 'detail.html';
                    break;
                default:
                    break;
            }
        });
    });
});
