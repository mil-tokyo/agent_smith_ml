var nodejs = (typeof window === 'undefined');
if (nodejs) {
    var TestMain = require('../main');
    var Sushi = require('../../sushi/src/sushi');
    require('../../sushi/src/sushi_cl');
    
	var Tempura = require('../../src/tempura');
    require('../../src/neighbors/neighbors.js');
    require('../../src/neighbors/nearest_neighbors.js');
}

var $M = Sushi.Matrix;

var samples = $M.fromArray([[1,1],[2,2]]);

TestMain.Tester.addTest('NearestNeighborTest', [
    {
        name : 'DefaultOptions',
        test : function() {
            var neigh = new Tempura.Neighbors.NearestNeighbors();

            if ( (typeof neigh.algorithm !== 'undefined' && neigh.algorithm === 'auto')
                && (typeof neigh.leaf_size !== 'undefined' && neigh.leaf_size == 30)
                && (typeof neigh.n_neighbors !== 'undefined' && neigh.n_neighbors == 5)
                && (typeof neigh.radius !== 'undefined' && neigh.radius == 1.0)) {
                return true;
            } else {
                return false;
            }
        }
    },
    {
        name: 'kneighbors',
        test: function() {
            var samples = $M.fromArray([[-1, -1], [-2, -1], [-3, -2], [1, 1], [2, 1], [3, 2]]);

            var neigh = new Tempura.Neighbors.NearestNeighbors({n_neighbors: 2});
            neigh.fit(samples);

            var ans = $M.fromArray([
                [0,1],
                [1,0],
                [2,1],
                [3,4],
                [4,3],
                [5,4]
            ]);
            var ans_dist = $M.fromArray([
                [0,1],
                [0,1],
                [0,Math.sqrt(2)],
                [0,1],
                [0,1],
                [0,Math.sqrt(2)]
            ]);

            var res = neigh.kneighbors(samples, {return_distance: false});
            var res_with_dist = neigh.kneighbors(samples, {return_distance: true});

            return (ans.equals(res) && ans.equals(res_with_dist[1]) && ans_dist.equals(res_with_dist[0]));
        }
    },
    {
        name: 'Functions_throw_exception_if_invalid_instance_given',
        test: function() {
            var neigh = new Tempura.Neighbors.NearestNeighbors(2, 0.4);
            try {
                neigh.fit($M.toArray(samples));
                return false;
            } catch(e) {
                if (!(e instanceof TypeError)) {
                    throw e;
                    return false;
                }
            }

            neigh.fit(samples);

            try {
                neigh.kneighbors([0, 0, 1.3], 2, {'return_distance': false});
                return false;
            } catch(e) {
                if (!(e instanceof TypeError)) {
                    throw e;
                    return false;
                }
            }

            try {
                neigh.radius_neighbors([0, 0, 1.3], 0.4, {'return_distance': false});
                return false;
            } catch(e) {
                if (!(e instanceof TypeError)) {
                    throw e;
                    return false;
                }
            }

            return true;
        }
    }
]);
