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

/* --- linear regression --- */
(function(nodejs, $M, Tempura){
    // node
    if (nodejs) {
		require('../utils/utils.js');
		require('../utils/statistics.js');
		require('../utils/checkargs.js');
		require('./linear_model');
    }

    // alias
    var $S = Tempura.Utils.Statistics;
    var $C = Tempura.Utils.Check;

    // init
    Tempura.LinearModel.LinearRegression = function(args) {
	if (typeof args === 'undefined') { var args = {}; }
	this.center = (typeof args.center === 'undefined') ? true : args.center;
	this.normalize = (typeof args.normalize === 'undefined') ? true : args.normalize;
	this.solver = (typeof args.solver === 'undefined') ? 'qr' : args.solver;
    };
    var $LinReg = Tempura.LinearModel.LinearRegression.prototype;

    // fit
    $LinReg.fit = function(X, y) {
	// check data property
	var inst_list = [X,y];
	$C.checkArgc( arguments.length, 2 );
	$C.checkInstance( inst_list );
	$C.checkSampleNum( inst_list );
	$C.checkHasData( inst_list );
	$C.checkHasNan( inst_list );
	// make data centered
	var meanStd = $S.meanStd( this.center, this.normalize, X, y);
	// solver
	if (this.solver === 'lsqr') { // nomal equation
	    var tmp = $M.mul( meanStd.X.t(), meanStd.X);
	    var w = $M.mul( $M.mul( tmp.inverse(), meanStd.X.t() ), meanStd.y );
	} else if (this.solver === 'qr') { // qr decomposition
	    if (X.rows >= X.cols) {
		var qr = $M.qr(meanStd.X);
		var q1 = $M.extract( qr.Q, 0, 0, X.rows, X.cols);
		var r1 = $M.extract( qr.R, 0, 0, X.cols, X.cols);
		var w = $S.fbSubstitution( r1, $M.mul( q1.t(), meanStd.y) );
	    } else {
		var qr = $M.qr(meanStd.X.t());
		var r1 = $M.extract( qr.R, 0, 0, X.rows, X.rows);
		qr.R.print();
		qr.Q.print();
		r1.print();
		var tmp = $S.fbSubstitution( r1.t(), meanStd.y );
		var zeromat = new $M(X.cols-X.rows,y.cols); zeromat.zeros();
		var w = $M.mul( qr.Q, $M.vstack([tmp, zeromat]) );
	    }
	} else {
	    throw new Error('solver should be lsqr or qr, and others have not implemented');
	}

	// store variables
	this.weight = (this.center) ? $M.divEach( w, meanStd.X_std.t() ) : w;
	if (this.center) {
	    this.intercept = $M.sub(meanStd.y_mean, $M.mul(meanStd.X_mean, this.weight));
	} else {
	    var tmp = new $M( 1, y.cols );
	    this.intercept = tmp.zeros();
	}
	return this
    };

    // predict
    $LinReg.predict = function(X) {
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
