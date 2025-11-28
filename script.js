// //////////////////////////////////////////////////////
// NOTE: This assumes you have loaded the js-snes9x library
// and initialized the emulator object (snes) globally.
// //////////////////////////////////////////////////////

let snes = null; // سيتم تعيينه لكائن المحاكي الفعلي
let isRunning = false;
const breakpoints = new Set(); // لتخزين عناوين نقاط التوقف

// --- دالة تحميل الـ ROM (مُعدّلة) ---
document.getElementById('rom-upload').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const romData = await file.arrayBuffer();
        
        // 1. هنا يجب أن يتم تهيئة مكتبة SNES9X
        // في التنفيذ الحقيقي: snes = new Snes9x(romData, { canvas: 'snes-canvas' });
        
        // (لأغراض العرض التوضيحي، نتظاهر بأن التهيئة نجحت)
        snes = {
            step: () => console.log('Executing one CPU instruction...'),
            getRegisters: () => ({ PC: 0x8000 + Math.floor(Math.random() * 0x1000), A: 0x55, X: 0xAA, Y: 0xBB, SP: 0xEF }),
            run: () => console.log('Emulator started...'),
            pause: () => console.log('Emulator paused...'),
            // دالة وهمية لتمثيل التنفيذ
            simulateExecution: () => {
                if (isRunning) {
                    // قراءة السجلات وتحديث الواجهة
                    updateRegisters();
                    // محاكاة الإيقاف عند نقطة توقف
                    if (breakpoints.has(snes.getRegisters().PC)) {
                        snes.pause();
                        isRunning = false;
                        console.warn(`Breakpoint hit at PC: ${snes.getRegisters().PC.toString(16)}`);
                    }
                    setTimeout(snes.simulateExecution, 50); // استمرار المحاكاة
                }
            }
        };

        // 2. إظهار لوحة التصحيح
        document.getElementById('debugger-panel').classList.remove('hidden');
        document.querySelector('.placeholder-text').style.display = 'none';
        
        // 3. بدء التشغيل في وضع الإيقاف المؤقت
        updateRegisters();
        snes.pause();

    } catch (error) {
        console.error("Failed to load ROM or initialize emulator:", error);
        alert("فشل في تحميل الـ ROM. تأكد من الملفات.");
    }
});

// --- دوال لوحة التصحيح (Debugger Functions) ---

// 1. تحديث سجلات المعالج
function updateRegisters() {
    // في التنفيذ الحقيقي: const regs = snes.getRegisters();
    const regs = snes.getRegisters(); // استخدام الدالة الوهمية
    
    document.getElementById('cpu-registers-output').textContent = 
        `PC: ${regs.PC.toString(16).toUpperCase().padStart(4, '0')} | ` +
        `A: ${regs.A.toString(16).toUpperCase().padStart(2, '0')} | ` +
        `X: ${regs.X.toString(16).toUpperCase().padStart(2, '0')} | ` +
        `Y: ${regs.Y.toString(16).toUpperCase().padStart(2, '0')} | ` +
        `SP: ${regs.SP.toString(16).toUpperCase().padStart(2, '0')}`;
}

// 2. التنفيذ خطوة واحدة (Step)
document.getElementById('debug-step-btn').addEventListener('click', () => {
    if (!snes) return;
    snes.step();
    updateRegisters();
});

// 3. تشغيل/إيقاف مؤقت (Run/Pause)
document.getElementById('debug-run-btn').addEventListener('click', () => {
    if (!snes) return;
    isRunning = !isRunning;
    if (isRunning) {
        snes.run();
        document.getElementById('debug-run-btn').textContent = 'إيقاف مؤقت (Pause)';
        // بدء محاكاة التنفيذ
        snes.simulateExecution();
    } else {
        snes.pause();
        document.getElementById('debug-run-btn').textContent = 'تشغيل (Run)';
    }
});

// 4. إضافة نقطة توقف (Breakpoint)
document.getElementById('add-breakpoint-btn').addEventListener('click', () => {
    const input = document.getElementById('breakpoint-address');
    const addressString = input.value.trim();
    
    // تحويل العنوان من نص (سداسي عشري) إلى رقم
    const address = parseInt(addressString, 16);
    
    if (isNaN(address) || address < 0) {
        alert('الرجاء إدخال عنوان ذاكرة صحيح (سداسي عشري).');
        return;
    }

    breakpoints.add(address);
    input.value = '';
    renderBreakpoints();
});

// عرض نقاط التوقف
function renderBreakpoints() {
    const listDiv = document.getElementById('breakpoints-list');
    listDiv.innerHTML = '';
    
    breakpoints.forEach(addr => {
        const p = document.createElement('p');
        p.textContent = `0x${addr.toString(16).toUpperCase().padStart(4, '0')}`;
        p.className = 'breakpoint-item';
        listDiv.appendChild(p);
    });
}
