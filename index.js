(function prepareWebAssistant() {
        // check requirements loaded - postpone if not
        if (!document.getElementsByTagName('head')[0] || !document.body) {
            window.setTimeout(()=>{console.log("hello")}, 5000);
            return;
        }})()  
