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

/* --- perceptron --- */

(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
		require('../../utils/utils.js');
		require('../../utils/statistics.js');
		require('../../utils/checkargs.js');
		require('./online_learning');
    }

    // alias
    var $S = Tempura.Utils.Statistics;
    var $C = Tempura.Utils.Check;
    var $Base = Tempura.LinearModel.Base;

    // init
    Tempura.LinearModel.OnlineLearning.Perceptron = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.eta = (typeof args.eta === 'undefined') ? 1.0 : args.eta;
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.n_iter = (typeof args.n_iter === 'undefined') ? 100 : args.n_iter;
    };
    var $Perceptron = Tempura.LinearModel.OnlineLearning.Perceptron.prototype;

    // fit
    /* target y as a matrix of [n_samples, 1] */
    $Perceptron.fit = function(X, y) {
	// check data property
	var inst_list = [X,y];
	$C.checkArgc( arguments.length, 2 );
	$C.checkInstance( inst_list );
	$C.checkSampleNum( inst_list );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// train
	var meanStd = $S.meanStd( this.center, false, X, y );
	var w = new $M(X.cols,1); w.zeros();
	for (var iter=0; iter<this.n_iter; iter++) {
	    var flag = true;
	    for (var row=0; row<X.rows; row++) {
		var tmp = $M.getRow(meanStd.X,row).t();
		var pred = $M.dot(tmp, w);
		var target = y.get(row,0);
		if (pred*target > 0) { // correct
		    continue;
		} else { // mistake
		    flag = false;
		    w.add( tmp.times( this.eta * target ) );
		}
	    }
	    // check convergence
	    if (flag) {
		console.log('train finished (all samples are classified correctly)');
		break;
	    }
	    if (iter == this.n_iter-1) {
		console.log('train finished (max_iteration has done)');
	    }
	}
	this.weight = w;
	// store variables
	if (this.center) {
	    this.intercept = $M.sub(meanStd.y_mean, $M.mul(meanStd.X_mean, this.weight));
	} else {
	    var tmp = new $M( 1, y.cols );
	    this.intercept = tmp.zeros();
	}
	return this
    };

    // predict
    $Perceptron.predict = function(X) {
	// check data property
	var inst_list = [X];
	$C.checkInstance( inst_list );
	$C.checkDataDim( X, this.weight );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// estimate
	var pred = $Base.binaryActivation( $M.add( $M.mul( X, this.weight ),  this.intercept ) );
	return pred
    };

    $Perceptron.decisionFunction = function(X) {
	// check data property
	var inst_list = [X];
	$C.checkInstance( inst_list );
	$C.checkDataDim( X, this.weight );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// estimate
	var pred = $M.add( $M.mul( X, this.weight ),  this.intercept );

	return pred

    };
})(typeof window === 'undefined', Sushi.Matrix, Tempura);
