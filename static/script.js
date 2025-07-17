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

// ================== Scoring logic ==================

function getDartboardSegmentsInfo() {
    const info = [];
    const anglePerSegment = (2 * Math.PI) / segments;
    const offset = -Math.PI / 2 + anglePerSegment / 2 - Math.PI / 10; // TODO: look for better solution

    for (let i = 0; i < segments; i++) {
        const startAngle = i * anglePerSegment + offset;
        const endAngle = startAngle + anglePerSegment;

        info.push({
            number: numbers[i],
            angles: { start: startAngle, end: endAngle },
            rings: {
                innerBull: { innerRadius: 0, outerRadius: radius * 0.05 },
                outerBull: { innerRadius: radius * 0.05, outerRadius: radius * 0.1 },
                singleInner: { innerRadius: radius * 0.1, outerRadius: radius * 0.58 },
                triple: { innerRadius: radius * 0.58, outerRadius: radius * 0.65 },
                singleOuter: { innerRadius: radius * 0.65, outerRadius: radius * 0.92 },
                double: { innerRadius: radius * 0.92, outerRadius: radius },
            },
        });
    }

    return info;
}

// Normalize angle to [0, 2PI)
function normalizeAngle(angle) {
    while (angle < 0) angle += 2 * Math.PI;
    while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;

    return angle;
}

// Find which ring was hit based on radius
function getRing(r) {
    if (r <= radius * 0.04) return { ring: "Inner Bull", multiplier: 50 };
    if (r > radius * 0.04 && r <= radius * 0.1)
        return { ring: "Outer Bull", multiplier: 25 };
    if (r > radius * 0.1 && r <= radius * 0.58)
        return { ring: "Single (Inner)", multiplier: 1 };
    if (r > radius * 0.58 && r <= radius * 0.65) return { ring: "Triple", multiplier: 3 };
    if (r > radius * 0.65 && r <= radius * 0.92)
        return { ring: "Single (Outer)", multiplier: 1 };
    if (r > radius * 0.92 && r <= radius) return { ring: "Double", multiplier: 2 };

    return null; // outside dartboard
}

// Find which segment based on angle
function getSegment(angle) {
    const segmentsInfo = getDartboardSegmentsInfo();
    angle = normalizeAngle(angle);

    for (const seg of segmentsInfo) {
        const start = normalizeAngle(seg.angles.start);
        const end = normalizeAngle(seg.angles.end);

        // Because angles wrap around 2PI, check carefully:
        if (start < end) {
            if (angle >= start && angle < end) return seg;
        } else {
            // segment crosses 0 radians
            if (angle >= start || angle < end) return seg;
        }
    }

    return null;
}

// Main function to get hit info from mouse coordinates
function getHitInfo(x, y) {
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const ringInfo = getRing(r);
    if (!ringInfo) return "Missed the board";

    if (ringInfo.ring === "Inner Bull" || ringInfo.ring === "Outer Bull") {
        return `${ringInfo.ring} - Score: ${ringInfo.multiplier}`;
    }

    const segment = getSegment(angle);
    if (!segment) return "Missed the board";

    return `Number: ${segment.number} - ${ringInfo.ring} - Score: ${
        segment.number * ringInfo.multiplier
    }`;
}

let hits = [];
let totalScore = 0;

function drawHits() {
    for (let i = 0; i < hits.length; i++) {
        const hit = hits[i];
        ctx.beginPath();
        ctx.arc(hit.x, hit.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 255, 0, 1)";
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 180, 1)";
        ctx.stroke();

        ctx.fillStyle = "yellow";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(i + 1, hit.x, hit.y - 10);
    }
}

function simulateSingleThrow() {
    const angle = Math.random() * 2 * Math.PI;
    const dist = Math.random() * radius;
    const x = cx + dist * Math.cos(angle);
    const y = cy + dist * Math.sin(angle);

    const info = getHitInfo(x, y);

    hits.push({ x, y });

    const scoreMatch = info.match(/Score: (\d+)/);
    if (scoreMatch) {
        totalScore += parseInt(scoreMatch[1]);
    }

    // Redraw board and hits
    drawDartboard();
    drawHits();

    const infoBox = document.getElementById("hitInfo");
    const showTotalScoreCheck = document.getElementById("showTotalScoreCheck");
    infoBox.innerHTML += `<br>Throw ${hits.length}: ${info}`;

    if (showTotalScoreCheck.checked) {
        infoBox.innerHTML += `<br><strong>Total Score: ${totalScore}</strong>`;
    }

    if (hits.length === 3) {
        document.getElementById("submitScoreButton").disabled = false;
    }
}

let simulateThrowsInterval = null;

function simulateThrows() {
    if (simulateThrowsInterval !== null) {
        clearInterval(simulateThrowsInterval);
        simulateThrowsInterval = null;
    }

    hits = [];
    totalScore = 0;
    drawDartboard();
    canvas.removeEventListener("click", manualThrow);
    document.getElementById("hitInfo").textContent = "Hit:";
    document.getElementById("resetThrowsButton").disabled = true;
    document.getElementById("submitScoreButton").disabled = true;

    let i = 0;
    simulateThrowsInterval = setInterval(() => {
        simulateSingleThrow();
        i++;
        if (i >= 3) {
            clearInterval(simulateThrowsInterval);
            simulateThrowsInterval = null;
            document.getElementById("resetThrowsButton").disabled = false;
            canvas.addEventListener("click", manualThrow);
        }
    }, 1000);
}

function manualThrow() {
    if (hits.length >= 3) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    hits.push({ x, y });

    drawDartboard();
    drawHits();

    const info = getHitInfo(x, y);
    document.getElementById("hitInfo").innerHTML += `<br>Throw ${hits.length}: ${info}`;

    const scoreMatch = info.match(/Score: (\d+)/);
    if (scoreMatch) {
        totalScore += parseInt(scoreMatch[1]);
    }

    const showTotalScoreCheck = document.getElementById("showTotalScoreCheck")
    if (showTotalScoreCheck.checked) {
        infoBox.innerHTML += `<br><strong>Total Score: ${totalScore}</strong>`;
    }

    if (hits.length === 3) {
        document.getElementById("submitScoreButton").disabled = false;
    }

    document.getElementById("resetThrowsButton").disabled = false;
}

// Manual throw by clicking
canvas.addEventListener("click", manualThrow);

document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('scoreInput');
  const wrapper = document.getElementById('inputScoreWrapper');

  input.addEventListener('input', () => {
    let value = input.value;

    // Remove non-digit characters
    value = value.replace(/[^0-9]/g, '');

    // Limit to 180, max
    if (value !== '' && Number(value) > 180) {
      value = '180';
    }

    input.value = value;

    // Show or hide button
    if (value !== '') {
      wrapper.classList.add('show-button');
    } else {
      wrapper.classList.remove('show-button');
    }
  });
});

function checkScore() {
  if (hits.length !== 3) return;

  const input = document.getElementById('scoreInput');
  const value = Number(input.value);

  if (isNaN(value) || value < 0 || value > 180) {
    alert("Please enter a valid number between 0 and 180.");
    return;
  }

  if (value === totalScore) {
    alert("Correct!");
  } else {
    alert("Incorrect, try again.");
  }
}

function resetGame() {
    hits = [];
    totalScore = 0;
    drawDartboard();
    document.getElementById("hitInfo").textContent = "Hit:";
    document.getElementById('scoreInput').value = "";
    document.getElementById("resetThrowsButton").disabled = true;
    document.getElementById("submitScoreButton").disabled = true;
}