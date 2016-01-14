

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
 * @param {type} data Event.data object
 */
QueryResultDb.prototype.saveQueryResults = function (data) {

    console.log("Saving new query results", data);

    if (!data.data)
        return;


    var key = this.getNextFreeKey();

    if (key === null)
        throw ("Could not get a free key for storing the query-data in local storage");


    data.data.id = key;
    var value = JSON.stringify(data.data);

    if (this.compress)
        value = LZString.compress(value);

    try {
        //console.log("Storing a query with key " + key);
        localStorage.setItem(this.prefix + key, value);

    } catch (QuotaExceededError) {

        var key_to_delete = this.getOldestKey();
        //console.log("Oops. Storage full. Deleting value '" + this.prefix + key_to_delete + "'");

        if (key_to_delete === null) {
            throw ("Can't get a key for deleting an old query from local storage!");
        }
        // MAY WORK BUT WHEN NEW RESULTS ARE PRETTY LARGER, IT MAY NOT BE SUFFICIENT!
        delete localStorage[this.prefix + key_to_delete];
        localStorage.setItem(this.prefix + key, value);
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