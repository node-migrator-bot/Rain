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

/**
 * @author Radu Viorel Cosnita
 * @version 1.0
 * @since 16.11.2011
 * @description This module provides helper methods for tests. For instance when you want to load
 * a module within your tests use this library. It hides the paths solving headaches.
 */

"use strict";

var libDir  = __dirname + "/../../lib/"
  , modPath = require("path");

/**
 * 
 * @description simulates the global Server settings of a rain server
 */
global.Server = {
    conf : {
        server : {
            port : 1337
            , serverRoot    : modPath.resolve(__dirname, "/..")
            , componentPath : modPath.resolve(__dirname, "../components")
        }
    },
    UUID : "SERVER-UUID",
    root : modPath.resolve(".")
};

/**
 * Method used to load a specified module.
 * 
 * @param relative module name
 * @example
 * var testsHelper = require("util_loader");
 * 
 * testsHelper.loadModule("logger"); // this will work even if you are not in lib folder.
 */
exports.loadModule = function(name) {
    var loadedModule;
    
    try {
        loadedModule = require(name);
    }
    catch(err) {
        console.log(__dirname);
        loadedModule = require(libDir + name);
    }
    
    return loadedModule;
};

/**
 * port for server in the integration test
 */
exports.port = 9999;
