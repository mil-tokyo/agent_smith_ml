var nodejs = (typeof window === 'undefined');
if (nodejs) {
	var TestMain = require('../main');
	var Sushi = require('../../sushi/src/sushi');
	require('../../sushi/src/sushi_cl');
	var Tempura = require('../../src/tempura');
	require('../../src/linear_model/linear_model');
	require('../../src/linear_model/base.js');
	require('../../src/linear_model/perceptron');
}

TestMain.Tester.addTest('PerceptronTest', [
									   {
										   name : 'Perceptron',
											   test : function(callback) {
											   var $M = Sushi.Matrix;
											   var perceptron = new Tempura.LinearModel.Perceptron();

											   var X = $M.fromArray( [[0, 4, 3],
																	  [1, 5, 1],
																	  [2, 8, 2],
																	  [3, 5, 6]] );
											   var y = $M.fromArray( [[1],
																	  [-1],
																	  [1],
																	  [-1]] );
											   var sample = $M.fromArray( [[3, 3, 6],
																	  [2, 8, 2],
																	  [-2, 6, -3]] );

											   perceptron.fit(X,y);
											   var pred = perceptron.predict(sample);
											   console.log('weight');
											   perceptron.weight.print();
											   pred.print();
											   if (pred.nearlyEquals($M.fromArray( [[-1],
																					[1],
																					[1]] ))) {
												   return true;
											   }
											   return false;

										   }
									   },

												 ]);
