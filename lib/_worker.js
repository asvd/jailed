self.addEventListener("message", function(m){
    if (m.data.type == "initImport") {
        importScripts(m.data.url);
        self.postMessage({type: "initialized"});
    }
});