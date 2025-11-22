// js/script.js
const circle = document.getElementById('green-circle');
const anim = document.getElementById('anim');
const work = document.getElementById('work');
const block5 = document.querySelector('.block5');
const originalContent = document.getElementById('original-content');
const messages = document.getElementById('messages');
const resultsOutput = document.getElementById('results-output');

const playBtn = document.getElementById('play-btn');
const closeBtn = document.getElementById('close-btn');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const reloadBtn = document.getElementById('reload-btn');

let animationInterval;
let eventCounter = 0;
let isMoving = false;
let currentPos = { x: 0, y: 0 };

let segmentLength = 0; 
let segmentProgress = 0; 
let direction = 0; 
const stepSize = 1; 
const localStorageKey = 'animationEvents11';

let currentRadius = 15; 
let currentSize = 30;   
let batchedEvents = []; 

// --- Функції логування та LocalStorage ---
function logEvent(message) {
    const localTime = new Date().toISOString();
    eventCounter++;
    const eventData = {
        id: eventCounter,
        time: localTime, 
        message: message,
        size: currentSize
    };

    // 1. Спосіб 1: Негайне відправлення
    sendToServer('immediate', eventData);

    // 2. Спосіб 2: Акумуляція
    batchedEvents.push(eventData); 
    localStorage.setItem(localStorageKey, JSON.stringify(batchedEvents));

    messages.textContent = `Подія ${eventCounter}: ${message}`;
    console.log(`Event ${eventCounter}: ${message}. Local Time: ${localTime}`);
}

async function sendToServer(type, data = null) {
    let serverUrl;
    let payload;
    
    if (type === 'immediate') {
        serverUrl = 'save_event.php'; 
        payload = JSON.stringify(data);
    } else if (type === 'final' && data) {
        serverUrl = 'save_batch.php'; 
        payload = JSON.stringify(data);
    } else {
        return;
    }

    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        });
        return await response.json();
    } catch (error) {
        console.error(`Error sending data to ${serverUrl}:`, error);
    }
}

// --- Функції анімації ---

function setInitialPosition() {
    if (!anim) return;
    
    currentRadius = 15;
    currentSize = 30;
    circle.style.width = `${currentSize}px`;
    circle.style.height = `${currentSize}px`;

    const animRect = anim.getBoundingClientRect();
    const centerX = animRect.width / 2 - currentRadius;
    const centerY = animRect.height / 2 - currentRadius;
    
    currentPos = { x: centerX, y: centerY }; 
    segmentLength = 1; 
    segmentProgress = 0; 
    direction = 0; 
    
    circle.style.left = `${currentPos.x}px`;
    circle.style.top = `${currentPos.y}px`;
}

function startAnimation() {
    if (isMoving) return;
    
    isMoving = true;
    startBtn.style.display = 'none'; 
    stopBtn.style.display = 'inline-block'; 
    reloadBtn.style.display = 'none';
    
    logEvent('Circle started movement (Start)'); 
    
    animationInterval = setInterval(moveCircle, 20); 
}

function stopAnimation() {
    if (!isMoving) return;
    
    isMoving = false;
    clearInterval(animationInterval);
    stopBtn.style.display = 'none'; 
    startBtn.style.display = 'inline-block'; 
    
    logEvent('Circle stopped by "Stop" button'); 
}

function handleAnimationStop(message, shouldReload) {
    if (!isMoving) return;
    clearInterval(animationInterval);
    isMoving = false;
    stopBtn.style.display = 'none';

    if (shouldReload) {
        reloadBtn.style.display = 'inline-block';
    } else {
        startBtn.style.display = 'none'; 
        reloadBtn.style.display = 'inline-block';
    }
    
    logEvent(message);
}

// *** ЛОГІКА РУХУ ***
function moveCircle() {
    if (!isMoving) return;
    
    const sizeIncrease = 1; 
    
    currentSize += sizeIncrease;
    currentRadius = currentSize / 2;
    circle.style.width = `${currentSize}px`;
    circle.style.height = `${currentSize}px`;
    
    const animRect = anim.getBoundingClientRect();
    const animWidth = animRect.width;
    const animHeight = animRect.height;
    const step = stepSize;
    
    let newX = currentPos.x;
    let newY = currentPos.y;

    if (segmentProgress >= segmentLength) {
        direction = (direction + 1) % 4; 
        segmentProgress = 0;
        if (direction % 2 === 0) { 
             segmentLength += 1; 
        }
    }

    switch (direction) {
        case 0: newX -= step; break; 
        case 1: newY += step; break; 
        case 2: newX += step; break; 
        case 3: newY -= step; break; 
    }
    
    segmentProgress += step;
    
    newX -= sizeIncrease / 2;
    newY -= sizeIncrease / 2;

    currentPos.x = newX;
    currentPos.y = newY;
    circle.style.left = `${currentPos.x}px`;
    circle.style.top = `${currentPos.y}px`;

    const exitedHorizontally = newX + currentSize < 0 || newX > animWidth;
    const exitedVertically = newY + currentSize < 0 || newY > animHeight;
    
    if (exitedHorizontally || exitedVertically) {
        handleAnimationStop(`Circle exited anim boundaries (Full exit)`, true); 
        return;
    }
    
    const touchedWall = newX <= 0 || newX + currentSize >= animWidth || 
                        newY <= 0 || newY + currentSize >= animHeight;
    
    if (touchedWall) {
        handleAnimationStop(`Circle touched wall - Animation stopped`, true); 
        return;
    }

    logEvent(`Крок/Зміщення. Розмір: ${currentSize}px.`); 
}

