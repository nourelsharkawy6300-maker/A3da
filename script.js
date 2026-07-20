const SELLER_PHONE = "201066594552"; 

const orderForm = document.getElementById('orderForm');
const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phoneError');
const govSelect = document.getElementById('governorate');
const qtyInput = document.getElementById('quantity');
const btnIncrease = document.getElementById('increaseQty');
const btnDecrease = document.getElementById('decreaseQty');
const submitBtn = document.getElementById('submitBtn');
const customGiftCheckbox = document.getElementById('customGift');

const productsTotalDisplay = document.getElementById('productsTotal');
const shippingTotalDisplay = document.getElementById('shippingTotal');
const dynamicTotalDisplay = document.getElementById('dynamicTotal');
const customFeeLine = document.getElementById('customFeeLine');
const customTotalDisplay = document.getElementById('customTotal');
const rateLimitMsg = document.getElementById('rateLimitMsg');

// 1. أزرار التحكم في الكمية
btnIncrease.addEventListener('click', () => {
    let currentQty = parseInt(qtyInput.value);
    if (currentQty < 20) { qtyInput.value = currentQty + 1; updatePricing(); }
});
btnDecrease.addEventListener('click', () => {
    let currentQty = parseInt(qtyInput.value);
    if (currentQty > 1) { qtyInput.value = currentQty - 1; updatePricing(); }
});

// 2. تحديث السعر بناءً على الكمية + الشحن + الكاستم
function updatePricing() {
    const qty = parseInt(qtyInput.value) || 1;
    const basePrice = qty === 1 ? 199 : qty * 175;
    
    const selectedGov = govSelect.options[govSelect.selectedIndex];
    const shippingCost = selectedGov.value === "" ? 0 : parseInt(selectedGov.getAttribute('data-shipping'));
    
    // إضافة الكاستم ميد (50 جنيه على كل علبة لو اتعلم عليها)
    let customCost = 0;
    if(customGiftCheckbox.checked) {
        customCost = 50 * qty;
        customFeeLine.style.display = "flex";
        customTotalDisplay.innerText = `${customCost} ج.م`;
    } else {
        customFeeLine.style.display = "none";
    }

    const finalTotal = basePrice + shippingCost + customCost;
    
    productsTotalDisplay.innerText = `${basePrice} ج.م`;
    shippingTotalDisplay.innerText = `${shippingCost} ج.م`;
    dynamicTotalDisplay.innerText = `${finalTotal} ج.م`;
}

govSelect.addEventListener('change', updatePricing);
customGiftCheckbox.addEventListener('change', updatePricing);

// 3. فلترة برمجية صارمة (Strict Regex Validation)
phoneInput.addEventListener('input', function() {
    // يقبل فقط: 11 رقم، تبدأ بـ 010 أو 011 أو 012 أو 015
    const strictRegex = /^01[0125][0-9]{8}$/;
    
    // منع إدخال أي حروف، فقط أرقام
    this.value = this.value.replace(/[^0-9]/g, '');

    if (this.value.length > 0 && !strictRegex.test(this.value)) {
        phoneError.style.display = 'block';
        this.style.borderColor = '#f43f5e';
    } else {
        phoneError.style.display = 'none';
        this.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    }
});

// 4. تقييد الطلبات (Rate Limiting via LocalStorage)
function isRateLimited() {
    const lastOrderTime = localStorage.getItem('a3da_last_order');
    if (!lastOrderTime) return false;
    
    const now = new Date().getTime();
    const timeDiff = now - parseInt(lastOrderTime);
    
    // يمنع إرسال طلب جديد إلا بعد مرور 3 دقائق (180,000 مللي ثانية)
    return timeDiff < 180000; 
}

orderForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // 🚨 1. الحماية من البوتات (Honeypot Check) 🚨
    const honeypot = document.getElementById('honeypot').value;
    if (honeypot !== "") {
        console.log("Bot detected! - script.js:93"); 
        return; // خروج صامت بدون تنبيه البوت
    }

    // 🚨 2. التحقق من الـ Rate Limit 🚨
    if (isRateLimited()) {
        rateLimitMsg.style.display = 'block';
        return;
    } else {
        rateLimitMsg.style.display = 'none';
    }

    const regex = /^01[0125][0-9]{8}$/;
    if (!regex.test(phoneInput.value)) {
        phoneInput.focus();
        phoneError.style.display = 'block';
        return;
    }

    if (govSelect.value === "") {
        alert("يرجى اختيار المحافظة لتحديد قيمة الشحن.");
        govSelect.focus();
        return;
    }

    const name = document.getElementById('fullName').value.trim();
    const phone = phoneInput.value.trim();
    const governorate = govSelect.value;
    const address = document.getElementById('address').value.trim();
    const qty = parseInt(qtyInput.value) || 1;
    const isCustom = customGiftCheckbox.checked;
    
    const basePrice = qty === 1 ? 199 : qty * 175;
    const selectedGov = govSelect.options[govSelect.selectedIndex];
    const shippingCost = parseInt(selectedGov.getAttribute('data-shipping'));
    const customCost = isCustom ? 50 * qty : 0;
    const finalTotal = basePrice + shippingCost + customCost;
    
    const orderId = "ORD-" + Math.floor(10000 + Math.random() * 90000);

    const msg = `طلب جديد - لعبة قعدة

رقم الطلب: #${orderId}

بيانات العميل:
الاسم: ${name}
رقم الهاتف: ${phone}
المحافظة: ${governorate}
العنوان: ${address}

تفاصيل الفاتورة:
الكمية: ${qty} نسخة
إضافة (Custom Made): ${isCustom ? 'نعم 🎁' : 'لا'}
قيمة المنتجات: ${basePrice} ج.م
${isCustom ? `رسوم الإضافة: ${customCost} ج.م\n` : ''}مصاريف الشحن: ${shippingCost} ج.م
---
الإجمالي المطلوب: ${finalTotal} ج.م`;

    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/${SELLER_PHONE}?text=${encodedMsg}`;

    submitBtn.innerHTML = 'جاري التحويل للواتساب...';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.pointerEvents = 'none';

    // تسجيل وقت الطلب في المتصفح لمنع السبام
    localStorage.setItem('a3da_last_order', new Date().getTime().toString());

    setTimeout(() => {
        window.location.href = whatsappUrl;
        
        setTimeout(() => {
            submitBtn.innerHTML = 'تأكيد الطلب';
            submitBtn.style.opacity = '1';
            submitBtn.style.pointerEvents = 'auto';
            orderForm.reset();
            qtyInput.value = 1;
            customFeeLine.style.display = "none";
            updatePricing();
        }, 2000);
    }, 400);
});
