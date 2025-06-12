const NotFound = {
  async render() {
    return `
      <section id="notFoundPage" class="page-section" style="text-align: center; padding: 50px;">
        <h2>404 - Halaman Tidak Ditemukan</h2>
        <p>Maaf, halaman yang Anda cari tidak ada.</p>
        <a href="#/" class="primary-button">Kembali ke Beranda</a>
      </section>
    `;
  },
  async afterRender() {
    document.querySelector('#notFoundPage a').addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '#/';
    });
  },
};
export default NotFound;