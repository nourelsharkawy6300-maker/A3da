// ================= 1. أنيميشن النزول (Scroll Reveal) =================
function revealOnScroll() {
    let reveals = document.querySelectorAll('.reveal');
    for (let i = 0; i < reveals.length; i++) {
        let windowHeight = window.innerHeight;
        let elementTop = reveals[i].getBoundingClientRect().top;
        let elementVisible = 100; // مسافة الظهور
        
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
        }
    }
}
window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // تشغيلها مرة في البداية

// ================= 2. نظام تحديث الأسعار =================
let currentBasePrice = 150;

function selectBundle(element, price) {
    document.querySelectorAll('.bundle-option').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    currentBasePrice = price;
    updateTotalPrice();
}

function updateTotalPrice() {
    const isCustom = document.getElementById('customEditionToggle').checked;
    const finalPrice = isCustom ? currentBasePrice + 50 : currentBasePrice;
    const shippingText = currentBasePrice === 280 ? "(شحن مجاني)" : "(غير شامل الشحن)";
    document.getElementById('total-price-display').innerText = `الإجمالي: ${finalPrice} ج.م ${shippingText}`;
}

// ================= 3. عداد الـ FOMO الواقعي =================
function startTimer() {
    const display = document.querySelector('#countdown-timer');
    const bannerContainer = document.querySelector('#fomo-banner-container');
    
    let endTime = localStorage.getItem('qa3da_fomo_end');
    if (!endTime) {
        endTime = Date.now() + (2 * 60 * 60 * 1000) + (45 * 60 * 1000);
        localStorage.setItem('qa3da_fomo_end', endTime);
    }

    const interval = setInterval(function () {
        let now = Date.now();
        let remaining = endTime - now;

        if (remaining <= 0) {
            clearInterval(interval);
            bannerContainer.innerHTML = '🔥 تم انتهاء الطبعة الأولى! اطلب الآن للحاق بالطبعة الثانية قبل نفاذ الكمية!';
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

// ================= 4. إعدادات الفورم والجوجل شيت =================
const scriptURL = 'https://script.google.com/macros/s/AKfycbxUHhqDIdx-MVMgNkMmUY3Tzj_wNRVX8W5u2E6arwdtvd0pMmqSBeGnCZdZJ8EEdsSJ/exec';
const myWhatsAppNumber = "201066594552"; 
const form = document.getElementById('orderForm');

form.addEventListener('submit', e => {
    e.preventDefault();

    const phoneInput = document.getElementById('phone').value;
    const phoneError = document.getElementById('phone-error');
    const submitBtn = document.getElementById('submitBtn');

    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(phoneInput)) {
        phoneError.style.display = 'block';
        return;
    } else {
        phoneError.style.display = 'none';
    }

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

    submitBtn.innerHTML = 'جاري تأكيد طلبك... <i class="fas fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;

    const customerName = document.getElementById('name').value;
    const customerAddress = document.getElementById('address').value;
    const selectedBundle = document.querySelector('input[name="bundle"]:checked').value;
    const isCustom = document.getElementById('customEditionToggle').checked ? "نعم (+50 ج.م)" : "لا";
    const orderCode = "#" + Math.floor(1000 + Math.random() * 9000);

    const whatsappMessage = `أهلاً قعدة! أنا بأكد طلبي:\n\n👤 الاسم: ${customerName}\n📱 الرقم: ${phoneInput}\n📍 العنوان: ${customerAddress}\n📦 الباقة: ${selectedBundle}\n🎁 نسخة تفصيل: ${isCustom}\n🏷️ كود الأوردر: ${orderCode}\n\nجاهز للاستلام!`;
    const whatsappUrl = `https://wa.me/${myWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    let requestBody = new FormData();
    requestBody.append("name", customerName);
    requestBody.append("phone", phoneInput);
    requestBody.append("address", customerAddress);
    requestBody.append("bundle", selectedBundle);
    requestBody.append("customEdition", isCustom);
    requestBody.append("orderID", orderCode);

    fetch(scriptURL, { method: 'POST', body: requestBody })
        .then(response => {
            showSuccessMessage(whatsappUrl, customerName);
        })
        .catch(error => {
            showSuccessMessage(whatsappUrl, customerName);
        });
        
    function showSuccessMessage(waUrl, cName) {
        localStorage.setItem('qa3da_order_time', Date.now()); 
        form.style.display = 'none';
        document.querySelector('.form-sub').style.display = 'none';
        
        const successDiv = document.getElementById('success-msg');
        successDiv.style.display = 'block';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle" style="font-size: 3rem; display: block; margin-bottom: 15px; color:#4caf50;"></i>
            <h3 style="margin-bottom: 10px;">تم تسجيل بياناتك بنجاح يا ${cName.split(' ')[0]}!</h3>
            <p style="margin-bottom: 20px; font-size: 1.1rem;">ناقص خطوة واحدة بس عشان الأوردر يخرجلك.</p>
            <a href="${waUrl}" target="_blank" class="nav-btn pulse-btn" style="display:inline-block; padding: 15px 30px; font-size: 1.2rem; background: #25d366; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);">
                <i class="fab fa-whatsapp"></i> اضغط هنا لتأكيد الأوردر على الواتساب
            </a>
        `;
    }
});
