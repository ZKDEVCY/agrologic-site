const SESSION='greenhubSessionV12',PLANTS='greenhubPlantsV12';

const gs=()=>{try{return JSON.parse(localStorage.getItem(SESSION))}catch{return null}};
const ga=()=>{try{return JSON.parse(localStorage.getItem(PLANTS))||[]}catch{return[]}};
const uid=()=>gs()?.id||'legacy-zacharias';
const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

const plantGrid=document.getElementById('plantGrid');
const emptyPlants=document.getElementById('emptyPlants');
const plantModal=document.getElementById('plantModal');
const plantForm=document.getElementById('plantForm');
const plantPhoto=document.getElementById('plantPhoto');
const photoPreview=document.getElementById('photoPreview');
const photoSelectedInfo=document.getElementById('photoSelectedInfo');
const changePhotoButton=document.getElementById('changePhotoButton');
const photoUploadTitle=document.getElementById('photoUploadTitle');
const photoUploadHelp=document.getElementById('photoUploadHelp');
const plantFormMessage=document.getElementById('plantFormMessage');

function render(){
  const a=ga().filter(x=>x.ownerId===uid());
  emptyPlants.classList.toggle('hidden',a.length>0);
  plantGrid.innerHTML='';
  a.forEach(x=>{
    const c=document.createElement('article');
    c.className='plant-card user-plant-card';
    c.innerHTML=`<img class="user-plant-photo" src="${x.photo}" alt="${esc(x.name)}">
      <div>
        <p class="status ${x.ready?'market-ready':'draft-status'}">${x.ready?'Ready for marketplace':'Draft'}</p>
        <h2>${esc(x.name)}</h2>
        <p>${esc(x.species||'Plant profile')}</p>
      </div>
      <div class="plant-data">
        <span>Condition: ${esc(x.condition)}</span>
        <span>Size: ${esc(x.size||'Not specified')}</span>
        <span>Price: ${x.price?'€'+Number(x.price):'Not set'}</span>
        <span>Exchange: ${x.allowsExchange?esc(x.exchangePreference||'Open to offers'):'No'}</span>
      </div>
      <div class="plant-card-actions">
        <button class="secondary-button toggle-ready" type="button" data-id="${x.id}">${x.ready?'Move back to draft':'Mark ready for marketplace'}</button>
        <button class="text-danger delete-plant" type="button" data-id="${x.id}">Delete</button>
      </div>`;
    plantGrid.appendChild(c);
  });

  document.querySelectorAll('.toggle-ready').forEach(b=>b.onclick=()=>{
    const a=ga(),x=a.find(v=>v.id===b.dataset.id&&v.ownerId===uid());
    if(!x)return;
    if(!x.ready&&!x.price){alert('Add a sale price before marking ready.');return}
    x.ready=!x.ready;
    localStorage.setItem(PLANTS,JSON.stringify(a));
    render();
  });

  document.querySelectorAll('.delete-plant').forEach(b=>b.onclick=()=>{
    localStorage.setItem(PLANTS,JSON.stringify(ga().filter(v=>!(v.id===b.dataset.id&&v.ownerId===uid()))));
    render();
  });
}

function resetPhotoUI(){
  plantPhoto.value='';
  photoPreview.src='';
  delete photoPreview.dataset.compressed;
  photoPreview.classList.add('hidden');
  photoSelectedInfo.textContent='';
  photoSelectedInfo.classList.add('hidden');
  changePhotoButton.classList.add('hidden');
  photoUploadTitle.textContent='Choose plant photo';
  photoUploadHelp.textContent='Click here to browse your computer or phone. JPG, PNG, WEBP and normal phone photos are accepted.';
}

openAddPlant.onclick=()=>{
  plantModal.classList.remove('hidden');
  plantFormMessage.textContent='';
};
closePlantModal.onclick=()=>plantModal.classList.add('hidden');
plantModal.onclick=e=>{if(e.target===plantModal)plantModal.classList.add('hidden')};

plantAllowsExchange.onchange=()=>plantExchangePreferenceField.classList.toggle('hidden',!plantAllowsExchange.checked);

function compress(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>{
      const i=new Image();
      i.onload=()=>{
        let w=i.width,h=i.height;
        if(!w||!h){rej(new Error('Invalid image dimensions'));return}
        const s=Math.min(1,1200/Math.max(w,h));
        w=Math.round(w*s); h=Math.round(h*s);
        const c=document.createElement('canvas');
        c.width=w;c.height=h;
        const ctx=c.getContext('2d');
        ctx.drawImage(i,0,0,w,h);
        res(c.toDataURL('image/jpeg',0.78));
      };
      i.onerror=()=>rej(new Error('This image format could not be previewed by the browser.'));
      i.src=r.result;
    };
    r.onerror=()=>rej(new Error('The photo could not be read.'));
    r.readAsDataURL(file);
  });
}

async function handlePhoto(file){
  plantFormMessage.textContent='';
  if(!file)return;

  if(!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)){
    plantFormMessage.textContent='Please select an image file.';
    resetPhotoUI();
    return;
  }

  photoUploadTitle.textContent='Processing photo…';
  photoUploadHelp.textContent=file.name;

  try{
    const p=await compress(file);
    photoPreview.src=p;
    photoPreview.dataset.compressed=p;
    photoPreview.classList.remove('hidden');
    photoSelectedInfo.textContent=`Selected: ${file.name} · ${(file.size/1024/1024).toFixed(1)} MB`;
    photoSelectedInfo.classList.remove('hidden');
    changePhotoButton.classList.remove('hidden');
    photoUploadTitle.textContent='Photo selected';
    photoUploadHelp.textContent='Preview shown below. You can change it before saving.';
  }catch(err){
    resetPhotoUI();
    plantFormMessage.textContent=(err&&err.message) ? err.message : 'Could not load that photo. Try JPG or PNG.';
  }
}

plantPhoto.addEventListener('change',()=>handlePhoto(plantPhoto.files[0]));

changePhotoButton.addEventListener('click',()=>{
  plantPhoto.click();
});

plantForm.onsubmit=e=>{
  e.preventDefault();
  plantFormMessage.textContent='';

  const photo=photoPreview.dataset.compressed;
  const price=plantPrice.value.trim();

  if(!photo){
    plantFormMessage.textContent='Choose a plant photo first. You should see its preview before saving.';
    return;
  }
  if(plantReady.checked&&!price){
    plantFormMessage.textContent='Enter a sale price before marking ready.';
    return;
  }

  const s=gs(),a=ga();
  a.push({
    id:'plant-'+Date.now(),
    ownerId:uid(),
    ownerName:s?.displayName||'Zacharias',
    location:s?.location||'Larnaca',
    name:plantName.value.trim(),
    species:plantSpecies.value.trim(),
    size:plantSize.value.trim(),
    condition:plantCondition.value,
    description:plantDescription.value.trim(),
    price,
    allowsExchange:plantAllowsExchange.checked,
    exchangePreference:plantExchangePreference.value.trim(),
    ready:plantReady.checked,
    photo,
    createdAt:new Date().toISOString()
  });

  try{
    localStorage.setItem(PLANTS,JSON.stringify(a));
  }catch{
    plantFormMessage.textContent='Browser storage is full. Try a smaller photo or remove an older test plant.';
    return;
  }

  plantForm.reset();
  resetPhotoUI();
  plantExchangePreferenceField.classList.add('hidden');
  plantModal.classList.add('hidden');
  render();
};

render();