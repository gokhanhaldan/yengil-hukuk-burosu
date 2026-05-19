/* YENGİL HUKUK BÜROSU - HESAPLAMA MOTORU & ETKİLEŞİM SCRİPTİ
    Author: Yengil Law Tech Team
    Version: 2.0 (Full Functional)
*/

// --- SABİT DEĞERLER (2024-2025 Dönemi Baz Alınmıştır) ---
const CONSTANTS = {
    GELIR_VERGISI_ORANI: 0.15, // 1. Dilim
    DAMGA_VERGISI: 0.00759,
    KIDEM_TAVANI: 41828.42, // Güncel Tavan (Değişkenlik gösterebilir)
    ASGARI_UCRET_BRUT: 20002.50,
    ASGARI_UCRET_NET: 17002.12
};

// --- MODAL İŞLEMLERİ ---
const modal = document.getElementById("calcModal");
const modalTitle = document.getElementById("modal-title");
const modalForm = document.getElementById("modal-form");
const resultArea = document.getElementById("result-area");

// Modalı Kapatma
function closeModal() {
    modal.style.display = "none";
    resultArea.style.display = "none";
    // Animasyonlu kapanış için class eklenebilir
}

// Dışarı tıklandığında kapatma
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

// --- MENÜ YÖNETİMİ ---
function openModal(type) {
    modal.style.display = "flex";
    resultArea.style.display = "none";
    resultArea.innerHTML = "";
    modalForm.innerHTML = ""; // Formu temizle

    switch (type) {
        case 'kidem': setupKidemTazminati(); break;
        case 'vekalet': setupVekaletUcreti(); break;
        case 'ihbar': setupIhbarTazminati(); break;
        case 'issizlik': setupIssizlikMaasi(); break;
        case 'mesai': setupFazlaMesai(); break;
        case 'veraset': setupVeraset(); break;
        case 'iskazasi': setupIsKazasi(); break;
        case 'kira': setupKiraArtis(); break;
        case 'arabuluculuk': setupArabuluculuk(); break;
        default: alert("Bu modül bakım aşamasındadır.");
    }
}

// --- YARDIMCI FONKSİYONLAR (UI) ---
function createInput(label, id, type = "number", placeholder = "") {
    return `
        <div class="form-group" style="margin-bottom:15px;">
            <label style="display:block; margin-bottom:5px; font-weight:bold; font-family:'Lato',sans-serif;">${label}</label>
            <input type="${type}" id="${id}" placeholder="${placeholder}" 
            style="width:100%; padding:12px; border:1px solid #ddd; border-radius:4px; font-size:1rem;">
        </div>
    `;
}

function createButton(funcName, text = "HESAPLA") {
    return `
        <button onclick="${funcName}()" 
        style="width:100%; background-color:#D4AF37; color:white; border:none; padding:15px; font-weight:bold; cursor:pointer; font-size:1.1rem; letter-spacing:1px; margin-top:10px; transition:0.3s;">
        ${text}
        </button>
    `;
}

function formatCurrency(amount) {
    return amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
}

