// ================= 1. أنيميشن النزول الفاخر (Cinematic Scroll Reveal) =================
function revealOnScroll() {
    let reveals = document.querySelectorAll('.reveal');
    for (let i = 0; i < reveals.length; i++) {
        let windowHeight = window.innerHeight;
        let elementTop = reveals[i].getBoundingClientRect().top;
        let elementVisible = 60; // مسافة ظهور العناصر
        
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
        }
    }
}
window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // تشغيل مرة عند التحميل الأول

// ================= 2. نظام تحديث الفاتورة الحية والأسعار =================
let currentBasePrice = 150;

function selectBundle(element, price) {
    // 1. إزالة كلاس النشاط من الباقات الأخرى
    document.querySelectorAll('.receipt-bundle-item').forEach(el => el.classList.remove('active'));
    
    // 2. تفعيل الباقة الحالية
    element.classList.add('active');
    
    // 3. اختيار الـ Radio Button المرتبط داخلياً
    const radioBtn = element.querySelector('input[type="radio"]');
    if (radioBtn) {
        radioBtn.checked = true;
    }
    
    // 4. تحديث السعر الأساسي والواجهة
    currentBasePrice = price;
    updateTotalPrice();
}

function updateTotalPrice() {
    const isCustom = document.getElementById('customEditionToggle').checked;
    
    // حساب كروت التخصيص
    const addonPrice = isCustom ? 50 : 0;
    
    // حساب الإجمالي الكلي
    const finalPrice = currentBasePrice + addonPrice;
    
    // تحديث تفاصيل الفاتورة الفردية
    document.getElementById('receipt-base-price').innerText = `${currentBasePrice} ج.م`;
    document.getElementById('receipt-addon-price').innerText = `${addonPrice} ج.م`;
    
    // تحديث مصاريف الشحن نصياً بناءً على العرض
    const shippingPriceDisplay = document.getElementById('receipt-shipping-price');
    if (currentBasePrice === 280) {
        shippingPriceDisplay.innerText = "مجاني! 🎉";
        shippingPriceDisplay.style.color = "#10b981";
    } else {
        shippingPriceDisplay.innerText = "40 - 55 ج.م";
        shippingPriceDisplay.style.color = "#fff";
    }
    
    // تحديث الإجمالي الكلي في الفاتورة
    const totalDisplay = document.getElementById('total-price-display');
    const shippingText = currentBasePrice === 280 ? " (شحن مجاني)" : "";
    totalDisplay.innerText = `${finalPrice} ج.م${shippingText}`;
}

// ================= 3. عداد الـ FOMO التنازلي التلقائي =================
function startTimer() {
    const display = document.querySelector('#countdown-timer');
    const bannerContainer = document.querySelector('#fomo-banner-container');
    
    let endTime = localStorage.getItem('qa3da_fomo_end');
    if (!endTime) {
        endTime = Date.now() + (2 * 60 * 60 * 1000) + (45 * 60 * 1000); // ساعتين و45 دقيقة
        localStorage.setItem('qa3da_fomo_end', endTime);
    }

    const interval = setInterval(function () {
        let now = Date.now();
        let remaining = endTime - now;

        if (remaining <= 0) {
            clearInterval(interval);
            bannerContainer.innerHTML = '🔥 تم انتهاء حجز الطبعة الأولى! اطلب الآن لتسجيل اسمك في حجز الطبعة الثانية قبل نفاذها!';
            return;
        }

        let hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = hours + ":" + minutes + ":" + seconds;
    }, 1000);
}
window.onload = startTimer;

// ================= 4. إرسال الفورم وربط الجوجل شيت والواتساب =================
const scriptURL = 'https://script.google.com/macros/s/AKfycbxUHhqDIdx-MVMgNkMmUY3Tzj_wNRVX8W5u2E6arwdtvd0pMmqSBeGnCZdZJ8EEdsSJ/exec';
const myWhatsAppNumber = "201066594552"; 
const form = document.getElementById('orderForm');

