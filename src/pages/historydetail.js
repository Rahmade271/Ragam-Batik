// src/pages/historydetail.js

import '../styles/styles.css'; // Gaya umum
import '../styles/batikdetail.css'; // Gaya untuk detail pages (mungkin perlu disesuaikan untuk history detail)

import BatikApi from '../services/batik-api';
import UrlParser from '../routes/url-parser';
import placeholderImage from '../assets/images/profil.jpeg'; // Gambar placeholder

const HistoryDetail = {
    async render() {
        return `
            <section class="history-detail-page-container main-content"> <div id="historyDetailContent" class="detail-content">
                    <p id="loadingHistoryDetailMessage" class="status-message">Memuat detail riwayat...</p>
                    <p id="noHistoryDetailMessage" class="status-message" style="display: none;">Detail riwayat tidak ditemukan.</p>
                    <p id="errorHistoryDetailMessage" class="status-message error-message" style="display: none;">Terjadi kesalahan saat memuat detail riwayat.</p>
                    <div id="actualHistoryDetail" style="display: none;"></div>
                </div>
                
                <section class="related-batiks-section">
                    <h2 id="relatedSectionTitle" class="related-batiks-title" style="display: none;"></h2>
                    <div id="relatedBatiksGrid" class="batik-grid">
                        <p id="loadingRelatedMessage" class="status-message"></p>
                        <p id="noRelatedMessage" class="status-message" style="display: none;"></p>
                        <p id="errorRelatedMessage" class="status-message error-message" style="display: none;"></p>
                    </div>
                </section>
            </section>
        `;
    },

    async afterRender() {
        const parsedUrl = UrlParser.parseActiveUrlWithoutCombiner();
        const historyId = parsedUrl.id; // Ini akan menjadi ID riwayat
        console.log('HistoryDetail: ID Riwayat yang diambil dari URL:', historyId);

        // --- Referensi elemen DOM untuk Detail Riwayat Utama ---
        const historyDetailContent = document.getElementById('historyDetailContent');
        const actualHistoryDetail = document.getElementById('actualHistoryDetail');
        const loadingHistoryDetailMessage = document.getElementById('loadingHistoryDetailMessage');
        const noHistoryDetailMessage = document.getElementById('noHistoryDetailMessage');
        const errorHistoryDetailMessage = document.getElementById('errorHistoryDetailMessage');

        // --- Referensi elemen DOM untuk Bagian Batik Terkait ---
        const relatedSectionTitle = document.getElementById('relatedSectionTitle');
        const relatedBatiksGrid = document.getElementById('relatedBatiksGrid');
        const loadingRelatedMessage = document.getElementById('loadingRelatedMessage');
        const noRelatedMessage = document.getElementById('noRelatedMessage');
        const errorRelatedMessage = document.getElementById('errorRelatedMessage');
        
        // --- Helper Function untuk Mengatur Tampilan Pesan Status & Konten ---
        const hideAllHistoryDetailMessages = () => {
            if (loadingHistoryDetailMessage) loadingHistoryDetailMessage.style.display = 'none';
            if (noHistoryDetailMessage) noHistoryDetailMessage.style.display = 'none';
            if (errorHistoryDetailMessage) errorHistoryDetailMessage.style.display = 'none';
            if (actualHistoryDetail) actualHistoryDetail.style.display = 'none';
        };

        const hideAllRelatedMessages = () => {
            if (loadingRelatedMessage) loadingRelatedMessage.style.display = 'none';
            if (noRelatedMessage) noRelatedMessage.style.display = 'none';
            if (errorRelatedMessage) errorRelatedMessage.style.display = 'none';
            if (relatedBatiksGrid) relatedBatiksGrid.innerHTML = ''; // Kosongkan grid sebelum mengisi
            if (relatedSectionTitle) relatedSectionTitle.style.display = 'none'; // Sembunyikan judul bagian terkait
        };

        // --- Inisialisasi Tampilan: Sembunyikan Semua Pesan dan Konten di Awal ---
        hideAllHistoryDetailMessages();
        hideAllRelatedMessages();

        // --- Penanganan jika ID Riwayat tidak ada di URL ---
        if (!historyId) {
            hideAllHistoryDetailMessages();
            if (noHistoryDetailMessage) {
                noHistoryDetailMessage.style.display = 'block';
                noHistoryDetailMessage.textContent = 'ID riwayat tidak ditemukan di URL.';
            }
            return; // Hentikan eksekusi lebih lanjut
        }

        // --- Fetch Detail Riwayat Utama ---
        if (loadingHistoryDetailMessage) loadingHistoryDetailMessage.style.display = 'block';
        let historyData = null;

        try {
            // Panggil API untuk mendapatkan detail riwayat berdasarkan ID
            const detailResult = await BatikApi.getHistoryDetail(historyId); 

            if (loadingHistoryDetailMessage) loadingHistoryDetailMessage.style.display = 'none'; // Sembunyikan loading setelah respons

            // API respons Anda memiliki { status: true, message: "...", data: [...] }
            // Namun, getHistoryDetail di BatikApi mengembalikan { success: true, data: data.data || data }
            // Jika data adalah array tunggal (seperti di contoh), kita perlu mengakses elemen pertama.
            // Asumsi: API history detail akan mengembalikan objek tunggal, BUKAN array.
            // Jika API benar-benar mengembalikan array tunggal, kita perlu detailResult.data[0]
            // Saya akan asumsikan API history detail akan mengembalikan objek tunggal.
            
            if (detailResult.success && detailResult.data) {
                // Jika detailResult.data adalah array tunggal, ambil elemen pertamanya
                historyData = Array.isArray(detailResult.data) ? detailResult.data[0] : detailResult.data;
                
                // Pastikan historyData bukan null atau undefined setelah penyesuaian
                if (!historyData) {
                    hideAllHistoryDetailMessages();
                    if (noHistoryDetailMessage) {
                        noHistoryDetailMessage.style.display = 'block';
                        noHistoryDetailMessage.textContent = 'Data detail riwayat tidak ditemukan.';
                    }
                    console.error('HistoryDetail: Data riwayat kosong setelah fetch.');
                    return;
                }

                // --- SESUAIKAN DENGAN STRUKTUR RESPONS API ANDA ---
                const scannedImageUrl = historyData.image_url || placeholderImage; // Dulu 'scanned_image_url'
                const motifName = historyData.motif_name || 'Tidak Dikenal';
                const provinsi = historyData.provinsi || 'Tidak Diketahui';
                const description = historyData.description || 'Deskripsi tidak tersedia.'; // Menambahkan deskripsi
                const occasion = historyData.occasion || null; // Menambahkan occasion
                
                const confidence = historyData.confidence_score ? `${historyData.confidence_score.toFixed(2)}%` : 'N/A'; // Dulu 'confidence'
                const scannedAt = historyData.created_at ? new Date(historyData.created_at).toLocaleString('id-ID', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : 'Tanggal tidak tersedia'; // Dulu 'created_at', format tanggal Indonesia
                const motifId = historyData.motif_id; // ID motif batik terkait

                if (actualHistoryDetail) {
                    actualHistoryDetail.innerHTML = `
                        <div class="main-batik-info"> <img src="${scannedImageUrl}" alt="Batik di-scan" class="main-batik-image">
                            <h1>${motifName}</h1>
                            <p>${description}</p>
                            <p><strong>Provinsi:</strong> ${provinsi}</p>
                            <p><strong>Tingkat Akurasi:</strong> ${confidence}</p>
                            <p><strong>Waktu Scan:</strong> ${scannedAt}</p>
                            ${occasion ? `<p><strong>Saran Penggunaan:</strong> ${occasion}</p>` : ''}
                            <p><a href="#/history" class="view-detail-link">Kembali</a></p>
                        </div>
                    `;
                    actualHistoryDetail.style.display = 'block'; // Tampilkan konten detail
                }
                console.log('HistoryDetail: Detail riwayat berhasil dimuat:', historyData);

                // --- Panggil fungsi untuk menampilkan batik terkait dari provinsi yang sama (jika ada motif_id & provinsi) ---
                if (motifId && provinsi) { 
                    // Pastikan motifId yang dilewatkan ke _fetchBatiksByProvince adalah ID motif batik, bukan ID riwayat
                    await this._fetchBatiksByProvince(provinsi, motifId); 
                } else {
                    console.warn('HistoryDetail: Motif ID atau Provinsi tidak ditemukan dari data riwayat, tidak dapat memuat batik serupa berdasarkan provinsi.');
                    if (noRelatedMessage) {
                        noRelatedMessage.style.display = 'block';
                        noRelatedMessage.textContent = 'Tidak ada batik serupa yang dapat ditampilkan.';
                    }
                }

            } else {
                hideAllHistoryDetailMessages();
                if (noHistoryDetailMessage) {
                    noHistoryDetailMessage.style.display = 'block';
                    noHistoryDetailMessage.textContent = detailResult.message || 'Gagal memuat detail riwayat.';
                }
                console.error('HistoryDetail: Gagal memuat detail riwayat. Pesan:', detailResult.message);
                return;
            }
        } catch (error) {
            console.error('HistoryDetail: Error fetching history detail:', error);
            hideAllHistoryDetailMessages();
            if (errorHistoryDetailMessage) {
                errorHistoryDetailMessage.style.display = 'block';
                errorHistoryDetailMessage.textContent = `Terjadi kesalahan jaringan: ${error.message || 'Mohon coba lagi.'}`;
            }
            return;
        }

        console.log('HistoryDetail: Halaman selesai dirender.');
    },

    // --- Fungsi untuk mengambil dan menampilkan batik berdasarkan provinsi (MIRIP DARI BATIKDETAIL.JS) ---
    async _fetchBatiksByProvince(provinceName, currentMotifId) { // Menggunakan currentMotifId
        const relatedSectionTitle = document.getElementById('relatedSectionTitle');
        const relatedBatiksGrid = document.getElementById('relatedBatiksGrid');
        const loadingRelatedMessage = document.getElementById('loadingRelatedMessage');
        const noRelatedMessage = document.getElementById('noRelatedMessage');
        const errorRelatedMessage = document.getElementById('errorRelatedMessage');

        const hideAllRelatedMessages = () => {
            if (loadingRelatedMessage) loadingRelatedMessage.style.display = 'none';
            if (noRelatedMessage) noRelatedMessage.style.display = 'none';
            if (errorRelatedMessage) errorRelatedMessage.style.display = 'none';
            if (relatedBatiksGrid) relatedBatiksGrid.innerHTML = '';
            if (relatedSectionTitle) relatedSectionTitle.style.display = 'none';
        };

        hideAllRelatedMessages();
        
        if (loadingRelatedMessage) {
            loadingRelatedMessage.style.display = 'block';
            loadingRelatedMessage.textContent = `Memuat batik lainnya dari ${provinceName}...`;
        }
        if (relatedSectionTitle) {
            relatedSectionTitle.textContent = `Batik Lainnya dari ${provinceName}`;
            relatedSectionTitle.style.display = 'block';
        }

        try {
            const allMotifsResult = await BatikApi.getMotifsGroupedByProvince();

            hideAllRelatedMessages();

            if (allMotifsResult.success && allMotifsResult.data) {
                const groupedMotifs = allMotifsResult.data;
                const batiksInSameProvince = groupedMotifs[provinceName] || [];

                // Filter keluar motif batik yang sedang dilihat dari riwayat (berdasarkan motif_id)
                const filteredBatiks = batiksInSameProvince.filter(batik => 
                    (batik.motif_id || batik.id) !== currentMotifId
                );

                if (filteredBatiks.length > 0) {
                    if (relatedBatiksGrid) {
                        filteredBatiks.slice(0, 4).forEach(batik => { // Ambil 4 batik saja
                            // Sesuaikan properti motif batik yang dikembalikan dari API /api/motif/group/provinsi
                            const imageUrl = batik.link_image || batik.imageUrl || placeholderImage;
                            const batikCard = document.createElement('div');
                            batikCard.className = 'batik-card';
                            batikCard.innerHTML = `
                                <img src="${imageUrl}" alt="${batik.name}" class="batik-image-placeholder">
                                <div class="batik-card-info">
                                    <h3><a href="#/batik/${batik.motif_id || batik.id}">${batik.name || 'Batik Tidak Dikenal'}</a></h3>
                                    <p>${batik.provinsi || 'Provinsi tidak diketahui'}</p>
                                </div>
                            `;
                            relatedBatiksGrid.appendChild(batikCard);
                        });
                    }
                    console.log(`HistoryDetail: Batik lainnya dari ${provinceName} berhasil dimuat:`, filteredBatiks);
                } else {
                    if (noRelatedMessage) {
                        noRelatedMessage.style.display = 'block';
                        noRelatedMessage.textContent = `Tidak ada batik lain ditemukan dari ${provinceName}.`;
                    }
                    console.warn(`HistoryDetail: Tidak ada batik lain ditemukan dari ${provinceName}.`);
                }
            } else {
                if (noRelatedMessage) {
                    noRelatedMessage.style.display = 'block';
                    noRelatedMessage.textContent = allMotifsResult.message || `Gagal memuat motif berdasarkan provinsi.`;
                }
                console.error('HistoryDetail: Gagal memuat motif berdasarkan provinsi. Pesan:', allMotifsResult.message);
            }
        } catch (error) {
            console.error('HistoryDetail: Error fetching motifs grouped by province:', error);
            if (errorRelatedMessage) {
                errorRelatedMessage.style.display = 'block';
                errorRelatedMessage.textContent = `Terjadi kesalahan saat memuat batik lainnya: ${error.message || 'Mohon coba lagi.'}`;
            }
        }
    },
};

export default HistoryDetail;