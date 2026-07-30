// 1. الإعدادات الأساسية
const SELLER_PHONE = "201066594552"; 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyjfli5WdwFLzjK43WT-tulW5Lm28n8zVuFWguDaHpSPQ0XUR7MT27A48zYU9d_QSF7/exec";
const PRODUCT_PRICE = 250; 
const GIFT_PRICE = 30;

// 2. ربط العناصر
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

// 3. حساب الإجمالي
function calculateTotal() {
    const qty = parseInt(qtyInput.value) || 1;
    const productsTotal = qty * PRODUCT_PRICE;
    
    const selectedOption = govSelect.options[govSelect.selectedIndex];
    const shippingCost = selectedOption.value ? parseInt(selectedOption.getAttribute('data-price')) : 0;
    
    const isGift = customGiftCheckbox.checked;
    const giftCost = isGift ? GIFT_PRICE : 0;
    
    const finalTotal = productsTotal + shippingCost + giftCost;
    
    productsTotalDisplay.textContent = `${productsTotal} ج.م`;
    shippingTotalDisplay.textContent = `${shippingCost} ج.م`;
    
    if (isGift) {
        customFeeLine.style.display = 'flex';
    } else {
        customFeeLine.style.display = 'none';
    }
    
    dynamicTotalDisplay.textContent = `${finalTotal} ج.م`;
    
    return { productsTotal, shippingCost, giftCost, finalTotal, isGift };
}

// 4. أزرار الكمية وتغيير المحافظة والهدية
btnIncrease.addEventListener('click', () => {
    qtyInput.value = parseInt(qtyInput.value) + 1;
    calculateTotal();
});

btnDecrease.addEventListener('click', () => {
    if (parseInt(qtyInput.value) > 1) {
        qtyInput.value = parseInt(qtyInput.value) - 1;
        calculateTotal();
    }
});

govSelect.addEventListener('change', calculateTotal);
customGiftCheckbox.addEventListener('change', calculateTotal);

// 5. إرسال الفورم (فلترة + شيت + واتساب)
orderForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // فلترة الرقم
    const phoneVal = phoneInput.value.trim();
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(phoneVal)) {
        phoneError.textContent = "رقم الموبايل غير صحيح، لازم يكون 11 رقم بيبدأ بـ 010 أو 011 أو 012 أو 015";
        phoneError.style.display = "block";
        return;
    }
    phoneError.style.display = "none";

    // تغيير شكل الزرار
    submitBtn.innerHTML = 'جاري تسجيل الطلب... ⏳';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.pointerEvents = 'none';

    // تجهيز الداتا من الفورم
    const formData = new FormData(orderForm);
    const { finalTotal, isGift } = calculateTotal();
    
    // إنشاء رقم الطلب
    const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    
    formData.append('رقم الطلب', orderId);
    formData.append('الإجمالي', finalTotal);
    formData.append('إصدار الهدية', isGift ? 'نعم 🎁' : 'لا');

    // 🚨 الحل السحري: تحويل البيانات لصيغة (URLSearchParams) عشان جوجل شيت يقبلها غصب عنه 🚨
    const urlParams = new URLSearchParams();
    for (const pair of formData.entries()) {
        urlParams.append(pair[0], pair[1]);
    }

    // تجهيز رسالة الواتساب
    const customerName = formData.get('الاسم');
    const gov = formData.get('المحافظة');
    const address = formData.get('العنوان');
    const giftText = isGift ? "\nإصدار الهدية: نعم 🎁" : "";
    
    const msg = `أهلاً قعدة! 🎲\nأنا بأكد طلبي باسم (${customerName})\nرقمي: ${phoneVal}\nالمحافظة: ${gov}\nالعنوان: ${address}\nالكمية: ${qtyInput.value}${giftText}\nرقم الطلب: #${orderId}\n---\nالإجمالي المطلوب: ${finalTotal} ج.م`;
    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/${SELLER_PHONE}?text=${encodedMsg}`;

    // الإرسال لجوجل شيت بالصيغة الجديدة المُجبرة
    fetch(GOOGLE_SCRIPT_URL, { 
        method: 'POST', 
        body: urlParams, // بعتنا الداتا بعد التغليف
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // بنعرف جوجل إننا باعتين داتا سليمة
        }
    })
    .then(() => {
        window.location.href = whatsappUrl;
        resetFormAfterSubmit();
    })
    .catch(error => {
        console.error('Error!', error.message);
        window.location.href = whatsappUrl;
        resetFormAfterSubmit();
    });
});

function resetFormAfterSubmit() {
    setTimeout(() => {
        submitBtn.innerHTML = 'تأكيد الطلب عبر واتساب';
        submitBtn.style.opacity = '1';
        submitBtn.style.pointerEvents = 'auto';
        orderForm.reset();
        calculateTotal();
    }, 3000);
}

// 6. تشغيل الحسابات في البداية
document.addEventListener("DOMContentLoaded", function() {
    calculateTotal(); 
});