function showResult(html) {
    resultArea.innerHTML = html;
    resultArea.style.display = "block";
    resultArea.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================================
// 1. KIDEM TAZMİNATI
// ==========================================================
function setupKidemTazminati() {
    modalTitle.innerText = "Kıdem Tazminatı Hesaplama";
    modalForm.innerHTML = 
        createInput("İşe Giriş Tarihi", "girisTarihi", "date") +
        createInput("İşten Çıkış Tarihi", "cikisTarihi", "date") +
        createInput("Brüt Maaş (TL)", "brutMaas", "number", "Aylık Brüt Ücret") +
        createButton("calculateKidem");
}

function calculateKidem() {
    const giris = new Date(document.getElementById("girisTarihi").value);
    const cikis = new Date(document.getElementById("cikisTarihi").value);
    const maas = parseFloat(document.getElementById("brutMaas").value);

    if (isNaN(maas) || !giris || !cikis) return alert("Lütfen tüm alanları doldurunuz.");
    if (cikis < giris) return alert("Çıkış tarihi giriş tarihinden önce olamaz.");

    // Süre Hesabı
    const diffTime = Math.abs(cikis - giris);
    const gunSayisi = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const yil = Math.floor(gunSayisi / 365);
    const kalanGun = gunSayisi % 365;

    // Tavan Kontrolü
    const esasMaas = maas > CONSTANTS.KIDEM_TAVANI ? CONSTANTS.KIDEM_TAVANI : maas;

    // Hesaplama
    const tazminatYil = esasMaas * yil;
    const tazminatGun = (esasMaas / 365) * kalanGun;
    const brutTazminat = tazminatYil + tazminatGun;
    const damgaVergisi = brutTazminat * CONSTANTS.DAMGA_VERGISI;
    const netTazminat = brutTazminat - damgaVergisi;

    showResult(`
        <h4><i class="fas fa-file-invoice-dollar"></i> Hesaplama Sonucu</h4>
        <p><strong>Hizmet Süresi:</strong> ${yil} Yıl, ${kalanGun} Gün</p>
        <p><strong>Brüt Tazminat:</strong> ${formatCurrency(brutTazminat)}</p>
        <p><strong>Damga Vergisi:</strong> -${formatCurrency(damgaVergisi)}</p>
        <hr style="border-color:#D4AF37; margin:10px 0;">
        <p style="font-size:1.2rem; color:#D4AF37;"><strong>NET ELE GEÇEN: ${formatCurrency(netTazminat)}</strong></p>
    `);
}

// ==========================================================
// 2. İHBAR TAZMİNATI
// ==========================================================
function setupIhbarTazminati() {
    modalTitle.innerText = "İhbar Tazminatı Hesaplama";
    modalForm.innerHTML = 
        createInput("Çalışma Süresi (Ay)", "calismaSuresi", "number", "Kaç ay çalıştınız?") +
        createInput("Brüt Maaş (TL)", "ihbarMaas", "number") +
        createButton("calculateIhbar");
}

function calculateIhbar() {
    const ay = parseFloat(document.getElementById("calismaSuresi").value);
    const maas = parseFloat(document.getElementById("ihbarMaas").value);

    if (isNaN(ay) || isNaN(maas)) return alert("Lütfen değerleri giriniz.");

    let hafta = 0;
    if (ay < 6) hafta = 2;
    else if (ay < 18) hafta = 4;
    else if (ay < 36) hafta = 6;
    else hafta = 8;

    const brutIhbar = (maas / 30) * 7 * hafta;
    const gelirVergisi = brutIhbar * CONSTANTS.GELIR_VERGISI_ORANI;
    const damgaVergisi = brutIhbar * CONSTANTS.DAMGA_VERGISI;
    const netIhbar = brutIhbar - (gelirVergisi + damgaVergisi);

    showResult(`
        <h4><i class="fas fa-briefcase"></i> İhbar Tazminatı</h4>
        <p><strong>İhbar Süresi:</strong> ${hafta} Hafta</p>
        <p><strong>Brüt Tutar:</strong> ${formatCurrency(brutIhbar)}</p>
        <p><strong>Kesintiler:</strong> -${formatCurrency(gelirVergisi + damgaVergisi)}</p>
        <hr>
        <p style="font-size:1.2rem; color:#D4AF37;"><strong>NET ÖDENECEK: ${formatCurrency(netIhbar)}</strong></p>
    `);
}

// ==========================================================
// 3. FAZLA MESAİ
// ==========================================================
function setupFazlaMesai() {
    modalTitle.innerText = "Fazla Mesai Hesaplama";
    modalForm.innerHTML = 
        createInput("Aylık Brüt Maaş", "mesaiMaas") +
        createInput("Toplam Fazla Mesai Saati", "mesaiSaat") +
        createButton("calculateMesai");
}

function calculateMesai() {
    const maas = parseFloat(document.getElementById("mesaiMaas").value);
    const saat = parseFloat(document.getElementById("mesaiSaat").value);

    if (isNaN(maas) || isNaN(saat)) return;

    // Saatlik ücret = Maaş / 225
    // Fazla mesai zamlı saat ücreti = Saatlik * 1.5
    const saatUcret = maas / 225;
    const zamliUcret = saatUcret * 1.5;
    const brutMesai = zamliUcret * saat;
    
    // Basit usul vergi hesabı
    const netMesai = brutMesai * 0.7; // Yaklaşık %30 kesinti varsayımı

    showResult(`
        <h4><i class="fas fa-clock"></i> Fazla Mesai</h4>
        <p><strong>Saatlik Birim Ücret:</strong> ${formatCurrency(saatUcret)}</p>
        <p><strong>Brüt Mesai Toplamı:</strong> ${formatCurrency(brutMesai)}</p>
        <small>* Vergi dilimine göre net tutar değişebilir.</small>
    `);
}

// ==========================================================
// 4. VEKALET ÜCRETİ (AAÜT Basitleştirilmiş)
// ==========================================================
function setupVekaletUcreti() {
    modalTitle.innerText = "Avukatlık Vekalet Ücreti";
    modalForm.innerHTML = 
        createInput("Dava / İcra Değeri (TL)", "davaDegeri") +
        `<div class="form-group" style="margin-bottom:15px;">
            <label>Mahkeme Türü</label>
            <select id="mahkemeTuru" style="width:100%; padding:12px;">
                <option value="asliye">Asliye Mahkemeleri</option>
                <option value="icra">İcra Daireleri</option>
                <option value="sulh">Sulh Hukuk</option>
            </select>
        </div>` +
        createButton("calculateVekalet");
}

function calculateVekalet() {
    const deger = parseFloat(document.getElementById("davaDegeri").value);
    const tur = document.getElementById("mahkemeTuru").value;
    
    if (isNaN(deger)) return alert("Tutar giriniz.");

    let maktu = 17900; // 2024 Asliye Maktu (Örnek)
    if (tur === 'sulh') maktu = 10700;
    if (tur === 'icra') maktu = 3600;

    // Nispi Hesaplama (İlk dilim %16)
    let nispi = deger * 0.16;
    
    // Ücret maktunun altında olamaz
    let vekalet = nispi < maktu ? maktu : nispi;

    showResult(`
        <h4><i class="fas fa-balance-scale"></i> Vekalet Ücreti</h4>
        <p><strong>Esas Tutar:</strong> ${formatCurrency(deger)}</p>
        <p><strong>Tahmini Vekalet Ücreti:</strong> ${formatCurrency(vekalet)} + KDV</p>
        <small>* AAÜT Resmi Gazete tarifesi esas alınmalıdır.</small>
    `);
}

// ==========================================================
// 5. İŞSİZLİK MAAŞI
// ==========================================================
function setupIssizlikMaasi() {
    modalTitle.innerText = "İşsizlik Maaşı Hesaplama";
    modalForm.innerHTML = 
        createInput("Son 4 Ayın Ortalama Brüt Maaşı", "sonDortAy") +
        createButton("calculateIssizlik");
}

function calculateIssizlik() {
    const brut = parseFloat(document.getElementById("sonDortAy").value);
    if (isNaN(brut)) return;

    // Günlük brüt kazanç
    const gunlukBrut = brut / 30;
    // Günlük ödenek (Günlük brütün %40'ı)
    let gunlukOdenek = gunlukBrut * 0.40;
    
    // Tavan Kontrolü (Asgari ücret brütünün %80'ini geçemez)
    const tavan = (CONSTANTS.ASGARI_UCRET_BRUT / 30) * 0.80;
    
    if (gunlukOdenek > tavan) gunlukOdenek = tavan;

    const aylikOdenek = gunlukOdenek * 30;
    const damga = aylikOdenek * CONSTANTS.DAMGA_VERGISI;
    const net = aylikOdenek - damga;

    showResult(`
        <h4><i class="fas fa-user-injured"></i> İşsizlik Ödeneği</h4>
        <p><strong>Hesaplanan Aylık:</strong> ${formatCurrency(aylikOdenek)}</p>
        <p><strong>Damga Vergisi:</strong> -${formatCurrency(damga)}</p>
        <hr>
        <p style="font-size:1.2rem; color:#D4AF37;"><strong>AYLIK NET: ${formatCurrency(net)}</strong></p>
    `);
}

// ==========================================================
// 6. KİRA ARTIŞ ORANI
// ==========================================================
function setupKiraArtis() {
    modalTitle.innerText = "Kira Artış Oranı Hesaplama";
    modalForm.innerHTML = 
        createInput("Mevcut Kira Bedeli", "mevcutKira") +
        createInput("Uygulanacak Artış Oranı (%)", "artisOrani", "number", "Örn: 25 veya 65") +
        createButton("calculateKira");
}

function calculateKira() {
    const kira = parseFloat(document.getElementById("mevcutKira").value);
    const oran = parseFloat(document.getElementById("artisOrani").value);

    if (isNaN(kira) || isNaN(oran)) return;

    const artisMiktari = kira * (oran / 100);
    const yeniKira = kira + artisMiktari;

    showResult(`
        <h4><i class="fas fa-home"></i> Yeni Kira Bedeli</h4>
        <p><strong>Eski Kira:</strong> ${formatCurrency(kira)}</p>
        <p><strong>Artış Miktarı:</strong> ${formatCurrency(artisMiktari)}</p>
        <hr>
        <p style="font-size:1.2rem; color:#D4AF37;"><strong>YENİ KİRA: ${formatCurrency(yeniKira)}</strong></p>
    `);
}

// ==========================================================
// 7. VERASET VE İNTİKAL (Basit Oran)
// ==========================================================
function setupVeraset() {
    modalTitle.innerText = "Veraset Vergisi Hesaplama";
    modalForm.innerHTML = 
        createInput("Miras Kalan Toplam Değer (TL)", "mirasDeger") +
        createButton("calculateVeraset");
}

function calculateVeraset() {
    const deger = parseFloat(document.getElementById("mirasDeger").value);
    if(isNaN(deger)) return;
    
    // 2024 İstisna tutarı (yaklaşık)
    const istisna = 1609552; 
    let vergiMatrahi = deger - istisna;
    
    if (vergiMatrahi < 0) vergiMatrahi = 0;

    // İlk dilim %1
    const vergi = vergiMatrahi * 0.01; 

    showResult(`
        <h4><i class="fas fa-scroll"></i> Veraset Vergisi</h4>
        <p><strong>İstisna Düşüldükten Sonra Matrah:</strong> ${formatCurrency(vergiMatrahi)}</p>
        <p><strong>Tahmini Vergi (%1):</strong> ${formatCurrency(vergi)}</p>
        <small>* Yasal mirasçılar için geçerli taban orandır.</small>
    `);
}

// ==========================================================
// 8. İŞ KAZASI TAZMİNATI (Tahmini)
// ==========================================================
function setupIsKazasi() {
    modalTitle.innerText = "İş Kazası Tazminat Tahmini";
    modalForm.innerHTML = 
        createInput("Maluliyet Oranı (%)", "maluliyet") +
        createInput("Yaş", "yas") +
        createInput("Aylık Maaş", "kazasiMaas") +
        createButton("calculateIsKazasi");
}

function calculateIsKazasi() {
    const oran = parseFloat(document.getElementById("maluliyet").value);
    const yas = parseFloat(document.getElementById("yas").value);
    const maas = parseFloat(document.getElementById("kazasiMaas").value);

    if (isNaN(oran) || isNaN(yas) || isNaN(maas)) return;

    // Çok basitleştirilmiş aktüeryal hesap simülasyonu
    const kalanOmur = 65 - yas;
    if (kalanOmur <= 0) return alert("Emeklilik yaşı sınırı.");

    const yillikKazanc = maas * 12;
    const toplamKazanc = yillikKazanc * kalanOmur;
    const tazminat = toplamKazanc * (oran / 100);

    showResult(`
        <h4><i class="fas fa-crutch"></i> Tahmini Tazminat</h4>
        <p><strong>Maluliyet Oranı:</strong> %${oran}</p>
        <p><strong>Tahmini Maddi Tazminat:</strong> ${formatCurrency(tazminat)}</p>
        <small class="warning-text">* Bu hesaplama sadece bilgilendirme amaçlıdır. Aktüerya uzmanı tarafından hesaplanmalıdır.</small>
    `);
}

// ==========================================================
// 9. ARABULUCULUK ÜCRETİ
// ==========================================================
function setupArabuluculuk() {
    modalTitle.innerText = "Arabuluculuk Ücreti";
    modalForm.innerHTML = 
        createInput("Uyuşmazlık Konusu Miktar", "arabulucuMiktar") +
        createButton("calculateArabulucu");
}

function calculateArabulucu() {
    const miktar = parseFloat(document.getElementById("arabulucuMiktar").value);
    if(isNaN(miktar)) return;

    // %6 Taban oran (Taraflar eşit öderse %3 + %3)
    const ucret = miktar * 0.06;

    showResult(`
        <h4><i class="fas fa-handshake"></i> Arabuluculuk Ücreti</h4>
        <p><strong>Toplam Ücret:</strong> ${formatCurrency(ucret)}</p>
        <p><strong>Taraf Başına Düşen:</strong> ${formatCurrency(ucret/2)}</p>
    `);
}