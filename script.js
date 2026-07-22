// ==========================================
// 1. الإعدادات الأساسية (الروابط والأرقام)
// ==========================================
const SELLER_PHONE = "201066594552"; 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwCtBxbrI-jbqIFCgJcNyeiKiYzOTIQaNA5R2sgaxptIDsOYfHer2DQiZ5kEvShUrOc/exec";

// ==========================================
// 2. ربط عناصر واجهة المستخدم (DOM Elements)
// ==========================================
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

// ==========================================
// 3. أزرار التحكم في الكمية
// ==========================================
btnIncrease.addEventListener('click', () => {
    let currentQty = parseInt(qtyInput.value);
    if (currentQty < 20) { 
        qtyInput.value = currentQty + 1; 
        updatePricing(); 
    }
});

btnDecrease.addEventListener('click', () => {
    let currentQty = parseInt(qtyInput.value);
    if (currentQty > 1) { 
        qtyInput.value = currentQty - 1; 
        updatePricing(); 
    }
});

// ==========================================
// 4. نظام الحساب الديناميكي (السعر والتوصيل والإضافة)
// ==========================================
function updatePricing() {
    const qty = parseInt(qtyInput.value) || 1;
    // التسعير الذكي: 199 للعلبة، 175 للعلبة لو اتنين أو أكتر
    const basePrice = qty === 1 ? 199 : qty * 175;
    
    // حساب مصاريف الشحن من اختيار المحافظة
    const selectedGov = govSelect.options[govSelect.selectedIndex];
    const shippingCost = selectedGov.value === "" ? 0 : parseInt(selectedGov.getAttribute('data-shipping'));
    
    // حساب إضافة الكاستم ميد
    let customCost = 0;
    if(customGiftCheckbox.checked) {
        customCost = 50 * qty;
        customFeeLine.style.display = "flex";
        customTotalDisplay.innerText = `${customCost} ج.م`;
    } else {
        customFeeLine.style.display = "none";
    }

    const finalTotal = basePrice + shippingCost + customCost;
    
    // تحديث الواجهة
    productsTotalDisplay.innerText = `${basePrice} ج.م`;
    shippingTotalDisplay.innerText = `${shippingCost} ج.م`;
    dynamicTotalDisplay.innerText = `${finalTotal} ج.م`;
}

// تشغيل الحسبة التلقائية لما يغير المحافظة أو يعلم على الهدية
govSelect.addEventListener('change', updatePricing);
customGiftCheckbox.addEventListener('change', updatePricing);

// ==========================================
// 5. فلترة رقم الموبايل اللحظية (تم تحسين تجربة المستخدم)
// ==========================================
phoneInput.addEventListener('input', function() {
    const strictRegex = /^01[0125][0-9]{8}$/;
    
    // إجبار المستخدم يكتب أرقام بس (بيمسح أي حروف أو مسافات)
    this.value = this.value.replace(/[^0-9]/g, '');

    // إظهار الخطأ فقط لو كتب 11 رقم وكانوا غلط، عشان ميزعجش العميل وهو لسه بيكتب
    if (this.value.length === 11) {
        if (!strictRegex.test(this.value)) {
            phoneError.style.display = 'block';
            this.style.borderColor = '#f43f5e'; // أحمر
        } else {
            phoneError.style.display = 'none';
            this.style.borderColor = '#25d366'; // أخضر لو الرقم صح
        }
    } else {
        // طول ما هو لسه بيكتب (أقل أو أكتر من 11) بنخفي رسالة الخطأ
        phoneError.style.display = 'none';
        this.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    }
});

// ==========================================
// 6. حماية من تكرار الطلبات والسبام (Rate Limiting)
// ==========================================
function isRateLimited() {
    const lastOrderTime = localStorage.getItem('a3da_last_order');
    if (!lastOrderTime) return false;
    const now = new Date().getTime();
    // 180000 مللي ثانية = 3 دقايق حظر بين كل أوردر والتاني
    return (now - parseInt(lastOrderTime)) < 180000; 
}

