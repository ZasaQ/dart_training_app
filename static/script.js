const canvas = document.getElementById('dartboard');
const ctx = canvas.getContext('2d');
const cx = canvas.width / 2;
const cy = canvas.height / 2;

const radius = 200; // overall dartboard radius
const segments = 20; // 20 numbered segments

// Dartboard numbers in standard order
const numbers = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

// Colors
const colors = {
    black: '#000000',
    white: '#FFFFFF',
    red: '#D22B2B',
    green: '#008000',
    outerBull: '#00FF00',
    innerBull: '#FF0000',
};

function drawRingOutlines(startAngle, endAngle, radii) {
    ctx.strokeStyle = colors.black;
    ctx.lineWidth = 2;

    for (const r of radii) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.stroke();
    }
}

// Draw 20 segments with triple/double rings
function drawSegments() {
    const anglePerSegment = (2 * Math.PI) / segments;
    const offset = -Math.PI / 20; // TODO: better solution

    for (let i = 0; i < segments; i++) {
        const startAngle = i * anglePerSegment + offset;
        const endAngle = startAngle + anglePerSegment;

        const tripleInnerRadius = radius * 0.58;
        const tripleOuterRadius = radius * 0.65;

        const doubleInnerRadius = radius * 0.92;
        const doubleOuterRadius = radius;

        // Main segment from outer bull to triple inner
        ctx.fillStyle = i % 2 === 0 ? colors.white : colors.black;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, tripleInnerRadius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();

        // Triple ring slice
        ctx.fillStyle = i % 2 === 0 ? colors.green : colors.red;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, tripleOuterRadius, startAngle, endAngle);
        ctx.arc(cx, cy, tripleInnerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fill();

        // Main segment between triple outer and double inner
        ctx.fillStyle = i % 2 === 0 ? colors.white : colors.black;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, doubleInnerRadius, startAngle, endAngle);
        ctx.arc(cx, cy, tripleOuterRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fill();

        // Double ring slice (green/red swapped)
        ctx.fillStyle = i % 2 === 0 ? colors.green : colors.red;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, doubleOuterRadius, startAngle, endAngle);
        ctx.arc(cx, cy, doubleInnerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fill();

        drawRingOutlines(startAngle, endAngle, [
            tripleInnerRadius,
            tripleOuterRadius,
            doubleInnerRadius,
            doubleOuterRadius
        ]);
    }
}

// Inner bullseye (red)
function drawInnerBull() {
    ctx.beginPath();
    ctx.fillStyle = colors.innerBull;
    ctx.arc(cx, cy, radius * 0.04, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.04, 0, 2 * Math.PI);
    ctx.strokeStyle = colors.black;
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Outer bullseye (green)
function drawOuterBull() {
    // Outer ring (green)
    ctx.beginPath();
    ctx.fillStyle = colors.outerBull;
    ctx.arc(cx, cy, radius * 0.1, 0, 2 * Math.PI);
    ctx.arc(cx, cy, radius * 0.04, 0, 2 * Math.PI, true);
    ctx.closePath(); // Properly close the ring
    ctx.fill();

    // Outline for outer bull ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.1, 0, 2 * Math.PI);
    ctx.strokeStyle = colors.black;
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Draw thin black lines separating segments
function drawSegmentLines() {
    ctx.strokeStyle = colors.black;
    ctx.lineWidth = 2;
    const anglePerSegment = (2 * Math.PI) / segments;

    for (let i = 0; i < segments; i++) {
        const angle = i * anglePerSegment - Math.PI / 2 + anglePerSegment / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
        ctx.stroke();
    }
}

// Draw numbers around board
function drawNumbers() {
    const anglePerSegment = (2 * Math.PI) / segments;
    const textRadius = radius * 1.08;

    ctx.fillStyle = colors.black;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < segments; i++) {
        const angle = i * anglePerSegment + anglePerSegment / 2 - Math.PI / 20;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.translate(0, -textRadius);

        // If the angle points to the bottom half (between 90 and 270 degree), rotate the number
        if (angle > Math.PI / 2 && angle < (3 * Math.PI) / 2) {
            ctx.rotate(Math.PI / 30); // Rotate 90 degree clockwise, TODO: better solution
        }

        ctx.fillText(numbers[i], 0, 0);
        ctx.restore();
    }
}

function drawDartboard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.15, 0, 2 * Math.PI);
    ctx.clip(); // Dartboard clipped to circle only

    drawSegments();
    drawSegmentLines();
    drawOuterBull();
    drawInnerBull();
    drawNumbers();

    ctx.restore();
}

drawDartboard();