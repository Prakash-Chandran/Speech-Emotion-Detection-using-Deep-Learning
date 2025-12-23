// --- 1. GLOBAL VARIABLES ---
let audioInput, fileNameDisplay, analyzeBtn, mainContent, resultsPage, creatorPage, loader, downloadBtn;
let emotionChart = null;
let metricsChart = null;
let historyData = JSON.parse(localStorage.getItem('analysisHistory')) || [];
let mediaRecorder;
let audioChunks = [];

// --- FULL TRANSLATION DICTIONARY ---
const translations = {
    en: {
        settingsTitle: "Settings", languageLabel: "Language", darkModeLabel: "Appearance", aboutLabel: "About", creatorBtn: "Creator Details",
        heroSubtitle: "Detect emotions from speech in real-time using advanced deep learning",
        stepUpload: "Upload", stepAnalyze: "Analyze", stepResults: "Results",
        uploadTitle: "Upload Your Audio", uploadSubtitle: "Drop your audio file here or click to browse",
        selectedFile: "Selected File:", analyzeBtn: "Analyze Audio", clearBtn: "Clear",
        historyTitle: "Download History", dateHead: "Date", fileHead: "Filename", emotionHead: "Emotion", confidenceHead: "Confidence", clearHistoryBtn: "Clear History",
        resultsTitle: "Analysis Results", backBtn: "Back", confidenceLabel: "Confidence Score:",
        reportDetailsTitle: "Analysis Report Details", dateLabel: "Date & Time:", fileLabel: "File Name:", emotionLabel: "Detected Emotion:", confLabel: "Confidence Score:", statusLabel: "Status:",
        visualsTitle: "Performance Visuals", downloadBtn: "Download Report", analyzeAgainBtn: "Analyze Another File",
        creatorTitle: "Creator Details", noHistory: "No history yet.",
        home: "Home", features: "Features", history: "History",
        feat1Title: "Real-time Analysis", feat1Desc: "Get instant emotion detection results in seconds",
        feat2Title: "Detailed Metrics", feat2Desc: "View confidence scores and emotion spectrum analysis",
        feat3Title: "Secure Processing", feat3Desc: "Your data is processed locally and never stored",
        creatorLabel: "Creator:",
        loadingMsg: "Analyzing emotion... Please wait"
    },
    es: {
        settingsTitle: "Configuración", languageLabel: "Idioma", darkModeLabel: "Apariencia", aboutLabel: "Acerca de", creatorBtn: "Detalles del Creador",
        heroSubtitle: "Detecta emociones en el habla en tiempo real usando aprendizaje profundo",
        stepUpload: "Subir", stepAnalyze: "Analizar", stepResults: "Resultados",
        uploadTitle: "Sube tu Audio", uploadSubtitle: "Arrastra tu archivo aquí o haz clic para buscar",
        selectedFile: "Archivo:", analyzeBtn: "Analizar Audio", clearBtn: "Limpiar",
        historyTitle: "Historial de Descargas", dateHead: "Fecha", fileHead: "Archivo", emotionHead: "Emoción", confidenceHead: "Confianza", clearHistoryBtn: "Borrar Historial",
        resultsTitle: "Resultados", backBtn: "Volver", confidenceLabel: "Confianza:",
        reportDetailsTitle: "Detalles del Reporte", dateLabel: "Fecha y Hora:", fileLabel: "Archivo:", emotionLabel: "Emoción Detectada:", confLabel: "Puntuación:", statusLabel: "Estado:",
        visualsTitle: "Gráficos", downloadBtn: "Descargar Reporte", analyzeAgainBtn: "Analizar Otro",
        creatorTitle: "Detalles del Creador", noHistory: "Sin historial.",
        home: "Inicio", features: "Características", history: "Historial",
        feat1Title: "Análisis en tiempo real", feat1Desc: "Obtén resultados de detección de emociones en segundos",
        feat2Title: "Métricas detalladas", feat2Desc: "Ver puntuaciones de confianza y análisis del espectro",
        feat3Title: "Procesamiento seguro", feat3Desc: "Tus datos se procesan localmente y nunca se almacenan",
        creatorLabel: "Creador:",
        loadingMsg: "Analizando emoción... Por favor espere"
    },
    fr: {
        settingsTitle: "Paramètres", languageLabel: "Langue", darkModeLabel: "Apparence", aboutLabel: "À propos", creatorBtn: "Détails du Créateur",
        heroSubtitle: "Détectez les émotions de la parole en temps réel",
        stepUpload: "Télécharger", stepAnalyze: "Analyser", stepResults: "Résultats",
        uploadTitle: "Téléchargez votre Audio", uploadSubtitle: "Déposez votre fichier ici",
        selectedFile: "Fichier:", analyzeBtn: "Analyser", clearBtn: "Effacer",
        historyTitle: "Historique", dateHead: "Date", fileHead: "Fichier", emotionHead: "Émotion", confidenceHead: "Confiance", clearHistoryBtn: "Effacer l'historique",
        resultsTitle: "Résultats d'analyse", backBtn: "Retour", confidenceLabel: "Confiance:",
        reportDetailsTitle: "Détails du rapport", dateLabel: "Date:", fileLabel: "Fichier:", emotionLabel: "Émotion:", confLabel: "Score:", statusLabel: "Statut:",
        visualsTitle: "Visuels", downloadBtn: "Télécharger", analyzeAgainBtn: "Analyser un autre",
        creatorTitle: "Détails du Créateur", noHistory: "Aucun historique.",
        home: "Accueil", features: "Fonctionnalités", history: "Historique",
        feat1Title: "Analyse en temps réel", feat1Desc: "Obtenez des résultats instantanés",
        feat2Title: "Métriques détaillées", feat2Desc: "Voir les scores de confiance",
        feat3Title: "Traitement sécurisé", feat3Desc: "Vos données sont traitées localement",
        creatorLabel: "Créateur:",
        loadingMsg: "Analyse de l'émotion... Veuillez patienter"
    }
};

