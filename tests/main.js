var TestMain = {};

if (typeof window === 'undefined') {
		require('../sushi/src/sushi');
		require('../sushi/src/sushi_cl');
}

(function(Sushi, nodejs) {
	var $M = Sushi.Matrix;
	
	if ($M.CL) {
		console.log('using device : ' + $M.CL.device_info + ' (' + $M.CL.platform_info + ')');
	}
	
	TestMain.Tester = {
		tests : {},
		notifier : function(msg) { console.log(msg) },
		addTest : function(name, test_cases) {
			this.tests[name] = test_cases;
		},
		getTestNames : function() {
			return Object.keys(this.tests)
		},
		setNotifier : function(notifier) {
			this.notifier = notifier;
		},
		notify : function(msg) {
			this.notifier(msg);
		},
		doTest : function(name) {
			var idx = 0;
			var success = 0;
			var all = 0;
			var na = 0;
			var test_cases = this.tests[name];
			this.notify('START TEST')
			var doNextTest = function() {
				if (idx === test_cases.length) {
					this.notify('FINISH TEST');
					this.notify('SUCCESS : ' + success + ' / ' + all + ' (N/A ' + na + ')');
					this.notify('');
					return;
				}
				var start_time = (new Date()).getTime();
				var callback = function(result) {
					if (result === null) {
						this.notify('-- RESULT : N/A')
					} else {
						this.notify('-- RESULT : ' + result);
					}
					this.notify('elapsed time : ' + ((new Date()).getTime() - start_time) + ' ms');
					if (result === true) {
						success++;
					} else if (result === null) {
						na++;
					}
					if (result === true || result === false) {
						all++;
					}
					idx++;
					setTimeout(doNextTest.bind(this), 0);
				};
				var result = false;
				this.notify('- TEST CASE : ' + test_cases[idx].name);
				try {
					var result = test_cases[idx].test(callback.bind(this));
				} catch (exception) {
					this.notify('-- exception catched');
					console.error(exception);
				} finally {
					if (result !== void 0) {
						callback.call(this, result);
					}
				}
			};
			doNextTest.call(this);
		}
	};
	
	if (nodejs) {
		module.exports = TestMain;
		var files = getJSFiles('./');
		for (var i =  0; i < files.length; i++) {
			require(files[i]);
		}
		setImmediate(function() {
			var test_names = TestMain.Tester.getTestNames();
			console.log('Choose the test to execute(0 ~ ' + (test_names.length - 1) + ')');
			for (var i = 0; i < test_names.length; i++) {
				console.log(i + ' : ' + test_names[i]);
			}
			var readline = require("readline").createInterface(process.stdin, process.stdout);
			readline.question("> ", function(value){
				value = parseInt(value);
				console.log('');
				if (isNaN(value) || value < 0 || value >= test_names.length) {
					console.log('Invalid input');
				} else {
					TestMain.Tester.doTest(test_names[value]);
				}
			    readline.close();
			});
		});

		function getJSFiles(dir) {
			var fs = require('fs');
			var files = [];
			var files_all = fs.readdirSync(__dirname + '/' + dir);
			var js_regex = new RegExp('.*\.js$');
			for (var i = 0; i < files_all.length; i++) {
				if (fs.statSync(__dirname + '/' + dir + files_all[i]).isDirectory()) {
					files = files.concat(getJSFiles(dir + files_all[i] + '/'));
				} else if (js_regex.test(files_all[i])) {
					files.push(dir + files_all[i])
				}
			}
			return files;
		}
	}
})(Sushi, typeof window === 'undefined');
