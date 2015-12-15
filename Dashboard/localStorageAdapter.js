/* customize the basic functionalties (length, key, getItem, setItem, clear) for storing data localy
 * in an object called "window.localStorageCustom/localStorageCustom"
 * all available technolgies (localStorage, sessionStorage, indexedDB) are used for different Browsers 
 * use window.localStorageCustom/localStorageCustom instead of window.localStorage/localStorage
 * */
(function(window, document) {
    var db = null;
    var storedElements = {};
    window.localStorageCustom= window.localStorage;
    if(!window.localStorageCustom && !window.sessionStorage) {
        window.localStorageCustom= window.sessionStorage;
    }
    if (!window.localStorageCustom && window.indexedDB) {
        var request = window.indexedDB.open("eexcess", 2);
        request.onupgradeneeded = function(e) {
            db = request.result;
            if (db.objectStoreNames.contains('data')) {
                db.deleteObjectStore('data');
            }

            store = db.createObjectStore("data", {
                keyPath : "key"
            });
            store.createIndex('by_value', 'value');

        };

        request.onsuccess = function(e) {
            db = request.result;
            getItmes();
            createLocalStorage();
        };
    }

    var getItmes = function() {
        var trans = db.transaction(['data'], "readwrite");
        var objectStore = trans.objectStore('data');
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                storedElements[cursor.value.key] = cursor.value.value;
                cursor.continue();
            } else {

            }
        };
    };

    var createLocalStorage = function() {
        // window.localStorage= {
        window.localStorageCustom = {
            "length" : Object.keys(storedElements).length,
            "key" : function(idx) {
                return (idx >= Object.keys(storedElements).length) ? null : storedElements[Object.keys(storedElements)[idx]].key;
            },
            "getItem" : function(key) {
                return !storedElements[key] ? null : storedElements[key];
            },
            "setItem" : function(key, value) {
                storedElements[key] = value;
                var dateObject = {
                    key : key,
                    value : value
                };
                var trans = db.transaction(['data'], "readwrite");
                var objectStore = trans.objectStore("data");
                var request = objectStore.put(dateObject);
                request.onerror = function(e) {
                    // 
                };
                request.onsuccess = function(e) {
                    // 
                };
            },
            "removeItem" : function(key) {
                //if (storedElements[key]) {
                delete storedElements[key];
                var objectStore = trans.objectStore("data");
                var request = objectStore.put(key);
                request.onsuccess = function(ev) {
                    //
                };
                request.onerror = function(ev) {
                    //
                };

                //}
            },
            "clear" : function() {
                storedElements = {};
                var objectStore = trans.objectStore("data");
                var request = objectStore.clear();
                request.onsuccess = function(ev) {
                    //
                };
                request.onerror = function(ev) {
                    //
                };
            }
        };

        // localStorage = window.localStorageCustom;
        localStorageCustom = window.localStorageCustom;
    };

})(this, this.document);
