(function() {
    window.WebAssistant = null;
    window.WebAssistantCb = null;

    var ngUI = false;
    var btnId = "help4enablenow";
    var MgrFrameWork = null;
    var mainClass = null;

    // SELECTOR DEFINITION
    var rules = ['DataAttrSelector', 'ClassSelector', 'EN_ScopeSelector'];

    function visible(elem) {
        return elem.style.visibility !== 'hidden';
    }

    function updateIndent(bIndent, indentWidth) {
        if (window.WebAssistantCb) WebAssistantCb('onHelpRequireIndent', bIndent, indentWidth);

        hdlClassChange(bIndent, document.body, 'wa-visible');

        // angular handles updates itself
        if (ngUI) return;

        // old manager UI handling
        var app = ctx.getInfo('APP');
        if (app) app.webAssistantWidth.call(app, bIndent ? indentWidth : 0);
    }

    function hdlClassChange(addClass, el, className) {
        if (addClass && !el.classList.contains(className)) {
            el.className += ' ' + className;
        } else if (!addClass && el.classList.contains(className)) {
            el.className = el.className.replace(' ' + className, '');
        }
    }

    (function initialize_web_assistant() {
        // XRAY-2559
        if (!(MgrFrameWork = window.UI6 || window.Help4)) {
            window.setTimeout(initialize_web_assistant, 1000);
            return;
        }

        // check if wa config and appName are set - postpone it not (see also XRAY-3398)
        if (!window.web_assistant_config || !window.web_assistant_config.appName) {
            window.setTimeout(initialize_web_assistant, 1000);
            return;
        }

        mainClass = MgrFrameWork && MgrFrameWork.MAIN_CLASS;

        // determine, if we are in the new or old world
        ngUI = location.href.search(/\/ng\//) !== -1;

        var containerID = 'head_identity';
        var afterID = 'head_logout';
        var loaderID = 'manager-loader';
        var code;
        var getEl = document.getElementById.bind(document);

        // get configuration
        var cfg = window.web_assistant_config;
        if (ngUI) {
            // new UI, set correct DOM ids and get language
            afterID = 'logout';
            containerID = 'banner';
            code = {
                1025: 'ar', // Arabic (Saudi Arabia)
                1031: 'de', // German
                1033: 'en', // English (US)
                1034: 'es', // Spanish (Spain)
                1036: 'fr', // French (France)
                1037: 'he', // Hebrew
                1043: 'nl', // Dutch (Netherlands)
                2052: 'zh-CN', // Chinese (Simplified)
                1042: 'ko', // Korean
                1041: 'ja', // Japanese
                1046: 'pt', // Portuguese (Brazil)
                1049: 'ru', // Russian
                2074: 'sr-SP', // Serbian
                1057: 'id', // Indonesian
                1054: 'th', // Thai
                1028: 'zh-TW', // Chinese (Traditional)
                1081: 'hi', // Hindi
                1040: 'it', // Italian
                1066: 'vi', // Vietnamese
                1038: 'hu', // Hungarian
                1029: 'cs', // Czech
                1045: 'pl', // Polish
                1035: 'fi', // Finish
                1030: 'da', // Danish
                1086: 'ms-MY', // Malay
                1055: 'tr', // Turkish
                1026: 'bg', // Bulgarian
                1087: 'kk', // Kazakh
                1051: 'sk'  // Slovak
            }[cfg.langCode || 1033];
            delete cfg.langCode;
        } else if (window.LANGUAGES) {
            // old manager - get language and check if compatible
            code = (LANGUAGES[ctx.getInfo('APP').getLanguage()] || {}).code;
        } else {
            code = 'en';
        }

        // check if framework already loaded - postpone if not
        if (!ngUI && (!document.body || !getEl(loaderID) || visible(getEl(loaderID)))) {
            window.setTimeout(initialize_web_assistant, 1000);
            return;
        }

        // check if DOM already present - postpone if not
        var oCustomHeader = getEl(containerID);
        if (!ngUI && !oCustomHeader) {
            window.setTimeout(initialize_web_assistant, 1000);
            return;
        }

        function createButton(buttonId) {
            // create the button and insert it
            var oHelpBtn = document.createElement('button');
            oHelpBtn.id = buttonId;
            // hide till we get callback from WebAssistant
            // will prevent flickering
            oHelpBtn.style.display = 'none';
            var helpInner = document.createElement('span');
            helpInner.className = 'inner';
            helpInner.innerText = '?';
            oHelpBtn.appendChild(helpInner);

            return oHelpBtn;
        }

        var oHelpBtn = !ngUI && createButton(btnId);
        if (oHelpBtn) oCustomHeader.insertBefore(oHelpBtn, getEl(afterID));  // insert enableNowButton into header.

        Help4.extendObject(cfg, {
            type: 'generic',
            serviceLayerVersion: 'WPB',
            buttonId: btnId,
            dataUrlWPB: cfg.dataUrlWPB.replace(/\/pub\//, '/wa/'),
            whatsNewDirect: cfg.show_whatsnew_direct,
            multipage: 1,
            language: code,
            rtl: code == 'ar' || code == 'he',
            accentBg: '#009de0',
            uiBg: '#046',
            focusBg: '#068',
            bubHeadBgCol: '#0d4c6c',
            solution: 'enable_now',
            allowMLTranslations: 1,

            // CALLBACK FUNCTIONS
            onHelpAvailable: function(bAvailable) {
                if (oHelpBtn) oHelpBtn.style.display = bAvailable ? '' : 'none';
                if (window.WebAssistantCb) WebAssistantCb('onHelpAvailable', bAvailable);
            },

            onHelpRequireIndent: updateIndent,

            onHelpMinimized: function(bMinimized) {
                if (oHelpBtn) {
                    hdlClassChange(false, oHelpBtn, bMinimized ? 'active' : 'minimize');
                    hdlClassChange(true, oHelpBtn, bMinimized ? 'minimize' : 'active');
                }
                if (window.WebAssistantCb) WebAssistantCb('onHelpMinimized', bMinimized);
            },

            onHelpActive: function(bActive) {
                if (oHelpBtn) {
                    hdlClassChange(false, oHelpBtn, 'minimize');
                    hdlClassChange(bActive, oHelpBtn, 'active');
                }
                if (window.WebAssistantCb) WebAssistantCb('onHelpActive', bActive);
            },

            selector: {
                blacklist: [],
                rules: rules,
                selectors: null
            }
        });

        // init Web Assistant
        Help4.init(cfg, true)
        .then(function(wa) {
            // connect the button with function, set first screen, make WebAssistant available in global variable
            if ((window.WebAssistant = wa) && oHelpBtn) oHelpBtn.onclick = wa.toggle.bind(wa);
        });
    })();
})();
