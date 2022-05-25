import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getDatabase, ref, set, get, child, remove } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js';
import { getStorage,ref as sRef, uploadBytesResumable } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js';

const firebaseConfig = {
    apiKey: 'AIzaSyCOA1n1sheweBjPSsnm4-pu-mi2oaQ_epo',
    authDomain: 'cardproduct-2c147.firebaseapp.com',
    databaseURL: 'https://cardproduct-2c147-default-rtdb.firebaseio.com/',
    projectId: 'cardproduct-2c147',
    storageBucket: 'cardproduct-2c147.appspot.com',
    messagingSenderId: '365024475312',
    appId: '1:365024475312:web:7d3efdfbaea77b35c7e375'
};

const storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/cardproduct-2c147.appspot.com/o/images%2F';
const storageSufix = '?alt=media&token=2c96d50f-263c-4a78-870e-c62396f03b27';
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);
const dbRef = ref(db);
let cardList, selectedBrands =  new Array;
let name, brand, price, submit, gridContainer, image, isAdmin, priceSlide;
init();

async function SyncCardList(){
    let auxCardList = await get(child(dbRef, 'cards/'));
    auxCardList = auxCardList.val();
    if(!cardList){
        cardList = auxCardList;
    }
    else{
        for(let i = 0; i < cardList.length; i++){
            set(ref(db, 'cards/' + i), {
                name: cardList[i].name,
                brand: cardList[i].brand,
                price: cardList[i].price,
                imageSrc: cardList[i].imageSrc,
            });
        }
    }
}
function init() {
    image = document.querySelector('.image');
    name = document.querySelector('.name');
    brand = document.querySelector('.brand');
    price = document.querySelector('.price');
    submit = document.querySelector('.add');
    gridContainer = document.querySelector('.grid');
    submit.addEventListener('click', validateForm);
    SyncCardList();
    get(child(dbRef, 'config/')).then((snapshot => {
        isAdmin = snapshot.val().isAdmin;
    })).then(() => {
        handleCategory();
        handleClick();
        handlePrice()
        if (cardList) render(selectedBrands, 20000);
    });
}
function handleCategory() {
    let brands = document.querySelectorAll('.brands');

    for (let i = 0; i < brands.length; i++) {
        brands[i].addEventListener('click', () => {
            if (brands[i].checked) {
                selectedBrands.push(brands[i].name);
            } else {
                for (let j = 0; j < selectedBrands.length; j++) {
                    if (selectedBrands[j] == brands[i].name) {
                        selectedBrands.splice(j, 1);
                    }
                }
            }
            loading();
        });
    }
}
function handleClick() {
    window.addEventListener('click', event => {
        if (event.target.classList.contains('fa-delete-left')) {
            Swal.fire({
                title: 'DESEJA REALMENTE EXCLUIR?',
                text: "Você não poderá desfazer essa ação",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, deletar'
              }).then((result) => {
                if (result.isConfirmed) {
                    deleteData(event.target);
                    Swal.fire(
                        'EXCLUIDO COM SUCESSO!',
                        'Produto removido com sucesso',
                        'success'
                    ).then(()=>{
                        location.reload();
                    })

                }
              })
              
            
        } else if (event.target.classList.contains('fa-pen-to-square')) {
            updateData(event.target);
        } else if (event.target.classList.contains('fa-heart') && event.target.classList.contains('fa-regular')) {
            event.target.classList.add('fa-solid');
            event.target.classList.remove('fa-regular');
        } else if (event.target.classList.contains('fa-heart') && event.target.classList.contains('fa-solid')) {
            event.target.classList.add('fa-regular');
            event.target.classList.remove('fa-solid');
        }
    });
}
function validateForm(){
    let cardRef = document.querySelector('.card-add');
    let emptyField = new Array;
    for(let i = 0; i < cardList.length; i++){
        if(cardList[i].name == name.value){
            Swal.fire({
                icon: 'error',
                title: 'PRODUTO JÁ EXISTE',
            }).then(() => {
                location.reload();
            });
        }
        else{
            for (let j = 0; j < 4; j++){
                if(cardRef.children[j].value == ''){
                    emptyField.push(cardRef.children[j]);
                }
            }
            if(emptyField.length == 0 && cardList[i].name == name.value){
                insertData();
            }
            else{
                Swal.fire({
                    icon: 'error',
                    title: 'PRODUTO JÁ EXISTE',
                }).then(()=>{
                    emptyField.forEach((element)=>{
                        element.classList.add('empty-field');
                    })
                });
            }
        }
    }
}
function handlePrice() {
    let selectedPrice = document.querySelector('.selected-price');
    priceSlide = document.querySelector('.price-slide');
    priceSlide.addEventListener("mousedown",()=> {
        priceSlide.addEventListener('input', () => {
            selectedPrice.innerHTML = 'R$' + priceSlide.value.substring(0, (priceSlide.value.length > 4 ? 2 : 1)) + '.' + priceSlide.value.substring((priceSlide > 4 ? 2 : 1), (priceSlide.value.length > 4 ? 5 : 6)) + ',00';
        })
        priceSlide.addEventListener("mouseup", ()=> loading());
    });
}
function loading() {
    let loadingContainer = document.createElement('div');
    let loadingItem1 = document.createElement('span');
    let loadingItem2 = document.createElement('span');
    let loadingItem3 = document.createElement('span');
    let loadingItem4 = document.createElement('span');
    loadingContainer.classList.add('loading');
    loadingContainer.appendChild(loadingItem1);
    loadingContainer.appendChild(loadingItem2);
    loadingContainer.appendChild(loadingItem3);
    loadingContainer.appendChild(loadingItem4);

    if (gridContainer.children.length != 1) {
        for (let i = gridContainer.children.length; i > 1; i--) {
            gridContainer.removeChild(gridContainer.children[i - 1]);
        }
    }
    document.body.appendChild(loadingContainer);
    setTimeout(() => {
        document.body.removeChild(loadingContainer);
    }, '1000');
    render(selectedBrands, priceSlide.value);
}
function render(selectedBrands, selectedPrice) {
    if (selectedBrands.length === 0) {
        cardList.forEach(element =>{
            if(Number(element.price < Number(selectedPrice))) createElements(element.name,
                                                                             element.price,
                                                                             element.imageSrc);
        });
    }
    else {
        cardList.forEach(element =>{
            if(Number(element.price) < Number(selectedPrice) && selectedBrands.includes(element.brand)){

                createElements(element.name,
                               element.price,
                               element.imageSrc);
            }
        })
    }

}