function reloadAnimation() {
    stopAnimation();
    setInitialPosition();
    reloadBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    logEvent('Circle reset to initial position (Reload)'); 
}


// --- Керування кнопками та displayResults ---

playBtn.addEventListener('click', async () => { 
    console.log("PLAY button clicked. Activating work area.");
    
    const cacheBuster = Date.now(); 
    await fetch(`clear_logs.php?_=${cacheBuster}`, { method: 'GET' })
        .then(response => response.json())
        .then(data => console.log('Server logs cleared:', data))
        .catch(error => console.error('Error clearing logs:', error));
    
    logEvent('Play button pressed'); 
    
    if (block5) block5.classList.add('active'); 
    
    resultsOutput.innerHTML = ''; 
    eventCounter = 0; 
    batchedEvents = []; 
    localStorage.removeItem(localStorageKey); 
    setInitialPosition();
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    reloadBtn.style.display = 'none';
});

closeBtn.addEventListener('click', async () => {
    console.log("CLOSE button clicked. Finalizing data.");
    stopAnimation();
    logEvent('Close button pressed - Finalizing data'); 
    
    if (batchedEvents.length > 0) {
        await sendToServer('final', batchedEvents); 
    }
    
    await displayResults();
    
    if (block5) block5.classList.remove('active');
    
    localStorage.removeItem(localStorageKey); 
});

startBtn.addEventListener('click', startAnimation); 
stopBtn.addEventListener('click', stopAnimation); 
reloadBtn.addEventListener('click', reloadAnimation); 


async function displayResults() {
    let results = { immediate: [], batch: [] };
    try {
        const response = await fetch('get_events.php'); 
        if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
        }
        results = await response.json(); 
    } catch (error) {
        console.error('Error reading results from server:', error);
        resultsOutput.innerHTML = `<p style="color:red;">Error loading data: ${error.message}. Check Network tab.</p>`;
        return;
    }
    
    const allImmediate = results.immediate; 
    const serverFinal = results.batch; 
    
    // Спроба знайти початок поточної сесії (ID 1), щоб відфільтрувати старі записи
    let startIndex = -1;
    for (let i = allImmediate.length - 1; i >= 0; i--) {
        if (allImmediate[i].id === 1) {
            startIndex = i;
            break; 
        }
    }
    
    // Якщо ID 1 втрачено (через проблеми сервера), пробуємо показати останні N записів
    let currentImmediateSession = startIndex !== -1 
        ? allImmediate.slice(startIndex) 
        : (serverFinal.length > 0 ? allImmediate.slice(-serverFinal.length) : allImmediate);
    
    // --- ФОРМАТУВАННЯ ЧАСУ ---
    const formatTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        const H = String(date.getHours()).padStart(2, '0');
        const M = String(date.getMinutes()).padStart(2, '0');
        const S = String(date.getSeconds()).padStart(2, '0');
        
        if (isoString.includes('.')) {
             const ms = isoString.split('.')[1].substring(0, 3);
             return `${H}:${M}:${S}.${ms}`;
        }
        
        const ms = String(date.getMilliseconds()).padStart(3, '0');
        return `${H}:${M}:${S}.${ms}Z`; 
    };

    let tableHTML = `
        <table class="results-table">
            <thead>
                <tr>
                    <th class="results-col" style="width: 50%;">Акумульоване Збереження (Local Storage -> Сервер)</th>
                    <th class="results-col" style="width: 50%;">Негайне Збереження (Сервер)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <ol class="custom-list">`;
                            serverFinal.forEach(event => {
                                const formattedTime = formatTime(event.time_local);
                                const description = event.message.includes('Розмір') 
                                    ? `Крок/Зміщення. Розмір: ${event.size_px || event.size}px.` 
                                    : event.message.replace(' - Finalizing data', ''); 

                                tableHTML += `<li>[ID ${event.id}] ${formattedTime} - ${description}</li>`;
                            });
    tableHTML += `</ol></td>
                    <td>
                        <ol class="custom-list">`;
                            currentImmediateSession.forEach((event) => {
                                const formattedTime = formatTime(event.time_server);
                                const description = event.message.includes('Розмір') 
                                    ? `Крок/Зміщення. Розмір: ${event.size}px.` 
                                    : event.message;

                                // !!! ВИПРАВЛЕНО: Виводимо РЕАЛЬНИЙ ID з сервера (event.id), а не лічильник !!!
                                tableHTML += `<li>[ID ${event.id}] ${formattedTime} - ${description}</li>`;
                            });
    tableHTML += `</ol></td>
                </tr>
            </tbody>
        </table>`;
    
    resultsOutput.innerHTML = tableHTML;
}

// Ініціалізація
window.addEventListener('load', () => {
    if (circle && anim) {
         setTimeout(setInitialPosition, 100); 
    } else {
         console.error("Error: Could not find key DOM elements (circle or anim). Check index.html.");
    }
});