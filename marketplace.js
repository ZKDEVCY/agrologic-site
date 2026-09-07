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

function filterListings() {
  const query = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;
  const location = locationFilter.value;
  let visibleCount = 0;

  document.querySelectorAll('.plant-listing').forEach((card) => {
    const name = card.dataset.name.toLowerCase();
    const cardType = card.dataset.type;
    const cardLocation = card.dataset.location;
    const searchMatch = !query || name.includes(query) || cardLocation.toLowerCase().includes(query);
    const cardTypes = cardType.split(/\s+/);
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

function updateListingFields() {
  const type = newPlantType.value;
  priceField.classList.toggle('hidden', type !== 'sale');
  exchangeField.classList.toggle('hidden', type !== 'exchange');
  auctionFields.classList.toggle('hidden', type !== 'auction');
  saleExchangePreferenceField.classList.toggle('hidden', type !== 'sale' || !saleAllowsExchange.checked);
}

saleAllowsExchange.addEventListener('change', updateListingFields);

newPlantType.addEventListener('change', updateListingFields);
updateListingFields();

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
  document.getElementById(id).addEventListener('click', openListingModal);
});

document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeListingModal));

function openActionModal(mode, plant, detail1 = '', detail2 = '') {
  actionDetail.classList.add('hidden');
  actionDetail.innerHTML = '';

  if (mode === 'buy') {
    actionEyebrow.textContent = 'Direct sale';
    actionTitle.textContent = `Contact seller about ${plant}`;
    actionText.textContent = `${plant}${detail1 ? ` is listed at ${detail1}` : ''}. GreenHub does not deduct a transaction fee; marketplace access is covered by membership.`;
  }

  if (mode === 'exchange') {
    actionEyebrow.textContent = 'Plant exchange';
    actionTitle.textContent = `Offer an exchange for ${plant}`;
    actionText.textContent = `Select one of your own plants that is already listed on GreenHub and send it as an exchange proposal to the owner of ${plant}.`;
    actionDetail.classList.remove('hidden');
    actionDetail.innerHTML = '<strong>Exchange rule</strong><p>The exchange is only confirmed after both members approve the proposed plant-for-plant transaction.</p>';
  }

  if (mode === 'auction') {
    actionEyebrow.textContent = 'Plant auction';
    actionTitle.textContent = `Bid for ${plant}`;
    actionText.textContent = `This auction starts at ${detail1 || 'the seller’s minimum price'} and remains open for ${detail2 || '7 days'}.`;
    actionDetail.classList.remove('hidden');
    actionDetail.innerHTML = '<strong>Auction rule</strong><p>Members may place bids while the auction is active. The prototype does not yet store bids or run a live countdown.</p>';
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
    button.addEventListener('click', () => openActionModal('buy', button.dataset.plant, button.dataset.price));
  });

  root.querySelectorAll('.exchange-button, .demo-created-exchange').forEach((button) => {
    if (button.dataset.wired) return;
    button.dataset.wired = 'true';
    button.addEventListener('click', () => openActionModal('exchange', button.dataset.plant));
  });

  root.querySelectorAll('.auction-button, .demo-created-auction').forEach((button) => {
    if (button.dataset.wired) return;
    button.dataset.wired = 'true';
    button.addEventListener('click', () => openActionModal('auction', button.dataset.plant, button.dataset.minimum, button.dataset.timeframe));
  });
}

wireCardActions();

document.querySelectorAll('[data-close-action]').forEach((button) => button.addEventListener('click', closeActionModal));
listingModal.addEventListener('click', (event) => { if (event.target === listingModal) closeListingModal(); });
actionModal.addEventListener('click', (event) => { if (event.target === actionModal) closeActionModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeListingModal(); closeActionModal(); } });

listingForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('newPlantName').value.trim();
  const location = document.getElementById('newPlantLocation').value;
  const type = newPlantType.value;
  const price = document.getElementById('newPlantPrice').value.trim();
  const exchangePreference = document.getElementById('newExchangePreference').value.trim() || 'Open to suitable offers';
  const saleExchangePreference = document.getElementById('newSaleExchangePreference').value.trim() || 'Open to suitable offers';
  const allowsExchange = type === 'sale' && saleAllowsExchange.checked;
  const auctionMinimum = document.getElementById('newAuctionMinimum').value.trim();
  const auctionTimeframe = '7 days';
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

  const article = document.createElement('article');
  article.className = 'plant-listing';
  article.dataset.name = name;
  article.dataset.type = type === 'sale' && allowsExchange ? 'sale exchange' : type;
  article.dataset.location = location;

  let badge = '';
  let facts = '';
  let action = '';

  if (type === 'sale') {
    badge = `<span class="listing-badge sale-badge">Direct sale · €${Number(price)}</span>${allowsExchange ? '<span class="listing-badge exchange-badge">Exchange open</span>' : ''}`;
    facts = `<div><dt>Size</dt><dd>${escapeHTML(size)}</dd></div><div><dt>Location</dt><dd>${escapeHTML(location)}</dd></div><div><dt>${allowsExchange ? 'Exchange for' : 'Price'}</dt><dd>${allowsExchange ? escapeHTML(saleExchangePreference) : `€${Number(price)}`}</dd></div>`;
    action = `<button class="primary-button demo-created-buy" type="button" data-plant="${escapeHTML(name)}" data-price="€${Number(price)}">Buy / Contact</button>${allowsExchange ? `<button class="secondary-action demo-created-exchange" type="button" data-plant="${escapeHTML(name)}">Offer listed plant</button>` : ''}`;
  }

  if (type === 'exchange') {
    badge = '<span class="listing-badge exchange-badge">Exchange</span>';
    facts = `<div><dt>Size</dt><dd>${escapeHTML(size)}</dd></div><div><dt>Location</dt><dd>${escapeHTML(location)}</dd></div><div><dt>Exchange for</dt><dd>${escapeHTML(exchangePreference)}</dd></div>`;
    action = `<button class="secondary-action demo-created-exchange" type="button" data-plant="${escapeHTML(name)}">Offer listed plant</button>`;
  }

  if (type === 'auction') {
    badge = `<span class="listing-badge auction-badge">Auction · from €${Number(auctionMinimum)}</span>`;
    facts = `<div><dt>Minimum bid</dt><dd>€${Number(auctionMinimum)}</dd></div><div><dt>Location</dt><dd>${escapeHTML(location)}</dd></div><div><dt>Closes</dt><dd>${escapeHTML(auctionTimeframe)}</dd></div>`;
    action = `<button class="primary-button demo-created-auction" type="button" data-plant="${escapeHTML(name)}" data-minimum="€${Number(auctionMinimum)}" data-timeframe="${escapeHTML(auctionTimeframe)}">Place bid</button>`;
  }

  article.innerHTML = `
    <div class="listing-image emoji-plant" aria-label="New plant listing placeholder">🪴<div class="listing-badges">${badge}</div></div>
    <div class="listing-body">
      <div class="listing-title-row"><div><h3>${escapeHTML(name)}</h3><p class="latin-name">New community listing</p></div><span class="condition-pill">Seller listing</span></div>
      <dl class="plant-facts">${facts}</dl>
      <p class="listing-description">${escapeHTML(description)}</p>
      <div class="listing-actions">${action}</div>
    </div>`;

  listingGrid.prepend(article);
  wireCardActions(article);
  listingForm.reset();
  saleAllowsExchange.checked = false;
  newPlantType.value = 'sale';
  updateListingFields();
  closeListingModal();
  filterListings();
  article.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}
