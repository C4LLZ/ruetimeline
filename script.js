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

let lines = [];

window.addEventListener('load', function() {
    const items = document.querySelectorAll('.timeline-item');
    const timelineLine = document.getElementById('timeline-line');

    items.forEach(item => {
        let line = new LeaderLine(
            item.querySelector('.timeline-dot'),
            timelineLine,
            { color: 'white', size: 2, path: 'fluid', startSocket: 'auto', endSocket: 'auto' }
        );

        lines.push(line); // Store the line reference
    });
});

// Update lines on scroll
window.addEventListener('scroll', function() {
    lines.forEach(line => {
        line.position(); // Update line position
    });
});


updateConnectorLines();
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
}

// Add draw method to particle prototype
Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
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
    for (let i = 0; i < 100; i++) {
        let size = Math.random() * 5;
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

// Run the functions
init();
animate();
positionTimelineItems();

