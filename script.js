(() => {
  "use strict";

  const STORAGE_KEY = "tja_products_v1";
  const ADMIN_PIN = "2026"; // PIN client-side, bukan autentikasi server.

  const BRANCHES = {
    utama: {
      label: "Cabang Utama — Gampeng",
      phone: "6285708830108",
      address: "Jln Raya Kediri-Kertosono Km. 4, Kecamatan Gampeng, Kab. Kediri"
    },
    keling: {
      label: "Cabang Desa Keling",
      phone: "6282228278397",
      address: "Desa Keling RT 07, RW 02"
    }
  };

  const DEFAULT_PRODUCTS = [
    { id: "telur-ayam", name: "Telur Ayam", description: "Telur ayam untuk kebutuhan rumah tangga, usaha, dan lembaga.", price: 0, unit: "Kg", image: "images/telur-ayam.jpg", icon: "🥚" },
    { id: "telur-puyuh", name: "Telur Puyuh", description: "Telur puyuh untuk konsumsi dan kebutuhan kuliner.", price: 0, unit: "Kg", image: "images/telur-puyuh.jpg", icon: "🥚" },
    { id: "beras", name: "Beras", description: "Pilihan bahan pangan yang dapat dipesan sesuai kebutuhan.", price: 0, unit: "Kg", image: "images/beras.jpg", icon: "🌾" },
    { id: "lainnya", name: "Lainnya", description: "Kebutuhan lain dapat ditulis secara khusus pada formulir.", price: 0, unit: "", image: "", icon: "📦" }
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function loadProducts() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : structuredClone(DEFAULT_PRODUCTS);
    } catch {
      return structuredClone(DEFAULT_PRODUCTS);
    }
  }

  function saveProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  function rupiah(value) {
    const n = Number(value);
    if (!n || n <= 0) return "Harga dikonfirmasi admin";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(n) + " / unit";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderProducts() {
    const products = loadProducts();
    const grid = $("#productGrid");
    const select = $("#product");

    grid.innerHTML = products.map(p => `
      <article class="product-card">
        <div class="product-image">
          ${p.image
            ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="product-placeholder" style="display:none">${escapeHtml(p.icon || "📦")}</span>`
            : `<span class="product-placeholder">${escapeHtml(p.icon || "📦")}</span>`}
        </div>
        <div class="product-content">
          <h3>${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.description)}</p>
          <div class="product-price">${escapeHtml(rupiah(p.price))}</div>
        </div>
      </article>
    `).join("");

    select.innerHTML = `
      <option value="">Pilih produk</option>
      ${products.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`).join("")}
    `;
  }

  function selectedProduct() {
    const products = loadProducts();
    return products.find(p => p.id === $("#product").value);
  }

  function updateConditionalFields() {
    const product = selectedProduct();
    const isEgg = product && ["telur-ayam", "telur-puyuh"].includes(product.id);
    const isOther = product && product.id === "lainnya";

    $("#eggConditionWrap").classList.toggle("hidden", !isEgg);
    $("#otherProductWrap").classList.toggle("hidden", !isOther);

    if (!isEgg) {
      $$('input[name="eggCondition"]').forEach(r => r.checked = false);
    }
    if (!isOther) $("#otherProduct").value = "";

    updateEstimate();
  }

  function updateEstimate() {
    const product = selectedProduct();
    const qty = Number($("#quantity").value);
    const unit = $("#unit").value;
    if (product && Number(product.price) > 0 && qty > 0) {
      const total = Number(product.price) * qty;
      $("#estimatePrice").textContent = `${rupiah(total).replace(" / unit", "")} (estimasi)`;
    } else {
      $("#estimatePrice").textContent = "Harga dikonfirmasi admin";
    }
    if (product?.unit && !unit) $("#unit").value = product.unit;
  }

  function getRadio(name) {
    return $(`input[name="${name}"]:checked`)?.value || "";
  }

  function setError(id, message) {
    const field = document.getElementById(id)?.closest(".field");
    const error = document.querySelector(`[data-error-for="${id}"]`);
    if (field) field.classList.toggle("invalid", Boolean(message));
    if (error) error.textContent = message || "";
  }

  function validateForm() {
    const data = {
      customerName: $("#customerName").value.trim(),
      address: $("#address").value.trim(),
      phone: $("#phone").value.trim(),
      branch: $("#branch").value,
      product: $("#product").value,
      otherProduct: $("#otherProduct").value.trim(),
      quantity: $("#quantity").value,
      unit: $("#unit").value,
      shipping: getRadio("shipping"),
      payment: getRadio("payment"),
      eggCondition: getRadio("eggCondition")
    };

    ["customerName","address","phone","branch","product","quantity","unit"].forEach(id => setError(id, ""));
    setError("otherProduct", "");
    setError("eggCondition", "");
    setError("shipping", "");
    setError("payment", "");

    let valid = true;

    if (!data.customerName) { setError("customerName", "Nama pemesan wajib diisi."); valid = false; }
    if (!data.address) { setError("address", "Alamat lengkap wajib diisi."); valid = false; }
    if (!/^[0-9+\\s()-]{8,20}$/.test(data.phone)) { setError("phone", "Masukkan nomor telepon/WA yang valid."); valid = false; }
    if (!data.branch) { setError("branch", "Pilih cabang tujuan."); valid = false; }
    if (!data.product) { setError("product", "Pilih barang utama."); valid = false; }
    if (!data.quantity || Number(data.quantity) <= 0) { setError("quantity", "Jumlah harus lebih dari 0."); valid = false; }
    if (!data.unit) { setError("unit", "Pilih satuan."); valid = false; }
    if (!data.shipping) { setError("shipping", "Pilih skema ongkir."); valid = false; }
    if (!data.payment) { setError("payment", "Pilih metode pembayaran."); valid = false; }

    const product = selectedProduct();
    if (product?.id === "lainnya" && !data.otherProduct) {
      setError("otherProduct", "Sebutkan nama produk."); valid = false;
    }
    if (["telur-ayam", "telur-puyuh"].includes(product?.id) && !data.eggCondition) {
      setError("eggCondition", "Pilih kondisi telur."); valid = false;
    }

    return { valid, data, product };
  }

  function formatWhatsAppMessage(data, product) {
    const branch = BRANCHES[data.branch];
    const productName = product?.id === "lainnya" ? data.otherProduct : product?.name;
    const condition = data.eggCondition ? `\\nKondisi telur: ${data.eggCondition}` : "";
    const company = data.companyName ? `\\nLembaga/Perusahaan: ${data.companyName}` : "";
    const notes = data.notes ? `\\nCatatan: ${data.notes}` : "";

    let estimate = "";
    if (product && Number(product.price) > 0) {
      const total = Number(product.price) * Number(data.quantity);
      estimate = `\\nEstimasi katalog: ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(total)} (belum termasuk ongkir bila berlaku)`;
    }

    return [
      "🐣 *PESANAN TELUR JAYA ABADI*",
      "",
      `Nama: ${data.customerName}`,
      company,
      `No. WA: ${data.phone}`,
      "",
      `Produk: ${productName || "-"}`,
      condition,
      `Jumlah: ${data.quantity} ${data.unit}`,
      `Ongkir: ${data.shipping}`,
      `Pembayaran: ${data.payment}`,
      "",
      `Alamat: ${data.address}`,
      `Cabang: ${branch.label}`,
      `Alamat cabang: ${branch.address}`,
      estimate,
      notes,
      "",
      "Mohon konfirmasi ketersediaan, harga akhir, ongkir, dan waktu pengiriman.",
      "Terima kasih — Telur Jaya Abadi."
    ].join("\\n");
  }

  function submitOrder(event) {
    event.preventDefault();
    const result = validateForm();
    if (!result.valid) {
      showToast("Mohon periksa data pesanan.");
      const firstInvalid = $(".field.invalid input, .field.invalid select, .field.invalid textarea");
      firstInvalid?.focus();
      return;
    }

    const data = {
      ...result.data,
      companyName: $("#companyName").value.trim(),
      notes: $("#notes").value.trim()
    };

    const message = formatWhatsAppMessage(data, result.product);
    const url = `https://wa.me/${BRANCHES[data.branch].phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function renderAdminProducts() {
    const products = loadProducts();
    const root = $("#adminProducts");
    root.innerHTML = products.map((p, index) => `
      <div class="admin-product" data-admin-id="${escapeHtml(p.id)}">
        <div class="admin-product-grid">
          <div>
            <img id="preview-${escapeHtml(p.id)}" src="${escapeHtml(p.image || "")}" alt="${escapeHtml(p.name)}" onerror="this.style.display='none'">
            <input class="image-file" type="file" accept="image/png,image/jpeg,image/webp" data-id="${escapeHtml(p.id)}" aria-label="Upload gambar ${escapeHtml(p.name)}">
          </div>
          <div>
            <label>Nama Produk<input class="admin-name" type="text" value="${escapeHtml(p.name)}"></label>
            <label style="margin-top:9px">Deskripsi<textarea class="admin-description" rows="3">${escapeHtml(p.description)}</textarea></label>
          </div>
          <div>
            <label>Harga per Satuan<input class="admin-price" type="number" min="0" step="100" value="${Number(p.price) || 0}"></label>
            <label style="margin-top:9px">Satuan Katalog<input class="admin-unit" type="text" value="${escapeHtml(p.unit || "")}" placeholder="Kg"></label>
            <div class="admin-actions">
              <button type="button" class="save-product">Simpan</button>
              <button type="button" class="delete-product" ${products.length <= 1 ? "disabled" : ""}>Hapus</button>
            </div>
          </div>
        </div>
      </div>
    `).join("");

    $$(".image-file", root).forEach(input => {
      input.addEventListener("change", handleImageUpload);
    });
    $$(".save-product", root).forEach(btn => {
      btn.addEventListener("click", () => saveAdminProduct(btn));
    });
    $$(".delete-product", root).forEach(btn => {
      btn.addEventListener("click", () => deleteAdminProduct(btn));
    });
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) {
      showToast("Gunakan JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > 1.8 * 1024 * 1024) {
      showToast("Ukuran gambar maksimal 1,8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const id = event.target.dataset.id;
      const products = loadProducts();
      const product = products.find(p => p.id === id);
      if (!product) return;
      product.image = reader.result;
      saveProducts(products);
      const preview = document.getElementById(`preview-${id}`);
      preview.src = reader.result;
      preview.style.display = "block";
      renderProducts();
      showToast("Gambar berhasil disimpan di browser ini.");
    };
    reader.readAsDataURL(file);
  }

  function saveAdminProduct(button) {
    const card = button.closest(".admin-product");
    const id = card.dataset.adminId;
    const products = loadProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    product.name = $(".admin-name", card).value.trim() || "Produk";
    product.description = $(".admin-description", card).value.trim();
    product.price = Number($(".admin-price", card).value) || 0;
    product.unit = $(".admin-unit", card).value.trim();

    saveProducts(products);
    renderProducts();
    renderAdminProducts();
    showToast("Produk berhasil disimpan.");
  }

  function deleteAdminProduct(button) {
    const card = button.closest(".admin-product");
    const id = card.dataset.adminId;
    const products = loadProducts();
    const target = products.find(p => p.id === id);
    if (!target) return;
    if (!confirm(`Hapus produk "${target.name}"?`)) return;
    saveProducts(products.filter(p => p.id !== id));
    renderProducts();
    renderAdminProducts();
    showToast("Produk dihapus.");
  }

  function addProduct() {
    const products = loadProducts();
    const id = `produk-${Date.now()}`;
    products.push({
      id,
      name: "Produk Baru",
      description: "Tambahkan deskripsi produk.",
      price: 0,
      unit: "Kg",
      image: "",
      icon: "📦"
    });
    saveProducts(products);
    renderProducts();
    renderAdminProducts();
    showToast("Produk baru ditambahkan.");
  }

  function resetProducts() {
    if (!confirm("Kembalikan katalog ke data default? Perubahan LocalStorage akan dihapus.")) return;
    saveProducts(structuredClone(DEFAULT_PRODUCTS));
    renderProducts();
    renderAdminProducts();
    showToast("Katalog dikembalikan.");
  }

  function openAdmin() {
    $("#adminPin").value = "";
    $("#adminLogin").classList.remove("hidden");
    $("#adminContent").classList.add("hidden");
    $("#adminModal").showModal();
  }

  function loginAdmin() {
    if ($("#adminPin").value === ADMIN_PIN) {
      $("#adminLogin").classList.add("hidden");
      $("#adminContent").classList.remove("hidden");
      renderAdminProducts();
    } else {
      showToast("PIN admin salah.");
    }
  }

  function initNavigation() {
    const toggle = $("#navToggle");
    const menu = $("#navMenu");
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    });
    $$("#navMenu a").forEach(a => a.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    initNavigation();

    $("#product").addEventListener("change", updateConditionalFields);
    $("#quantity").addEventListener("input", updateEstimate);
    $("#unit").addEventListener("change", updateEstimate);
    $("#orderForm").addEventListener("submit", submitOrder);

    $("#openAdmin").addEventListener("click", openAdmin);
    $("#closeAdmin").addEventListener("click", () => $("#adminModal").close());
    $("#loginAdmin").addEventListener("click", loginAdmin);
    $("#adminPin").addEventListener("keydown", e => { if (e.key === "Enter") loginAdmin(); });
    $("#addProduct").addEventListener("click", addProduct);
    $("#resetProducts").addEventListener("click", resetProducts);

    $("#year").textContent = new Date().getFullYear();

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && $("#adminModal").open) $("#adminModal").close();
    });
  });
})();