// --- 2. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    audioInput = document.getElementById('audioFile');
    fileNameDisplay = document.getElementById('fileName');
    analyzeBtn = document.getElementById('analyzeBtn');
    mainContent = document.getElementById('mainContent');
    resultsPage = document.getElementById('resultsPage');
    creatorPage = document.getElementById('creatorPage');
    loader = document.getElementById('loader');
    downloadBtn = document.getElementById('download-btn');

    const themeCheckbox = document.getElementById('themeCheckbox');
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeCheckbox) themeCheckbox.checked = true;
    }

    renderHistory();
    const lastPage = localStorage.getItem('activePage') || 'home';
    restorePage(lastPage);

    if (audioInput) {
        audioInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                fileNameDisplay.textContent = this.files[0].name;
                fileNameDisplay.style.color = '#1abc9c';
            }
        });
    }
});

// --- 3. PAGE NAVIGATION SYSTEM ---
function setView(viewName) {
    mainContent.classList.add('hidden');
    resultsPage.classList.add('hidden');
    creatorPage.classList.add('hidden');
    
    const analysisPage = document.getElementById('analysisPage');
    if(analysisPage) analysisPage.classList.add('hidden');

    if (viewName === 'home') mainContent.classList.remove('hidden');
    if (viewName === 'results') resultsPage.classList.remove('hidden');
    if (viewName === 'creator') creatorPage.classList.remove('hidden');

    localStorage.setItem('activePage', viewName);
}

function restorePage(viewName) {
    if (viewName === 'creator') {
        showCreatorPage();
    } else if (viewName === 'results') {
        if (historyData.length > 0) {
            const lastItem = historyData[historyData.length - 1];
            loadResultsFromHistory(lastItem);
            setView('results');
        } else {
            goHome();
        }
    } else {
        goHome();
    }
}

function loadResultsFromHistory(item) {
    document.getElementById('resultEmotion').textContent = item.emotion;
    document.getElementById('resultConfidence').textContent = item.confidence;
    document.getElementById('report-date').textContent = item.date;
    document.getElementById('report-filename').textContent = item.fileName;
    document.getElementById('report-emotion').textContent = item.emotion;
    document.getElementById('report-confidence').textContent = item.confidence;
    generateCharts(); 
}

function goHome() {
    setView('home');
    resetForm();
}

function showCreatorPage() {
    closeSettings();
    setView('creator');
}

function closeCreatorPage() {
    goHome();
}

// --- 4. RECORDING LOGIC ---
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');

if(recordBtn) {
    recordBtn.onclick = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                sendAudioToServer(audioBlob);
            };

            mediaRecorder.start();
            recordBtn.disabled = true;
            stopBtn.disabled = false;
            recordBtn.innerText = "Listening...";
        } catch (err) {
            alert("Microphone access denied or not available.");
        }
    };
}

if(stopBtn) {
    stopBtn.onclick = () => {
        mediaRecorder.stop();
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        recordBtn.innerText = "🔴 Start Recording";
    };
}

function sendAudioToServer(blob) {
    const formData = new FormData();
    formData.append('file', blob, 'recorded_audio.wav');

    // Define loading transition
    mainContent.classList.add('hidden');
    const analysisPage = document.getElementById('analysisPage');
    if (analysisPage) analysisPage.classList.remove('hidden');

    fetch('/speech/predict', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            handleBackendResponse(data, "Voice Recording.wav");
        })
        .catch(err => {
            alert("Recording analysis failed: " + err.message);
            goHome();
        });
}