// ==========================================
// 7. إرسال الطلب (لجوجل شيت ثم الواتساب)
// ==========================================
orderForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // 🚨 الحماية من البوتات (Honeypot)
    const honeypot = document.getElementById('honeypot').value;
    if (honeypot !== "") { 
        console.log("Bot blocked"); 
        return; 
    }

    // 🚨 الحماية من السبام
    if (isRateLimited()) {
        rateLimitMsg.style.display = 'block';
        return;
    } else {
        rateLimitMsg.style.display = 'none';
    }

    // تأكيد أخير على الموبايل
    const regex = /^01[0125][0-9]{8}$/;
    if (!regex.test(phoneInput.value)) {
        phoneInput.focus();
        phoneError.style.display = 'block';
        return;
    }

    // تأكيد اختيار المحافظة
    if (govSelect.value === "") {
        alert("يرجى اختيار المحافظة لتحديد قيمة الشحن.");
        govSelect.focus();
        return;
    }

    // تجميع الداتا من الفورم
    const name = document.getElementById('fullName').value.trim();
    const phone = phoneInput.value.trim();
    const governorate = govSelect.value;
    const address = document.getElementById('address').value.trim();
    const qty = parseInt(qtyInput.value) || 1;
    const isCustom = customGiftCheckbox.checked;
    
    // حسبة الفاتورة النهائية
    const basePrice = qty === 1 ? 199 : qty * 175;
    const selectedGov = govSelect.options[govSelect.selectedIndex];
    const shippingCost = parseInt(selectedGov.getAttribute('data-shipping'));
    const customCost = isCustom ? 50 * qty : 0;
    const finalTotal = basePrice + shippingCost + customCost;
    
    // توليد كود الأوردر
    const orderId = "ORD-" + Math.floor(10000 + Math.random() * 90000);

    // تجهيز الداتا لجوجل شيت (الأسماء هنا اتظبطت عشان تطابق الشيت بالمللي)
    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('fullName', name);
    formData.append('phone', phone);
    formData.append('governorate', governorate);
    formData.append('address', address);
    formData.append('quantity', qty);
    formData.append('customGift', isCustom ? 'نعم 🎁' : 'لا'); // 👈 تم التصليح هنا
    formData.append('total', finalTotal); // 👈 وتم التصليح هنا

    // تجهيز رسالة الواتساب الأنيقة
    const msg = `طلب جديد - لعبة قعدة\n\nرقم الطلب: #${orderId}\n\nبيانات العميل:\nالاسم: ${name}\nرقم الهاتف: ${phone}\nالمحافظة: ${governorate}\nالعنوان: ${address}\n\nتفاصيل الفاتورة:\nالكمية: ${qty} نسخة\nإضافة (Custom Made): ${isCustom ? 'نعم 🎁' : 'لا'}\nقيمة المنتجات: ${basePrice} ج.م\n${isCustom ? `رسوم الإضافة: ${customCost} ج.م\n` : ''}مصاريف الشحن: ${shippingCost} ج.م\n---\nالإجمالي المطلوب: ${finalTotal} ج.م`;
    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/${SELLER_PHONE}?text=${encodedMsg}`;

    // تغيير شكل الزرار وقت التحميل
    submitBtn.innerHTML = 'جاري تسجيل الطلب... ⏳';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.pointerEvents = 'none';

    // تسجيل وقت الطلب في المتصفح لمنع السبام
    localStorage.setItem('a3da_last_order', new Date().getTime().toString());

  // 🚀 ضرب عصفورين بحجر: الإرسال للشيت ثم فتح الواتساب
    fetch(GOOGLE_SCRIPT_URL, { 
        method: 'POST', 
        body: formData,
        mode: 'no-cors' // 👈 السطر السحري ده اللي بيمنع المتصفح يعمل بلوك للداتا
    })
    .then(response => {
        window.location.href = whatsappUrl;
        resetFormAfterSubmit();
    })
    .catch(error => {
        console.error('Error!', error.message);
        // لو النت بطيء والشيت مسقط، هنحوله برضو للواتس عشان البيعة متضيعش
        window.location.href = whatsappUrl;
        resetFormAfterSubmit();
    });
