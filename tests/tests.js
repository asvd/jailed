var isNode = typeof window == 'undefined';
var currentPath;

var whenFailed = function(){
    lighttest.check(false);
    lighttest.done();
}

if (isNode) {
    currentPath = __dirname + '/';
} else {
    var scripts = document.getElementsByTagName('script');
    currentPath = scripts[scripts.length-1].src
        .split('?')[0]
        .split('/')
        .slice(0, -1)
        .join('/')+'/';
}


var tests = {

    'Initialization':
    function() {
        lighttest.check(
            jailed &&
            jailed.Plugin &&
            jailed.DynamicPlugin
        );

//        lighttest.check(false);

        lighttest.done();
    },

    'Static plugin':
    function() {
        var api = {
            callMe : lighttest.protect(function() {
                plugin.disconnect();
                lighttest.check(true);
                lighttest.done();
            })
        };

        var path = currentPath + 'stage01/plugin1.js';
        var plugin = new jailed.Plugin(path, api);
        plugin.whenFailed(whenFailed);
    },


    'Dynamic plugin':
    function() {
        var api = {
            callMe : lighttest.protect(function() {
                plugin.disconnect();
                lighttest.check(true);
                lighttest.done();
            })
        };

        var code = 'application.remote.callMe();';
        var plugin = new jailed.DynamicPlugin(code, api);
        plugin.whenFailed(whenFailed);
    },

                    
    'Applictaion API':
    function() {
        var api = {
            square : lighttest.protect(function(val, cb) {
                cb(val*val);
            }),
            report : lighttest.protect(function(result) {
                plugin.disconnect();
                lighttest.check(result == 4);
                lighttest.done();
            })
        };

        var path = currentPath + 'stage02/plugin2.js';
        var plugin = new jailed.Plugin(path, api);
        plugin.whenFailed(whenFailed);
    },

                    
    'Plugin API':
    function() {
        var init = lighttest.protect(function() {
            var val = 2;

            var cb = lighttest.protect(function(result) {
                plugin.disconnect();
                lighttest.check(result == val*val);
                lighttest.done();
            });

            plugin.remote.square(val, cb);
        });

        var plugin = new jailed.Plugin(currentPath + 'stage03/plugin3.js');
        plugin.whenFailed(whenFailed);
        plugin.whenConnected(init);
    },

                    
    'Bidirectional communication initiated by the application':
    function() {
        var path = currentPath + 'stage04/plugin4.js';
        var waitCalled = false;

        var api = {
            wait : lighttest.protect(function(cb) {
                waitCalled = true;
                setTimeout(cb, 1000);
            })
        };

        var init = lighttest.protect(function() {
            var val = 2;

            var cb = lighttest.protect(function(result) {
                plugin.disconnect();
                lighttest.check(waitCalled);
                lighttest.check(result == val*val);
                lighttest.done();
            });

            plugin.remote.squareDelayed(val, cb);
        });

        var plugin = new jailed.Plugin(path, api);
        plugin.whenFailed(whenFailed);
        plugin.whenConnected(init);
    },

                    
    'Bidirectional communication initiated by the plugin':
    function() {
        var path = currentPath + 'stage05/plugin5.js';

        var api = {
            squareDelayed : lighttest.protect(function(val, cb) {
                var cb1 = lighttest.protect(function() {
                    cb(val*val);
                });

                plugin.remote.wait(cb1);
            }),
            report : lighttest.protect(function(result, waitCalled) {
                plugin.disconnect();
                lighttest.check(result == 4);
                lighttest.check(waitCalled);
                lighttest.done();
            })
        };

        var plugin = new jailed.Plugin(path, api);
        plugin.whenFailed(whenFailed);
    },

                    
    'Loading several plugins at once':
    function() {
        var path1 = currentPath + 'stage06/plugin6_1.js';
        var path2 = currentPath + 'stage06/plugin6_2.js';

        var replied1 = false;
        var replied2 = false;
        
        var finalize = lighttest.protect(function() {
            if (replied1 && replied2) {
                lighttest.check(true);
                lighttest.done();
            }
        });

        var init1 = lighttest.protect(function() {
            var val = 2;
            var cb = lighttest.protect(function(result) {
                replied1 = true;
                plugin1.disconnect();
                lighttest.check(result == val*val);
                finalize();
            });

            plugin1.remote.square(val, cb);
        });

        var init2 = lighttest.protect(function() {
            var val = 3;
            var cb = function(result) {
                replied2 = true;
                plugin2.disconnect();
                lighttest.check(result == val*val);
                finalize();
            }

            plugin2.remote.square(val, cb);
        });

        var plugin1 = new jailed.Plugin(path1);
        var plugin2 = new jailed.Plugin(path2);

        plugin1.whenFailed(whenFailed);
        plugin2.whenFailed(whenFailed);

        plugin1.whenConnected(init1);
        plugin2.whenConnected(init2);
    },
                    
                    
    'Using the plugin during a period':
    function() {
        var path = currentPath + 'stage07/plugin7.js';

        var init = lighttest.protect(function() {
            var val1 = 2;
            var cb1 = lighttest.protect(function(result) {
                lighttest.check(result == val1*val1);

                setTimeout(step2, 1000);
            });

            var step2 = lighttest.protect(function(){
                var val2 = 3;
                var cb2 = lighttest.protect(function(result) {
                    plugin.disconnect();
                    lighttest.check(result == val2*val2);
                    lighttest.done();
                });

                plugin.remote.square(val2, cb2);
            });

            plugin.remote.square(val1, cb1);
        });

        var plugin = new jailed.Plugin(path);
        plugin.whenFailed(whenFailed);
        plugin.whenConnected(init);
    },

                    
    'Using the application during a period':
    function() {
        var path = currentPath + 'stage08/plugin8.js';

        var api = {
            square: lighttest.protect(function(val, cb){
                cb(val*val);
            }),
            check : lighttest.protect(function(result){
                lighttest.check(result);
            }),
            done : lighttest.protect(function() {
                plugin.disconnect();
                lighttest.check(true);
                lighttest.done();
            })
        }

        var plugin = new jailed.Plugin(path, api);
        plugin.whenFailed(whenFailed);
    },
                    
                    
    'Using the plugin several times':
    function() {
        var path = currentPath + 'stage09/plugin9.js';
        var attempt = 1;
        var api1 = {
            checkAttempt : lighttest.protect(function(cb) {
                lighttest.check(attempt == 1);
                cb();
            }),
            done : lighttest.protect(function() {
                plugin1.disconnect();
                lighttest.check(true);
                step2();
            })
        }

        var step2 = lighttest.protect(function() {
            attempt = 2;
            
            var api2 = {
                checkAttempt : lighttest.protect(function(cb) {
                    lighttest.check(attempt == 2);
                    cb();
                }),
                done : lighttest.protect(function() {
                    plugin2.disconnect();
                    lighttest.check(true);
                    lighttest.done();
                })
            }

            var plugin2 = new jailed.Plugin(path, api2);
            plugin2.whenFailed(whenFailed);
        });

        var plugin1 = new jailed.Plugin(path, api1);
        plugin1.whenFailed(whenFailed);
    },
                    
                    


    'Two plugins with the same source but different interface':
    function() {
        var path = currentPath + 'stage10/plugin10.js';

        var done1 = false;
        var done2 = false;

        var api1 = {
            getNum : lighttest.protect(function(cb){
                cb(1);
            }),
            report : lighttest.protect(function(result, cb) {
                lighttest.check(result == 1);
                cb();
            }),
            done : lighttest.protect(function() {
                done1 = true;
                finalize();
            })
        };


        var api2 = {
            getNum : lighttest.protect(function(cb){
                cb(2);
            }),
            report : lighttest.protect(function(result, cb) {
                lighttest.check(result == 2);
                cb();
            }),
            done : lighttest.protect(function() {
                done2 = true;
                finalize();
            })
        };

        var finalize = lighttest.protect(function() {
            if (done1 && done2) {
                plugin1.disconnect();
                plugin2.disconnect();
                lighttest.check(true);
                lighttest.done();
            }
        });

        var plugin1 = new jailed.Plugin(path, api1);
        var plugin2 = new jailed.Plugin(path, api2);
        plugin1.whenFailed(whenFailed);
        plugin2.whenFailed(whenFailed);
    },
    

                    
    'Plugin disconnected right after creation':
    function() {

        var fail = lighttest.protect(
            function() {
                plugin.disconnect();
                lighttest.check(false);
                lighttest.done();
            }
        );

        var disconnected = false;
        var disconnect = lighttest.protect(
            function() {
                disconnected = true;
                lighttest.check(true);
            }
        );

        var finalize = lighttest.protect(
            function() {
                lighttest.check(disconnected);
                lighttest.done();
            }
        );

        var path = currentPath + 'stage11/plugin11.js';
        var plugin = new jailed.Plugin(path);
        plugin.whenConnected(fail);
        plugin.whenDisconnected(disconnect);
        plugin.whenFailed(whenFailed);
        plugin.disconnect();
        setTimeout(finalize, 1000);
    },



    'Plugin disconnected after connection':
    function() {

        var fail = lighttest.protect(
            function() {
                plugin.disconnect();
                lighttest.check(false);
                lighttest.done();
            }
        );
        
        var connect = lighttest.protect(
            function() {
                lighttest.check(true);
                plugin.disconnect();
                setTimeout(finalize, 1000);
            }
        );

        var disconnected = false;
        var disconnect = lighttest.protect(
            function() {
                disconnected = true;
                lighttest.check(true);
            }
        );

        var finalize = lighttest.protect(
            function() {
                lighttest.check(disconnected);
                lighttest.done();
            }
        );

        var path = currentPath + 'stage11/plugin11.js';
        var plugin = new jailed.Plugin(path);
        plugin.whenConnected(connect);
        plugin.whenDisconnected(disconnect);
        plugin.whenFailed(whenFailed);

    },


    'Plugin disconnected by its method':
    function() {
        var path = currentPath + 'stage11/plugin11.js';

        var connected = lighttest.protect(function() {
            lighttest.check(true);

            var val = 2;
            var cb = lighttest.protect(function(result) {
                lighttest.check(result == val*val);
                setTimeout(
                    lighttest.protect(function() {
                        plugin.remote.killYourself();
                    }), 1000
                );
            });

            plugin.remote.square(val, cb);
        });

        var disconnected = lighttest.protect(function() {
            lighttest.check(true);
            lighttest.done();
        });

        var plugin = new jailed.Plugin(path);
        plugin.whenConnected(connected);
        plugin.whenDisconnected(disconnected);
        plugin.whenFailed(whenFailed);
    },

                    
    'Plugin disconnected during initialization':
    function() {
        var path = currentPath + 'stage11/plugin11_1.js';

        var failed = function() {
            plugin.disconnect();
            lighttest.check(false);
            lighttest.done();
        }

        var disconnected = function() {
            lighttest.check(true);
            lighttest.done();
        }

        var plugin = new jailed.Plugin(path);
        plugin.whenConnected(failed);
        plugin.whenFailed(failed);
        plugin.whenDisconnected(disconnected);
    },

                    
                    
    'Mixed plugin loading sequence':
    function() {
        var path = currentPath + 'stage12/plugin12.js';
        var plugin1, plugin2;

        var step1 = lighttest.protect(function() {
            var val = 2;
            var cb = lighttest.protect(function(result) {
                lighttest.check(result == val*val);
                step2();
            });

            plugin1.remote.square(val, cb);
        });

        var step2 = lighttest.protect(function() {
            var connected2 = lighttest.protect(function() {
                var val = 7;
                var cb = lighttest.protect(function(result) {
                    lighttest.check(result == val*val);
                    step3();
                });

                plugin2.remote.square(val, cb);
            });

            plugin2 = new jailed.Plugin(path);
            plugin2.whenConnected(connected2);
            plugin2.whenFailed(whenFailed);
        });

        var step3 = lighttest.protect(function() {
            plugin1.disconnect();
            setTimeout(step4, 1000);
        });

        var step4 = lighttest.protect(function() {
            var val = 11;
            var cb = lighttest.protect(function(result) {
                lighttest.check(result == val*val);
                finalize();
            });

            plugin2.remote.square(val, cb);
        });

        var finalize = lighttest.protect(function() {
            plugin2.disconnect();
            lighttest.done();
        });

        plugin1 = new jailed.Plugin(path);
        plugin1.whenConnected(step1);
        plugin1.whenFailed(whenFailed);
    },

                    
    'Executing function with several callbacks':
    function() {
        var path = currentPath + 'stage13/plugin13.js';

        var api = {
            callMeBack : lighttest.protect(function(success, sCb, fCb) {
                if (success) {
                    sCb();
                } else {
                    fCb();
                }
            }),
            report : lighttest.protect(function(result, cb) {
                lighttest.check(result);
                cb();
            }),
            done : lighttest.protect(function() {
                plugin.disconnect();
                lighttest.check(true);
                lighttest.done();
            })
        }

        var plugin = new jailed.Plugin(path, api);
        plugin.whenFailed(whenFailed);
    },

    


    
    'Remote plugin':
    function() {
        var path = 'http://asvd.github.io/jailed/tests/plugin14.js';

        var api = {
            square: lighttest.protect(function(val, cb) {
                cb(val*val);
            }),
            check: lighttest.protect(function(result, cb) {
                lighttest.check(result);
                cb();
            }),
            done: lighttest.protect(function() {
                plugin.disconnect();
                lighttest.done();
            })
        }

        var plugin = new jailed.Plugin(path, api);
        plugin.whenFailed(whenFailed);
    },


    
    
    'Plugin with infinite loop':
    function() {
        var pathBad = currentPath + 'stage15/plugin15_bad.js';
        var pathGood = currentPath + 'stage15/plugin15_good.js';

        var pluginGood;
        var pluginBad;

        var step1 = lighttest.protect(
            function() {
                lighttest.check(true);

                var cb = lighttest.protect(
                    function() {
                        // should never be called
                        lighttest.check(false);
                        pluginBad.disconnect();
                        lighttest.done();
                    }
                );

                pluginBad.remote.infinite(cb);

                setTimeout(step2, 2000);
            }
        );

        var step2 = lighttest.protect(
            function() {
                pluginBad.disconnect();
                setTimeout(step3, 1000);
            }
        );

        var step3 = lighttest.protect(
            function() {
                lighttest.check(true);

                pluginBad = new jailed.Plugin(pathBad);
                pluginBad.whenConnected(step4);
                pluginBad.whenFailed(whenFailed);
            }
        );

        var step4 = lighttest.protect(
            function() {
                var cb = lighttest.protect(
                    function() {
                        // should never be called
                        lighttest.check(false);
                        pluginBad.disconnect();
                        lighttest.done();
                    }
                );

                pluginBad.remote.infinite(cb);

                setTimeout(step5, 2000);
            }
        );

        var step5 = lighttest.protect(
            function() {
                lighttest.check(true);

                pluginGood = new jailed.Plugin(pathGood);
                pluginGood.whenConnected(step6);
                pluginGood.whenFailed(whenFailed);
            }
        );

        var step6 = lighttest.protect(
            function() {
                var val = 8;
                var cb = lighttest.protect(function(result) {
                    lighttest.check(result == val*val);
                    pluginGood.disconnect();
                    pluginBad.disconnect();
                    lighttest.done();
                });

                pluginGood.remote.square(val, cb);
            }
        );
        
        pluginBad = new jailed.Plugin(pathBad);
        pluginBad.whenConnected(step1);
        pluginBad.whenFailed(whenFailed);
    },
 
                   
    'Permission restriction':
    function() {
        var path = currentPath + 'stage16/plugin16.js';

        var api = {
            check : lighttest.protect(
                function(result, cb) {
                    lighttest.check(result);
                    cb();
                }
            ),
            done : lighttest.protect(
                function() {
                    plugin.disconnect();
                    lighttest.check(true);
                    lighttest.done();
                }
            )
        };

        var plugin = new jailed.Plugin(path, api);
        plugin.whenFailed(whenFailed);
    },
                    

                    

    'Broken plugin':
    function() {
        var path = currentPath + 'stage17/plugin17.js';

        var plugin = new jailed.Plugin(path);

        var fail = lighttest.protect(
            function() {
                plugin.disconnect();
                lighttest.check(false);
                lighttest.done();
            }
        );
        
        plugin.whenConnected(fail);

        plugin.whenFailed(
            lighttest.protect(
                function() {
                    lighttest.check(true);
                    lighttest.done();
                }
            )
        );
    },


    'Broken dynamic plugin':
    function() {
        var code = 'u';
//        var code = 'auaa } u((uu&';

        var plugin = new jailed.DynamicPlugin(code);

        var connect = lighttest.protect(
            function() {
                plugin.disconnect();
                lighttest.check(false);
                lighttest.done();
            }
        );

        var disconnected = false;
        var disconnect = lighttest.protect(
            function() {
                lighttest.check(true);
                disconnected = true;
            }
        );

        var failed = false;
        var fail = lighttest.protect(
            function() {
                lighttest.check(true);
                failed = true;
                setTimeout(finalize,500);
            }
        );

        var finalize = lighttest.protect(
            function() {
                plugin.disconnect();
                lighttest.check(failed&&disconnected);
                lighttest.done();
            }
        );

        plugin.whenConnected(connect);
        plugin.whenDisconnected(disconnect);
        plugin.whenFailed(fail);
    },



    'Broken remote plugin':
    function() {
        var path = 'http://asvd.github.io/jailed/tests/plugin18.js';

        var plugin = new jailed.Plugin(path);

        var connect = lighttest.protect(
            function() {
                plugin.disconnect();
                lighttest.check(false);
                lighttest.done();
            }
        );

        var disconnected = false;
        var disconnect = lighttest.protect(
            function() {
                lighttest.check(true);
                disconnected = true;
            }
        );

        var failed = false;
        var fail = lighttest.protect(
            function() {
                lighttest.check(true);
                failed = true;
                setTimeout(finalize,500);
            }
        );

        var finalize = lighttest.protect(
            function() {
                plugin.disconnect();
                lighttest.check(failed&&disconnected);
                lighttest.done();
            }
        );

        plugin.whenConnected(connect);
        plugin.whenDisconnected(disconnect);
        plugin.whenFailed(fail);
    },

                    
                    

    'Nonexisting plugin':
    function() {
        var path = currentPath + 'no_such_path.js';
        var plugin = new jailed.Plugin(path);

        var connect = lighttest.protect(
            function() {
                plugin.disconnect();
                lighttest.check(false);
                lighttest.done();
            }
        );

        var disconnected = false;
        var disconnect = lighttest.protect(
            function() {
                lighttest.check(true);
                disconnected = true;
            }
        );

        var failed = false;
        var fail = lighttest.protect(
            function() {
                lighttest.check(true);
                failed = true;
                setTimeout(finalize,500);
            }
        );

        var finalize = lighttest.protect(
            function() {
                lighttest.check(failed&&disconnected);
                plugin.disconnect();
                lighttest.done();
            }
        );

        plugin.whenConnected(connect);
        plugin.whenDisconnected(disconnect);
        plugin.whenFailed(fail);
    },
                    

    'Nonexisting remote plugin':
    function() {
        var path = 'http://asvd.github.io/no_such_path.js';
        var plugin = new jailed.Plugin(path);

        var connect = lighttest.protect(
            function() {
                plugin.disconnect();
                lighttest.check(false);
                lighttest.done();
            }
        );

        var disconnected = false;
        var disconnect = lighttest.protect(
            function() {
                lighttest.check(true);
                disconnected = true;
            }
        );

        var failed = false;
        var fail = lighttest.protect(
            function() {
                lighttest.check(true);
                failed = true;
                setTimeout(finalize,500);
            }
        );

        var finalize = lighttest.protect(
            function() {
                plugin.disconnect();
                lighttest.check(failed&&disconnected);
                lighttest.done();
            }
        );

        plugin.whenConnected(connect);
        plugin.whenDisconnected(disconnect);
        plugin.whenFailed(fail);
    },

    
    
    'Broken plugin method':
    function() {
        var step1 = lighttest.protect(
            function() {
                var cb = lighttest.protect(
                    function() {
                        plugin.disconnect();
                        clearTimeout(timeout);
                        lighttest.check(false);
                        lighttest.done();
                    }
                );

                plugin.remote.broken(cb);

                var timeout = setTimeout(step2, 1000);
            }
        );

        var step2 = lighttest.protect(
            function() {
                var timeout = setTimeout(
                    lighttest.protect(
                        function() {
                            plugin.disconnect();
                            lighttest.check(false);
                            lighttest.done();
                        }
                    ),
                    1000
                );

                var cb = lighttest.protect(
                    function() {
                        clearTimeout(timeout);
                        lighttest.check(true);
                        step3();
                    }
                );

                plugin.remote.brokenDelayed(cb);
            }
        );

        var step3 = lighttest.protect(
            function() {
                var cb = lighttest.protect(
                    function() {
                        clearTimeout(timeout);
                        plugin.disconnect();
                        lighttest.check(false);
                        lighttest.done();
                    }
                );

                plugin.remote.broken(cb);
                var timeout = setTimeout(step4, 500);
            }
        );

        var step4 = lighttest.protect(
            function() {
                var val = 6;
                var cb = lighttest.protect(
                    function(result) {
                        plugin.disconnect();
                        lighttest.check(result = val*val);
                        lighttest.done();
                    }
                );

                plugin.remote.square(val, cb);
            }
        );

        var path = currentPath + 'stage19/plugin19.js';
        var plugin = new jailed.Plugin(path);
        plugin.whenConnected(step1);
        plugin.whenFailed(whenFailed);
    },

                    
    'Broken application method':
    function() {
        var api = {
            // intentionally not protected, must fail
            broken:  function(cb) {
                somethingWrong();
                cb();
            },

            // intentionally not protected, must fail
            brokenDelayed:  function(cb) {
                setTimeout(cb, 500);
                somethingWrong();
            },

            square: lighttest.protect(
                function(val, cb) {
                    cb(val*val);
                }
            ),

            check: lighttest.protect(
                function(result, cb){
                    lighttest.check(result);
                    cb();
                }
            ),

            done: lighttest.protect(
                function(){
                    plugin.disconnect();
                    lighttest.done();
                }
            )
        };

        var path = currentPath + 'stage20/plugin20.js';
        var plugin = new jailed.Plugin(path, api);
        plugin.whenFailed(whenFailed);
    },

                    
                    
    'Several plugin methods execution':
    function() {
        var cubeFinished = false;
        var squareFinished = false;

        var step1 = lighttest.protect(
            function() {
                var valCube = 7;

                var cbCube = lighttest.protect(
                    function(result) {
                        lighttest.check(result == valCube*valCube*valCube);
                        cubeFinished = true;
                        finalize();
                    }
                );

                plugin.remote.cubeDelayed(valCube, cbCube);
                step2();
            }
        );


        
        var step2 = lighttest.protect(
            function() {
                var val = 8;

                var cb = lighttest.protect(
                    function(result) {
                        lighttest.check(result == val*val);
                        squareFinished = true;
                        finalize();
                    }
                );

                plugin.remote.square(val, cb);
        
            }
        );
        
        var finalize = lighttest.protect(
            function() {
                if (cubeFinished && squareFinished) {
                    plugin.disconnect();
                    lighttest.check(true);
                    lighttest.done();
                }
            }
        );
        
        var path = currentPath + 'stage21/plugin21.js';
        var plugin = new jailed.Plugin(path);
        plugin.whenFailed(whenFailed);
        plugin.whenConnected(step1);
    },

                    

    'Several application methods execution':
    function() {
        var api = {
            square: lighttest.protect(
                function(val, cb) {
                    cb(val*val);
                }
            ),
            cubeDelayed: lighttest.protect(
                function(val, cb) {
                    setTimeout(
                        lighttest.protect(
                            function() {
                                cb(val*val*val);
                            }
                        ), 1000
                    );
                }
            ),
            check: lighttest.protect(
                function(result, cb){
                    lighttest.check(result);
                    cb();
                }
            ),

            done: lighttest.protect(
                function(){
                    plugin.disconnect();
                    lighttest.done();
                }
            )
        }
        
        var path = currentPath + 'stage22/plugin22.js';
        var plugin = new jailed.Plugin(path, api);
        plugin.whenFailed(whenFailed);
    },
                    
    
    'Plugin method with several callbacks':
    function() {
        var step1 = lighttest.protect(
            function() {
                var cb0 = lighttest.protect(
                    function() {
                        lighttest.check(false);
                        step2();
                    }
                );

                var cb1 = lighttest.protect(
                    function() {
                        lighttest.check(true);
                        step2();
                    }
                );

                plugin.remote.callback(1, cb0, cb1);
            }
        );
        
        var step2 = lighttest.protect(
            function() {
                var cb0 = lighttest.protect(
                    function() {
                        lighttest.check(true);
                        finalize();
                    }
                );

                var cb1 = lighttest.protect(
                    function() {
                        lighttest.check(false);
                        finalize();
                    }
                );

                plugin.remote.callback(0, cb0, cb1);
            }
        );

        var finalize = lighttest.protect(
            function() {
                plugin.disconnect();
                lighttest.done();
            }
        );
        
        var path = currentPath + 'stage23/plugin23.js';
        var plugin = new jailed.Plugin(path);
        plugin.whenFailed(whenFailed);
        plugin.whenConnected(step1);
    },
                    


    'Application method with several callbacks':
    function() {
        var api = {
            callback: lighttest.protect(
                function(num, cb0, cb1) {
                    if (num == 0) {
                        cb0();
                    } else {
                        cb1();
                    }
                }
            ),

            check: lighttest.protect(
                function(result, cb){
                    lighttest.check(result);
                    cb();
                }
            ),

            done: lighttest.protect(
                function(){
                    plugin.disconnect();
                    lighttest.done();
                }
            )
        };
        
        var path = currentPath + 'stage24/plugin24.js';
        var plugin = new jailed.Plugin(path, api);
        plugin.whenFailed(whenFailed);
    },


                    
    'Two-sided communication, initiated by the plugin':
    function() {
        var api = {
            squareDelayed: lighttest.protect(
                function(val, cb) {
                    plugin.remote.wait(
                        lighttest.protect(
                            function() {
                                cb(val*val);
                            }
                        )
                    );
                }
            ),

            check: lighttest.protect(
                function(result, cb){
                    lighttest.check(result);
                    cb();
                }
            ),

            done: lighttest.protect(
                function(){
                    plugin.disconnect();
                    lighttest.done();
                }
            )
        };

        var path = currentPath + 'stage25/plugin25.js';
        var plugin = new jailed.Plugin(path, api);
        plugin.whenFailed(whenFailed);
    },


                    
    'Two-sided communication, initiated by the application':
    function() {
        var api = {
            wait: function(cb) {
                setTimeout(cb, 1000);
            }
        };

        var step1 = lighttest.protect(
            function() {
                var val = 54;
                var cb = lighttest.protect(
                    function(result) {
                        plugin.disconnect();
                        lighttest.check(result == val*val);
                        lighttest.done();
                    }
                );

                plugin.remote.squareDelayed(val, cb);
            }
        );

        var path = currentPath + 'stage26/plugin26.js';
        var plugin = new jailed.Plugin(path, api);
        plugin.whenFailed(whenFailed);
        plugin.whenConnected(step1);
    },


    'Calling plugin callbacks from the same arguments several times':
    function() {
        var api = {
            callme : function(cb0, cb1) {
                var step1 =function() {
                    setTimeout(finalize, 1000);
                     
                    try {
                        cb1();
                        lighttest.check(false);
                    } catch(e) {
                        lighttest.check(true);
                        throw e;
                    }
                }

                setTimeout(step1, 1000);

                cb0();

                try {
                    cb0();
                    lighttest.check(false);
                } catch(e) {
                    lighttest.check(true);
                    throw e;
                }

            },

            check: lighttest.protect(
                function(result){
                    lighttest.check(result);
                }
            )
        }

        var finalize = lighttest.protect(
            function() {
                plugin.disconnect();
                lighttest.done();
            }
        );

        var path = currentPath + 'stage27/plugin27.js';
        var plugin = new jailed.Plugin(path, api);
        plugin.whenFailed(whenFailed);
    },



    'Calling application callbacks from the same arguments several times':
    function() {
        var init = lighttest.protect(
            function() {
                var notYetCalled = true;
                var cb = lighttest.protect(
                    function() {
                        lighttest.check(notYetCalled);
                        notYetCalled = false;
                    }
                );

                plugin.remote.callme(cb, cb);
            }
        );

        var api = {
            check: lighttest.protect(
                function(result){
                    lighttest.check(result);
                }
            ),

            done: lighttest.protect(
                function(){
                    plugin.disconnect();
                    lighttest.done();
                }
            )
        }

        var path = currentPath + 'stage28/plugin28.js';
        var plugin = new jailed.Plugin(path, api);
        plugin.whenFailed(whenFailed);
        plugin.whenConnected(init);
    },


    'Delayed plugin error':
    function() {
        var init = lighttest.protect(
            function() {
                var cb = lighttest.protect(
                    function() {
                        plugin.disconnect();
                        lighttest.check(true);
                    }
                );

                // Node.js child process will exit,
                // Worker will throw, but proceed
                plugin.remote.brokenDelayed(cb);
            }
        );

        var disconnect = lighttest.protect(
            function() {
                lighttest.check(true);
                setTimeout(finalize, 300);
            }
        );

        var finalize = lighttest.protect(
            function() {
                lighttest.done();
            }
        );
        
        
        var path = currentPath + 'stage29/plugin29.js';
        var plugin = new jailed.Plugin(path);
        plugin.whenFailed(whenFailed);
        plugin.whenConnected(init);
        plugin.whenDisconnected(disconnect);
    },

    
    
    'Subscribing non-functions to events in the application environment':
    function() {
        var plugin = new jailed.DynamicPlugin('');

        var step1 = function() {
            setTimeout(step2, 100);
            try {
                plugin.whenConnected([]);
                lighttest.check(false);
            } catch (e) {
                lighttest.check(true);
                throw e;
            }
        }

        var step2 = function() {
            setTimeout(step3, 100);
            try {
                plugin.whenFailed('something');
                lighttest.check(false);
            } catch (e) {
                lighttest.check(true);
                throw e;
            }
        }

        var step3 = function() {
            setTimeout(step4, 100);
            try {
                plugin.whenDisconnected(new Date);
                lighttest.check(false);
            } catch (e) {
                lighttest.check(true);
                throw e;
            }
        }

        var step4 = function() {
            plugin.whenConnected(step5);
        }

        var step5 = function() {
            plugin.disconnect();
            lighttest.check(true);
            lighttest.done();
        }

        setTimeout(step1, 100);
    },
    
    
    'Subscribing non-functions to events in the plugin environment':
    function() {
        var fail = lighttest.protect(
            function() {
                plugin.disconnect();
                lighttest.check(true);
                setTimeout(finalize, 300);
            }
        );
        
        var connect = lighttest.protect(
            function() {
                plugin.disconnect();
                lighttest.check(false);
                lighttest.done();
            }
        );

        var disconnected = false;
        var disconnect = lighttest.protect(
            function() {
                lighttest.check(true);
                disconnected = true;
            }
        );

        var finalize = lighttest.protect(
            function() {
                lighttest.check(disconnected);
                lighttest.done();
            }
        );
        
        
        var path = currentPath + 'stage30/plugin30.js';
        var plugin = new jailed.Plugin(path);
        plugin.whenFailed(fail);
        plugin.whenConnected(connect);
        plugin.whenDisconnected(disconnect);
    },
    
    

    'Delayed event subscription in the application':
    function() {
        var stage1 = lighttest.protect(
            function() {
                var plugin = new jailed.DynamicPlugin('');

                var connectionCompleted = false;

                var connectCheck = lighttest.protect(
                    function() {
                        plugin.disconnect();
                        lighttest.check(connectionCompleted);
                        setTimeout(stage2, 300);
                    }
                );

                var tryConnect = lighttest.protect(
                    function() {
                        plugin.whenConnected(connected);
                    }
                );

                var connected = function() {
                    connectionCompleted = true;
                }

                setTimeout(tryConnect, 300);
                setTimeout(connectCheck, 600);
            }
        );


        var stage2 = lighttest.protect(
            function() {
                var plugin = new jailed.DynamicPlugin('uau}');

                var failureCompleted = false;

                var failureCheck = lighttest.protect(
                    function() {
                        plugin.disconnect();
                        lighttest.check(failureCompleted);
                        setTimeout(stage3, 300);
                    }
                );

                var tryFailure = lighttest.protect(
                    function() {
                        plugin.whenFailed(failed);
                    }
                );

                var failed = function() {
                    failureCompleted = true;
                }

                setTimeout(tryFailure, 300);
                setTimeout(failureCheck, 600);
            }
        );



        var stage3 = lighttest.protect(
            function() {
                var plugin = new jailed.DynamicPlugin('application.disconnect();');

                var disconnectCompleted = false;

                var disconnectCheck = lighttest.protect(
                    function() {
                        plugin.disconnect();
                        lighttest.check(disconnectCompleted);
                        lighttest.done();
                    }
                );

                var tryDisconnect = lighttest.protect(
                    function() {
                        plugin.whenDisconnected(disconnected);
                    }
                );

                var disconnected = function() {
                    disconnectCompleted = true;
                }

                setTimeout(tryDisconnect, 300);
                setTimeout(disconnectCheck, 600);
            }
        );


        stage1();
    },

    
    'Delayed event subscription in the plugin':
    function() {
        var api = {
            check : lighttest.protect(function(result, cb){
                lighttest.check(result);
                cb();
            }),

            done : lighttest.protect(function() {
                plugin.disconnect();
                lighttest.check(true);
                lighttest.done();
            })
        }

        var path = currentPath + 'stage31/plugin31.js';
        var plugin = new jailed.Plugin(path, api);

    },
    


    'Subscibing to Whenable events several times before and after emission':
    function() {
        var pluginFinished = 0;
        var api = {
            check : lighttest.protect(function(result, cb){
                lighttest.check(result);
                cb();
            }),

            finished : lighttest.protect(function() {
                lighttest.check(true);
                pluginFinished++;
                disconnect();
            })
        }

        var beforeConnect1Finished = 0;
        var beforeConnect1 = lighttest.protect(
            function() {
                beforeConnect1Finished++;
                lighttest.check(true);
                finalize();
            }
        );

        var beforeConnect2Finished = 0;
        var beforeConnect2 = lighttest.protect(
            function() {
                beforeConnect2Finished++;
                lighttest.check(true);
                finalize();
            }
        );


        var beforeDisconnect1Finished = 0;
        var beforeDisconnect1 = lighttest.protect(
            function() {
                beforeDisconnect1Finished++;
                lighttest.check(true);
                finalize();
            }
        );

        var beforeDisconnect2Finished = 0;
        var beforeDisconnect2 = lighttest.protect(
            function() {
                beforeDisconnect2Finished++;
                lighttest.check(true);
                finalize();
            }
        );


        var afterConnect1Finished = 0;
        var afterConnect1 = lighttest.protect(
            function() {
                afterConnect1Finished++;
                lighttest.check(true);
                finalize();
            }
        );

        var afterConnect2Finished = 0;
        var afterConnect2 = lighttest.protect(
            function() {
                afterConnect2Finished++;
                lighttest.check(true);
                finalize();
            }
        );


        var afterDisconnect1Finished = 0;
        var afterDisconnect1 = lighttest.protect(
            function() {
                afterDisconnect1Finished++;
                lighttest.check(true);
                finalize();
            }
        );

        var afterDisconnect2Finished = 0;
        var afterDisconnect2 = lighttest.protect(
            function() {
                afterDisconnect2Finished++;
                lighttest.check(true);
                finalize();
            }
        );


        var finalize = lighttest.protect(
            function() {
                if (
                    pluginFinished == 1 &&
                    beforeConnect1Finished == 1 &&
                    beforeConnect2Finished == 1 &&
                    beforeDisconnect1Finished == 1 &&
                    beforeDisconnect2Finished == 1 &&
                    afterConnect1Finished == 1 &&
                    afterConnect2Finished == 1 &&
                    afterDisconnect1Finished == 1 &&
                    afterDisconnect2Finished == 1
                ) {
                    lighttest.check(
                        pluginFinished == 1 &&
                        beforeConnect1Finished == 1 &&
                        beforeConnect2Finished == 1 &&
                        beforeDisconnect1Finished == 1 &&
                        beforeDisconnect2Finished == 1 &&
                        afterConnect1Finished == 1 &&
                        afterConnect2Finished == 1 &&
                        afterDisconnect1Finished == 1 &&
                        afterDisconnect2Finished == 1
                    );
                    lighttest.done();
                }
            }
        );

        var disconnect = lighttest.protect(
            function() {
                plugin.disconnect();
                setTimeout(
                    lighttest.protect(
                        function() {
                            plugin.whenDisconnected(afterDisconnect);
                        }
                    ), 300
                );
            }
        );


        var afterDisconnect = lighttest.protect(
            function() {
                plugin.whenConnected(afterConnect1);
                plugin.whenConnected(afterConnect2);
                plugin.whenDisconnected(afterDisconnect1);
                plugin.whenDisconnected(afterDisconnect2);
            }
        );


        var path = currentPath + 'stage32/plugin32.js';
        var plugin = new jailed.Plugin(path, api);
        plugin.whenConnected(beforeConnect1);
        plugin.whenConnected(beforeConnect2);
        plugin.whenDisconnected(beforeDisconnect1);
        plugin.whenDisconnected(beforeDisconnect2);
    }
    
    
};


lighttest.start(tests);

