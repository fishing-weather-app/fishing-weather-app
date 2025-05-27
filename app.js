// app.js

// مفاتيح API
const OPENWEATHERMAP_API_KEY = 'fa8384da565263849c4e';
const STORMGLASS_API_KEY = '6394507a-3a07-11f0-976d-0242ac130006-639450de-3a07-11f0-976d-0242ac130006';

// رابط البروكسي (ضع هنا رابط البروكسي الذي جهزته)
const proxyUrl = 'https://d75703d1-bf5f-4786-b254-7f6cb69b8cb0-00-2qbgslqxfyxsr.janeway.replit.dev/';

// تحديث كل 2.4 ساعة (144 دقيقة)
const UPDATE_INTERVAL_MINUTES = 144;
const UPDATE_INTERVAL_MS = UPDATE_INTERVAL_MINUTES * 60 * 1000;

let map, marker;
let currentLang = 'ar';

// ترجمات النصوص الأساسية
const translations = {
  ar: {
    title: 'طقس الصياد',
    autoLocate: 'تحديد الموقع تلقائياً',
    manualLocate: 'تحديد الموقع يدوياً',
    locationPlaceholder: 'أدخل اسم المدينة أو الإحداثيات',
    weatherTitle: 'حالة الطقس',
    seaTitle: 'حالة البحر',
    mapTitle: 'الخريطة',
    temperature: 'درجة الحرارة',
    wind: 'سرعة الرياح',
    humidity: 'الرطوبة',
    description: 'الوصف',
    waveHeight: 'ارتفاع الموج',
    tide: 'المد والجزر التالي',
    errorFetch: 'حدث خطأ أثناء جلب البيانات، حاول مرة أخرى.',
    errorLocation: 'تعذر تحديد الموقع.',
  },
  en: {
    title: 'Fisher Weather',
    autoLocate: 'Auto Locate',
    manualLocate: 'Manual Locate',
    locationPlaceholder: 'Enter city or coordinates',
    weatherTitle: 'Weather Status',
    seaTitle: 'Sea Status',
    mapTitle: 'Map',
    temperature: 'Temperature',
    wind: 'Wind Speed',
    humidity: 'Humidity',
    description: 'Description',
    waveHeight: 'Wave Height',
    tide: 'Next Tide',
    errorFetch: 'Error fetching data, please try again.',
    errorLocation: 'Unable to get location.',
  },
  tr: {
    title: 'Balıkçı Hava Durumu',
    autoLocate: 'Otomatik Konum',
    manualLocate: 'Manuel Konum',
    locationPlaceholder: 'Şehir veya koordinat girin',
    weatherTitle: 'Hava Durumu',
    seaTitle: 'Deniz Durumu',
    mapTitle: 'Harita',
    temperature: 'Sıcaklık',
    wind: 'Rüzgar Hızı',
    humidity: 'Nem',
    description: 'Açıklama',
    waveHeight: 'Dalga Yüksekliği',
    tide: 'Sonraki Gelgit',
    errorFetch: 'Veri alınırken hata oluştu, tekrar deneyin.',
    errorLocation: 'Konum alınamıyor.',
  },
  ku: {
    title: 'Hewada Masî',
    autoLocate: 'Cîhaza xweş',
    manualLocate: 'Cîhaza destan',
    locationPlaceholder: 'Navê bajêr an koordinatan binivîse',
    weatherTitle: 'Rewşa Hewada',
    seaTitle: 'Rewşa Deryayê',
    mapTitle: 'Nexşe',
    temperature: 'Germî',
    wind: 'Lehîndarî',
    humidity: 'Nem',
    description: 'Danasîn',
    waveHeight: 'Bilindahiya Dewrê',
    tide: 'Pêşî Dewr',
    errorFetch: 'Çewtiyeke di wergirtina daneyan de, ji kerema xwe dîsa biceribîne.',
    errorLocation: 'Nezane cîh çi ye.',
  }
};

function updateTranslations() {
  const t = translations[currentLang];
  document.getElementById('title').textContent = t.title;
  document.getElementById('auto-locate-btn').textContent = t.autoLocate;
  document.getElementById('manual-locate-btn').textContent = t.manualLocate;
  document.getElementById('manual-location').placeholder = t.locationPlaceholder;
  document.getElementById('weather-title').textContent = t.weatherTitle;
  document.getElementById('sea-title').textContent = t.seaTitle;
  document.getElementById('map-title').textContent = t.mapTitle;
}

