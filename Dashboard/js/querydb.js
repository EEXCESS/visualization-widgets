
var QueryResultDb = function () {
    console.log("QUERY DB SAVER INIT");

    this.prefix = "eexcess_query_";

    this.max_queries = 1000;

    this.compress = true;

};


QueryResultDb.prototype.saveQueryResults = function (data) {

    console.log("Saving new query results", data);

    if (!data.data)
        return;

    var query = data.data.query;
    var results = data.data.result;

    var key = this.getNextFreeKey();

    if (key === null)
        throw ("Could not get a free key for storing the query-data in local storage");

    var value = JSON.stringify(data.data);

    if (this.compress)
        value = LZString.compress(value);

    try {
        console.log("Storing a query with key " + key);
        localStorage.setItem(this.prefix + key, value);

    } catch (QuotaExceededError) {

        var key_to_delete = this.getOldestKey();

        console.log("Oops. Storage full. Deleting value '" + this.prefix + key_to_delete + "'");

        if (key_to_delete === null) {
            throw ("Can't get a key for deleting an old query from local storage!");
        }
        delete localStorage[this.prefix + key_to_delete];
        localStorage.setItem(this.prefix + key, value);
    }


};

QueryResultDb.prototype.getOldestKey = function () {

    for (var i = 0; i < this.max_queries; i++) {
        if (localStorage.getItem(this.prefix + i))
            return i;
    }

    return null;
};

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


QueryResultDb.prototype.getQuery = function (id) {
    var val = localStorage.getItem(this.prefix + id);

    if (!val)
        return null;

    if (this.compress)
        val = LZString.decompress(val);

    val = JSON.parse(val);

    return val;
};

var queryDb = new QueryResultDb();