form.addEventListener('submit', e => {
    e.preventDefault();

    const phoneInput = document.getElementById('phone').value;
    const phoneError = document.getElementById('phone-error');
    const submitBtn = document.getElementById('submitBtn');

    // كود التحقق من أرقام شبكات المحمول المصرية 
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(phoneInput)) {
        phoneError.style.display = 'block';
        return;
    } else {
        phoneError.style.display = 'none';
    }

    // منع تكرار الطلب في خلال 10 دقائق (Cooldown)
    const lastOrderTime = localStorage.getItem('qa3da_order_time');
    if (lastOrderTime) {
        const timePassed = Date.now() - parseInt(lastOrderTime);
        const tenMinutes = 10 * 60 * 1000; 
        if (timePassed < tenMinutes) {
            form.style.display = 'none';
            document.querySelector('.form-sub').style.display = 'none';
            document.getElementById('cooldown-msg').style.display = 'block';
            return; 
        }
    }

    // تغيير حالة الزرار أثناء الإرسال
    submitBtn.innerHTML = 'جاري تسجيل طلبك... <i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i>';
    submitBtn.disabled = true;

    const customerName = document.getElementById('name').value;
    const customerAddress = document.getElementById('address').value;
    const selectedBundle = document.querySelector('input[name="bundle"]:checked').value;
    const isCustom = document.getElementById('customEditionToggle').checked ? "نعم (+50 ج.م)" : "لا";
    const orderCode = "#" + Math.floor(1000 + Math.random() * 9000);

    // بناء رسالة الواتساب المتوافقة
    const whatsappMessage = `أهلاً قعدة! أنا بأكد طلبي:

👤 الاسم: ${customerName}
📱 الرقم: ${phoneInput}
📍 العنوان: ${customerAddress}
📦 الباقة: ${selectedBundle}
🎁 نسخة تفصيل: ${isCustom}
🏷️ كود الأوردر: ${orderCode}

جاهز للتأكيد والاستلام!`;
    const whatsappUrl = `https://wa.me/${myWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    // تجهيز الداتا للإرسال للـ Google Sheet
    let requestBody = new FormData();
    requestBody.append("name", customerName);
    requestBody.append("phone", phoneInput);
    requestBody.append("address", customerAddress);
    requestBody.append("bundle", selectedBundle);
    requestBody.append("customEdition", isCustom);
    requestBody.append("orderID", orderCode);

    // إرسال البيانات بشكل خلفي
    fetch(scriptURL, { method: 'POST', body: requestBody })
        .then(response => {
            showSuccessMessage(whatsappUrl, customerName);
        })
        .catch(error => {
            // تحويل الزبون حتى لو حصل خطأ في شبكة الشيت لضمان المبيعة
            showSuccessMessage(whatsappUrl, customerName);
        });
        
    function showSuccessMessage(waUrl, cName) {
        localStorage.setItem('qa3da_order_time', Date.now()); 
        form.style.display = 'none';
        document.querySelector('.form-sub').style.display = 'none';
        
        const successDiv = document.getElementById('success-msg');
        successDiv.style.display = 'block';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle" style="font-size: 3.5rem; display: block; margin-bottom: 20px; color:#10b981;"></i>
            <h3 style="margin-bottom: 12px; font-size:1.6rem;">تم حجز علبتك بنجاح يا ${cName.split(' ')[0]}!</h3>
            <p style="margin-bottom: 25px; font-size: 1.1rem; color: #cbd5e1;">باقي خطوة واحدة لتأكيد الشحن وتجهيز علبتك.</p>
            <a href="${waUrl}" target="_blank" class="nav-btn main-action" style="display:inline-block; padding: 18px 35px; font-size: 1.2rem; background: #25d366; box-shadow: 0 10px 25px rgba(37, 211, 102, 0.4); border:none;">
                <i class="fab fa-whatsapp" style="margin-left: 8px;"></i> اضغط هنا لتأكيد الأوردر على الواتساب
            </a>
        `;
    }
});

// ================= 5. حل مشكلة كيبورد الموبايل (Mobile UX Fix) =================
// الكود ده بيخفي زرار الطلب العائم لما العميل يجي يكتب بياناته عشان الكيبورد ميغطيش على الشاشة
const mobileCTA = document.querySelector('.mobile-sticky-cta');
const allInputs = document.querySelectorAll('input[type="text"], input[type="tel"], textarea');

allInputs.forEach(input => {
    // لما العميل يلمس الخانة عشان يكتب (Focus)
    input.addEventListener('focus', () => {
        if (window.innerWidth <= 900) {
            mobileCTA.style.display = 'none';
        }
    });
    
    // لما العميل يخلص كتابة ويقفل الكيبورد (Blur)
    input.addEventListener('blur', () => {
        if (window.innerWidth <= 900) {
            // نأخر ظهوره جزء من الثانية عشان الكيبورد يكون نزل تماماً
            setTimeout(() => {
                mobileCTA.style.display = 'block';
            }, 200);
        }
    });
});