async function fetchWeather(lat, lon) {
  const t = translations[currentLang];
  const url = proxyUrl + `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHERMAP_API_KEY}&lang=${currentLang}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather fetch error');
    const data = await res.json();
    return {
      temp: data.main.temp,
      wind: data.wind.speed,
      humidity: data.main.humidity,
      description: data.weather[0].description,
    };
  } catch {
    alert(t.errorFetch);
    return null;
  }
}

async function fetchSea(lat, lon) {
  const t = translations[currentLang];
  const url = proxyUrl + `https://api.stormglass.io/v2/tide/extremes/point?lat=${lat}&lng=${lon}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: STORMGLASS_API_KEY },
    });
    if (!res.ok) throw new Error('Sea fetch error');
    const data = await res.json();

    const tideExtremes = data.data;
    const now = new Date();
    let nextTide = tideExtremes.find(tide => new Date(tide.time) > now);
    if (!nextTide) nextTide = tideExtremes[0];

    return {
      nextTideType: nextTide.type,
      nextTideTime: new Date(nextTide.time).toLocaleTimeString(currentLang),
      waveHeight: 'غير متوفر حالياً',
    };
  } catch {
    alert(t.errorFetch);
    return null;
  }
}

function updateWeatherUI(weather) {
  const t = translations[currentLang];
  if (!weather) return;
  document.getElementById('temperature').textContent = `${t.temperature}: ${weather.temp}°C`;
  document.getElementById('wind').textContent = `${t.wind}: ${weather.wind} m/s`;
  document.getElementById('humidity').textContent = `${t.humidity}: ${weather.humidity}%`;
  document.getElementById('description').textContent = `${t.description}: ${weather.description}`;
}

function updateSeaUI(sea) {
  const t = translations[currentLang];
  if (!sea) return;
  document.getElementById('wave-height').textContent = `${t.waveHeight}: ${sea.waveHeight}`;
  document.getElementById('tide').textContent = `${t.tide}: ${sea.nextTideType} - ${sea.nextTideTime}`;
}

function initMap(lat, lon) {
  if (!map) {
    map = L.map('map').setView([lat, lon], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    marker = L.marker([lat, lon]).addTo(map);
  } else {
    map.setView([lat, lon], 10);
    marker.setLatLng([lat, lon]);
  }
}

async function updateAll(lat, lon) {
  updateTranslations();
  initMap(lat, lon);
  const weather = await fetchWeather(lat, lon);
  updateWeatherUI(weather);
  const sea = await fetchSea(lat, lon);
  updateSeaUI(sea);
}

document.getElementById('auto-locate-btn').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => updateAll(pos.coords.latitude, pos.coords.longitude),
      () => alert(translations[currentLang].errorLocation)
    );
  } else {
    alert(translations[currentLang].errorLocation);
  }
});

document.getElementById('manual-locate-btn').addEventListener('click', async () => {
  const location = document.getElementById('manual-location').value.trim();
  if (!location) return;
  const geoUrl = proxyUrl + `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${OPENWEATHERMAP_API_KEY}`;
  try {
    const res = await fetch(geoUrl);
    if (!res.ok) throw new Error('Geo fetch error');
    const data = await res.json();
    if (data.length === 0) {
      alert('الموقع غير موجود');
      return;
    }
    const { lat, lon } = data[0];
    updateAll(lat, lon);
  } catch {
    alert(translations[currentLang].errorFetch);
  }
});

document.getElementById('language-select').addEventListener('change', (e) => {
  currentLang = e.target.value;
  if (marker) {
    const { lat, lng } = marker.getLatLng();
    updateAll(lat, lng);
  } else {
    updateAll(41.015137, 28.979530);
  }
});

// ابدأ بعرض بيانات إسطنبول بشكل افتراضي
updateAll(41.015137, 28.979530);

// حدث التحديث كل فترة محددة
setInterval(() => {
  if (marker) {
    const { lat, lng } = marker.getLatLng();
    updateAll(lat, lng);
  }
}, UPDATE_INTERVAL_MS);
