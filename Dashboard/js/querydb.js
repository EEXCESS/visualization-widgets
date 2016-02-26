

/**
 * Handling the storage of received query data in the browser's local storage
 * The local storage is limited to apr. 5MB. That would only allow about 60 queries and results to store.
 * To avoid that we use LZ-String library to compress the results in the local storage 
 * @author Peter Hasitschka
 * @returns {QueryResultDb}
 */
var QueryResultDb = function () {
    this.prefix = "eexcess_query_";
    this.max_queries = 100000;
    this.compress = true;

};

/**
 * Store data that was sent by catching a window message in starter.js
 * @param {type} obj Event.data object
 */
QueryResultDb.prototype.saveQueryResults = function (obj) {


    // SKIP DEMO DATA! OTHERWISE GETS SAVED EVERYTIME!

    if (obj.data && obj.data.profile && obj.data.profile.origin && obj.data.profile.origin.module)
        if (obj.data.profile.origin.module === "demo data")
            return;




    /**
     * Removing description-data of the results due to large data
     */
    var remove_description = true;

    if (remove_description && obj.data && obj.data.result) {

        for (var i = 0; i < obj.data.result.length; i++) {

            var res = obj.data.result[i];

            if (res.description !== undefined) {
                res.description = "TRUNCATED AT SAVING TO LOCALSTORAGE";
            }

            if (res.v2DataItem !== undefined && res.v2DataItem.description !== undefined) {
                res.v2DataItem.description = "TRUNCATED AT SAVING TO LOCALSTORAGE";
            }
        }
    }

    console.log("Saving new query results", obj);

    if (!obj.data)
        return;


    var key = this.getNextFreeKey();

    if (key === null)
        throw ("Could not get a free key for storing the query-data in local storage");


    obj.data.id = key;

    var value = JSON.stringify(obj.data);

    console.log("Saving new query with length " + value.length);

    if (this.compress)
        value = LZString.compress(value);


    this.forceStoring(this.prefix + key, value);

};


/**
 * Uses localStorage.setItem.
 * If 'QuotaExceededError' occurs the first item is deleted.
 * Repeated as long as necessary by recursive call
 * @param {type} key
 * @param {type} val
 */
QueryResultDb.prototype.forceStoring = function (key, val) {
    try {
        //console.log("Storing a query with key " + key);
        localStorage.setItem(key, val);

    } catch (QuotaExceededError) {

        var key_to_delete = this.getOldestKey();
        console.log("Oops. Storage full. Deleting value '" + this.prefix + key_to_delete + "'");

        if (key_to_delete === null) {
            throw ("Can't get a key for deleting an old query from local storage!");
        }

        delete localStorage[this.prefix + key_to_delete];
        this.forceStoring(key, val);
        //delete localStorage[this.prefix + key_to_delete];
        //localStorage.setItem(key, val);
    }
};

/**
 * Getting the lowest id (without prefix) that holds query data in the local storage
 * @returns {Number}
 */
QueryResultDb.prototype.getOldestKey = function () {

    for (var i = 0; i < this.max_queries; i++) {
        if (localStorage.getItem(this.prefix + i))
            return i;
    }
    return null;
};

/**
 * Get the next possible value for an id to store query data.
 * @returns {Number}
 */
QueryResultDb.prototype.getNextFreeKey = function () {

    var keys = Object.keys(localStorage);

    var int_keys = [];
    for (var i = 0; i < keys.length; i++) {
        var curr_key = keys[i];
        curr_key = curr_key.replace(this.prefix, "");
        curr_key = parseInt(curr_key);

        if (!isNaN(curr_key))
            int_keys.push(curr_key);
    }

    if (!int_keys.length)
        return 0;

    return Math.max.apply(null, int_keys) + 1;
};

/**
 * Get a query from the localstorage. Returns the corresponding object holding
 * query and result-array. If id not found, null gets returned
 * @param {integer} id
 * @returns {object|null} Holding [result] and [query] OR null
 */
QueryResultDb.prototype.getQuery = function (id) {
    var val = localStorage.getItem(this.prefix + id);

    if (!val)
        return null;

    if (this.compress)
        val = LZString.decompress(val);

    val = JSON.parse(val);

    return val;
};

/**
 * Get all stored queries in an ascending order.
 * @returns {Array}
 */
QueryResultDb.prototype.getAllQueriesOrdered = function () {

    var results = [];

    for (var i = this.getOldestKey(); i < this.getNextFreeKey(); i++) {
        var item = this.getQuery(i);
        if (item)
            results.push(item);
    }
    return results;
};


/**
 * Global object to access this class from everywhere
 * @type QueryResultDb
 */
var queryDb = new QueryResultDb();