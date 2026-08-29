const searchInput = document.getElementById('marketSearch');
const typeFilter = document.getElementById('listingTypeFilter');
const locationFilter = document.getElementById('locationFilter');
const listingGrid = document.getElementById('listingGrid');
const noResults = document.getElementById('noResults');

const listingModal = document.getElementById('listingModal');
const actionModal = document.getElementById('actionModal');
const listingForm = document.getElementById('listingForm');

const actionEyebrow = document.getElementById('actionEyebrow');
const actionTitle = document.getElementById('actionModalTitle');
const actionText = document.getElementById('actionModalText');

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
    const typeMatch =
      type === 'all' ||
      cardType === type ||
      (type === 'sale' && cardType === 'both') ||
      (type === 'exchange' && cardType === 'both');
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

function openListingModal() {
  listingModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  document.getElementById('newPlantName').focus();
}

function closeListingModal() {
  listingModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

['openListingButton', 'openListingButton2', 'openListingButton3'].forEach((id) => {
  document.getElementById(id).addEventListener('click', openListingModal);
});

document.querySelectorAll('[data-close-modal]').forEach((button) => {
  button.addEventListener('click', closeListingModal);
});

function openActionModal(mode, plant, price = '') {
  if (mode === 'buy') {
    actionEyebrow.textContent = 'Direct sale';
    actionTitle.textContent = `Contact seller about ${plant}`;
    actionText.textContent = `${plant}${price ? ` is listed at ${price}` : ''}. In the production version, this step will open secure buyer–seller messaging and the transaction flow.`;
  } else {
    actionEyebrow.textContent = 'Plant exchange';
    actionTitle.textContent = `Offer an exchange for ${plant}`;
    actionText.textContent = `In the production version, you will select one of your own listed plants, add an optional message and send the exchange proposal to the owner of ${plant}.`;
  }

  actionModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeActionModal() {
  actionModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('.buy-button').forEach((button) => {
  button.addEventListener('click', () => {
    openActionModal('buy', button.dataset.plant, button.dataset.price);
  });
});

document.querySelectorAll('.exchange-button').forEach((button) => {
  button.addEventListener('click', () => {
    openActionModal('exchange', button.dataset.plant);
  });
});

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

listingForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('newPlantName').value.trim();
  const location = document.getElementById('newPlantLocation').value;
  const type = document.getElementById('newPlantType').value;
  const price = document.getElementById('newPlantPrice').value.trim();
  const size = document.getElementById('newPlantSize').value.trim() || 'Not specified';
  const description = document.getElementById('newPlantDescription').value.trim() || 'Community plant listing.';

  if ((type === 'sale' || type === 'both') && !price) {
    alert('Please enter a price for a sale listing.');
    return;
  }

  const article = document.createElement('article');
  article.className = 'plant-listing';
  article.dataset.name = name;
  article.dataset.type = type;
  article.dataset.location = location;

  const saleBadge = (type === 'sale' || type === 'both')
    ? `<span class="listing-badge sale-badge">€${Number(price)}</span>`
    : '';
  const exchangeBadge = (type === 'exchange' || type === 'both')
    ? `<span class="listing-badge exchange-badge">${type === 'exchange' ? 'Exchange only' : 'Exchange'}</span>`
    : '';

  const buyButton = (type === 'sale' || type === 'both')
    ? `<button class="primary-button demo-created-buy" type="button">Buy / Contact</button>`
    : '';
  const exchangeButton = (type === 'exchange' || type === 'both')
    ? `<button class="secondary-action demo-created-exchange" type="button">Offer exchange</button>`
    : '';

  article.innerHTML = `
    <div class="listing-image emoji-plant" aria-label="New plant listing placeholder">🪴
      <div class="listing-badges">${saleBadge}${exchangeBadge}</div>
    </div>
    <div class="listing-body">
      <div class="listing-title-row">
        <div><h3>${escapeHTML(name)}</h3><p class="latin-name">New community listing</p></div>
        <span class="condition-pill">Seller listing</span>
      </div>
      <dl class="plant-facts">
        <div><dt>Size</dt><dd>${escapeHTML(size)}</dd></div>
        <div><dt>Location</dt><dd>${escapeHTML(location)}</dd></div>
        <div><dt>Seller</dt><dd>You · preview</dd></div>
      </dl>
      <p class="listing-description">${escapeHTML(description)}</p>
      <div class="listing-actions">${buyButton}${exchangeButton}</div>
    </div>
  `;

  listingGrid.prepend(article);

  const createdBuy = article.querySelector('.demo-created-buy');
  if (createdBuy) {
    createdBuy.addEventListener('click', () => openActionModal('buy', name, price ? `€${Number(price)}` : ''));
  }

  const createdExchange = article.querySelector('.demo-created-exchange');
  if (createdExchange) {
    createdExchange.addEventListener('click', () => openActionModal('exchange', name));
  }

  listingForm.reset();
  closeListingModal();
  filterListings();
  article.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return map[character];
  });
}
