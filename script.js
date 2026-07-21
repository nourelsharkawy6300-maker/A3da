// 4. تقييد الطلبات (Rate Limiting via LocalStorage)
function isRateLimited() {
    const lastOrderTime = localStorage.getItem('a3da_last_order');
    if (!lastOrderTime) return false;
    const now = new Date().getTime();
    return (now - parseInt(lastOrderTime)) < 180000; // 3 دقائق
}

orderForm.addEventListener('submit', function(e) {
    e.preventDefault();

    //   اللينك بتاع جوجل شيت اللي إنت نسخته هنا بين علامتين التنصيص 
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwCtBxbrI-jbqIFCgJcNyeiKiYzOTIQaNA5R2sgaxptIDsOYfHer2DQiZ5kEvShUrOc/exec";

    const honeypot = document.getElementById('honeypot').value;
    if (honeypot !== "") { console.log("Bot blocked"); return; }

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
        alert("يرجى اختيار المحافظة.");
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

    // 1. تجهيز الداتا عشان تتبعت لجوجل شيت
    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('fullName', name);
    formData.append('phone', phone);
    formData.append('governorate', governorate);
    formData.append('address', address);
    formData.append('quantity', qty);
    formData.append('isCustom', isCustom ? 'نعم 🎁' : 'لا');
    formData.append('finalTotal', finalTotal);

    // 2. تجهيز رسالة الواتساب
    const msg = `طلب جديد - لعبة قعدة\n\nرقم الطلب: #${orderId}\n\nبيانات العميل:\nالاسم: ${name}\nرقم الهاتف: ${phone}\nالمحافظة: ${governorate}\nالعنوان: ${address}\n\nتفاصيل الفاتورة:\nالكمية: ${qty} نسخة\nإضافة (Custom Made): ${isCustom ? 'نعم 🎁' : 'لا'}\nقيمة المنتجات: ${basePrice} ج.م\n${isCustom ? `رسوم الإضافة: ${customCost} ج.م\n` : ''}مصاريف الشحن: ${shippingCost} ج.م\n---\nالإجمالي المطلوب: ${finalTotal} ج.م`;
    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/${SELLER_PHONE}?text=${encodedMsg}`;

    submitBtn.innerHTML = 'جاري تسجيل الطلب... ⏳';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.pointerEvents = 'none';

    // تسجيل وقت الطلب لمنع السبام
    localStorage.setItem('a3da_last_order', new Date().getTime().toString());

    // 3. الإرسال لجوجل شيت أولاً، وبعدين التحويل للواتساب
    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData })
        .then(response => {
            // أول ما الداتا تسمع في الشيت، افتح الواتساب للعميل
            window.location.href = whatsappUrl;
            resetFormAfterSubmit();
        })
        .catch(error => {
            // لو حصل أي مشكلة في النت والشيت مسمعش، هنحوله برضو للواتساب عشان منخسرش البيعة
            console.error('Error!', error.message);
            window.location.href = whatsappUrl;
            resetFormAfterSubmit();
        });

    function resetFormAfterSubmit() {
        setTimeout(() => {
            submitBtn.innerHTML = 'تأكيد الطلب';
            submitBtn.style.opacity = '1';
            submitBtn.style.pointerEvents = 'auto';
            orderForm.reset();
            qtyInput.value = 1;
            customFeeLine.style.display = "none";
            updatePricing();
        }, 2000);
    }
});
