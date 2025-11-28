// الاستماع لحدث رفع الملف
document.getElementById('rom-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // التحقق من الصيغة (اختياري لتحسين التجربة)
    if (!file.name.endsWith('.smc') && !file.name.endsWith('.sfc') && !file.name.endsWith('.zip')) {
        alert('الرجاء رفع ملف بصيغة .smc أو .sfc أو .zip');
        return;
    }

    startEmulator(file);
});

function startEmulator(file) {
    // إخفاء النص الترحيبي
    document.querySelector('.placeholder-text').style.display = 'none';
    
    // إنشاء كائن لقراءة الملف
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // تجهيز إعدادات المحاكي
        const romData = e.target.result; // البيانات الثنائية للعبة

        // إعداد كائن EmulatorJS
        window.EJS_player = '#emulator-screen';
        window.EJS_core = 'snes'; // تحديد النواة لتكون SNES
        window.EJS_gameName = file.name.replace(/\.[^/.]+$/, ""); // اسم اللعبة بدون الامتداد
        window.EJS_biosUrl = ''; // SNES عادة لا يحتاج BIOS خارجي لمعظم الألعاب
        
        // في البيئة الحقيقية يفضل استخدام رابط للملف، لكن هنا سنمرر البيانات
        // ملاحظة: EmulatorJS يفضل روابط URL، سنقوم بإنشاء Blob URL للملف المرفوع
        const blob = new Blob([new Uint8Array(romData)], { type: 'application/octet-stream' });
        const gameUrl = URL.createObjectURL(blob);
        
        window.EJS_gameUrl = gameUrl;
        
        // إعدادات المسارات (مهم جداً: يجب أن تشير إلى مجلد data الخاص بالمكتبة)
        // سنستخدم CDN للاختبار السريع
        window.EJS_pathtodata = 'https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/';

        // إعادة تشغيل السكريبت لتفعيل المحاكي
        // نقوم بإزالة السكريبت القديم إن وجد وإضافته من جديد
        const oldScript = document.getElementById('emulator-script');
        if (oldScript) oldScript.remove();

        const script = document.createElement('script');
        script.id = 'emulator-script';
        script.src = 'https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/loader.js';
        document.body.appendChild(script);
    };

    // قراءة الملف كمصفوفة بايتات
    reader.readAsArrayBuffer(file);
}

main-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start; /* محاذاة العناصر للأعلى */
    width: 90%;
    max-width: 1200px; /* زيادة العرض لاستيعاب اللوحة الجانبية */
    margin: 30px auto;
}

.emulator-frame {
    flex-grow: 1; /* الشاشة تأخذ المساحة المتاحة */
    max-width: 75%;
}

#debugger-panel {
    background-color: var(--frame-color);
    padding: 15px;
    border-radius: 10px;
    width: 250px;
    min-height: 400px;
    box-shadow: 0 0 10px rgba(255, 0, 85, 0.3);
    border: 1px solid var(--primary-color);
    font-family: monospace; /* خط أحادي للعرض التقني */
}

#debugger-panel h3 {
    color: var(--secondary-color);
    border-bottom: 1px dashed #333;
    padding-bottom: 5px;
    margin-top: 15px;
    font-size: 1rem;
}

#cpu-registers-output {
    background: #000;
    padding: 10px;
    border-radius: 5px;
    white-space: pre-wrap;
    word-break: break-all;
    font-size: 0.85rem;
}

.debug-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 5px;
    transition: background-color 0.2s;
}

.debug-btn:hover {
    background-color: #ff3377;
}

.hidden {
    /* لإخفاء لوحة التصحيح قبل تحميل اللعبة */
    display: none;
}
