// ==UserScript==
// @name         Advanced Dynamic Ad Blocker (anime3rb fixer)
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  حذف الإعلانات والنوافذ المزعجة نهائيًا مع كشف ومراقبة العناصر المحقونة ديناميكيًا بشكل مستمر ومتطور
// @author       Mohammed
// @match        *://anime3rb.com/*
// @match        *://*.anime3rb.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // إعدادات المراقبة المتقدمة
    const CONFIG = {
        // مواقيت المراقبة المختلفة
        INTERVALS: {
            ULTRA_FAST: 250,      // مراقبة فائقة السرعة
            FAST: 500,            // مراقبة سريعة
            NORMAL: 1000,         // مراقبة عادية
            SLOW: 2000,           // مراقبة بطيئة
            DEEP_SCAN: 5000,      // فحص عميق
            CLEANUP: 10000        // تنظيف شامل
        },
        
        // عدد مرات التحقق من العناصر الجديدة
        MAX_CHECKS: 50,
        
        // تأخير الكشف (من 1 إلى 10 ثوانٍ)
        INJECTION_DELAYS: [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
        
        // عمق المراقبة
        MONITORING_DEPTH: 10
    };

    // تكوين محسن للنطاقات المحظورة
    const blockedDomains = new Set([
        'joohugreene.net', 'adnxs.com', 'doubleclick.net', 'googlesyndication.com',
        'googleadservices.com', 'facebook.com/tr', 'google-analytics.com',
        'ads.yahoo.com', 'adsystem.com', 'googletagmanager.com', 'googletagservices.com',
        'adsense.com', 'amazon-adsystem.com', 'outbrain.com', 'taboola.com',
        'media.net', 'criteo.com', 'pubmatic.com', 'rubiconproject.com',
        'propellerads.com', 'popads.net', 'popcash.net', 'popunder.net',
        'adcash.com', 'clicksor.com', 'adbrite.com', 'infolinks.com'
    ]);

    // كلمات مفتاحية محدثة ومحسنة
    const adKeywords = [
        'تعطيل مانع الإعلانات', 'مانع الإعلانات', 'العضوية المميزة', 'اشتراك',
        'adblock', 'disable', 'premium', 'subscription', 'قم بتعطيل',
        'للتخلص من الاعلانات', 'ادعمنا', 'support us', 'تبرع', 'donate',
        'انضم الآن', 'join now', 'احصل على', 'get premium', 'مجاني',
        'free trial', 'تجربة مجانية', 'خطة مدفوعة', 'paid plan', 'ترقية',
        'upgrade', 'اشترك الآن', 'subscribe now', 'عضوية مدفوعة',
        'membership', 'vip', 'pro', 'unlimited', 'غير محدود', 'مدى الحياة',
        'lifetime', 'خصم', 'discount', 'عرض خاص', 'special offer'
    ];

    // محددات محسنة ومتقدمة
    const adSelectors = [
        // النوافذ المنبثقة والحوارات
        '[role="dialog"]', '[role="alertdialog"]', '.modal', '.popup', '.overlay',
        '.backdrop', '.lightbox', '.modal-dialog', '.modal-content', '.popup-content',
        
        // Alpine.js والإطارات الديناميكية
        '[x-show="isOpen"]', '[x-show="show"]', '[x-show="visible"]', '[x-show="modal"]',
        '[x-data*="modal"]', '[x-data*="popup"]', '[x-data*="overlay"]',
        '[x-data*="support"]', '[x-data*="premium"]', '[x-data*="subscription"]',
        
        // Livewire والإطارات الأخرى - محددات محسنة للعناصر المزعجة
        '[wire\\:id]', '[wire\\:snapshot]', '[wire\\:model]', '[wire\\:click]',
        '[wire\\:submit]', '[wire\\:loading]', '[wire\\:target]',
        '[wire\\:snapshot*="support"]', '[wire\\:id="edkunfxlJzs2acN5L7L8"]',
        '[wire\\:snapshot*="name\\":\\"support"]',
        
        // Vue.js والإطارات الحديثة
        '[v-if*="modal"]', '[v-if*="popup"]', '[v-if*="show"]', '[v-show*="modal"]',
        '[v-show*="popup"]', '[v-show*="overlay"]', '[v-model*="modal"]',
        
        // React والإطارات الأخرى
        '[data-modal="true"]', '[data-popup="true"]', '[data-overlay="true"]',
        '[data-testid*="modal"]', '[data-testid*="popup"]', '[data-testid*="overlay"]',
        
        // العناصر المشتبه بها
        '[id*="modal"]', '[class*="modal"]', '[id*="popup"]', '[class*="popup"]',
        '[id*="overlay"]', '[class*="overlay"]', '[id*="backdrop"]', '[class*="backdrop"]',
        '[id*="ad"]:not([id*="add"]):not([id*="address"]):not([id*="admin"])',
        '[class*="ad"]:not([class*="add"]):not([class*="address"]):not([class*="admin"])',
        '[id*="ads"]', '[class*="ads"]', '[id*="banner"]', '[class*="banner"]',
        '[id*="promo"]', '[class*="promo"]', '[id*="sponsor"]', '[class*="sponsor"]',
        
        // عناصر الدعم والاشتراكات
        '#support', '[id*="support"]', '[class*="support"]', '[id*="premium"]',
        '[class*="premium"]', '[id*="subscription"]', '[class*="subscription"]',
        '[id*="donate"]', '[class*="donate"]', '[id*="membership"]', '[class*="membership"]',
        
        // الإطارات والإعلانات المدمجة
        'iframe[src*="ads"]', 'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]',
        'iframe[src*="googleadservices"]', 'iframe[src*="amazon-adsystem"]',
        'iframe[src*="outbrain"]', 'iframe[src*="taboola"]', 'iframe[src*="propeller"]',
        
        // العناصر المخفية والمحقونة
        '[style*="display: none"][style*="visibility: hidden"]',
        '[style*="opacity: 0"][style*="position: absolute"]',
        '[hidden][style*="display: block"]', '[hidden][style*="visibility: visible"]',
        
        // العناصر التي تظهر بعد تأخير
        '[data-delay]', '[data-timeout]', '[data-timer]', '[data-show-after]',
        '[data-inject-after]', '[data-load-after]', '[data-appear-after]'
    ];

    // متغيرات التحكم العامة
    let isInitialized = false;
    let observers = [];
    let intervals = [];
    let timeouts = [];
    let removedElements = new WeakSet();
    let checkedElements = new WeakMap();
    let injectionAttempts = new Map();
    let dynamicElementsLog = [];
    let lastDOMSnapshot = '';
    let performanceMetrics = {
        elementsRemoved: 0,
        injectionsBlocked: 0,
        scansPerformed: 0,
        startTime: Date.now()
    };

    // === مراقبة الحقن الديناميكي ===
    
    // مراقبة محاولات الحقن بتأخير زمني
    function monitorDelayedInjections() {
        CONFIG.INJECTION_DELAYS.forEach(delay => {
            const timeoutId = setTimeout(() => {
                performDeepScan(`delayed-${delay}ms`);
                monitorRecentlyAddedElements();
            }, delay);
            timeouts.push(timeoutId);
        });
    }

    // مراقبة العناصر المضافة حديثاً
    function monitorRecentlyAddedElements() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // تسجيل العنصر الجديد
                            dynamicElementsLog.push({
                                element: node,
                                timestamp: Date.now(),
                                parentElement: mutation.target
                            });
                            
                            // فحص فوري للعنصر الجديد
                            setTimeout(() => checkAndRemoveElement(node), 50);
                            
                            // فحص متأخر للتأكد
                            setTimeout(() => checkAndRemoveElement(node), 500);
                            setTimeout(() => checkAndRemoveElement(node), 1000);
                            setTimeout(() => checkAndRemoveElement(node), 2000);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'id', 'data-*', 'x-*', 'v-*', 'wire:*']
        });
        
        observers.push(observer);
    }

    // مراقبة تغييرات DOM العميقة
    function monitorDOMChanges() {
        let lastSnapshot = '';
        
        const intervalId = setInterval(() => {
            const currentSnapshot = document.body.innerHTML.length;
            if (currentSnapshot !== lastSnapshot) {
                lastSnapshot = currentSnapshot;
                
                // تم تغيير DOM، قم بفحص شامل
                setTimeout(() => {
                    performDeepScan('dom-change');
                    removeAnnoyingElements();
                    removeTransparentOverlays();
                }, 100);
            }
        }, CONFIG.INTERVALS.FAST);
        
        intervals.push(intervalId);
    }
    
    // إزالة الطبقات الشفافة التي تغطي الشاشة
    function removeTransparentOverlays() {
        // البحث عن العناصر الشفافة التي تغطي الشاشة بالكامل
        const overlays = document.querySelectorAll('.bg-dark-900\\/60, [class*="bg-dark-900"][class*="fixed"], [class*="bg-dark-900"][class*="absolute"], [class*="bg-black"][class*="opacity"], [class*="bg-dark"][class*="opacity"]');
        
        overlays.forEach(overlay => {
            const rect = overlay.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(overlay);
            
            // التحقق من أن العنصر يغطي مساحة كبيرة من الشاشة
            if (rect.width >= window.innerWidth * 0.5 && rect.height >= window.innerHeight * 0.5) {
                // التحقق من أن العنصر شفاف
                if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('rgba')) {
                    const opacity = parseFloat(computedStyle.backgroundColor.split(',')[3]);
                    if (opacity < 0.9) {
                        removeElementImmediately(overlay);
                        console.debug('Removed transparent overlay:', overlay);
                    }
                } else if (computedStyle.opacity && parseFloat(computedStyle.opacity) < 0.9) {
                    removeElementImmediately(overlay);
                    console.debug('Removed transparent overlay:', overlay);
                }
            }
        });
        
        // البحث عن العناصر التي تحتوي على كلمة support في خصائصها
        const supportElements = document.querySelectorAll('[wire\\:snapshot*="support"], [wire\\:id="edkunfxlJzs2acN5L7L8"], [wire\\:snapshot*="name\\":\\"support"]');
        supportElements.forEach(element => {
            removeElementImmediately(element);
            console.debug('Removed support element:', element);
        });
    }
    
    // مراقبة الطبقات الشفافة
    function monitorTransparentOverlays() {
        const observer = new MutationObserver(mutations => {
            let needsCheck = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // التحقق من الخصائص
                            if (node.className && (
                                node.className.includes('bg-dark-900') || 
                                node.className.includes('bg-black') || 
                                node.className.includes('opacity')
                            )) {
                                needsCheck = true;
                            }
                            
                            // التحقق من وجود wire:snapshot أو wire:id
                            const attributes = node.attributes;
                            for (let i = 0; i < attributes.length; i++) {
                                const attrName = attributes[i].name;
                                const attrValue = attributes[i].value;
                                if (attrName.includes('wire:') && attrValue.includes('support')) {
                                    needsCheck = true;
                                    break;
                                }
                            }
                        }
                    });
                }
            });
            
            if (needsCheck) {
                setTimeout(() => {
                    removeTransparentOverlays();
                }, 50);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'wire:snapshot', 'wire:id']
        });
        
        observers.push(observer);
    }

    // === الكشف والإزالة المتقدمة ===

    // فحص وإزالة عنصر واحد
    function checkAndRemoveElement(element) {
        if (!element || !element.parentNode || removedElements.has(element)) {
            return false;
        }

        // فحص سريع للعنصر
        if (isElementSuspicious(element)) {
            return removeElementImmediately(element);
        }

        // فحص العناصر الفرعية
        if (element.querySelectorAll) {
            const suspiciousChildren = element.querySelectorAll(adSelectors.join(','));
            suspiciousChildren.forEach(child => {
                removeElementImmediately(child);
            });
        }

        return false;
    }

    // فحص العنصر للتأكد من أنه مشبوه
    function isElementSuspicious(element) {
        if (!element || removedElements.has(element)) return false;

        // فحص الكاش
        if (checkedElements.has(element)) {
            return checkedElements.get(element);
        }

        let isSuspicious = false;

        try {
            // فحص المحددات
            isSuspicious = adSelectors.some(selector => {
                try {
                    return element.matches(selector);
                } catch {
                    return false;
                }
            });

            // فحص النص
            if (!isSuspicious) {
                const text = element.textContent || element.innerText || '';
                if (text && containsAdKeyword(text) && text.length < 1000) {
                    const isMainContent = element.closest('main, article, .content, #content, .post, .video, .story');
                    if (!isMainContent) {
                        isSuspicious = true;
                    }
                }
            }

            // فحص الخصائص
            if (!isSuspicious) {
                isSuspicious = hasSuspiciousProperties(element);
            }

            // فحص الروابط
            if (!isSuspicious && element.tagName === 'A') {
                const href = element.getAttribute('href') || '';
                isSuspicious = Array.from(blockedDomains).some(domain => href.includes(domain));
            }

            // فحص الإطارات
            if (!isSuspicious && element.tagName === 'IFRAME') {
                const src = element.getAttribute('src') || '';
                isSuspicious = Array.from(blockedDomains).some(domain => src.includes(domain));
            }

        } catch (e) {
            isSuspicious = false;
        }

        checkedElements.set(element, isSuspicious);
        return isSuspicious;
    }

    // فحص الخصائص المشبوهة
    function hasSuspiciousProperties(element) {
        if (!element || !element.style) return false;

        try {
            const style = element.style;
            const computedStyle = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();

            // فحص الموضع والحجم
            if ((style.position === 'fixed' || computedStyle.position === 'fixed') &&
                (parseInt(style.zIndex) > 1000 || parseInt(computedStyle.zIndex) > 1000)) {
                
                if (rect.width >= window.innerWidth * 0.5 || rect.height >= window.innerHeight * 0.5) {
                    return true;
                }
            }

            // فحص العناصر المخفية التي تظهر فجأة
            if (style.display === 'none' && computedStyle.display === 'block') {
                return true;
            }

            // فحص الطبقات العالية
            if (parseInt(style.zIndex) > 9999 || parseInt(computedStyle.zIndex) > 9999) {
                return true;
            }

            // فحص العناصر التي تغطي الشاشة
            if (style.width === '100vw' || style.height === '100vh' ||
                style.width === '100%' && style.height === '100%') {
                if (style.position === 'fixed' || style.position === 'absolute') {
                    return true;
                }
            }
            
            // فحص العناصر الشفافة التي تغطي الشاشة (غالباً ما تكون طبقات فوقية للإعلانات)
            if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('rgba')) {
                const opacity = parseFloat(computedStyle.backgroundColor.split(',')[3]);
                if (opacity < 0.9 && rect.width >= window.innerWidth * 0.5 && rect.height >= window.innerHeight * 0.5) {
                    return true;
                }
            }

            // فحص العناصر التي تحتوي على كلمات مفتاحية في الخصائص
            const attributes = element.attributes;
            for (let i = 0; i < attributes.length; i++) {
                const attrName = attributes[i].name;
                const attrValue = attributes[i].value;
                if (attrName.includes('wire:') && attrValue.includes('support')) {
                    return true;
                }
            }

        } catch {
            return false;
        }

        return false;
    }

    // فحص الكلمات المفتاحية
    function containsAdKeyword(text) {
        if (!text || text.length < 3) return false;
        const lowerText = text.toLowerCase().trim();
        return adKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
    }

    // إزالة فورية للعناصر
    function removeElementImmediately(element) {
        if (!element || !element.parentNode || removedElements.has(element)) {
            return false;
        }

        try {
            // تسجيل العنصر المحذوف
            removedElements.add(element);
            performanceMetrics.elementsRemoved++;

            // إخفاء فوري
            element.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute !important; left: -9999px !important; top: -9999px !important; width: 0 !important; height: 0 !important; overflow: hidden !important; pointer-events: none !important;';

            // حذف العنصر
            element.remove();

            return true;
        } catch (e) {
            console.debug('Error removing element:', e);
            return false;
        }
    }

    // === الفحص الشامل والتنظيف ===

    // فحص عميق للصفحة
    function performDeepScan(source = 'unknown') {
        performanceMetrics.scansPerformed++;
        console.debug(`Performing deep scan - Source: ${source}`);

        let removedCount = 0;

        try {
            // فحص جميع العناصر
            const allElements = document.querySelectorAll('*');
            allElements.forEach(element => {
                if (isElementSuspicious(element)) {
                    if (removeElementImmediately(element)) {
                        removedCount++;
                    }
                }
            });

            // فحص خاص للعناصر المحقونة حديثاً
            dynamicElementsLog.forEach(entry => {
                if (Date.now() - entry.timestamp < 30000) { // آخر 30 ثانية
                    if (entry.element && entry.element.parentNode) {
                        if (isElementSuspicious(entry.element)) {
                            if (removeElementImmediately(entry.element)) {
                                removedCount++;
                            }
                        }
                    }
                }
            });

            if (removedCount > 0) {
                console.debug(`Deep scan removed ${removedCount} elements`);
            }

        } catch (e) {
            console.debug('Error in deep scan:', e);
        }

        return removedCount;
    }

    // إزالة العناصر المزعجة (الدالة الرئيسية)
    function removeAnnoyingElements() {
        let removedCount = 0;

        // فحص سريع بالمحددات
        adSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (removeElementImmediately(element)) {
                        removedCount++;
                    }
                });
            } catch (e) {
                console.debug('Error with selector:', selector, e);
            }
        });

        // فحص النصوص
        const textElements = document.querySelectorAll('div, span, p, a, button, h1, h2, h3, h4, h5, h6, li, td, th');
        textElements.forEach(element => {
            if (removedElements.has(element)) return;

            const text = element.textContent || element.innerText || '';
            if (containsAdKeyword(text) && text.length < 1000) {
                const isMainContent = element.closest('main, article, .content, #content, .post, .video, .story, .news');
                if (!isMainContent) {
                    if (removeElementImmediately(element)) {
                        removedCount++;
                    }
                }
            }
        });

        return removedCount;
    }

    // === الحماية من النوافذ المنبثقة ===

    function blockPopups() {
        if (window.__popupBlocked) return;
        window.__popupBlocked = true;

        // حظر window.open
        const originalOpen = window.open;
        window.open = function(url, name, features) {
            console.debug('Blocked popup:', url);
            performanceMetrics.injectionsBlocked++;
            return {
                focus: function() {},
                blur: function() {},
                close: function() {},
                closed: false,
                location: { href: '' },
                postMessage: function() {}
            };
        };

        // حظر أحداث النقر المشبوهة
        ['click', 'mousedown', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, function(e) {
                const target = e.target.closest('a, button, [onclick], [data-url]');
                if (!target) return;

                const href = target.getAttribute('href') || target.getAttribute('data-url') || '';
                const onclick = target.getAttribute('onclick') || '';
                const targetAttr = target.getAttribute('target');

                if (targetAttr === '_blank' ||
                    onclick.includes('window.open') ||
                    onclick.includes('popup') ||
                    Array.from(blockedDomains).some(domain => href.includes(domain))) {

                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    performanceMetrics.injectionsBlocked++;
                    return false;
                }
            }, { capture: true, passive: false });
        });
    }

    // === حقن CSS المتقدم ===

    function injectAdvancedCSS() {
        if (document.getElementById('advanced-dynamic-ad-blocker-style')) return;

        const style = document.createElement('style');
        style.id = 'advanced-dynamic-ad-blocker-style';
        style.textContent = `
            /* النوافذ المنبثقة والحوارات */
            [role="dialog"], [role="alertdialog"], .modal, .popup, .overlay, .backdrop, .lightbox,
            [x-show="isOpen"], [x-show="show"], [x-show="visible"], [x-show="modal"],
            [x-data*="modal"], [x-data*="popup"], [x-data*="overlay"], [x-data*="support"],
            [wire\\:id], [wire\\:snapshot], [v-if*="modal"], [v-show*="modal"],
            [data-modal="true"], [data-popup="true"], [data-overlay="true"],
            
            /* محددات خاصة بالموقع - Anime3rb */
            [wire\\:snapshot*="support"], [wire\\:id="edkunfxlJzs2acN5L7L8"],
            [wire\\:snapshot*="name\\":\\"support"],
            div[class*="flex flex-col gap-8 text-center"],
            div[class*="bg-white dark:bg-dark-700 flex flex-col gap-8"],
            
            /* العناصر المشبوهة */
            [id*="modal"], [class*="modal"], [id*="popup"], [class*="popup"],
            [id*="overlay"], [class*="overlay"], [id*="backdrop"], [class*="backdrop"],
            [id*="ad"]:not([id*="add"]):not([id*="address"]):not([id*="admin"]),
            [class*="ad"]:not([class*="add"]):not([class*="address"]):not([class*="admin"]),
            [id*="ads"], [class*="ads"], [id*="banner"], [class*="banner"],
            [id*="promo"], [class*="promo"], [id*="sponsor"], [class*="sponsor"],
            
            /* الدعم والاشتراكات */
            #support, [id*="support"], [class*="support"], [id*="premium"], [class*="premium"],
            [id*="subscription"], [class*="subscription"], [id*="donate"], [class*="donate"],
            [id*="membership"], [class*="membership"],
            
            /* الإطارات المشبوهة */
            iframe[src*="ads"], iframe[src*="doubleclick"], iframe[src*="googlesyndication"],
            iframe[src*="googleadservices"], iframe[src*="amazon-adsystem"],
            iframe[src*="outbrain"], iframe[src*="taboola"], iframe[src*="propeller"],
            
            /* العناصر المحقونة بتأخير */
            [data-delay], [data-timeout], [data-timer], [data-show-after],
            [data-inject-after], [data-load-after], [data-appear-after],
            
            /* عناصر عالية المستوى */
            [style*="z-index: 999"], [style*="z-index: 9999"], [style*="z-index: 99999"],
            [style*="position: fixed"][style*="width: 100%"][style*="height: 100%"],
            [style*="position: absolute"][style*="width: 100vw"][style*="height: 100vh"],
            
            /* عناصر الطبقات الشفافة */
            .bg-dark-900\/60, [class*="bg-dark-900"][class*="fixed"], [class*="bg-dark-900"][class*="absolute"],
            [class*="bg-black"][class*="opacity"], [class*="bg-dark"][class*="opacity"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                width: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
                z-index: -1 !important;
            }
            
            /* منع قفل التمرير */
            body, html {
                overflow: auto !important;
                position: static !important;
                height: auto !important;
            }
            
            /* منع الطبقات الإضافية */
            body::before, body::after, html::before, html::after {
                display: none !important;
            }
        `;

        document.head.appendChild(style);
    }

    // === التنظيف الدوري المتقدم ===

    function startAdvancedPeriodicCleanup() {
        // تنظيف فائق السرعة
        const ultraFastId = setInterval(() => {
            removeAnnoyingElements();
        }, CONFIG.INTERVALS.ULTRA_FAST);
        intervals.push(ultraFastId);

        // تنظيف سريع
        const fastId = setInterval(() => {
            performDeepScan('fast-cleanup');
        }, CONFIG.INTERVALS.FAST);
        intervals.push(fastId);

        // تنظيف عادي
        const normalId = setInterval(() => {
            removeAnnoyingElements();
            blockSuspiciousLinks();
        }, CONFIG.INTERVALS.NORMAL);
        intervals.push(normalId);

        // فحص عميق
        const deepId = setInterval(() => {
            performDeepScan('deep-cleanup');
            cleanupDynamicElementsLog();
        }, CONFIG.INTERVALS.DEEP_SCAN);
        intervals.push(deepId);

        // تنظيف شامل
        const cleanupId = setInterval(() => {
            performDeepScan('comprehensive-cleanup');
            logPerformanceMetrics();
            
            // إعادة حقن CSS إذا لزم الأمر
            if (!document.getElementById('advanced-dynamic-ad-blocker-style')) {
                injectAdvancedCSS();
            }
        }, CONFIG.INTERVALS.CLEANUP);
        intervals.push(cleanupId);
    }

    // === وظائف مساعدة ===

    function blockSuspiciousLinks() {
        document.querySelectorAll('a').forEach(link => {
            if (removedElements.has(link)) return;

            const href = link.getAttribute('href') || '';
            const onclick = link.getAttribute('onclick') || '';

            if (Array.from(blockedDomains).some(domain => href.includes(domain))) {
                link.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    performanceMetrics.injectionsBlocked++;
                    return false;
                }, { capture: true, passive: false });

                removeElementImmediately(link);
            }
        });
    }

    function cleanupDynamicElementsLog() {
        const fiveMinutesAgo = Date.now() - 300000;
        dynamicElementsLog = dynamicElementsLog.filter(entry => entry.timestamp > fiveMinutesAgo);
    }

    function logPerformanceMetrics() {
        const runtime = Date.now() - performanceMetrics.startTime;
        console.debug('Ad Blocker Performance:', {
            runtime: Math.round(runtime / 1000) + 's',
            elementsRemoved: performanceMetrics.elementsRemoved,
            injectionsBlocked: performanceMetrics.injectionsBlocked,
            scansPerformed: performanceMetrics.scansPerformed,
            dynamicElementsTracked: dynamicElementsLog.length
        });
    }

    // === التهيئة الرئيسية ===

    function init() {
        if (isInitialized) return;
        
        console.debug('Initializing Advanced Dynamic Ad Blocker...');
        
        // تطبيق CSS فوراً
        injectAdvancedCSS();
        
        // حظر النوافذ المنبثقة
        blockPopups();
        
        // تنظيف أولي
        const initialRemoved = removeAnnoyingElements();
        console.debug('Initial cleanup removed:', initialRemoved);
        
        // بدء المراقبة المتقدمة
        monitorRecentlyAddedElements();
        monitorDOMChanges();
        monitorDelayedInjections();
        
        // بدء التنظيف الدوري
        startAdvancedPeriodicCleanup();
        
        // حظر الروابط المشبوهة
        blockSuspiciousLinks();
        
        // إزالة الطبقات الشفافة التي تغطي الشاشة
        removeTransparentOverlays();
        
        // إضافة مراقب للطبقات الشفافة
        monitorTransparentOverlays();
        
        isInitialized = true;
        console.debug('Advanced Dynamic Ad Blocker initialized successfully');
    }

    // === بدء التشغيل المتقدم ===

    // تشغيل فوري
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // تشغيل احتياطي
    setTimeout(init, 100);
    setTimeout(init, 500);
    setTimeout(init, 1000);

    // مراقبة تغييرات الصفحة
    let currentUrl = location.href;
    setInterval(() => {
        if (location.href !== currentUrl) {
            currentUrl = location.href;
            setTimeout(init, 500);
        }
    }, 1000);

    // إعادة تهيئة عند التركيز
    window.addEventListener('focus', () => {
        setTimeout(() => {
            performDeepScan('focus-event');
            removeAnnoyingElements();
        }, 300);
    });

    // مراقبة تغييرات الرؤية
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(() => {
                performDeepScan('visibility-change');
                removeAnnoyingElements();
            }, 500);
        }
    });

    // مراقبة أحداث التمرير (قد تظهر إعلانات عند التمرير)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            removeAnnoyingElements();
        }, 1000);
    });

    // مراقبة تغيير حجم النافذة
    window.addEventListener('resize', () => {
        setTimeout(() => {
            performDeepScan('resize-event');
        }, 500);
    });

    // مراقبة النقر (قد تظهر إعلانات عند النقر)
    document.addEventListener('click', (e) => {
        // فحص بعد النقر بثانية واحدة
        setTimeout(() => {
            removeAnnoyingElements();
        }, 1000);
        
        // فحص بعد النقر بـ 3 ثوانٍ
        setTimeout(() => {
            performDeepScan('click-event');
        }, 3000);
    });

    // مراقبة تحميل الصور والموارد (قد تحتوي على إعلانات)
    const imageObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                const element = mutation.target;
                if (element.tagName === 'IMG' || element.tagName === 'IFRAME') {
                    setTimeout(() => {
                        checkAndRemoveElement(element);
                    }, 500);
                }
            }
        });
    });

    imageObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['src'],
        subtree: true
    });

    observers.push(imageObserver);

    // مراقبة تغييرات الأنماط (CSS) - قد تُستخدم لإظهار إعلانات مخفية
    const styleObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                const element = mutation.target;
                
                // فحص إذا كان العنصر أصبح مرئياً فجأة
                if (element.style.display !== 'none' && 
                    element.style.visibility !== 'hidden' && 
                    element.style.opacity !== '0') {
                    
                    setTimeout(() => {
                        if (isElementSuspicious(element)) {
                            removeElementImmediately(element);
                        }
                    }, 100);
                }
            }
        });
    });

    styleObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['style', 'class', 'id'],
        subtree: true
    });

    observers.push(styleObserver);

    // مراقبة الاستجابة للشبكة (Ajax/Fetch) - قد تجلب إعلانات
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const response = originalFetch.apply(this, args);
        
        // فحص بعد تحميل المحتوى
        response.then(() => {
            setTimeout(() => {
                performDeepScan('fetch-response');
            }, 1000);
        }).catch(() => {
            // تجاهل الأخطاء
        });
        
        return response;
    };

    // مراقبة XMLHttpRequest
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        this.addEventListener('load', () => {
            setTimeout(() => {
                performDeepScan('xhr-response');
            }, 1000);
        });
        
        return originalXhrOpen.apply(this, [method, url, ...args]);
    };

    // مراقبة إضافة العقد النصية (قد تحتوي على نصوص إعلانية)
    const textObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.textContent || '';
                        if (containsAdKeyword(text)) {
                            const parentElement = node.parentNode;
                            if (parentElement && isElementSuspicious(parentElement)) {
                                removeElementImmediately(parentElement);
                            }
                        }
                    }
                });
            }
        });
    });

    textObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    observers.push(textObserver);

    // === حماية إضافية من التلاعب ===

    // منع إعادة تعريف الدوال المهمة
    Object.defineProperty(window, 'open', {
        value: window.open,
        writable: false,
        configurable: false
    });

    // منع تعديل الأنماط المحقونة
    const styleElement = document.getElementById('advanced-dynamic-ad-blocker-style');
    if (styleElement) {
        Object.defineProperty(styleElement, 'textContent', {
            writable: false,
            configurable: false
        });
    }

    // مراقبة محاولات حذف الأنماط
    const styleProtectionObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.removedNodes.forEach(node => {
                    if (node.id === 'advanced-dynamic-ad-blocker-style') {
                        // إعادة حقن الأنماط فوراً
                        setTimeout(() => {
                            injectAdvancedCSS();
                        }, 10);
                    }
                });
            }
        });
    });

    styleProtectionObserver.observe(document.head, {
        childList: true
    });

    observers.push(styleProtectionObserver);

    // === تنظيف الموارد عند إغلاق الصفحة ===

    window.addEventListener('beforeunload', () => {
        // تنظيف المراقبات
        observers.forEach(observer => {
            try {
                observer.disconnect();
            } catch (e) {
                console.debug('Error disconnecting observer:', e);
            }
        });

        // تنظيف المؤقتات
        intervals.forEach(intervalId => {
            clearInterval(intervalId);
        });

        timeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });

        // تسجيل الإحصائيات النهائية
        logPerformanceMetrics();
    });

    // === رسائل تشخيصية (يمكن إزالتها في الإنتاج) ===

    // طباعة حالة السكريبت كل دقيقة
    setInterval(() => {
        console.debug('Ad Blocker Status:', {
            isActive: isInitialized,
            observersCount: observers.length,
            intervalsCount: intervals.length,
            timeoutsCount: timeouts.length,
            currentUrl: location.href
        });
    }, 60000);

    // إضافة اختصار لوحة المفاتيح للفحص اليدوي (Ctrl+Shift+X)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'X') {
            console.log('Manual deep scan triggered');
            const removed = performDeepScan('manual-trigger');
            console.log(`Manual scan removed ${removed} elements`);
        }
    });

    // === اكتشاف وحظر تقنيات التهرب المتقدمة ===

    // مراقبة السكريبتات المضافة ديناميكياً
    const scriptObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SCRIPT') {
                        const src = node.getAttribute('src') || '';
                        const content = node.textContent || '';
                        
                        // فحص السكريبتات المشبوهة
                        if (Array.from(blockedDomains).some(domain => src.includes(domain)) ||
                            adKeywords.some(keyword => content.includes(keyword))) {
                            
                            removeElementImmediately(node);
                            performanceMetrics.injectionsBlocked++;
                        }
                    }
                });
            }
        });
    });

    scriptObserver.observe(document.head, {
        childList: true,
        subtree: true
    });

    scriptObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    observers.push(scriptObserver);

    // اكتشاف وحظر Shadow DOM المشبوه
    const originalAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function(options) {
        const shadowRoot = originalAttachShadow.call(this, options);
        
        // مراقبة Shadow DOM للإعلانات
        setTimeout(() => {
            const shadowContent = shadowRoot.innerHTML;
            if (adKeywords.some(keyword => shadowContent.includes(keyword))) {
                this.remove();
                performanceMetrics.injectionsBlocked++;
            }
        }, 100);
        
        return shadowRoot;
    };

    console.debug('Advanced Dynamic Ad Blocker fully initialized and protected!');

})();