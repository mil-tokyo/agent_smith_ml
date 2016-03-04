// The MIT License (MIT)

// Copyright (c) 2014 Machine Intelligence Laboratory (The University of Tokyo)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/* --- logistic --- */

(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
		require('../utils/utils.js');
		require('../utils/statistics.js');
		require('../utils/checkargs.js');
		require('./linear_model');
		require('./base');
    }

    // alias
    var $S = Tempura.Utils.Statistics;
    var $C = Tempura.Utils.Check;
    var $Base = Tempura.LinearModel.Base;

    // init
    Tempura.LinearModel.Logistic = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.eta = (typeof args.eta === 'undefined') ? 0.01 : args.eta; // learning ratio for delta Error
	this.alpha = (typeof args.alpha === 'undefined') ? 0.0015 : args.alpha; // l2-regularization strength
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.n_iter = (typeof args.n_iter === 'undefined') ? 100 : args.n_iter;
    };
    var $Logistic = Tempura.LinearModel.Logistic.prototype;

    // fit
    $Logistic.fit = function(X, y) {
	// check data property
	var inst_list = [X,y];
	$C.checkArgc( arguments.length, 2 );
	$C.checkInstance( inst_list );
	$C.checkSampleNum( inst_list );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// train ( for now, activation:softmax, loss:cross entropy, optimization:gradient discent )
	var bias = new $M( X.rows, 1 ); bias.zeros(1.0);
	var X_dash = $M.hstack([ bias, X ]);
	var w = new $M( X_dash.cols , y.cols ); w.zeros();
	var error
	for (var iter=0; iter<this.n_iter; iter++) {
	    var pred = $M.sub( y, $S.softmax( $M.mul( X_dash, w ) ) );
	    var delta = $M.sub( $M.mul( X_dash.t(), pred ), w.clone().times(this.alpha) );
	    w.add( delta.times( this.eta ) );
	    if (iter == this.n_iter-1) {
		console.log('train finished (max_iteration has done)');
	    }
	}
	this.weight = w;
	return this
    };

    // predict
    $Logistic.predict = function(X) {
	// check data property
	var bias = new $M( X.rows, 1 ); bias.zeros(1.0);
	var X_dash = $M.hstack([ bias, X ]);
	var inst_list = [X_dash];
	$C.checkInstance( inst_list );
	$C.checkDataDim( X_dash, this.weight );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// estimate
	var pred = $S.softmax( $M.mul( X_dash, this.weight ) );
	return pred
    };
})(typeof window === 'undefined', Sushi.Matrix, Tempura);
