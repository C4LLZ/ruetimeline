window.addEventListener('scroll', function() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const windowHeight = window.innerHeight;

    timelineItems.forEach(item => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const distanceFromCenter = Math.abs(viewportCenter - itemCenter);
        const focusZone = windowHeight * 0.2; // Adjust this value as needed

        let scale, blur;
        if (distanceFromCenter < focusZone) {
            // Item is within the focus zone
            scale = 1;
            blur = 0; // No blur
        } else {
            // Item is outside the focus zone
            const scaleDropOff = (distanceFromCenter - focusZone) / (windowHeight / 2 - focusZone);
            scale = Math.max(1 - scaleDropOff, 0.5);
            blur = Math.min(scaleDropOff * 10, 5); // Adjust blur intensity
        }

        // Apply transformations and blur
        item.style.transform = `scale(${scale})`;
        item.style.filter = `blur(${blur}px)`;
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const timelineItems = document.querySelectorAll('.timeline-item');
    updateConnectorLines();

    timelineItems.forEach(item => {
        // Randomize duration for a more natural effect
        const duration = Math.random() * 10 + 10; // Between 10 and 20 seconds

        item.style.animationDuration = `${duration}s`;
    });

});

function smoothScrollTo(element, duration) {
    const yOffset = -window.innerHeight / 2; // Half the screen height
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const firstTimelineItem = document.getElementById('FirstTimeLineItem');

    startButton.addEventListener('click', () => {
        smoothScrollTo(firstTimelineItem, 1000); // Scroll over 1000ms
    });
});


let lines = [];

function positionAndConnectLines() {
    // Clear existing lines to prevent duplicates
    lines.forEach(line => line.remove());
    lines = [];

    const timelineDots = document.querySelectorAll('#timeline-line .timeline-dot');
    const itemDots = document.querySelectorAll('.timeline-item .timeline-dot');

    timelineDots.forEach((timelineDot, index) => {
        const itemDot = itemDots[index];
        if (itemDot) {
            let line = new LeaderLine(
                timelineDot,
                itemDot,
                { color: 'white', size: 5, path: 'fluid', startSocket: 'bottom', endSocket: 'top', endPlug: 'behind' }
            );

            lines.push(line);
        }
    });
}

window.addEventListener('load', positionAndConnectLines);
window.addEventListener('resize', positionAndConnectLines);
window.addEventListener('scroll', () => {
    lines.forEach(line => line.position());
});

window.addEventListener('scroll', updateConnectorLines);

function positionTimelineItems() {
    const items = document.querySelectorAll('.timeline-item');
    let isLeftSide = true;
    let verticalPosition = 50; // Starting vertical position, adjust as needed

    items.forEach(item => {
        item.style.position = 'absolute';
        if (isLeftSide) {
            item.style.left = '10px'; // Adjust for left side margin
        } else {
            item.style.right = '10px'; // Adjust for right side margin
        }
        item.style.top = `${verticalPosition}px`;

        // Alternate sides and increase vertical position
        isLeftSide = !isLeftSide;
        verticalPosition += 500; // Adjust for spacing between items
    });
}

function updateConnectorLines() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineLine = document.getElementById('timeline-line');
    const timelineLineCenter = timelineLine.getBoundingClientRect().left + timelineLine.offsetWidth / 2;

    timelineItems.forEach(item => {
        const dot = item.querySelector('.timeline-dot');
        const connectorSVG = item.querySelector('.timeline-connector');
        const dotRect = dot.getBoundingClientRect();
        const startX = dotRect.left + dotRect.width / 2;
        const startY = dotRect.top + dotRect.height / 2;
        const endY = startY;

        // Clear previous paths
        connectorSVG.innerHTML = '';

        // Create the SVG path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M${startX},${startY} C${startX},${startY} ${timelineLineCenter},${endY} ${timelineLineCenter},${endY}`);
        path.setAttribute('stroke', 'white');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');

        connectorSVG.appendChild(path);
    });
}


function positionDots() {
    const items = document.querySelectorAll('.timeline-item');
    const dots = document.querySelectorAll('#timeline-line .timeline-dot');
    const timelineContainerTop = document.getElementById('timeline-container').getBoundingClientRect().top + window.scrollY;

    items.forEach((item, index) => {
        const dot = dots[index];
        const itemTopRelativeToContainer = item.getBoundingClientRect().top + window.scrollY - timelineContainerTop;
        dot.style.top = itemTopRelativeToContainer + 'px';
    });
}


window.addEventListener('load', positionDots);
window.addEventListener('resize', positionDots);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particleArray = [];

// Create constructor function for particles
function Particle(x, y, directionX, directionY, size, color) {
    this.x = x;
    this.y = y;
    this.directionX = directionX;
    this.directionY = directionY;
    this.size = size;
    this.color = color;
    this.bloom = Math.random() * 10 + 2; // Adjust the bloom intensity as needed
}

// Modify the draw method to apply the bloom effect
Particle.prototype.draw = function() {
    ctx.shadowBlur = this.bloom; // Set the shadow blur to the bloom value
    ctx.shadowColor = this.color; // Set the shadow color to the particle color
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.shadowBlur = 0; // Reset the shadow blur after drawing
};

// Add update method to particle prototype
Particle.prototype.update = function() {
    if (this.x + this.size > canvas.width || this.x - this.size < 0) {
        this.directionX = -this.directionX;
    }
    if (this.y + this.size > canvas.height || this.y - this.size < 0) {
        this.directionY = -this.directionY;
    }
    this.x += this.directionX;
    this.y += this.directionY;
    this.draw();
};

// Create particle array
function init() {
    particleArray = [];
    for (let i = 0; i < 200; i++) {
        let size = Math.random() * 7;
        let x = Math.random() * (innerWidth - size * 2);
        let y = Math.random() * (innerHeight - size * 2);
        let directionX = (Math.random() * .4) - .2;
        let directionY = (Math.random() * .4) - .2;
        let color = 'white';

        particleArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
    }
}

// Resize event
window.addEventListener('resize', () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    init();
});

document.addEventListener('scroll', function () {
    const parallaxBg = document.querySelector('.parallax-bg');
    const scrollValue = window.scrollY;

    // Adjust the background position based on scroll value to create the parallax effect
    parallaxBg.style.backgroundPositionY = -scrollValue * 0.1 + 'px';
});

// Run the functions
init();
animate();
positionTimelineItems();


const slider = document.querySelector('.slider');

function activate(e) {
  const items = document.querySelectorAll('.item');
  e.target.matches('.next') && slider.append(items[0])
  e.target.matches('.prev') && slider.prepend(items[items.length-1]);
}

document.addEventListener('click',activate,false);