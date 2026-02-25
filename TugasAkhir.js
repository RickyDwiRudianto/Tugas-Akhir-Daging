// Refresh setiap 5 detik (5000 ms)
const REFRESH_INTERVAL = 5000;

/**
 * Fungsi utama untuk mengambil data dari ESP32
 * URL endpoint: /data (contoh: http://192.168.1.100/data)
 */
async function fetchData() {
    try {
        // Ganti URL ini dengan alamat ESP32 lo nanti
        // Format data yang diharapkan dari ESP32:
        // {
        //   "temp": 24.5,
        //   "hum": 65,
        //   "gas": 0.12,
        //   "rgb": {"r": 180, "g": 50, "b": 30},
        //   "status": "FRESH",
        //   "relay": false
        // }
        const response = await fetch('/data');
        
        // Cek kalo response error
        if (!response.ok) {
            throw new Error('Gagal mengambil data');
        }
        
        // Ubah response ke format JSON
        const data = await response.json();
        
        // Update tampilan dengan data yang didapat
        updateUI(data);
        
    } catch (error) {
        // Kalo error, tampilkan pesan di console
        console.error('Error:', error);
        
        // Tampilkan error di layar
        showError();
    }
}

/**
 * Update semua elemen di website dengan data terbaru
 * @param {Object} data - Data dari ESP32
 */
function updateUI(data) {
    // ===== UPDATE SENSOR SUHU =====
    // Tampilkan suhu dengan 1 angka desimal
    document.getElementById('suhu').textContent = data.temp.toFixed(1);
    
    // Hitung persentase untuk progress bar (asumsi max 30°C)
    const suhuPercent = Math.min((data.temp / 30) * 100, 100);
    document.getElementById('suhuBar').style.width = suhuPercent + '%';
    
    // ===== UPDATE SENSOR KELEMBABAN =====
    document.getElementById('hum').textContent = data.hum;
    document.getElementById('humBar').style.width = data.hum + '%';
    
    // ===== UPDATE SENSOR GAS =====
    // Gas dari ESP32 dalam range 0-1, kita ubah ke persen (0-100)
    const gasPercent = (data.gas * 100).toFixed(1);
    document.getElementById('gas').textContent = gasPercent;
    document.getElementById('gasBar').style.width = gasPercent + '%';
    
    // ===== UPDATE NILAI RGB =====
    document.getElementById('redValue').textContent = data.rgb.r;
    document.getElementById('greenValue').textContent = data.rgb.g;
    document.getElementById('blueValue').textContent = data.rgb.b;
    
    // Update warna lingkaran RGB sesuai nilai
    document.getElementById('redCircle').style.background = 
        `rgb(${data.rgb.r}, 0, 0)`;
    document.getElementById('greenCircle').style.background = 
        `rgb(0, ${data.rgb.g}, 0)`;
    document.getElementById('blueCircle').style.background = 
        `rgb(0, 0, ${data.rgb.b})`;
    
    // ===== UPDATE STATUS DAGING =====
    updateStatus(data.status);
    
    // ===== UPDATE STATUS RELAY =====
    updateRelay(data.relay);
    
    // ===== UPDATE WAKTU =====
    updateTimestamp();
}

/**
 * Update status daging (SEGAR/AGRIS/BUSUK)
 * @param {string} status - Status dari ESP32 (FRESH/SEMI/SPOILED)
 */
function updateStatus(status) {
    const statusText = document.getElementById('statusText');
    const statusDesc = document.getElementById('statusDesc');
    
    // Hapus semua class status dulu
    statusText.className = 'status-value';
    
    // Tentukan tampilan berdasarkan status
    switch(status) {
        case 'FRESH':
            statusText.classList.add('status-fresh');
            statusText.textContent = 'SEGAR';
            statusDesc.textContent = 'Daging segar, aman dikonsumsi';
            break;
            
        case 'SEMI':
            statusText.classList.add('status-semi');
            statusText.textContent = 'AGRIS';
            statusDesc.textContent = 'Daging mulai tidak segar, segera olah';
            break;
            
        case 'SPOILED':
            statusText.classList.add('status-spoiled');
            statusText.textContent = 'BUSUK';
            statusDesc.textContent = 'Daging busuk, JANGAN dikonsumsi';
            break;
            
        default:
            // Kalo status tidak dikenal
            statusText.textContent = '---';
            statusDesc.textContent = 'Menunggu data...';
    }
}

/**
 * Update status relay pendingin
 * @param {boolean} state - true = ON, false = OFF
 */
function updateRelay(state) {
    const relayElement = document.getElementById('relayStatus');
    
    if (state) {
        // Relay ON
        relayElement.innerHTML = '<span class="relay-on">ON</span>';
    } else {
        // Relay OFF
        relayElement.innerHTML = '<span class="relay-off">OFF</span>';
    }
}

/**
 * Update waktu terakhir data diambil
 */
function updateTimestamp() {
    const now = new Date();
    
    // Format waktu: HH:MM:SS
    const timeString = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    document.getElementById('updateTime').textContent = timeString;
}

/**
 * Tampilkan error ketika koneksi gagal
 */
function showError() {
    const sensorIds = ['suhu', 'hum', 'gas'];
    sensorIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = 'ERR';
    });
    
    const rgbIds = ['redValue', 'greenValue', 'blueValue'];
    rgbIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = 'ERR';
    });
    
    // Set status
    document.getElementById('statusText').textContent = 'ERROR';
    document.getElementById('statusDesc').textContent = 'Gagal mengambil data';
}

/**
 * Manual refresh (dipanggil dari tombol refresh)
 */
function refreshData() {
    fetchData();
}

/**
 * TEST FUNCTION: Buat generate data dummy buat testing
 * Gunakan ini kalo ESP32 belum siap
 */
function useTestData() {
    // Data dummy untuk testing
    const testData = {
        temp: 24.5,           // Suhu 24.5°C
        hum: 65,               // Kelembaban 65%
        gas: 0.12,             // Gas 12%
        rgb: {                 // Nilai RGB
            r: 180,            // Merah
            g: 50,             // Hijau
            b: 30              // Biru
        },
        status: 'FRESH',       // Status (FRESH/SEMI/SPOILED)
        relay: false           // Relay false = OFF
    };
    
    // Panggil updateUI dengan data dummy
    updateUI(testData);
    
    // Log ke console
    console.log('Menggunakan test data:', testData);
}

/**
 * INISIALISASI - Jalan pertama kali website dibuka
 */
window.onload = function() {
    console.log('Website monitoring dimulai...');
    
    // Coba ambil data dari ESP32
    fetchData();
    
    // Set auto refresh setiap 5 detik
    //setInterval(fetchData, REFRESH_INTERVAL);
    
    // UNTUK TESTING: Kalo ESP32 belum siap, 
    // uncomment baris di bawah ini:
    setInterval(useTestData, REFRESH_INTERVAL);
};