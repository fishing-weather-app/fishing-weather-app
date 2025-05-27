// مفاتيح API
const OPENWEATHERMAP_API_KEY = 'fa8384da565263849c4e';
const STORMGLASS_API_KEY = '6394507a-3a07-11f0-976d-0242ac130006-639450de-3a07-11f0-976d-0242ac130006';

// تحديث كل 2.4 ساعة = 144 دقيقة
const UPDATE_INTERVAL_MINUTES = 144;
const UPDATE_INTERVAL_MS = UPDATE_INTERVAL_MINUTES * 60 * 1000;

let map, marker;
let currentLang = 'ar';

// ترجمة النصوص الأساسية
const translations = {
  ar: {
    title: 'طقس الصياد',
    autoLocate: 'تحديد الموقع تلقائياً',
    manualLocate: 'تحديد يدوي',
    locationPlaceholder: 'أدخل اسم المدينة أو الموقع',
    weatherTitle: 'حالة الطقس',
    seaTitle: 'موج البحر والمد والجزر',
    mapTitle: 'الخريطة',
    temperature: 'درجة الحرارة',
    wind: 'الرياح',
    humidity: 'الرطوبة',
    description: 'الوصف',
    waveHeight: 'ارتفاع الموج',
    tide: 'المد والجزر',
    errorLocation: 'لم نستطع تحديد موقعك',
    errorFetch: 'فشل في جلب البيانات',
  },
  en: {
    title: 'Fisherman Weather',
    autoLocate: 'Auto Locate',
    manualLocate: 'Manual Locate',
    locationPlaceholder: 'Enter city or location',
    weatherTitle: 'Weather Status',
    seaTitle: 'Wave and Tide',
    mapTitle: 'Map',
    temperature: 'Temperature',
    wind: 'Wind',
    humidity: 'Humidity',
    description: 'Description',
    waveHeight: 'Wave Height',
    tide: 'Tide',
    errorLocation: 'Could not get your location',
    errorFetch: 'Failed to fetch data',
  },
  tr: {
    title: 'Balıkçı Hava Durumu',
    autoLocate: 'Otomatik Konum',
    manualLocate: 'Manuel Konum',
    locationPlaceholder: 'Şehir veya yer girin',
    weatherTitle: 'Hava Durumu',
    seaTitle: 'Dalga ve Gelgit',
    mapTitle: 'Harita',
    temperature: 'Sıcaklık',
    wind: 'Rüzgar',
    humidity: 'Nem',
    description: 'Açıklama',
    waveHeight: 'Dalga Yüksekliği',
    tide: 'Gelgit',
    errorLocation: 'Konum alınamadı',
    errorFetch: 'Veri alınamadı',
  },
  ku: {
    title: 'Hewata Masîvan',
    autoLocate: 'Cîhê xwe bicîh bikin',
    manualLocate: 'Destan cîhê xwe binivîsin',
    locationPlaceholder: 'Navê bajar an cîhê binivîse',
    weatherTitle: 'Rewşa Hewatê',
    seaTitle: 'Qul û Gerîn',
    mapTitle: 'Nexşe',
    temperature: 'Germî',
    wind: 'Ba',
    humidity: 'Rûwetî',
    description: 'Danasîn',
    waveHeight: 'Bilindahiya qulê',
    tide: 'Gerîn',
    errorLocation: 'Nexşe cîhê te nayê dîtin',
    errorFetch: 'Daneyên wergerandin çewt bû',
  }
};

// تحديث النصوص حسب اللغة المختارة
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

// جلب بيانات الطقس من OpenWeatherMap
async function fetchWeather(lat, lon) {
  const t = translations[currentLang];
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHERMAP_API_KEY}&lang=${currentLang}`;
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

// جلب بيانات موج البحر والمد والجزر من Stormglass
async function fetchSea(lat, lon) {
  const t = translations[currentLang];
  const url = `https://api.stormglass.io/v2/tide/extremes/point?lat=${lat}&lng=${lon}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: STORMGLASS_API_KEY },
    });
    if (!res.ok) throw new Error('Sea fetch error');
    const data = await res.json();

    // أبسط عرض للمد والجزر بناء على البيانات
    const tideExtremes = data.data;
    // نأخذ أقرب مد وجزر للوقت الحالي (يمكن تحسين لاحقًا)
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

// تحديد الموقع تلقائياً
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

// تحديد الموقع يدويًا
document.getElementById('manual-locate-btn').addEventListener('click', async () => {
  const location = document.getElementById('manual-location').value.trim();
  if (!location) return;
  // نستخدم API OpenWeatherMap للبحث عن إحداثيات المدينة
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${OPENWEATHERMAP_API_KEY}`;
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

// تغيير اللغة
document.getElementById('language-select').addEventListener('change', (e) => {
  currentLang = e.target.value;
  // يعيد تحميل آخر الموقع على الخريطة والبيانات
  if (marker) {
    const { lat, lng } = marker.getLatLng();
    updateAll(lat, lng);
  } else {
    // الموقع الافتراضي إسطنبول
    updateAll(41.015137, 28.979530);
  }
});

// بدء التطبيق بالموقع الافتراضي (اسطنبول)
updateAll(41.015137, 28.979530);

// تحديث تلقائي كل فترة محددة
setInterval(() => {
  if (marker) {
    const { lat, lng } = marker.getLatLng();
    updateAll(lat, lng);
  }
}, UPDATE_INTERVAL_MS);
