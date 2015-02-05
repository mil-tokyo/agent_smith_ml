(function(nodejs, $M, Neo) {
	
	if (nodejs) {
		var Neo = require('../neo');
		require('./neighbors.js');
	}
	
	Neo.Neighbors.NearestNeighbors = function(args) {
		if (typeof args === 'undefined') args = {};
		this.n_neighbors = typeof args.n_neighbors === 'undefined' ? 5	  : args.n_neighbors;
		this.radius	  = typeof args.radius	  === 'undefined' ? 1.0	: args.radius;
		this.algorithm   = typeof args.algorithm   === 'undefined' ? 'auto' : args.algorithm;
		this.leaf_size   = typeof args.leaf_size   === 'undefined' ? 30	 : args.leaf_size;
	}

	Neo.Neighbors.NearestNeighbors.prototype.fit = function(X, y) {
		if (typeof X === 'undefined') throw new Error('X must be set');
		if (!(X instanceof $M)) throw new TypeError('X must be an instance of AgentSmith.Matrix');
		this._fit_X = X;
		this.y = typeof y === 'undefined' ? null : y;

		this._fit_method = this.algorithm;

		// TODO
		if (this._fit_method === 'auto') {
			this._fit_method = 'brute';
		}

		return this;
	}

	Neo.Neighbors.NearestNeighbors.prototype.kneighbors = function(X, args) {
		if (!(X instanceof $M)) throw new TypeError('X must be an instance of AgentSmith.Matrix');

		if (typeof args === 'undefined') args = {};
		if (typeof args.n_neighbors === 'undefined') args.n_neighbors = this.n_neighbors;
		if (typeof args.return_distance === 'undefined') args.return_distance = true;

		if (this._fit_method === 'brute') {
			dist = Neo.Metrics.Pairwise.euclidean_distances(X, this._fit_X, true); // TODO: Remove the restrict of metrics (euclidean_distances() is only supported now) and select metric dynamically

			// initialize indices arrays
			var indices = new Array(dist.rows);
			for (var row=0 ; row<dist.rows ; row++){
				indices[row] = new Array(dist.cols);
				for (var i=0 ; i<dist.cols ; i++){
					indices[row][i] = i;
				}
			}

			// sort
			for (var row=0 ; row<dist.rows ; row++){
				indices[row].sort(function(v1, v2){
					return dist.get(row,v1) - dist.get(row,v2);
				});
				indices[row] = indices[row].slice(0, args.n_neighbors);
			}

			if (args.return_distance) {
				var distances = new Array(dist.rows);
				for (var row=0 ; row<dist.rows ; row++){
					distances[row] = new Array(args.n_neighbors);
					for (var i=0; i<args.n_neighbors ; i++){
						distances[row][i] = Math.sqrt(dist.get(row,indices[row][i]));
					}
				}
				return [$M.fromArray(distances), $M.fromArray(indices)];
			} else {
				return $M.fromArray(indices);
			}
		} else {
			throw new Error('Invalid algorithm specified');
		}

	}

	Neo.Neighbors.NearestNeighbors.prototype.radius_neighbors = function(X, radius, return_distance) {
		if (!(X instanceof $M)) throw new TypeError('X must be an instance of AgentSmith.Matrix');
		if (typeof radius === 'undefined') radius = this.radius;
		if (typeof return_distance === 'undefined') return_distance = true;

		throw new Error('Not implemented');
		if (this._fit_method === 'brute') {
			dist = Neo.Metrics.Pairwise.euclidean_distances(X, this._fit_X, true); // TODO: Remove the restrict of metrics (euclidean_distances() is only supported now) and select metric dynamically

			// select indices whose distances are smaller than radius
			for (var row=0 ; row<dist.rows ; row++){
				for (var col=0 ; col<dist.cols ; col++){
					if (dist.get(row,col) < radius){

					}
				}
			}
		} else {
			throw new Error('Invalid algorithm specified');
		}
	}
})(typeof window === 'undefined', AgentSmith.Matrix, Neo);