var nodejs = (typeof window === 'undefined');

if (nodejs) {
    var AgentSmithML = require('../agent_smith_ml');
    require('./neighbors.js');
    require('./nearest_neighbors.js');
}

var $M = AgentSmith.Matrix;

AgentSmithML.Neighbors.KNeighborsClassifier = function(args) {
    if (typeof args === 'undefined') args = {};

    AgentSmithML.Neighbors.NearestNeighbors.apply(this);

    this.n_neighbors = typeof args.n_neighbors === 'undefined' ? 5         : args.n_neighbors;
    this.algorithm   = typeof args.algorithm   === 'undefined' ? 'auto'    : args.algorithm;
    this.leaf_size   = typeof args.leaf_size   === 'undefined' ? 30     : args.leaf_size;
    this.weights     = typeof args.weights     === 'undefined' ? 'uniform' : args.weights;
}

AgentSmithML.Neighbors.KNeighborsClassifier.prototype = Object.create(AgentSmithML.Neighbors.NearestNeighbors.prototype, {
    constructor: {
        value: AgentSmithML.Neighbors.KNeighborsClassifier,
        enumerabule: false,
        writable: true,
        configurable: true
    }
});

AgentSmithML.Neighbors.KNeighborsClassifier.prototype.fit = function(X, y) {
    if (typeof X === 'undefined') throw new Error('X must be set');
    if (!(X instanceof $M)) throw new TypeError('X must be an instance of AgentSmith.Matrix');
    if (typeof y === 'undefined') throw new Error('y must be set');
    if (!(y instanceof $M)) throw new TypeError('y must be an instance of AgentSmith.Matrix');
    this._fit_X = X;
    this.y = y;

    this._fit_method = this.algorithm;

    // TODO
    if (this._fit_method === 'auto') {
        this._fit_method = 'brute';
    }

    return this;
}

AgentSmithML.Neighbors.KNeighborsClassifier.prototype.predict = function(X) {
    var neigh = this.kneighbors(X);
    var weights = this._get_weights(neigh[0], self.weights);

    var sum = new $M(X.rows, $M.max(this.y)+1);
    var y = this.y;
    neigh[1].forEach(function(sample_id,k){
        var neigh_ind = neigh[1].get(sample_id,k);
        var class_id = y.get(0,neigh_ind);
        sum.set(sample_id, class_id, sum.get(sample_id, class_id)+weights.get(sample_id, k));
    });

    var res = $M.argmaxEachRow(sum);
    return res;
}

AgentSmithML.Neighbors.KNeighborsClassifier.prototype._get_weights = function(dist, weights) {
    var ones = (new $M(dist.rows, dist.cols)).setEach(function(){ return 1;});
    if (weights === 'uniform' || weights === null || typeof weights === 'undefined') {
        return ones;
//        return null;
    } else if (weights === 'distance') {
        return ones.divEach(dist);
    } else {
        throw TypeError('Unsupported weight type: ' + weights);
    }
}