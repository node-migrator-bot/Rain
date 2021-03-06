/*
Copyright (c) 2011, Cosnita Radu Viorel <radu.cosnita@1and1.ro>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var testsHelper             = require("../util_loader")
    , modIntentsRegistry    = testsHelper.loadModule("intents/intents_registry")
    , testCase              = testsHelper.loadModule("nodeunit").testCase;

var moduleConfig = {"id": "test-module",
                    "version": "1.0",
                    "url": "/mocked/path",
                    "views": [
                        {"viewid": "view1",
                         "view": "/htdocs/view1.html" 
                        },
                        {"viewid": "view2",
                         "view": "/htdocs/view2.html" 
                        }
                    ]}    
    , intentConfig = {"action": "com.1and1.intents.general.SEND_MAIL",
                      "category": "com.1and1.controlpanel.mail",
                      "type": "view",
                      "provider": "view1"}
    , intentServerConfig = {"action": "com.1and1.intents.general.DO_SERVER_LOG",
                            "category": "com.1and1.controlpanel.logging",
                            "type": "server",
                            "provider": "/controllers/logging.js",
                            "method": "doLogging"};

var tcRegisterIntent = {};

/**
 * Method used to test the normal flow of _registerIntent method.
 */
tcRegisterIntent.registerIntentNormal = function(test) {   
    intentsRegistry = new modIntentsRegistry.IntentsRegistry();
    
    intentsRegistry._getIntentView = function(moduleConfig, intentConfig) {
        var viewCtx = moduleConfig.views[0];
        
        viewCtx.module = moduleConfig;
        
        return viewCtx;
    }
    
    intentsRegistry._registerIntent(moduleConfig, intentConfig);
    
    // Test for correct registration of the intent.
    var category = intentConfig.category;
    var action = intentConfig.action;
    var intentId = "".concat(moduleConfig.id, "-", moduleConfig.version);
    
    var intentCtx = intentsRegistry.intents[category][action][intentId]; 
    
    var expectedView = moduleConfig.views[0];
    
    test.ok(intentCtx);
    test.equals(intentCtx.type, intentConfig.type);
    test.equals(intentCtx.provider.viewid, expectedView.viewid)
    test.equals(intentCtx.provider.view, expectedView.view)
    test.equals(intentCtx.provider.module.id, moduleConfig.id);
    test.equals(intentCtx.provider.module.version, moduleConfig.version);
    
    test.done();
}

/**
 * Method used to test the normal flow for _registerIntent method - server mapped intents.
 */
tcRegisterIntent.getIntentServer = function(test) {
    intentsRegistry = new modIntentsRegistry.IntentsRegistry();
        
    pathResolver = new Object();
    pathResolver.existsSync = function(path) {
        return true;
    }
    
    var fnRequire = function(path) {
        var ret = new Object();
        
        ret.doLogging = function() {
            
        }
        
        return ret;
    }
    
    var intentCtx = intentsRegistry._getIntentServer(moduleConfig, intentServerConfig, pathResolver, fnRequire);
            
    console.log(Server.conf.server);
            
    /**
     * Assertion part.
     */
    test.ok(intentCtx)
    test.equals(intentCtx.path, Server.conf.server.serverRoot + "/mocked/path/controllers/logging.js");
    test.equals(intentCtx.method, "doLogging");
    
    test.done();
}

/**
 * Method used to test getIntentServer algorithm when server module is missing.
 */
tcRegisterIntent.getIntentServerControllerMissing = function(test) {
    intentsRegistry = new modIntentsRegistry.IntentsRegistry();
        
    pathResolver = new Object();
    pathResolver.existsSync = function(path) {
        return false;
    }
    
    try {
        intentsRegistry._getIntentServer(moduleConfig, intentServerConfig, pathResolver);
        
        test.ok(false);
    }
    catch(err) {
        test.ok(true);
    }
    
    test.done();
}

/**
 * Method used to test getIntentServer algorithm when method specified is missing.
 */
tcRegisterIntent.getIntentServerMethodMissing = function(test) {
    intentsRegistry = new modIntentsRegistry.IntentsRegistry();
        
    pathResolver = new Object();
    pathResolver.existsSync = function(path) {
        return true;
    }
    
    fnRequire = function(path) {
        var ret = new Object();
        
        return ret;
    }
    
    try {
        var intentCtx = intentsRegistry._getIntentServer(moduleConfig, intentServerConfig, pathResolver, fnRequire);
        
        test.ok(false);
    }
    catch(err) {
        test.ok(true);
    }
    
    test.done();
}

/**
 * Method used to test registerIntent behavior when an entry already exists.
 */
tcRegisterIntent.registerIntentDuplicate = function(test) {
    intentsRegistry = new modIntentsRegistry.IntentsRegistry();
        
    intentsRegistry._registerIntent(moduleConfig, intentConfig);
    
    try {
        intentsRegistry._registerIntent(moduleConfig, intentConfig);
        
        test.ok(false);
    }   
    catch(err) {
        test.ok(true);
    }
    
    test.done();
}


tcRegisterIntents = {}

/**
 * Method used to test the register intents behavior. It mocks _registerIntent
 * method internally.
 */
tcRegisterIntents.registerIntents = function(test) {
    intentsRegistry = new modIntentsRegistry.IntentsRegistry();
    
    var intentId = "test-module-1.0";
    
    intentsRegistry._registerIntent = function(moduleConfig, intentConfig) {
        var category = intentConfig.category 

        this.intents[category] = {}
        
        var intentCtx = {}
        intentCtx[intentId] = {"type" : intentConfig.type,
                               "provider" : intentConfig.provider}
        
        this.intents[category][intentConfig.action] = intentCtx;
    }
    
    config = {"id": moduleConfig.id,
              "version": moduleConfig.version,
              "intents": [intentConfig]}; 
    
    var category = intentConfig.category;
    var action = intentConfig.action;
    
    intentsRegistry.registerIntents(config);
    
    var intentCtx = intentsRegistry.intents[category][action][intentId]; 
    
    test.ok(intentCtx);
    test.equals(intentCtx.type, intentConfig.type);
    test.equals(intentCtx.provider, intentConfig.provider);           

    test.done();
}

/**
 * Test case for registration of intents when intents section is missing
 * from application descriptor.
 */
tcRegisterIntents.registerIntentsMissing = function(test) {
    intentsRegistry = new modIntentsRegistry.IntentsRegistry();
    
    intentsRegistry.registerIntents(moduleConfig)
    
    console.log(intentsRegistry.intents);
    
    test.equals(JSON.stringify(intentsRegistry.intents), '{}');
    
    test.done();    
}

module.exports.testRegisterIntent = testCase(tcRegisterIntent);
module.exports.testRegisterIntents = testCase(tcRegisterIntents);
