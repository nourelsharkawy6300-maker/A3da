// ================= 1. تفاعل الكروت (Deck Swipe Logic) =================
const deck = document.getElementById('cardDeck');
let cards = Array.from(document.querySelectorAll('.deck-card'));

deck.addEventListener('click', () => {
    if (cards.length === 0) return;
    
    // سحب الكارت اللي فوق
    const topCard = cards[0];
    topCard.classList.add('tossed');
    
    setTimeout(() => {
        // نرجعه في الآخر
        topCard.classList.remove('tossed');
        deck.appendChild(topCard);
        
        // إعادة ترتيب الكلاسات
        cards.push(cards.shift());
        cards.forEach((card, index) => {
            card.className = `deck-card c${index + 1}`;
        });
    }, 400);
});

// ================= 2. تحكم الشاشة المنبثقة (Bottom Sheet) =================
const openBtn = document.getElementById('openSheetBtn');
const closeBtn = document.getElementById('closeSheetBtn');
const sheet = document.getElementById('bottomSheet');
const overlay = document.getElementById('bottomSheetOverlay');

function openSheet() {
    sheet.classList.add('open');
    overlay.classList.add('open');
}

function closeSheet() {
    sheet.classList.remove('open');
    overlay.classList.remove('open');
}

openBtn.addEventListener('click', openSheet);
closeBtn.addEventListener('click', closeSheet);
overlay.addEventListener('click', closeSheet);

// حل مشكلة الكيبورد في الموبايل
const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], textarea');
inputs.forEach(input => {
    input.addEventListener('focus', () => {
        // نرفع الشيت شوية لفوق وقت الكتابة عشان ميتغطاش
        sheet.style.height = '100dvh';
        sheet.style.borderTopLeftRadius = '0';
        sheet.style.borderTopRightRadius = '0';
    });
    input.addEventListener('blur', () => {
        sheet.style.height = '85dvh';
        sheet.style.borderTopLeftRadius = '32px';
        sheet.style.borderTopRightRadius = '32px';
    });
});

// ================= 3. تحديث الأسعار =================
let basePrice = 150;

function selectPackage(element, price, name) {
    document.querySelectorAll('.package-card').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    element.querySelector('input').checked = true;
    basePrice = price;
    updateTotal();
}

function updateTotal() {
    const isCustom = document.getElementById('customEditionToggle').checked;
    const finalPrice = basePrice + (isCustom ? 50 : 0);
    document.getElementById('sheet-total').innerText = `${finalPrice} ج.م`;
}

// ================= 4. إرسال الطلب =================
const scriptURL = 'https://script.google.com/macros/s/AKfycbxUHhqDIdx-MVMgNkMmUY3Tzj_wNRVX8W5u2E6arwdtvd0pMmqSBeGnCZdZJ8EEdsSJ/exec';
const myWhatsApp = "201066594552"; 
const form = document.getElementById('orderForm');

form.addEventListener('submit', e => {
    e.preventDefault();

    const phone = document.getElementById('phone').value;
    const phoneError = document.getElementById('phone-error');
    if (!/^01[0125][0-9]{8}$/.test(phone)) {
        phoneError.style.display = 'block'; return;
    } else { phoneError.style.display = 'none'; }

    const lastOrder = localStorage.getItem('qa3da_order');
    if (lastOrder && (Date.now() - parseInt(lastOrder) < 600000)) {
        form.style.display = 'none';
        document.getElementById('cooldown-msg').style.display = 'block';
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
    submitBtn.disabled = true;

    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const bundle = document.querySelector('input[name="bundle"]:checked').value;
    const isCustom = document.getElementById('customEditionToggle').checked ? "نعم" : "لا";
    const orderID = "#" + Math.floor(1000 + Math.random() * 9000);

    const waMsg = `تأكيد طلب:
الاسم: ${name}
الموبايل: ${phone}
العنوان: ${address}
الباقة: ${bundle}
تخصيص: ${isCustom}
كود: ${orderID}`;
    const waUrl = `https://wa.me/${myWhatsApp}?text=${encodeURIComponent(waMsg)}`;

    let formData = new FormData();
    formData.append("name", name); formData.append("phone", phone);
    formData.append("address", address); formData.append("bundle", bundle);
    formData.append("customEdition", isCustom); formData.append("orderID", orderID);

    fetch(scriptURL, { method: 'POST', body: formData }).then(() => showSuccess(waUrl)).catch(() => showSuccess(waUrl));

    function showSuccess(url) {
        localStorage.setItem('qa3da_order', Date.now());
        form.style.display = 'none';
        document.getElementById('success-msg').style.display = 'block';
        document.getElementById('waRedirectBtn').href = url;
    }
});