function createElements(name, price, imageSrc) {
    let card = document.createElement("template");
    card.innerHTML = `<div class="card">
                        <div class="image-container">
                            <div class="extras-container">
                                <i class="fa-solid fa-pen-to-square"></i>
                                <i class="fa-solid fa-delete-left"></i>
                            </div>
                                <div class="gradient"></div>
                                <img class="card-image" src="https://firebasestorage.googleapis.com/v0/b/cardproduct-2c147.appspot.com/o/images%2F`+imageSrc+`?alt=media&amp;token=2c96d50f-263c-4a78-870e-c62396f03b27">
                                <div class="card-name">`+name+`</div>
                                <div class="card-price">R$`+price+`</div>
                            </div>
                                <div class="button-container">
                                    <button class="buy">COMPRAR</button>
                                    <button class="cart">
                                        <i class="fa-solid fa-cart-plus"></i>
                                    </button>
                                </div>
                        </div>
                    </div>`.trim();
    gridContainer.appendChild(card.content.firstElementChild);

}

function insertData() {
    const newCard = {
        name: name.value,
        brand: brand.value,
        price: price.value,
        imageSrc: image.files[0].name,
    };
    const imageName = sRef(storage, 'images/' + image.files[0].name);
    const imageFile = image.files[0];
    const uploadTask = uploadBytesResumable(imageName, imageFile);
    uploadTask.on('state-changed', () => {});
    if(cardList) {
        cardList.push(newCard);
    }
    else {
        cardList = new Array;
        cardList.push(newCard);
    }
    SyncCardList();
    name.value = null;
    brand.value = null;
    price.value = null;
    Swal.fire({
        icon: 'success',
        title: 'PRODUTO ADICIONADO COM SUCESSO',
    }).then(() => {
        location.reload();
    });
}

function deleteData(target) {
    let removeRef = target.parentNode.parentNode.children[3].innerHTML;
    for (let i = 0; i < cardList.length; i++) {
        if(removeRef == cardList[i].name){
            cardList.splice(i, i);
            if(i == 0){
                cardList.shift();
            }
        }
    }
    remove(ref(db, 'cards/'));
    SyncCardList();
    Swal.fire({
        icon: 'success',
        title: 'PRODUTO REMOVIDO COM SUCESSO',
    }).then(() => {
        location.reload();
    });
}


function updateData(target) {
    let cardRef = target.parentNode.parentNode.parentNode;
    let cardListRef = cardRef.children[0].children[3].innerHTML;
    let index;
    for (let i = 0; i < cardList.length; i++){
        if (cardListRef == cardList[i].name){
            cardListRef = cardList[i];
            index = i;
        }
    }
    cardRef.innerHTML = ``;
    cardRef.innerHTML = `<div class="image-input">
                        <input type="file" class="image" accept="image/*">
                        <img
                            src="https://getstamped.co.uk/wp-content/uploads/WebsiteAssets/Placeholder.jpg"
                            alt="">
                    </div>    
                    <input type="text" class="name" value="`+cardListRef.name+`"placeholder="Product Name">
                    <select class="brand" placeholder="Select a brand">
                        <option value="">Select a brand</option>
                        <option value="apple">Apple</option>
                        <option value="asus">Asus</option>
                        <option value="lg">LG</option>
                        <option value="motorola">Motorola</option>
                        <option value="samsung">Samsung</option>
                        <option value="xiaomi">Xiaomi</option>
                        <input type="text" class="price" value="`+cardListRef.price+`"placeholder="Product Price">
                        <button class="add">ATUALIZAR PRODUTO</button>`.trim();
    let newName = document.querySelectorAll('.name');
    let newBrand = document.querySelectorAll('.brand');
    let newPrice = document.querySelectorAll('.price');
    let newImage = document.querySelectorAll('.image');
    let update = document.querySelectorAll('.add');
    newName = newName[1];
    newBrand = newBrand[1];
    newPrice = newPrice[1]; 
    newImage = newImage[1];
    update = update[1];

    update.addEventListener('click', ()=>{
        cardList[index] = {
            name: newName.value,
            brand: newBrand.value,
            price: newPrice.value,
            imageSrc: 'xiaomi.png',
        };
        SyncCardList();
        Swal.fire({
            icon: 'success',
            title: 'PRODUTO ATUALIZADO COM SUCESSO',
        }).then(() => {
            location.reload();
        });
    })

}
