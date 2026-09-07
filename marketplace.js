const searchInput = document.getElementById('marketSearch');
const typeFilter = document.getElementById('listingTypeFilter');
const locationFilter = document.getElementById('locationFilter');
const listingGrid = document.getElementById('listingGrid');
const noResults = document.getElementById('noResults');

const listingModal = document.getElementById('listingModal');
const actionModal = document.getElementById('actionModal');
const listingForm = document.getElementById('listingForm');
const newPlantType = document.getElementById('newPlantType');
const priceField = document.getElementById('priceField');
const exchangeField = document.getElementById('exchangeField');
const auctionFields = document.getElementById('auctionFields');
const saleAllowsExchange = document.getElementById('newSaleAllowsExchange');
const saleExchangePreferenceField = document.getElementById('saleExchangePreferenceField');

const actionEyebrow = document.getElementById('actionEyebrow');
const actionTitle = document.getElementById('actionModalTitle');
const actionText = document.getElementById('actionModalText');
const actionDetail = document.getElementById('actionDetail');

const SESSION_KEY = 'greenhubSessionV12';
const LISTINGS_KEY = 'greenhubMarketplaceListingsV124';

let newListingPhotoData = '';

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[character]));
}

function normalizeId(value) {
  return String(value || '').trim().toLowerCase();
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function getCurrentUser() {
  const session = getSession();
  if (session) return session;

  if (localStorage.getItem('greenhubLoggedIn') === 'true') {
    return {
      id: 'legacy-zacharias',
      username: 'zacharias',
      displayName: 'Zacharias',
      location: 'Larnaca'
    };
  }

  return null;
}

function getListings() {
  try {
    return JSON.parse(localStorage.getItem(LISTINGS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveListings(listings) {
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
}

/* =========================================================
   Marketplace account header
   ========================================================= */
function installMarketplaceAccountHeader() {
  const user = getCurrentUser();
  if (!user) return;

  const header = document.querySelector('.greenhub-header');
  const nav = header?.querySelector('nav');
  if (!header || !nav || document.getElementById('marketplaceAccountChip')) return;

  const style = document.createElement('style');
  style.textContent = `
    .marketplace-header-right{display:flex;align-items:center;gap:14px}
    .marketplace-account-chip{display:flex;align-items:center;gap:9px;min-width:170px;padding:7px 11px;border:1px solid #dfe8df;border-radius:16px;background:#fff;color:#17351f;text-decoration:none;box-shadow:0 6px 18px rgba(27,56,33,.05)}
    .marketplace-account-avatar{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:#edf4eb;font-size:17px;flex:0 0 auto}
    .marketplace-account-copy{display:grid;line-height:1.15}
    .marketplace-account-copy strong{color:#17351f;font-size:14px}
    .marketplace-account-copy small{margin-top:3px;color:#6b7b6c;font-size:11px}
    .marketplace-logout{min-height:40px;padding:0 16px;font-size:13px}
    .owner-listing-note{display:inline-flex;align-items:center;min-height:42px;padding:0 16px;border-radius:999px;background:#edf4eb;color:#315b36;font-size:13px;font-weight:800}
    .delete-own-listing{min-height:42px!important;padding:0 16px!important;background:#fff!important;color:#9b3d3d!important;border:1px solid #e5caca!important}
    .listing-uploaded-image{display:block;width:100%;height:100%;object-fit:cover}
    @media(max-width:900px){
      .marketplace-header-right{width:100%;align-items:flex-start;flex-wrap:wrap}
      .marketplace-header-right nav{width:100%}
    }
  `;
  document.head.appendChild(style);

  const wrapper = document.createElement('div');
  wrapper.className = 'marketplace-header-right';
  nav.parentNode.insertBefore(wrapper, nav);
  wrapper.appendChild(nav);

  const chip = document.createElement('a');
  chip.id = 'marketplaceAccountChip';
  chip.className = 'marketplace-account-chip';
  chip.href = 'greenhub/profile.html';
  chip.innerHTML = `
    <span class="marketplace-account-avatar">👤</span>
    <span class="marketplace-account-copy">
      <strong>${escapeHTML(user.displayName || user.username || 'Member')}</strong>
      <small>${escapeHTML(user.location || 'Cyprus')} · My account</small>
    </span>
  `;

  const logout = document.createElement('button');
  logout.type = 'button';
  logout.className = 'marketplace-logout';
  logout.textContent = 'Logout';
  logout.addEventListener('click', () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('greenhubLoggedIn');
    window.location.href = 'login.html';
  });

  wrapper.appendChild(chip);
  wrapper.appendChild(logout);
}

/* =========================================================
   Mandatory marketplace listing photo
   ========================================================= */
function installListingPhotoUploader() {
  if (document.getElementById('newPlantPhoto')) return;

  const style = document.createElement('style');
  style.textContent = `
    .listing-photo-block{display:grid;gap:9px}
    .listing-photo-label{color:#4e6552;font-size:13px;font-weight:800}
    .listing-photo-dropzone{display:flex!important;min-height:132px;flex-direction:column;align-items:center;justify-content:center;gap:7px;padding:20px;border:2px dashed #a8bea8!important;border-radius:18px;background:#f5f9f3;text-align:center;cursor:pointer}
    .listing-photo-dropzone:hover{background:#edf5eb;border-color:#315b36!important}
    .listing-photo-input{position:absolute;width:1px!important;height:1px;opacity:0;pointer-events:none}
    .listing-photo-icon{font-size:30px}
    .listing-photo-dropzone strong{color:#264d2e;font-size:17px}
    .listing-photo-help{max-width:430px;color:#657565;font-size:12px;line-height:1.4}
    .listing-photo-preview{display:block;width:100%;max-height:300px;object-fit:contain;border:1px solid #dfe8dd;border-radius:16px;background:#f3f6f1}
    .listing-photo-status{padding:9px 11px;border-radius:11px;background:#edf5eb;color:#315b36;font-size:12px;font-weight:700}
  `;
  document.head.appendChild(style);

  const block = document.createElement('div');
  block.className = 'listing-photo-block';
  block.innerHTML = `
    <span class="listing-photo-label">Plant photo <strong>*required</strong></span>
    <label class="listing-photo-dropzone" for="newPlantPhoto">
      <input id="newPlantPhoto" class="listing-photo-input" type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*">
      <span class="listing-photo-icon">📷</span>
      <strong id="newPlantPhotoTitle">Add plant photo</strong>
      <span class="listing-photo-help" id="newPlantPhotoHelp">
        Click to choose a photo. A listing cannot be previewed without one.
      </span>
    </label>
    <img id="newPlantPhotoPreview" class="listing-photo-preview hidden" alt="Plant photo preview">
    <div id="newPlantPhotoStatus" class="listing-photo-status hidden"></div>
  `;

  const firstField = document.getElementById('newPlantName')?.closest('label');
  listingForm.insertBefore(block, firstField || listingForm.firstChild);

  document.getElementById('newPlantPhoto').addEventListener('change', handleListingPhoto);
}

function compressListingPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('The photo could not be read.'));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error('This photo format could not be previewed. Try JPG or PNG.'));
      image.onload = () => {
        let width = image.width;
        let height = image.height;

        if (!width || !height) {
          reject(new Error('Invalid image.'));
          return;
        }

        const maxDimension = 1000;
        const scale = Math.min(1, maxDimension / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

async function handleListingPhoto() {
  const input = document.getElementById('newPlantPhoto');
  const preview = document.getElementById('newPlantPhotoPreview');
  const status = document.getElementById('newPlantPhotoStatus');
  const title = document.getElementById('newPlantPhotoTitle');
  const help = document.getElementById('newPlantPhotoHelp');

  const file = input.files[0];
  newListingPhotoData = '';

  preview.classList.add('hidden');
  status.classList.add('hidden');

  if (!file) return;

  title.textContent = 'Processing photo…';
  help.textContent = file.name;

  try {
    newListingPhotoData = await compressListingPhoto(file);
    preview.src = newListingPhotoData;
    preview.classList.remove('hidden');
    status.textContent = `Photo selected: ${file.name}`;
    status.classList.remove('hidden');
    title.textContent = 'Photo ready';
    help.textContent = 'This preview will be used on the marketplace card.';
  } catch (error) {
    input.value = '';
    title.textContent = 'Add plant photo';
    help.textContent = error.message || 'Could not load that photo.';
  }
}

function resetListingPhoto() {
  newListingPhotoData = '';

  const input = document.getElementById('newPlantPhoto');
  const preview = document.getElementById('newPlantPhotoPreview');
  const status = document.getElementById('newPlantPhotoStatus');
  const title = document.getElementById('newPlantPhotoTitle');
  const help = document.getElementById('newPlantPhotoHelp');

  if (input) input.value = '';
  if (preview) {
    preview.src = '';
    preview.classList.add('hidden');
  }
  if (status) {
    status.textContent = '';
    status.classList.add('hidden');
  }
  if (title) title.textContent = 'Add plant photo';
  if (help) help.textContent = 'Click to choose a photo. A listing cannot be previewed without one.';
}

/* =========================================================
   Filters
   ========================================================= */
function filterListings() {
  const query = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;
  const location = locationFilter.value;
  let visibleCount = 0;

  document.querySelectorAll('.plant-listing').forEach((card) => {
    const name = (card.dataset.name || '').toLowerCase();
    const cardType = card.dataset.type || '';
    const cardLocation = card.dataset.location || '';

    const searchMatch = !query || name.includes(query) || cardLocation.toLowerCase().includes(query);
    const cardTypes = cardType.split(/\s+/).filter(Boolean);
    const typeMatch = type === 'all' || cardTypes.includes(type);
    const locationMatch = location === 'all' || cardLocation === location;

    const show = searchMatch && typeMatch && locationMatch;
    card.classList.toggle('hidden', !show);
    if (show) visibleCount += 1;
  });

  noResults.classList.toggle('hidden', visibleCount !== 0);
}

searchInput.addEventListener('input', filterListings);
typeFilter.addEventListener('change', filterListings);
locationFilter.addEventListener('change', filterListings);

/* =========================================================
   Dynamic listing fields
   ========================================================= */
function updateListingFields() {
  const type = newPlantType.value;
  priceField.classList.toggle('hidden', type !== 'sale');
  exchangeField.classList.toggle('hidden', type !== 'exchange');
  auctionFields.classList.toggle('hidden', type !== 'auction');
  saleExchangePreferenceField.classList.toggle('hidden', type !== 'sale' || !saleAllowsExchange.checked);
}

saleAllowsExchange.addEventListener('change', updateListingFields);
newPlantType.addEventListener('change', updateListingFields);

/* =========================================================
   Modals/actions
   ========================================================= */
function openListingModal() {
  listingModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  updateListingFields();
  document.getElementById('newPlantName').focus();
}

function closeListingModal() {
  listingModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

['openListingButton', 'openListingButton2', 'openListingButton3'].forEach((id) => {
  const button = document.getElementById(id);
  if (button) button.addEventListener('click', openListingModal);
});

document.querySelectorAll('[data-close-modal]').forEach((button) => {
  button.addEventListener('click', closeListingModal);
});

function openActionModal(mode, plant, detail1 = '', detail2 = '', seller = '') {
  actionDetail.classList.add('hidden');
  actionDetail.innerHTML = '';

  if (mode === 'buy') {
    actionEyebrow.textContent = 'Direct sale';
    actionTitle.textContent = `Contact seller about ${plant}`;
    actionText.textContent = `${plant}${detail1 ? ` is listed at ${detail1}` : ''}${seller ? ` by ${seller}` : ''}. This simulates the buyer initiating a C2C purchase.`;
  }

  if (mode === 'exchange') {
    actionEyebrow.textContent = 'Plant exchange';
    actionTitle.textContent = `Offer an exchange for ${plant}`;
    actionText.textContent = `Select one of your own already-listed plants and send it${seller ? ` to ${seller}` : ''} as an exchange proposal for ${plant}.`;
    actionDetail.classList.remove('hidden');
    actionDetail.innerHTML = '<strong>Exchange rule</strong><p>The exchange is confirmed only after both members approve the plant-for-plant proposal.</p>';
  }

  if (mode === 'auction') {
    actionEyebrow.textContent = 'Plant auction';
    actionTitle.textContent = `Bid for ${plant}`;
    actionText.textContent = `This auction${seller ? ` from ${seller}` : ''} starts at ${detail1 || 'the seller’s minimum price'} and remains open for ${detail2 || '7 days'}.`;
    actionDetail.classList.remove('hidden');
    actionDetail.innerHTML = '<strong>Auction rule</strong><p>The prototype does not yet store bids or run a live countdown.</p>';
  }

  actionModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeActionModal() {
  actionModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function wireCardActions(root = document) {
  root.querySelectorAll('.buy-button, .demo-created-buy').forEach((button) => {
    if (button.dataset.wired) return;
    button.dataset.wired = 'true';
    button.addEventListener('click', () => {
      openActionModal(
        'buy',
        button.dataset.plant,
        button.dataset.price,
        '',
        button.dataset.owner || ''
      );
    });
  });

  root.querySelectorAll('.exchange-button, .demo-created-exchange').forEach((button) => {
    if (button.dataset.wired) return;
    button.dataset.wired = 'true';
    button.addEventListener('click', () => {
      openActionModal(
        'exchange',
        button.dataset.plant,
        '',
        '',
        button.dataset.owner || ''
      );
    });
  });

  root.querySelectorAll('.auction-button, .demo-created-auction').forEach((button) => {
    if (button.dataset.wired) return;
    button.dataset.wired = 'true';
    button.addEventListener('click', () => {
      openActionModal(
        'auction',
        button.dataset.plant,
        button.dataset.minimum,
        button.dataset.timeframe,
        button.dataset.owner || ''
      );
    });
  });

  root.querySelectorAll('.delete-own-listing').forEach((button) => {
    if (button.dataset.wired) return;
    button.dataset.wired = 'true';
    button.addEventListener('click', () => {
      deleteOwnListing(button.dataset.listingId);
    });
  });
}

document.querySelectorAll('[data-close-action]').forEach((button) => {
  button.addEventListener('click', closeActionModal);
});

listingModal.addEventListener('click', (event) => {
  if (event.target === listingModal) closeListingModal();
});

actionModal.addEventListener('click', (event) => {
  if (event.target === actionModal) closeActionModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeListingModal();
    closeActionModal();
  }
});

/* =========================================================
   Persistent account-owned listings
   ========================================================= */
function renderPersistentListing(listing) {
  if (!listingGrid) return;

  const currentUser = getCurrentUser();
  const isOwner = normalizeId(currentUser?.id) === normalizeId(listing.ownerId);

  const article = document.createElement('article');
  article.className = 'plant-listing';
  article.dataset.persistentUserListing = 'true';
  article.dataset.listingId = listing.id;
  article.dataset.name = `${listing.name || ''}`;
  article.dataset.type = listing.type === 'sale' && listing.allowsExchange
    ? 'sale exchange'
    : listing.type;
  article.dataset.location = listing.location || '';

  let badge = '';
  let facts = '';
  let actions = '';

  if (listing.type === 'sale') {
    badge = `<span class="listing-badge sale-badge">Direct sale · €${Number(listing.price)}</span>${listing.allowsExchange ? '<span class="listing-badge exchange-badge">Exchange open</span>' : ''}`;
    facts = `
      <div><dt>Size</dt><dd>${escapeHTML(listing.size || 'Not specified')}</dd></div>
      <div><dt>Location</dt><dd>${escapeHTML(listing.location || 'Cyprus')}</dd></div>
      <div><dt>Seller</dt><dd>${escapeHTML(listing.ownerName || 'GreenHub member')}</dd></div>`;

    actions = isOwner
      ? `<span class="owner-listing-note">Your listing</span>
         <button class="delete-own-listing" type="button" data-listing-id="${listing.id}">Delete listing</button>`
      : `<button class="primary-button buy-button" type="button"
           data-plant="${escapeHTML(listing.name)}"
           data-price="€${Number(listing.price)}"
           data-owner="${escapeHTML(listing.ownerName || '')}">Buy / Contact</button>
         ${listing.allowsExchange ? `<button class="secondary-action exchange-button" type="button"
           data-plant="${escapeHTML(listing.name)}"
           data-owner="${escapeHTML(listing.ownerName || '')}">Offer listed plant</button>` : ''}`;
  }

  if (listing.type === 'exchange') {
    badge = '<span class="listing-badge exchange-badge">Exchange</span>';
    facts = `
      <div><dt>Size</dt><dd>${escapeHTML(listing.size || 'Not specified')}</dd></div>
      <div><dt>Location</dt><dd>${escapeHTML(listing.location || 'Cyprus')}</dd></div>
      <div><dt>Seller</dt><dd>${escapeHTML(listing.ownerName || 'GreenHub member')}</dd></div>`;

    actions = isOwner
      ? `<span class="owner-listing-note">Your listing</span>
         <button class="delete-own-listing" type="button" data-listing-id="${listing.id}">Delete listing</button>`
      : `<button class="secondary-action exchange-button" type="button"
           data-plant="${escapeHTML(listing.name)}"
           data-owner="${escapeHTML(listing.ownerName || '')}">Offer listed plant</button>`;
  }

  if (listing.type === 'auction') {
    badge = `<span class="listing-badge auction-badge">Auction · from €${Number(listing.auctionMinimum)}</span>`;
    facts = `
      <div><dt>Minimum bid</dt><dd>€${Number(listing.auctionMinimum)}</dd></div>
      <div><dt>Location</dt><dd>${escapeHTML(listing.location || 'Cyprus')}</dd></div>
      <div><dt>Duration</dt><dd>7 days</dd></div>`;

    actions = isOwner
      ? `<span class="owner-listing-note">Your auction</span>
         <button class="delete-own-listing" type="button" data-listing-id="${listing.id}">Delete listing</button>`
      : `<button class="primary-button auction-button" type="button"
           data-plant="${escapeHTML(listing.name)}"
           data-minimum="€${Number(listing.auctionMinimum)}"
           data-timeframe="7 days"
           data-owner="${escapeHTML(listing.ownerName || '')}">Place bid</button>`;
  }

  article.innerHTML = `
    <div class="listing-image">
      <img class="listing-uploaded-image" src="${listing.photo}" alt="${escapeHTML(listing.name)}">
      <div class="listing-badges">${badge}</div>
    </div>
    <div class="listing-body">
      <div class="listing-title-row">
        <div>
          <h3>${escapeHTML(listing.name)}</h3>
          <p class="latin-name">${isOwner ? 'Your marketplace listing' : 'GreenHub member listing'}</p>
        </div>
        <span class="condition-pill">${isOwner ? 'Owner' : 'Active'}</span>
      </div>
      <dl class="plant-facts">${facts}</dl>
      <p class="listing-description">${escapeHTML(listing.description || 'Community plant listing.')}</p>
      <div class="listing-actions">${actions}</div>
    </div>
  `;

  listingGrid.prepend(article);
  wireCardActions(article);
}

function renderPersistentListings() {
  document.querySelectorAll('[data-persistent-user-listing="true"]').forEach((card) => card.remove());
  getListings().forEach(renderPersistentListing);
  filterListings();
}

function deleteOwnListing(listingId) {
  const user = getCurrentUser();
  if (!user) return;

  const listings = getListings();
  const listing = listings.find((item) => item.id === listingId);

  if (!listing || normalizeId(listing.ownerId) !== normalizeId(user.id)) {
    alert('Only the listing owner can delete this listing.');
    return;
  }

  saveListings(listings.filter((item) => item.id !== listingId));
  renderPersistentListings();
}

/* =========================================================
   Create/persist new listing
   ========================================================= */
listingForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const user = getCurrentUser();
  if (!user) {
    alert('Please sign in before creating a marketplace listing.');
    return;
  }

  if (!newListingPhotoData) {
    alert('Please add a plant photo before previewing the listing.');
    document.getElementById('newPlantPhoto')?.click();
    return;
  }

  const name = document.getElementById('newPlantName').value.trim();
  const location = document.getElementById('newPlantLocation').value;
  const type = newPlantType.value;
  const price = document.getElementById('newPlantPrice').value.trim();
  const exchangePreference = document.getElementById('newExchangePreference').value.trim() || 'Open to suitable offers';
  const saleExchangePreference = document.getElementById('newSaleExchangePreference').value.trim() || 'Open to suitable offers';
  const allowsExchange = type === 'sale' && saleAllowsExchange.checked;
  const auctionMinimum = document.getElementById('newAuctionMinimum').value.trim();
  const size = document.getElementById('newPlantSize').value.trim() || 'Not specified';
  const description = document.getElementById('newPlantDescription').value.trim() || 'Community plant listing.';

  if (type === 'sale' && !price) {
    alert('Please enter a price for a direct-sale listing.');
    return;
  }

  if (type === 'auction' && !auctionMinimum) {
    alert('Please enter the minimum asked price for the auction.');
    return;
  }

  const listing = {
    id: `listing-${Date.now()}`,
    ownerId: user.id,
    ownerName: user.displayName || user.username || 'GreenHub member',
    ownerUsername: user.username || '',
    location,
    name,
    type,
    price,
    allowsExchange,
    exchangePreference: type === 'sale' ? saleExchangePreference : exchangePreference,
    auctionMinimum,
    auctionTimeframe: '7 days',
    size,
    description,
    photo: newListingPhotoData,
    createdAt: new Date().toISOString()
  };

  const listings = getListings();
  listings.push(listing);

  try {
    saveListings(listings);
  } catch {
    alert('Browser storage is full. Try a smaller photo or delete an older test listing.');
    return;
  }

  listingForm.reset();
  resetListingPhoto();
  saleAllowsExchange.checked = false;
  newPlantType.value = 'sale';
  updateListingFields();
  closeListingModal();

  renderPersistentListings();

  const newCard = document.querySelector(`[data-listing-id="${listing.id}"]`);
  if (newCard) {
    newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

/* =========================================================
   Initial setup
   ========================================================= */
installMarketplaceAccountHeader();
installListingPhotoUploader();
updateListingFields();
wireCardActions();
renderPersistentListings();