// --- 5. ANALYSIS LOGIC ---
function analyzeAudio() {
    if (!audioInput || audioInput.files.length === 0) {
        alert("Please upload an audio file first!");
        return;
    }

    mainContent.classList.add('hidden');
    const analysisPage = document.getElementById('analysisPage'); 
    if (analysisPage) analysisPage.classList.remove('hidden');
    analyzeBtn.disabled = true;

    const formData = new FormData();
    formData.append('file', audioInput.files[0]);
    
    fetch('/speech/predict', {
        method: 'POST',
        body: formData
    })
    
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Error: " + data.error);
            goHome();
        } else {
            handleBackendResponse(data, audioInput.files[0].name);
        }
    })
    .catch(err => {
        alert("Server connection failed. Please check if the server is running.");
        goHome();
    })
    .finally(() => {
        if (analyzeBtn) analyzeBtn.disabled = false;
    });
}

function handleBackendResponse(data, fileName) {
    document.getElementById('resultEmotion').textContent = data.emotion;
    document.getElementById('resultConfidence').textContent = data.confidence;
    
    const timestamp = new Date().toLocaleString();
    document.getElementById('report-date').textContent = timestamp;
    document.getElementById('report-filename').textContent = fileName;
    document.getElementById('report-emotion').textContent = data.emotion;
    document.getElementById('report-confidence').textContent = data.confidence;

    generateCharts(data.probabilities);

    const newRecord = { 
        date: timestamp, 
        fileName: fileName, 
        emotion: data.emotion, 
        confidence: data.confidence 
    };
    historyData.push(newRecord);
    localStorage.setItem('analysisHistory', JSON.stringify(historyData));
    renderHistory();

    setView('results');
}

// --- 6. SETTINGS & THEME ---
function openSettings() { document.getElementById('settingsModal').classList.remove('hidden'); }
function closeSettings() { document.getElementById('settingsModal').classList.add('hidden'); }

function toggleTheme() {
    const checkbox = document.getElementById('themeCheckbox');
    if (checkbox.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

function changeLanguage(lang) {
    const t = translations[lang] || translations['en'];
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (t[key]) {
            const span = el.querySelector('span');
            if (span) span.textContent = t[key];
            else el.textContent = t[key];
        }
    });
}

// --- 7. HISTORY & CHARTS ---
function renderHistory() {
    const tbody = document.getElementById('historyBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    if (historyData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888;">No history yet.</td></tr>`;
        return;
    }
    historyData.slice().reverse().forEach(item => {
        tbody.innerHTML += `<tr><td>${item.date}</td><td>${item.fileName}</td><td style="color:var(--primary-color); font-weight:bold;">${item.emotion}</td><td>${item.confidence}</td></tr>`;
    });
}

function clearHistory() {
    if(confirm("Clear all analysis history?")) {
        historyData = [];
        localStorage.setItem('analysisHistory', JSON.stringify(historyData));
        renderHistory();
    }
}

function resetForm() {
    if (audioInput) audioInput.value = '';
    if (fileNameDisplay) {
        fileNameDisplay.textContent = 'No file chosen';
        fileNameDisplay.style.color = '#666';
    }
}

function generateCharts(probs = null) {
    const ctx = document.getElementById('myChart1');
    if (!ctx) return;

    const labels = probs ? Object.keys(probs) : ['Neutral', 'Happy', 'Sad', 'Angry'];
    const dataValues = probs ? Object.values(probs).map(v => (v * 100).toFixed(1)) : [25, 25, 25, 25];

    if (emotionChart) emotionChart.destroy();

    emotionChart = new Chart(ctx.getContext('2d'), {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: ['#EF5350', '#3498db', '#B39DDB', '#FFB74D', '#00ffccff'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { callbacks: { label: (item) => `${item.label}: ${item.raw}%` } }
            }
        }
    });
}

// --- 8. DOWNLOAD LOGIC ---
function initiateDownload() { document.getElementById('filenameModal').classList.remove('hidden'); }
function closeFilenameModal() { document.getElementById('filenameModal').classList.add('hidden'); }

function confirmDownload() {
    let customName = document.getElementById('filenameInput').value || "EmotiVoice_Report";
    if (!customName.endsWith('.pdf')) customName += '.pdf';
    closeFilenameModal();

    const btn = document.getElementById('download-btn'); 
    const element = document.querySelector('.results-container');
    const originalContent = btn.innerHTML;
    
    btn.innerText = "Generating PDF...";
    const wasDarkMode = document.body.classList.contains('dark-mode');
    document.body.classList.remove('dark-mode');

    const watermarkContainer = document.createElement('div');
    watermarkContainer.className = 'pdf-watermark-container';
    for (let i = 0; i < 6; i++) {
        const mark = document.createElement('div');
        mark.className = 'watermark-item';
        mark.innerHTML = "EmotiVoice AI<br>By PRAKASH CHANDRAN";
        watermarkContainer.appendChild(mark);
    }
    element.appendChild(watermarkContainer);

    const opt = {
        margin: 0.5,
        filename: customName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        watermarkContainer.remove();
        btn.innerHTML = originalContent;
        if (wasDarkMode) document.body.classList.add('dark-mode');
    });
}

function toggleSocialDropdown() {
    const menu = document.getElementById('socialDropdownMenu');
    menu.classList.toggle('hidden');
}