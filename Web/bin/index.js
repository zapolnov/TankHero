
var Module;

if (typeof Module === 'undefined') Module = {};

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'index.data';
    var REMOTE_PACKAGE_BASE = 'index.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      },
    };

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }

  
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
  
          var files = metadata.files;
          for (i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_index.data');

    };
    Module['addRunDependency']('datafile_index.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 18555, "filename": "/0.png"}, {"audio": 0, "start": 18555, "crunched": 0, "end": 36482, "filename": "/1.png"}, {"audio": 0, "start": 36482, "crunched": 0, "end": 54902, "filename": "/2.png"}, {"audio": 0, "start": 54902, "crunched": 0, "end": 73393, "filename": "/3.png"}, {"audio": 0, "start": 73393, "crunched": 0, "end": 91541, "filename": "/4.png"}, {"audio": 0, "start": 91541, "crunched": 0, "end": 109957, "filename": "/5.png"}, {"audio": 0, "start": 109957, "crunched": 0, "end": 128541, "filename": "/6.png"}, {"audio": 0, "start": 128541, "crunched": 0, "end": 146711, "filename": "/7.png"}, {"audio": 0, "start": 146711, "crunched": 0, "end": 165282, "filename": "/8.png"}, {"audio": 1, "start": 165282, "crunched": 0, "end": 171423, "filename": "/8bit_gunloop_explosion.ogg"}, {"audio": 0, "start": 171423, "crunched": 0, "end": 189959, "filename": "/9.png"}, {"audio": 0, "start": 189959, "crunched": 0, "end": 203462, "filename": "/basetexture.jpg"}, {"audio": 0, "start": 203462, "crunched": 0, "end": 246082, "filename": "/building-office-small.mesh"}, {"audio": 1, "start": 246082, "crunched": 0, "end": 257416, "filename": "/button_click.ogg"}, {"audio": 0, "start": 257416, "crunched": 0, "end": 397403, "filename": "/continue_normal.png"}, {"audio": 0, "start": 397403, "crunched": 0, "end": 537503, "filename": "/continue_pressed.png"}, {"audio": 0, "start": 537503, "crunched": 0, "end": 563197, "filename": "/copyright.png"}, {"audio": 0, "start": 563197, "crunched": 0, "end": 588487, "filename": "/crate_medkit.jpg"}, {"audio": 0, "start": 588487, "crunched": 0, "end": 590047, "filename": "/crate_medkit.mesh"}, {"audio": 0, "start": 590047, "crunched": 0, "end": 714013, "filename": "/cube-diffuse.jpg"}, {"audio": 0, "start": 714013, "crunched": 0, "end": 1005814, "filename": "/cube-normal.png"}, {"audio": 0, "start": 1005814, "crunched": 0, "end": 1039531, "filename": "/end_title.png"}, {"audio": 0, "start": 1039531, "crunched": 0, "end": 1062142, "filename": "/enemies_left.png"}, {"audio": 0, "start": 1062142, "crunched": 0, "end": 1153106, "filename": "/enemy1.mesh"}, {"audio": 0, "start": 1153106, "crunched": 0, "end": 1293515, "filename": "/exit_normal.png"}, {"audio": 0, "start": 1293515, "crunched": 0, "end": 1434024, "filename": "/exit_pressed.png"}, {"audio": 1, "start": 1434024, "crunched": 0, "end": 1449133, "filename": "/explosion.ogg"}, {"audio": 0, "start": 1449133, "crunched": 0, "end": 1702842, "filename": "/explosion1.png"}, {"audio": 0, "start": 1702842, "crunched": 0, "end": 1842604, "filename": "/gotit_normal.png"}, {"audio": 0, "start": 1842604, "crunched": 0, "end": 1982483, "filename": "/gotit_pressed.png"}, {"audio": 0, "start": 1982483, "crunched": 0, "end": 1984751, "filename": "/grass.mesh"}, {"audio": 0, "start": 1984751, "crunched": 0, "end": 2001635, "filename": "/heart.png"}, {"audio": 0, "start": 2001635, "crunched": 0, "end": 2142169, "filename": "/help_normal.png"}, {"audio": 0, "start": 2142169, "crunched": 0, "end": 2282810, "filename": "/help_pressed.png"}, {"audio": 0, "start": 2282810, "crunched": 0, "end": 2431259, "filename": "/help_screen.jpg"}, {"audio": 0, "start": 2431259, "crunched": 0, "end": 2431610, "filename": "/level-tmp1.dat"}, {"audio": 0, "start": 2431610, "crunched": 0, "end": 2431737, "filename": "/level-tmp2.dat"}, {"audio": 0, "start": 2431737, "crunched": 0, "end": 2431944, "filename": "/level-tmp3.dat"}, {"audio": 0, "start": 2431944, "crunched": 0, "end": 2432215, "filename": "/level1.dat"}, {"audio": 0, "start": 2432215, "crunched": 0, "end": 2432726, "filename": "/level2.dat"}, {"audio": 0, "start": 2432726, "crunched": 0, "end": 2433583, "filename": "/level3.dat"}, {"audio": 0, "start": 2433583, "crunched": 0, "end": 2557478, "filename": "/logo.png"}, {"audio": 0, "start": 2557478, "crunched": 0, "end": 2585987, "filename": "/lose_title.png"}, {"audio": 0, "start": 2585987, "crunched": 0, "end": 2724337, "filename": "/pause_normal.png"}, {"audio": 0, "start": 2724337, "crunched": 0, "end": 2862766, "filename": "/pause_pressed.png"}, {"audio": 0, "start": 2862766, "crunched": 0, "end": 2893602, "filename": "/pause_title.png"}, {"audio": 0, "start": 2893602, "crunched": 0, "end": 3034126, "filename": "/play_normal.png"}, {"audio": 0, "start": 3034126, "crunched": 0, "end": 3174761, "filename": "/play_pressed.png"}, {"audio": 0, "start": 3174761, "crunched": 0, "end": 3314800, "filename": "/restart_normal.png"}, {"audio": 0, "start": 3314800, "crunched": 0, "end": 3454955, "filename": "/restart_pressed.png"}, {"audio": 1, "start": 3454955, "crunched": 0, "end": 3467213, "filename": "/Rise01.ogg"}, {"audio": 0, "start": 3467213, "crunched": 0, "end": 3479841, "filename": "/river-corner-low.mesh"}, {"audio": 0, "start": 3479841, "crunched": 0, "end": 3489923, "filename": "/river-end-low.mesh"}, {"audio": 0, "start": 3489923, "crunched": 0, "end": 3494823, "filename": "/river-straight-low.mesh"}, {"audio": 0, "start": 3494823, "crunched": 0, "end": 3512771, "filename": "/road-corner-low.mesh"}, {"audio": 0, "start": 3512771, "crunched": 0, "end": 3528559, "filename": "/road-crossing-low.mesh"}, {"audio": 0, "start": 3528559, "crunched": 0, "end": 3536019, "filename": "/road-end-low.mesh"}, {"audio": 0, "start": 3536019, "crunched": 0, "end": 3543551, "filename": "/road-straight-low.mesh"}, {"audio": 0, "start": 3543551, "crunched": 0, "end": 3555447, "filename": "/road-tjunction-low.mesh"}, {"audio": 1, "start": 3555447, "crunched": 0, "end": 7157164, "filename": "/S31-Grime of the City.ogg"}, {"audio": 1, "start": 7157164, "crunched": 0, "end": 11102532, "filename": "/S31-Unexpected Trouble.ogg"}, {"audio": 0, "start": 11102532, "crunched": 0, "end": 11161016, "filename": "/small_logo.png"}, {"audio": 0, "start": 11161016, "crunched": 0, "end": 11211732, "filename": "/tank_body.mesh"}, {"audio": 0, "start": 11211732, "crunched": 0, "end": 11214816, "filename": "/tank_bullet.mesh"}, {"audio": 0, "start": 11214816, "crunched": 0, "end": 11227984, "filename": "/tank_gun.mesh"}, {"audio": 0, "start": 11227984, "crunched": 0, "end": 11659173, "filename": "/texture_panzerwagen.jpg"}, {"audio": 0, "start": 11659173, "crunched": 0, "end": 11659174, "filename": "/texture_panzerwagen.jpg.options"}, {"audio": 0, "start": 11659174, "crunched": 0, "end": 11695078, "filename": "/tree.mesh"}, {"audio": 0, "start": 11695078, "crunched": 0, "end": 11704110, "filename": "/wall-corner.mesh"}, {"audio": 0, "start": 11704110, "crunched": 0, "end": 11871566, "filename": "/wall-diffuse.jpg"}, {"audio": 0, "start": 11871566, "crunched": 0, "end": 12323173, "filename": "/wall-normal.png"}, {"audio": 0, "start": 12323173, "crunched": 0, "end": 12348741, "filename": "/wall.mesh"}, {"audio": 0, "start": 12348741, "crunched": 0, "end": 12353641, "filename": "/water.mesh"}, {"audio": 0, "start": 12353641, "crunched": 0, "end": 12384958, "filename": "/win_title.png"}], "remote_package_size": 12384958, "package_uuid": "82a9c192-49c1-41ba-84af-7acb080b96b2"});

})();

// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_WEB = typeof window === 'object';
// Three configurations we can be running in:
// 1) We could be the application main() thread running in the main JS UI thread. (ENVIRONMENT_IS_WORKER == false and ENVIRONMENT_IS_PTHREAD == false)
// 2) We could be the application main() thread proxied to worker. (with Emscripten -s PROXY_TO_WORKER=1) (ENVIRONMENT_IS_WORKER == true, ENVIRONMENT_IS_PTHREAD == false)
// 3) We could be an application pthread running in a worker. (ENVIRONMENT_IS_WORKER == true and ENVIRONMENT_IS_PTHREAD == true)
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function' && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) {
    var ret = Module['read'](filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    assert(ret.buffer);
    return ret;
  };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  if (!Module['thisProgram']) {
    if (process['argv'].length > 1) {
      Module['thisProgram'] = process['argv'][1].replace(/\\/g, '/');
    } else {
      Module['thisProgram'] = 'unknown-program';
    }
  }

  Module['arguments'] = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });

  Module['inspect'] = function () { return '[Emscripten Module object]'; };
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    var data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WORKER) {
    Module['load'] = importScripts;
  }

  if (typeof Module['setWindowTitle'] === 'undefined') {
    Module['setWindowTitle'] = function(title) { document.title = title };
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
if (!Module['thisProgram']) {
  Module['thisProgram'] = './this.program';
}

// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in: 
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at: 
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  setTempRet0: function (value) {
    tempRet0 = value;
  },
  getTempRet0: function () {
    return tempRet0;
  },
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  STACK_ALIGN: 16,
  prepVararg: function (ptr, type) {
    if (type === 'double' || type === 'i64') {
      // move so the load is aligned
      if (ptr & 7) {
        assert((ptr & 7) === 4);
        ptr += 4;
      }
    } else {
      assert((ptr & 3) === 0);
    }
    return ptr;
  },
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      assert(sig.length == 1);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[sig]) {
      Runtime.funcWrappers[sig] = {};
    }
    var sigCache = Runtime.funcWrappers[sig];
    if (!sigCache[func]) {
      sigCache[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return sigCache[func];
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+15)&-16);(assert((((STACKTOP|0) < (STACK_MAX|0))|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+15)&-16); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+15)&-16); if (DYNAMICTOP >= TOTAL_MEMORY) { var success = enlargeMemory(); if (!success) { DYNAMICTOP = ret;  return 0; } }; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 16))*(quantum ? quantum : 16); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}



Module["Runtime"] = Runtime;



//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  if (!func) {
    try {
      func = eval('_' + ident); // explicit lookup
    } catch(e) {}
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

var cwrap, ccall;
(function(){
  var JSfuncs = {
    // Helpers for cwrap -- it can't refer to Runtime directly because it might
    // be renamed by closure, instead it calls JSfuncs['stackSave'].body to find
    // out what the minified function name is.
    'stackSave': function() {
      Runtime.stackSave()
    },
    'stackRestore': function() {
      Runtime.stackRestore()
    },
    // type conversion from js to c
    'arrayToC' : function(arr) {
      var ret = Runtime.stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
    'stringToC' : function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        ret = Runtime.stackAlloc((str.length << 2) + 1);
        writeStringToMemory(str, ret);
      }
      return ret;
    }
  };
  // For fast lookup of conversion functions
  var toC = {'string' : JSfuncs['stringToC'], 'array' : JSfuncs['arrayToC']};

  // C calling interface. 
  ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
    var func = getCFunc(ident);
    var cArgs = [];
    var stack = 0;
    assert(returnType !== 'array', 'Return type should not be "array".');
    if (args) {
      for (var i = 0; i < args.length; i++) {
        var converter = toC[argTypes[i]];
        if (converter) {
          if (stack === 0) stack = Runtime.stackSave();
          cArgs[i] = converter(args[i]);
        } else {
          cArgs[i] = args[i];
        }
      }
    }
    var ret = func.apply(null, cArgs);
    if ((!opts || !opts.async) && typeof EmterpreterAsync === 'object') {
      assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling ccall');
    }
    if (opts && opts.async) assert(!returnType, 'async ccalls cannot return values');
    if (returnType === 'string') ret = Pointer_stringify(ret);
    if (stack !== 0) {
      if (opts && opts.async) {
        EmterpreterAsync.asyncFinalizers.push(function() {
          Runtime.stackRestore(stack);
        });
        return;
      }
      Runtime.stackRestore(stack);
    }
    return ret;
  }

  var sourceRegex = /^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
  function parseJSFunc(jsfunc) {
    // Match the body and the return value of a javascript function source
    var parsed = jsfunc.toString().match(sourceRegex).slice(1);
    return {arguments : parsed[0], body : parsed[1], returnValue: parsed[2]}
  }
  var JSsource = {};
  for (var fun in JSfuncs) {
    if (JSfuncs.hasOwnProperty(fun)) {
      // Elements of toCsource are arrays of three items:
      // the code, and the return value
      JSsource[fun] = parseJSFunc(JSfuncs[fun]);
    }
  }

  
  cwrap = function cwrap(ident, returnType, argTypes) {
    argTypes = argTypes || [];
    var cfunc = getCFunc(ident);
    // When the function takes numbers and returns a number, we can just return
    // the original function
    var numericArgs = argTypes.every(function(type){ return type === 'number'});
    var numericRet = (returnType !== 'string');
    if ( numericRet && numericArgs) {
      return cfunc;
    }
    // Creation of the arguments list (["$1","$2",...,"$nargs"])
    var argNames = argTypes.map(function(x,i){return '$'+i});
    var funcstr = "(function(" + argNames.join(',') + ") {";
    var nargs = argTypes.length;
    if (!numericArgs) {
      // Generate the code needed to convert the arguments from javascript
      // values to pointers
      funcstr += 'var stack = ' + JSsource['stackSave'].body + ';';
      for (var i = 0; i < nargs; i++) {
        var arg = argNames[i], type = argTypes[i];
        if (type === 'number') continue;
        var convertCode = JSsource[type + 'ToC']; // [code, return]
        funcstr += 'var ' + convertCode.arguments + ' = ' + arg + ';';
        funcstr += convertCode.body + ';';
        funcstr += arg + '=' + convertCode.returnValue + ';';
      }
    }

    // When the code is compressed, the name of cfunc is not literally 'cfunc' anymore
    var cfuncname = parseJSFunc(function(){return cfunc}).returnValue;
    // Call the function
    funcstr += 'var ret = ' + cfuncname + '(' + argNames.join(',') + ');';
    if (!numericRet) { // Return type can only by 'string' or 'number'
      // Convert the result to a string
      var strgfy = parseJSFunc(function(){return Pointer_stringify}).returnValue;
      funcstr += 'ret = ' + strgfy + '(ret);';
    }
    funcstr += "if (typeof EmterpreterAsync === 'object') { assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling cwrap') }";
    if (!numericArgs) {
      // If we had a stack, restore it
      funcstr += JSsource['stackRestore'].body.replace('()', '(stack)') + ';';
    }
    funcstr += 'return ret})';
    return eval(funcstr);
  };
})();
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;

function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module["setValue"] = setValue;


function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module["getValue"] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module["ALLOC_NORMAL"] = ALLOC_NORMAL;
Module["ALLOC_STACK"] = ALLOC_STACK;
Module["ALLOC_STATIC"] = ALLOC_STATIC;
Module["ALLOC_DYNAMIC"] = ALLOC_DYNAMIC;
Module["ALLOC_NONE"] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module["allocate"] = allocate;

// Allocate memory during any stage of startup - static memory early on, dynamic memory later, malloc when ready
function getMemory(size) {
  if (!staticSealed) return Runtime.staticAlloc(size);
  if ((typeof _sbrk !== 'undefined' && !_sbrk.called) || !runtimeInitialized) return Runtime.dynamicAlloc(size);
  return _malloc(size);
}
Module["getMemory"] = getMemory;

function Pointer_stringify(ptr, /* optional */ length) {
  if (length === 0 || !ptr) return '';
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = 0;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))>>0)];
    hasUtf |= t;
    if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (hasUtf < 128) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  return Module['UTF8ToString'](ptr);
}
Module["Pointer_stringify"] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAP8[((ptr++)>>0)];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}
Module["AsciiToString"] = AsciiToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}
Module["stringToAscii"] = stringToAscii;

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

function UTF8ArrayToString(u8Array, idx) {
  var u0, u1, u2, u3, u4, u5;

  var str = '';
  while (1) {
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    u0 = u8Array[idx++];
    if (!u0) return str;
    if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
    u1 = u8Array[idx++] & 63;
    if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
    u2 = u8Array[idx++] & 63;
    if ((u0 & 0xF0) == 0xE0) {
      u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
    } else {
      u3 = u8Array[idx++] & 63;
      if ((u0 & 0xF8) == 0xF0) {
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | u3;
      } else {
        u4 = u8Array[idx++] & 63;
        if ((u0 & 0xFC) == 0xF8) {
          u0 = ((u0 & 3) << 24) | (u1 << 18) | (u2 << 12) | (u3 << 6) | u4;
        } else {
          u5 = u8Array[idx++] & 63;
          u0 = ((u0 & 1) << 30) | (u1 << 24) | (u2 << 18) | (u3 << 12) | (u4 << 6) | u5;
        }
      }
    }
    if (u0 < 0x10000) {
      str += String.fromCharCode(u0);
    } else {
      var ch = u0 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    }
  }
}
Module["UTF8ArrayToString"] = UTF8ArrayToString;

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function UTF8ToString(ptr) {
  return UTF8ArrayToString(HEAPU8,ptr);
}
Module["UTF8ToString"] = UTF8ToString;

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outU8Array: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null 
//                    terminator, i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      outU8Array[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      outU8Array[outIdx++] = 0xC0 | (u >> 6);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      outU8Array[outIdx++] = 0xE0 | (u >> 12);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0x1FFFFF) {
      if (outIdx + 3 >= endIdx) break;
      outU8Array[outIdx++] = 0xF0 | (u >> 18);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0x3FFFFFF) {
      if (outIdx + 4 >= endIdx) break;
      outU8Array[outIdx++] = 0xF8 | (u >> 24);
      outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 5 >= endIdx) break;
      outU8Array[outIdx++] = 0xFC | (u >> 30);
      outU8Array[outIdx++] = 0x80 | ((u >> 24) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  outU8Array[outIdx] = 0;
  return outIdx - startIdx;
}
Module["stringToUTF8Array"] = stringToUTF8Array;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}
Module["stringToUTF8"] = stringToUTF8;

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) {
      ++len;
    } else if (u <= 0x7FF) {
      len += 2;
    } else if (u <= 0xFFFF) {
      len += 3;
    } else if (u <= 0x1FFFFF) {
      len += 4;
    } else if (u <= 0x3FFFFFF) {
      len += 5;
    } else {
      len += 6;
    }
  }
  return len;
}
Module["lengthBytesUTF8"] = lengthBytesUTF8;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module["UTF16ToString"] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null 
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[((outPtr)>>1)]=codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[((outPtr)>>1)]=0;
  return outPtr - startPtr;
}
Module["stringToUTF16"] = stringToUTF16;

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}
Module["lengthBytesUTF16"] = lengthBytesUTF16;

function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module["UTF32ToString"] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null 
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[((outPtr)>>2)]=codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[((outPtr)>>2)]=0;
  return outPtr - startPtr;
}
Module["stringToUTF32"] = stringToUTF32;

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}
Module["lengthBytesUTF32"] = lengthBytesUTF32;

function demangle(func) {
  var hasLibcxxabi = !!Module['___cxa_demangle'];
  if (hasLibcxxabi) {
    try {
      var buf = _malloc(func.length);
      writeStringToMemory(func.substr(1), buf);
      var status = _malloc(4);
      var ret = Module['___cxa_demangle'](buf, 0, 0, status);
      if (getValue(status, 'i32') === 0 && ret) {
        return Pointer_stringify(ret);
      }
      // otherwise, libcxxabi failed, we can try ours which may return a partial result
    } catch(e) {
      // failure when using libcxxabi, we can try ours which may return a partial result
    } finally {
      if (buf) _free(buf);
      if (status) _free(status);
      if (ret) _free(ret);
    }
  }
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  var parsed = func;
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    parsed = parse();
  } catch(e) {
    parsed += '?';
  }
  if (parsed.indexOf('?') >= 0 && !hasLibcxxabi) {
    Runtime.warnOnce('warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
  }
  return parsed;
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
    // so try that as a special-case.
    try {
      throw new Error(0);
    } catch(e) {
      err = e;
    }
    if (!err.stack) {
      return '(no stack trace available)';
    }
  }
  return err.stack.toString();
}

function stackTrace() {
  return demangleAll(jsStackTrace());
}
Module["stackTrace"] = stackTrace;

// Memory management

var PAGE_SIZE = 4096;

function alignMemoryPage(x) {
  if (x % 4096 > 0) {
    x += (4096 - (x % 4096));
  }
  return x;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk


function abortOnCannotGrowMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ');
}

function enlargeMemory() {
  abortOnCannotGrowMemory();
}


var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 268435456;

var totalMemory = 64*1024;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be compliant with the asm.js spec (and given that TOTAL_STACK=' + TOTAL_STACK + ')');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer;



buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);


// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['buffer'] = buffer;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;
var runtimeExited = false;


function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
  runtimeExited = true;
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module["addOnPreRun"] = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module["addOnInit"] = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module["addOnPreMain"] = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module["addOnExit"] = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module["addOnPostRun"] = addOnPostRun;

// Tools


function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}
Module["intArrayFromString"] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module["intArrayToString"] = intArrayToString;

function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))>>0)]=chr;
    i = i + 1;
  }
}
Module["writeStringToMemory"] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[((buffer++)>>0)]=array[i];
  }
}
Module["writeArrayToMemory"] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[((buffer++)>>0)]=str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[((buffer)>>0)]=0;
}
Module["writeAsciiToMemory"] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}


// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


if (!Math['clz32']) Math['clz32'] = function(x) {
  x = x >>> 0;
  for (var i = 0; i < 32; i++) {
    if (x & (1 << (31 - i))) return i;
  }
  return 32;
};
Math.clz32 = Math['clz32']

var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;
var Math_clz32 = Math.clz32;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
  return id;
}

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module["addRunDependency"] = addRunDependency;

function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module["removeRunDependency"] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data



var memoryInitializer = null;



// === Body ===

var ASM_CONSTS = [function() { alert("Unable to initialize WebGL.") },
 function($0, $1, $2) { { var w = $0; var h = $1; var pixels = $2; if (!Module['SDL2']) Module['SDL2'] = {}; var SDL2 = Module['SDL2']; if (SDL2.ctxCanvas !== Module['canvas']) { SDL2.ctx = Module['createContext'](Module['canvas'], false, true); SDL2.ctxCanvas = Module['canvas']; } if (SDL2.w !== w || SDL2.h !== h || SDL2.imageCtx !== SDL2.ctx) { SDL2.image = SDL2.ctx.createImageData(w, h); SDL2.w = w; SDL2.h = h; SDL2.imageCtx = SDL2.ctx; } var data = SDL2.image.data; var src = pixels >> 2; var dst = 0; var num; if (typeof CanvasPixelArray !== 'undefined' && data instanceof CanvasPixelArray) { num = data.length; while (dst < num) { var val = HEAP32[src]; data[dst ] = val & 0xff; data[dst+1] = (val >> 8) & 0xff; data[dst+2] = (val >> 16) & 0xff; data[dst+3] = 0xff; src++; dst += 4; } } else { if (SDL2.data32Data !== data) { SDL2.data32 = new Int32Array(data.buffer); SDL2.data8 = new Uint8Array(data.buffer); } var data32 = SDL2.data32; num = data32.length; data32.set(HEAP32.subarray(src, src + num)); var data8 = SDL2.data8; var i = 3; var j = i + 4*num; if (num % 8 == 0) { while (i < j) { data8[i] = 0xff; i = i + 4 | 0; data8[i] = 0xff; i = i + 4 | 0; data8[i] = 0xff; i = i + 4 | 0; data8[i] = 0xff; i = i + 4 | 0; data8[i] = 0xff; i = i + 4 | 0; data8[i] = 0xff; i = i + 4 | 0; data8[i] = 0xff; i = i + 4 | 0; data8[i] = 0xff; i = i + 4 | 0; } } else { while (i < j) { data8[i] = 0xff; i = i + 4 | 0; } } } SDL2.ctx.putImageData(SDL2.image, 0, 0); return 0; } },
 function($0) { { if (Module['canvas']) { Module['canvas'].style['cursor'] = Module['Pointer_stringify']($0); } return 0; } },
 function() { if (Module['canvas']) { Module['canvas'].style['cursor'] = 'none'; } },
 function() { { if (typeof(AudioContext) !== 'undefined') { return 1; } else if (typeof(webkitAudioContext) !== 'undefined') { return 1; } return 0; } },
 function() { { if(typeof(SDL2) === 'undefined') SDL2 = {}; if(typeof(SDL2.audio) === 'undefined') SDL2.audio = {}; if (!SDL2.audioContext) { if (typeof(AudioContext) !== 'undefined') { SDL2.audioContext = new AudioContext(); } else if (typeof(webkitAudioContext) !== 'undefined') { SDL2.audioContext = new webkitAudioContext(); } else { return -1; } } return 0; } },
 function() { { return SDL2.audioContext['sampleRate']; } },
 function($0, $1, $2, $3) { { SDL2.audio.scriptProcessorNode = SDL2.audioContext['createScriptProcessor']($1, 0, $0); SDL2.audio.scriptProcessorNode['onaudioprocess'] = function (e) { SDL2.audio.currentOutputBuffer = e['outputBuffer']; Runtime.dynCall('vi', $2, [$3]); }; SDL2.audio.scriptProcessorNode['connect'](SDL2.audioContext['destination']); } },
 function($0, $1) { { var numChannels = SDL2.audio.currentOutputBuffer['numberOfChannels']; for (var c = 0; c < numChannels; ++c) { var channelData = SDL2.audio.currentOutputBuffer['getChannelData'](c); if (channelData.length != $1) { throw 'Web Audio output buffer length mismatch! Destination size: ' + channelData.length + ' samples vs expected ' + $1 + ' samples!'; } for (var j = 0; j < $1; ++j) { channelData[j] = HEAPF32[$0 + ((j*numChannels + c) << 2) >> 2]; } } } },
 function() { { return screen.width; } },
 function() { { return screen.height; } },
 function($0) { { if (typeof Module['setWindowTitle'] !== 'undefined') { Module['setWindowTitle'](Module['Pointer_stringify']($0)); } return 0; } },
 function($0, $1) { { Module.printErr('bad name in getProcAddress: ' + [Pointer_stringify($0), Pointer_stringify($1)]); } }];

function _emscripten_asm_const_0(code) {
 return ASM_CONSTS[code]();
}

function _emscripten_asm_const_1(code, a0) {
 return ASM_CONSTS[code](a0);
}

function _emscripten_asm_const_2(code, a0, a1) {
 return ASM_CONSTS[code](a0, a1);
}

function _emscripten_asm_const_3(code, a0, a1, a2) {
 return ASM_CONSTS[code](a0, a1, a2);
}

function _emscripten_asm_const_4(code, a0, a1, a2, a3) {
 return ASM_CONSTS[code](a0, a1, a2, a3);
}



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 89360;
  /* global initializers */  __ATINIT__.push({ func: function() { __GLOBAL__I_000101() } }, { func: function() { __GLOBAL__sub_I_GameScene_cpp() } }, { func: function() { __GLOBAL__sub_I_LoseScene_cpp() } }, { func: function() { __GLOBAL__sub_I_PauseScene_cpp() } }, { func: function() { __GLOBAL__sub_I_WinScene_cpp() } }, { func: function() { __GLOBAL__sub_I_HelpScene_cpp() } }, { func: function() { __GLOBAL__sub_I_MainMenuScene_cpp() } }, { func: function() { __GLOBAL__sub_I_Engine_cpp() } }, { func: function() { __GLOBAL__sub_I_iostream_cpp() } });
  

/* memory initializer */ allocate([0,0,0,0,0,0,0,0,172,125,0,0,182,173,0,0,0,0,0,0,2,0,0,0,104,7,0,0,2,0,0,0,48,0,0,0,2,212,0,0,92,125,0,0,190,173,0,0,132,125,0,0,203,173,0,0,16,12,0,0,0,0,0,0,132,125,0,0,15,174,0,0,104,7,0,0,0,0,0,0,172,125,0,0,84,174,0,0,0,0,0,0,2,0,0,0,104,7,0,0,2,0,0,0,48,0,0,0,2,212,0,0,132,125,0,0,91,174,0,0,16,12,0,0,0,0,0,0,132,125,0,0,158,174,0,0,104,7,0,0,0,0,0,0,132,125,0,0,174,174,0,0,104,7,0,0,0,0,0,0,92,125,0,0,169,175,0,0,132,125,0,0,218,175,0,0,192,0,0,0,0,0,0,0,92,125,0,0,63,176,0,0,132,125,0,0,97,176,0,0,16,12,0,0,0,0,0,0,132,125,0,0,153,176,0,0,16,12,0,0,0,0,0,0,132,125,0,0,211,176,0,0,200,7,0,0,0,0,0,0,132,125,0,0,222,176,0,0,152,7,0,0,0,0,0,0,92,125,0,0,93,177,0,0,92,125,0,0,165,177,0,0,132,125,0,0,250,177,0,0,192,0,0,0,0,0,0,0,132,125,0,0,127,178,0,0,192,0,0,0,0,0,0,0,132,125,0,0,247,178,0,0,16,12,0,0,0,0,0,0,132,125,0,0,55,179,0,0,16,12,0,0,0,0,0,0,132,125,0,0,114,179,0,0,16,12,0,0,0,0,0,0,132,125,0,0,179,179,0,0,88,2,0,0,0,0,0,0,132,125,0,0,42,180,0,0,152,7,0,0,0,0,0,0,132,125,0,0,74,182,0,0,16,12,0,0,0,0,0,0,132,125,0,0,136,182,0,0,16,12,0,0,0,0,0,0,132,125,0,0,195,182,0,0,16,12,0,0,0,0,0,0,132,125,0,0,252,182,0,0,16,12,0,0,0,0,0,0,132,125,0,0,67,183,0,0,16,12,0,0,0,0,0,0,132,125,0,0,128,183,0,0,16,12,0,0,0,0,0,0,132,125,0,0,186,183,0,0,16,12,0,0,0,0,0,0,132,125,0,0,250,184,0,0,16,12,0,0,0,0,0,0,132,125,0,0,55,185,0,0,16,12,0,0,0,0,0,0,132,125,0,0,117,185,0,0,16,12,0,0,0,0,0,0,132,125,0,0,176,185,0,0,16,12,0,0,0,0,0,0,132,125,0,0,247,185,0,0,112,12,0,0,0,0,0,0,132,125,0,0,57,186,0,0,224,12,0,0,0,0,0,0,172,125,0,0,126,186,0,0,0,0,0,0,2,0,0,0,104,7,0,0,2,0,0,0,48,0,0,0,2,212,0,0,132,125,0,0,136,186,0,0,200,7,0,0,0,0,0,0,132,125,0,0,162,186,0,0,16,12,0,0,0,0,0,0,132,125,0,0,232,186,0,0,16,12,0,0,0,0,0,0,92,125,0,0,46,187,0,0,92,125,0,0,95,187,0,0,132,125,0,0,158,187,0,0,192,0,0,0,0,0,0,0,92,125,0,0,17,188,0,0,132,125,0,0,79,188,0,0,192,0,0,0,0,0,0,0,132,125,0,0,193,188,0,0,16,12,0,0,0,0,0,0,132,125,0,0,11,189,0,0,104,7,0,0,0,0,0,0,132,125,0,0,34,189,0,0,16,12,0,0,0,0,0,0,132,125,0,0,95,189,0,0,192,0,0,0,0,0,0,0,172,125,0,0,196,189,0,0,0,0,0,0,2,0,0,0,104,7,0,0,2,0,0,0,48,0,0,0,2,212,0,0,132,125,0,0,204,189,0,0,200,7,0,0,0,0,0,0,92,125,0,0,16,190,0,0,92,125,0,0,67,190,0,0,132,125,0,0,132,190,0,0,192,0,0,0,0,0,0,0,92,125,0,0,249,190,0,0,132,125,0,0,58,191,0,0,192,0,0,0,0,0,0,0,92,125,0,0,175,191,0,0,132,125,0,0,240,191,0,0,192,0,0,0,0,0,0,0,92,125,0,0,101,192,0,0,132,125,0,0,165,192,0,0,192,0,0,0,0,0,0,0,132,125,0,0,25,193,0,0,16,12,0,0,0,0,0,0,132,125,0,0,99,193,0,0,104,7,0,0,0,0,0,0,132,125,0,0,122,193,0,0,192,0,0,0,0,0,0,0,132,125,0,0,225,193,0,0,16,12,0,0,0,0,0,0,172,125,0,0,31,194,0,0,0,0,0,0,2,0,0,0,104,7,0,0,2,0,0,0,48,0,0,0,2,212,0,0,92,125,0,0,50,194,0,0,132,125,0,0,102,194,0,0,192,0,0,0,0,0,0,0,132,125,0,0,206,194,0,0,16,12,0,0,0,0,0,0,132,125,0,0,29,195,0,0,104,7,0,0,0,0,0,0,132,125,0,0,43,195,0,0,16,12,0,0,0,0,0,0,132,125,0,0,124,195,0,0,104,7,0,0,0,0,0,0,132,125,0,0,139,195,0,0,88,2,0,0,0,0,0,0,132,125,0,0,145,195,0,0,200,7,0,0,0,0,0,0,92,125,0,0,1,196,0,0,92,125,0,0,49,196,0,0,132,125,0,0,111,196,0,0,192,0,0,0,0,0,0,0,92,125,0,0,225,196,0,0,132,125,0,0,30,197,0,0,192,0,0,0,0,0,0,0,132,125,0,0,143,197,0,0,16,12,0,0,0,0,0,0,132,125,0,0,217,197,0,0,104,7,0,0,0,0,0,0,132,125,0,0,240,197,0,0,192,0,0,0,0,0,0,0,132,125,0,0,84,198,0,0,248,5,0,0,0,0,0,0,132,125,0,0,103,198,0,0,16,12,0,0,0,0,0,0,132,125,0,0,165,198,0,0,16,12,0,0,0,0,0,0,132,125,0,0,238,198,0,0,104,7,0,0,0,0,0,0,92,125,0,0,55,199,0,0,92,125,0,0,103,199,0,0,132,125,0,0,164,199,0,0,192,0,0,0,0,0,0,0,132,125,0,0,21,200,0,0,16,12,0,0,0,0,0,0,132,125,0,0,95,200,0,0,104,7,0,0,0,0,0,0,132,125,0,0,118,200,0,0,16,12,0,0,0,0,0,0,132,125,0,0,191,200,0,0,152,7,0,0,0,0,0,0,132,125,0,0,213,200,0,0,192,0,0,0,0,0,0,0,132,125,0,0,57,201,0,0,200,7,0,0,0,0,0,0,132,125,0,0,68,201,0,0,248,5,0,0,0,0,0,0,132,125,0,0,90,201,0,0,16,12,0,0,0,0,0,0,132,125,0,0,157,201,0,0,16,12,0,0,0,0,0,0,132,125,0,0,230,201,0,0,104,7,0,0,0,0,0,0,132,125,0,0,252,201,0,0,200,7,0,0,0,0,0,0,132,125,0,0,11,202,0,0,16,12,0,0,0,0,0,0,132,125,0,0,92,202,0,0,40,11,0,0,0,0,0,0,132,125,0,0,149,202,0,0,152,7,0,0,0,0,0,0,132,125,0,0,179,202,0,0,200,7,0,0,0,0,0,0,92,125,0,0,77,203,0,0,92,125,0,0,130,203,0,0,132,125,0,0,197,203,0,0,192,0,0,0,0,0,0,0,92,125,0,0,60,204,0,0,132,125,0,0,126,204,0,0,192,0,0,0,0,0,0,0,132,125,0,0,244,204,0,0,16,12,0,0,0,0,0,0,132,125,0,0,66,205,0,0,104,7,0,0,0,0,0,0,132,125,0,0,93,205,0,0,16,12,0,0,0,0,0,0,132,125,0,0,166,205,0,0,104,7,0,0,0,0,0,0,132,125,0,0,188,205,0,0,192,0,0,0,0,0,0,0,132,125,0,0,37,206,0,0,248,5,0,0,0,0,0,0,132,125,0,0,65,206,0,0,16,12,0,0,0,0,0,0,132,125,0,0,138,206,0,0,104,7,0,0,0,0,0,0,132,125,0,0,160,206,0,0,16,12,0,0,0,0,0,0,132,125,0,0,243,206,0,0,16,12,0,0,0,0,0,0,132,125,0,0,60,207,0,0,200,7,0,0,0,0,0,0,92,125,0,0,92,207,0,0,132,125,0,0,100,207,0,0,48,7,0,0,0,0,0,0,132,125,0,0,114,207,0,0,48,7,0,0,0,0,0,0,132,125,0,0,12,208,0,0,104,7,0,0,0,0,0,0,172,125,0,0,20,208,0,0,0,0,0,0,2,0,0,0,136,7,0,0,2,0,0,0,144,7,0,0,2,4,0,0,92,125,0,0,142,208,0,0,92,125,0,0,101,208,0,0,132,125,0,0,158,208,0,0,104,7,0,0,0,0,0,0,132,125,0,0,168,208,0,0,136,7,0,0,0,0,0,0,132,125,0,0,211,208,0,0,16,12,0,0,0,0,0,0,92,125,0,0,49,209,0,0,92,125,0,0,122,210,0,0,132,125,0,0,10,211,0,0,208,7,0,0,0,0,0,0,92,125,0,0,212,222,0,0,132,125,0,0,55,223,0,0,232,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,125,0,0,57,46,1,0,40,11,0,0,0,0,0,0,92,125,0,0,70,46,1,0,132,125,0,0,83,46,1,0,40,11,0,0,0,0,0,0,132,125,0,0,101,46,1,0,48,11,0,0,0,0,0,0,92,125,0,0,120,46,1,0,132,125,0,0,133,46,1,0,40,11,0,0,0,0,0,0,132,125,0,0,145,46,1,0,80,11,0,0,0,0,0,0,132,125,0,0,178,46,1,0,104,11,0,0,0,0,0,0,132,125,0,0,248,46,1,0,104,11,0,0,0,0,0,0,132,125,0,0,212,46,1,0,136,11,0,0,0,0,0,0,132,125,0,0,26,47,1,0,120,11,0,0,0,0,0,0,132,125,0,0,63,47,1,0,120,11,0,0,0,0,0,0,132,125,0,0,30,80,1,0,120,12,0,0,0,0,0,0,132,125,0,0,93,80,1,0,120,12,0,0,0,0,0,0,132,125,0,0,117,80,1,0,112,12,0,0,0,0,0,0,132,125,0,0,142,80,1,0,112,12,0,0,0,0,0,0,92,125,0,0,166,80,1,0,172,125,0,0,191,80,1,0,0,0,0,0,1,0,0,0,8,12,0,0,0,0,0,0,132,125,0,0,221,80,1,0,40,11,0,0,0,0,0,0,132,125,0,0,61,81,1,0,8,20,0,0,0,0,0,0,92,125,0,0,87,81,1,0,132,125,0,0,105,81,1,0,72,12,0,0,0,0,0,0,132,125,0,0,147,81,1,0,72,12,0,0,0,0,0,0,92,125,0,0,189,81,1,0,92,125,0,0,238,81,1,0,172,125,0,0,31,82,1,0,0,0,0,0,1,0,0,0,80,12,0,0,3,244,255,255,172,125,0,0,78,82,1,0,0,0,0,0,1,0,0,0,96,12,0,0,3,244,255,255,172,125,0,0,125,82,1,0,0,0,0,0,1,0,0,0,80,12,0,0,3,244,255,255,172,125,0,0,172,82,1,0,0,0,0,0,1,0,0,0,96,12,0,0,3,244,255,255,172,125,0,0,219,82,1,0,3,0,0,0,2,0,0,0,128,12,0,0,2,0,0,0,176,12,0,0,2,8,0,0,132,125,0,0,11,83,1,0,32,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,125,0,0,135,83,1,0,8,12,0,0,0,0,0,0,172,125,0,0,157,83,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,56,19,0,0,2,0,0,0,172,125,0,0,175,83,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,64,19,0,0,2,0,0,0,172,125,0,0,209,83,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,64,19,0,0,2,0,0,0,172,125,0,0,244,83,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,64,19,0,0,2,0,0,0,132,125,0,0,23,84,1,0,136,13,0,0,0,0,0,0,132,125,0,0,57,84,1,0,136,13,0,0,0,0,0,0,172,125,0,0,92,84,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,64,19,0,0,2,0,0,0,132,125,0,0,126,84,1,0,24,13,0,0,0,0,0,0,132,125,0,0,148,84,1,0,24,13,0,0,0,0,0,0,132,125,0,0,168,84,1,0,24,13,0,0,0,0,0,0,172,125,0,0,188,84,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,56,19,0,0,2,0,0,0,132,125,0,0,206,84,1,0,24,13,0,0,0,0,0,0,132,125,0,0,227,84,1,0,24,13,0,0,0,0,0,0,172,125,0,0,248,84,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,72,19,0,0,0,0,0,0,172,125,0,0,60,85,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,96,19,0,0,0,0,0,0,172,125,0,0,128,85,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,120,19,0,0,0,0,0,0,172,125,0,0,196,85,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,144,19,0,0,0,0,0,0,172,125,0,0,8,86,1,0,0,0,0,0,3,0,0,0,24,13,0,0,2,0,0,0,168,19,0,0,2,0,0,0,176,19,0,0,0,8,0,0,172,125,0,0,77,86,1,0,0,0,0,0,3,0,0,0,24,13,0,0,2,0,0,0,168,19,0,0,2,0,0,0,184,19,0,0,0,8,0,0,172,125,0,0,146,86,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,192,19,0,0,0,8,0,0,172,125,0,0,215,86,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,192,19,0,0,0,8,0,0,172,125,0,0,28,87,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,200,19,0,0,2,0,0,0,172,125,0,0,56,87,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,200,19,0,0,2,0,0,0,172,125,0,0,84,87,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,200,19,0,0,2,0,0,0,172,125,0,0,112,87,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,200,19,0,0,2,0,0,0,172,125,0,0,140,87,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,208,19,0,0,0,0,0,0,172,125,0,0,210,87,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,216,19,0,0,0,0,0,0,172,125,0,0,24,88,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,224,19,0,0,0,0,0,0,172,125,0,0,94,88,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,232,19,0,0,0,0,0,0,172,125,0,0,164,88,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,240,19,0,0,2,0,0,0,172,125,0,0,185,88,1,0,0,0,0,0,2,0,0,0,24,13,0,0,2,0,0,0,240,19,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,92,125,0,0,21,92,1,0,92,125,0,0,254,91,1,0,172,125,0,0,232,91,1,0,0,0,0,0,1,0,0,0,0,20,0,0,0,0,0,0,172,125,0,0,185,91,1,0,0,0,0,0,1,0,0,0,0,20,0,0,0,0,0,0,172,125,0,0,163,91,1,0,0,0,0,0,1,0,0,0,248,19,0,0,0,0,0,0,172,125,0,0,116,91,1,0,0,0,0,0,1,0,0,0,248,19,0,0,0,0,0,0,92,125,0,0,97,91,1,0,92,125,0,0,63,91,1,0,92,125,0,0,29,91,1,0,92,125,0,0,8,91,1,0,92,125,0,0,243,90,1,0,92,125,0,0,218,90,1,0,92,125,0,0,193,90,1,0,92,125,0,0,168,90,1,0,92,125,0,0,143,90,1,0,92,125,0,0,119,90,1,0,92,125,0,0,138,91,1,0,92,125,0,0,207,91,1,0,132,125,0,0,42,92,1,0,48,11,0,0,0,0,0,0,92,125,0,0,65,92,1,0,132,125,0,0,90,92,1,0,24,20,0,0,0,0,0,0,132,125,0,0,113,92,1,0,32,20,0,0,0,0,0,0,132,125,0,0,148,92,1,0,32,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,4,0,0,0,1,0,0,0,5,0,0,0,44,255,255,255,16,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,1,0,0,0,7,0,0,0,2,0,0,0,1,0,0,0,3,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,56,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,2,0,0,0,8,0,0,0,0,0,0,0,72,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,9,0,0,0,10,0,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,9,0,0,0,1,0,0,0,0,0,0,0,48,0,0,0,11,0,0,0,12,0,0,0,6,0,0,0,1,0,0,0,10,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,88,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,13,0,0,0,14,0,0,0,1,0,0,0,4,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,11,0,0,0,1,0,0,0,12,0,0,0,2,0,0,0,2,0,0,0,5,0,0,0,13,0,0,0,6,0,0,0,44,255,255,255,88,0,0,0,15,0,0,0,16,0,0,0,14,0,0,0,3,0,0,0,10,0,0,0,2,0,0,0,3,0,0,0,7,0,0,0,15,0,0,0,8,0,0,0,0,0,0,0,120,0,0,0,17,0,0,0,18,0,0,0,19,0,0,0,2,0,0,0,20,0,0,0,0,0,0,0,136,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,21,0,0,0,22,0,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,16,0,0,0,1,0,0,0,0,0,0,0,152,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,23,0,0,0,24,0,0,0,1,0,0,0,4,0,0,0,4,0,0,0,1,0,0,0,2,0,0,0,17,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,0,0,0,2,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,1,0,0,0,0,0,0,0,192,0,0,0,25,0,0,0,26,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,176,0,0,0,27,0,0,0,28,0,0,0,9,0,0,0,18,0,0,0,29,0,0,0,30,0,0,0,31,0,0,0,3,0,0,0,10,0,0,0,0,0,0,0,200,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,2,0,0,0,35,0,0,0,0,0,0,0,216,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,2,0,0,0,39,0,0,0,0,0,0,0,248,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,40,0,0,0,41,0,0,0,2,0,0,0,9,0,0,0,5,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,1,0,0,0,1,0,0,0,0,0,128,66,0,0,128,66,0,0,0,0,24,1,0,0,42,0,0,0,43,0,0,0,11,0,0,0,22,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,4,0,0,0,12,0,0,0,0,0,0,0,40,1,0,0,47,0,0,0,48,0,0,0,13,0,0,0,23,0,0,0,49,0,0,0,50,0,0,0,51,0,0,0,5,0,0,0,14,0,0,0,0,0,0,0,56,1,0,0,52,0,0,0,53,0,0,0,54,0,0,0,2,0,0,0,55,0,0,0,0,0,0,0,72,1,0,0,56,0,0,0,57,0,0,0,58,0,0,0,2,0,0,0,59,0,0,0,0,0,0,0,88,1,0,0,60,0,0,0,61,0,0,0,62,0,0,0,2,0,0,0,63,0,0,0,0,0,0,0,104,1,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,64,0,0,0,65,0,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,24,0,0,0,1,0,0,0,15,0,0,0,25,0,0,0,16,0,0,0,44,255,255,255,104,1,0,0,66,0,0,0,67,0,0,0,6,0,0,0,1,0,0,0,10,0,0,0,2,0,0,0,1,0,0,0,17,0,0,0,26,0,0,0,18,0,0,0,0,0,160,64,3,0,0,0,0,0,0,0,120,1,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,68,0,0,0,69,0,0,0,2,0,0,0,9,0,0,0,6,0,0,0,27,0,0,0,20,0,0,0,28,0,0,0,1,0,0,0,1,0,0,0,64,0,0,0,0,0,0,0,72,2,0,0,70,0,0,0,71,0,0,0,56,0,0,0,248,255,255,255,72,2,0,0,72,0,0,0,73,0,0,0,192,255,255,255,192,255,255,255,72,2,0,0,74,0,0,0,75,0,0,0,0,25,0,0,248,26,0,0,52,27,0,0,72,27,0,0,92,27,0,0,112,27,0,0,32,27,0,0,12,27,0,0,40,25,0,0,20,25,0,0,0,0,0,0,56,2,0,0,76,0,0,0,77,0,0,0,29,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,19,0,0,0,20,0,0,0,2,0,0,0,21,0,0,0,22,0,0,0,6,0,0,0,3,0,0,0,7,0,0,0,0,0,128,191,0,0,128,191,0,0,128,63,0,0,128,63,0,0,128,191,0,0,128,63,0,0,128,191,0,0,128,63,0,0,0,0,136,1,0,0,78,0,0,0,79,0,0,0,80,0,0,0,2,0,0,0,81,0,0,0,0,0,0,0,152,1,0,0,82,0,0,0,83,0,0,0,84,0,0,0,2,0,0,0,85,0,0,0,0,0,0,0,168,1,0,0,86,0,0,0,87,0,0,0,88,0,0,0,2,0,0,0,89,0,0,0,0,0,0,0,184,1,0,0,90,0,0,0,91,0,0,0,92,0,0,0,2,0,0,0,93,0,0,0,0,0,0,0,200,1,0,0,94,0,0,0,95,0,0,0,96,0,0,0,2,0,0,0,97,0,0,0,0,0,0,0,216,1,0,0,98,0,0,0,99,0,0,0,100,0,0,0,2,0,0,0,101,0,0,0,0,0,0,0,232,1,0,0,102,0,0,0,103,0,0,0,104,0,0,0,2,0,0,0,105,0,0,0,0,0,0,0,248,1,0,0,106,0,0,0,107,0,0,0,108,0,0,0,2,0,0,0,109,0,0,0,0,0,0,0,8,2,0,0,110,0,0,0,111,0,0,0,112,0,0,0,2,0,0,0,113,0,0,0,0,0,0,0,24,2,0,0,114,0,0,0,115,0,0,0,116,0,0,0,2,0,0,0,117,0,0,0,0,0,0,0,40,2,0,0,118,0,0,0,119,0,0,0,120,0,0,0,2,0,0,0,121,0,0,0,64,0,0,0,0,0,0,0,224,12,0,0,122,0,0,0,123,0,0,0,56,0,0,0,248,255,255,255,224,12,0,0,124,0,0,0,125,0,0,0,192,255,255,255,192,255,255,255,224,12,0,0,126,0,0,0,127,0,0,0,64,0,0,0,0,0,0,0,128,12,0,0,128,0,0,0,129,0,0,0,192,255,255,255,192,255,255,255,128,12,0,0,130,0,0,0,131,0,0,0,56,0,0,0,0,0,0,0,176,12,0,0,132,0,0,0,133,0,0,0,200,255,255,255,200,255,255,255,176,12,0,0,134,0,0,0,135,0,0,0,0,0,0,0,88,2,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,136,0,0,0,137,0,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,30,0,0,0,1,0,0,0,23,0,0,0,31,0,0,0,44,255,255,255,88,2,0,0,138,0,0,0,139,0,0,0,6,0,0,0,1,0,0,0,10,0,0,0,2,0,0,0,1,0,0,0,24,0,0,0,32,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,2,0,0,2,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,2,0,0,0,0,0,0,0,136,2,0,0,140,0,0,0,141,0,0,0,142,0,0,0,2,0,0,0,143,0,0,0,0,0,0,0,152,2,0,0,144,0,0,0,145,0,0,0,146,0,0,0,2,0,0,0,147,0,0,0,0,0,0,0,184,2,0,0,148,0,0,0,149,0,0,0,25,0,0,0,33,0,0,0,150,0,0,0,151,0,0,0,152,0,0,0,8,0,0,0,26,0,0,0,0,0,0,0,208,2,0,0,153,0,0,0,154,0,0,0,27,0,0,0,34,0,0,0,155,0,0,0,156,0,0,0,157,0,0,0,9,0,0,0,28,0,0,0,0,0,0,0,224,2,0,0,158,0,0,0,159,0,0,0,160,0,0,0,2,0,0,0,161,0,0,0,0,0,0,0,240,2,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,162,0,0,0,163,0,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,35,0,0,0,1,0,0,0,0,0,0,0,0,3,0,0,164,0,0,0,165,0,0,0,166,0,0,0,2,0,0,0,167,0,0,0,0,0,0,0,16,3,0,0,168,0,0,0,169,0,0,0,29,0,0,0,36,0,0,0,170,0,0,0,171,0,0,0,172,0,0,0,10,0,0,0,30,0,0,0,0,0,0,0,32,3,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,173,0,0,0,174,0,0,0,1,0,0,0,4,0,0,0,7,0,0,0,1,0,0,0,2,0,0,0,37,0,0,0,1,0,0,0,38,0,0,0,4,0,0,0,31,0,0,0,39,0,0,0,44,255,255,255,32,3,0,0,175,0,0,0,176,0,0,0,40,0,0,0,5,0,0,0,10,0,0,0,2,0,0,0,1,0,0,0,32,0,0,0,41,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,3,0,0,2,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,3,0,0,0,0,0,0,0,96,3,0,0,177,0,0,0,178,0,0,0,33,0,0,0,42,0,0,0,179,0,0,0,180,0,0,0,181,0,0,0,11,0,0,0,34,0,0,0,0,0,0,0,120,3,0,0,182,0,0,0,183,0,0,0,35,0,0,0,43,0,0,0,184,0,0,0,185,0,0,0,186,0,0,0,12,0,0,0,36,0,0,0,0,0,0,0,144,3,0,0,187,0,0,0,188,0,0,0,37,0,0,0,44,0,0,0,189,0,0,0,190,0,0,0,191,0,0,0,13,0,0,0,38,0,0,0,0,0,0,0,168,3,0,0,192,0,0,0,193,0,0,0,39,0,0,0,45,0,0,0,194,0,0,0,195,0,0,0,196,0,0,0,14,0,0,0,40,0,0,0,0,0,0,0,184,3,0,0,197,0,0,0,198,0,0,0,199,0,0,0,2,0,0,0,200,0,0,0,0,0,0,0,200,3,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,201,0,0,0,202,0,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,46,0,0,0,1,0,0,0,0,0,0,0,216,3,0,0,203,0,0,0,204,0,0,0,41,0,0,0,47,0,0,0,205,0,0,0,206,0,0,0,207,0,0,0,15,0,0,0,42,0,0,0,0,0,0,0,232,3,0,0,208,0,0,0,209,0,0,0,210,0,0,0,2,0,0,0,211,0,0,0,0,0,0,0,248,3,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,212,0,0,0,213,0,0,0,1,0,0,0,4,0,0,0,8,0,0,0,48,0,0,0,49,0,0,0,50,0,0,0,1,0,0,0,4,0,0,0,43,0,0,0,44,0,0,0,51,0,0,0,44,255,255,255,248,3,0,0,214,0,0,0,215,0,0,0,6,0,0,0,1,0,0,0,10,0,0,0,45,0,0,0,5,0,0,0,46,0,0,0,52,0,0,0,4,0,0,0,0,0,0,0,32,4,0,0,216,0,0,0,217,0,0,0,47,0,0,0,53,0,0,0,218,0,0,0,219,0,0,0,220,0,0,0,16,0,0,0,48,0,0,0,0,0,0,0,48,4,0,0,221,0,0,0,222,0,0,0,223,0,0,0,2,0,0,0,224,0,0,0,0,0,0,0,64,4,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,225,0,0,0,226,0,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,54,0,0,0,1,0,0,0,0,0,0,0,80,4,0,0,227,0,0,0,228,0,0,0,229,0,0,0,2,0,0,0,230,0,0,0,0,0,0,0,96,4,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,231,0,0,0,232,0,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,55,0,0,0,1,0,0,0,0,0,0,0,112,4,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,233,0,0,0,234,0,0,0,1,0,0,0,4,0,0,0,9,0,0,0,1,0,0,0,2,0,0,0,30,0,0,0,1,0,0,0,23,0,0,0,31,0,0,0,6,0,0,0,44,255,255,255,112,4,0,0,235,0,0,0,236,0,0,0,6,0,0,0,1,0,0,0,10,0,0,0,2,0,0,0,7,0,0,0,24,0,0,0,32,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,4,0,0,2,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,160,4,0,0,237,0,0,0,238,0,0,0,49,0,0,0,56,0,0,0,239,0,0,0,240,0,0,0,241,0,0,0,17,0,0,0,50,0,0,0,0,0,0,0,184,4,0,0,242,0,0,0,243,0,0,0,51,0,0,0,57,0,0,0,244,0,0,0,245,0,0,0,246,0,0,0,18,0,0,0,52,0,0,0,0,0,0,0,200,4,0,0,247,0,0,0,248,0,0,0,249,0,0,0,2,0,0,0,250,0,0,0,0,0,0,0,216,4,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,251,0,0,0,252,0,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,58,0,0,0,1,0,0,0,0,0,0,0,232,4,0,0,253,0,0,0,254,0,0,0,53,0,0,0,59,0,0,0,255,0,0,0,0,1,0,0,1,1,0,0,19,0,0,0,54,0,0,0,0,0,0,0,248,4,0,0,2,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,1,0,0,0,2,0,0,0,60,0,0,0,0,0,0,0,8,5,0,0,2,1,0,0,3,1,0,0,4,1,0,0,2,0,0,0,5,1,0,0,0,0,0,0,24,5,0,0,6,1,0,0,7,1,0,0,8,1,0,0,2,0,0,0,9,1,0,0,0,0,0,0,40,5,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,10,1,0,0,11,1,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,61,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,5,0,0,2,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,1,0,0,0,0,0,0,0,72,5,0,0,12,1,0,0,13,1,0,0,55,0,0,0,62,0,0,0,14,1,0,0,15,1,0,0,16,1,0,0,20,0,0,0,56,0,0,0,0,0,0,0,88,5,0,0,17,1,0,0,18,1,0,0,19,1,0,0,2,0,0,0,20,1,0,0,0,0,0,0,104,5,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,21,1,0,0,22,1,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,63,0,0,0,1,0,0,0,0,0,0,0,120,5,0,0,23,1,0,0,24,1,0,0,25,1,0,0,2,0,0,0,26,1,0,0,0,0,0,0,136,5,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,27,1,0,0,28,1,0,0,2,0,0,0,9,0,0,0,2,0,0,0,19,0,0,0,20,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,152,5,0,0,29,1,0,0,30,1,0,0,57,0,0,0,64,0,0,0,31,1,0,0,32,1,0,0,33,1,0,0,21,0,0,0,58,0,0,0,0,0,0,0,184,5,0,0,2,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,5,0,0,0,3,0,0,0,65,0,0,0,0,0,0,0,200,5,0,0,34,1,0,0,35,1,0,0,36,1,0,0,2,0,0,0,37,1,0,0,0,0,0,0,216,5,0,0,38,1,0,0,39,1,0,0,40,1,0,0,2,0,0,0,41,1,0,0,0,0,0,0,232,5,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,42,1,0,0,43,1,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,66,0,0,0,1,0,0,0,0,0,0,0,248,5,0,0,2,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,1,0,0,0,1,0,0,0,67,0,0,0,0,0,0,0,8,6,0,0,44,1,0,0,45,1,0,0,46,1,0,0,2,0,0,0,47,1,0,0,0,0,0,0,24,6,0,0,48,1,0,0,49,1,0,0,59,0,0,0,0,0,0,0,40,6,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,50,1,0,0,51,1,0,0,2,0,0,0,9,0,0,0,10,0,0,0,19,0,0,0,20,0,0,0,68,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,6,0,0,2,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,6,0,0,0,0,0,0,0,88,6,0,0,52,1,0,0,53,1,0,0,60,0,0,0,69,0,0,0,54,1,0,0,55,1,0,0,56,1,0,0,22,0,0,0,61,0,0,0,0,0,0,0,112,6,0,0,57,1,0,0,58,1,0,0,62,0,0,0,70,0,0,0,59,1,0,0,60,1,0,0,61,1,0,0,23,0,0,0,63,0,0,0,0,0,0,0,128,6,0,0,62,1,0,0,63,1,0,0,64,1,0,0,2,0,0,0,65,1,0,0,0,0,0,0,144,6,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,66,1,0,0,67,1,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,71,0,0,0,1,0,0,0,0,0,0,0,160,6,0,0,68,1,0,0,69,1,0,0,70,1,0,0,2,0,0,0,71,1,0,0,0,0,0,0,176,6,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,72,1,0,0,73,1,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,72,0,0,0,1,0,0,0,0,0,0,0,192,6,0,0,74,1,0,0,75,1,0,0,64,0,0,0,73,0,0,0,76,1,0,0,77,1,0,0,78,1,0,0,24,0,0,0,65,0,0,0,0,0,0,0,208,6,0,0,2,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,1,0,0,0,4,0,0,0,67,0,0,0,0,0,0,0,224,6,0,0,79,1,0,0,80,1,0,0,81,1,0,0,2,0,0,0,82,1,0,0,0,0,0,0,240,6,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,83,1,0,0,84,1,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,74,0,0,0,1,0,0,0,0,0,0,0,0,7,0,0,85,1,0,0,86,1,0,0,87,1,0,0,2,0,0,0,88,1,0,0,0,0,0,0,16,7,0,0,89,1,0,0,90,1,0,0,91,1,0,0,2,0,0,0,92,1,0,0,0,0,0,0,32,7,0,0,2,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,7,0,0,0,0,0,0,0,48,7,0,0,93,1,0,0,94,1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,56,7,0,0,95,1,0,0,96,1,0,0,10,0,0,0,25,0,0,0,75,0,0,0,76,0,0,0,0,0,0,0,72,7,0,0,97,1,0,0,98,1,0,0,11,0,0,0,26,0,0,0,77,0,0,0,78,0,0,0,0,0,0,0,88,7,0,0,1,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,99,1,0,0,100,1,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,79,0,0,0,3], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([104,7,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,101,1,0,0,102,1,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,0,0,0,0,136,7,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,152,7,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,103,1,0,0,104,1,0,0,2,0,0,0,9,0,0,0,2,0,0,0,19,0,0,0,20,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,168,7,0,0,27,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,0,0,0,0,184,7,0,0,105,1,0,0,106,1,0,0,107,1,0,0,2,0,0,0,108,1,0,0,0,0,0,0,200,7,0,0,2,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,7,0,0,109,1,0,0,110,1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,216,7,0,0,111,1,0,0,112,1,0,0,3,0,0,0,113,1,0,0,114,1,0,0,115,1,0,0,28,0,0,0,29,0,0,0,30,0,0,0,1,0,0,0,80,0,0,0,116,1,0,0,81,0,0,0,117,1,0,0,82,0,0,0,83,0,0,0,198,7,0,0,0,0,0,0,232,7,0,0,118,1,0,0,119,1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,240,7,0,0,120,1,0,0,121,1,0,0,84,0,0,0,122,1,0,0,85,0,0,0,4,0,0,0,5,0,0,0,5,0,0,0,0,0,0,0,4,0,0,0,86,0,0,0,66,0,0,0,0,0,0,0,1,0,0,0,3,0,0,0,7,0,0,0,15,0,0,0,31,0,0,0,63,0,0,0,127,0,0,0,255,0,0,0,255,1,0,0,255,3,0,0,255,7,0,0,255,15,0,0,255,31,0,0,255,63,0,0,255,127,0,0,255,255,0,0,0,0,0,0,255,255,255,255,253,255,255,255,249,255,255,255,241,255,255,255,225,255,255,255,193,255,255,255,129,255,255,255,1,255,255,255,1,254,255,255,1,252,255,255,1,248,255,255,1,240,255,255,1,224,255,255,1,192,255,255,1,128,255,255,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,13,0,0,0,15,0,0,0,17,0,0,0,19,0,0,0,23,0,0,0,27,0,0,0,31,0,0,0,35,0,0,0,43,0,0,0,51,0,0,0,59,0,0,0,67,0,0,0,83,0,0,0,99,0,0,0,115,0,0,0,131,0,0,0,163,0,0,0,195,0,0,0,227,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,7,0,0,0,9,0,0,0,13,0,0,0,17,0,0,0,25,0,0,0,33,0,0,0,49,0,0,0,65,0,0,0,97,0,0,0,129,0,0,0,193,0,0,0,1,1,0,0,129,1,0,0,1,2,0,0,1,3,0,0,1,4,0,0,1,6,0,0,1,8,0,0,1,12,0,0,1,16,0,0,1,24,0,0,1,32,0,0,1,48,0,0,1,64,0,0,1,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,5,0,0,0,6,0,0,0,6,0,0,0,7,0,0,0,7,0,0,0,8,0,0,0,8,0,0,0,9,0,0,0,9,0,0,0,10,0,0,0,10,0,0,0,11,0,0,0,11,0,0,0,12,0,0,0,12,0,0,0,13,0,0,0,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,8,0,0,0,8,0,0,0,4,0,0,0,4,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,8,0,0,0,8,0,0,0,8,0,0,0,4,0,0,0,4,0,0,0,2,0,0,0,2,0,0,0,0,1,0,0,128,0,0,0,86,0,0,0,64,0,0,0,62,180,228,51,9,145,243,51,139,178,1,52,60,32,10,52,35,26,19,52,96,169,28,52,167,215,38,52,75,175,49,52,80,59,61,52,112,135,73,52,35,160,86,52,184,146,100,52,85,109,115,52,136,159,129,52,252,11,138,52,147,4,147,52,105,146,156,52,50,191,166,52,63,149,177,52,147,31,189,52,228,105,201,52,173,128,214,52,54,113,228,52,166,73,243,52,136,140,1,53,192,247,9,53,6,239,18,53,118,123,28,53,192,166,38,53,55,123,49,53,218,3,61,53,94,76,73,53,59,97,86,53,185,79,100,53,252,37,115,53,138,121,129,53,134,227,137,53,124,217,146,53,133,100,156,53,82,142,166,53,51,97,177,53,37,232,188,53,220,46,201,53,206,65,214,53,65,46,228,53,87,2,243,53,143,102,1,54,79,207,9,54,245,195,18,54,152,77,28,54,232,117,38,54,50,71,49,54,116,204,60,54,94,17,73,54,101,34,86,54,206,12,100,54,184,222,114,54,151,83,129,54,28,187,137,54,114,174,146,54,175,54,156,54,129,93,166,54,53,45,177,54,199,176,188,54,228,243,200,54,1,3,214,54,96,235,227,54,30,187,242,54,162,64,1,55,235,166,9,55,241,152,18,55,201,31,28,55,30,69,38,55,61,19,49,55,30,149,60,55,111,214,72,55,162,227,85,55,247,201,99,55,137,151,114,55,175,45,129,55,190,146,137,55,116,131,146,55,230,8,156,55,190,44,166,55,71,249,176,55,121,121,188,55,254,184,200,55,71,196,213,55,146,168,227,55,248,115,242,55,192,26,1,56,147,126,9,56,249,109,18,56,6,242,27,56,98,20,38,56,86,223,48,56,216,93,60,56,146,155,72,56,242,164,85,56,51,135,99,56,110,80,114,56,211,7,129,56,107,106,137,56,130,88,146,56,42,219,155,56,9,252,165,56,104,197,176,56,59,66,188,56,41,126,200,56,160,133,213,56,217,101,227,56,232,44,242,56,233,244,0,57,70,86,9,57,14,67,18,57,81,196,27,57,181,227,37,57,127,171,48,57,162,38,60,57,197,96,72,57,83,102,85,57,131,68,99,57,104,9,114,57,1,226,128,57,36,66,137,57,157,45,146,57,123,173,155,57,99,203,165,57,153,145,176,57,13,11,188,57,102,67,200,57,11,71,213,57,50,35,227,57,237,229,241,57,29,207,0,58,5,46,9,58,48,24,18,58,169,150,27,58,21,179,37,58,183,119,48,58,124,239,59,58,10,38,72,58,199,39,85,58,230,1,99,58,120,194,113,58,59,188,128,58,233,25,137,58,198,2,146,58,219,127,155,58,203,154,165,58,216,93,176,58,239,211,187,58,179,8,200,58,136,8,213,58,159,224,226,58,7,159,241,58,92,169,0,59,208,5,9,59,94,237,17,59,15,105,27,59,132,130,37,59,253,67,48,59,103,184,59,59,97,235,71,59,77,233,84,59,93,191,98,59,156,123,113,59,127,150,128,59,186,241,136,59,249,215,145,59,71,82,155,59,65,106,165,59,39,42,176,59,226,156,187,59,18,206,199,59,23,202,212,59,32,158,226,59,53,88,241,59,166,131,0,60,167,221,8,60,152,194,17,60,130,59,27,60,1,82,37,60,84,16,48,60,97,129,59,60,200,176,71,60,229,170,84,60,232,124,98,60,212,52,113,60,207,112,128,60,150,201,136,60,58,173,145,60,192,36,155,60,197,57,165,60,133,246,175,60,229,101,187,60,130,147,199,60,185,139,212,60,180,91,226,60,121,17,241,60,251,93,0,61,137,181,8,61,223,151,17,61,2,14,27,61,141,33,37,61,185,220,47,61,109,74,59,61,64,118,71,61,145,108,84,61,133,58,98,61,34,238,112,61,42,75,128,61,127,161,136,61,136,130,145,61,72,247,154,61,88,9,165,61,242,194,175,61,248,46,187,61,3,89,199,61,109,77,212,61,92,25,226,61,209,202,240,61,91,56,0,62,119,141,8,62,51,109,17,62,144,224,26,62,39,241,36,62,46,169,47,62,135,19,59,62,202,59,71,62,77,46,84,62,55,248,97,62,132,167,112,62,143,37,128,62,115,121,136,62,226,87,145,62,220,201,154,62,249,216,164,62,109,143,175,62,27,248,186,62,149,30,199,62,51,15,212,62,23,215,225,62,61,132,240,62,198,18,0,63,114,101,8,63,147,66,17,63,43,179,26,63,206,192,36,63,177,117,47,63,178,220,58,63,101,1,71,63,29,240,83,63,251,181,97,63,251,96,112,63,0,0,128,63,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,227,12,1,0,14,0,0,0,4,0,0,0,4,32,54,22,4,32,118,22,4,24,22,22,4,24,86,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,237,12,1,0,9,0,0,0,8,0,0,0,4,32,54,22,4,32,118,22,4,32,70,22,4,32,134,22,4,24,22,22,4,24,86,22,2,16,21,21,2,15,19,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,24,22,22,4,24,22,22,0,2,0,0,0,0,0,0,123,1,0,0,4,24,22,22,4,24,22,22,112,0,0,0,0,0,0,0,124,1,0,0,4,24,22,22,4,24,22,22,112,2,0,0,0,0,0,0,125,1,0,0,4,24,22,22,4,24,22,22,3,0,0,0,0,0,0,0,126,1,0,0,4,24,22,22,4,24,22,22,3,2,0,0,0,0,0,0,127,1,0,0,4,24,22,22,4,24,22,22,115,0,0,0,0,0,0,0,128,1,0,0,4,24,22,22,4,24,22,22,115,2,0,0,0,0,0,0,129,1,0,0,4,24,22,22,4,24,86,22,0,2,0,0,0,0,0,0,130,1,0,0,4,24,22,22,4,24,86,22,112,0,0,0,0,0,0,0,131,1,0,0,4,24,22,22,4,24,86,22,112,2,0,0,0,0,0,0,132,1,0,0,4,24,22,22,4,24,86,22,3,0,0,0,0,0,0,0,133,1,0,0,4,24,22,22,4,24,86,22,3,2,0,0,0,0,0,0,134,1,0,0,4,24,22,22,4,24,86,22,115,0,0,0,0,0,0,0,135,1,0,0,4,24,22,22,4,24,86,22,115,2,0,0,0,0,0,0,136,1,0,0,4,24,22,22,4,32,54,22,0,2,0,0,0,0,0,0,137,1,0,0,4,24,22,22,4,32,54,22,112,0,0,0,0,0,0,0,138,1,0,0,4,24,22,22,4,32,54,22,112,2,0,0,0,0,0,0,139,1,0,0,4,24,22,22,4,32,54,22,3,0,0,0,0,0,0,0,140,1,0,0,4,24,22,22,4,32,54,22,3,2,0,0,0,0,0,0,141,1,0,0,4,24,22,22,4,32,54,22,115,0,0,0,0,0,0,0,142,1,0,0,4,24,22,22,4,32,54,22,115,2,0,0,0,0,0,0,143,1,0,0,4,24,86,22,4,24,22,22,0,2,0,0,0,0,0,0,144,1,0,0,4,24,86,22,4,24,22,22,112,0,0,0,0,0,0,0,145,1,0,0,4,24,86,22,4,24,22,22,112,2,0,0,0,0,0,0,146,1,0,0,4,24,86,22,4,24,22,22,3,0,0,0,0,0,0,0,147,1,0,0,4,24,86,22,4,24,22,22,3,2,0,0,0,0,0,0,148,1,0,0,4,24,86,22,4,24,22,22,115,0,0,0,0,0,0,0,149,1,0,0,4,24,86,22,4,24,22,22,115,2,0,0,0,0,0,0,150,1,0,0,4,24,86,22,4,24,86,22,0,2,0,0,0,0,0,0,151,1,0,0,4,24,86,22,4,24,86,22,112,0,0,0,0,0,0,0,152,1,0,0,4,24,86,22,4,24,86,22,112,2,0,0,0,0,0,0,153,1,0,0,4,24,86,22,4,24,86,22,3,0,0,0,0,0,0,0,154,1,0,0,4,24,86,22,4,24,86,22,3,2,0,0,0,0,0,0,155,1,0,0,4,24,86,22,4,24,86,22,115,0,0,0,0,0,0,0,156,1,0,0,4,24,86,22,4,24,86,22,115,2,0,0,0,0,0,0,157,1,0,0,4,24,86,22,4,32,54,22,0,2,0,0,0,0,0,0,158,1,0,0,4,24,86,22,4,32,54,22,112,0,0,0,0,0,0,0,159,1,0,0,4,24,86,22,4,32,54,22,112,2,0,0,0,0,0,0,160,1,0,0,4,24,86,22,4,32,54,22,3,0,0,0,0,0,0,0,161,1,0,0,4,24,86,22,4,32,54,22,3,2,0,0,0,0,0,0,162,1,0,0,4,24,86,22,4,32,54,22,115,0,0,0,0,0,0,0,163,1,0,0,4,24,86,22,4,32,54,22,115,2,0,0,0,0,0,0,164,1,0,0,4,32,54,22,4,24,22,22,0,2,0,0,0,0,0,0,165,1,0,0,4,32,54,22,4,24,22,22,112,0,0,0,0,0,0,0,166,1,0,0,4,32,54,22,4,24,22,22,112,2,0,0,0,0,0,0,167,1,0,0,4,32,54,22,4,24,22,22,3,0,0,0,0,0,0,0,168,1,0,0,4,32,54,22,4,24,22,22,3,2,0,0,0,0,0,0,169,1,0,0,4,32,54,22,4,24,22,22,115,0,0,0,0,0,0,0,170,1,0,0,4,32,54,22,4,24,22,22,115,2,0,0,0,0,0,0,171,1,0,0,4,32,54,22,4,24,86,22,0,2,0,0,0,0,0,0,172,1,0,0,4,32,54,22,4,24,86,22,112,0,0,0,0,0,0,0,173,1,0,0,4,32,54,22,4,24,86,22,112,2,0,0,0,0,0,0,174,1,0,0,4,32,54,22,4,24,86,22,3,0,0,0,0,0,0,0,175,1,0,0,4,32,54,22,4,24,86,22,3,2,0,0,0,0,0,0,176,1,0,0,4,32,54,22,4,24,86,22,115,0,0,0,0,0,0,0,177,1,0,0,4,32,54,22,4,24,86,22,115,2,0,0,0,0,0,0,178,1,0,0,4,32,54,22,4,32,54,22,0,2,0,0,0,0,0,0,179,1,0,0,4,32,54,22,4,32,54,22,112,0,0,0,0,0,0,0,180,1,0,0,4,32,54,22,4,32,54,22,112,2,0,0,0,0,0,0,181,1,0,0,4,32,54,22,4,32,54,22,3,0,0,0,0,0,0,0,182,1,0,0,4,32,54,22,4,32,54,22,3,2,0,0,0,0,0,0,183,1,0,0,4,32,54,22,4,32,54,22,115,0,0,0,0,0,0,0,184,1,0,0,4,32,54,22,4,32,54,22,115,2,0,0,0,0,0,0,185,1,0,0,4,32,70,22,4,24,22,22,0,2,0,0,0,0,0,0,186,1,0,0,4,32,70,22,4,24,22,22,112,0,0,0,0,0,0,0,187,1,0,0,4,32,70,22,4,24,22,22,112,2,0,0,0,0,0,0,188,1,0,0,4,32,70,22,4,24,22,22,3,0,0,0,0,0,0,0,189,1,0,0,4,32,70,22,4,24,22,22,3,2,0,0,0,0,0,0,190,1,0,0,4,32,70,22,4,24,22,22,115,0,0,0,0,0,0,0,191,1,0,0,4,32,70,22,4,24,22,22,115,2,0,0,0,0,0,0,192,1,0,0,4,32,70,22,4,24,86,22,0,2,0,0,0,0,0,0,193,1,0,0,4,32,70,22,4,24,86,22,112,0,0,0,0,0,0,0,194,1,0,0,4,32,70,22,4,24,86,22,112,2,0,0,0,0,0,0,195,1,0,0,4,32,70,22,4,24,86,22,3,0,0,0,0,0,0,0,196,1,0,0,4,32,70,22,4,24,86,22,3,2,0,0,0,0,0,0,197,1,0,0,4,32,70,22,4,24,86,22,115,0,0,0,0,0,0,0,198,1,0,0,4,32,70,22,4,24,86,22,115,2,0,0,0,0,0,0,199,1,0,0,4,32,70,22,4,32,54,22,0,2,0,0,0,0,0,0,200,1,0,0,4,32,70,22,4,32,54,22,112,0,0,0,0,0,0,0,201,1,0,0,4,32,70,22,4,32,54,22,112,2,0,0,0,0,0,0,202,1,0,0,4,32,70,22,4,32,54,22,3,0,0,0,0,0,0,0,203,1,0,0,4,32,70,22,4,32,54,22,3,2,0,0,0,0,0,0,204,1,0,0,4,32,70,22,4,32,54,22,115,0,0,0,0,0,0,0,205,1,0,0,4,32,70,22,4,32,54,22,115,2,0,0,0,0,0,0,206,1,0,0,4,32,118,22,4,24,22,22,0,2,0,0,0,0,0,0,207,1,0,0,4,32,118,22,4,24,22,22,112,0,0,0,0,0,0,0,208,1,0,0,4,32,118,22,4,24,22,22,112,2,0,0,0,0,0,0,209,1,0,0,4,32,118,22,4,24,22,22,3,0,0,0,0,0,0,0,210,1,0,0,4,32,118,22,4,24,22,22,3,2,0,0,0,0,0,0,211,1,0,0,4,32,118,22,4,24,22,22,115,0,0,0,0,0,0,0,212,1,0,0,4,32,118,22,4,24,22,22,115,2,0,0,0,0,0,0,213,1,0,0,4,32,118,22,4,24,86,22,0,2,0,0,0,0,0,0,214,1,0,0,4,32,118,22,4,24,86,22,112,0,0,0,0,0,0,0,215,1,0,0,4,32,118,22,4,24,86,22,112,2,0,0,0,0,0,0,216,1,0,0,4,32,118,22,4,24,86,22,3,0,0,0,0,0,0,0,217,1,0,0,4,32,118,22,4,24,86,22,3,2,0,0,0,0,0,0,218,1,0,0,4,32,118,22,4,24,86,22,115,0,0,0,0,0,0,0,219,1,0,0,4,32,118,22,4,24,86,22,115,2,0,0,0,0,0,0,220,1,0,0,4,32,118,22,4,32,54,22,0,2,0,0,0,0,0,0,221,1,0,0,4,32,118,22,4,32,54,22,112,0,0,0,0,0,0,0,222,1,0,0,4,32,118,22,4,32,54,22,112,2,0,0,0,0,0,0,223,1,0,0,4,32,118,22,4,32,54,22,3,0,0,0,0,0,0,0,224,1,0,0,4,32,118,22,4,32,54,22,3,2,0,0,0,0,0,0,225,1,0,0,4,32,118,22,4,32,54,22,115,0,0,0,0,0,0,0,226,1,0,0,4,32,118,22,4,32,54,22,115,2,0,0,0,0,0,0,227,1,0,0,4,32,134,22,4,24,22,22,0,2,0,0,0,0,0,0,228,1,0,0,4,32,134,22,4,24,22,22,112,0,0,0,0,0,0,0,229,1,0,0,4,32,134,22,4,24,22,22,112,2,0,0,0,0,0,0,230,1,0,0,4,32,134,22,4,24,22,22,3,0,0,0,0,0,0,0,231,1,0,0,4,32,134,22,4,24,22,22,3,2,0,0,0,0,0,0,232,1,0,0,4,32,134,22,4,24,22,22,115,0,0,0,0,0,0,0,233,1,0,0,4,32,134,22,4,24,22,22,115,2,0,0,0,0,0,0,234,1,0,0,4,32,134,22,4,24,86,22,0,2,0,0,0,0,0,0,235,1,0,0,4,32,134,22,4,24,86,22,112,0,0,0,0,0,0,0,236,1,0,0,4,32,134,22,4,24,86,22,112,2,0,0,0,0,0,0,237,1,0,0,4,32,134,22,4,24,86,22,3,0,0,0,0,0,0,0,238,1,0,0,4,32,134,22,4,24,86,22,3,2,0,0,0,0,0,0,239,1,0,0,4,32,134,22,4,24,86,22,115,0,0,0,0,0,0,0,240,1,0,0,4,32,134,22,4,24,86,22,115,2,0,0,0,0,0,0,241,1,0,0,4,32,134,22,4,32,54,22,0,2,0,0,0,0,0,0,242,1,0,0,4,32,134,22,4,32,54,22,112,0,0,0,0,0,0,0,243,1,0,0,4,32,134,22,4,32,54,22,112,2,0,0,0,0,0,0,244,1,0,0,4,32,134,22,4,32,54,22,3,0,0,0,0,0,0,0,245,1,0,0,4,32,134,22,4,32,54,22,3,2,0,0,0,0,0,0,246,1,0,0,4,32,134,22,4,32,54,22,115,0,0,0,0,0,0,0,247,1,0,0,4,32,134,22,4,32,54,22,115,2,0,0,0,0,0,0,248,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,246,12,1,0,246,13,1,0,118,14,1,0,182,14,1,0,214,14,1,0,230,14,1,0,238,14,1,0,242,14,1,0,244,14,1,0,17,15,1,0,245,14,1,0,1,0,0,0,67,0,0,0,17,15,1,0,28,15,1,0,68,0,0,0,0,0,0,0,105,15,1,0,56,15,1,0,2,0,0,0,69,0,0,0,79,15,1,0,84,15,1,0,70,0,0,0,1,0,0,0,105,15,1,0,111,15,1,0,71,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,59,0,0,8,60,0,0,216,59,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+10244);
/* memory initializer */ allocate([97,0,0,0,98,0,0,0,99,0,0,0,100,0,0,0,101,0,0,0,102,0,0,0,103,0,0,0,104,0,0,0,105,0,0,0,106,0,0,0,107,0,0,0,108,0,0,0,109,0,0,0,110,0,0,0,111,0,0,0,112,0,0,0,113,0,0,0,114,0,0,0,115,0,0,0,116,0,0,0,117,0,0,0,118,0,0,0,119,0,0,0,120,0,0,0,121,0,0,0,122,0,0,0,49,0,0,0,50,0,0,0,51,0,0,0,52,0,0,0,53,0,0,0,54,0,0,0,55,0,0,0,56,0,0,0,57,0,0,0,48,0,0,0,13,0,0,0,27,0,0,0,8,0,0,0,9,0,0,0,32,0,0,0,45,0,0,0,61,0,0,0,91,0,0,0,93,0,0,0,92,0,0,0,35,0,0,0,59,0,0,0,39,0,0,0,96,0,0,0,44,0,0,0,46,0,0,0,47,0,0,0,57,0,0,64,58,0,0,64,59,0,0,64,60,0,0,64,61,0,0,64,62,0,0,64,63,0,0,64,64,0,0,64,65,0,0,64,66,0,0,64,67,0,0,64,68,0,0,64,69,0,0,64,70,0,0,64,71,0,0,64,72,0,0,64,73,0,0,64,74,0,0,64,75,0,0,64,127,0,0,0,77,0,0,64,78,0,0,64,79,0,0,64,80,0,0,64,81,0,0,64,82,0,0,64,83,0,0,64,84,0,0,64,85,0,0,64,86,0,0,64,87,0,0,64,88,0,0,64,89,0,0,64,90,0,0,64,91,0,0,64,92,0,0,64,93,0,0,64,94,0,0,64,95,0,0,64,96,0,0,64,97,0,0,64,98,0,0,64,99,0,0,64,0,0,0,0,101,0,0,64,102,0,0,64,103,0,0,64,104,0,0,64,105,0,0,64,106,0,0,64,107,0,0,64,108,0,0,64,109,0,0,64,110,0,0,64,111,0,0,64,112,0,0,64,113,0,0,64,114,0,0,64,115,0,0,64,116,0,0,64,117,0,0,64,118,0,0,64,119,0,0,64,120,0,0,64,121,0,0,64,122,0,0,64,123,0,0,64,124,0,0,64,125,0,0,64,126,0,0,64,127,0,0,64,128,0,0,64,129,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,133,0,0,64,134,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,153,0,0,64,154,0,0,64,155,0,0,64,156,0,0,64,157,0,0,64,158,0,0,64,159,0,0,64,160,0,0,64,161,0,0,64,162,0,0,64,163,0,0,64,164,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,0,0,64,177,0,0,64,178,0,0,64,179,0,0,64,180,0,0,64,181,0,0,64,182,0,0,64,183,0,0,64,184,0,0,64,185,0,0,64,186,0,0,64,187,0,0,64,188,0,0,64,189,0,0,64,190,0,0,64,191,0,0,64,192,0,0,64,193,0,0,64,194,0,0,64,195,0,0,64,196,0,0,64,197,0,0,64,198,0,0,64,199,0,0,64,200,0,0,64,201,0,0,64,202,0,0,64,203,0,0,64,204,0,0,64,205,0,0,64,206,0,0,64,207,0,0,64,208,0,0,64,209,0,0,64,210,0,0,64,211,0,0,64,212,0,0,64,213,0,0,64,214,0,0,64,215,0,0,64,216,0,0,64,217,0,0,64,218,0,0,64,219,0,0,64,220,0,0,64,221,0,0,64,0,0,0,0,0,0,0,0,224,0,0,64,225,0,0,64,226,0,0,64,227,0,0,64,228,0,0,64,229,0,0,64,230,0,0,64,231,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,64,2,1,0,64,3,1,0,64,4,1,0,64,5,1,0,64,6,1,0,64,7,1,0,64,8,1,0,64,9,1,0,64,10,1,0,64,11,1,0,64,12,1,0,64,13,1,0,64,14,1,0,64,15,1,0,64,16,1,0,64,17,1,0,64,18,1,0,64,19,1,0,64,20,1,0,64,21,1,0,64,22,1,0,64,23,1,0,64,24,1,0,64,25,1,0,64,26,1,0,64], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+19228);
/* memory initializer */ allocate([6,0,0,1,6,0,0,2,6,0,0,3,6,0,0,4,6,0,0,5,6,0,0,6,6,0,0,8,49,0,0,96,49,0,0,1,0,0,0,188,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,172,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,156,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,60,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,60,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,60,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,76,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,76,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,76,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,92,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,92,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,92,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,108,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,108,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,108,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,124,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,124,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,124,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,140,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,124,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,108,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,92,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,76,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,60,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,0,0,0,73,0,0,0,74,0,0,0,75,0,0,0,255,255,255,255,0,0,0,0,249,1,0,0,250,1,0,0,251,1,0,0,252,1,0,0,0,0,0,0,253,1,0,0,254,1,0,0,255,1,0,0,0,2,0,0,0,0,0,0,1,2,0,0,2,2,0,0,3,2,0,0,4,2,0,0,0,0,0,0,5,2,0,0,6,2,0,0,7,2,0,0,8,2,0,0,172,90,0,0,212,90,0,0,156,91,0,0,196,91,0,0,152,48,0,0,1,0,0,0,56,48,0,0,56,48,0,0,56,48,0,0,56,48,0,0,56,48,0,0,0,0,0,0,200,59,0,0,232,59,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,155,0,0,0,0,0,0,0,0,0,0,0,117,0,0,0,0,0,0,0,42,0,0,0,43,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,225,0,0,0,224,0,0,0,226,0,0,0,72,0,0,0,57,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,44,0,0,0,75,0,0,0,78,0,0,0,77,0,0,0,74,0,0,0,80,0,0,0,82,0,0,0,79,0,0,0,81,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,73,0,0,0,76,0,0,0,0,0,0,0,39,0,0,0,30,0,0,0,31,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,0,0,0,0,51,0,0,0,0,0,0,0,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,18,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,29,0,0,0,227,0,0,0,0,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,98,0,0,0,89,0,0,0,90,0,0,0,91,0,0,0,92,0,0,0,93,0,0,0,94,0,0,0,95,0,0,0,96,0,0,0,97,0,0,0,85,0,0,0,87,0,0,0,0,0,0,0,86,0,0,0,99,0,0,0,84,0,0,0,58,0,0,0,59,0,0,0,60,0,0,0,61,0,0,0,62,0,0,0,63,0,0,0,64,0,0,0,65,0,0,0,66,0,0,0,67,0,0,0,68,0,0,0,69,0,0,0,104,0,0,0,105,0,0,0,106,0,0,0,107,0,0,0,108,0,0,0,109,0,0,0,110,0,0,0,111,0,0,0,112,0,0,0,113,0,0,0,114,0,0,0,115,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,71,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,45,0,0,0,129,0,0,0,128,0,0,0,2,1,0,0,3,1,0,0,0,0,0,0,5,1,0,0,0,0,0,0,6,1,0,0,129,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,51,0,0,0,46,0,0,0,54,0,0,0,45,0,0,0,55,0,0,0,56,0,0,0,53,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,47,0,0,0,49,0,0,0,48,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,2,0,0,0,0,0,0,0,248,0,0,224,7,0,0,31,0,0,0,4,0,0,0,0,0,255,0,0,255,0,0,255,0,0,0,0,0,0,0,10,2,0,0,7,0,0,0,0,248,0,0,224,7,0,0,31,0,0,0,4,0,0,0,255,0,0,0,0,255,0,0,0,0,255,0,0,0,0,0,11,2,0,0,7,0,0,0,0,248,0,0,224,7,0,0,31,0,0,0,4,0,0,0,0,0,0,255,0,0,255,0,0,255,0,0,0,0,0,0,12,2,0,0,7,0,0,0,0,248,0,0,224,7,0,0,31,0,0,0,4,0,0,0,0,255,0,0,0,0,255,0,0,0,0,255,0,0,0,0,13,2,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,2,0,0,0,0,0,0,0,0,255,0,0,255,0,0,255,0,0,0,2,0,0,0,0,248,0,0,224,7,0,0,31,0,0,0,0,0,0,0,14,2,0,0,1,0,0,0,0,0,255,0,0,255,0,0,255,0,0,0,2,0,0,0,0,124,0,0,224,3,0,0,31,0,0,0,0,0,0,0,15,2,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,2,0,0,0,0,0,0,0,0,0,0,255,0,0,0,0,0,0,8,255,0,32,0,0,0,0,16,255,0,64,0,0,0,0,24,255,0,97,0,0,0,0,32,255,0,129,0,0,0,0,41,255,0,161,0,0,0,0,49,255,0,194,0,0,0,0,57,255,0,226,0,0,0,0,65,255,8,0,0,0,0,0,74,255,8,32,0,0,0,0,82,255,8,64,0,0,0,0,90,255,8,97,0,0,0,0,98,255,8,129,0,0,0,0,106,255,8,161,0,0,0,0,115,255,8,194,0,0,0,0,123,255,8,226,0,0,0,0,131,255,16,0,0,0,0,0,139,255,16,32,0,0,0,0,148,255,16,64,0,0,0,0,156,255,16,97,0,0,0,0,164,255,16,129,0,0,0,0,172,255,16,161,0,0,0,0,180,255,16,194,0,0,0,0,189,255,16,226,0,0,0,0,197,255,24,0,0,0,0,0,205,255,24,32,0,0,0,0,213,255,24,64,0,0,0,0,222,255,24,97,0,0,0,0,230,255,24,129,0,0,0,0,238,255,24,161,0,0,0,0,246,255,24,194,0,0,0,0,255,255,24,226,0,0,0,4,0,255,32,0,0,0,0,4,8,255,32,32,0,0,0,4,16,255,32,64,0,0,0,4,24,255,32,97,0,0,0,4,32,255,32,129,0,0,0,4,41,255,32,161,0,0,0,4,49,255,32,194,0,0,0,4,57,255,32,226,0,0,0,4,65,255,41,0,0,0,0,4,74,255,41,32,0,0,0,4,82,255,41,64,0,0,0,4,90,255,41,97,0,0,0,4,98,255,41,129,0,0,0,4,106,255,41,161,0,0,0,4,115,255,41,194,0,0,0,4,123,255,41,226,0,0,0,4,131,255,49,0,0,0,0,4,139,255,49,32,0,0,0,4,148,255,49,64,0,0,0,4,156,255,49,97,0,0,0,4,164,255,49,129,0,0,0,4,172,255,49,161,0,0,0,4,180,255,49,194,0,0,0,4,189,255,49,226,0,0,0,4,197,255,57,0,0,0,0,4,205,255,57,32,0,0,0,4,213,255,57,64,0,0,0,4,222,255,57,97,0,0,0,4,230,255,57,129,0,0,0,4,238,255,57,161,0,0,0,4,246,255,57,194,0,0,0,4,255,255,57,226,0,0,0,8,0,255,65,0,0,0,0,8,8,255,65,32,0,0,0,8,16,255,65,64,0,0,0,8,24,255,65,97,0,0,0,8,32,255,65,129,0,0,0,8,41,255,65,161,0,0,0,8,49,255,65,194,0,0,0,8,57,255,65,226,0,0,0,8,65,255,74,0,0,0,0,8,74,255,74,32,0,0,0,8,82,255,74,64,0,0,0,8,90,255,74,97,0,0,0,8,98,255,74,129,0,0,0,8,106,255,74,161,0,0,0,8,115,255,74,194,0,0,0,8,123,255,74,226,0,0,0,8,131,255,82,0,0,0,0,8,139,255,82,32,0,0,0,8,148,255,82,64,0,0,0,8,156,255,82,97,0,0,0,8,164,255,82,129,0,0,0,8,172,255,82,161,0,0,0,8,180,255,82,194,0,0,0,8,189,255,82,226,0,0,0,8,197,255,90,0,0,0,0,8,205,255,90,32,0,0,0,8,213,255,90,64,0,0,0,8,222,255,90,97,0,0,0,8,230,255,90,129,0,0,0,8,238,255,90,161,0,0,0,8,246,255,90,194,0,0,0,8,255,255,90,226,0,0,0,12,0,255,98,0,0,0,0,12,8,255,98,32,0,0,0,12,16,255,98,64,0,0,0,12,24,255,98,97,0,0,0,12,32,255,98,129,0,0,0,12,41,255,98,161,0,0,0,12,49,255,98,194,0,0,0,12,57,255,98,226,0,0,0,12,65,255,106,0,0,0,0,12,74,255,106,32,0,0,0,12,82,255,106,64,0,0,0,12,90,255,106,97,0,0,0,12,98,255,106,129,0,0,0,12,106,255,106,161,0,0,0,12,115,255,106,194,0,0,0,12,123,255,106,226,0,0,0,12,131,255,115,0,0,0,0,12,139,255,115,32,0,0,0,12,148,255,115,64,0,0,0,12,156,255,115,97,0,0,0,12,164,255,115,129,0,0,0,12,172,255,115,161,0,0,0,12,180,255,115,194,0,0,0,12,189,255,115,226,0,0,0,12,197,255,123,0,0,0,0,12,205,255,123,32,0,0,0,12,213,255,123,64,0,0,0,12,222,255,123,97,0,0,0,12,230,255,123,129,0,0,0,12,238,255,123,161,0,0,0,12,246,255,123,194,0,0,0,12,255,255,123,226,0,0,0,16,0,255,131,0,0,0,0,16,8,255,131,32,0,0,0,16,16,255,131,64,0,0,0,16,24,255,131,97,0,0,0,16,32,255,131,129,0,0,0,16,41,255,131,161,0,0,0,16,49,255,131,194,0,0,0,16,57,255,131,226,0,0,0,16,65,255,139,0,0,0,0,16,74,255,139,32,0,0,0,16,82,255,139,64,0,0,0,16,90,255,139,97,0,0,0,16,98,255,139,129,0,0,0,16,106,255,139,161,0,0,0,16,115,255,139,194,0,0,0,16,123,255,139,226,0,0,0,16,131,255,148,0,0,0,0,16,139,255,148,32,0,0,0,16,148,255,148,64,0,0,0,16,156,255,148,97,0,0,0,16,164,255,148,129,0,0,0,16,172,255,148,161,0,0,0,16,180,255,148,194,0,0,0,16,189,255,148,226,0,0,0,16,197,255,156,0,0,0,0,16,205,255,156,32,0,0,0,16,213,255,156,64,0,0,0,16,222,255,156,97,0,0,0,16,230,255,156,129,0,0,0,16,238,255,156,161,0,0,0,16,246,255,156,194,0,0,0,16,255,255,156,226,0,0,0,20,0,255,164,0,0,0,0,20,8,255,164,32,0,0,0,20,16,255,164,64,0,0,0,20,24,255,164,97,0,0,0,20,32,255,164,129,0,0,0,20,41,255,164,161,0,0,0,20,49,255,164,194,0,0,0,20,57,255,164,226,0,0,0,20,65,255,172,0,0,0,0,20,74,255,172,32,0,0,0,20,82,255,172,64,0,0,0,20,90,255,172,97,0,0,0,20,98,255,172,129,0,0,0,20,106,255,172,161,0,0,0,20,115,255,172,194,0,0,0,20,123,255,172,226,0,0,0,20,131,255,180,0,0,0,0,20,139,255,180,32,0,0,0,20,148,255,180,64,0,0,0,20,156,255,180,97,0,0,0,20,164,255,180,129,0,0,0,20,172,255,180,161,0,0,0,20,180,255,180,194,0,0,0,20,189,255,180,226,0,0,0,20,197,255,189,0,0,0,0,20,205,255,189,32,0,0,0,20,213,255,189,64,0,0,0,20,222,255,189,97,0,0,0,20,230,255,189,129,0,0,0,20,238,255,189,161,0,0,0,20,246,255,189,194,0,0,0,20,255,255,189,226,0,0,0,24,0,255,197,0,0,0,0,24,8,255,197,32,0,0,0,24,16,255,197,64,0,0,0,24,24,255,197,97,0,0,0,24,32,255,197,129,0,0,0,24,41,255,197,161,0,0,0,24,49,255,197,194,0,0,0,24,57,255,197,226,0,0,0,24,65,255,205,0,0,0,0,24,74,255,205,32,0,0,0,24,82,255,205,64,0,0,0,24,90,255,205,97,0,0,0,24,98,255,205,129,0,0,0,24,106,255,205,161,0,0,0,24,115,255,205,194,0,0,0,24,123,255,205,226,0,0,0,24,131,255,213,0,0,0,0,24,139,255,213,32,0,0,0,24,148,255,213,64,0,0,0,24,156,255,213,97,0,0,0,24,164,255,213,129,0,0,0,24,172,255,213,161,0,0,0,24,180,255,213,194,0,0,0,24,189,255,213,226,0,0,0,24,197,255,222,0,0,0,0,24,205,255,222,32,0,0,0,24,213,255,222,64,0,0,0,24,222,255,222,97,0,0,0,24,230,255,222,129,0,0,0,24,238,255,222,161,0,0,0,24,246,255,222,194,0,0,0,24,255,255,222,226,0,0,0,28,0,255,230,0,0,0,0,28,8,255,230,32,0,0,0,28,16,255,230,64,0,0,0,28,24,255,230,97,0,0,0,28,32,255,230,129,0,0,0,28,41,255,230,161,0,0,0,28,49,255,230,194,0,0,0,28,57,255,230,226,0,0,0,28,65,255,238,0,0,0,0,28,74,255,238,32,0,0,0,28,82,255,238,64,0,0,0,28,90,255,238,97,0,0,0,28,98,255,238,129,0,0,0,28,106,255,238,161,0,0,0,28,115,255,238,194,0,0,0,28,123,255,238,226,0,0,0,28,131,255,246,0,0,0,0,28,139,255,246,32,0,0,0,28,148,255,246,64,0,0,0,28,156,255,246,97,0,0,0,28,164,255,246,129,0,0,0,28,172,255,246,161,0,0,0,28,180,255,246,194,0,0,0,28,189,255,246,226,0,0,0,28,197,255,255,0,0,0,0,28,205,255,255,32,0,0,0,28,213,255,255,64,0,0,0,28,222,255,255,97,0,0,0,28,230,255,255,129,0,0,0,28,238,255,255,161,0,0,0,28,246,255,255,194,0,0,0,28,255,255,255,226,0,255,0,0,0,0,0,0,0,255,8,0,0,0,0,32,0,255,16,0,0,0,0,64,0,255,24,0,0,0,0,97,0,255,32,0,0,0,0,129,0,255,41,0,0,0,0,161,0,255,49,0,0,0,0,194,0,255,57,0,0,0,0,226,0,255,65,0,0,0,0,0,8,255,74,0,0,0,0,32,8,255,82,0,0,0,0,64,8,255,90,0,0,0,0,97,8,255,98,0,0,0,0,129,8,255,106,0,0,0,0,161,8,255,115,0,0,0,0,194,8,255,123,0,0,0,0,226,8,255,131,0,0,0,0,0,16,255,139,0,0,0,0,32,16,255,148,0,0,0,0,64,16,255,156,0,0,0,0,97,16,255,164,0,0,0,0,129,16,255,172,0,0,0,0,161,16,255,180,0,0,0,0,194,16,255,189,0,0,0,0,226,16,255,197,0,0,0,0,0,24,255,205,0,0,0,0,32,24,255,213,0,0,0,0,64,24,255,222,0,0,0,0,97,24,255,230,0,0,0,0,129,24,255,238,0,0,0,0,161,24,255,246,0,0,0,0,194,24,255,255,0,0,0,0,226,24,255,0,4,0,0,0,0,32,255,8,4,0,0,0,32,32,255,16,4,0,0,0,64,32,255,24,4,0,0,0,97,32,255,32,4,0,0,0,129,32,255,41,4,0,0,0,161,32,255,49,4,0,0,0,194,32,255,57,4,0,0,0,226,32,255,65,4,0,0,0,0,41,255,74,4,0,0,0,32,41,255,82,4,0,0,0,64,41,255,90,4,0,0,0,97,41,255,98,4,0,0,0,129,41,255,106,4,0,0,0,161,41,255,115,4,0,0,0,194,41,255,123,4,0,0,0,226,41,255,131,4,0,0,0,0,49,255,139,4,0,0,0,32,49,255,148,4,0,0,0,64,49,255,156,4,0,0,0,97,49,255,164,4,0,0,0,129,49,255,172,4,0,0,0,161,49,255,180,4,0,0,0,194,49,255,189,4,0,0,0,226,49,255,197,4,0,0,0,0,57,255,205,4,0,0,0,32,57,255,213,4,0,0,0,64,57,255,222,4,0,0,0,97,57,255,230,4,0,0,0,129,57,255,238,4,0,0,0,161,57,255,246,4,0,0,0,194,57,255,255,4,0,0,0,226,57,255,0,8,0,0,0,0,65,255,8,8,0,0,0,32,65,255,16,8,0,0,0,64,65,255,24,8,0,0,0,97,65,255,32,8,0,0,0,129,65,255,41,8,0,0,0,161,65,255,49,8,0,0,0,194,65,255,57,8,0,0,0,226,65,255,65,8,0,0,0,0,74,255,74,8,0,0,0,32,74,255,82,8,0,0,0,64,74,255,90,8,0,0,0,97,74,255,98,8,0,0,0,129,74,255,106,8,0,0,0,161,74,255,115,8,0,0,0,194,74,255,123,8,0,0,0,226,74,255,131,8,0,0,0,0,82,255,139,8,0,0,0,32,82,255,148,8,0,0,0,64,82,255,156,8,0,0,0,97,82,255,164,8,0,0,0,129,82,255,172,8,0,0,0,161,82,255,180,8,0,0,0,194,82,255,189,8,0,0,0,226,82,255,197,8,0,0,0,0,90,255,205,8,0,0,0,32,90,255,213,8,0,0,0,64,90,255,222,8,0,0,0,97,90,255,230,8,0,0,0,129,90,255,238,8,0,0,0,161,90,255,246,8,0,0,0,194,90,255,255,8,0,0,0,226,90,255,0,12,0,0,0,0,98,255,8,12,0,0,0,32,98,255,16,12,0,0,0,64,98,255,24,12,0,0,0,97,98,255,32,12,0,0,0,129,98,255,41,12,0,0,0,161,98,255,49,12,0,0,0,194,98,255,57,12,0,0,0,226,98,255,65,12,0,0,0,0,106,255,74,12,0,0,0,32,106,255,82,12,0,0,0,64,106,255,90,12,0,0,0,97,106,255,98,12,0,0,0,129,106,255,106,12,0,0,0,161,106,255,115,12,0,0,0,194,106,255,123,12,0,0,0,226,106,255,131,12,0,0,0,0,115,255,139,12,0,0,0,32,115,255,148,12,0,0,0,64,115,255,156,12,0,0,0,97,115,255,164,12,0,0,0,129,115,255,172,12,0,0,0,161,115,255,180,12,0,0,0,194,115,255,189,12,0,0,0,226,115,255,197,12,0,0,0,0,123,255,205,12,0,0,0,32,123,255,213,12,0,0,0,64,123,255,222,12,0,0,0,97,123,255,230,12,0,0,0,129,123,255,238,12,0,0,0,161,123,255,246,12,0,0,0,194,123,255,255,12,0,0,0,226,123,255,0,16,0,0,0,0,131,255,8,16,0,0,0,32,131,255,16,16,0,0,0,64,131,255,24,16,0,0,0,97,131,255,32,16,0,0,0,129,131,255,41,16,0,0,0,161,131,255,49,16,0,0,0,194,131,255,57,16,0,0,0,226,131,255,65,16,0,0,0,0,139,255,74,16,0,0,0,32,139,255,82,16,0,0,0,64,139,255,90,16,0,0,0,97,139,255,98,16,0,0,0,129,139,255,106,16,0,0,0,161,139,255,115,16,0,0,0,194,139,255,123,16,0,0,0,226,139,255,131,16,0,0,0,0,148,255,139,16,0,0,0,32,148,255,148,16,0,0,0,64,148,255,156,16,0,0,0,97,148,255,164,16,0,0,0,129,148,255,172,16,0,0,0,161,148,255,180,16,0,0,0,194,148,255,189,16,0,0,0,226,148,255,197,16,0,0,0,0,156,255,205,16,0,0,0,32,156,255,213,16,0,0,0,64,156,255,222,16,0,0,0,97,156,255,230,16,0,0,0,129,156,255,238,16,0,0,0,161,156,255,246,16,0,0,0,194,156,255,255,16,0,0,0,226,156,255,0,20,0,0,0,0,164,255,8,20,0,0,0,32,164,255,16,20,0,0,0,64,164,255,24,20,0,0,0,97,164,255,32,20,0,0,0,129,164,255,41,20,0,0,0,161,164,255,49,20,0,0,0,194,164,255,57,20,0,0,0,226,164,255,65,20,0,0,0,0,172,255,74,20,0,0,0,32,172,255,82,20,0,0,0,64,172,255,90,20,0,0,0,97,172,255,98,20,0,0,0,129,172,255,106,20,0,0,0,161,172,255,115,20,0,0,0,194,172,255,123,20,0,0,0,226,172,255,131,20,0,0,0,0,180,255,139,20,0,0,0,32,180,255,148,20,0,0,0,64,180,255,156,20,0,0,0,97,180,255,164,20,0,0,0,129,180,255,172,20,0,0,0,161,180,255,180,20,0,0,0,194,180,255,189,20,0,0,0,226,180,255,197,20,0,0,0,0,189,255,205,20,0,0,0,32,189,255,213,20,0,0,0,64,189,255,222,20,0,0,0,97,189,255,230,20,0,0,0,129,189,255,238,20,0,0,0,161,189,255,246,20,0,0,0,194,189,255,255,20,0,0,0,226,189,255,0,24,0,0,0,0,197,255,8,24,0,0,0,32,197,255,16,24,0,0,0,64,197,255,24,24,0,0,0,97,197,255,32,24,0,0,0,129,197,255,41,24,0,0,0,161,197,255,49,24,0,0,0,194,197,255,57,24,0,0,0,226,197,255,65,24,0,0,0,0,205,255,74,24,0,0,0,32,205,255,82,24,0,0,0,64,205,255,90,24,0,0,0,97,205,255,98,24,0,0,0,129,205,255,106,24,0,0,0,161,205,255,115,24,0,0,0,194,205,255,123,24,0,0,0,226,205,255,131,24,0,0,0,0,213,255,139,24,0,0,0,32,213,255,148,24,0,0,0,64,213,255,156,24,0,0,0,97,213,255,164,24,0,0,0,129,213,255,172,24,0,0,0,161,213,255,180,24,0,0,0,194,213,255,189,24,0,0,0,226,213,255,197,24,0,0,0,0,222,255,205,24,0,0,0,32,222,255,213,24,0,0,0,64,222,255,222,24,0,0,0,97,222,255,230,24,0,0,0,129,222,255,238,24,0,0,0,161,222,255,246,24,0,0,0,194,222,255,255,24,0,0,0,226,222,255,0,28,0,0,0,0,230,255,8,28,0,0,0,32,230,255,16,28,0,0,0,64,230,255,24,28,0,0,0,97,230,255,32,28,0,0,0,129,230,255,41,28,0,0,0,161,230,255,49,28,0,0,0,194,230,255,57,28,0,0,0,226,230,255,65,28,0,0,0,0,238,255,74,28,0,0,0,32,238,255,82,28,0,0,0,64,238,255,90,28,0,0,0,97,238,255,98,28,0,0,0,129,238,255,106,28,0,0,0,161,238,255,115,28,0,0,0,194,238,255,123,28,0,0,0,226,238,255,131,28,0,0,0,0,246,255,139,28,0,0,0,32,246,255,148,28,0,0,0,64,246,255,156,28,0,0,0,97,246,255,164,28,0,0,0,129,246,255,172,28,0,0,0,161,246,255,180,28,0,0,0,194,246,255,189,28,0,0,0,226,246,255,197,28,0,0,0,0,255,255,205,28,0,0,0,32,255,255,213,28,0,0,0,64,255,255,222,28,0,0,0,97,255,255,230,28,0,0,0,129,255,255,238,28,0,0,0,161,255,255,246,28,0,0,0,194,255,255,255,28,0,0,0,226,255,0,0,0,255,0,0,0,0,0,0,8,255,0,32,0,0,0,0,16,255,0,64,0,0,0,0,24,255,0,97,0,0,0,0,32,255,0,129,0,0,0,0,41,255,0,161,0,0,0,0,49,255,0,194,0,0,0,0,57,255,0,226,0,0,0,0,65,255,8,0,0,0,0,0,74,255,8,32,0,0,0,0,82,255,8,64,0,0,0,0,90,255,8,97,0,0,0,0,98,255,8,129,0,0,0,0,106,255,8,161,0,0,0,0,115,255,8,194,0,0,0,0,123,255,8,226,0,0,0,0,131,255,16,0,0,0,0,0,139,255,16,32,0,0,0,0,148,255,16,64,0,0,0,0,156,255,16,97,0,0,0,0,164,255,16,129,0,0,0,0,172,255,16,161,0,0,0,0,180,255,16,194,0,0,0,0,189,255,16,226,0,0,0,0,197,255,24,0,0,0,0,0,205,255,24,32,0,0,0,0,213,255,24,64,0,0,0,0,222,255,24,97,0,0,0,0,230,255,24,129,0,0,0,0,238,255,24,161,0,0,0,0,246,255,24,194,0,0,0,0,255,255,24,226,0,0,0,4,0,255,32,0,0,0,0,4,8,255,32,32,0,0,0,4,16,255,32,64,0,0,0,4,24,255,32,97,0,0,0,4,32,255,32,129,0,0,0,4,41,255,32,161,0,0,0,4,49,255,32,194,0,0,0,4,57,255,32,226,0,0,0,4,65,255,41,0,0,0,0,4,74,255,41,32,0,0,0,4,82,255,41,64,0,0,0,4,90,255,41,97,0,0,0,4,98,255,41,129,0,0,0,4,106,255,41,161,0,0,0,4,115,255,41,194,0,0,0,4,123,255,41,226,0,0,0,4,131,255,49,0,0,0,0,4,139,255,49,32,0,0,0,4,148,255,49,64,0,0,0,4,156,255,49,97,0,0,0,4,164,255,49,129,0,0,0,4,172,255,49,161,0,0,0,4,180,255,49,194,0,0,0,4,189,255,49,226,0,0,0,4,197,255,57,0,0,0,0,4,205,255,57,32,0,0,0,4,213,255,57,64,0,0,0,4,222,255,57,97,0,0,0,4,230,255,57,129,0,0,0,4,238,255,57,161,0,0,0,4,246,255,57,194,0,0,0,4,255,255,57,226,0,0,0,8,0,255,65,0,0,0,0,8,8,255,65,32,0,0,0,8,16,255,65,64,0,0,0,8,24,255,65,97,0,0,0,8,32,255,65,129,0,0,0,8,41,255,65,161,0,0,0,8,49,255,65,194,0,0,0,8,57,255,65,226,0,0,0,8,65,255,74,0,0,0,0,8,74,255,74,32,0,0,0,8,82,255,74,64,0,0,0,8,90,255,74,97,0,0,0,8,98,255,74,129,0,0,0,8,106,255,74,161,0,0,0,8,115,255,74,194,0,0,0,8,123,255,74,226,0,0,0,8,131,255,82,0,0,0,0,8,139,255,82,32,0,0,0,8,148,255,82,64,0,0,0,8,156,255,82,97,0,0,0,8,164,255,82,129,0,0,0,8,172,255,82,161,0,0,0,8,180,255,82,194,0,0,0,8,189,255,82,226,0,0,0,8,197,255,90,0,0,0,0,8,205,255,90,32,0,0,0,8,213,255,90,64,0,0,0,8,222,255,90,97,0,0,0,8,230,255,90,129,0,0,0,8,238,255,90,161,0,0,0,8,246,255,90,194,0,0,0,8,255,255,90,226,0,0,0,12,0,255,98,0,0,0,0,12,8,255,98,32,0,0,0,12,16,255,98,64,0,0,0,12,24,255,98,97,0,0,0,12,32,255,98,129,0,0,0,12,41,255,98,161,0,0,0,12,49,255,98,194,0,0,0,12,57,255,98,226,0,0,0,12,65,255,106,0,0,0,0,12,74,255,106,32,0,0,0,12,82,255,106,64,0,0,0,12,90,255,106,97,0,0,0,12,98,255,106,129,0,0,0,12,106,255,106,161,0,0,0,12,115,255,106,194,0,0,0,12,123,255,106,226,0,0,0,12,131,255,115,0,0,0,0,12,139,255,115,32,0,0,0,12,148,255,115,64,0,0,0,12,156,255,115,97,0,0,0,12,164,255,115,129,0,0,0,12,172,255,115,161,0,0,0,12,180,255,115,194,0,0,0,12,189,255,115,226,0,0,0,12,197,255,123,0,0,0,0,12,205,255,123,32,0,0,0,12,213,255,123,64,0,0,0,12,222,255,123,97,0,0,0,12,230,255,123,129,0,0,0,12,238,255,123,161,0,0,0,12,246,255,123,194,0,0,0,12,255,255,123,226,0,0,0,16,0,255,131,0,0,0,0,16,8,255,131,32,0,0,0,16,16,255,131,64,0,0,0,16,24,255,131,97,0,0,0,16,32,255,131,129,0,0,0,16,41,255,131,161,0,0,0,16,49,255,131,194,0,0,0,16,57,255,131,226,0,0,0,16,65,255,139,0,0,0,0,16,74,255,139,32,0,0,0,16,82,255,139,64,0,0,0,16,90,255,139,97,0,0,0,16,98,255,139,129,0,0,0,16,106,255,139,161,0,0,0,16,115,255,139,194,0,0,0,16,123,255,139,226,0,0,0,16,131,255,148,0,0,0,0,16,139,255,148,32,0,0,0,16,148,255,148,64,0,0,0,16,156,255,148,97,0,0,0,16,164,255,148,129,0,0,0,16,172,255,148,161,0,0,0,16,180,255,148,194,0,0,0,16,189,255,148,226,0,0,0,16,197,255,156,0,0,0,0,16,205,255,156,32,0,0,0,16,213,255,156,64,0,0,0,16,222,255,156,97,0,0,0,16,230,255,156,129,0,0,0,16,238,255,156,161,0,0,0,16,246,255,156,194,0,0,0,16,255,255,156,226,0,0,0,20,0,255,164,0,0,0,0,20,8,255,164,32,0,0,0,20,16,255,164,64,0,0,0,20,24,255,164,97,0,0,0,20,32,255,164,129,0,0,0,20,41,255,164,161,0,0,0,20,49,255,164,194,0,0,0,20,57,255,164,226,0,0,0,20,65,255,172,0,0,0,0,20,74,255,172,32,0,0,0,20,82,255,172,64,0,0,0,20,90,255,172,97,0,0,0,20,98,255,172,129,0,0,0,20,106,255,172,161,0,0,0,20,115,255,172,194,0,0,0,20,123,255,172,226,0,0,0,20,131,255,180,0,0,0,0,20,139,255,180,32,0,0,0,20,148,255,180,64,0,0,0,20,156,255,180,97,0,0,0,20,164,255,180,129,0,0,0,20,172,255,180,161,0,0,0,20,180,255,180,194,0,0,0,20,189,255,180,226,0,0,0,20,197,255,189,0,0,0,0,20,205,255,189,32,0,0,0,20,213,255,189,64,0,0,0,20,222,255,189,97,0,0,0,20,230,255,189,129,0,0,0,20,238,255,189,161,0,0,0,20,246,255,189,194,0,0,0,20,255,255,189,226,0,0,0,24,0,255,197,0,0,0,0,24,8,255,197,32,0,0,0,24,16,255,197,64,0,0,0,24,24,255,197,97,0,0,0,24,32,255,197,129,0,0,0,24,41,255,197,161,0,0,0,24,49,255,197,194,0,0,0,24,57,255,197,226,0,0,0,24,65,255,205,0,0,0,0,24,74,255,205,32,0,0,0,24,82,255,205,64,0,0,0,24,90,255,205,97,0,0,0,24,98,255,205,129,0,0,0,24,106,255,205,161,0,0,0,24,115,255,205,194,0,0,0,24,123,255,205,226,0,0,0,24,131,255,213,0,0,0,0,24,139,255,213,32,0,0,0,24,148,255,213,64,0,0,0,24,156,255,213,97,0,0,0,24,164,255,213,129,0,0,0,24,172,255,213,161,0,0,0,24,180,255,213,194,0,0,0,24,189,255,213,226,0,0,0,24,197,255,222,0,0,0,0,24,205,255,222,32,0,0,0,24,213,255,222,64,0,0,0,24,222,255,222,97,0,0,0,24,230,255,222,129,0,0,0,24,238,255,222,161,0,0,0,24,246,255,222,194,0,0,0,24,255,255,222,226,0,0,0,28,0,255,230,0,0,0,0,28,8,255,230,32,0,0,0,28,16,255,230,64,0,0,0,28,24,255,230,97,0,0,0,28,32,255,230,129,0,0,0,28,41,255,230,161,0,0,0,28,49,255,230,194,0,0,0,28,57,255,230,226,0,0,0,28,65,255,238,0,0,0,0,28,74,255,238,32,0,0,0,28,82,255,238,64,0,0,0,28,90,255,238,97,0,0,0,28,98,255,238,129,0,0,0,28,106,255,238,161,0,0,0,28,115,255,238,194,0,0,0,28,123,255,238,226,0,0,0,28,131,255,246,0,0,0,0,28,139,255,246,32,0,0,0,28,148,255,246,64,0,0,0,28,156,255,246,97,0,0,0,28,164,255,246,129,0,0,0,28,172,255,246,161,0,0,0,28,180,255,246,194,0,0,0,28,189,255,246,226,0,0,0,28,197,255,255,0,0,0,0,28,205,255,255,32,0,0,0,28,213,255,255,64,0,0,0,28,222,255,255,97,0,0,0,28,230,255,255,129,0,0,0,28,238,255,255,161,0,0,0,28,246,255,255,194,0,0,0,28,255,255,255,226,0,0,0,0,0,0,0,0,0,255,8,0,0,0,0,32,0,255,16,0,0,0,0,64,0,255,24,0,0,0,0,97,0,255,32,0,0,0,0,129,0,255,41,0,0,0,0,161,0,255,49,0,0,0,0,194,0,255,57,0,0,0,0,226,0,255,65,0,0,0,0,0,8,255,74,0,0,0,0,32,8,255,82,0,0,0,0,64,8,255,90,0,0,0,0,97,8,255,98,0,0,0,0,129,8,255,106,0,0,0,0,161,8,255,115,0,0,0,0,194,8,255,123,0,0,0,0,226,8,255,131,0,0,0,0,0,16,255,139,0,0,0,0,32,16,255,148,0,0,0,0,64,16,255,156,0,0,0,0,97,16,255,164,0,0,0,0,129,16,255,172,0,0,0,0,161,16,255,180,0,0,0,0,194,16,255,189,0,0,0,0,226,16,255,197,0,0,0,0,0,24,255,205,0,0,0,0,32,24,255,213,0,0,0,0,64,24,255,222,0,0,0,0,97,24,255,230,0,0,0,0,129,24,255,238,0,0,0,0,161,24,255,246,0,0,0,0,194,24,255,255,0,0,0,0,226,24,255,0,4,0,0,0,0,32,255,8,4,0,0,0,32,32,255,16,4,0,0,0,64,32,255,24,4,0,0,0,97,32,255,32,4,0,0,0,129,32,255,41,4,0,0,0,161,32,255,49,4,0,0,0,194,32,255,57,4,0,0,0,226,32,255,65,4,0,0,0,0,41,255,74,4,0,0,0,32,41,255,82,4,0,0,0,64,41,255,90,4,0,0,0,97,41,255,98,4,0,0,0,129,41,255,106,4,0,0,0,161,41,255,115,4,0,0,0,194,41,255,123,4,0,0,0,226,41,255,131,4,0,0,0,0,49,255,139,4,0,0,0,32,49,255,148,4,0,0,0,64,49,255,156,4,0,0,0,97,49,255,164,4,0,0,0,129,49,255,172,4,0,0,0,161,49,255,180,4,0,0,0,194,49,255,189,4,0,0,0,226,49,255,197,4,0,0,0,0,57,255,205,4,0,0,0,32,57,255,213,4,0,0,0,64,57,255,222,4,0,0,0,97,57,255,230,4,0,0,0,129,57,255,238,4,0,0,0,161,57,255,246,4,0,0,0,194,57,255,255,4,0,0,0,226,57,255,0,8,0,0,0,0,65,255,8,8,0,0,0,32,65,255,16,8,0,0,0,64,65,255,24,8,0,0,0,97,65,255,32,8,0,0,0,129,65,255,41,8,0,0,0,161,65,255,49,8,0,0,0,194,65,255,57,8,0,0,0,226,65,255,65,8,0,0,0,0,74,255,74,8,0,0,0,32,74,255,82,8,0,0,0,64,74,255,90,8,0,0,0,97,74,255,98,8,0,0,0,129,74,255,106,8,0,0,0,161,74,255,115,8,0,0,0,194,74,255,123,8,0,0,0,226,74,255,131,8,0,0,0,0,82,255,139,8,0,0,0,32,82,255,148,8,0,0,0,64,82,255,156,8,0,0,0,97,82,255,164,8,0,0,0,129,82,255,172,8,0,0,0,161,82,255,180,8,0,0,0,194,82,255,189,8,0,0,0,226,82,255,197,8,0,0,0,0,90,255,205,8,0,0,0,32,90,255,213,8,0,0,0,64,90,255,222,8,0,0,0,97,90,255,230,8,0,0,0,129,90,255,238,8,0,0,0,161,90,255,246,8,0,0,0,194,90,255,255,8,0,0,0,226,90,255,0,12,0,0,0,0,98,255,8,12,0,0,0,32,98,255,16,12,0,0,0,64,98,255,24,12,0,0,0,97,98,255,32,12,0,0,0,129,98,255,41,12,0,0,0,161,98,255,49,12,0,0,0,194,98,255,57,12,0,0,0,226,98,255,65,12,0,0,0,0,106,255,74,12,0,0,0,32,106,255,82,12,0,0,0,64,106,255,90,12,0,0,0,97,106,255,98,12,0,0,0,129,106,255,106,12,0,0,0,161,106,255,115,12,0,0,0,194,106,255,123,12,0,0,0,226,106,255,131,12,0,0,0,0,115,255,139,12,0,0,0,32,115,255,148,12,0,0,0,64,115,255,156,12,0,0,0,97,115,255,164,12,0,0,0,129,115,255,172,12,0,0,0,161,115,255,180,12,0,0,0,194,115,255,189,12,0,0,0,226,115,255,197,12,0,0,0,0,123,255,205,12,0,0,0,32,123,255,213,12,0,0,0,64,123,255,222,12,0,0,0,97,123,255,230,12,0,0,0,129,123,255,238,12,0,0,0,161,123,255,246,12,0,0,0,194,123,255,255,12,0,0,0,226,123,255,0,16,0,0,0,0,131,255,8,16,0,0,0,32,131,255,16,16,0,0,0,64,131,255,24,16,0,0,0,97,131,255,32,16,0,0,0,129,131,255,41,16,0,0,0,161,131,255,49,16,0,0,0,194,131,255,57,16,0,0,0,226,131,255,65,16,0,0,0,0,139,255,74,16,0,0,0,32,139,255,82,16,0,0,0,64,139,255,90,16,0,0,0,97,139,255,98,16,0,0,0,129,139,255,106,16,0,0,0,161,139,255,115,16,0,0,0,194,139,255,123,16,0,0,0,226,139,255,131,16,0,0,0,0,148,255,139,16,0,0,0,32,148,255,148,16,0,0,0,64,148,255,156,16,0,0,0,97,148,255,164,16,0,0,0,129,148,255,172,16,0,0,0,161,148,255,180,16,0,0,0,194,148,255,189,16,0,0,0,226,148,255,197,16,0,0,0,0,156,255,205,16,0,0,0,32,156,255,213,16,0,0,0,64,156,255,222,16,0,0,0,97,156,255,230,16,0,0,0,129,156,255,238,16,0,0,0,161,156,255,246,16,0,0,0,194,156,255,255,16,0,0,0,226,156,255,0,20,0,0,0,0,164,255,8,20,0,0,0,32,164,255,16,20,0,0,0,64,164,255,24,20,0,0,0,97,164,255,32,20,0,0,0,129,164,255,41,20,0,0,0,161,164,255,49,20,0,0,0,194,164,255,57,20,0,0,0,226,164,255,65,20,0,0,0,0,172,255,74,20,0,0,0,32,172,255,82,20,0,0,0,64,172,255,90,20,0,0,0,97,172,255,98,20,0,0,0,129,172,255,106,20,0,0,0,161,172,255,115,20,0,0,0,194,172,255,123,20,0,0,0,226,172,255,131,20,0,0,0,0,180,255,139,20,0,0,0,32,180,255,148,20,0,0,0,64,180,255,156,20,0,0,0,97,180,255,164,20,0,0,0,129,180,255,172,20,0,0,0,161,180,255,180,20,0,0,0,194,180,255,189,20,0,0,0,226,180,255,197,20,0,0,0,0,189,255,205,20,0,0,0,32,189,255,213,20,0,0,0,64,189,255,222,20,0,0,0,97,189,255,230,20,0,0,0,129,189,255,238,20,0,0,0,161,189,255,246,20,0,0,0,194,189,255,255,20,0,0,0,226,189,255,0,24,0,0,0,0,197,255,8,24,0,0,0,32,197,255,16,24,0,0,0,64,197,255,24,24,0,0,0,97,197,255,32,24,0,0,0,129,197,255,41,24,0,0,0,161,197,255,49,24,0,0,0,194,197,255,57,24,0,0,0,226,197,255,65,24,0,0,0,0,205,255,74,24,0,0,0,32,205,255,82,24,0,0,0,64,205,255,90,24,0,0,0,97,205,255,98,24,0,0,0,129,205,255,106,24,0,0,0,161,205,255,115,24,0,0,0,194,205,255,123,24,0,0,0,226,205,255,131,24,0,0,0,0,213,255,139,24,0,0,0,32,213,255,148,24,0,0,0,64,213,255,156,24,0,0,0,97,213,255,164,24,0,0,0,129,213,255,172,24,0,0,0,161,213,255,180,24,0,0,0,194,213,255,189,24,0,0,0,226,213,255,197,24,0,0,0,0,222,255,205,24,0,0,0,32,222,255,213,24,0,0,0,64,222,255,222,24,0,0,0,97,222,255,230,24,0,0,0,129,222,255,238,24,0,0,0,161,222,255,246,24,0,0,0,194,222,255,255,24,0,0,0,226,222,255,0,28,0,0,0,0,230,255,8,28,0,0,0,32,230,255,16,28,0,0,0,64,230,255,24,28,0,0,0,97,230,255,32,28,0,0,0,129,230,255,41,28,0,0,0,161,230,255,49,28,0,0,0,194,230,255,57,28,0,0,0,226,230,255,65,28,0,0,0,0,238,255,74,28,0,0,0,32,238,255,82,28,0,0,0,64,238,255,90,28,0,0,0,97,238,255,98,28,0,0,0,129,238,255,106,28], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+21409);
/* memory initializer */ allocate([161,238,255,115,28,0,0,0,194,238,255,123,28,0,0,0,226,238,255,131,28,0,0,0,0,246,255,139,28,0,0,0,32,246,255,148,28,0,0,0,64,246,255,156,28,0,0,0,97,246,255,164,28,0,0,0,129,246,255,172,28,0,0,0,161,246,255,180,28,0,0,0,194,246,255,189,28,0,0,0,226,246,255,197,28,0,0,0,0,255,255,205,28,0,0,0,32,255,255,213,28,0,0,0,64,255,255,222,28,0,0,0,97,255,255,230,28,0,0,0,129,255,255,238,28,0,0,0,161,255,255,246,28,0,0,0,194,255,255,255,28,0,0,0,226,255,255,48,139,0,0,255,255,255,255,51,1,0,0,11,31,1,0,48,139,0,0,255,255,255,255,117,1,0,0,62,32,1,0,48,139,0,0,255,255,255,255,87,1,0,0,179,33,1,0,48,139,0,0,255,255,255,255,251,0,0,0,10,35,1,0,48,139,0,0,255,255,255,255,121,0,0,0,5,36,1,0,49,139,0,0,255,255,255,255,51,2,0,0,126,36,1,0,48,139,0,0,255,255,255,255,151,2,0,0,177,38,1,0,48,139,0,0,255,255,255,255,58,2,0,0,72,41,1,0,48,139,0,0,255,255,255,255,58,2,0,0,130,43,1,0,0,0,0,0,18,46,1,0,26,46,1,0,32,46,1,0,37,46,1,0,42,46,1,0,48,46,1,0,2,0,0,0,0,0,0,0,24,11,0,0,16,2,0,0,17,2,0,0,76,0,0,0,0,0,0,0,0,0,0,0,40,11,0,0,18,2,0,0,19,2,0,0,59,0,0,0,0,0,0,0,48,11,0,0,20,2,0,0,21,2,0,0,77,0,0,0,0,0,0,0,64,11,0,0,20,2,0,0,22,2,0,0,77,0,0,0,0,0,0,0,88,11,0,0,23,2,0,0,24,2,0,0,78,0,0,0,0,0,0,0,120,11,0,0,25,2,0,0,26,2,0,0,27,2,0,0,28,2,0,0,5,0,0,0,2,0,0,0,1,0,0,0,6,0,0,0,0,0,0,0,168,11,0,0,25,2,0,0,29,2,0,0,27,2,0,0,28,2,0,0,5,0,0,0,3,0,0,0,2,0,0,0,7,0,0,0,0,0,0,0,184,11,0,0,25,2,0,0,30,2,0,0,27,2,0,0,28,2,0,0,5,0,0,0,4,0,0,0,3,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,192,3,0,0,192,4,0,0,192,5,0,0,192,6,0,0,192,7,0,0,192,8,0,0,192,9,0,0,192,10,0,0,192,11,0,0,192,12,0,0,192,13,0,0,192,14,0,0,192,15,0,0,192,16,0,0,192,17,0,0,192,18,0,0,192,19,0,0,192,20,0,0,192,21,0,0,192,22,0,0,192,23,0,0,192,24,0,0,192,25,0,0,192,26,0,0,192,27,0,0,192,28,0,0,192,29,0,0,192,30,0,0,192,31,0,0,192,0,0,0,179,1,0,0,195,2,0,0,195,3,0,0,195,4,0,0,195,5,0,0,195,6,0,0,195,7,0,0,195,8,0,0,195,9,0,0,195,10,0,0,195,11,0,0,195,12,0,0,195,13,0,0,211,14,0,0,195,15,0,0,195,0,0,12,187,1,0,12,195,2,0,12,195,3,0,12,195,4,0,12,211,132,127,0,0,244,127,0,0,100,128,0,0,100,128,0,0,144,171,0,0,212,136,0,0,212,130,0,0,0,0,0,0,10,0,0,0,100,0,0,0,232,3,0,0,16,39,0,0,160,134,1,0,64,66,15,0,128,150,152,0,0,225,245,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,79,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,8,0,0,0,8,78,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,79,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,8,0,0,0,0,74,1,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,79,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,8,0,0,0,248,69,1,0,0,4,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,18,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,29,0,0,0,30,0,0,0,31,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,39,0,0,0,40,0,0,0,41,0,0,0,42,0,0,0,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,47,0,0,0,48,0,0,0,49,0,0,0,50,0,0,0,51,0,0,0,52,0,0,0,53,0,0,0,54,0,0,0,55,0,0,0,56,0,0,0,57,0,0,0,58,0,0,0,59,0,0,0,60,0,0,0,61,0,0,0,62,0,0,0,63,0,0,0,64,0,0,0,65,0,0,0,66,0,0,0,67,0,0,0,68,0,0,0,69,0,0,0,70,0,0,0,71,0,0,0,72,0,0,0,73,0,0,0,74,0,0,0,75,0,0,0,76,0,0,0,77,0,0,0,78,0,0,0,79,0,0,0,80,0,0,0,81,0,0,0,82,0,0,0,83,0,0,0,84,0,0,0,85,0,0,0,86,0,0,0,87,0,0,0,88,0,0,0,89,0,0,0,90,0,0,0,91,0,0,0,92,0,0,0,93,0,0,0,94,0,0,0,95,0,0,0,96,0,0,0,65,0,0,0,66,0,0,0,67,0,0,0,68,0,0,0,69,0,0,0,70,0,0,0,71,0,0,0,72,0,0,0,73,0,0,0,74,0,0,0,75,0,0,0,76,0,0,0,77,0,0,0,78,0,0,0,79,0,0,0,80,0,0,0,81,0,0,0,82,0,0,0,83,0,0,0,84,0,0,0,85,0,0,0,86,0,0,0,87,0,0,0,88,0,0,0,89,0,0,0,90,0,0,0,123,0,0,0,124,0,0,0,125,0,0,0,126,0,0,0,127], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+31649);
/* memory initializer */ allocate([1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,18,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,29,0,0,0,30,0,0,0,31,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,39,0,0,0,40,0,0,0,41,0,0,0,42,0,0,0,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,47,0,0,0,48,0,0,0,49,0,0,0,50,0,0,0,51,0,0,0,52,0,0,0,53,0,0,0,54,0,0,0,55,0,0,0,56,0,0,0,57,0,0,0,58,0,0,0,59,0,0,0,60,0,0,0,61,0,0,0,62,0,0,0,63,0,0,0,64,0,0,0,97,0,0,0,98,0,0,0,99,0,0,0,100,0,0,0,101,0,0,0,102,0,0,0,103,0,0,0,104,0,0,0,105,0,0,0,106,0,0,0,107,0,0,0,108,0,0,0,109,0,0,0,110,0,0,0,111,0,0,0,112,0,0,0,113,0,0,0,114,0,0,0,115,0,0,0,116,0,0,0,117,0,0,0,118,0,0,0,119,0,0,0,120,0,0,0,121,0,0,0,122,0,0,0,91,0,0,0,92,0,0,0,93,0,0,0,94,0,0,0,95,0,0,0,96,0,0,0,97,0,0,0,98,0,0,0,99,0,0,0,100,0,0,0,101,0,0,0,102,0,0,0,103,0,0,0,104,0,0,0,105,0,0,0,106,0,0,0,107,0,0,0,108,0,0,0,109,0,0,0,110,0,0,0,111,0,0,0,112,0,0,0,113,0,0,0,114,0,0,0,115,0,0,0,116,0,0,0,117,0,0,0,118,0,0,0,119,0,0,0,120,0,0,0,121,0,0,0,122,0,0,0,123,0,0,0,124,0,0,0,125,0,0,0,126,0,0,0,127], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+35024);
/* memory initializer */ allocate([200,11,0,0,31,2,0,0,32,2,0,0,87,0,0,0,11,0,0,0,5,0,0,0,9,0,0,0,80,0,0,0,81,0,0,0,12,0,0,0,82,0,0,0,83,0,0,0,33,0,0,0,13,0,0,0,34,0,0,0,0,0,0,0,216,11,0,0,31,2,0,0,33,2,0,0,88,0,0,0,11,0,0,0,5,0,0,0,9,0,0,0,84,0,0,0,81,0,0,0,12,0,0,0,85,0,0,0,86,0,0,0,35,0,0,0,14,0,0,0,36,0,0,0,0,0,0,0,232,11,0,0,34,2,0,0,35,2,0,0,89,0,0,0,1,0,0,0,6,0,0,0,10,0,0,0,87,0,0,0,20,0,0,0,2,0,0,0,88,0,0,0,22,0,0,0,37,0,0,0,15,0,0,0,38,0,0,0,0,0,0,0,248,11,0,0,34,2,0,0,36,2,0,0,90,0,0,0,1,0,0,0,6,0,0,0,10,0,0,0,19,0,0,0,20,0,0,0,2,0,0,0,89,0,0,0,90,0,0,0,39,0,0,0,3,0,0,0,40,0,0,0,0,0,0,0,8,12,0,0,37,2,0,0,38,2,0,0,1,0,0,0,0,0,0,0,16,12,0,0,37,2,0,0,39,2,0,0,1,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,40,12,0,0,40,2,0,0,41,2,0,0,91,0,0,0,0,0,0,0,2,0,0,0,3,0,0,0,5,0,0,0,7,0,0,0,11,0,0,0,13,0,0,0,17,0,0,0,19,0,0,0,23,0,0,0,29,0,0,0,31,0,0,0,37,0,0,0,41,0,0,0,43,0,0,0,47,0,0,0,53,0,0,0,59,0,0,0,61,0,0,0,67,0,0,0,71,0,0,0,73,0,0,0,79,0,0,0,83,0,0,0,89,0,0,0,97,0,0,0,101,0,0,0,103,0,0,0,107,0,0,0,109,0,0,0,113,0,0,0,127,0,0,0,131,0,0,0,137,0,0,0,139,0,0,0,149,0,0,0,151,0,0,0,157,0,0,0,163,0,0,0,167,0,0,0,173,0,0,0,179,0,0,0,181,0,0,0,191,0,0,0,193,0,0,0,197,0,0,0,199,0,0,0,211,0,0,0,1,0,0,0,11,0,0,0,13,0,0,0,17,0,0,0,19,0,0,0,23,0,0,0,29,0,0,0,31,0,0,0,37,0,0,0,41,0,0,0,43,0,0,0,47,0,0,0,53,0,0,0,59,0,0,0,61,0,0,0,67,0,0,0,71,0,0,0,73,0,0,0,79,0,0,0,83,0,0,0,89,0,0,0,97,0,0,0,101,0,0,0,103,0,0,0,107,0,0,0,109,0,0,0,113,0,0,0,121,0,0,0,127,0,0,0,131,0,0,0,137,0,0,0,139,0,0,0,143,0,0,0,149,0,0,0,151,0,0,0,157,0,0,0,163,0,0,0,167,0,0,0,169,0,0,0,173,0,0,0,179,0,0,0,181,0,0,0,187,0,0,0,191,0,0,0,193,0,0,0,197,0,0,0,199,0,0,0,209,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,12,0,0,42,2,0,0,43,2,0,0,0,0,0,0,112,12,0,0,34,2,0,0,44,2,0,0,29,0,0,0,1,0,0,0,6,0,0,0,10,0,0,0,19,0,0,0,20,0,0,0,2,0,0,0,88,0,0,0,22,0,0,0,37,0,0,0,3,0,0,0,40,0,0,0,0,0,0,0,120,12,0,0,31,2,0,0,45,2,0,0,91,0,0,0,11,0,0,0,5,0,0,0,9,0,0,0,84,0,0,0,81,0,0,0,12,0,0,0,82,0,0,0,83,0,0,0,33,0,0,0,14,0,0,0,36,0,0,0,8,0,0,0,0,0,0,0,128,12,0,0,128,0,0,0,129,0,0,0,248,255,255,255,248,255,255,255,128,12,0,0,130,0,0,0,131,0,0,0,8,0,0,0,0,0,0,0,152,12,0,0,46,2,0,0,47,2,0,0,248,255,255,255,248,255,255,255,152,12,0,0,48,2,0,0,49,2,0,0,4,0,0,0,0,0,0,0,176,12,0,0,132,0,0,0,133,0,0,0,252,255,255,255,252,255,255,255,176,12,0,0,134,0,0,0,135,0,0,0,4,0,0,0,0,0,0,0,200,12,0,0,50,2,0,0,51,2,0,0,252,255,255,255,252,255,255,255,200,12,0,0,52,2,0,0,53,2,0,0,0,0,0,0,56,12,0,0,54,2,0,0,55,2,0,0,77,0,0,0,0,0,0,0,72,12,0,0,56,2,0,0,57,2,0,0,0,0,0,0,0,13,0,0,58,2,0,0,59,2,0,0,92,0,0,0,6,0,0,0,16,0,0,0,17,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,248,13,0,0,60,2,0,0,61,2,0,0,62,2,0,0,1,0,0,0,11,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,14,0,0,63,2,0,0,64,2,0,0,62,2,0,0,2,0,0,0,12,0,0,0,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,14,0,0,65,2,0,0,66,2,0,0,62,2,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,14,0,0,67,2,0,0,68,2,0,0,62,2,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,18,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,14,0,0,69,2,0,0,70,2,0,0,62,2,0,0,3,0,0,0,4,0,0,0,23,0,0,0,5,0,0,0,24,0,0,0,1,0,0,0,2,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,14,0,0,71,2,0,0,72,2,0,0,62,2,0,0,7,0,0,0,8,0,0,0,25,0,0,0,9,0,0,0,26,0,0,0,3,0,0,0,4,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,14,0,0,73,2,0,0,74,2,0,0,62,2,0,0,93,0,0,0,27,0,0,0,28,0,0,0,29,0,0,0,30,0,0,0,31,0,0,0,1,0,0,0,248,255,255,255,216,14,0,0,94,0,0,0,95,0,0,0,96,0,0,0,97,0,0,0,98,0,0,0,99,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,75,2,0,0,76,2,0,0,62,2,0,0,101,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,2,0,0,0,248,255,255,255,0,15,0,0,102,0,0,0,103,0,0,0,104,0,0,0,105,0,0,0,106,0,0,0,107,0,0,0,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,15,0,0,77,2,0,0,78,2,0,0,62,2,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,15,0,0,79,2,0,0,80,2,0,0,62,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,15,0,0,81,2,0,0,82,2,0,0,62,2,0,0,109,0,0,0,110,0,0,0,92,0,0,0,93,0,0,0,94,0,0,0,95,0,0,0,111,0,0,0,96,0,0,0,97,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,15,0,0,83,2,0,0,84,2,0,0,62,2,0,0,112,0,0,0,113,0,0,0,98,0,0,0,99,0,0,0,100,0,0,0,101,0,0,0,114,0,0,0,102,0,0,0,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,15,0,0,85,2,0,0,86,2,0,0,62,2,0,0,115,0,0,0,116,0,0,0,104,0,0,0,105,0,0,0,106,0,0,0,107,0,0,0,117,0,0,0,108,0,0,0,109,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,15,0,0,87,2,0,0,88,2,0,0,62,2,0,0,118,0,0,0,119,0,0,0,110,0,0,0,111,0,0,0,112,0,0,0,113,0,0,0,120,0,0,0,114,0,0,0,115,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,15,0,0,89,2,0,0,90,2,0,0,62,2,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,16,0,0,91,2,0,0,92,2,0,0,62,2,0,0,5,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,16,0,0,93,2,0,0,94,2,0,0,62,2,0,0,1,0,0,0,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,16,0,0,95,2,0,0,96,2,0,0,62,2,0,0,2,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,16,0,0,97,2,0,0,98,2,0,0,62,2,0,0,20,0,0,0,7,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,16,0,0,99,2,0,0,100,2,0,0,62,2,0,0,21,0,0,0,8,0,0,0,117,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,13,0,0,101,2,0,0,102,2,0,0,62,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,14,0,0,103,2,0,0,104,2,0,0,62,2,0,0,41,0,0,0,22,0,0,0,42,0,0,0,23,0,0,0,43,0,0,0,1,0,0,0,24,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,13,0,0,105,2,0,0,106,2,0,0,62,2,0,0,3,0,0,0,4,0,0,0,12,0,0,0,121,0,0,0,122,0,0,0,13,0,0,0,123,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,14,0,0,107,2,0,0,108,2,0,0,62,2,0,0,124,0,0,0,125,0,0,0,118,0,0,0,119,0,0,0,120,0,0,0,0,0,0,0,72,14,0,0,109,2,0,0,110,2,0,0,62,2,0,0,126,0,0,0,127,0,0,0,121,0,0,0,122,0,0,0,123,0,0,0,0,0,0,0,24,13,0,0,111,2,0,0,112,2,0,0,62,2,0,0,0,0,0,0,40,13,0,0,111,2,0,0,113,2,0,0,62,2,0,0,25,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,44,0,0,0,26,0,0,0,45,0,0,0,27,0,0,0,46,0,0,0,5,0,0,0,28,0,0,0,14,0,0,0,0,0,0,0,72,13,0,0,111,2,0,0,114,2,0,0,62,2,0,0,5,0,0,0,6,0,0,0,15,0,0,0,128,0,0,0,129,0,0,0,16,0,0,0,130,0,0,0,0,0,0,0,104,13,0,0,111,2,0,0,115,2,0,0,62,2,0,0,7,0,0,0,8,0,0,0,17,0,0,0,131,0,0,0,132,0,0,0,18,0,0,0,133,0,0,0,0,0,0,0,136,13,0,0,111,2,0,0,116,2,0,0,62,2,0,0,9,0,0,0,10,0,0,0,19,0,0,0,134,0,0,0,135,0,0,0,20,0,0,0,136,0,0,0,0,0,0,0,168,13,0,0,111,2,0,0,117,2,0,0,62,2,0,0,9,0,0,0,10,0,0,0,19,0,0,0,134,0,0,0,135,0,0,0,20,0,0,0,136,0,0,0,0,0,0,0,184,13,0,0,111,2,0,0,118,2,0,0,62,2,0,0,9,0,0,0,10,0,0,0,19,0,0,0,134,0,0,0,135,0,0,0,20,0,0,0,136,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,20,0,0,119,2,0,0,120,2,0,0,77,0,0,0,0,0,0,0,48,20,0,0,58,2,0,0,121,2,0,0,137,0,0,0,6,0,0,0,16,0,0,0,17,0,0,0,8,0,0,0,0,0,0,0,64,20,0,0,58,2,0,0,122,2,0,0,138,0,0,0,9,0,0,0,16,0,0,0,17,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,8,0,8,128,16,128,16,144,16,0,16,16,32,128,32,144,32,129,32,145,8,128,8,0,16,128,16,144,16,0,16,16,32,128,32,144,32,129,32,145,16,128,16,144,16,0,16,16,32,128,32,144,32,129,32,145,8,0,8,128,16,144,16,128,16,16,16,0,32,144,32,128,32,145,32,129,8,0,8,128,16,0,16,16,16,128,16,144,32,128,32,144,32,129,32,145,8,0,8,128,16,16,16,0,16,144,16,128,32,144,32,128,32,145,32,129,8,0,8,128,32,128,32,144,32,129,32,145,16,128,16,144,16,0,16,16,8,0,8,128,32,144,32,128,32,145,32,129,16,144,16,128,16,16,16,0,8,0,8,128,32,129,32,145,32,128,32,144,16,128,16,144,16,0,16,16,8,0,8,128,32,145,32,129,32,144,32,128,16,144,16,128,16,16,16,0,8,0,8,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,3,32,2,32,2,32,2,32,2,32,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,1,96,4,192,4,192,4,192,4,192,4,192,4,192,4,192,4,192,4,192,4,192,4,192,4,192,4,192,4,192,4,192,8,216,8,216,8,216,8,216,8,216,8,216,8,216,8,216,8,216,8,216,4,192,4,192,4,192,4,192,4,192,4,192,4,192,8,213,8,213,8,213,8,213,8,213,8,213,8,197,8,197,8,197,8,197,8,197,8,197,8,197,8,197,8,197,8,197,8,197,8,197,8,197,8,197,8,197,8,197,8,197,8,197,8,197,8,197,4,192,4,192,4,192,4,192,4,192,4,192,8,214,8,214,8,214,8,214,8,214,8,214,8,198,8,198,8,198,8,198,8,198,8,198,8,198,8,198,8,198,8,198,8,198,8,198,8,198,8,198,8,198,8,198,8,198,8,198,8,198,8,198,4,192,4,192,4,192,4,192,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,97,108,101,114,116,40,34,85,110,97,98,108,101,32,116,111,32,105,110,105,116,105,97,108,105,122,101,32,87,101,98,71,76,46,34,41,0,0,54,66,117,108,108,101,116,0,49,48,67,111,108,108,105,100,97,98,108,101,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,54,66,117,108,108,101,116,54,86,105,115,117,97,108,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,78,54,66,117,108,108,101,116,54,86,105,115,117,97,108,69,0,68,58,92,95,103,97,109,101,57,52,92,115,114,99,92,103,97,109,101,92,103,97,109,101,92,67,111,108,108,105,100,97,98,108,101,46,99,112,112,0,98,111,117,110,100,105,110,103,66,111,120,0,53,69,110,101,109,121,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,53,69,110,101,109,121,54,86,105,115,117,97,108,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,78,53,69,110,101,109,121,54,86,105,115,117,97,108,69,0,57,69,120,112,108,111,115,105,111,110,0,109,86,101,114,116,101,120,70,111,114,109,97,116,46,115,116,114,105,100,101,40,41,32,61,61,32,115,105,122,101,111,102,40,86,101,114,116,101,120,41,0,68,58,92,95,103,97,109,101,57,52,92,115,114,99,92,103,97,109,101,92,103,97,109,101,92,69,120,112,108,111,115,105,111,110,46,99,112,112,0,69,120,112,108,111,115,105,111,110,0,109,86,101,114,116,101,120,70,111,114,109,97,116,46,112,111,115,105,116,105,111,110,79,102,102,115,101,116,40,41,32,61,61,32,111,102,102,115,101,116,111,102,40,86,101,114,116,101,120,44,32,112,111,115,105,116,105,111,110,41,0,109,86,101,114,116,101,120,70,111,114,109,97,116,46,116,101,120,67,111,111,114,100,48,79,102,102,115,101,116,40,41,32,61,61,32,111,102,102,115,101,116,111,102,40,86,101,114,116,101,120,44,32,116,101,120,67,111,111,114,100,41,0,83,51,49,45,85,110,101,120,112,101,99,116,101,100,32,84,114,111,117,98,108,101,46,111,103,103,0,90,78,57,71,97,109,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,51,36,95,48,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,78,57,71,97,109,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,51,36,95,48,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,55,95,69,69,70,118,118,69,69,69,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,98,97,115,101,73,70,118,118,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,51,72,117,100,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,53,76,101,118,101,108,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,57,71,97,109,101,83,99,101,110,101,0,51,72,117,100,0,104,101,97,114,116,46,112,110,103,0,101,110,101,109,105,101,115,95,108,101,102,116,46,112,110,103,0,48,46,112,110,103,0,49,46,112,110,103,0,50,46,112,110,103,0,51,46,112,110,103,0,52,46,112,110,103,0,53,46,112,110,103,0,54,46,112,110,103,0,55,46,112,110,103,0,56,46,112,110,103,0,57,46,112,110,103,0,112,97,117,115,101,95,110,111,114,109,97,108,46,112,110,103,0,112,97,117,115,101,95,112,114,101,115,115,101,100,46,112,110,103,0,90,78,51,72,117,100,67,49,69,82,75,78,83,116,51,95,95,49,49,48,115,104,97,114,101,100,95,112,116,114,73,53,76,101,118,101,108,69,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,51,36,95,48,0,90,90,78,51,72,117,100,67,49,69,82,75,78,83,116,51,95,95,49,49,48,115,104,97,114,101,100,95,112,116,114,73,53,76,101,118,101,108,69,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,95,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,90,78,51,72,117,100,67,49,69,82,75,78,83,95,49,48,115,104,97,114,101,100,95,112,116,114,73,53,76,101,118,101,108,69,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,95,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,68,95,69,69,70,118,118,69,69,69,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,78,51,72,117,100,67,49,69,82,75,78,83,95,49,48,115,104,97,114,101,100,95,112,116,114,73,53,76,101,118,101,108,69,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,51,36,95,48,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,67,95,69,69,70,118,118,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,49,48,80,97,117,115,101,83,99,101,110,101,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,54,66,117,116,116,111,110,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,49,49,79,114,116,104,111,67,97,109,101,114,97,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,49,55,73,110,118,105,115,105,98,108,101,79,98,115,116,97,99,108,101,0,109,77,105,110,46,120,32,60,61,32,109,77,97,120,46,120,0,68,58,92,95,103,97,109,101,57,52,92,115,114,99,92,103,97,109,101,92,103,97,109,101,92,73,110,118,105,115,105,98,108,101,79,98,115,116,97,99,108,101,46,99,112,112,0,73,110,118,105,115,105,98,108,101,79,98,115,116,97,99,108,101,0,109,77,105,110,46,121,32,60,61,32,109,77,97,120,46,121,0,53,76,101,118,101,108,0,98,97,115,101,116,101,120,116,117,114,101,46,106,112,103,0,116,101,120,116,117,114,101,95,112,97,110,122,101,114,119,97,103,101,110,46,106,112,103,0,99,114,97,116,101,95,109,101,100,107,105,116,46,106,112,103,0,119,97,108,108,45,100,105,102,102,117,115,101,46,106,112,103,0,119,97,108,108,45,110,111,114,109,97,108,46,112,110,103,0,99,117,98,101,45,100,105,102,102,117,115,101,46,106,112,103,0,99,117,98,101,45,110,111,114,109,97,108,46,112,110,103,0,101,120,112,108,111,115,105,111,110,49,46,112,110,103,0,116,114,101,101,46,109,101,115,104,0,103,114,97,115,115,46,109,101,115,104,0,114,111,97,100,45,115,116,114,97,105,103,104,116,45,108,111,119,46,109,101,115,104,0,114,111,97,100,45,99,111,114,110,101,114,45,108,111,119,46,109,101,115,104,0,114,111,97,100,45,116,106,117,110,99,116,105,111,110,45,108,111,119,46,109,101,115,104,0,114,111,97,100,45,99,114,111,115,115,105,110,103,45,108,111,119,46,109,101,115,104,0,114,111,97,100,45,101,110,100,45,108,111,119,46,109,101,115,104,0,98,117,105,108,100,105,110,103,45,111,102,102,105,99,101,45,115,109,97,108,108,46,109,101,115,104,0,114,105,118,101,114,45,99,111,114,110,101,114,45,108,111,119,46,109,101,115,104,0,114,105,118,101,114,45,101,110,100,45,108,111,119,46,109,101,115,104,0,114,105,118,101,114,45,115,116,114,97,105,103,104,116,45,108,111,119,46,109,101,115,104,0,119,97,116,101,114,46,109,101,115,104,0,116,97,110,107,95,98,117,108,108,101,116,46,109,101,115,104,0,99,114,97,116,101,95,109,101,100,107,105,116,46,109,101,115,104,0,119,97,108,108,46,109,101,115,104,0,119,97,108,108,45,99,111,114,110,101,114,46,109,101,115,104,0,56,98,105,116,95,103,117,110,108,111,111,112,95,101,120,112,108,111,115,105,111,110,46,111,103,103,0,101,120,112,108,111,115,105,111,110,46,111,103,103,0,101,110,101,109,121,49,46,109,101,115,104,0,108,101,118,101,108,0,46,100,97,116,0,68,58,92,95,103,97,109,101,57,52,92,115,114,99,92,103,97,109,101,92,103,97,109,101,92,76,101,118,101,108,46,99,112,112,0,100,114,97,119,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,57,69,120,112,108,111,115,105,111,110,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,54,66,117,108,108,101,116,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,52,84,114,101,101,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,49,55,73,110,118,105,115,105,98,108,101,79,98,115,116,97,99,108,101,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,56,79,98,115,116,97,99,108,101,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,53,69,110,101,109,121,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,54,77,101,100,75,105,116,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,105,32,62,61,32,48,32,38,38,32,115,116,97,116,105,99,95,99,97,115,116,60,100,101,116,97,105,108,58,58,99,111,109,112,111,110,101,110,116,95,99,111,117,110,116,95,116,62,40,105,41,32,60,32,100,101,116,97,105,108,58,58,99,111,109,112,111,110,101,110,116,95,99,111,117,110,116,40,42,116,104,105,115,41,0,68,58,47,95,103,97,109,101,57,52,47,108,105,98,47,103,108,109,47,115,114,99,92,103,108,109,47,100,101,116,97,105,108,47,116,121,112,101,95,118,101,99,52,46,105,110,108,0,111,112,101,114,97,116,111,114,91,93,0,68,58,47,95,103,97,109,101,57,52,47,108,105,98,47,103,108,109,47,115,114,99,92,103,108,109,47,100,101,116,97,105,108,47,116,121,112,101,95,118,101,99,51,46,105,110,108,0,105,32,60,32,116,104,105,115,45,62,108,101,110,103,116,104,40,41,0,68,58,47,95,103,97,109,101,57,52,47,108,105,98,47,103,108,109,47,115,114,99,92,103,108,109,47,100,101,116,97,105,108,47,116,121,112,101,95,109,97,116,52,120,52,46,105,110,108,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,56,87,105,110,83,99,101,110,101,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,57,76,111,115,101,83,99,101,110,101,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,54,80,108,97,121,101,114,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,49,55,80,101,114,115,112,101,99,116,105,118,101,67,97,109,101,114,97,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,105,110,103,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,56,98,97,115,105,99,95,115,116,114,105,110,103,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,56,79,98,115,116,97,99,108,101,0,57,76,111,115,101,83,99,101,110,101,0,108,111,115,101,95,116,105,116,108,101,46,112,110,103,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,49,54,77,101,110,117,76,111,97,100,105,110,103,83,99,101], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+37576);
/* memory initializer */ allocate([110,101,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,49,54,71,97,109,101,76,111,97,100,105,110,103,83,99,101,110,101,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,90,78,57,76,111,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,51,36,95,48,0,90,90,78,57,76,111,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,48,95,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,90,78,57,76,111,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,48,95,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,56,95,69,69,70,118,118,69,69,69,0,90,90,78,57,76,111,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,95,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,90,78,57,76,111,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,95,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,56,95,69,69,70,118,118,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,53,84,105,116,108,101,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,53,84,105,116,108,101,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,56,82,111,111,116,78,111,100,101,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,78,57,76,111,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,51,36,95,48,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,55,95,69,69,70,118,118,69,69,69,0,54,77,101,100,75,105,116,0,49,48,80,97,117,115,101,83,99,101,110,101,0,112,97,117,115,101,95,116,105,116,108,101,46,112,110,103,0,114,101,115,116,97,114,116,95,110,111,114,109,97,108,46,112,110,103,0,114,101,115,116,97,114,116,95,112,114,101,115,115,101,100,46,112,110,103,0,90,78,49,48,80,97,117,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,51,36,95,48,0,90,90,78,49,48,80,97,117,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,50,95,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,90,78,49,48,80,97,117,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,50,95,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,56,95,69,69,70,118,118,69,69,69,0,90,90,78,49,48,80,97,117,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,49,95,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,90,78,49,48,80,97,117,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,49,95,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,56,95,69,69,70,118,118,69,69,69,0,90,90,78,49,48,80,97,117,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,48,95,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,90,78,49,48,80,97,117,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,48,95,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,56,95,69,69,70,118,118,69,69,69,0,90,90,78,49,48,80,97,117,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,95,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,90,78,49,48,80,97,117,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,95,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,56,95,69,69,70,118,118,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,53,84,105,116,108,101,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,53,84,105,116,108,101,69,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,78,49,48,80,97,117,115,101,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,51,36,95,48,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,55,95,69,69,70,118,118,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,57,72,101,108,112,83,99,101,110,101,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,54,80,108,97,121,101,114,0,82,105,115,101,48,49,46,111,103,103,0,90,78,54,80,108,97,121,101,114,67,49,69,80,54,69,110,103,105,110,101,80,53,76,101,118,101,108,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,51,36,95,48,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,78,54,80,108,97,121,101,114,67,49,69,80,54,69,110,103,105,110,101,80,53,76,101,118,101,108,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,51,36,95,48,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,57,95,69,69,70,118,118,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,54,80,108,97,121,101,114,51,71,117,110,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,116,97,110,107,95,103,117,110,46,109,101,115,104,0,78,54,80,108,97,121,101,114,51,71,117,110,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,54,80,108,97,121,101,114,52,66,111,100,121,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,116,97,110,107,95,98,111,100,121,46,109,101,115,104,0,78,54,80,108,97,121,101,114,52,66,111,100,121,69,0,52,84,114,101,101,0,56,87,105,110,83,99,101,110,101,0,101,110,100,95,116,105,116,108,101,46,112,110,103,0,119,105,110,95,116,105,116,108,101,46,112,110,103,0,99,111,110,116,105,110,117,101,95,110,111,114,109,97,108,46,112,110,103,0,99,111,110,116,105,110,117,101,95,112,114,101,115,115,101,100,46,112,110,103,0,101,120,105,116,95,110,111,114,109,97,108,46,112,110,103,0,101,120,105,116,95,112,114,101,115,115,101,100,46,112,110,103,0,90,78,56,87,105,110,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,51,36,95,48,0,90,90,78,56,87,105,110,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,48,95,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,90,78,56,87,105,110,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,48,95,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,56,95,69,69,70,118,118,69,69,69,0,90,90,78,56,87,105,110,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,95,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,90,78,56,87,105,110,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,95,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,56,95,69,69,70,118,118,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,53,84,105,116,108,101,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,53,84,105,116,108,101,69,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,78,56,87,105,110,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,105,69,51,36,95,48,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,55,95,69,69,70,118,118,69,69,69,0,49,54,71,97,109,101,76,111,97,100,105,110,103,83,99,101,110,101,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,57,71,97,109,101,83,99,101,110,101,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,52,76,111,103,111,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,52,76,111,103,111,69,0,104,101,108,112,95,115,99,114,101,101,110,46,106,112,103,0,103,111,116,105,116,95,110,111,114,109,97,108,46,112,110,103,0,103,111,116,105,116,95,112,114,101,115,115,101,100,46,112,110,103,0,90,78,57,72,101,108,112,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,51,36,95,48,0,90,90,78,57,72,101,108,112,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,95,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,90,78,57,72,101,108,112,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,95,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,56,95,69,69,70,118,118,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,53,73,109,97,103,101,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,53,73,109,97,103,101,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,52,82,111,111,116,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,52,82,111,111,116,69,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,78,57,72,101,108,112,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,51,36,95,48,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,55,95,69,69,70,118,118,69,69,69,0,57,72,101,108,112,83,99,101,110,101,0,49,57,73,110,105,116,105,97,108,76,111,97,100,105,110,103,83,99,101,110,101,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,49,51,77,97,105,110,77,101,110,117,83,99,101,110,101,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,52,76,111,103,111,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,52,76,111,103,111,69,0,49,50,76,111,97,100,105,110,103,83,99,101,110,101,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,49,49,80,114,111,103,114,101,115,115,66,97,114,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,78,83,116,51,95,95,49,49,55,98,97,100,95,102,117,110,99,116,105,111,110,95,99,97,108,108,69,0,76,111,97,100,105,110,103,32,37,100,47,37,100,10,0,68,111,110,101,32,108,111,97,100,105,110,103,10,0,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,49,49,80,114,111,103,114,101,115,115,66,97,114,69,0,49,51,77,97,105,110,77,101,110,117,83,99,101,110,101,0,83,51,49,45,71,114,105,109,101,32,111,102,32,116,104,101,32,67,105,116,121,46,111,103,103,0,98,117,116,116,111,110,95,99,108,105,99,107,46,111,103,103,0,115,109,97,108,108,95,108,111,103,111,46,112,110,103,0,99,111,112,121,114,105,103,104,116,46,112,110,103,0,112,108,97,121,95,110,111,114,109,97,108,46,112,110,103,0,112,108,97,121,95,112,114,101,115,115,101,100,46,112,110,103,0,104,101,108,112,95,110,111,114,109,97,108,46,112,110,103,0,104,101,108,112,95,112,114,101,115,115,101,100,46,112,110,103,0,90,78,49,51,77,97,105,110,77,101,110,117,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,51,36,95,48,0,90,90,78,49,51,77,97,105,110,77,101,110,117,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,48,95,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,90,78,49,51,77,97,105,110,77,101,110,117,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,48,95,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,56,95,69,69,70,118,118,69,69,69,0,90,90,78,49,51,77,97,105,110,77,101,110,117,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,95,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,90,78,49,51,77,97,105,110,77,101,110,117,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,78,75,51,36,95,48,99,108,69,118,69,85,108,118,69,95,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,56,95,69,69,70,118,118,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,57,67,111,112,121,114,105,103,104,116,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,57,67,111,112,121,114,105,103,104,116,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,52,76,111,103,111,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,52,76,111,103,111,69,0,78,83,116,51,95,95,49,49,48,95,95,102,117,110,99,116,105,111,110,54,95,95,102,117,110,99,73,90,78,49,51,77,97,105,110,77,101,110,117,83,99,101,110,101,67,49,69,80,54,69,110,103,105,110,101,82,49,54,80,101,110,100,105,110,103,82,101,115,111,117,114,99,101,115,69,51,36,95,48,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,55,95,69,69,70,118,118,69,69,69,0,49,54,77,101,110,117,76,111,97,100,105,110,103,83,99,101,110,101,0,108,111,103,111,46,112,110,103,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,52,76,111,103,111,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,52,76,111,103,111,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,49,51,84,114,97,110,115,102,101,114,83,99,101,110,101,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,49,57,73,110,105,116,105,97,108,76,111,97,100,105,110,103,83,99,101,110,101,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,49,95,69,69,69,69,0,78,49,50,95,71,76,79,66,65,76,95,95,78,95,49,49,51,84,114,97,110,115,102,101,114,83,99,101,110,101,69,0,54,67,97,109,101,114,97,0,49,49,79,114,116,104,111,67,97,109,101,114,97,0,49,55,80,101,114,115,112,101,99,116,105,118,101,67,97,109,101,114,97,0,97,98,115,40,97,115,112,101,99,116,32,45,32,115,116,100,58,58,110,117,109,101,114,105,99,95,108,105,109,105,116,115,60,84,62,58,58,101,112,115,105,108,111,110,40,41,41,32,62,32,115,116,97,116,105,99,95,99,97,115,116,60,84,62,40,48,41,0,68,58,47,95,103,97,109,101,57,52,47,108,105,98,47,103,108,109,47,115,114,99,92,103,108,109,47,103,116,99,47,109,97,116,114,105,120,95,116,114,97,110,115,102,111,114,109,46,105,110,108,0,112,101,114,115,112,101,99,116,105,118,101,82,72,0,54,66,117,116,116,111,110,0,52,78,111,100,101,0,110,111,100,101,45,62,112,97,114,101,110,116,40,41,32,61,61,32,110,117,108,108,112,116,114,0,68,58,92,95,103,97,109,101,57,52,92,115,114,99,92,101,110,103,105,110,101,92,115,99,101,110,101,92,78,111,100,101,46,99,112,112,0,97,112,112,101,110,100,67,104,105,108,100,0,78,83,116,51,95,95,49,50,51,101,110,97,98,108,101,95,115,104,97,114,101,100,95,102,114,111,109,95,116,104,105,115,73,52,78,111,100,101,69,69,0,49,51,84,111,117,99,104,97,98,108,101,78,111,100,101,0,56,82,111,111,116,78,111,100,101,0,90,78,56,82,111,111,116,78,111,100,101,49,57,114,101,99,117,114,115,105,118,101,84,111,117,99,104,66,101,103,105,110,69,102,102,69,53,80,114,111,120,121,0,78,83,116,51,95,95,49,50,48,95,95,115,104,97,114,101,100,95,112,116,114,95,101,109,112,108,97,99,101,73,90,78,56,82,111,111,116,78,111,100,101,49,57,114,101,99,117,114,115,105,118,101,84,111,117,99,104,66,101,103,105,110,69,102,102,69,53,80,114,111,120,121,78,83,95,57,97,108,108,111,99,97,116,111,114,73,83,50,95,69,69,69,69,0,53,83,99,101,110,101,0,33,109,83,99,101,110,101,115,46,101,109,112,116,121,40,41,0,68,58,92,95,103,97,109,101,57,52,92,115,114,99,92,101,110,103,105,110,101,92,69,110,103,105,110,101,46,99,112,112,0,112,111,112,83,99,101,110,101,0,115,99,101,110,101,32,33,61,32,110,117,108,108,112,116,114,0,116,111,117,99,104,67,111,110,116,105,110,117,101,0,33,109,73,110,80,114,105,109,105,116,105,118,101,0,68,58,92,95,103,97,109,101,57,52,92,115,114,99,92,101,110,103,105,110,101,92,114,101,110,100,101,114,92,67,97,110,118,97,115,46,99,112,112,0,112,117,115,104,77,97,116,114,105,120,0,112,111,112,77,97,116,114,105,120,0,109,77,97,116,114,105,120,83,116,97,99,107,46,115,105,122,101,40,41,32,62,32,49,0,112,117,115,104,67,111,108,111,114,0,112,111,112,67,111,108,111,114,0,109,67,111,108,111,114,83,116,97,99,107,46,115,105,122,101,40,41,32,62,32,49,0,98,101,103,105,110,80,114,105,109,105,116,105,118,101,0,109,73,110,80,114,105,109,105,116,105,118,101,0,101,110,100,80,114,105,109,105,116,105,118,101,0,101,109,105,116,86,101,114,116,101,120,0,109,86,101,114,116,101,120,66,117,102,102,101,114,46,115,105,122,101,40,41,32,60,32,54,53,53,51,53,0,101,109,105,116,73,110,100,101,120,0,56,82,101,110,100,101,114,101,114,0,109,84,101,120,116,117,114,101,78,97,109,101,115,46,115,105,122,101,40,41,32,60,32,54,53,53,51,54,0,68,58,92,95,103,97,109,101,57,52,92,115,114,99,92,101,110,103,105,110,101,92,114,101,110,100,101,114,92,82,101,110,100,101,114,101,114,46,99,112,112,0,116,101,120,116,117,114,101,78,97,109,101,73,100,0,109,77,101,115,104,78,97,109,101,115,46,115,105,122,101,40,41,32,60,32,54,53,53,51,54,0,109,101,115,104,78,97,109,101,73,100,0,109,73,110,50,100,0,101,110,100,50,68,0,49,51,71,76,69,83,50,82,101,110,100,101,114,101,114,0,255,255,255,255,103,108,67,104,101,99,107,70,114,97,109,101,98,117,102,102,101,114,83,116,97,116,117,115,40,71,76,95,70,82,65,77,69,66,85,70,70,69,82,41,32,61,61,32,71,76,95,70,82,65,77,69,66,85,70,70,69,82,95,67,79,77,80,76,69,84,69,0,68,58,92,95,103,97,109,101,57,52,92,115,114,99,92,101,110,103,105,110,101,92,114,101,110,100,101,114,92,111,112,101,110,103,108,101,115,50,92,71,76,69,83,50,82,101,110,100,101,114,101,114,46,99,112,112,0,98,101,103,105,110,82,101,110,100,101,114,83,104,97,100,111,119,77,97,112,0,109,84,101,120,116,117,114,101,78,97,109,101,115,46,115,105,122,101,40,41,32,62,32,116,101,120,116,117,114,101,0,108,111,97,100,84,101,120,116,117,114,101,0,109,77,101,115,104,78,97,109,101,115,46,115,105,122,101,40,41,32,62,32,109,101,115,104,0,108,111,97,100,77,101,115,104,0,71,76,69,83,50,83,104,97,100,101,114,50,68,95,86,101,114,116,101,120,46,103,108,115,108,0,71,76,69,83,50,83,104,97,100,101,114,50,68,95,70,114,97,103,109,101,110,116,46,103,108,115,108,0,45,91,99,111,109,112,105,108,101,93,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,37,51,100,58,32,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,45,91,108,105,110,107,93,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,46,111,112,116,105,111,110,115,0,68,58,92,95,103,97,109,101,57,52,92,115,114,99,92,101,110,103,105,110,101,92,114,101,110,100,101,114,92,111,112,101,110,103,108,101,115,50,92,71,76,69,83,50,84,101,120,116,117,114,101,46,99,112,112,0,35,100,101,102,105,110,101,32,83,72,65,68,69,82,95,72,65,83,95,67,79,76,79,82,95,65,84,84,82,73,66,85,84,69,10,0,35,100,101,102,105,110,101,32,83,72,65,68,69,82,95,72,65,83,95,84,69,88,67,79,79,82,68,48,95,65,84,84,82,73,66,85,84,69,10,0,35,100,101,102,105,110,101,32,83,72,65,68,69,82,95,72,65,83,95,76,73,71,72,84,73,78,71,10,0,35,100,101,102,105,110,101,32,83,72,65,68,69,82,95,72,65,83,95,68,73,70,70,85,83,69,95,77,65,80,10,0,35,100,101,102,105,110,101,32,83,72,65,68,69,82,95,72,65,83,95,78,79,82,77,65,76,95,77,65,80,10,0,35,100,101,102,105,110,101,32,83,72,65,68,69,82,95,72,65,83,95,83,80,69,67,85,76,65,82,95,77,65,80,10,0,35,100,101,102,105,110,101,32,83,72,65,68,69,82,95,65,67,67,69,80,84,83,95,83,72,65,68,79,87,10,0,35,100,101,102,105,110,101,32,83,72,65,68,69,82,95,87,82,73,84,69,83,95,83,72,65,68,79,87,77,65,80,10,0,71,76,69,83,50,85,98,101,114,83,104,97,100,101,114,95,86,101,114,116,101,120,46,103,108,115,108,0,71,76,69,83,50,85,98,101,114,83,104,97,100,101,114,95,70,114,97,103,109,101,110,116,46,103,108,115,108,0,117,95,118,105,101,119,0,117,95,109,111,100,101,108,0,117,95,109,97,116,101,114,105,97,108,65,109,98,105,101,110,116,0,117,95,109,97,116,101,114,105,97,108,68,105,102,102,117,115,101,0,117,95,109,97,116,101,114,105,97,108,83,112,101,99,117,108,97,114,0,117,95,115,104,105,110,105,110,101,115,115,0,117,95,111,112,97,99,105,116,121,0,117,95,100,105,102,102,117,115,101,77,97,112,0,117,95,110,111,114,109,97,108,77,97,112,0,117,95,115,112,101,99,117,108,97,114,77,97,112,0,117,95,115,104,97,100,111,119,77,97,112,0,117,95,115,104,97,100,111,119,80,114,111,106,101,99,116,105,111,110,0,117,95,108,105,103,104,116,80,111,115,105,116,105,111,110,0,117,95,108,105,103,104,116,67,111,108,111,114,0,117,95,108,105,103,104,116,80,111,119,101,114,0,97,95,116,101,120,67,111,111,114,100,48,0,97,95,99,111,108,111,114,0,97,95,110,111,114,109,97,108,0,97,95,116,97,110,103,101,110,116,0,97,95,98,105,116,97,110,103,101,110,116,0,31,139,8,0,72,111,212,87,0,3,237,26,105,111,218,72,180,159,253,43,70,218,15,107,40,1,115,4,212,141,82,137,2,57,164,92,2,210,86,187,170,144,3,67,226,173,177,145,109,114,173,250,223,247,205,97,207,140,61,54,144,118,217,221,42,163,68,96,191,153,119,205,187,230,13,97,48,173,97,239,214,241,112,45,192,222,12,7,53,127,9,207,46,14,27,181,227,179,193,168,49,186,179,225,109,163,63,57,10,236,219,5,246,162,234,173,27,186,111,182,25,150,101,181,219,109,68,62,97,164,63,45,171,213,172,163,122,163,211,222,183,218,29,248,71,86,163,222,172,183,222,32,107,43,42,47,28,171,48,178,3,96,229,123,241,164,133,251,159,12,227,23,103,62,195,115,116,124,54,25,140,12,36,158,142,134,221,227,243,193,197,120,114,53,28,244,78,71,167,151,23,147,147,211,227,19,3,161,101,128,167,78,232,248,30,186,115,110,239,150,104,238,250,118,116,0,107,177,27,98,5,190,192,51,103,181,144,103,120,51,103,110,240,15,99,229,57,115,63,88,160,208,94,44,93,98,99,104,53,137,240,99,180,10,240,129,97,220,219,193,147,227,221,162,123,60,109,161,251,201,212,119,253,224,64,126,219,128,183,48,189,231,251,193,140,204,247,157,25,90,216,142,103,150,140,191,128,13,132,110,93,106,180,61,178,18,29,198,56,80,25,113,34,141,190,153,16,172,72,200,74,7,198,55,227,223,222,152,29,141,112,99,255,255,136,3,80,208,246,222,191,129,255,119,246,185,255,55,235,237,86,147,248,191,213,232,188,250,255,46,134,97,71,81,224,220,172,34,204,92,202,158,44,253,208,137,192,123,15,178,32,225,109,10,168,5,32,238,158,137,79,47,236,168,5,238,188,12,252,63,241,148,161,75,129,22,254,12,187,63,196,207,99,199,62,20,124,176,215,241,42,10,17,40,120,108,184,226,130,2,84,102,20,226,3,103,14,190,17,166,76,161,147,10,178,170,86,5,213,171,214,207,18,35,214,250,255,245,13,14,88,12,120,113,5,80,236,255,245,122,187,211,73,242,127,171,67,243,127,167,99,189,250,255,46,198,127,33,255,131,147,53,137,207,217,17,14,28,219,237,59,243,249,42,196,34,96,208,229,48,193,95,218,83,39,122,130,24,192,217,28,157,116,251,131,225,228,164,59,154,156,1,111,227,211,139,99,3,165,176,186,192,99,212,227,81,33,141,145,2,175,252,7,44,3,83,236,116,23,55,14,24,125,254,132,209,18,79,87,174,173,195,31,222,57,30,184,86,24,2,76,138,104,77,18,155,108,239,22,208,142,64,38,124,70,216,232,59,65,28,41,139,230,94,0,126,27,226,102,172,196,172,42,250,167,71,71,215,163,193,228,188,123,37,56,146,107,172,25,83,240,185,189,44,66,115,113,57,60,239,158,229,99,241,40,35,107,144,140,174,6,189,235,179,238,48,31,77,200,181,183,6,209,120,240,185,119,121,57,236,91,147,238,120,60,60,253,112,61,30,40,106,146,147,132,85,132,168,119,121,118,57,204,65,34,229,31,61,130,110,175,55,184,26,131,88,240,120,249,41,71,32,8,150,254,3,21,39,141,155,129,226,68,22,91,137,7,219,250,213,164,83,8,241,85,80,50,16,75,108,83,223,11,35,182,248,198,137,70,119,206,60,10,73,33,75,146,18,228,32,84,67,102,99,191,13,95,202,72,249,44,85,232,242,162,161,91,190,241,50,58,123,131,201,37,150,107,3,12,21,182,135,102,126,100,50,1,43,66,28,50,229,91,162,139,208,33,122,28,81,53,153,236,213,141,99,135,137,66,168,42,18,5,75,9,220,84,148,11,44,42,207,213,7,244,150,38,109,194,123,213,58,16,184,136,234,241,236,247,143,182,187,194,128,70,62,24,36,100,42,89,138,213,199,39,46,27,99,114,230,64,22,241,166,4,5,223,78,25,177,170,6,186,194,76,86,188,215,96,127,70,123,76,110,170,28,189,41,126,26,158,142,7,177,37,82,239,74,25,155,168,227,12,84,171,161,121,224,47,208,145,77,98,25,26,65,60,177,193,231,102,191,134,168,63,160,217,223,16,250,224,138,159,225,101,116,151,107,138,177,25,106,237,175,216,52,182,157,90,60,133,213,98,26,30,207,195,175,49,147,235,108,117,115,171,126,209,204,152,63,238,226,144,16,15,97,59,236,41,88,1,209,49,168,130,170,148,155,9,157,176,119,72,63,171,143,143,79,207,12,14,226,40,102,68,192,138,121,164,235,226,117,230,130,98,227,101,129,220,121,198,179,190,48,99,97,63,96,141,53,249,241,129,177,161,93,101,106,222,102,61,47,117,46,167,54,151,93,72,213,193,106,10,201,95,157,71,236,242,108,78,223,214,254,169,193,177,35,94,141,32,118,196,176,189,25,226,101,72,194,85,19,241,132,26,11,164,41,101,132,182,249,106,58,77,20,52,233,237,202,228,241,88,1,34,119,199,212,228,152,37,160,114,63,195,226,150,165,176,89,62,76,227,170,6,183,55,108,98,204,163,102,142,205,118,133,153,156,142,235,76,126,213,16,230,89,86,75,48,134,165,8,237,96,167,121,161,199,118,90,47,156,168,50,227,173,183,217,162,236,214,199,216,202,138,244,59,23,42,46,78,183,147,42,46,202,178,98,73,197,174,14,149,90,239,193,80,49,149,83,41,86,212,126,170,189,38,150,193,117,181,99,165,245,108,151,240,21,97,158,155,179,106,75,23,130,137,123,199,85,7,158,207,65,111,245,56,228,57,243,84,137,2,37,201,123,210,76,40,241,252,186,118,95,4,137,169,31,142,239,112,100,3,254,169,11,133,167,73,10,171,162,3,69,69,123,132,40,41,205,12,149,4,41,62,0,61,192,97,236,147,142,169,237,153,54,16,54,99,226,165,100,77,124,236,203,95,47,102,242,205,100,67,85,149,82,250,197,197,143,118,166,41,63,150,129,72,171,4,73,198,170,182,217,130,111,187,182,22,170,108,40,188,184,149,120,69,187,40,242,87,92,155,200,209,161,18,7,66,41,247,37,62,169,59,4,106,205,70,62,184,193,200,174,3,210,73,186,53,101,127,76,142,116,89,111,36,245,26,84,52,123,194,92,4,123,90,10,132,103,147,26,152,106,101,242,214,80,185,230,142,103,39,42,145,195,41,207,240,204,162,46,192,200,207,96,194,122,91,215,88,186,240,65,134,134,121,158,176,89,193,193,219,195,84,178,82,58,8,226,145,246,12,224,145,226,75,74,17,116,116,250,249,124,240,27,138,238,156,16,193,31,28,255,35,6,42,27,89,66,210,83,57,213,43,216,32,220,16,105,100,71,32,50,189,123,87,82,130,166,78,188,84,64,94,35,95,154,45,84,174,25,57,134,44,200,164,205,120,151,57,124,185,116,159,182,137,218,146,28,101,46,8,181,92,73,181,37,97,189,187,145,69,91,36,75,133,111,194,199,15,232,64,111,211,255,125,233,13,208,154,251,159,86,171,193,238,127,91,228,254,183,181,79,250,191,173,118,243,181,255,187,139,161,222,228,52,149,251,159,77,186,103,121,23,65,91,181,213,212,52,153,225,200,139,179,93,6,194,99,189,14,4,71,230,4,168,107,9,95,37,98,238,174,51,171,109,98,230,222,178,89,7,219,119,56,243,26,148,252,206,141,69,181,43,233,82,174,176,69,249,221,157,167,116,167,127,253,173,224,189,131,31,242,175,10,11,91,28,121,167,79,237,245,96,209,17,86,187,77,72,190,80,180,148,27,69,43,157,26,168,113,60,248,129,59,163,134,193,226,166,212,173,164,25,166,224,146,145,164,155,146,166,43,160,201,95,106,223,243,80,179,199,49,129,60,126,116,217,109,205,89,132,110,11,229,158,108,23,165,74,191,148,197,94,37,106,152,218,11,28,216,5,122,16,120,10,53,145,69,167,250,38,160,219,19,85,45,215,176,140,54,229,247,180,46,45,37,200,65,164,38,90,220,55,31,155,128,136,60,152,73,253,164,114,249,135,245,69,234,147,167,96,245,2,88,227,75,174,36,76,49,99,22,75,8,125,202,71,89,9,112,185,203,62,196,129,78,89,40,135,191,220,165,73,177,46,214,121,226,100,193,116,18,221,120,122,141,228,241,95,125,172,20,48,169,133,50,62,170,143,105,229,229,146,120,42,36,161,131,114,18,79,27,147,120,46,36,161,131,114,18,207,98,155,53,233,65,61,123,221,16,239,204,65,84,58,208,32,201,216,124,1,50,117,174,210,132,166,181,122,254,239,31,168,191,228,58,174,28,48,164,19,234,90,172,170,59,190,60,28,105,91,217,34,235,160,67,149,145,116,112,86,127,249,145,154,250,83,252,166,227,117,188,142,215,241,58,54,25,127,3,14,113,122,18,0,46,0,0,0,49,50,83,111,117,110,100,77,97,110,97,103,101,114,0,109,83,111,117,110,100,78,97,109,101,115,46,115,105,122,101,40,41,32,60,32,54,53,53,51,54,0,68,58,92,95,103,97,109,101,57,52,92,115,114,99,92,101,110,103,105,110,101,92,115,111,117,110,100,92,83,111,117,110,100,77,97,110,97,103,101,114,46,99,112,112,0,115,111,117,110,100,78,97,109,101,73,100,0,49,56,79,112,101,110,65,76,83,111,117,110,100,77,97,110,97,103,101,114,0,109,83,111,117,110,100,78,97,109,101,115,46,115,105,122,101,40,41,32,62,32,115,111,117,110,100,0,68,58,92,95,103,97,109,101,57,52,92,115,114,99,92,101,110,103,105,110,101,92,115,111,117,110,100,92,111,112,101,110,97,108,92,79,112,101,110,65,76,83,111,117,110,100,77,97,110,97,103,101,114,46,99,112,112,0,108,111,97,100,83,111,117,110,100,0,110,83,97,109,112,108,101,115,32,62,32,48,0,68,58,92,95,103,97,109,101,57,52,92,115,114,99,92,101,110,103,105,110,101,92,115,111,117,110,100,92,111,112,101,110,97,108,92,79,112,101,110,65,76,83,111,117,110,100,46,99,112,112,0,108,111,97,100,0,99,104,97,110,110,101,108,115,32,61,61,32,49,32,124,124,32,99,104,97,110,110,101,108,115,32,61,61,32,50,0,99,97,110,39,116,32,102,111,112,101,110,0,0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,82,71,66,137,80,78,71,13,10,26,10,88,88,88,88,32,80,78,71,32,99,104,117,110,107,32,110,111,116,32,107,110,111,119,110,0,0,255,85,0,17,0,0,0,1,0,1,0,5,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15,98,97,100,32,104,117,102,102,109,97,110,32,99,111,100,101,0,98,97,100,32,100,105,115,116,0,122,45,62,115,105,122,101,91,98,93,32,61,61,32,115,0,68,58,47,95,103,97,109,101,57,52,47,108,105,98,47,115,116,98,47,46,46,92,115,116,98,47,115,114,99,47,115,116,98,95,105,109,97,103,101,46,104,0,115,116,98,105,95,95,122,104,117,102,102,109,97,110,95,100,101,99,111,100,101,95,115,108,111,119,112,97,116,104,0,98,97,100,32,99,111,100,101,108,101,110,103,116,104,115,0,99,32,61,61,32,49,56,0,115,116,98,105,95,95,99,111,109,112,117,116,101,95,104,117,102,102,109,97,110,95,99,111,100,101,115,0,98,105,116,115,32,60,61,32,49,54,0,115,116,98,105,95,95,98,105,116,95,114,101,118,101,114,115,101,0,98,97,100,32,115,105,122,101,115,0,111,117,116,112,117,116,32,98,117,102,102,101,114,32,108,105,109,105,116], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+47816);
/* memory initializer */ allocate([0,111,117,116,111,102,109,101,109,0,97,45,62,110,117,109,95,98,105,116,115,32,61,61,32,48,0,115,116,98,105,95,95,112,97,114,115,101,95,117,110,99,111,109,112,114,101,115,115,101,100,95,98,108,111,99,107,0,122,108,105,98,32,99,111,114,114,117,112,116,0,114,101,97,100,32,112,97,115,116,32,98,117,102,102,101,114,0,122,45,62,99,111,100,101,95,98,117,102,102,101,114,32,60,32,40,49,85,32,60,60,32,122,45,62,110,117,109,95,98,105,116,115,41,0,115,116,98,105,95,95,102,105,108,108,95,98,105,116,115,0,98,97,100,32,122,108,105,98,32,104,101,97,100,101,114,0,110,111,32,112,114,101,115,101,116,32,100,105,99,116,0,98,97,100,32,99,111,109,112,114,101,115,115,105,111,110,0,114,101,113,95,99,111,109,112,32,62,61,32,49,32,38,38,32,114,101,113,95,99,111,109,112,32,60,61,32,52,0,115,116,98,105,95,95,99,111,110,118,101,114,116,95,102,111,114,109,97,116,0,115,45,62,105,109,103,95,111,117,116,95,110,32,61,61,32,52,0,115,116,98,105,95,95,100,101,95,105,112,104,111,110,101,0,111,117,116,95,110,32,61,61,32,50,32,124,124,32,111,117,116,95,110,32,61,61,32,52,0,115,116,98,105,95,95,99,111,109,112,117,116,101,95,116,114,97,110,115,112,97,114,101,110,99,121,0,115,116,98,105,95,95,99,111,109,112,117,116,101,95,116,114,97,110,115,112,97,114,101,110,99,121,49,54,0,111,117,116,95,110,32,61,61,32,115,45,62,105,109,103,95,110,32,124,124,32,111,117,116,95,110,32,61,61,32,115,45,62,105,109,103,95,110,43,49,0,115,116,98,105,95,95,99,114,101,97,116,101,95,112,110,103,95,105,109,97,103,101,95,114,97,119,0,110,111,116,32,101,110,111,117,103,104,32,112,105,120,101,108,115,0,105,110,118,97,108,105,100,32,102,105,108,116,101,114,0,105,109,103,95,119,105,100,116,104,95,98,121,116,101,115,32,60,61,32,120,0,105,109,103,95,110,43,49,32,61,61,32,111,117,116,95,110,0,105,109,103,95,110,32,61,61,32,51,0,109,117,108,116,105,112,108,101,32,73,72,68,82,0,98,97,100,32,73,72,68,82,32,108,101,110,0,116,111,111,32,108,97,114,103,101,0,49,47,50,47,52,47,56,47,49,54,45,98,105,116,32,111,110,108,121,0,98,97,100,32,99,116,121,112,101,0,98,97,100,32,99,111,109,112,32,109,101,116,104,111,100,0,98,97,100,32,102,105,108,116,101,114,32,109,101,116,104,111,100,0,98,97,100,32,105,110,116,101,114,108,97,99,101,32,109,101,116,104,111,100,0,48,45,112,105,120,101,108,32,105,109,97,103,101,0,102,105,114,115,116,32,110,111,116,32,73,72,68,82,0,105,110,118,97,108,105,100,32,80,76,84,69,0,116,82,78,83,32,97,102,116,101,114,32,73,68,65,84,0,116,82,78,83,32,98,101,102,111,114,101,32,80,76,84,69,0,98,97,100,32,116,82,78,83,32,108,101,110,0,116,82,78,83,32,119,105,116,104,32,97,108,112,104,97,0,110,111,32,80,76,84,69,0,111,117,116,111,102,100,97,116,97,0,110,111,32,73,68,65,84,0,98,97,100,32,114,101,113,95,99,111,109,112,0,98,97,100,32,112,110,103,32,115,105,103,0,99,97,110,39,116,32,109,101,114,103,101,32,100,99,32,97,110,100,32,97,99,0,110,32,62,61,32,48,32,38,38,32,110,32,60,32,40,105,110,116,41,32,40,115,105,122,101,111,102,40,115,116,98,105,95,95,98,109,97,115,107,41,47,115,105,122,101,111,102,40,42,115,116,98,105,95,95,98,109,97,115,107,41,41,0,115,116,98,105,95,95,101,120,116,101,110,100,95,114,101,99,101,105,118,101,0,40,40,40,106,45,62,99,111,100,101,95,98,117,102,102,101,114,41,32,62,62,32,40,51,50,32,45,32,104,45,62,115,105,122,101,91,99,93,41,41,32,38,32,115,116,98,105,95,95,98,109,97,115,107,91,104,45,62,115,105,122,101,91,99,93,93,41,32,61,61,32,104,45,62,99,111,100,101,91,99,93,0,115,116,98,105,95,95,106,112,101,103,95,104,117,102,102,95,100,101,99,111,100,101,0,98,97,100,32,83,79,83,32,99,111,109,112,111,110,101,110,116,32,99,111,117,110,116,0,98,97,100,32,83,79,83,32,108,101,110,0,98,97,100,32,68,67,32,104,117,102,102,0,98,97,100,32,65,67,32,104,117,102,102,0,98,97,100,32,83,79,83,0,106,117,110,107,32,98,101,102,111,114,101,32,109,97,114,107,101,114,0,98,97,100,32,83,79,70,32,108,101,110,0,111,110,108,121,32,56,45,98,105,116,0,110,111,32,104,101,97,100,101,114,32,104,101,105,103,104,116,0,48,32,119,105,100,116,104,0,98,97,100,32,99,111,109,112,111,110,101,110,116,32,99,111,117,110,116,0,98,97,100,32,99,111,109,112,111,110,101,110,116,32,73,68,0,98,97,100,32,72,0,98,97,100,32,86,0,98,97,100,32,84,81,0,98,97,100,32,99,111,100,101,32,108,101,110,103,116,104,115,0,101,120,112,101,99,116,101,100,32,109,97,114,107,101,114,0,98,97,100,32,68,82,73,32,108,101,110,0,98,97,100,32,68,81,84,32,116,121,112,101,0,98,97,100,32,68,81,84,32,116,97,98,108,101,0,98,97,100,32,68,72,84,32,104,101,97,100,101,114,0,110,111,32,83,79,73,0,110,111,32,83,79,70,0,117,110,107,110,111,119,110,32,105,109,97,103,101,32,116,121,112,101,0,68,58,47,95,103,97,109,101,57,52,47,108,105,98,47,115,116,98,47,46,46,92,115,116,98,47,115,114,99,47,115,116,98,95,118,111,114,98,105,115,46,99,0,114,98,0,0,1,2,2,3,3,3,3,4,4,4,4,4,4,4,4,118,111,114,98,105,115,0,0,0,0,0,0,7,0,0,0,0,0,3,5,0,0,0,0,3,7,5,0,0,0,3,5,3,5,0,0,3,7,5,3,5,0,3,7,5,3,5,7,112,111,119,40,40,102,108,111,97,116,41,32,114,43,49,44,32,100,105,109,41,32,62,32,101,110,116,114,105,101,115,0,108,111,111,107,117,112,49,95,118,97,108,117,101,115,0,40,105,110,116,41,32,102,108,111,111,114,40,112,111,119,40,40,102,108,111,97,116,41,32,114,44,32,100,105,109,41,41,32,60,61,32,101,110,116,114,105,101,115,0,108,101,110,32,33,61,32,78,79,95,67,79,68,69,0,105,110,99,108,117,100,101,95,105,110,95,115,111,114,116,0,107,32,61,61,32,99,45,62,115,111,114,116,101,100,95,101,110,116,114,105,101,115,0,99,111,109,112,117,116,101,95,115,111,114,116,101,100,95,104,117,102,102,109,97,110,0,99,45,62,115,111,114,116,101,100,95,99,111,100,101,119,111,114,100,115,91,120,93,32,61,61,32,99,111,100,101,0,99,45,62,115,111,114,116,101,100,95,101,110,116,114,105,101,115,32,61,61,32,48,0,99,111,109,112,117,116,101,95,99,111,100,101,119,111,114,100,115,0,122,32,62,61,32,48,32,38,38,32,122,32,60,32,51,50,0,108,101,110,91,105,93,32,62,61,32,48,32,38,38,32,108,101,110,91,105,93,32,60,32,51,50,0,97,118,97,105,108,97,98,108,101,91,121,93,32,61,61,32,48,0,103,101,116,95,119,105,110,100,111,119,0,40,110,32,38,32,51,41,32,61,61,32,48,0,105,109,100,99,116,95,115,116,101,112,51,95,105,116,101,114,48,95,108,111,111,112,0,118,32,61,61,32,98,117,102,50,0,105,110,118,101,114,115,101,95,109,100,99,116,0,122,32,60,32,99,45,62,115,111,114,116,101,100,95,101,110,116,114,105,101,115,0,99,111,100,101,98,111,111,107,95,100,101,99,111,100,101,95,115,116,97,114,116,0,33,99,45,62,115,112,97,114,115,101,32,124,124,32,122,32,60,32,99,45,62,115,111,114,116,101,100,95,101,110,116,114,105,101,115,0,99,111,100,101,98,111,111,107,95,100,101,99,111,100,101,95,100,101,105,110,116,101,114,108,101,97,118,101,95,114,101,112,101,97,116,0,33,99,45,62,115,112,97,114,115,101,0,99,111,100,101,98,111,111,107,95,100,101,99,111,100,101,95,115,99,97,108,97,114,95,114,97,119,0,102,45,62,97,108,108,111,99,46,97,108,108,111,99,95,98,117,102,102,101,114,95,108,101,110,103,116,104,95,105,110,95,98,121,116,101,115,32,61,61,32,102,45,62,116,101,109,112,95,111,102,102,115,101,116,0,118,111,114,98,105,115,95,100,101,99,111,100,101,95,112,97,99,107,101,116,95,114,101,115,116,0,102,45,62,98,121,116,101,115,95,105,110,95,115,101,103,32,61,61,32,48,0,110,101,120,116,95,115,101,103,109,101,110,116,0,102,45,62,98,121,116,101,115,95,105,110,95,115,101,103,32,62,32,48,0,103,101,116,56,95,112,97,99,107,101,116,95,114,97,119,0,118,111,114,98,105,115,95,100,101,99,111,100,101,95,105,110,105,116,105,97,108,0,98,117,102,95,99,32,61,61,32,50,0,99,111,110,118,101,114,116,95,99,104,97,110,110,101,108,115,95,115,104,111,114,116,95,105,110,116,101,114,108,101,97,118,101,100,0,102,45,62,116,101,109,112,95,111,102,102,115,101,116,32,61,61,32,102,45,62,97,108,108,111,99,46,97,108,108,111,99,95,98,117,102,102,101,114,95,108,101,110,103,116,104,95,105,110,95,98,121,116,101,115,0,115,116,97,114,116,95,100,101,99,111,100,101,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,68,76,32,110,111,116,32,98,117,105,108,116,32,119,105,116,104,32,104,97,112,116,105,99,32,40,102,111,114,99,101,32,102,101,101,100,98,97,99,107,41,32,115,117,112,112,111,114,116,0,37,115], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+58056);
/* memory initializer */ allocate([79,117,116,32,111,102,32,109,101,109,111,114,121,0,69,114,114,111,114,32,114,101,97,100,105,110,103,32,102,114,111,109,32,100,97,116,97,115,116,114,101,97,109,0,69,114,114,111,114,32,119,114,105,116,105,110,103,32,116,111,32,100,97,116,97,115,116,114,101,97,109,0,69,114,114,111,114,32,115,101,101,107,105,110,103,32,105,110,32,100,97,116,97,115,116,114,101,97,109,0,84,104,97,116,32,111,112,101,114,97,116,105,111,110,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,85,110,107,110,111,119,110,32,83,68,76,32,101,114,114,111,114,0,99,97,108,108,98,97,99,107,0,83,68,76,95,65,85,68,73,79,68,82,73,86,69,82,0,65,117,100,105,111,32,116,97,114,103,101,116,32,39,37,115,39,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,78,111,32,97,118,97,105,108,97,98,108,101,32,97,117,100,105,111,32,100,101,118,105,99,101,0,78,111,32,98,117,102,102,101,114,32,97,108,108,111,99,97,116,101,100,32,102,111,114,32,99,111,110,118,101,114,115,105,111,110,0,84,104,101,32,101,118,101,110,116,32,115,121,115,116,101,109,32,104,97,115,32,98,101,101,110,32,115,104,117,116,32,100,111,119,110,0,69,118,101,110,116,32,113,117,101,117,101,32,105,115,32,102,117,108,108,32,40,37,100,32,101,118,101,110,116,115,41,0,67,111,117,108,100,110,39,116,32,108,111,99,107,32,101,118,101,110,116,32,113,117,101,117,101,0,78,111,32,119,105,110,100,111,119,32,104,97,115,32,102,111,99,117,115,0,83,68,76,95,77,79,85,83,69,95,82,69,76,65,84,73,86,69,95,77,79,68,69,95,87,65,82,80,0,85,110,107,110,111,119,110,32,116,111,117,99,104,32,100,101,118,105,99,101,0,83,68,76,95,82,87,70,114,111,109,70,105,108,101,40,41,58,32,78,111,32,102,105,108,101,32,111,114,32,110,111,32,109,111,100,101,32,115,112,101,99,105,102,105,101,100,0,67,111,117,108,100,110,39,116,32,111,112,101,110,32,37,115,0,108,101,102,116,120,0,108,101,102,116,121,0,114,105,103,104,116,120,0,114,105,103,104,116,121,0,108,101,102,116,116,114,105,103,103,101,114,0,114,105,103,104,116,116,114,105,103,103,101,114,0,97,0,98,0,120,0,121,0,98,97,99,107,0,103,117,105,100,101,0,115,116,97,114,116,0,108,101,102,116,115,116,105,99,107,0,114,105,103,104,116,115,116,105,99,107,0,108,101,102,116,115,104,111,117,108,100,101,114,0,114,105,103,104,116,115,104,111,117,108,100,101,114,0,100,112,117,112,0,100,112,100,111,119,110,0,100,112,108,101,102,116,0,100,112,114,105,103,104,116,0,65,120,105,115,32,105,110,100,101,120,32,116,111,111,32,108,97,114,103,101,58,32,37,100,0,66,117,116,116,111,110,32,105,110,100,101,120,32,116,111,111,32,108,97,114,103,101,58,32,37,100,0,72,97,116,32,105,110,100,101,120,32,116,111,111,32,108,97,114,103,101,58,32,37,100,0,66,117,116,116,111,110,32,110,97,109,101,32,116,111,111,32,108,97,114,103,101,58,32,37,115,0,74,111,121,115,116,105,99,107,32,98,117,116,116,111,110,32,110,97,109,101,32,116,111,111,32,108,97,114,103,101,58,32,37,115,0,109,97,112,112,105,110,103,83,116,114,105,110,103,0,67,111,117,108,100,110,39,116,32,112,97,114,115,101,32,71,85,73,68,32,102,114,111,109,32,37,115,0,120,105,110,112,117,116,0,67,111,117,108,100,110,39,116,32,112,97,114,115,101,32,110,97,109,101,32,102,114,111,109,32,37,115,0,67,111,117,108,100,110,39,116,32,112,97,114,115,101,32,37,115,0,101,109,115,99,114,105,112,116,101,110,44,83,116,97,110,100,97,114,100,32,71,97,109,101,112,97,100,44,97,58,98,48,44,98,58,98,49,44,120,58,98,50,44,121,58,98,51,44,108,101,102,116,115,104,111,117,108,100,101,114,58,98,52,44,114,105,103,104,116,115,104,111,117,108,100,101,114,58,98,53,44,108,101,102,116,116,114,105,103,103,101,114,58,98,54,44,114,105,103,104,116,116,114,105,103,103,101,114,58,98,55,44,98,97,99,107,58,98,56,44,115,116,97,114,116,58,98,57,44,108,101,102,116,115,116,105,99,107,58,98,49,48,44,114,105,103,104,116,115,116,105,99,107,58,98,49,49,44,100,112,117,112,58,98,49,50,44,100,112,100,111,119,110,58,98,49,51,44,100,112,108,101,102,116,58,98,49,52,44,100,112,114,105,103,104,116,58,98,49,53,44,103,117,105,100,101,58,98,49,54,44,108,101,102,116,120,58,97,48,44,108,101,102,116,121,58,97,49,44,114,105,103,104,116,120,58,97,50,44,114,105,103,104,116,121,58,97,51,44,0,83,68,76,95,71,65,77,69,67,79,78,84,82,79,76,76,69,82,67,79,78,70,73,71,0,83,68,76,95,74,79,89,83,84,73,67,75,95,65,76,76,79,87,95,66,65,67,75,71,82,79,85,78,68,95,69,86,69,78,84,83,0,84,104,101,114,101,32,97,114,101,32,37,100,32,106,111,121,115,116,105,99,107,115,32,97,118,97,105,108,97,98,108,101,0,105,110,100,101,120,32,109,117,115,116,32,98,101,32,105,110,32,116,104,101,32,114,97,110,103,101,32,111,102,32,48,32,45,32,37,100,0,95,83,68,76,95,87,105,110,100,111,119,82,101,110,100,101,114,68,97,116,97,0,82,101,110,100,101,114,101,114,32,97,108,114,101,97,100,121,32,97,115,115,111,99,105,97,116,101,100,32,119,105,116,104,32,119,105,110,100,111,119,0,83,68,76,95,82,69,78,68,69,82,95,86,83,89,78,67,0,67,111,117,108,100,110,39,116,32,102,105,110,100,32,109,97,116,99,104,105,110,103,32,114,101,110,100,101,114,32,100,114,105,118,101,114,0,105,110,100,101,120,32,109,117,115,116,32,98,101,32,45,49,32,111,114,32,105,110,32,116,104,101,32,114,97,110,103,101,32,111,102,32,48,32,45,32,37,100,0,0,73,110,118,97,108,105,100,32,114,101,110,100,101,114,101,114,0,67,114,101,97,116,101,100,32,114,101,110,100,101,114,101,114,58,32,37,115,0,0,73,110,118,97,108,105,100,32,116,101,120,116,117,114,101,0,82,101,110,100,101,114,101,114,32,100,111,101,115,110,39,116,32,115,117,112,112,111,114,116,32,113,117,101,114,121,105,110,103,32,111,117,116,112,117,116,32,115,105,122,101,0,73,110,118,97,108,105,100,32,116,101,120,116,117,114,101,32,102,111,114,109,97,116,0,80,97,108,101,116,116,105,122,101,100,32,116,101,120,116,117,114,101,115,32,97,114,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,84,101,120,116,117,114,101,32,100,105,109,101,110,115,105,111,110,115,32,99,97,110,39,116,32,98,101,32,48,0,84,101,120,116,117,114,101,32,100,105,109,101,110,115,105,111,110,115,32,97,114,101,32,108,105,109,105,116,101,100,32,116,111,32,37,100,120,37,100,0,112,105,120,101,108,115,0,112,105,116,99,104,0,83,68,76,95,76,111,99,107,84,101,120,116,117,114,101,40,41,58,32,116,101,120,116,117,114,101,32,109,117,115,116,32,98,101,32,115,116,114,101,97,109,105,110,103,0,84,101,120,116,117,114,101,32,119,97,115,32,110,111,116,32,99,114,101,97,116,101,100,32,119,105,116,104,32,116,104,105,115,32,114,101,110,100,101,114,101,114,0,84,101,120,116,117,114,101,32,110,111,116,32,99,114,101,97,116,101,100,32,119,105,116,104,32,83,68,76,95,84,69,88,84,85,82,69,65,67,67,69,83,83,95,84,65,82,71,69,84,0,85,110,115,117,112,112,111,114,116,101,100,32,89,85,86,32,102,111,114,109,97,116,0,89,86,49,50,32,97,110,100,32,73,89,85,86,32,116,101,120,116,117,114,101,115,32,111,110,108,121,32,115,117,112,112,111,114,116,32,102,117,108,108,32,115,117,114,102,97,99,101,32,108,111,99,107,115,0,73,110,118,97,108,105,100,32,116,97,114,103,101,116,32,112,105,120,101,108,32,102,111,114,109,97,116,0,85,110,115,117,112,112,111,114,116,101,100,32,89,85,86,32,100,101,115,116,105,110,97,116,105,111,110,32,102,111,114,109,97,116,0,85,110,115,117,112,112,111,114,116,101,100,32,89,85,86,32,102,111,114,109,97,116,32,105,110,32,99,111,112,121,0,83,68,76,95,66,108,101,110,100,70,105,108,108,82,101,99,116,115,40,41,58,32,85,110,115,117,112,112,111,114,116,101,100,32,115,117,114,102,97,99,101,32,102,111,114,109,97,116,0,83,68,76,95,66,108,101,110,100,76,105,110,101,115,40,41,58,32,80,97,115,115,101,100,32,78,85,76,76,32,100,101,115,116,105,110,97,116,105,111,110,32,115,117,114,102,97,99,101,0,83,68,76,95,66,108,101,110,100,76,105,110,101,115,40,41,58,32,85,110,115,117,112,112,111,114,116,101,100,32,115,117,114,102,97,99,101,32,102,111,114,109,97,116,0,83,68,76,95,66,108,101,110,100,80,111,105,110,116,40,41,58,32,85,110,115,117,112,112,111,114,116,101,100,32,115,117,114,102,97,99,101,32,102,111,114,109,97,116,0,83,68,76,95,66,108,101,110,100,80,111,105,110,116,115,40,41,58,32,85,110,115,117,112,112,111,114,116,101,100,32,115,117,114,102,97,99,101,32,102,111,114,109,97,116,0,83,68,76,95,68,114,97,119,76,105,110,101,115,40,41,58,32,80,97,115,115,101,100,32,78,85,76,76,32,100,101,115,116,105,110,97,116,105,111,110,32,115,117,114,102,97,99,101,0,83,68,76,95,68,114,97,119,76,105,110,101,115,40,41,58,32,85,110,115,117,112,112,111,114,116,101,100,32,115,117,114,102,97,99,101,32,102,111,114,109,97,116,0,83,68,76,95,68,114,97,119,80,111,105,110,116,40,41,58,32,85,110,115,117,112,112,111,114,116,101,100,32,115,117,114,102,97,99,101,32,102,111,114,109,97,116,0,83,68,76,95,68,114,97,119,80,111,105,110,116,115,40,41,58,32,85,110,115,117,112,112,111,114,116,101,100,32,115,117,114,102,97,99,101,32,102,111,114,109,97,116,0,67,97,110,39,116,32,99,114,101,97,116,101,32,114,101,110,100,101,114,101,114,32,102,111,114,32,78,85,76,76,32,115,117,114,102,97,99,101,0,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,105,100,0,83,68,76,84,105,109,101,114,0,83,68,76,95,66,76,73,84,95,67,80,85,95,70,69,65,84,85,82,69,83,0,37,117,0,66,108,105,116,32,99,111,109,98,105,110,97,116,105,111,110,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,37,100,32,98,112,112,32,66,77,80,32,102,105,108,101,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,67,111,117,108,100,110,39,116,32,99,111,110,118,101,114,116,32,105,109,97,103,101,32,116,111,32,37,100,32,98,112,112], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+61396);
/* memory initializer */ allocate([67,111,117,108,100,110,39,116,32,102,105,110,100,32,109,97,116,99,104,105,110,103,32,69,71,76,32,99,111,110,102,105,103,0,67,111,117,108,100,32,110,111,116,32,99,114,101,97,116,101,32,69,71,76,32,99,111,110,116,101,120,116,0,79,112,101,110,71,76,32,110,111,116,32,105,110,105,116,105,97,108,105,122,101,100,0,85,110,97,98,108,101,32,116,111,32,109,97,107,101,32,69,71,76,32,99,111,110,116,101,120,116,32,99,117,114,114,101,110,116,0,67,111,117,108,100,32,110,111,116,32,109,97,107,101,32,69,71,76,32,99,111,110,116,101,120,116,32,99,117,114,114,101,110,116,0,69,71,76,32,110,111,116,32,105,110,105,116,105,97,108,105,122,101,100,0,85,110,97,98,108,101,32,116,111,32,115,101,116,32,116,104,101,32,69,71,76,32,115,119,97,112,32,105,110,116,101,114,118,97,108,0,80,97,115,115,101,100,32,78,85,76,76,32,100,101,115,116,105,110,97,116,105,111,110,32,115,117,114,102,97,99,101,0,83,68,76,95,70,105,108,108,82,101,99,116,40,41,58,32,85,110,115,117,112,112,111,114,116,101,100,32,115,117,114,102,97,99,101,32,102,111,114,109,97,116,0,83,68,76,95,70,105,108,108,82,101,99,116,40,41,58,32,89,111,117,32,109,117,115,116,32,108,111,99,107,32,116,104,101,32,115,117,114,102,97,99,101,0,83,68,76,95,70,105,108,108,82,101,99,116,115,40,41,32,112,97,115,115,101,100,32,78,85,76,76,32,114,101,99,116,115,0,70,79,85,82,67,67,32,112,105,120,101,108,32,102,111,114,109,97,116,115,32,97,114,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,102,111,114,109,97,116,0,112,97,108,101,116,116,101,0,110,99,111,108,111,114,115,0,83,68,76,95,83,101,116,80,105,120,101,108,70,111,114,109,97,116,80,97,108,101,116,116,101,40,41,32,112,97,115,115,101,100,32,78,85,76,76,32,102,111,114,109,97,116,0,83,68,76,95,83,101,116,80,105,120,101,108,70,111,114,109,97,116,80,97,108,101,116,116,101,40,41,32,112,97,115,115,101,100,32,97,32,112,97,108,101,116,116,101,32,116,104,97,116,32,100,111,101,115,110,39,116,32,109,97,116,99,104,32,116,104,101,32,102,111,114,109,97,116,0,65,0,66,0,114,101,115,117,108,116,0,112,111,105,110,116,115,0,99,111,117,110,116,0,114,101,99,116,0,88,49,0,89,49,0,88,50,0,89,50,0,119,105,100,116,104,0,104,101,105,103,104,116,0,114,101,99,116,115,0,115,112,97,110,0,110,117,109,114,101,99,116,115,0,79,110,108,121,32,119,111,114,107,115,32,119,105,116,104,32,115,97,109,101,32,102,111,114,109,97,116,32,115,117,114,102,97,99,101,115,0,73,110,118,97,108,105,100,32,115,111,117,114,99,101,32,98,108,105,116,32,114,101,99,116,97,110,103,108,101,0,73,110,118,97,108,105,100,32,100,101,115,116,105,110,97,116,105,111,110,32,98,108,105,116,32,114,101,99,116,97,110,103,108,101,0,85,110,97,98,108,101,32,116,111,32,108,111,99,107,32,100,101,115,116,105,110,97,116,105,111,110,32,115,117,114,102,97,99,101,0,85,110,97,98,108,101,32,116,111,32,108,111,99,107,32,115,111,117,114,99,101,32,115,117,114,102,97,99,101,0,85,110,107,110,111,119,110,32,112,105,120,101,108,32,102,111,114,109,97,116,0,115,117,114,102,97,99,101,0,107,101,121,0,83,68,76,95,85,112,112,101,114,66,108,105,116,58,32,112,97,115,115,101,100,32,97,32,78,85,76,76,32,115,117,114,102,97,99,101,0,83,117,114,102,97,99,101,115,32,109,117,115,116,32,110,111,116,32,98,101,32,108,111,99,107,101,100,32,100,117,114,105,110,103,32,98,108,105,116,0,83,68,76,95,85,112,112,101,114,66,108,105,116,83,99,97,108,101,100,58,32,112,97,115,115,101,100,32,97,32,78,85,76,76,32,115,117,114,102,97,99,101,0,69,109,112,116,121,32,100,101,115,116,105,110,97,116,105,111,110,32,112,97,108,101,116,116,101,0,100,115,116,0,100,115,116,95,112,105,116,99,104,0,85,110,107,110,111,119,110,32,70,79,85,82,67,67,32,112,105,120,101,108,32,102,111,114,109,97,116,0,73,110,100,101,120,101,100,32,112,105,120,101,108,32,102,111,114,109,97,116,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,37,115,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,78,111,32,97,118,97,105,108,97,98,108,101,32,118,105,100,101,111,32,100,101,118,105,99,101,0,84,104,101,32,118,105,100,101,111,32,100,114,105,118,101,114,32,100,105,100,32,110,111,116,32,97,100,100,32,97,110,121,32,100,105,115,112,108,97,121,115,0,83,68,76,95,82,69,78,68,69,82,95,68,82,73,86,69,82,0,83,68,76,95,70,82,65,77,69,66,85,70,70,69,82,95,65,67,67,69,76,69,82,65,84,73,79,78,0,83,68,76,95,86,73,68,69,79,95,65,76,76,79,87,95,83,67,82,69,69,78,83,65,86,69,82,0,86,105,100,101,111,32,115,117,98,115,121,115,116,101,109,32,104,97,115,32,110,111,116,32,98,101,101,110,32,105,110,105,116,105,97,108,105,122,101,100,0,100,105,115,112,108,97,121,73,110,100,101,120,32,109,117,115,116,32,98,101,32,105,110,32,116,104,101,32,114,97,110,103,101,32,48,32,45,32,37,100,0,73,110,118,97,108,105,100,32,119,105,110,100,111,119,0,67,111,117,108,100,110,39,116,32,102,105,110,100,32,97,110,121,32,100,105,115,112,108,97,121,115,0,80,97,114,97,109,101,116,101,114,32,39,37,115,39,32,105,115,32,105,110,118,97,108,105,100,0,109,111,100,101,0,67,111,117,108,100,110,39,116,32,102,105,110,100,32,100,105,115,112,108,97,121,32,109,111,100,101,32,109,97,116,99,104,0,78,111,32,79,112,101,110,71,76,32,115,117,112,112,111,114,116,32,105,110,32,118,105,100,101,111,32,100,114,105,118,101,114,0,78,111,32,100,121,110,97,109,105,99,32,71,76,32,115,117,112,112,111,114,116,32,105,110,32,118,105,100,101,111,32,100,114,105,118,101,114,0,83,68,76,95,86,73,68,69,79,95,72,73,71,72,68,80,73,95,68,73,83,65,66,76,69,68,0,79,112,101,110,71,76,32,108,105,98,114,97,114,121,32,97,108,114,101,97,100,121,32,108,111,97,100,101,100,0,110,97,109,101,0,87,105,110,100,111,119,32,115,117,114,102,97,99,101,32,105,115,32,105,110,118,97,108,105,100,44,32,112,108,101,97,115,101,32,99,97,108,108,32,83,68,76,95,71,101,116,87,105,110,100,111,119,83,117,114,102,97,99,101,40,41,32,116,111,32,103,101,116,32,97,32,110,101,119,32,115,117,114,102,97,99,101,0,84,104,101,32,115,112,101,99,105,102,105,101,100,32,119,105,110,100,111,119,32,105,115,110,39,116,32,97,110,32,79,112,101,110,71,76,32,119,105,110,100,111,119,0,78,111,32,71,76,32,100,114,105,118,101,114,32,104,97,115,32,98,101,101,110,32,108,111,97,100,101,100,0,85,110,107,110,111,119,110,32,79,112,101,110,71,76,32,99,111,110,116,101,120,116,32,102,108,97,103,32,37,100,0,85,110,107,110,111,119,110,32,79,112,101,110,71,76,32,99,111,110,116,101,120,116,32,112,114,111,102,105,108,101,32,37,100,0,85,110,107,110,111,119,110,32,79,112,101,110,71,76,32,97,116,116,114,105,98,117,116,101,0,79,112,101,110,71,76,32,101,114,114,111,114,58,32,71,76,95,73,78,86,65,76,73,68,95,69,78,85,77,0,79,112,101,110,71,76,32,101,114,114,111,114,58,32,71,76,95,73,78,86,65,76,73,68,95,86,65,76,85,69,0,79,112,101,110,71,76,32,101,114,114,111,114,58,32,37,48,56,88,0,78,111,32,79,112,101,110,71,76,32,99,111,110,116,101,120,116,32,104,97,115,32,98,101,101,110,32,109,97,100,101,32,99,117,114,114,101,110,116,0,83,101,116,116,105,110,103,32,116,104,101,32,115,119,97,112,32,105,110,116,101,114,118,97,108,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,84,104,101,32,115,112,101,99,105,102,105,101,100,32,119,105,110,100,111,119,32,104,97,115,32,110,111,116,32,98,101,101,110,32,109,97,100,101,32,99,117,114,114,101,110,116,0,35,99,97,110,118,97,115,0,35,100,111,99,117,109,101,110,116,0,35,119,105,110,100,111,119,0,83,68,76,95,69,77,83,67,82,73,80,84,69,78,95,75,69,89,66,79,65,82,68,95,69,76,69,77,69,78,84,0,67,111,117,108,100,110,39,116,32,102,105,110,100,32,102,114,97,109,101,98,117,102,102,101,114,32,115,117,114,102,97,99,101,32,102,111,114,32,119,105,110,100,111,119,0,123,32,118,97,114,32,119,32,61,32,36,48,59,32,118,97,114,32,104,32,61,32,36,49,59,32,118,97,114,32,112,105,120,101,108,115,32,61,32,36,50,59,32,105,102,32,40,33,77,111,100,117,108,101,91,39,83,68,76,50,39,93,41,32,77,111,100,117,108,101,91,39,83,68,76,50,39,93,32,61,32,123,125,59,32,118,97,114,32,83,68,76,50,32,61,32,77,111,100,117,108,101,91,39,83,68,76,50,39,93,59,32,105,102,32,40,83,68,76,50,46,99,116,120,67,97,110,118,97,115,32,33,61,61,32,77,111,100,117,108,101,91,39,99,97,110,118,97,115,39,93,41,32,123,32,83,68,76,50,46,99,116,120,32,61,32,77,111,100,117,108,101,91,39,99,114,101,97,116,101,67,111,110,116,101,120,116,39,93,40,77,111,100,117,108,101,91,39,99,97,110,118,97,115,39,93,44,32,102,97,108,115,101,44,32,116,114,117,101,41,59,32,83,68,76,50,46,99,116,120,67,97,110,118,97,115,32,61,32,77,111,100,117,108,101,91,39,99,97,110,118,97,115,39,93,59,32,125,32,105,102,32,40,83,68,76,50,46,119,32,33,61,61,32,119,32,124,124,32,83,68,76,50,46,104,32,33,61,61,32,104,32,124,124,32,83,68,76,50,46,105,109,97,103,101,67,116,120,32,33,61,61,32,83,68,76,50,46,99,116,120,41,32,123,32,83,68,76,50,46,105,109,97,103,101,32,61,32,83,68,76,50,46,99,116,120,46,99,114,101,97,116,101,73,109,97,103,101,68,97,116,97,40,119,44,32,104,41,59,32,83,68,76,50,46,119,32,61,32,119,59,32,83,68,76,50,46,104,32,61,32,104,59,32,83,68,76,50,46,105,109,97,103,101,67,116,120,32,61,32,83,68,76,50,46,99,116,120,59,32,125,32,118,97,114,32,100,97,116,97,32,61,32,83,68,76,50,46,105,109,97,103,101,46,100,97,116,97,59,32,118,97,114,32,115,114,99,32,61,32,112,105,120,101,108,115,32,62,62,32,50,59,32,118,97,114,32,100,115,116,32,61,32,48,59,32,118,97,114,32,110,117,109,59,32,105,102,32,40,116,121,112,101,111,102,32,67,97,110,118,97,115,80,105,120,101,108,65,114,114,97,121,32,33,61,61,32,39,117,110,100,101,102,105,110,101,100,39,32,38,38,32,100,97,116,97,32,105,110,115,116,97,110,99,101,111,102,32,67,97,110,118,97,115,80,105,120,101,108,65,114,114,97,121,41,32,123,32,110,117,109,32,61,32,100,97,116,97,46,108,101,110,103,116,104,59,32,119,104,105,108,101,32,40,100,115,116,32,60,32,110,117,109,41,32,123,32,118,97,114,32,118,97,108,32,61,32,72,69,65,80,51,50,91,115,114,99,93,59,32,100,97,116,97,91,100,115,116,32,93,32,61,32,118,97,108,32,38,32,48,120,102,102,59,32,100,97,116,97,91,100,115,116,43,49,93,32,61,32,40,118,97,108,32,62,62,32,56,41,32,38,32,48,120,102,102,59,32,100,97,116,97,91,100,115,116,43,50,93,32,61,32,40,118,97,108,32,62,62,32,49,54,41,32,38,32,48,120,102,102,59,32,100,97,116,97,91,100,115,116,43,51,93,32,61,32,48,120,102,102,59,32,115,114,99,43,43,59,32,100,115,116,32,43,61,32,52,59,32,125,32,125,32,101,108,115,101,32,123,32,105,102,32,40,83,68,76,50,46,100,97,116,97,51,50,68,97,116,97,32,33,61,61,32,100,97,116,97,41,32,123,32,83,68,76,50,46,100,97,116,97,51,50,32,61,32,110,101,119,32,73,110,116,51,50,65,114,114,97,121,40,100,97,116,97,46,98,117,102,102,101,114,41,59,32,83,68,76,50,46,100,97,116,97,56,32,61,32,110,101,119,32,85,105,110,116,56,65,114,114,97,121,40,100,97,116,97,46,98,117,102,102,101,114,41,59,32,125,32,118,97,114,32,100,97,116,97,51,50,32,61,32,83,68,76,50,46,100,97,116,97,51,50,59,32,110,117,109,32,61,32,100,97,116,97,51,50,46,108,101,110,103,116,104,59,32,100,97,116,97,51,50,46,115,101,116,40,72,69,65,80,51,50,46,115,117,98,97,114,114,97,121,40,115,114,99,44,32,115,114,99,32,43,32,110,117,109,41,41,59,32,118,97,114,32,100,97,116,97,56,32,61,32,83,68,76,50,46,100,97,116,97,56,59,32,118,97,114,32,105,32,61,32,51,59,32,118,97,114,32,106,32,61,32,105,32,43,32,52,42,110,117,109,59,32,105,102,32,40,110,117,109,32,37,32,56,32,61,61,32,48,41,32,123,32,119,104,105,108,101,32,40,105,32,60,32,106,41,32,123,32,100,97,116,97,56,91,105,93,32,61,32,48,120,102,102,59,32,105,32,61,32,105,32,43,32,52,32,124,32,48,59,32,100,97,116,97,56,91,105,93,32,61,32,48,120,102,102,59,32,105,32,61,32,105,32,43,32,52,32,124,32,48,59,32,100,97,116,97,56,91,105,93,32,61,32,48,120,102,102,59,32,105,32,61,32,105,32,43,32,52,32,124,32,48,59,32,100,97,116,97,56,91,105,93,32,61,32,48,120,102,102,59,32,105,32,61,32,105,32,43,32,52,32,124,32,48,59,32,100,97,116,97,56,91,105,93,32,61,32,48,120,102,102,59,32,105,32,61,32,105,32,43,32,52,32,124,32,48,59,32,100,97,116,97,56,91,105,93,32,61,32,48,120,102,102,59,32,105,32,61,32,105,32,43,32,52,32,124,32,48,59,32,100,97,116,97,56,91,105,93,32,61,32,48,120,102,102,59,32,105,32,61,32,105,32,43,32,52,32,124,32,48,59,32,100,97,116,97,56,91,105,93,32,61,32,48,120,102,102,59,32,105,32,61,32,105,32,43,32,52,32,124,32,48,59,32,125,32,125,32,101,108,115,101,32,123,32,119,104,105,108,101,32,40,105,32,60,32,106,41,32,123,32,100,97,116,97,56,91,105,93,32,61,32,48,120,102,102,59,32,105,32,61,32,105,32,43,32,52,32,124,32,48,59,32,125,32,125,32,125,32,83,68,76,50,46,99,116,120,46,112,117,116,73,109,97,103,101,68,97,116,97,40,83,68,76,50,46,105,109,97,103,101,44,32,48,44,32,48,41,59,32,114,101,116,117,114,110,32,48,59,32,125,0,100,101,102,97,117,108,116,0,67,111,117,108,100,32,110,111,116,32,103,101,116,32,69,71,76,32,100,105,115,112,108,97,121,0,67,111,117,108,100,32,110,111,116,32,105,110,105,116,105,97,108,105,122,101,32,69,71,76,0,95,83,68,76,95,68,117,109,109,121,83,117,114,102,97,99,101,0,67,111,117,108,100,110,39,116,32,102,105,110,100,32,100,117,109,109,121,32,115,117,114,102,97,99,101,32,102,111,114,32,119,105,110,100,111,119,0,83,68,76,95,86,73,68,69,79,95,68,85,77,77,89,95,83,65,86,69,95,70,82,65,77,69,83,0,83,68,76,95,119,105,110,100,111,119,37,100,45,37,56,46,56,100,46,98,109,112,0,70,97,105,108,101,100,32,108,111,97,100,105,110,103,32,37,115,58,32,37,115,0,83,68,76,32,110,111,116,32,98,117,105,108,116,32,119,105,116,104,32,116,104,114,101,97,100,32,115,117,112,112,111,114,116,0,84,104,114,101,97,100,115,32,97,114,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,111,110,32,116,104,105,115,32,112,108,97,116,102,111,114,109,0,111,112,101,110,103,108,101,115,50,0,115,111,102,116,119,97,114,101,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,88,90,92,94,96,98,100,102,104,106,108,110,112,114,116,118,120,122,124,126,128,130,132,134,136,138,140,142,144,146,148,150,152,154,156,158,160,162,164,166,168,170,172,174,176,178,180,182,184,186,188,190,192,194,196,198,200,202,204,206,208,210,212,214,216,218,220,222,224,226,228,230,232,234,236,238,240,242,244,246,248,250,252,255,0,4,8,12,16,20,24,28,32,36,40,44,48,52,56,60,64,68,72,76,80,85,89,93,97,101,105,109,113,117,121,125,129,133,137,141,145,149,153,157,161,165,170,174,178,182,186,190,194,198,202,206,210,214,218,222,226,230,234,238,242,246,250,255,0,8,16,24,32,41,49,57,65,74,82,90,98,106,115,123,131,139,148,156,164,172,180,189,197,205,213,222,230,238,246,255,0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255,0,36,72,109,145,182,218,255,0,85,170,255,0,255,255,83,68,76,32,101,109,115,99,114,105,112,116,101,110,32,118,105,100,101,111,32,100,114,105,118,101,114,0,101,109,115,99,114,105,112,116,101,110,0,83,68,76,32,101,109,115,99,114,105,112,116,101,110,32,97,117,100,105,111,32,100,114,105,118,101,114,0,83,68,76,32,100,117,109,109,121,32,118,105,100,101,111,32,100,114,105,118,101,114,0,100,105,115,107,0,100,105,114,101,99,116,45,116,111,45,100,105,115,107,32,97,117,100,105,111,0,100,117,109,109,121,0,83,68,76,32,100,117,109,109,121,32,97,117,100,105,111,32,100,114,105,118,101,114,0,83,68,76,95,68,73,83,75,65,85,68,73,79,68,69,76,65,89,0,83,68,76,95,68,73,83,75,65,85,68,73,79,70,73,76,69,0,115,100,108,97,117,100,105,111,46,114,97,119,0,119,98,0,87,65,82,78,73,78,71,58,32,89,111,117,32,97,114,101,32,117,115,105,110,103,32,116,104,101,32,83,68,76,32,100,105,115,107,32,119,114,105,116,101,114,32,97,117,100,105,111,32,100,114,105,118,101,114,33,10,32,87,114,105,116,105,110,103,32,116,111,32,102,105,108,101,32,91,37,115,93,46,10,0,83,68,76,95,86,73,68,69,79,68,82,73,86,69,82,0,123,32,105,102,32,40,116,121,112,101,111,102,40,65,117,100,105,111,67,111,110,116,101,120,116,41,32,33,61,61,32,39,117,110,100,101,102,105,110,101,100,39,41,32,123,32,114,101,116,117,114,110,32,49,59,32,125,32,101,108,115,101,32,105,102,32,40,116,121,112,101,111,102,40,119,101,98,107,105,116,65,117,100,105,111,67,111,110,116,101,120,116,41,32,33,61,61,32,39,117,110,100,101,102,105,110,101,100,39,41,32,123,32,114,101,116,117,114,110,32,49,59,32,125,32,114,101,116,117,114,110,32,48,59,32,125,0,78,111,32,99,111,109,112,97,116,105,98,108,101,32,97,117,100,105,111,32,102,111,114,109,97,116,33,0,123,32,105,102,40,116,121,112,101,111,102,40,83,68,76,50,41,32,61,61,61,32,39,117,110,100,101,102,105,110,101,100,39,41,32,83,68,76,50,32,61,32,123,125,59,32,105,102,40,116,121,112,101,111,102,40,83,68,76,50,46,97,117,100,105,111,41,32,61,61,61,32,39,117,110,100,101,102,105,110,101,100,39,41,32,83,68,76,50,46,97,117,100,105,111,32,61,32,123,125,59,32,105,102,32,40,33,83,68,76,50,46,97,117,100,105,111,67,111,110,116,101,120,116,41,32,123,32,105,102,32,40,116,121,112,101,111,102,40,65,117,100,105,111,67,111,110,116,101,120,116,41,32,33,61,61,32,39,117,110,100,101,102,105,110,101,100,39,41,32,123,32,83,68,76,50,46,97,117,100,105,111,67,111,110,116,101,120,116,32,61,32,110,101,119,32,65,117,100,105,111,67,111,110,116,101,120,116,40,41,59,32,125,32,101,108,115,101,32,105,102,32,40,116,121,112,101,111,102,40,119,101,98,107,105,116,65,117,100,105,111,67,111,110,116,101,120,116,41,32,33,61,61,32,39,117,110,100,101,102,105,110,101,100,39,41,32,123,32,83,68,76,50,46,97,117,100,105,111,67,111,110,116,101,120,116,32,61,32,110,101,119,32,119,101,98,107,105,116,65,117,100,105,111,67,111,110,116,101,120,116,40,41,59,32,125,32,101,108,115,101,32,123,32,114,101,116,117,114,110,32,45,49,59,32,125,32,125,32,114,101,116,117,114,110,32,48,59,32,125,0,87,101,98,32,65,117,100,105,111,32,65,80,73,32,105,115,32,110,111,116,32,97,118,97,105,108,97,98,108,101,33,0,123,32,114,101,116,117,114,110,32,83,68,76,50,46,97,117,100,105,111,67,111,110,116,101,120,116,91,39,115,97,109,112,108,101,82,97,116,101,39,93,59,32,125,0,123,32,83,68,76,50,46,97,117,100,105,111,46,115,99,114,105,112,116,80,114,111,99,101,115,115,111,114,78,111,100,101,32,61,32,83,68,76,50,46,97,117,100,105,111,67,111,110,116,101,120,116,91,39,99,114,101,97,116,101,83,99,114,105,112,116,80,114,111,99,101,115,115,111,114,39,93,40,36,49,44,32,48,44,32,36,48,41,59,32,83,68,76,50,46,97,117,100,105,111,46,115,99,114,105,112,116,80,114,111,99,101,115,115,111,114,78,111,100,101,91,39,111,110,97,117,100,105,111,112,114,111,99,101,115,115,39,93,32,61,32,102,117,110,99,116,105,111,110,32,40,101,41,32,123,32,83,68,76,50,46,97,117,100,105,111,46,99,117,114,114,101,110,116,79,117,116,112,117,116,66,117,102,102,101,114,32,61,32,101,91,39,111,117,116,112,117,116,66,117,102,102,101,114,39,93,59,32,82,117,110,116,105,109,101,46,100,121,110,67,97,108,108,40,39,118,105,39,44,32,36,50,44,32,91,36,51,93,41,59,32,125,59,32,83,68,76,50,46,97,117,100,105,111,46,115,99,114,105,112,116,80,114,111,99,101,115,115,111,114,78,111,100,101,91,39,99,111,110,110,101,99,116,39,93,40,83,68,76,50,46,97,117,100,105,111,67,111,110,116,101,120,116,91,39,100,101,115,116,105,110,97,116,105,111,110,39,93,41,59,32,125,0,123,32,118,97,114,32,110,117,109,67,104,97,110,110,101,108,115,32,61,32,83,68,76,50,46,97,117,100,105,111,46,99,117,114,114,101,110,116,79,117,116,112,117,116,66,117,102,102,101,114,91,39,110,117,109,98,101,114,79,102,67,104,97,110,110,101,108,115,39,93,59,32,102,111,114,32,40,118,97,114,32,99,32,61,32,48,59,32,99,32,60,32,110,117,109,67,104,97,110,110,101,108,115,59,32,43,43,99,41,32,123,32,118,97,114,32,99,104,97,110,110,101,108,68,97,116,97,32,61,32,83,68,76,50,46,97,117,100,105,111,46,99,117,114,114,101,110,116,79,117,116,112,117,116,66,117,102,102,101,114,91,39,103,101,116,67,104,97,110,110,101,108,68,97,116,97,39,93,40,99,41,59,32,105,102,32,40,99,104,97,110,110,101,108,68,97,116,97,46,108,101,110,103,116,104,32,33,61,32,36,49,41,32,123,32,116,104,114,111,119,32,39,87,101,98,32,65,117,100,105,111,32,111,117,116,112,117,116,32,98,117,102,102,101,114,32,108,101,110,103,116,104,32,109,105,115,109,97,116,99,104,33,32,68,101,115,116,105,110,97,116,105,111,110,32,115,105,122,101,58,32,39,32,43,32,99,104,97,110,110,101,108,68,97,116,97,46,108,101,110,103,116,104,32,43,32,39,32,115,97,109,112,108,101,115,32,118,115,32,101,120,112,101,99,116,101,100,32,39,32,43,32,36,49,32,43,32,39,32,115,97,109,112,108,101,115,33,39,59,32,125,32,102,111,114,32,40,118,97,114,32,106,32,61,32,48,59,32,106,32,60,32,36,49,59,32,43,43,106,41,32,123,32,99,104,97,110,110,101,108,68,97,116,97,91,106,93,32,61,32,72,69,65,80,70,51,50,91,36,48,32,43,32,40,40,106,42,110,117,109,67,104,97,110,110,101,108,115,32,43,32,99,41,32,60,60,32,50,41,32,62,62,32,50,93,59,32,125,32,125,32,125,0,83,68,76,95,86,73,68,69,79,95,77,73,78,73,77,73,90,69,95,79,78,95,70,79,67,85,83,95,76,79,83,83,0,48,0,123,32,105,102,32,40,116,121,112,101,111,102,32,77,111,100,117,108,101,91,39,115,101,116,87,105,110,100,111,119,84,105,116,108,101,39,93,32,33,61,61,32,39,117,110,100,101,102,105,110,101,100,39,41,32,123,32,77,111,100,117,108,101,91,39,115,101,116,87,105,110,100,111,119,84,105,116,108,101,39,93,40,77,111,100,117,108,101,91,39,80,111,105,110,116,101,114,95,115,116,114,105,110,103,105,102,121,39,93,40,36,48,41,41,59,32,125,32,114,101,116,117,114,110,32,48,59,32,125,0,67,111,117,108,100,32,110,111,116,32,99,114,101,97,116,101,32,71,76,69,83,32,119,105,110,100,111,119,32,115,117,114,102,97,99,101,0,123,32,114,101,116,117,114,110,32,115,99,114,101,101,110,46,119,105,100,116,104,59,32,125,0,123,32,114,101,116,117,114,110,32,115,99,114,101,101,110,46,104,101,105,103,104,116,59,32,125,0,67,111,117,108,100,110,39,116,32,108,111,97,100,32,71,76,69,83,50,32,102,117,110,99,116,105,111,110,32,37,115,58,32,37,115,10,0,85,78,75,78,79,87,78,0,71,76,95,79,85,84,95,79,70,95,77,69,77,79,82,89,0,71,76,95,73,78,86,65,76,73,68,95,79,80,69,82,65,84,73,79,78,0,71,76,95,73,78,86,65,76,73,68,95,86,65,76,85,69,0,71,76,95,73,78,86,65,76,73,68,95,69,78,85,77,0,37,115,58,32,37,115,32,40,37,100,41,58,32,37,115,32,37,115,32,40,48,120,37,88,41,0,67,58,92,85,115,101,114,115,92,122,97,112,111,108,95,48,48,48,92,46,101,109,115,99,114,105,112,116,101,110,95,112,111,114,116,115,92,115,100,108,50,92,83,68,76,50,45,118,101,114,115,105,111,110,95,57,92,115,114,99,92,114,101,110,100,101,114,47,111,112,101,110,103,108,101,115,50,47,83,68,76,95,114,101,110,100,101,114,95,103,108,101,115,50,46,99,0,118,111,105,100,32,71,76,69,83,50,95,82,101,115,101,116,83,116,97,116,101,40,83,68,76,95,82,101,110,100,101,114,101,114,32,42,41,0,103,108,82,101,97,100,80,105,120,101,108,115,40,41,0,105,110,116,32,71,76,69,83,50,95,82,101,110,100,101,114,82,101,97,100,80,105,120,101,108,115,40,83,68,76,95,82,101,110,100,101,114,101,114,32,42,44,32,99,111,110,115,116,32,83,68,76,95,82,101,99,116,32,42,44,32,85,105,110,116,51,50,44,32,118,111,105,100,32,42,44,32,105,110,116,41,0,105,110,116,32,71,76,69,83,50,95,82,101,110,100,101,114,67,111,112,121,69,120,40,83,68,76,95,82,101,110,100,101,114,101,114,32,42,44,32,83,68,76,95,84,101,120,116,117,114,101,32,42,44,32,99,111,110,115,116,32,83,68,76,95,82,101,99,116,32,42,44,32,99,111,110,115,116,32,83,68,76,95,70,82,101,99,116,32,42,44,32,99,111,110,115,116,32,100,111,117,98,108,101,44,32,99,111,110,115,116,32,83,68,76,95,70,80,111,105,110,116,32,42,44,32,99,111,110,115,116,32,83,68,76,95,82,101,110,100,101,114,101,114,70,108,105,112,41,0,85,110,115,117,112,112,111,114,116,101,100,32,116,101,120,116,117,114,101,32,102,111,114,109,97,116,0,97,95,112,111,115,105,116,105,111,110,0,97,95,116,101,120,67,111,111,114,100,0,97,95,97,110,103,108,101,0,97,95,99,101,110,116,101,114,0,70,97,105,108,101,100,32,116,111,32,108,105,110,107,32,115,104,97,100,101,114,32,112,114,111,103,114,97,109,0,117,95,112,114,111,106,101,99,116,105,111,110,0,117,95,116,101,120,116,117,114,101,95,118,0,117,95,116,101,120,116,117,114,101,95,117,0,117,95,116,101,120,116,117,114,101,0,117,95,109,111,100,117,108,97,116,105,111,110,0,117,95,99,111,108,111,114,0,78,111,32,115,104,97,100,101,114,32,109,97,116,99,104,105,110,103,32,116,104,101,32,114,101,113,117,101,115,116,101,100,32,99,104,97,114,97,99,116,101,114,105,115,116,105,99,115,32,119,97,115,32,102,111,117,110,100,0,84,104,101,32,115,112,101,99,105,102,105,101,100,32,115,104,97,100,101,114,32,99,97,110,110,111,116,32,98,101,32,108,111,97,100,101,100,32,111,110,32,116,104,101,32,99,117,114,114,101,110,116,32,112,108,97,116,102,111,114,109,0,70,97,105,108,101,100,32,116,111,32,108,111,97,100,32,116,104,101,32,115,104,97,100,101,114,58,32,37,115,0,70,97,105,108,101,100,32,116,111,32,108,111,97,100,32,116,104,101,32,115,104,97,100,101,114,0,105,110,116,32,71,76,69,83,50,95,82,101,110,100,101,114,67,111,112,121,40,83,68,76,95,82,101,110,100,101,114,101,114,32,42,44,32,83,68,76,95,84,101,120,116,117,114,101,32,42,44,32,99,111,110,115,116,32,83,68,76,95,82,101,99,116,32,42,44,32,99,111,110,115,116,32,83,68,76,95,70,82,101,99,116,32,42,41,0,105,110,116,32,71,76,69,83,50,95,82,101,110,100,101,114,70,105,108,108,82,101,99,116,115,40,83,68,76,95,82,101,110,100,101,114,101,114,32,42,44,32,99,111,110,115,116,32,83,68,76,95,70,82,101,99,116,32,42,44,32,105,110,116,41,0,105,110,116,32,71,76,69,83,50,95,82,101,110,100,101,114,68,114,97,119,76,105,110,101,115,40,83,68,76,95,82,101,110,100,101,114,101,114,32,42,44,32,99,111,110,115,116,32,83,68,76,95,70,80,111,105,110,116,32,42,44,32,105,110,116,41,0,105,110,116,32,71,76,69,83,50,95,85,112,100,97,116,101,86,105,101,119,112,111,114,116,40,83,68,76,95,82,101,110,100,101,114,101,114,32,42,41,0,103,108,70,114,97,109,101,98,117,102,102,101,114,84,101,120,116,117,114,101,50,68,40,41,32,102,97,105,108,101,100,0,103,108,84,101,120,83,117,98,73,109,97,103,101,50,68,40,41,0,105,110,116,32,71,76,69,83,50,95,85,112,100,97,116,101,84,101,120,116,117,114,101,89,85,86,40,83,68,76,95,82,101,110,100,101,114,101,114,32,42,44,32,83,68,76,95,84,101,120,116,117,114,101,32,42,44,32,99,111,110,115,116,32,83,68,76,95,82,101,99,116,32,42,44,32,99,111,110,115,116,32,85,105,110,116,56,32,42,44,32,105,110,116,44,32,99,111,110,115,116,32,85,105,110,116,56,32,42,44,32,105,110,116,44,32,99,111,110,115,116,32,85,105,110,116,56,32,42,44,32,105,110,116,41,0,105,110,116,32,71,76,69,83,50,95,85,112,100,97,116,101,84,101,120,116,117,114,101,40,83,68,76,95,82,101,110,100,101,114,101,114,32,42,44,32,83,68,76,95,84,101,120,116,117,114,101,32,42,44,32,99,111,110,115,116,32,83,68,76,95,82,101,99,116,32,42,44,32,99,111,110,115,116,32,118,111,105,100,32,42,44,32,105,110,116,41,0,84,101,120,116,117,114,101,32,102,111,114,109,97,116,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,105,110,116,32,71,76,69,83,50,95,67,114,101,97,116,101,84,101,120,116,117,114,101,40,83,68,76,95,82,101,110,100,101,114,101,114,32,42,44,32,83,68,76,95,84,101,120,116,117,114,101,32,42,41,0,103,108,71,101,110,84,101,120,117,114,101,115,40,41,0,103,108,84,101,120,73,109,97,103,101,50,68,40,41,0,118,111,105,100,32,71,76,69,83,50,95,68,101,115,116,114,111,121,82,101,110,100,101,114,101,114,40,83,68,76,95,82,101,110,100,101,114,101,114,32,42,41,0,112,111,105,110,116,101,114,0,110,111,116,45,97,108,108,111,119,101,100,0,110,115,45,114,101,115,105,122,101,0,101,119,45,114,101,115,105,122,101,0,110,101,115,119,45,114,101,115,105,122,101,0,110,119,115,101,45,114,101,115,105,122,101,0,112,114,111,103,114,101,115,115,0,99,114,111,115,115,104,97,105,114,0,119,97,105,116,0,116,101,120,116,0,123,32,105,102,32,40,77,111,100,117,108,101,91,39,99,97,110,118,97,115,39,93,41,32,123,32,77,111,100,117,108,101,91,39,99,97,110,118,97,115,39,93,46,115,116,121,108,101,91,39,99,117,114,115,111,114,39,93,32,61,32,77,111,100,117,108,101,91,39,80,111,105,110,116,101,114,95,115,116,114,105,110,103,105,102,121,39,93,40,36,48,41,59,32,125,32,114,101,116,117,114,110,32,48,59,32,125,0,105,102,32,40,77,111,100,117,108,101,91,39,99,97,110,118,97,115,39,93,41,32,123,32,77,111,100,117,108,101,91,39,99,97,110,118,97,115,39,93,46,115,116,121,108,101,91,39,99,117,114,115,111,114,39,93,32,61,32,39,110,111,110,101,39,59,32,125,0,86,105,100,101,111,32,100,114,105,118,101,114,32,100,111,101,115,110,39,116,32,115,117,112,112,111,114,116,32,99,104,97,110,103,105,110,103,32,100,105,115,112,108,97,121,32,109,111,100,101,0,78,111,32,118,105,100,101,111,32,109,111,100,101,32,108,97,114,103,101,32,101,110,111,117,103,104,32,102,111,114,32,37,100,120,37,100,0,77,105,115,115,105,110,103,32,100,101,115,105,114,101,100,32,109,111,100,101,32,111,114,32,99,108,111,115,101,115,116,32,109,111,100,101,32,112,97,114,97,109,101,116,101,114,0,95,83,68,76,95,87,105,110,100,111,119,84,101,120,116,117,114,101,68,97,116,97,0,78,111,32,119,105,110,100,111,119,32,116,101,120,116,117,114,101,32,100,97,116,97,0,78,111,32,104,97,114,100,119,97,114,101,32,97,99,99,101,108,101,114,97,116,101,100,32,114,101,110,100,101,114,101,114,115,32,97,118,97,105,108,97,98,108,101,0,84,114,105,101,100,32,116,111,32,114,101,97,100,32,111,117,116,115,105,100,101,32,111,102,32,115,117,114,102,97,99,101,32,98,111,117,110,100,115,0,83,68,76,95,82,69,78,68,69,82,95,83,67,65,76,69,95,81,85,65,76,73,84,89,0,110,101,97,114,101,115,116,0,85,110,107,110,111,119,110,32,116,101,120,116,117,114,101,32,102,111,114,109,97,116,0,83,111,102,116,119,97,114,101,32,114,101,110,100,101,114,101,114,32,100,111,101,115,110,39,116,32,104,97,118,101,32,97,110,32,111,117,116,112,117,116,32,115,117,114,102,97,99,101,0,32,32,32,32,32,112,114,101,99,105,115,105,111,110,32,109,101,100,105,117,109,112,32,102,108,111,97,116,59,32,32,32,32,32,117,110,105,102,111,114,109,32,115,97,109,112,108,101,114,50,68,32,117,95,116,101,120,116,117,114,101,59,32,32,32,32,32,117,110,105,102,111,114,109,32,118,101,99,52,32,117,95,109,111,100,117,108,97,116,105,111,110,59,32,32,32,32,32,118,97,114,121,105,110,103,32,118,101,99,50,32,118,95,116,101,120,67,111,111,114,100,59,32,32,32,32,32,32,32,32,32,118,111,105,100,32,109,97,105,110,40,41,32,32,32,32,32,123,32,32,32,32,32,32,32,32,32,118,101,99,52,32,97,98,103,114,32,61,32,116,101,120,116,117,114,101,50,68,40,117,95,116,101,120,116,117,114,101,44,32,118,95,116,101,120,67,111,111,114,100,41,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,61,32,97,98,103,114,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,46,97,32,61,32,49,46,48,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,42,61,32,117,95,109,111,100,117,108,97,116,105,111,110,59,32,32,32,32,32,125,32,0,32,32,32,32,32,112,114,101,99,105,115,105,111,110,32,109,101,100,105,117,109,112,32,102,108,111,97,116,59,32,32,32,32,32,117,110,105,102,111,114,109,32,115,97,109,112,108,101,114,50,68,32,117,95,116,101,120,116,117,114,101,59,32,32,32,32,32,117,110,105,102,111,114,109,32,118,101,99,52,32,117,95,109,111,100,117,108,97,116,105,111,110,59,32,32,32,32,32,118,97,114,121,105,110,103,32,118,101,99,50,32,118,95,116,101,120,67,111,111,114,100,59,32,32,32,32,32,32,32,32,32,118,111,105,100,32,109,97,105,110,40,41,32,32,32,32,32,123,32,32,32,32,32,32,32,32,32,118,101,99,52,32,97,98,103,114,32,61,32,116,101,120,116,117,114,101,50,68,40,117,95,116,101,120,116,117,114,101,44,32,118,95,116,101,120,67,111,111,114,100,41,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,61,32,97,98,103,114,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,46,114,32,61,32,97,98,103,114,46,98,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,46,98,32,61,32,97,98,103,114,46,114,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,46,97,32,61,32,49,46,48,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,42,61,32,117,95,109,111,100,117,108,97,116,105,111,110,59,32,32,32,32,32,125,32,0,32,32,32,32,32,112,114,101,99,105,115,105,111,110,32,109,101,100,105,117,109,112,32,102,108,111,97,116,59,32,32,32,32,32,117,110,105,102,111,114,109,32,115,97,109,112,108,101,114,50,68,32,117,95,116,101,120,116,117,114,101,59,32,32,32,32,32,117,110,105,102,111,114,109,32,118,101,99,52,32,117,95,109,111,100,117,108,97,116,105,111,110,59,32,32,32,32,32,118,97,114,121,105,110,103,32,118,101,99,50,32,118,95,116,101,120,67,111,111,114,100,59,32,32,32,32,32,32,32,32,32,118,111,105,100,32,109,97,105,110,40,41,32,32,32,32,32,123,32,32,32,32,32,32,32,32,32,118,101,99,52,32,97,98,103,114,32,61,32,116,101,120,116,117,114,101,50,68,40,117,95,116,101,120,116,117,114,101,44,32,118,95,116,101,120,67,111,111,114,100,41,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,61,32,97,98,103,114,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,46,114,32,61,32,97,98,103,114,46,98,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,46,98,32,61,32,97,98,103,114,46,114,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,42,61,32,117,95,109,111,100,117,108,97,116,105,111,110,59,32,32,32,32,32,125,32,0,32,32,32,32,32,112,114,101,99,105,115,105,111,110,32,109,101,100,105,117,109,112,32,102,108,111,97,116,59,32,32,32,32,32,117,110,105,102,111,114,109,32,115,97,109,112,108,101,114,50,68,32,117,95,116,101,120,116,117,114,101,59,32,32,32,32,32,117,110,105,102,111,114,109,32,118,101,99,52,32,117,95,109,111,100,117,108,97,116,105,111,110,59,32,32,32,32,32,118,97,114,121,105,110,103,32,118,101,99,50,32,118,95,116,101,120,67,111,111,114,100,59,32,32,32,32,32,32,32,32,32,118,111,105,100,32,109,97,105,110,40,41,32,32,32,32,32,123,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,61,32,116,101,120,116,117,114,101,50,68,40,117,95,116,101,120,116,117,114,101,44,32,118,95,116,101,120,67,111,111,114,100,41,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,42,61,32,117,95,109,111,100,117,108,97,116,105,111,110,59,32,32,32,32,32,125,32,0,32,32,32,32,32,112,114,101,99,105,115,105,111,110,32,109,101,100,105,117,109,112,32,102,108,111,97,116,59,32,32,32,32,32,117,110,105,102,111,114,109,32,118,101,99,52,32,117,95,99,111,108,111,114,59,32,32,32,32,32,32,32,32,32,118,111,105,100,32,109,97,105,110,40,41,32,32,32,32,32,123,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,61,32,117,95,99,111,108,111,114,59,32,32,32,32,32,125,32,0,32,32,32,32,32,117,110,105,102,111,114,109,32,109,97,116,52,32,117,95,112,114,111,106,101,99,116,105,111,110,59,32,32,32,32,32,97,116,116,114,105,98,117,116,101,32,118,101,99,50,32,97,95,112,111,115,105,116,105,111,110,59,32,32,32,32,32,97,116,116,114,105,98,117,116,101,32,118,101,99,50,32,97,95,116,101,120,67,111,111,114,100,59,32,32,32,32,32,97,116,116,114,105,98,117,116,101,32,102,108,111,97,116,32,97,95,97,110,103,108,101,59,32,32,32,32,32,97,116,116,114,105,98,117,116,101,32,118,101,99,50,32,97,95,99,101,110,116,101,114,59,32,32,32,32,32,118,97,114,121,105,110,103,32,118,101,99,50,32,118,95,116,101,120,67,111,111,114,100,59,32,32,32,32,32,32,32,32,32,118,111,105,100,32,109,97,105,110,40,41,32,32,32,32,32,123,32,32,32,32,32,32,32,32,32,102,108,111,97,116,32,97,110,103,108,101,32,61,32,114,97,100,105,97,110,115,40,97,95,97,110,103,108,101,41,59,32,32,32,32,32,32,32,32,32,102,108,111,97,116,32,99,32,61,32,99,111,115,40,97,110,103,108,101,41,59,32,32,32,32,32,32,32,32,32,102,108,111,97,116,32,115,32,61,32,115,105,110,40,97,110,103,108,101,41,59,32,32,32,32,32,32,32,32,32,109,97,116,50,32,114,111,116,97,116,105,111,110,77,97,116,114,105,120,32,61,32,109,97,116,50,40,99,44,32,45,115,44,32,115,44,32,99,41,59,32,32,32,32,32,32,32,32,32,118,101,99,50,32,112,111,115,105,116,105,111,110,32,61,32,114,111,116,97,116,105,111,110,77,97], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+65020);
/* memory initializer */ allocate([116,114,105,120,32,42,32,40,97,95,112,111,115,105,116,105,111,110,32,45,32,97,95,99,101,110,116,101,114,41,32,43,32,97,95,99,101,110,116,101,114,59,32,32,32,32,32,32,32,32,32,118,95,116,101,120,67,111,111,114,100,32,61,32,97,95,116,101,120,67,111,111,114,100,59,32,32,32,32,32,32,32,32,32,103,108,95,80,111,115,105,116,105,111,110,32,61,32,117,95,112,114,111,106,101,99,116,105,111,110,32,42,32,118,101,99,52,40,112,111,115,105,116,105,111,110,44,32,48,46,48,44,32,49,46,48,41,59,32,32,32,32,32,32,32,32,103,108,95,80,111,105,110,116,83,105,122,101,32,61,32,49,46,48,59,32,32,32,32,32,125,32,0,32,32,32,32,32,112,114,101,99,105,115,105,111,110,32,109,101,100,105,117,109,112,32,102,108,111,97,116,59,32,32,32,32,32,117,110,105,102,111,114,109,32,115,97,109,112,108,101,114,50,68,32,117,95,116,101,120,116,117,114,101,59,32,32,32,32,32,117,110,105,102,111,114,109,32,115,97,109,112,108,101,114,50,68,32,117,95,116,101,120,116,117,114,101,95,117,59,32,32,32,32,32,117,110,105,102,111,114,109,32,115,97,109,112,108,101,114,50,68,32,117,95,116,101,120,116,117,114,101,95,118,59,32,32,32,32,32,117,110,105,102,111,114,109,32,118,101,99,52,32,117,95,109,111,100,117,108,97,116,105,111,110,59,32,32,32,32,32,118,97,114,121,105,110,103,32,118,101,99,50,32,118,95,116,101,120,67,111,111,114,100,59,32,32,32,32,32,32,32,32,32,118,111,105,100,32,109,97,105,110,40,41,32,32,32,32,32,123,32,32,32,32,32,32,32,32,32,109,101,100,105,117,109,112,32,118,101,99,51,32,121,117,118,59,32,32,32,32,32,32,32,32,32,108,111,119,112,32,118,101,99,51,32,114,103,98,59,32,32,32,32,32,32,32,32,32,121,117,118,46,120,32,61,32,116,101,120,116,117,114,101,50,68,40,117,95,116,101,120,116,117,114,101,44,32,32,32,118,95,116,101,120,67,111,111,114,100,41,46,114,59,32,32,32,32,32,32,32,32,32,121,117,118,46,121,32,61,32,116,101,120,116,117,114,101,50,68,40,117,95,116,101,120,116,117,114,101,95,117,44,32,118,95,116,101,120,67,111,111,114,100,41,46,114,32,45,32,48,46,53,59,32,32,32,32,32,32,32,32,32,121,117,118,46,122,32,61,32,116,101,120,116,117,114,101,50,68,40,117,95,116,101,120,116,117,114,101,95,118,44,32,118,95,116,101,120,67,111,111,114,100,41,46,114,32,45,32,48,46,53,59,32,32,32,32,32,32,32,32,32,114,103,98,32,61,32,109,97,116,51,40,32,49,44,32,32,32,32,32,32,32,32,49,44,32,32,32,32,32,32,32,49,44,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,48,44,32,32,32,32,32,32,32,45,48,46,51,57,52,54,53,44,32,50,46,48,51,50,49,49,44,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,49,46,49,51,57,56,51,44,32,45,48,46,53,56,48,54,48,44,32,48,41,32,42,32,121,117,118,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,61,32,118,101,99,52,40,114,103,98,44,32,49,41,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,42,61,32,117,95,109,111,100,117,108,97,116,105,111,110,59,32,32,32,32,32,125,32,0,32,32,32,32,32,112,114,101,99,105,115,105,111,110,32,109,101,100,105,117,109,112,32,102,108,111,97,116,59,32,32,32,32,32,117,110,105,102,111,114,109,32,115,97,109,112,108,101,114,50,68,32,117,95,116,101,120,116,117,114,101,59,32,32,32,32,32,117,110,105,102,111,114,109,32,115,97,109,112,108,101,114,50,68,32,117,95,116,101,120,116,117,114,101,95,117,59,32,32,32,32,32,117,110,105,102,111,114,109,32,118,101,99,52,32,117,95,109,111,100,117,108,97,116,105,111,110,59,32,32,32,32,32,118,97,114,121,105,110,103,32,118,101,99,50,32,118,95,116,101,120,67,111,111,114,100,59,32,32,32,32,32,32,32,32,32,118,111,105,100,32,109,97,105,110,40,41,32,32,32,32,32,123,32,32,32,32,32,32,32,32,32,109,101,100,105,117,109,112,32,118,101,99,51,32,121,117,118,59,32,32,32,32,32,32,32,32,32,108,111,119,112,32,118,101,99,51,32,114,103,98,59,32,32,32,32,32,32,32,32,32,121,117,118,46,120,32,61,32,116,101,120,116,117,114,101,50,68,40,117,95,116,101,120,116,117,114,101,44,32,32,32,118,95,116,101,120,67,111,111,114,100,41,46,114,59,32,32,32,32,32,32,32,32,32,121,117,118,46,121,122,32,61,32,116,101,120,116,117,114,101,50,68,40,117,95,116,101,120,116,117,114,101,95,117,44,32,118,95,116,101,120,67,111,111,114,100,41,46,114,97,32,45,32,48,46,53,59,32,32,32,32,32,32,32,32,32,114,103,98,32,61,32,109,97,116,51,40,32,49,44,32,32,32,32,32,32,32,32,49,44,32,32,32,32,32,32,32,49,44,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,48,44,32,32,32,32,32,32,32,45,48,46,51,57,52,54,53,44,32,50,46,48,51,50,49,49,44,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,49,46,49,51,57,56,51,44,32,45,48,46,53,56,48,54,48,44,32,48,41,32,42,32,121,117,118,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,61,32,118,101,99,52,40,114,103,98,44,32,49,41,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,42,61,32,117,95,109,111,100,117,108,97,116,105,111,110,59,32,32,32,32,32,125,32,0,32,32,32,32,32,112,114,101,99,105,115,105,111,110,32,109,101,100,105,117,109,112,32,102,108,111,97,116,59,32,32,32,32,32,117,110,105,102,111,114,109,32,115,97,109,112,108,101,114,50,68,32,117,95,116,101,120,116,117,114,101,59,32,32,32,32,32,117,110,105,102,111,114,109,32,115,97,109,112,108,101,114,50,68,32,117,95,116,101,120,116,117,114,101,95,117,59,32,32,32,32,32,117,110,105,102,111,114,109,32,118,101,99,52,32,117,95,109,111,100,117,108,97,116,105,111,110,59,32,32,32,32,32,118,97,114,121,105,110,103,32,118,101,99,50,32,118,95,116,101,120,67,111,111,114,100,59,32,32,32,32,32,32,32,32,32,118,111,105,100,32,109,97,105,110,40,41,32,32,32,32,32,123,32,32,32,32,32,32,32,32,32,109,101,100,105,117,109,112,32,118,101,99,51,32,121,117,118,59,32,32,32,32,32,32,32,32,32,108,111,119,112,32,118,101,99,51,32,114,103,98,59,32,32,32,32,32,32,32,32,32,121,117,118,46,120,32,61,32,116,101,120,116,117,114,101,50,68,40,117,95,116,101,120,116,117,114,101,44,32,32,32,118,95,116,101,120,67,111,111,114,100,41,46,114,59,32,32,32,32,32,32,32,32,32,121,117,118,46,121,122,32,61,32,116,101,120,116,117,114,101,50,68,40,117,95,116,101,120,116,117,114,101,95,117,44,32,118,95,116,101,120,67,111,111,114,100,41,46,97,114,32,45,32,48,46,53,59,32,32,32,32,32,32,32,32,32,114,103,98,32,61,32,109,97,116,51,40,32,49,44,32,32,32,32,32,32,32,32,49,44,32,32,32,32,32,32,32,49,44,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,48,44,32,32,32,32,32,32,32,45,48,46,51,57,52,54,53,44,32,50,46,48,51,50,49,49,44,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,49,46,49,51,57,56,51,44,32,45,48,46,53,56,48,54,48,44,32,48,41,32,42,32,121,117,118,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,61,32,118,101,99,52,40,114,103,98,44,32,49,41,59,32,32,32,32,32,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,42,61,32,117,95,109,111,100,117,108,97,116,105,111,110,59,32,32,32,32,32,125,32,0,69,82,82,79,82,58,32,78,117,109,80,111,105,110,116,115,32,61,32,37,105,10,0,83,121,115,116,101,109,32,97,117,100,105,111,32,99,97,112,116,117,114,101,32,100,101,118,105,99,101,0,83,121,115,116,101,109,32,97,117,100,105,111,32,111,117,116,112,117,116,32,100,101,118,105,99,101,0,37,115,58,32,37,115,10,0,86,69,82,66,79,83,69,0,68,69,66,85,71,0,73,78,70,79,0,87,65,82,78,0,69,82,82,79,82,0,67,82,73,84,73,67,65,76,0,83,116,57,98,97,100,95,97,108,108,111,99,0,83,116,57,101,120,99,101,112,116,105,111,110,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,83,116,49,52,111,118,101,114,102,108,111,119,95,101,114,114,111,114,0,83,116,57,116,121,112,101,95,105,110,102,111,0,83,116,56,98,97,100,95,99,97,115,116,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,57,95,95,112,111,105,110,116,101,114,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,112,98,97,115,101,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,33,34,98,97,115,105,99,95,115,116,114,105,110,103,32,108,101,110,103,116,104,95,101,114,114,111,114,34,0,67,58,92,80,82,79,71,82,65,126,49,92,69,77,83,67,82,73,126,49,92,69,77,83,67,82,73,126,49,92,49,51,53,126,49,46,48,92,115,121,115,116,101,109,92,105,110,99,108,117,100,101,92,108,105,98,99,120,120,92,115,116,114,105,110,103,0,95,95,116,104,114,111,119,95,108,101,110,103,116,104,95,101,114,114,111,114,0,33,34,118,101,99,116,111,114,32,108,101,110,103,116,104,95,101,114,114,111,114,34,0,67,58,92,80,82,79,71,82,65,126,49,92,69,77,83,67,82,73,126,49,92,69,77,83,67,82,73,126,49,92,49,51,53,126,49,46,48,92,115,121,115,116,101,109,92,105,110,99,108,117,100,101,92,108,105,98,99,120,120,92,118,101,99,116,111,114,0,112,116,104,114,101,97,100,95,111,110,99,101,32,102,97,105,108,117,114,101,32,105,110,32,95,95,99,120,97,95,103,101,116,95,103,108,111,98,97,108,115,95,102,97,115,116,40,41,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,116,101,114,109,105,110,97,116,101,95,104,97,110,100,108,101,114,32,117,110,101,120,112,101,99,116,101,100,108,121,32,114,101,116,117,114,110,101,100,0,116,101,114,109,105,110,97,116,101,95,104,97,110,100,108,101,114,32,117,110,101,120,112,101,99,116,101,100,108,121,32,116,104,114,101,119,32,97,110,32,101,120,99,101,112,116,105,111,110,0,115,116,100,58,58,101,120,99,101,112,116,105,111,110,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,99,97,110,110,111,116,32,99,114,101,97,116,101,32,112,116,104,114,101,97,100,32,107,101,121,32,102,111,114,32,95,95,99,120,97,95,103,101,116,95,103,108,111,98,97,108,115,40,41,0,99,97,110,110,111,116,32,122,101,114,111,32,111,117,116,32,116,104,114,101,97,100,32,118,97,108,117,101,32,102,111,114,32,95,95,99,120,97,95,103,101,116,95,103,108,111,98,97,108,115,40,41,0,116,101,114,109,105,110,97,116,105,110,103,32,119,105,116,104,32,37,115,32,101,120,99,101,112,116,105,111,110,32,111,102,32,116,121,112,101,32,37,115,58,32,37,115,0,116,101,114,109,105,110,97,116,105,110,103,32,119,105,116,104,32,37,115,32,101,120,99,101,112,116,105,111,110,32,111,102,32,116,121,112,101,32,37,115,0,116,101,114,109,105,110,97,116,105,110,103,32,119,105,116,104,32,37,115,32,102,111,114,101,105,103,110,32,101,120,99,101,112,116,105,111,110,0,116,101,114,109,105,110,97,116,105,110,103,0,117,110,99,97,117,103,104,116,0,69,88,84,0,65,82,66,0,79,69,83,0,65,78,71,76,69,0,103,108,67,114,101,97,116,101,80,114,111,103,114,97,109,79,98,106,101,99,116,0,103,108,67,114,101,97,116,101,80,114,111,103,114,97,109,0,103,108,85,115,101,80,114,111,103,114,97,109,79,98,106,101,99,116,0,103,108,85,115,101,80,114,111,103,114,97,109,0,103,108,67,114,101,97,116,101,83,104,97,100,101,114,79,98,106,101,99,116,0,103,108,67,114,101,97,116,101,83,104,97,100,101,114,0,103,108,65,116,116,97,99,104,79,98,106,101,99,116,0,103,108,65,116,116,97,99,104,83,104,97,100,101,114,0,103,108,68,101,116,97,99,104,79,98,106,101,99,116,0,103,108,68,101,116,97,99,104,83,104,97,100,101,114,0,103,108,80,105,120,101,108,83,116,111,114,101,105,0,103,108,71,101,116,83,116,114,105,110,103,0,103,108,71,101,116,73,110,116,101,103,101,114,118,0,103,108,71,101,116,70,108,111,97,116,118,0,103,108,71,101,116,66,111,111,108,101,97,110,118,0,103,108,71,101,110,84,101,120,116,117,114,101,115,0,103,108,68,101,108,101,116,101,84,101,120,116,117,114,101,115,0,103,108,67,111,109,112,114,101,115,115,101,100,84,101,120,73,109,97,103,101,50,68,0,103,108,67,111,109,112,114,101,115,115,101,100,84,101,120,83,117,98,73,109,97,103,101,50,68,0,103,108,84,101,120,73,109,97,103,101,50,68,0,103,108,84,101,120,83,117,98,73,109,97,103,101,50,68,0,103,108,82,101,97,100,80,105,120,101,108,115,0,103,108,66,105,110,100,84,101,120,116,117,114,101,0,103,108,71,101,116,84,101,120,80,97,114,97,109,101,116,101,114,102,118,0,103,108,71,101,116,84,101,120,80,97,114,97,109,101,116,101,114,105,118,0,103,108,84,101,120,80,97,114,97,109,101,116,101,114,102,118,0,103,108,84,101,120,80,97,114,97,109,101,116,101,114,105,118,0,103,108,73,115,84,101,120,116,117,114,101,0,103,108,71,101,110,66,117,102,102,101,114,115,0,103,108,68,101,108,101,116,101,66,117,102,102,101,114,115,0,103,108,71,101,116,66,117,102,102,101,114,80,97,114,97,109,101,116,101,114,105,118,0,103,108,66,117,102,102,101,114,68,97,116,97,0,103,108,66,117,102,102,101,114,83,117,98,68,97,116,97,0,103,108,73,115,66,117,102,102,101,114,0,103,108,71,101,110,82,101,110,100,101,114,98,117,102,102,101,114,115,0,103,108,68,101,108,101,116,101,82,101,110,100,101,114,98,117,102,102,101,114,115,0,103,108,66,105,110,100,82,101,110,100,101,114,98,117,102,102,101,114,0,103,108,71,101,116,82,101,110,100,101,114,98,117,102,102,101,114,80,97,114,97,109,101,116,101,114,105,118,0,103,108,73,115,82,101,110,100,101,114,98,117,102,102,101,114,0,103,108,71,101,116,85,110,105,102,111,114,109,102,118,0,103,108,71,101,116,85,110,105,102,111,114,109,105,118,0,103,108,71,101,116,85,110,105,102,111,114,109,76,111,99,97,116,105,111,110,0,103,108,71,101,116,86,101,114,116,101,120,65,116,116,114,105,98,102,118,0,103,108,71,101,116,86,101,114,116,101,120,65,116,116,114,105,98,105,118,0,103,108,71,101,116,86,101,114,116,101,120,65,116,116,114,105,98,80,111,105,110,116,101,114,118,0,103,108,71,101,116,65,99,116,105,118,101,85,110,105,102,111,114,109,0,103,108,85,110,105,102,111,114,109,49,102,0,103,108,85,110,105,102,111,114,109,50,102,0,103,108,85,110,105,102,111,114,109,51,102,0,103,108,85,110,105,102,111,114,109,52,102,0,103,108,85,110,105,102,111,114,109,49,105,0,103,108,85,110,105,102,111,114,109,50,105,0,103,108,85,110,105,102,111,114,109,51,105,0,103,108,85,110,105,102,111,114,109,52,105,0,103,108,85,110,105,102,111,114,109,49,105,118,0,103,108,85,110,105,102,111,114,109,50,105,118,0,103,108,85,110,105,102,111,114,109,51,105,118,0,103,108,85,110,105,102,111,114,109,52,105,118,0,103,108,85,110,105,102,111,114,109,49,102,118,0,103,108,85,110,105,102,111,114,109,50,102,118,0,103,108,85,110,105,102,111,114,109,51,102,118,0,103,108,85,110,105,102,111,114,109,52,102,118,0,103,108,85,110,105,102,111,114,109,77,97,116,114,105,120,50,102,118,0,103,108,85,110,105,102,111,114,109,77,97,116,114,105,120,51,102,118,0,103,108,85,110,105,102,111,114,109,77,97,116,114,105,120,52,102,118,0,103,108,66,105,110,100,66,117,102,102,101,114,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,49,102,118,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,50,102,118,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,51,102,118,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,52,102,118,0,103,108,71,101,116,65,116,116,114,105,98,76,111,99,97,116,105,111,110,0,103,108,71,101,116,65,99,116,105,118,101,65,116,116,114,105,98,0,103,108,68,101,108,101,116,101,83,104,97,100,101,114,0,103,108,71,101,116,65,116,116,97,99,104,101,100,83,104,97,100,101,114,115,0,103,108,83,104,97,100,101,114,83,111,117,114,99,101,0,103,108,71,101,116,83,104,97,100,101,114,83,111,117,114,99,101,0,103,108,67,111,109,112,105,108,101,83,104,97,100,101,114,0,103,108,71,101,116,83,104,97,100,101,114,73,110,102,111,76,111,103,0,103,108,71,101,116,83,104,97,100,101,114,105,118,0,103,108,71,101,116,80,114,111,103,114,97,109,105,118,0,103,108,73,115,83,104,97,100,101,114,0,103,108,68,101,108,101,116,101,80,114,111,103,114,97,109,0,103,108,71,101,116,83,104,97,100,101,114,80,114,101,99,105,115,105,111,110,70,111,114,109,97,116,0,103,108,76,105,110,107,80,114,111,103,114,97,109,0,103,108,71,101,116,80,114,111,103,114,97,109,73,110,102,111,76,111,103,0,103,108,86,97,108,105,100,97,116,101,80,114,111,103,114,97,109,0,103,108,73,115,80,114,111,103,114,97,109,0,103,108,66,105,110,100,65,116,116,114,105,98,76,111,99,97,116,105,111,110,0,103,108,66,105,110,100,70,114,97,109,101,98,117,102,102,101,114,0,103,108,71,101,110,70,114,97,109,101,98,117,102,102,101,114,115,0,103,108,68,101,108,101,116,101,70,114,97,109,101,98,117,102,102,101,114,115,0,103,108,70,114,97,109,101,98,117,102,102,101,114,82,101,110,100,101,114,98,117,102,102,101,114,0,103,108,70,114,97,109,101,98,117,102,102,101,114,84,101,120,116,117,114,101,50,68,0,103,108,71,101,116,70,114,97,109,101,98,117,102,102,101,114,65,116,116,97,99,104,109,101,110,116,80,97,114,97,109,101,116,101,114,105,118,0,103,108,73,115,70,114,97,109,101,98,117,102,102,101,114,0,103,108,68,101,108,101,116,101,79,98,106,101,99,116,0,103,108,71,101,116,79,98,106,101,99,116,80,97,114,97,109,101,116,101,114,105,118,0,103,108,71,101,116,73,110,102,111,76,111,103,0,103,108,66,105,110,100,80,114,111,103,114,97,109,0,103,108,71,101,116,80,111,105,110,116,101,114,118,0,103,108,68,114,97,119,82,97,110,103,101,69,108,101,109,101,110,116,115,0,103,108,69,110,97,98,108,101,67,108,105,101,110,116,83,116,97,116,101,0,103,108,86,101,114,116,101,120,80,111,105,110,116,101,114,0,103,108,84,101,120,67,111,111,114,100,80,111,105,110,116,101,114,0,103,108,78,111,114,109,97,108,80,111,105,110,116,101,114,0,103,108,67,111,108,111,114,80,111,105,110,116,101,114,0,103,108,67,108,105,101,110,116,65,99,116,105,118,101,84,101,120,116,117,114,101,0,103,108,71,101,110,86,101,114,116,101,120,65,114,114,97,121,115,0,103,108,68,101,108,101,116,101,86,101,114,116,101,120,65,114,114,97,121,115,0,103,108,66,105,110,100,86,101,114,116,101,120,65,114,114,97,121,0,103,108,77,97,116,114,105,120,77,111,100,101,0,103,108,76,111,97,100,73,100,101,110,116,105,116,121,0,103,108,76,111,97,100,77,97,116,114,105,120,102,0,103,108,70,114,117,115,116,117,109,0,103,108,82,111,116,97,116,101,102,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,80,111,105,110,116,101,114,0,103,108,69,110,97,98,108,101,86,101,114,116,101,120,65,116,116,114,105,98,65,114,114,97,121,0,103,108,68,105,115,97,98,108,101,86,101,114,116,101,120,65,116,116,114,105,98,65,114,114,97,121,0,103,108,68,114,97,119,65,114,114,97,121,115,0,103,108,68,114,97,119,69,108,101,109,101,110,116,115,0,103,108,83,104,97,100,101,114,66,105,110,97,114,121,0,103,108,82,101,108,101,97,115,101,83,104,97,100,101,114,67,111,109,112,105,108,101,114,0,103,108,71,101,116,69,114,114,111,114,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,68,105,118,105,115,111,114,0,103,108,68,114,97,119,65,114,114,97,121,115,73,110,115,116,97,110,99,101,100,0,103,108,68,114,97,119,69,108,101,109,101,110,116,115,73,110,115,116,97,110,99,101,100,0,103,108,70,105,110,105,115,104,0,103,108,70,108,117,115,104,0,103,108,67,108,101,97,114,68,101,112,116,104,0,103,108,67,108,101,97,114,68,101,112,116,104,102,0,103,108,68,101,112,116,104,70,117,110,99,0,103,108,69,110,97,98,108,101,0,103,108,68,105,115,97,98,108,101,0,103,108,70,114,111,110,116,70,97,99,101,0,103,108,67,117,108,108,70,97,99,101,0,103,108,67,108,101,97,114,0,103,108,76,105,110,101,87,105,100,116,104,0,103,108,67,108,101,97,114,83,116,101,110,99,105,108,0,103,108,68,101,112,116,104,77,97,115,107,0,103,108,83,116,101,110,99,105,108,77,97,115,107,0,103,108,67,104,101,99,107,70,114,97,109,101,98,117,102,102,101,114,83,116,97,116,117,115,0,103,108,71,101,110,101,114,97,116,101,77,105,112,109,97,112,0,103,108,65,99,116,105,118,101,84,101,120,116,117,114,101,0,103,108,66,108,101,110,100,69,113,117,97,116,105,111,110,0,103,108,73,115,69,110,97,98,108,101,100,0,103,108,66,108,101,110,100,70,117,110,99,0,103,108,66,108,101,110,100,69,113,117,97,116,105,111,110,83,101,112,97,114,97,116,101,0,103,108,68,101,112,116,104,82,97,110,103,101,0,103,108,68,101,112,116,104,82,97,110,103,101,102,0,103,108,83,116,101,110,99,105,108,77,97,115,107,83,101,112,97,114,97,116,101,0,103,108,72,105,110,116,0,103,108,80,111,108,121,103,111,110,79,102,102,115,101,116,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,49,102,0,103,108,83,97,109,112,108,101,67,111,118,101,114,97,103,101,0,103,108,84,101,120,80,97,114,97,109,101,116,101,114,105,0,103,108,84,101,120,80,97,114,97,109,101,116,101,114,102,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,50,102,0,103,108,83,116,101,110,99,105,108,70,117,110,99,0,103,108,83,116,101,110,99,105,108,79,112,0,103,108,86,105,101,119,112,111,114,116,0,103,108,67,108,101,97,114,67,111,108,111,114,0,103,108,83,99,105,115,115,111,114,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,51,102,0,103,108,67,111,108,111,114,77,97,115,107,0,103,108,82,101,110,100,101,114,98,117,102,102,101,114,83,116,111,114,97,103,101,0,103,108,66,108,101,110,100,70,117,110,99,83,101,112,97,114,97,116,101,0,103,108,66,108,101,110,100,67,111,108,111,114,0,103,108,83,116,101,110,99,105,108,70,117,110,99,83,101,112,97,114,97,116,101,0,103,108,83,116,101,110,99,105,108,79,112,83,101,112,97,114,97,116,101,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,52,102,0,103,108,67,111,112,121,84,101,120,73,109,97,103,101,50,68,0,103,108,67,111,112,121,84,101,120,83,117,98,73,109,97,103,101,50,68,0,103,108,68,114,97,119,66,117,102,102,101,114,115,0,123,32,77,111,100,117,108,101,46,112,114,105,110,116,69,114,114,40,39,98,97,100,32,110,97,109,101,32,105,110,32,103,101,116,80,114,111,99,65,100,100,114,101,115,115,58,32,39,32,43,32,91,80,111,105,110,116,101,114,95,115,116,114,105,110,103,105,102,121,40,36,48,41,44,32,80,111,105,110,116,101,114,95,115,116,114,105,110,103,105,102,121,40,36,49,41,93,41,59,32,125,0,84,33,34,25,13,1,2,3,17,75,28,12,16,4,11,29,18,30,39,104,110,111,112,113,98,32,5,6,15,19,20,21,26,8,22,7,40,36,23,24,9,10,14,27,31,37,35,131,130,125,38,42,43,60,61,62,63,67,71,74,77,88,89,90,91,92,93,94,95,96,97,99,100,101,102,103,105,106,107,108,114,115,116,121,122,123,124,0,73,108,108,101,103,97,108,32,98,121,116,101,32,115,101,113,117,101,110,99,101,0,68,111,109,97,105,110,32,101,114,114,111,114,0,82,101,115,117,108,116,32,110,111,116,32,114,101,112,114,101,115,101,110,116,97,98,108,101,0,78,111,116,32,97,32,116,116,121,0,80,101,114,109,105,115,115,105,111,110,32,100,101,110,105,101,100,0,79,112,101,114,97,116,105,111,110,32,110,111,116,32,112,101,114,109,105,116,116,101,100,0,78,111,32,115,117,99,104,32,102,105,108,101,32,111,114,32,100,105,114,101,99,116,111,114,121,0,78,111,32,115,117,99,104,32,112,114,111,99,101,115,115,0,70,105,108,101,32,101,120,105,115,116,115,0,86,97,108,117,101,32,116,111,111,32,108,97,114,103,101,32,102,111,114,32,100,97,116,97,32,116,121,112,101,0,78,111,32,115,112,97,99,101,32,108,101,102,116,32,111,110,32,100,101,118,105,99,101,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,82,101,115,111,117,114,99,101,32,98,117,115,121,0,73,110,116,101,114,114,117,112,116,101,100,32,115,121,115,116,101,109,32,99,97,108,108,0,82,101,115,111,117,114,99,101,32,116,101,109,112,111,114,97,114,105,108,121,32,117,110,97,118,97,105,108,97,98,108,101,0,73,110,118,97,108,105,100,32,115,101,101,107,0,67,114,111,115,115,45,100,101,118,105,99,101,32,108,105,110,107,0,82,101,97,100,45,111,110,108,121,32,102,105,108,101,32,115,121,115,116,101,109,0,68,105,114,101,99,116,111,114,121,32,110,111,116,32,101,109,112,116,121,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,112,101,101,114,0,79,112,101,114,97,116,105,111,110,32,116,105,109,101,100,32,111,117,116,0,67,111,110,110,101,99,116,105,111,110,32,114,101,102,117,115,101,100,0,72,111,115,116,32,105,115,32,100,111,119,110,0,72,111,115,116,32,105,115,32,117,110,114,101,97,99,104,97,98,108,101,0,65,100,100,114,101,115,115,32,105,110,32,117,115,101,0,66,114,111,107,101,110,32,112,105,112,101,0,73,47,79,32,101,114,114,111,114,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,32,111,114,32,97,100,100,114,101,115,115,0,66,108,111,99,107,32,100,101,118,105,99,101,32,114,101,113,117,105,114,101,100,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,0,78,111,116,32,97,32,100,105,114,101,99,116,111,114,121,0,73,115,32,97,32,100,105,114,101,99,116,111,114,121,0,84,101,120,116,32,102,105,108,101,32,98,117,115,121,0,69,120,101,99,32,102,111,114,109,97,116,32,101,114,114,111,114,0,73,110,118,97,108,105,100,32,97,114,103,117,109,101,110,116,0,65,114,103,117,109,101,110,116,32,108,105,115,116,32,116,111,111,32,108,111,110,103,0,83,121,109,98,111,108,105,99,32,108,105,110,107,32,108,111,111,112,0,70,105,108,101,110,97,109,101,32,116,111,111,32,108,111,110,103,0,84,111,111,32,109,97,110,121,32,111,112,101,110,32,102,105,108,101,115,32,105,110,32,115,121,115,116,101,109,0,78,111,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,115,32,97,118,97,105,108,97,98,108,101,0,66,97,100,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,0,78,111,32,99,104,105,108,100,32,112,114,111,99,101,115,115,0,66,97,100,32,97,100,100,114,101,115,115,0,70,105,108,101,32,116,111,111,32,108,97,114,103,101,0,84,111,111,32,109,97,110,121,32,108,105,110,107,115,0,78,111,32,108,111,99,107,115,32,97,118,97,105,108,97,98,108,101,0,82,101,115,111,117,114,99,101,32,100,101,97,100,108,111,99,107,32,119,111,117,108,100,32,111,99,99,117,114,0,83,116,97,116,101,32,110,111,116,32,114,101,99,111,118,101,114,97,98,108,101,0,80,114,101,118,105,111,117,115,32,111,119,110,101,114,32,100,105,101,100,0,79,112,101,114,97,116,105,111,110,32,99,97,110,99,101,108,101,100,0,70,117,110,99,116,105,111,110,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,78,111,32,109,101,115,115,97,103,101,32,111,102,32,100,101,115,105,114,101,100,32,116,121,112,101,0,73,100,101,110,116,105,102,105,101,114,32,114,101,109,111,118,101,100,0,68,101,118,105,99,101,32,110,111,116,32,97,32,115,116,114,101,97,109,0,78,111,32,100,97,116,97,32,97,118,97,105,108,97,98,108,101,0,68,101,118,105,99,101,32,116,105,109,101,111,117,116,0,79,117,116,32,111,102,32,115,116,114,101,97,109,115,32,114,101,115,111,117,114,99,101,115,0,76,105,110,107,32,104,97,115,32,98,101,101,110,32,115,101,118,101,114,101,100,0,80,114,111,116,111,99,111,108,32,101,114,114,111,114,0,66,97,100,32,109,101,115,115,97,103,101,0,70,105,108,101,32,100,101,115,99,114,105,112,116,111,114,32,105,110,32,98,97,100,32,115,116,97,116,101,0,78,111,116,32,97,32,115,111,99,107,101,116,0,68,101,115,116,105,110,97,116,105,111,110,32,97,100,100,114,101,115,115,32,114,101,113,117,105,114,101,100,0,77,101,115,115,97,103,101,32,116,111,111,32,108,97,114,103,101,0,80,114,111,116,111,99,111,108,32,119,114,111,110,103,32,116,121,112,101,32,102,111,114,32,115,111,99,107,101,116,0,80,114,111,116,111,99,111,108,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,80,114,111,116,111,99,111,108,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,83,111,99,107,101,116,32,116,121,112,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,78,111,116,32,115,117,112,112,111,114,116,101,100,0,80,114,111,116,111,99,111,108,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,65,100,100,114,101,115,115,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,98,121,32,112,114,111,116,111,99,111,108,0,65,100,100,114,101,115,115,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,78,101,116,119,111,114,107,32,105,115,32,100,111,119,110,0,78,101,116,119,111,114,107,32,117,110,114,101,97,99,104,97,98,108,101,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,110,101,116,119,111,114,107,0,67,111,110,110,101,99,116,105,111,110,32,97,98,111,114,116,101,100,0,78,111,32,98,117,102,102,101,114,32,115,112,97,99,101,32,97,118,97,105,108,97,98,108,101,0,83,111,99,107,101,116,32,105,115,32,99,111,110,110,101,99,116,101,100,0,83,111,99,107,101,116,32,110,111,116,32,99,111,110,110,101,99,116,101,100,0,67,97,110,110,111,116,32,115,101,110,100,32,97,102,116,101,114,32,115,111,99,107,101,116,32,115,104,117,116,100,111,119,110,0,79,112,101,114,97,116,105,111,110,32,97,108,114,101,97,100,121,32,105,110,32,112,114,111,103,114,101,115,115,0,79,112,101,114,97,116,105,111,110,32,105,110,32,112,114,111,103,114,101,115,115,0,83,116,97,108,101,32,102,105,108,101,32,104,97,110,100,108,101,0,82,101,109,111,116,101,32,73,47,79,32,101,114,114,111,114,0,81,117,111,116,97,32,101,120,99,101,101,100,101,100,0,78,111,32,109,101,100,105,117,109,32,102,111,117,110,100,0,87,114,111,110,103,32,109,101,100,105,117,109,32,116,121,112,101,0,78,111,32,101,114,114,111,114,32,105,110,102,111,114,109,97,116,105,111,110,0,0,105,110,102,105,110,105,116,121,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,1,2,3,4,5,6,7,8,9,255,255,255,255,255,255,255,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,255,255,255,255,255,255,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,1,2,4,7,3,6,5,0,80,79,83,73,88,0,114,119,97], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+75260);
/* memory initializer */ allocate([17,0,10,0,17,17,17,0,0,0,0,5,0,0,0,0,0,0,9,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,15,10,17,17,17,3,10,7,0,1,19,9,11,11,0,0,9,6,11,0,0,11,0,6,17,0,0,0,17,17,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,10,10,17,17,17,0,10,0,0,2,0,9,11,0,0,0,9,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,4,13,0,0,0,0,9,14,0,0,0,0,0,14,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,15,0,0,0,0,9,16,0,0,0,0,0,16,0,0,16,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,10,0,0,0,0,9,11,0,0,0,0,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,45,43,32,32,32,48,88,48,120,0,40,110,117,108,108,41,0,45,48,88,43,48,88,32,48,88,45,48,120,43,48,120,32,48,120,0,105,110,102,0,73,78,70,0,110,97,110,0,78,65,78,0,46,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,78,83,116,51,95,95,49,49,57,95,95,115,104,97,114,101,100,95,119,101,97,107,95,99,111,117,110,116,69,0,78,83,116,51,95,95,49,49,50,98,97,100,95,119,101,97,107,95,112,116,114,69,0,98,97,100,95,119,101,97,107,95,112,116,114,0,95,95,110,101,120,116,95,112,114,105,109,101,32,111,118,101,114,102,108,111,119,0,99,108,111,99,107,95,103,101,116,116,105,109,101,40,67,76,79,67,75,95,77,79,78,79,84,79,78,73,67,41,32,102,97,105,108,101,100,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,78,83,116,51,95,95,49,49,52,98,97,115,105,99,95,105,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,105,111,115,116,114,101,97,109,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,37,112,0,67,0,37,0,0,0,0,0,108,0,108,108,0,0,76,0,37,112,0,0,0,0,37,72,58,37,77,58,37,83,37,109,47,37,100,47,37,121,37,89,45,37,109,45,37,100,37,73,58,37,77,58,37,83,32,37,112,37,72,58,37,77,37,72,58,37,77,58,37,83,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,48,49,50,51,52,53,54,55,56,57,0,37,76,102,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,48,49,50,51,52,53,54,55,56,57,0,37,46,48,76,102,0,116,114,117,101,0,102,97,108,115,101,0,83,117,110,100,97,121,0,77,111,110,100,97,121,0,84,117,101,115,100,97,121,0,87,101,100,110,101,115,100,97,121,0,84,104,117,114,115,100,97,121,0,70,114,105,100,97,121,0,83,97,116,117,114,100,97,121,0,83,117,110,0,77,111,110,0,84,117,101,0,87,101,100,0,84,104,117,0,70,114,105,0,83,97,116,0,74,97,110,117,97,114,121,0,70,101,98,114,117,97,114,121,0,77,97,114,99,104,0,65,112,114,105,108,0,77,97,121,0,74,117,110,101,0,74,117,108,121,0,65,117,103,117,115,116,0,83,101,112,116,101,109,98,101,114,0,79,99,116,111,98,101,114,0,78,111,118,101,109,98,101,114,0,68,101,99,101,109,98,101,114,0,74,97,110,0,70,101,98,0,77,97,114,0,65,112,114,0,74,117,110,0,74,117,108,0,65,117,103,0,83,101,112,0,79,99,116,0,78,111,118,0,68,101,99,0,65,77,0,80,77,0,37,109,47,37,100,47,37,121,0,37,72,58,37,77,58,37,83,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,37,73,58,37,77,58,37,83,32,37,112,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,78,83,116,51,95,95,49,50,52,95,95,103,101,110,101,114,105,99,95,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,78,83,116,51,95,95,49,50,51,95,95,115,121,115,116,101,109,95,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,103,101,110,101,114,105,99,0,117,110,115,112,101,99,105,102,105,101,100,32,103,101,110,101,114,105,99,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,115,121,115,116,101,109,0,117,110,115,112,101,99,105,102,105,101,100,32,115,121,115,116,101,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,58,32,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+85504);





/* no memory initializer */
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}

// {{PRE_LIBRARY}}


  
  var JSEvents={keyEvent:0,mouseEvent:0,wheelEvent:0,uiEvent:0,focusEvent:0,deviceOrientationEvent:0,deviceMotionEvent:0,fullscreenChangeEvent:0,pointerlockChangeEvent:0,visibilityChangeEvent:0,touchEvent:0,previousFullscreenElement:null,previousScreenX:null,previousScreenY:null,removeEventListenersRegistered:false,registerRemoveEventListeners:function () {
        if (!JSEvents.removeEventListenersRegistered) {
        __ATEXIT__.push(function() {
            for(var i = JSEvents.eventHandlers.length-1; i >= 0; --i) {
              JSEvents._removeHandler(i);
            }
           });
          JSEvents.removeEventListenersRegistered = true;
        }
      },findEventTarget:function (target) {
        if (target) {
          if (typeof target == "number") {
            target = Pointer_stringify(target);
          }
          if (target == '#window') return window;
          else if (target == '#document') return document;
          else if (target == '#screen') return window.screen;
          else if (target == '#canvas') return Module['canvas'];
  
          if (typeof target == 'string') return document.getElementById(target);
          else return target;
        } else {
          // The sensible target varies between events, but use window as the default
          // since DOM events mostly can default to that. Specific callback registrations
          // override their own defaults.
          return window;
        }
      },deferredCalls:[],deferCall:function (targetFunction, precedence, argsList) {
        function arraysHaveEqualContent(arrA, arrB) {
          if (arrA.length != arrB.length) return false;
  
          for(var i in arrA) {
            if (arrA[i] != arrB[i]) return false;
          }
          return true;
        }
        // Test if the given call was already queued, and if so, don't add it again.
        for(var i in JSEvents.deferredCalls) {
          var call = JSEvents.deferredCalls[i];
          if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
            return;
          }
        }
        JSEvents.deferredCalls.push({
          targetFunction: targetFunction,
          precedence: precedence,
          argsList: argsList
        });
  
        JSEvents.deferredCalls.sort(function(x,y) { return x.precedence < y.precedence; });
      },removeDeferredCalls:function (targetFunction) {
        for(var i = 0; i < JSEvents.deferredCalls.length; ++i) {
          if (JSEvents.deferredCalls[i].targetFunction == targetFunction) {
            JSEvents.deferredCalls.splice(i, 1);
            --i;
          }
        }
      },canPerformEventHandlerRequests:function () {
        return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
      },runDeferredCalls:function () {
        if (!JSEvents.canPerformEventHandlerRequests()) {
          return;
        }
        for(var i = 0; i < JSEvents.deferredCalls.length; ++i) {
          var call = JSEvents.deferredCalls[i];
          JSEvents.deferredCalls.splice(i, 1);
          --i;
          call.targetFunction.apply(this, call.argsList);
        }
      },inEventHandler:0,currentEventHandler:null,eventHandlers:[],isInternetExplorer:function () { return navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0; },removeAllHandlersOnTarget:function (target, eventTypeString) {
        for(var i = 0; i < JSEvents.eventHandlers.length; ++i) {
          if (JSEvents.eventHandlers[i].target == target && 
            (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
             JSEvents._removeHandler(i--);
           }
        }
      },_removeHandler:function (i) {
        var h = JSEvents.eventHandlers[i];
        h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
        JSEvents.eventHandlers.splice(i, 1);
      },registerOrRemoveHandler:function (eventHandler) {
        var jsEventHandler = function jsEventHandler(event) {
          // Increment nesting count for the event handler.
          ++JSEvents.inEventHandler;
          JSEvents.currentEventHandler = eventHandler;
          // Process any old deferred calls the user has placed.
          JSEvents.runDeferredCalls();
          // Process the actual event, calls back to user C code handler.
          eventHandler.handlerFunc(event);
          // Process any new deferred calls that were placed right now from this event handler.
          JSEvents.runDeferredCalls();
          // Out of event handler - restore nesting count.
          --JSEvents.inEventHandler;
        }
        
        if (eventHandler.callbackfunc) {
          eventHandler.eventListenerFunc = jsEventHandler;
          eventHandler.target.addEventListener(eventHandler.eventTypeString, jsEventHandler, eventHandler.useCapture);
          JSEvents.eventHandlers.push(eventHandler);
          JSEvents.registerRemoveEventListeners();
        } else {
          for(var i = 0; i < JSEvents.eventHandlers.length; ++i) {
            if (JSEvents.eventHandlers[i].target == eventHandler.target
             && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
               JSEvents._removeHandler(i--);
             }
          }
        }
      },registerKeyEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        if (!JSEvents.keyEvent) {
          JSEvents.keyEvent = _malloc( 164 );
        }
        var handlerFunc = function(event) {
          var e = event || window.event;
          writeStringToMemory(e.key ? e.key : "", JSEvents.keyEvent + 0 );
          writeStringToMemory(e.code ? e.code : "", JSEvents.keyEvent + 32 );
          HEAP32[(((JSEvents.keyEvent)+(64))>>2)]=e.location;
          HEAP32[(((JSEvents.keyEvent)+(68))>>2)]=e.ctrlKey;
          HEAP32[(((JSEvents.keyEvent)+(72))>>2)]=e.shiftKey;
          HEAP32[(((JSEvents.keyEvent)+(76))>>2)]=e.altKey;
          HEAP32[(((JSEvents.keyEvent)+(80))>>2)]=e.metaKey;
          HEAP32[(((JSEvents.keyEvent)+(84))>>2)]=e.repeat;
          writeStringToMemory(e.locale ? e.locale : "", JSEvents.keyEvent + 88 );
          writeStringToMemory(e.char ? e.char : "", JSEvents.keyEvent + 120 );
          HEAP32[(((JSEvents.keyEvent)+(152))>>2)]=e.charCode;
          HEAP32[(((JSEvents.keyEvent)+(156))>>2)]=e.keyCode;
          HEAP32[(((JSEvents.keyEvent)+(160))>>2)]=e.which;
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, JSEvents.keyEvent, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
  
        var eventHandler = {
          target: JSEvents.findEventTarget(target),
          allowsDeferredCalls: JSEvents.isInternetExplorer() ? false : true, // MSIE doesn't allow fullscreen and pointerlock requests from key handlers, others do.
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: handlerFunc,
          useCapture: useCapture
        };
        JSEvents.registerOrRemoveHandler(eventHandler);
      },getBoundingClientRectOrZeros:function (target) {
        return target.getBoundingClientRect ? target.getBoundingClientRect() : { left: 0, top: 0 };
      },fillMouseEventData:function (eventStruct, e, target) {
        HEAPF64[((eventStruct)>>3)]=JSEvents.tick();
        HEAP32[(((eventStruct)+(8))>>2)]=e.screenX;
        HEAP32[(((eventStruct)+(12))>>2)]=e.screenY;
        HEAP32[(((eventStruct)+(16))>>2)]=e.clientX;
        HEAP32[(((eventStruct)+(20))>>2)]=e.clientY;
        HEAP32[(((eventStruct)+(24))>>2)]=e.ctrlKey;
        HEAP32[(((eventStruct)+(28))>>2)]=e.shiftKey;
        HEAP32[(((eventStruct)+(32))>>2)]=e.altKey;
        HEAP32[(((eventStruct)+(36))>>2)]=e.metaKey;
        HEAP16[(((eventStruct)+(40))>>1)]=e.button;
        HEAP16[(((eventStruct)+(42))>>1)]=e.buttons;
        HEAP32[(((eventStruct)+(44))>>2)]=e["movementX"] || e["mozMovementX"] || e["webkitMovementX"] || (e.screenX-JSEvents.previousScreenX);
        HEAP32[(((eventStruct)+(48))>>2)]=e["movementY"] || e["mozMovementY"] || e["webkitMovementY"] || (e.screenY-JSEvents.previousScreenY);
  
        if (Module['canvas']) {
          var rect = Module['canvas'].getBoundingClientRect();
          HEAP32[(((eventStruct)+(60))>>2)]=e.clientX - rect.left;
          HEAP32[(((eventStruct)+(64))>>2)]=e.clientY - rect.top;
        } else { // Canvas is not initialized, return 0.
          HEAP32[(((eventStruct)+(60))>>2)]=0;
          HEAP32[(((eventStruct)+(64))>>2)]=0;
        }
        if (target) {
          var rect = JSEvents.getBoundingClientRectOrZeros(target);
          HEAP32[(((eventStruct)+(52))>>2)]=e.clientX - rect.left;
          HEAP32[(((eventStruct)+(56))>>2)]=e.clientY - rect.top;        
        } else { // No specific target passed, return 0.
          HEAP32[(((eventStruct)+(52))>>2)]=0;
          HEAP32[(((eventStruct)+(56))>>2)]=0;
        }
        JSEvents.previousScreenX = e.screenX;
        JSEvents.previousScreenY = e.screenY;
      },registerMouseEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        if (!JSEvents.mouseEvent) {
          JSEvents.mouseEvent = _malloc( 72 );
        }
        target = JSEvents.findEventTarget(target);
        var handlerFunc = function(event) {
          var e = event || window.event;
          JSEvents.fillMouseEventData(JSEvents.mouseEvent, e, target);
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, JSEvents.mouseEvent, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
  
        var eventHandler = {
          target: target,
          allowsDeferredCalls: eventTypeString != 'mousemove' && eventTypeString != 'mouseenter' && eventTypeString != 'mouseleave', // Mouse move events do not allow fullscreen/pointer lock requests to be handled in them!
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: handlerFunc,
          useCapture: useCapture
        };
        // In IE, mousedown events don't either allow deferred calls to be run!
        if (JSEvents.isInternetExplorer() && eventTypeString == 'mousedown') eventHandler.allowsDeferredCalls = false;
        JSEvents.registerOrRemoveHandler(eventHandler);
      },registerWheelEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        if (!JSEvents.wheelEvent) {
          JSEvents.wheelEvent = _malloc( 104 );
        }
        target = JSEvents.findEventTarget(target);
        // The DOM Level 3 events spec event 'wheel'
        var wheelHandlerFunc = function(event) {
          var e = event || window.event;
          JSEvents.fillMouseEventData(JSEvents.wheelEvent, e, target);
          HEAPF64[(((JSEvents.wheelEvent)+(72))>>3)]=e["deltaX"];
          HEAPF64[(((JSEvents.wheelEvent)+(80))>>3)]=e["deltaY"];
          HEAPF64[(((JSEvents.wheelEvent)+(88))>>3)]=e["deltaZ"];
          HEAP32[(((JSEvents.wheelEvent)+(96))>>2)]=e["deltaMode"];
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, JSEvents.wheelEvent, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
        // The 'mousewheel' event as implemented in Safari 6.0.5
        var mouseWheelHandlerFunc = function(event) {
          var e = event || window.event;
          JSEvents.fillMouseEventData(JSEvents.wheelEvent, e, target);
          HEAPF64[(((JSEvents.wheelEvent)+(72))>>3)]=e["wheelDeltaX"];
          HEAPF64[(((JSEvents.wheelEvent)+(80))>>3)]=-e["wheelDeltaY"] /* Invert to unify direction with the DOM Level 3 wheel event. */;
          HEAPF64[(((JSEvents.wheelEvent)+(88))>>3)]=0 /* Not available */;
          HEAP32[(((JSEvents.wheelEvent)+(96))>>2)]=0 /* DOM_DELTA_PIXEL */;
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, JSEvents.wheelEvent, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
  
        var eventHandler = {
          target: target,
          allowsDeferredCalls: true,
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: (eventTypeString == 'wheel') ? wheelHandlerFunc : mouseWheelHandlerFunc,
          useCapture: useCapture
        };
        JSEvents.registerOrRemoveHandler(eventHandler);
      },pageScrollPos:function () {
        if (window.pageXOffset > 0 || window.pageYOffset > 0) {
          return [window.pageXOffset, window.pageYOffset];
        }
        if (typeof document.documentElement.scrollLeft !== 'undefined' || typeof document.documentElement.scrollTop !== 'undefined') {
          return [document.documentElement.scrollLeft, document.documentElement.scrollTop];
        }
        return [document.body.scrollLeft|0, document.body.scrollTop|0];
      },registerUiEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        if (!JSEvents.uiEvent) {
          JSEvents.uiEvent = _malloc( 36 );
        }
  
        if (eventTypeString == "scroll" && !target) {
          target = document; // By default read scroll events on document rather than window.
        } else {
          target = JSEvents.findEventTarget(target);
        }
  
        var handlerFunc = function(event) {
          var e = event || window.event;
          if (e.target != target) {
            // Never take ui events such as scroll via a 'bubbled' route, but always from the direct element that
            // was targeted. Otherwise e.g. if app logs a message in response to a page scroll, the Emscripten log
            // message box could cause to scroll, generating a new (bubbled) scroll message, causing a new log print,
            // causing a new scroll, etc..
            return;
          }
          var scrollPos = JSEvents.pageScrollPos();
          HEAP32[((JSEvents.uiEvent)>>2)]=e.detail;
          HEAP32[(((JSEvents.uiEvent)+(4))>>2)]=document.body.clientWidth;
          HEAP32[(((JSEvents.uiEvent)+(8))>>2)]=document.body.clientHeight;
          HEAP32[(((JSEvents.uiEvent)+(12))>>2)]=window.innerWidth;
          HEAP32[(((JSEvents.uiEvent)+(16))>>2)]=window.innerHeight;
          HEAP32[(((JSEvents.uiEvent)+(20))>>2)]=window.outerWidth;
          HEAP32[(((JSEvents.uiEvent)+(24))>>2)]=window.outerHeight;
          HEAP32[(((JSEvents.uiEvent)+(28))>>2)]=scrollPos[0];
          HEAP32[(((JSEvents.uiEvent)+(32))>>2)]=scrollPos[1];
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, JSEvents.uiEvent, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
  
        var eventHandler = {
          target: target,
          allowsDeferredCalls: false, // Neither scroll or resize events allow running requests inside them.
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: handlerFunc,
          useCapture: useCapture
        };
        JSEvents.registerOrRemoveHandler(eventHandler);
      },getNodeNameForTarget:function (target) {
        if (!target) return '';
        if (target == window) return '#window';
        if (target == window.screen) return '#screen';
        return (target && target.nodeName) ? target.nodeName : '';
      },registerFocusEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        if (!JSEvents.focusEvent) {
          JSEvents.focusEvent = _malloc( 256 );
        }
        var handlerFunc = function(event) {
          var e = event || window.event;
  
          var nodeName = JSEvents.getNodeNameForTarget(e.target);
          var id = e.target.id ? e.target.id : '';
          writeStringToMemory(nodeName, JSEvents.focusEvent + 0 );
          writeStringToMemory(id, JSEvents.focusEvent + 128 );
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, JSEvents.focusEvent, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
  
        var eventHandler = {
          target: JSEvents.findEventTarget(target),
          allowsDeferredCalls: false,
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: handlerFunc,
          useCapture: useCapture
        };
        JSEvents.registerOrRemoveHandler(eventHandler);
      },tick:function () {
        if (window['performance'] && window['performance']['now']) return window['performance']['now']();
        else return Date.now();
      },registerDeviceOrientationEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        if (!JSEvents.deviceOrientationEvent) {
          JSEvents.deviceOrientationEvent = _malloc( 40 );
        }
        var handlerFunc = function(event) {
          var e = event || window.event;
  
          HEAPF64[((JSEvents.deviceOrientationEvent)>>3)]=JSEvents.tick();
          HEAPF64[(((JSEvents.deviceOrientationEvent)+(8))>>3)]=e.alpha;
          HEAPF64[(((JSEvents.deviceOrientationEvent)+(16))>>3)]=e.beta;
          HEAPF64[(((JSEvents.deviceOrientationEvent)+(24))>>3)]=e.gamma;
          HEAP32[(((JSEvents.deviceOrientationEvent)+(32))>>2)]=e.absolute;
  
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, JSEvents.deviceOrientationEvent, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
  
        var eventHandler = {
          target: JSEvents.findEventTarget(target),
          allowsDeferredCalls: false,
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: handlerFunc,
          useCapture: useCapture
        };
        JSEvents.registerOrRemoveHandler(eventHandler);
      },registerDeviceMotionEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        if (!JSEvents.deviceMotionEvent) {
          JSEvents.deviceMotionEvent = _malloc( 80 );
        }
        var handlerFunc = function(event) {
          var e = event || window.event;
  
          HEAPF64[((JSEvents.deviceOrientationEvent)>>3)]=JSEvents.tick();
          HEAPF64[(((JSEvents.deviceMotionEvent)+(8))>>3)]=e.acceleration.x;
          HEAPF64[(((JSEvents.deviceMotionEvent)+(16))>>3)]=e.acceleration.y;
          HEAPF64[(((JSEvents.deviceMotionEvent)+(24))>>3)]=e.acceleration.z;
          HEAPF64[(((JSEvents.deviceMotionEvent)+(32))>>3)]=e.accelerationIncludingGravity.x;
          HEAPF64[(((JSEvents.deviceMotionEvent)+(40))>>3)]=e.accelerationIncludingGravity.y;
          HEAPF64[(((JSEvents.deviceMotionEvent)+(48))>>3)]=e.accelerationIncludingGravity.z;
          HEAPF64[(((JSEvents.deviceMotionEvent)+(56))>>3)]=e.rotationRate.alpha;
          HEAPF64[(((JSEvents.deviceMotionEvent)+(64))>>3)]=e.rotationRate.beta;
          HEAPF64[(((JSEvents.deviceMotionEvent)+(72))>>3)]=e.rotationRate.gamma;
  
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, JSEvents.deviceMotionEvent, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
  
        var eventHandler = {
          target: JSEvents.findEventTarget(target),
          allowsDeferredCalls: false,
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: handlerFunc,
          useCapture: useCapture
        };
        JSEvents.registerOrRemoveHandler(eventHandler);
      },screenOrientation:function () {
        if (!window.screen) return undefined;
        return window.screen.orientation || window.screen.mozOrientation || window.screen.webkitOrientation || window.screen.msOrientation;
      },fillOrientationChangeEventData:function (eventStruct, e) {
        var orientations  = ["portrait-primary", "portrait-secondary", "landscape-primary", "landscape-secondary"];
        var orientations2 = ["portrait",         "portrait",           "landscape",         "landscape"];
  
        var orientationString = JSEvents.screenOrientation();
        var orientation = orientations.indexOf(orientationString);
        if (orientation == -1) {
          orientation = orientations2.indexOf(orientationString);
        }
  
        HEAP32[((eventStruct)>>2)]=1 << orientation;
        HEAP32[(((eventStruct)+(4))>>2)]=window.orientation;
      },registerOrientationChangeEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        if (!JSEvents.orientationChangeEvent) {
          JSEvents.orientationChangeEvent = _malloc( 8 );
        }
  
        if (!target) {
          target = window.screen; // Orientation events need to be captured from 'window.screen' instead of 'window'
        } else {
          target = JSEvents.findEventTarget(target);
        }
  
        var handlerFunc = function(event) {
          var e = event || window.event;
  
          JSEvents.fillOrientationChangeEventData(JSEvents.orientationChangeEvent, e);
  
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, JSEvents.orientationChangeEvent, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
  
        if (eventTypeString == "orientationchange" && window.screen.mozOrientation !== undefined) {
          eventTypeString = "mozorientationchange";
        }
  
        var eventHandler = {
          target: target,
          allowsDeferredCalls: false,
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: handlerFunc,
          useCapture: useCapture
        };
        JSEvents.registerOrRemoveHandler(eventHandler);
      },fullscreenEnabled:function () {
        return document.fullscreenEnabled || document.mozFullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled;
      },fillFullscreenChangeEventData:function (eventStruct, e) {
        var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        var isFullscreen = !!fullscreenElement;
        HEAP32[((eventStruct)>>2)]=isFullscreen;
        HEAP32[(((eventStruct)+(4))>>2)]=JSEvents.fullscreenEnabled();
        // If transitioning to fullscreen, report info about the element that is now fullscreen.
        // If transitioning to windowed mode, report info about the element that just was fullscreen.
        var reportedElement = isFullscreen ? fullscreenElement : JSEvents.previousFullscreenElement;
        var nodeName = JSEvents.getNodeNameForTarget(reportedElement);
        var id = (reportedElement && reportedElement.id) ? reportedElement.id : '';
        writeStringToMemory(nodeName, eventStruct + 8 );
        writeStringToMemory(id, eventStruct + 136 );
        HEAP32[(((eventStruct)+(264))>>2)]=reportedElement ? reportedElement.clientWidth : 0;
        HEAP32[(((eventStruct)+(268))>>2)]=reportedElement ? reportedElement.clientHeight : 0;
        HEAP32[(((eventStruct)+(272))>>2)]=screen.width;
        HEAP32[(((eventStruct)+(276))>>2)]=screen.height;
        if (isFullscreen) {
          JSEvents.previousFullscreenElement = fullscreenElement;
        }
      },registerFullscreenChangeEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        if (!JSEvents.fullscreenChangeEvent) {
          JSEvents.fullscreenChangeEvent = _malloc( 280 );
        }
  
        if (!target) {
          target = document; // Fullscreen change events need to be captured from 'document' by default instead of 'window'
        } else {
          target = JSEvents.findEventTarget(target);
        }
  
        var handlerFunc = function(event) {
          var e = event || window.event;
  
          JSEvents.fillFullscreenChangeEventData(JSEvents.fullscreenChangeEvent, e);
  
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, JSEvents.fullscreenChangeEvent, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
  
        var eventHandler = {
          target: target,
          allowsDeferredCalls: false,
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: handlerFunc,
          useCapture: useCapture
        };
        JSEvents.registerOrRemoveHandler(eventHandler);
      },resizeCanvasForFullscreen:function (target, strategy) {
        var restoreOldStyle = __registerRestoreOldStyle(target);
        var cssWidth = strategy.softFullscreen ? window.innerWidth : screen.width;
        var cssHeight = strategy.softFullscreen ? window.innerHeight : screen.height;
        var rect = target.getBoundingClientRect();
        var windowedCssWidth = rect.right - rect.left;
        var windowedCssHeight = rect.bottom - rect.top;
        var windowedRttWidth = target.width;
        var windowedRttHeight = target.height;
  
        if (strategy.scaleMode == 3) {
          __setLetterbox(target, (cssHeight - windowedCssHeight) / 2, (cssWidth - windowedCssWidth) / 2);
          cssWidth = windowedCssWidth;
          cssHeight = windowedCssHeight;
        } else if (strategy.scaleMode == 2) {
          if (cssWidth*windowedRttHeight < windowedRttWidth*cssHeight) {
            var desiredCssHeight = windowedRttHeight * cssWidth / windowedRttWidth;
            __setLetterbox(target, (cssHeight - desiredCssHeight) / 2, 0);
            cssHeight = desiredCssHeight;
          } else {
            var desiredCssWidth = windowedRttWidth * cssHeight / windowedRttHeight;
            __setLetterbox(target, 0, (cssWidth - desiredCssWidth) / 2);
            cssWidth = desiredCssWidth;
          }
        }
  
        // If we are adding padding, must choose a background color or otherwise Chrome will give the
        // padding a default white color. Do it only if user has not customized their own background color.
        if (!target.style.backgroundColor) target.style.backgroundColor = 'black';
        // IE11 does the same, but requires the color to be set in the document body.
        if (!document.body.style.backgroundColor) document.body.style.backgroundColor = 'black'; // IE11
        // Firefox always shows black letterboxes independent of style color.
  
        target.style.width = cssWidth + 'px';
        target.style.height = cssHeight + 'px';
  
        if (strategy.filteringMode == 1) {
          target.style.imageRendering = 'optimizeSpeed';
          target.style.imageRendering = '-moz-crisp-edges';
          target.style.imageRendering = '-o-crisp-edges';
          target.style.imageRendering = '-webkit-optimize-contrast';
          target.style.imageRendering = 'optimize-contrast';
          target.style.imageRendering = 'crisp-edges';
          target.style.imageRendering = 'pixelated';
        }
  
        var dpiScale = (strategy.canvasResolutionScaleMode == 2) ? window.devicePixelRatio : 1;
        if (strategy.canvasResolutionScaleMode != 0) {
          target.width = cssWidth * dpiScale;
          target.height = cssHeight * dpiScale;
          if (target.GLctxObject) target.GLctxObject.GLctx.viewport(0, 0, target.width, target.height);
        }
        return restoreOldStyle;
      },requestFullscreen:function (target, strategy) {
        // EMSCRIPTEN_FULLSCREEN_SCALE_DEFAULT + EMSCRIPTEN_FULLSCREEN_CANVAS_SCALE_NONE is a mode where no extra logic is performed to the DOM elements.
        if (strategy.scaleMode != 0 || strategy.canvasResolutionScaleMode != 0) {
          JSEvents.resizeCanvasForFullscreen(target, strategy);
        }
  
        if (target.requestFullscreen) {
          target.requestFullscreen();
        } else if (target.msRequestFullscreen) {
          target.msRequestFullscreen();
        } else if (target.mozRequestFullScreen) {
          target.mozRequestFullScreen();
        } else if (target.mozRequestFullscreen) {
          target.mozRequestFullscreen();
        } else if (target.webkitRequestFullscreen) {
          target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        } else {
          if (typeof JSEvents.fullscreenEnabled() === 'undefined') {
            return -1;
          } else {
            return -3;
          }
        }
  
        if (strategy.canvasResizedCallback) {
          Runtime.dynCall('iiii', strategy.canvasResizedCallback, [37, 0, strategy.canvasResizedCallbackUserData]);
        }
  
        return 0;
      },fillPointerlockChangeEventData:function (eventStruct, e) {
        var pointerLockElement = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement;
        var isPointerlocked = !!pointerLockElement;
        HEAP32[((eventStruct)>>2)]=isPointerlocked;
        var nodeName = JSEvents.getNodeNameForTarget(pointerLockElement);
        var id = (pointerLockElement && pointerLockElement.id) ? pointerLockElement.id : '';
        writeStringToMemory(nodeName, eventStruct + 4 );
        writeStringToMemory(id, eventStruct + 132);
      },registerPointerlockChangeEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        if (!JSEvents.pointerlockChangeEvent) {
          JSEvents.pointerlockChangeEvent = _malloc( 260 );
        }
  
        if (!target) {
          target = document; // Pointer lock change events need to be captured from 'document' by default instead of 'window'
        } else {
          target = JSEvents.findEventTarget(target);
        }
  
        var handlerFunc = function(event) {
          var e = event || window.event;
  
          JSEvents.fillPointerlockChangeEventData(JSEvents.pointerlockChangeEvent, e);
  
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, JSEvents.pointerlockChangeEvent, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
  
        var eventHandler = {
          target: target,
          allowsDeferredCalls: false,
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: handlerFunc,
          useCapture: useCapture
        };
        JSEvents.registerOrRemoveHandler(eventHandler);
      },requestPointerLock:function (target) {
        if (target.requestPointerLock) {
          target.requestPointerLock();
        } else if (target.mozRequestPointerLock) {
          target.mozRequestPointerLock();
        } else if (target.webkitRequestPointerLock) {
          target.webkitRequestPointerLock();
        } else if (target.msRequestPointerLock) {
          target.msRequestPointerLock();
        } else {
          // document.body is known to accept pointer lock, so use that to differentiate if the user passed a bad element,
          // or if the whole browser just doesn't support the feature.
          if (document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock || document.body.msRequestPointerLock) {
            return -3;
          } else {
            return -1;
          }
        }
        return 0;
      },fillVisibilityChangeEventData:function (eventStruct, e) {
        var visibilityStates = [ "hidden", "visible", "prerender", "unloaded" ];
        var visibilityState = visibilityStates.indexOf(document.visibilityState);
  
        HEAP32[((eventStruct)>>2)]=document.hidden;
        HEAP32[(((eventStruct)+(4))>>2)]=visibilityState;
      },registerVisibilityChangeEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        if (!JSEvents.visibilityChangeEvent) {
          JSEvents.visibilityChangeEvent = _malloc( 8 );
        }
  
        if (!target) {
          target = document; // Visibility change events need to be captured from 'document' by default instead of 'window'
        } else {
          target = JSEvents.findEventTarget(target);
        }
  
        var handlerFunc = function(event) {
          var e = event || window.event;
  
          JSEvents.fillVisibilityChangeEventData(JSEvents.visibilityChangeEvent, e);
  
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, JSEvents.visibilityChangeEvent, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
  
        var eventHandler = {
          target: target,
          allowsDeferredCalls: false,
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: handlerFunc,
          useCapture: useCapture
        };
        JSEvents.registerOrRemoveHandler(eventHandler);
      },registerTouchEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        if (!JSEvents.touchEvent) {
          JSEvents.touchEvent = _malloc( 1684 );
        }
  
        target = JSEvents.findEventTarget(target);
  
        var handlerFunc = function(event) {
          var e = event || window.event;
  
          var touches = {};
          for(var i = 0; i < e.touches.length; ++i) {
            var touch = e.touches[i];
            touches[touch.identifier] = touch;
          }
          for(var i = 0; i < e.changedTouches.length; ++i) {
            var touch = e.changedTouches[i];
            touches[touch.identifier] = touch;
            touch.changed = true;
          }
          for(var i = 0; i < e.targetTouches.length; ++i) {
            var touch = e.targetTouches[i];
            touches[touch.identifier].onTarget = true;
          }
          
          var ptr = JSEvents.touchEvent;
          HEAP32[(((ptr)+(4))>>2)]=e.ctrlKey;
          HEAP32[(((ptr)+(8))>>2)]=e.shiftKey;
          HEAP32[(((ptr)+(12))>>2)]=e.altKey;
          HEAP32[(((ptr)+(16))>>2)]=e.metaKey;
          ptr += 20; // Advance to the start of the touch array.
          var canvasRect = Module['canvas'] ? Module['canvas'].getBoundingClientRect() : undefined;
          var targetRect = JSEvents.getBoundingClientRectOrZeros(target);
          var numTouches = 0;
          for(var i in touches) {
            var t = touches[i];
            HEAP32[((ptr)>>2)]=t.identifier;
            HEAP32[(((ptr)+(4))>>2)]=t.screenX;
            HEAP32[(((ptr)+(8))>>2)]=t.screenY;
            HEAP32[(((ptr)+(12))>>2)]=t.clientX;
            HEAP32[(((ptr)+(16))>>2)]=t.clientY;
            HEAP32[(((ptr)+(20))>>2)]=t.pageX;
            HEAP32[(((ptr)+(24))>>2)]=t.pageY;
            HEAP32[(((ptr)+(28))>>2)]=t.changed;
            HEAP32[(((ptr)+(32))>>2)]=t.onTarget;
            if (canvasRect) {
              HEAP32[(((ptr)+(44))>>2)]=t.clientX - canvasRect.left;
              HEAP32[(((ptr)+(48))>>2)]=t.clientY - canvasRect.top;
            } else {
              HEAP32[(((ptr)+(44))>>2)]=0;
              HEAP32[(((ptr)+(48))>>2)]=0;            
            }
            HEAP32[(((ptr)+(36))>>2)]=t.clientX - targetRect.left;
            HEAP32[(((ptr)+(40))>>2)]=t.clientY - targetRect.top;
            
            ptr += 52;
  
            if (++numTouches >= 32) {
              break;
            }
          }
          HEAP32[((JSEvents.touchEvent)>>2)]=numTouches;
  
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, JSEvents.touchEvent, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
  
        var eventHandler = {
          target: target,
          allowsDeferredCalls: false, // XXX Currently disabled, see bug https://bugzilla.mozilla.org/show_bug.cgi?id=966493
          // Once the above bug is resolved, enable the following condition if possible:
          // allowsDeferredCalls: eventTypeString == 'touchstart',
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: handlerFunc,
          useCapture: useCapture
        };
        JSEvents.registerOrRemoveHandler(eventHandler);
      },fillGamepadEventData:function (eventStruct, e) {
        HEAPF64[((eventStruct)>>3)]=e.timestamp;
        for(var i = 0; i < e.axes.length; ++i) {
          HEAPF64[(((eventStruct+i*8)+(16))>>3)]=e.axes[i];
        }
        for(var i = 0; i < e.buttons.length; ++i) {
          if (typeof(e.buttons[i]) === 'object') {
            HEAPF64[(((eventStruct+i*8)+(528))>>3)]=e.buttons[i].value;
          } else {
            HEAPF64[(((eventStruct+i*8)+(528))>>3)]=e.buttons[i];
          }
        }
        for(var i = 0; i < e.buttons.length; ++i) {
          if (typeof(e.buttons[i]) === 'object') {
            HEAP32[(((eventStruct+i*4)+(1040))>>2)]=e.buttons[i].pressed;
          } else {
            HEAP32[(((eventStruct+i*4)+(1040))>>2)]=e.buttons[i] == 1.0;
          }
        }
        HEAP32[(((eventStruct)+(1296))>>2)]=e.connected;
        HEAP32[(((eventStruct)+(1300))>>2)]=e.index;
        HEAP32[(((eventStruct)+(8))>>2)]=e.axes.length;
        HEAP32[(((eventStruct)+(12))>>2)]=e.buttons.length;
        writeStringToMemory(e.id, eventStruct + 1304 );
        writeStringToMemory(e.mapping, eventStruct + 1368 );
      },registerGamepadEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        if (!JSEvents.gamepadEvent) {
          JSEvents.gamepadEvent = _malloc( 1432 );
        }
  
        var handlerFunc = function(event) {
          var e = event || window.event;
  
          JSEvents.fillGamepadEventData(JSEvents.gamepadEvent, e.gamepad);
  
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, JSEvents.gamepadEvent, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
  
        var eventHandler = {
          target: JSEvents.findEventTarget(target),
          allowsDeferredCalls: true,
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: handlerFunc,
          useCapture: useCapture
        };
        JSEvents.registerOrRemoveHandler(eventHandler);
      },registerBeforeUnloadEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        var handlerFunc = function(event) {
          var e = event || window.event;
  
          var confirmationMessage = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, 0, userData]);
          
          if (confirmationMessage) {
            confirmationMessage = Pointer_stringify(confirmationMessage);
          }
          if (confirmationMessage) {
            e.preventDefault();
            e.returnValue = confirmationMessage;
            return confirmationMessage;
          }
        };
  
        var eventHandler = {
          target: JSEvents.findEventTarget(target),
          allowsDeferredCalls: false,
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: handlerFunc,
          useCapture: useCapture
        };
        JSEvents.registerOrRemoveHandler(eventHandler);
      },battery:function () { return navigator.battery || navigator.mozBattery || navigator.webkitBattery; },fillBatteryEventData:function (eventStruct, e) {
        HEAPF64[((eventStruct)>>3)]=e.chargingTime;
        HEAPF64[(((eventStruct)+(8))>>3)]=e.dischargingTime;
        HEAPF64[(((eventStruct)+(16))>>3)]=e.level;
        HEAP32[(((eventStruct)+(24))>>2)]=e.charging;
      },registerBatteryEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        if (!JSEvents.batteryEvent) {
          JSEvents.batteryEvent = _malloc( 32 );
        }
  
        var handlerFunc = function(event) {
          var e = event || window.event;
  
          JSEvents.fillBatteryEventData(JSEvents.batteryEvent, JSEvents.battery());
  
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, JSEvents.batteryEvent, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
  
        var eventHandler = {
          target: JSEvents.findEventTarget(target),
          allowsDeferredCalls: false,
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: handlerFunc,
          useCapture: useCapture
        };
        JSEvents.registerOrRemoveHandler(eventHandler);
      },registerWebGlEventCallback:function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
        if (!target) {
          target = Module['canvas'];
        }
        var handlerFunc = function(event) {
          var e = event || window.event;
  
          var shouldCancel = Runtime.dynCall('iiii', callbackfunc, [eventTypeId, 0, userData]);
          if (shouldCancel) {
            e.preventDefault();
          }
        };
  
        var eventHandler = {
          target: JSEvents.findEventTarget(target),
          allowsDeferredCalls: false,
          eventTypeString: eventTypeString,
          callbackfunc: callbackfunc,
          handlerFunc: handlerFunc,
          useCapture: useCapture
        };
        JSEvents.registerOrRemoveHandler(eventHandler);
      }};function _emscripten_set_visibilitychange_callback(userData, useCapture, callbackfunc) {
      JSEvents.registerVisibilityChangeEventCallback(document, userData, useCapture, callbackfunc, 21, "visibilitychange");
      return 0;
    }

  
  var GL={counter:1,lastError:0,buffers:[],mappedBuffers:{},programs:[],framebuffers:[],renderbuffers:[],textures:[],uniforms:[],shaders:[],vaos:[],contexts:[],currentContext:null,byteSizeByTypeRoot:5120,byteSizeByType:[1,1,2,2,4,4,4,2,3,4,8],programInfos:{},stringCache:{},packAlignment:4,unpackAlignment:4,init:function () {
        GL.miniTempBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
        for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
          GL.miniTempBufferViews[i] = GL.miniTempBuffer.subarray(0, i+1);
        }
      },recordError:function recordError(errorCode) {
        if (!GL.lastError) {
          GL.lastError = errorCode;
        }
      },getNewId:function (table) {
        var ret = GL.counter++;
        for (var i = table.length; i < ret; i++) {
          table[i] = null;
        }
        return ret;
      },MINI_TEMP_BUFFER_SIZE:16,miniTempBuffer:null,miniTempBufferViews:[0],getSource:function (shader, count, string, length) {
        var source = '';
        for (var i = 0; i < count; ++i) {
          var frag;
          if (length) {
            var len = HEAP32[(((length)+(i*4))>>2)];
            if (len < 0) {
              frag = Pointer_stringify(HEAP32[(((string)+(i*4))>>2)]);
            } else {
              frag = Pointer_stringify(HEAP32[(((string)+(i*4))>>2)], len);
            }
          } else {
            frag = Pointer_stringify(HEAP32[(((string)+(i*4))>>2)]);
          }
          source += frag;
        }
        return source;
      },createContext:function (canvas, webGLContextAttributes) {
        if (typeof webGLContextAttributes.majorVersion === 'undefined' && typeof webGLContextAttributes.minorVersion === 'undefined') {
          webGLContextAttributes.majorVersion = 1;
          webGLContextAttributes.minorVersion = 0;
        }
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
          try {
            if (webGLContextAttributes.majorVersion == 1 && webGLContextAttributes.minorVersion == 0) {
              ctx = canvas.getContext("webgl", webGLContextAttributes) || canvas.getContext("experimental-webgl", webGLContextAttributes);
            } else if (webGLContextAttributes.majorVersion == 2 && webGLContextAttributes.minorVersion == 0) {
              ctx = canvas.getContext("webgl2", webGLContextAttributes) || canvas.getContext("experimental-webgl2", webGLContextAttributes);
            } else {
              throw 'Unsupported WebGL context version ' + majorVersion + '.' + minorVersion + '!'
            }
          } finally {
            canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e, JSON.stringify(webGLContextAttributes)]);
          return 0;
        }
        // possible GL_DEBUG entry point: ctx = wrapDebugGL(ctx);
  
        if (!ctx) return 0;
        return GL.registerContext(ctx, webGLContextAttributes);
      },registerContext:function (ctx, webGLContextAttributes) {
        var handle = GL.getNewId(GL.contexts);
        var context = {
          handle: handle,
          version: webGLContextAttributes.majorVersion,
          GLctx: ctx
        };
        // Store the created context object so that we can access the context given a canvas without having to pass the parameters again.
        if (ctx.canvas) ctx.canvas.GLctxObject = context;
        GL.contexts[handle] = context;
        if (typeof webGLContextAttributes['enableExtensionsByDefault'] === 'undefined' || webGLContextAttributes.enableExtensionsByDefault) {
          GL.initExtensions(context);
        }
        return handle;
      },makeContextCurrent:function (contextHandle) {
        var context = GL.contexts[contextHandle];
        if (!context) return false;
        GLctx = Module.ctx = context.GLctx; // Active WebGL context object.
        GL.currentContext = context; // Active Emscripten GL layer context object.
        return true;
      },getContext:function (contextHandle) {
        return GL.contexts[contextHandle];
      },deleteContext:function (contextHandle) {
        if (GL.currentContext === GL.contexts[contextHandle]) GL.currentContext = null;
        if (typeof JSEvents === 'object') JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas); // Release all JS event handlers on the DOM element that the GL context is associated with since the context is now deleted.
        if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined; // Make sure the canvas object no longer refers to the context object so there are no GC surprises.
        GL.contexts[contextHandle] = null;
      },initExtensions:function (context) {
        // If this function is called without a specific context object, init the extensions of the currently active context.
        if (!context) context = GL.currentContext;
  
        if (context.initExtensionsDone) return;
        context.initExtensionsDone = true;
  
        var GLctx = context.GLctx;
  
        context.maxVertexAttribs = GLctx.getParameter(GLctx.MAX_VERTEX_ATTRIBS);
  
        // Detect the presence of a few extensions manually, this GL interop layer itself will need to know if they exist. 
  
        if (context.version < 2) {
          // Extension available from Firefox 26 and Google Chrome 30
          var instancedArraysExt = GLctx.getExtension('ANGLE_instanced_arrays');
          if (instancedArraysExt) {
            GLctx['vertexAttribDivisor'] = function(index, divisor) { instancedArraysExt['vertexAttribDivisorANGLE'](index, divisor); };
            GLctx['drawArraysInstanced'] = function(mode, first, count, primcount) { instancedArraysExt['drawArraysInstancedANGLE'](mode, first, count, primcount); };
            GLctx['drawElementsInstanced'] = function(mode, count, type, indices, primcount) { instancedArraysExt['drawElementsInstancedANGLE'](mode, count, type, indices, primcount); };
          }
  
          // Extension available from Firefox 25 and WebKit
          var vaoExt = GLctx.getExtension('OES_vertex_array_object');
          if (vaoExt) {
            GLctx['createVertexArray'] = function() { return vaoExt['createVertexArrayOES'](); };
            GLctx['deleteVertexArray'] = function(vao) { vaoExt['deleteVertexArrayOES'](vao); };
            GLctx['bindVertexArray'] = function(vao) { vaoExt['bindVertexArrayOES'](vao); };
            GLctx['isVertexArray'] = function(vao) { return vaoExt['isVertexArrayOES'](vao); };
          }
  
          var drawBuffersExt = GLctx.getExtension('WEBGL_draw_buffers');
          if (drawBuffersExt) {
            GLctx['drawBuffers'] = function(n, bufs) { drawBuffersExt['drawBuffersWEBGL'](n, bufs); };
          }
        }
  
        // These are the 'safe' feature-enabling extensions that don't add any performance impact related to e.g. debugging, and
        // should be enabled by default so that client GLES2/GL code will not need to go through extra hoops to get its stuff working.
        // As new extensions are ratified at http://www.khronos.org/registry/webgl/extensions/ , feel free to add your new extensions
        // here, as long as they don't produce a performance impact for users that might not be using those extensions.
        // E.g. debugging-related extensions should probably be off by default.
        var automaticallyEnabledExtensions = [ "OES_texture_float", "OES_texture_half_float", "OES_standard_derivatives",
                                               "OES_vertex_array_object", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture",
                                               "OES_element_index_uint", "EXT_texture_filter_anisotropic", "ANGLE_instanced_arrays",
                                               "OES_texture_float_linear", "OES_texture_half_float_linear", "WEBGL_compressed_texture_atc",
                                               "WEBGL_compressed_texture_pvrtc", "EXT_color_buffer_half_float", "WEBGL_color_buffer_float",
                                               "EXT_frag_depth", "EXT_sRGB", "WEBGL_draw_buffers", "WEBGL_shared_resources",
                                               "EXT_shader_texture_lod" ];
  
        function shouldEnableAutomatically(extension) {
          var ret = false;
          automaticallyEnabledExtensions.forEach(function(include) {
            if (ext.indexOf(include) != -1) {
              ret = true;
            }
          });
          return ret;
        }
  
        var exts = GLctx.getSupportedExtensions();
        if (exts && exts.length > 0) {
          GLctx.getSupportedExtensions().forEach(function(ext) {
            if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
              GLctx.getExtension(ext); // Calling .getExtension enables that extension permanently, no need to store the return value to be enabled.
            }
          });
        }
      },populateUniformTable:function (program) {
        var p = GL.programs[program];
        GL.programInfos[program] = {
          uniforms: {},
          maxUniformLength: 0, // This is eagerly computed below, since we already enumerate all uniforms anyway.
          maxAttributeLength: -1 // This is lazily computed and cached, computed when/if first asked, "-1" meaning not computed yet.
        };
  
        var ptable = GL.programInfos[program];
        var utable = ptable.uniforms;
        // A program's uniform table maps the string name of an uniform to an integer location of that uniform.
        // The global GL.uniforms map maps integer locations to WebGLUniformLocations.
        var numUniforms = GLctx.getProgramParameter(p, GLctx.ACTIVE_UNIFORMS);
        for (var i = 0; i < numUniforms; ++i) {
          var u = GLctx.getActiveUniform(p, i);
  
          var name = u.name;
          ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length+1);
  
          // Strip off any trailing array specifier we might have got, e.g. "[0]".
          if (name.indexOf(']', name.length-1) !== -1) {
            var ls = name.lastIndexOf('[');
            name = name.slice(0, ls);
          }
  
          // Optimize memory usage slightly: If we have an array of uniforms, e.g. 'vec3 colors[3];', then 
          // only store the string 'colors' in utable, and 'colors[0]', 'colors[1]' and 'colors[2]' will be parsed as 'colors'+i.
          // Note that for the GL.uniforms table, we still need to fetch the all WebGLUniformLocations for all the indices.
          var loc = GLctx.getUniformLocation(p, name);
          var id = GL.getNewId(GL.uniforms);
          utable[name] = [u.size, id];
          GL.uniforms[id] = loc;
  
          for (var j = 1; j < u.size; ++j) {
            var n = name + '['+j+']';
            loc = GLctx.getUniformLocation(p, n);
            id = GL.getNewId(GL.uniforms);
  
            GL.uniforms[id] = loc;
          }
        }
      }};function _emscripten_glIsRenderbuffer(renderbuffer) {
      var rb = GL.renderbuffers[renderbuffer];
      if (!rb) return 0;
      return GLctx.isRenderbuffer(rb);
    }

  function _emscripten_glStencilMaskSeparate(x0, x1) { GLctx.stencilMaskSeparate(x0, x1) }

  
  
  function _eglWaitClient() {
      EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
      return 1;
    }var EGL={errorCode:12288,defaultDisplayInitialized:false,currentContext:0,currentReadSurface:0,currentDrawSurface:0,stringCache:{},setErrorCode:function (code) {
        EGL.errorCode = code;
      },chooseConfig:function (display, attribList, config, config_size, numConfigs) { 
        if (display != 62000 /* Magic ID for Emscripten 'default display' */) {
          EGL.setErrorCode(0x3008 /* EGL_BAD_DISPLAY */);
          return 0;
        }
        // TODO: read attribList.
        if ((!config || !config_size) && !numConfigs) {
          EGL.setErrorCode(0x300C /* EGL_BAD_PARAMETER */);
          return 0;
        }
        if (numConfigs) {
          HEAP32[((numConfigs)>>2)]=1; // Total number of supported configs: 1.
        }
        if (config && config_size > 0) {
          HEAP32[((config)>>2)]=62002; 
        }
        
        EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
        return 1;
      }};function _eglTerminate(display) {
      if (display != 62000 /* Magic ID for Emscripten 'default display' */) {
        EGL.setErrorCode(0x3008 /* EGL_BAD_DISPLAY */);
        return 0;
      }
      EGL.currentContext = 0;
      EGL.currentReadSurface = 0;
      EGL.currentDrawSurface = 0;
      EGL.defaultDisplayInitialized = false;
      EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
      return 1;
    }

  function _pthread_mutex_lock() {}

  
  
  function _free() {
  }
  Module["_free"] = _free;function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch(e) { // XXX FIXME
        Module.printErr('exception during cxa_free_exception: ' + e);
      }
    }
  
  var EXCEPTIONS={last:0,caught:[],infos:{},deAdjust:function (adjusted) {
        if (!adjusted || EXCEPTIONS.infos[adjusted]) return adjusted;
        for (var ptr in EXCEPTIONS.infos) {
          var info = EXCEPTIONS.infos[ptr];
          if (info.adjusted === adjusted) {
            return ptr;
          }
        }
        return adjusted;
      },addRef:function (ptr) {
        if (!ptr) return;
        var info = EXCEPTIONS.infos[ptr];
        info.refcount++;
      },decRef:function (ptr) {
        if (!ptr) return;
        var info = EXCEPTIONS.infos[ptr];
        assert(info.refcount > 0);
        info.refcount--;
        if (info.refcount === 0) {
          if (info.destructor) {
            Runtime.dynCall('vi', info.destructor, [ptr]);
          }
          delete EXCEPTIONS.infos[ptr];
          ___cxa_free_exception(ptr);
        }
      },clearRef:function (ptr) {
        if (!ptr) return;
        var info = EXCEPTIONS.infos[ptr];
        info.refcount = 0;
      }};function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      asm['setThrew'](0);
      // Call destructor if one is registered then clear it.
      var ptr = EXCEPTIONS.caught.pop();
      if (ptr) {
        EXCEPTIONS.decRef(EXCEPTIONS.deAdjust(ptr));
        EXCEPTIONS.last = 0; // XXX in decRef?
      }
    }

  function _glLinkProgram(program) {
      GLctx.linkProgram(GL.programs[program]);
      GL.programInfos[program] = null; // uniforms no longer keep the same names after linking
      GL.populateUniformTable(program);
    }

  var _emscripten_asm_const=true;

  function _emscripten_set_mouseleave_callback(target, userData, useCapture, callbackfunc) {
      JSEvents.registerMouseEventCallback(target, userData, useCapture, callbackfunc, 34, "mouseleave");
      return 0;
    }

  function _emscripten_glStencilFunc(x0, x1, x2) { GLctx.stencilFunc(x0, x1, x2) }

  function _glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
      GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget,
                                         GL.renderbuffers[renderbuffer]);
    }

  function _emscripten_glVertexPointer(){ throw 'Legacy GL function (glVertexPointer) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.'; }

  function _emscripten_glUniform3iv(location, count, value) {
      location = GL.uniforms[location];
      count *= 3;
      value = HEAP32.subarray((value)>>2,(value+count*4)>>2);
      GLctx.uniform3iv(location, value);
    }

  function _emscripten_glUniform4f(location, v0, v1, v2, v3) {
      location = GL.uniforms[location];
      GLctx.uniform4f(location, v0, v1, v2, v3);
    }

  function _emscripten_glShaderSource(shader, count, string, length) {
      var source = GL.getSource(shader, count, string, length);
      GLctx.shaderSource(GL.shaders[shader], source);
    }

  function _emscripten_glReleaseShaderCompiler() {
      // NOP (as allowed by GLES 2.0 spec)
    }

  function _emscripten_glIsTexture(texture) {
      var texture = GL.textures[texture];
      if (!texture) return 0;
      return GLctx.isTexture(texture);
    }

  function _emscripten_glTexParameterf(x0, x1, x2) { GLctx.texParameterf(x0, x1, x2) }

  
  var DLFCN={error:null,errorMsg:null,loadedLibs:{},loadedLibNames:{}};function _dlerror() {
      // char *dlerror(void);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/dlerror.html
      if (DLFCN.errorMsg === null) {
        return 0;
      } else {
        if (DLFCN.error) _free(DLFCN.error);
        var msgArr = intArrayFromString(DLFCN.errorMsg);
        DLFCN.error = allocate(msgArr, 'i8', ALLOC_NORMAL);
        DLFCN.errorMsg = null;
        return DLFCN.error;
      }
    }

  function _eglWaitGL() {
  return _eglWaitClient.apply(null, arguments)
  }

  function _glCompileShader(shader) {
      GLctx.compileShader(GL.shaders[shader]);
    }

  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  function ___setErrNo(value) {
      if (Module['___errno_location']) HEAP32[((Module['___errno_location']())>>2)]=value;
      else Module.printErr('failed to set errno from JS');
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          stream.tty.ops.flush(stream.tty);
        },flush:function (stream) {
          stream.tty.ops.flush(stream.tty);
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              // we will read data by chunks of BUFSIZE
              var BUFSIZE = 256;
              var buf = new Buffer(BUFSIZE);
              var bytesRead = 0;
  
              var fd = process.stdin.fd;
              // Linux and Mac cannot use process.stdin.fd (which isn't set up as sync)
              var usingDevice = false;
              try {
                fd = fs.openSync('/dev/stdin', 'r');
                usingDevice = true;
              } catch (e) {}
  
              bytesRead = fs.readSync(fd, buf, 0, BUFSIZE, null);
  
              if (usingDevice) { fs.closeSync(fd); }
              if (bytesRead > 0) {
                result = buf.slice(0, bytesRead).toString('utf-8');
              } else {
                result = null;
              }
  
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
          }
        },flush:function (tty) {
          if (tty.output && tty.output.length > 0) {
            Module['print'](UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },flush:function (tty) {
          if (tty.output && tty.output.length > 0) {
            Module['printErr'](UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }}};
  
  var MEMFS={ops_table:null,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap,
                msync: MEMFS.stream_ops.msync
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            }
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.buffer.byteLength which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },getFileDataAsRegularArray:function (node) {
        if (node.contents && node.contents.subarray) {
          var arr = [];
          for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
          return arr; // Returns a copy of the original data.
        }
        return node.contents; // No-op, the file contents are already in a JS array. Return as-is.
      },getFileDataAsTypedArray:function (node) {
        if (!node.contents) return new Uint8Array;
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },expandFileStorage:function (node, newCapacity) {
        // If we are asked to expand the size of a file that already exists, revert to using a standard JS array to store the file
        // instead of a typed array. This makes resizing the array more flexible because we can just .push() elements at the back to
        // increase the size.
        if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
          node.contents = MEMFS.getFileDataAsRegularArray(node);
          node.usedBytes = node.contents.length; // We might be writing to a lazy-loaded file which had overridden this property, so force-reset it.
        }
  
        if (!node.contents || node.contents.subarray) { // Keep using a typed array if creating a new storage, or if old one was a typed array as well.
          var prevCapacity = node.contents ? node.contents.buffer.byteLength : 0;
          if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
          // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
          // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
          // avoid overshooting the allocation cap by a very large margin.
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) | 0);
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity); // Allocate new storage.
          if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
          return;
        }
        // Not using a typed array to back the file storage. Use a standard JS array instead.
        if (!node.contents && newCapacity > 0) node.contents = [];
        while (node.contents.length < newCapacity) node.contents.push(0);
      },resizeFileStorage:function (node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
          return;
        }
        if (!node.contents || node.contents.subarray) { // Resize a typed array if that is being used as the backing store.
          var oldContents = node.contents;
          node.contents = new Uint8Array(new ArrayBuffer(newSize)); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
          return;
        }
        // Backing with a JS array.
        if (!node.contents) node.contents = [];
        if (node.contents.length > newSize) node.contents.length = newSize;
        else while (node.contents.length < newSize) node.contents.push(0);
        node.usedBytes = newSize;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) { // Can we just reuse the buffer we are given?
              assert(position === 0, 'canOwn must imply no weird position inside the file');
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
  
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); // Use typed array write if available.
          else {
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position+length);
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < stream.node.usedBytes) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        },msync:function (stream, buffer, offset, length, mmapFlags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          if (mmapFlags & 2) {
            // MAP_PRIVATE calls need not to be synced back to underlying fs
            return 0;
          }
  
          var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
          // should we check if bytesWritten and length are the same?
          return 0;
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        if (typeof indexedDB !== 'undefined') return indexedDB;
        var ret = null;
        if (typeof window === 'object') ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        assert(ret, 'IDBFS used, but indexedDB not supported');
        return ret;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          if (!fileStore.indexNames.contains('timestamp')) {
            fileStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function(e) {
            callback(this.error);
            e.preventDefault();
          };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          // Performance consideration: storing a normal JavaScript array to a IndexedDB is much slower than storing a typed array.
          // Therefore always convert the file contents to a typed array first before writing the data to IndexedDB.
          node.contents = MEMFS.getFileDataAsTypedArray(node);
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.chmod(path, entry.mode);
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function(e) {
          done(this.error);
          e.preventDefault();
        };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        flags &= ~0100000 /*O_LARGEFILE*/; // Ignore this flag from musl, otherwise node.js fails to open the file.
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            path = fs.readlinkSync(path);
            path = NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root), path);
            return path;
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          if (length === 0) return 0; // node errors on 0 length reads
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          return position;
        }}};
  
  var WORKERFS={DIR_MODE:16895,FILE_MODE:33279,reader:null,mount:function (mount) {
        assert(ENVIRONMENT_IS_WORKER);
        if (!WORKERFS.reader) WORKERFS.reader = new FileReaderSync();
        var root = WORKERFS.createNode(null, '/', WORKERFS.DIR_MODE, 0);
        var createdParents = {};
        function ensureParent(path) {
          // return the parent node, creating subdirs as necessary
          var parts = path.split('/');
          var parent = root;
          for (var i = 0; i < parts.length-1; i++) {
            var curr = parts.slice(0, i+1).join('/');
            if (!createdParents[curr]) {
              createdParents[curr] = WORKERFS.createNode(parent, curr, WORKERFS.DIR_MODE, 0);
            }
            parent = createdParents[curr];
          }
          return parent;
        }
        function base(path) {
          var parts = path.split('/');
          return parts[parts.length-1];
        }
        // We also accept FileList here, by using Array.prototype
        Array.prototype.forEach.call(mount.opts["files"] || [], function(file) {
          WORKERFS.createNode(ensureParent(file.name), base(file.name), WORKERFS.FILE_MODE, 0, file, file.lastModifiedDate);
        });
        (mount.opts["blobs"] || []).forEach(function(obj) {
          WORKERFS.createNode(ensureParent(obj["name"]), base(obj["name"]), WORKERFS.FILE_MODE, 0, obj["data"]);
        });
        (mount.opts["packages"] || []).forEach(function(pack) {
          pack['metadata'].files.forEach(function(file) {
            var name = file.filename.substr(1); // remove initial slash
            WORKERFS.createNode(ensureParent(name), base(name), WORKERFS.FILE_MODE, 0, pack['blob'].slice(file.start, file.end));
          });
        });
        return root;
      },createNode:function (parent, name, mode, dev, contents, mtime) {
        var node = FS.createNode(parent, name, mode);
        node.mode = mode;
        node.node_ops = WORKERFS.node_ops;
        node.stream_ops = WORKERFS.stream_ops;
        node.timestamp = (mtime || new Date).getTime();
        assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE);
        if (mode === WORKERFS.FILE_MODE) {
          node.size = contents.size;
          node.contents = contents;
        } else {
          node.size = 4096;
          node.contents = {};
        }
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },node_ops:{getattr:function (node) {
          return {
            dev: 1,
            ino: undefined,
            mode: node.mode,
            nlink: 1,
            uid: 0,
            gid: 0,
            rdev: undefined,
            size: node.size,
            atime: new Date(node.timestamp),
            mtime: new Date(node.timestamp),
            ctime: new Date(node.timestamp),
            blksize: 4096,
            blocks: Math.ceil(node.size / 4096),
          };
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
        },lookup:function (parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        },mknod:function (parent, name, mode, dev) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },rename:function (oldNode, newDir, newName) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },unlink:function (parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },rmdir:function (parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },readdir:function (node) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },symlink:function (parent, newName, oldPath) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },readlink:function (node) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          if (position >= stream.node.size) return 0;
          var chunk = stream.node.contents.slice(position, position + length);
          var ab = WORKERFS.reader.readAsArrayBuffer(chunk);
          buffer.set(new Uint8Array(ab), offset);
          return chunk.size;
        },write:function (stream, buffer, offset, length, position) {
          throw new FS.ErrnoError(ERRNO_CODES.EIO);
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.size;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},filesystems:null,handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
  
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); }
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); }
            }
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var perms = ['r', 'w', 'rw'][flag & 3];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        var err = FS.nodePermissions(dir, 'x');
        if (err) return err;
        if (!dir.node_ops.lookup) return ERRNO_CODES.EACCES;
        return 0;
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        if (!PATH.resolve(oldpath)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        if (!old_dir || !new_dir) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        try {
          if (FS.trackingDelegate['willMovePath']) {
            FS.trackingDelegate['willMovePath'](old_path, new_path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
        try {
          if (FS.trackingDelegate['onMovePath']) FS.trackingDelegate['onMovePath'](old_path, new_path);
        } catch(e) {
          console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return PATH.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        if (path === "") {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // if asked only for a directory, then this must be one
        if ((flags & 65536) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var err = FS.mayOpen(node, flags);
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        try {
          if (FS.trackingDelegate['onOpenFile']) {
            var trackingFlags = 0;
            if ((flags & 2097155) !== 1) {
              trackingFlags |= FS.tracking.openFlags.READ;
            }
            if ((flags & 2097155) !== 0) {
              trackingFlags |= FS.tracking.openFlags.WRITE;
            }
            FS.trackingDelegate['onOpenFile'](path, trackingFlags);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: " + e.message);
        }
        return stream;
      },close:function (stream) {
        if (stream.getdents) stream.getdents = null; // free readdir state
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        try {
          if (stream.path && FS.trackingDelegate['onWriteToFile']) FS.trackingDelegate['onWriteToFile'](stream.path);
        } catch(e) {
          console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: " + e.message);
        }
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },msync:function (stream, buffer, offset, length, mmapFlags) {
        if (!stream || !stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
      },munmap:function (stream) {
        return 0;
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var buf = new Uint8Array(lengthBytesUTF8(data)+1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function(stream, buffer, offset, length, pos) { return length; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        var random_device;
        if (typeof crypto !== 'undefined') {
          // for modern web browsers
          var randomBuffer = new Uint8Array(1);
          random_device = function() { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
        } else if (ENVIRONMENT_IS_NODE) {
          // for nodejs
          random_device = function() { return require('crypto').randomBytes(1)[0]; };
        } else {
          // default for ES5 platforms
          random_device = function() { return (Math.random()*256)|0; };
        }
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createSpecialDirectories:function () {
        // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the name of the stream for fd 6 (see test_unistd_ttyname)
        FS.mkdir('/proc');
        FS.mkdir('/proc/self');
        FS.mkdir('/proc/self/fd');
        FS.mount({
          mount: function() {
            var node = FS.createNode('/proc/self', 'fd', 16384 | 0777, 73);
            node.node_ops = {
              lookup: function(parent, name) {
                var fd = +name;
                var stream = FS.getStream(fd);
                if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
                var ret = {
                  parent: null,
                  mount: { mountpoint: 'fake' },
                  node_ops: { readlink: function() { return stream.path } }
                };
                ret.parent = ret; // make it look like a simple root node
                return ret;
              }
            };
            return node;
          }
        }, {}, '/proc/self/fd');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno, node) {
          //Module.printErr(stackTrace()); // useful for debugging
          this.node = node;
          this.setErrno = function(errno) {
            this.errno = errno;
            for (var key in ERRNO_CODES) {
              if (ERRNO_CODES[key] === errno) {
                this.code = key;
                break;
              }
            }
          };
          this.setErrno(errno);
          this.message = ERRNO_MESSAGES[errno];
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
  
        FS.filesystems = {
          'MEMFS': MEMFS,
          'IDBFS': IDBFS,
          'NODEFS': NODEFS,
          'WORKERFS': WORKERFS,
        };
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        // force-flush all streams, so we get musl std streams printed out
        var fflush = Module['_fflush'];
        if (fflush) fflush(0);
        // close all of our streams
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize)|0;
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var chunkSize = 1024*1024; // Chunk size in bytes
  
          if (!hasByteServing) chunkSize = datalength;
  
          // Function to get a range from the remote URL.
          var doXHR = (function(from, to) {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
            // Some hints to the browser that we want binary data.
            if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
  
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(xhr.response || []);
            } else {
              return intArrayFromString(xhr.responseText || '', true);
            }
          });
          var lazyArray = this;
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * chunkSize;
            var end = (chunkNum+1) * chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
  
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperty(node, "usedBytes", {
            get: function() { return this.contents.length; }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency('cp ' + fullname); // might have several active requests for the same fullname
        function processData(byteArray) {
          function finish(byteArray) {
            if (preFinish) preFinish();
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency(dep);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency(dep);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency(dep);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};var SYSCALLS={DEFAULT_POLLMASK:5,mappings:{},umask:511,calculateAt:function (dirfd, path) {
        if (path[0] !== '/') {
          // relative path
          var dir;
          if (dirfd === -100) {
            dir = FS.cwd();
          } else {
            var dirstream = FS.getStream(dirfd);
            if (!dirstream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            dir = dirstream.path;
          }
          path = PATH.join2(dir, path);
        }
        return path;
      },doStat:function (func, path, buf) {
        try {
          var stat = func(path);
        } catch (e) {
          if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
            // an error occurred while trying to look up the path; we should just report ENOTDIR
            return -ERRNO_CODES.ENOTDIR;
          }
          throw e;
        }
        HEAP32[((buf)>>2)]=stat.dev;
        HEAP32[(((buf)+(4))>>2)]=0;
        HEAP32[(((buf)+(8))>>2)]=stat.ino;
        HEAP32[(((buf)+(12))>>2)]=stat.mode;
        HEAP32[(((buf)+(16))>>2)]=stat.nlink;
        HEAP32[(((buf)+(20))>>2)]=stat.uid;
        HEAP32[(((buf)+(24))>>2)]=stat.gid;
        HEAP32[(((buf)+(28))>>2)]=stat.rdev;
        HEAP32[(((buf)+(32))>>2)]=0;
        HEAP32[(((buf)+(36))>>2)]=stat.size;
        HEAP32[(((buf)+(40))>>2)]=4096;
        HEAP32[(((buf)+(44))>>2)]=stat.blocks;
        HEAP32[(((buf)+(48))>>2)]=(stat.atime.getTime() / 1000)|0;
        HEAP32[(((buf)+(52))>>2)]=0;
        HEAP32[(((buf)+(56))>>2)]=(stat.mtime.getTime() / 1000)|0;
        HEAP32[(((buf)+(60))>>2)]=0;
        HEAP32[(((buf)+(64))>>2)]=(stat.ctime.getTime() / 1000)|0;
        HEAP32[(((buf)+(68))>>2)]=0;
        HEAP32[(((buf)+(72))>>2)]=stat.ino;
        return 0;
      },doMsync:function (addr, stream, len, flags) {
        var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len));
        FS.msync(stream, buffer, 0, len, flags);
      },doMkdir:function (path, mode) {
        // remove a trailing slash, if one - /a/b/ has basename of '', but
        // we want to create b in the context of this function
        path = PATH.normalize(path);
        if (path[path.length-1] === '/') path = path.substr(0, path.length-1);
        FS.mkdir(path, mode, 0);
        return 0;
      },doMknod:function (path, mode, dev) {
        // we don't want this in the JS API as it uses mknod to create all nodes.
        switch (mode & 61440) {
          case 32768:
          case 8192:
          case 24576:
          case 4096:
          case 49152:
            break;
          default: return -ERRNO_CODES.EINVAL;
        }
        FS.mknod(path, mode, dev);
        return 0;
      },doReadlink:function (path, buf, bufsize) {
        if (bufsize <= 0) return -ERRNO_CODES.EINVAL;
        var ret = FS.readlink(path);
        ret = ret.slice(0, Math.max(0, bufsize));
        writeStringToMemory(ret, buf, true);
        return ret.length;
      },doAccess:function (path, amode) {
        if (amode & ~7) {
          // need a valid mode
          return -ERRNO_CODES.EINVAL;
        }
        var node;
        var lookup = FS.lookupPath(path, { follow: true });
        node = lookup.node;
        var perms = '';
        if (amode & 4) perms += 'r';
        if (amode & 2) perms += 'w';
        if (amode & 1) perms += 'x';
        if (perms /* otherwise, they've just passed F_OK */ && FS.nodePermissions(node, perms)) {
          return -ERRNO_CODES.EACCES;
        }
        return 0;
      },doDup:function (path, flags, suggestFD) {
        var suggest = FS.getStream(suggestFD);
        if (suggest) FS.close(suggest);
        return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
      },doReadv:function (stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[(((iov)+(i*8))>>2)];
          var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
          var curr = FS.read(stream, HEAP8,ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
          if (curr < len) break; // nothing more to read
        }
        return ret;
      },doWritev:function (stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[(((iov)+(i*8))>>2)];
          var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
          var curr = FS.write(stream, HEAP8,ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
        }
        return ret;
      },varargs:0,get:function (varargs) {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
        return ret;
      },getStr:function () {
        var ret = Pointer_stringify(SYSCALLS.get());
        return ret;
      },getStreamFromFD:function () {
        var stream = FS.getStream(SYSCALLS.get());
        if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        return stream;
      },getSocketFromFD:function () {
        var socket = SOCKFS.getSocket(SYSCALLS.get());
        if (!socket) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        return socket;
      },getSocketAddress:function (allowNull) {
        var addrp = SYSCALLS.get(), addrlen = SYSCALLS.get();
        if (allowNull && addrp === 0) return null;
        var info = __read_sockaddr(addrp, addrlen);
        if (info.errno) throw new FS.ErrnoError(info.errno);
        info.addr = DNS.lookup_addr(info.addr) || info.addr;
        return info;
      },get64:function () {
        var low = SYSCALLS.get(), high = SYSCALLS.get();
        if (low >= 0) assert(high === 0);
        else assert(high === -1);
        return low;
      },getZero:function () {
        assert(SYSCALLS.get() === 0);
      }};function ___syscall54(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // ioctl
      var stream = SYSCALLS.getStreamFromFD(), op = SYSCALLS.get();
      switch (op) {
        case 21505: {
          if (!stream.tty) return -ERRNO_CODES.ENOTTY;
          return 0;
        }
        case 21506: {
          if (!stream.tty) return -ERRNO_CODES.ENOTTY;
          return 0; // no-op, not actually adjusting terminal settings
        }
        case 21519: {
          if (!stream.tty) return -ERRNO_CODES.ENOTTY;
          var argp = SYSCALLS.get();
          HEAP32[((argp)>>2)]=0;
          return 0;
        }
        case 21520: {
          if (!stream.tty) return -ERRNO_CODES.ENOTTY;
          return -ERRNO_CODES.EINVAL; // not supported
        }
        case 21531: {
          var argp = SYSCALLS.get();
          return FS.ioctl(stream, op, argp);
        }
        default: abort('bad ioctl syscall ' + op);
      }
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function _emscripten_glSampleCoverage(x0, x1) { GLctx.sampleCoverage(x0, x1) }

  function _eglSwapBuffers() {
  
      if (!EGL.defaultDisplayInitialized) {
        EGL.setErrorCode(0x3001 /* EGL_NOT_INITIALIZED */);
      } else if (!Module.ctx) {
        EGL.setErrorCode(0x3002 /* EGL_BAD_ACCESS */);
      } else if (Module.ctx.isContextLost()) {
        EGL.setErrorCode(0x300E /* EGL_CONTEXT_LOST */);
      } else {
        // According to documentation this does an implicit flush.
        // Due to discussion at https://github.com/kripken/emscripten/pull/1871
        // the flush was removed since this _may_ result in slowing code down.
        //_glFlush();
        EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
        return 1 /* EGL_TRUE */;
      }
      return 0 /* EGL_FALSE */;
    }

  function _emscripten_glFrustum() {
  Module['printErr']('missing function: emscripten_glFrustum'); abort(-1);
  }

  function _glVertexAttrib4f(x0, x1, x2, x3, x4) { GLctx.vertexAttrib4f(x0, x1, x2, x3, x4) }

  function _emscripten_glGetTexParameterfv(target, pname, params) {
      if (!params) {
        // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
        // if p == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      HEAPF32[((params)>>2)]=GLctx.getTexParameter(target, pname);
    }

  function _emscripten_glUniform4i(location, v0, v1, v2, v3) {
      location = GL.uniforms[location];
      GLctx.uniform4i(location, v0, v1, v2, v3);
    }

  function _emscripten_glBindRenderbuffer(target, renderbuffer) {
      GLctx.bindRenderbuffer(target, renderbuffer ? GL.renderbuffers[renderbuffer] : null);
    }

  function _emscripten_glViewport(x0, x1, x2, x3) { GLctx.viewport(x0, x1, x2, x3) }

  function _dlclose(handle) {
      // int dlclose(void *handle);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/dlclose.html
      if (!DLFCN.loadedLibs[handle]) {
        DLFCN.errorMsg = 'Tried to dlclose() unopened handle: ' + handle;
        return 1;
      } else {
        var lib_record = DLFCN.loadedLibs[handle];
        if (--lib_record.refcount == 0) {
          if (lib_record.module.cleanups) {
            lib_record.module.cleanups.forEach(function(cleanup) { cleanup() });
          }
          delete DLFCN.loadedLibNames[lib_record.name];
          delete DLFCN.loadedLibs[handle];
        }
        return 0;
      }
    }

  function _emscripten_get_gamepad_status(index, gamepadState) {
      if (!navigator.getGamepads && !navigator.webkitGetGamepads) return -1;
      var gamepads;
      if (navigator.getGamepads) {
        gamepads = navigator.getGamepads();
      } else if (navigator.webkitGetGamepads) {
        gamepads = navigator.webkitGetGamepads();
      }
      if (index < 0 || index >= gamepads.length) {
        return -5;
      }
      // For previously disconnected gamepads there should be a null at the index.
      // This is because gamepads must keep their original position in the array.
      // For example, removing the first of two gamepads produces [null, gamepad].
      // Older implementations of the Gamepad API used undefined instead of null.
      // The following check works because null and undefined evaluate to false.
      if (!gamepads[index]) {
        // There is a "false" but no gamepad at index because it was disconnected.
        return -7;
      }
      // There should be a gamepad at index which can be queried.
      JSEvents.fillGamepadEventData(gamepadState, gamepads[index]);
      return 0;
    }

  var _llvm_pow_f64=Math_pow;

  function _emscripten_glCopyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) { GLctx.copyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) }

  function _emscripten_glTexParameterfv(target, pname, params) {
      var param = HEAPF32[((params)>>2)];
      GLctx.texParameterf(target, pname, param);
    }

  var _emscripten_preinvoke=true;

  function _emscripten_glDepthRangef(x0, x1) { GLctx.depthRange(x0, x1) }

  function _glUniform1f(location, v0) {
      location = GL.uniforms[location];
      GLctx.uniform1f(location, v0);
    }

  function _emscripten_glUniform3f(location, v0, v1, v2) {
      location = GL.uniforms[location];
      GLctx.uniform3f(location, v0, v1, v2);
    }

  function _emscripten_glGetObjectParameterivARB() {
  Module['printErr']('missing function: emscripten_glGetObjectParameterivARB'); abort(-1);
  }

  function _emscripten_glBlendFunc(x0, x1) { GLctx.blendFunc(x0, x1) }

  function _emscripten_glUniform3i(location, v0, v1, v2) {
      location = GL.uniforms[location];
      GLctx.uniform3i(location, v0, v1, v2);
    }

  function _emscripten_glStencilOp(x0, x1, x2) { GLctx.stencilOp(x0, x1, x2) }

  function _glCreateShader(shaderType) {
      var id = GL.getNewId(GL.shaders);
      GL.shaders[id] = GLctx.createShader(shaderType);
      return id;
    }

  function _glUniform1i(location, v0) {
      location = GL.uniforms[location];
      GLctx.uniform1i(location, v0);
    }

  function _emscripten_glBindAttribLocation(program, index, name) {
      name = Pointer_stringify(name);
      GLctx.bindAttribLocation(GL.programs[program], index, name);
    }

  function _glGenRenderbuffers(n, renderbuffers) {
      for (var i = 0; i < n; i++) {
        var renderbuffer = GLctx.createRenderbuffer();
        if (!renderbuffer) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
          while(i < n) HEAP32[(((renderbuffers)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.renderbuffers);
        renderbuffer.name = id;
        GL.renderbuffers[id] = renderbuffer;
        HEAP32[(((renderbuffers)+(i*4))>>2)]=id;
      }
    }

  var _cosf=Math_cos;

  function _glDisable(x0) { GLctx.disable(x0) }

  function _emscripten_glEnableVertexAttribArray(index) {
      GLctx.enableVertexAttribArray(index);
    }

   
  Module["_memset"] = _memset;

  var _BDtoILow=true;

  function _emscripten_glUniform1i(location, v0) {
      location = GL.uniforms[location];
      GLctx.uniform1i(location, v0);
    }

  
  
  
  
  function _emscripten_set_main_loop_timing(mode, value) {
      Browser.mainLoop.timingMode = mode;
      Browser.mainLoop.timingValue = value;
  
      if (!Browser.mainLoop.func) {
        console.error('emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.');
        return 1; // Return non-zero on failure, can't set timing mode when there is no main loop.
      }
  
      if (mode == 0 /*EM_TIMING_SETTIMEOUT*/) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
          setTimeout(Browser.mainLoop.runner, value); // doing this each time means that on exception, we stop
        };
        Browser.mainLoop.method = 'timeout';
      } else if (mode == 1 /*EM_TIMING_RAF*/) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
          Browser.requestAnimationFrame(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'rAF';
      } else if (mode == 2 /*EM_TIMING_SETIMMEDIATE*/) {
        if (!window['setImmediate']) {
          // Emulate setImmediate. (note: not a complete polyfill, we don't emulate clearImmediate() to keep code size to minimum, since not needed)
          var setImmediates = [];
          var emscriptenMainLoopMessageId = '__emcc';
          function Browser_setImmediate_messageHandler(event) {
            if (event.source === window && event.data === emscriptenMainLoopMessageId) {
              event.stopPropagation();
              setImmediates.shift()();
            }
          }
          window.addEventListener("message", Browser_setImmediate_messageHandler, true);
          window['setImmediate'] = function Browser_emulated_setImmediate(func) {
            setImmediates.push(func);
            window.postMessage(emscriptenMainLoopMessageId, "*");
          }
        }
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
          window['setImmediate'](Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'immediate';
      }
      return 0;
    }function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
      Module['noExitRuntime'] = true;
  
      assert(!Browser.mainLoop.func, 'emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.');
  
      Browser.mainLoop.func = func;
      Browser.mainLoop.arg = arg;
  
      var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
  
      Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT) return;
        if (Browser.mainLoop.queue.length > 0) {
          var start = Date.now();
          var blocker = Browser.mainLoop.queue.shift();
          blocker.func(blocker.arg);
          if (Browser.mainLoop.remainingBlockers) {
            var remaining = Browser.mainLoop.remainingBlockers;
            var next = remaining%1 == 0 ? remaining-1 : Math.floor(remaining);
            if (blocker.counted) {
              Browser.mainLoop.remainingBlockers = next;
            } else {
              // not counted, but move the progress along a tiny bit
              next = next + 0.5; // do not steal all the next one's progress
              Browser.mainLoop.remainingBlockers = (8*remaining + next)/9;
            }
          }
          console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + ' ms'); //, left: ' + Browser.mainLoop.remainingBlockers);
          Browser.mainLoop.updateStatus();
          setTimeout(Browser.mainLoop.runner, 0);
          return;
        }
  
        // catch pauses from non-main loop sources
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  
        // Implement very basic swap interval control
        Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
        if (Browser.mainLoop.timingMode == 1/*EM_TIMING_RAF*/ && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
          // Not the scheduled time to render this frame - skip.
          Browser.mainLoop.scheduler();
          return;
        }
  
        // Signal GL rendering layer that processing of a new frame is about to start. This helps it optimize
        // VBO double-buffering and reduce GPU stalls.
  
        if (Browser.mainLoop.method === 'timeout' && Module.ctx) {
          Module.printErr('Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!');
          Browser.mainLoop.method = ''; // just warn once per call to set main loop
        }
  
        Browser.mainLoop.runIter(function() {
          if (typeof arg !== 'undefined') {
            Runtime.dynCall('vi', func, [arg]);
          } else {
            Runtime.dynCall('v', func);
          }
        });
  
        // catch pauses from the main loop itself
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  
        // Queue new audio data. This is important to be right after the main loop invocation, so that we will immediately be able
        // to queue the newest produced audio samples.
        // TODO: Consider adding pre- and post- rAF callbacks so that GL.newRenderingFrameStarted() and SDL.audio.queueNewAudioData()
        //       do not need to be hardcoded into this function, but can be more generic.
        if (typeof SDL === 'object' && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  
        Browser.mainLoop.scheduler();
      }
  
      if (!noSetTiming) {
        if (fps && fps > 0) _emscripten_set_main_loop_timing(0/*EM_TIMING_SETTIMEOUT*/, 1000.0 / fps);
        else _emscripten_set_main_loop_timing(1/*EM_TIMING_RAF*/, 1); // Do rAF by rendering each frame (no decimating)
  
        Browser.mainLoop.scheduler();
      }
  
      if (simulateInfiniteLoop) {
        throw 'SimulateInfiniteLoop';
      }
    }var Browser={mainLoop:{scheduler:null,method:"",currentlyRunningMainloop:0,func:null,arg:0,timingMode:0,timingValue:0,currentFrameNumber:0,queue:[],pause:function () {
          Browser.mainLoop.scheduler = null;
          Browser.mainLoop.currentlyRunningMainloop++; // Incrementing this signals the previous main loop that it's now become old, and it must return.
        },resume:function () {
          Browser.mainLoop.currentlyRunningMainloop++;
          var timingMode = Browser.mainLoop.timingMode;
          var timingValue = Browser.mainLoop.timingValue;
          var func = Browser.mainLoop.func;
          Browser.mainLoop.func = null;
          _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true /* do not set timing and call scheduler, we will do it on the next lines */);
          _emscripten_set_main_loop_timing(timingMode, timingValue);
          Browser.mainLoop.scheduler();
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        },runIter:function (func) {
          if (ABORT) return;
          if (Module['preMainLoop']) {
            var preRet = Module['preMainLoop']();
            if (preRet === false) {
              return; // |return false| skips a frame
            }
          }
          try {
            func();
          } catch (e) {
            if (e instanceof ExitStatus) {
              return;
            } else {
              if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
              throw e;
            }
          }
          if (Module['postMainLoop']) Module['postMainLoop']();
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
          
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      function(){};
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   function(){}; // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", function(ev) {
              if (!Browser.pointerLock && canvas.requestPointerLock) {
                canvas.requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx; // no need to recreate GL context if it's already been created for this canvas.
  
        var ctx;
        var contextHandle;
        if (useWebGL) {
          // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
          var contextAttributes = {
            antialias: false,
            alpha: false
          };
  
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute];
            }
          }
  
          contextHandle = GL.createContext(canvas, contextAttributes);
          if (contextHandle) {
            ctx = GL.getContext(contextHandle).GLctx;
          }
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
        } else {
          ctx = canvas.getContext('2d');
        }
  
        if (!ctx) return null;
  
        if (setInModule) {
          if (!useWebGL) assert(typeof GLctx === 'undefined', 'cannot set in module if GLctx is used, but we are a non-GL context that would replace it');
  
          Module.ctx = ctx;
          if (useWebGL) GL.makeContextCurrent(contextHandle);
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas, vrDevice) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        Browser.vrDevice = vrDevice;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        if (typeof Browser.vrDevice === 'undefined') Browser.vrDevice = null;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
  
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
  
        if (vrDevice) {
          canvasContainer.requestFullScreen({ vrDisplay: vrDevice });
        } else {
          canvasContainer.requestFullScreen();
        }
      },nextRAF:0,fakeRequestAnimationFrame:function (func) {
        // try to keep 60fps between calls to here
        var now = Date.now();
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1000/60;
        } else {
          while (now + 2 >= Browser.nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
            Browser.nextRAF += 1000/60;
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          Browser.fakeRequestAnimationFrame(func);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           Browser.fakeRequestAnimationFrame;
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },allowAsyncCallbacks:true,queuedAsyncCallbacks:[],pauseAsyncCallbacks:function () {
        Browser.allowAsyncCallbacks = false;
      },resumeAsyncCallbacks:function () { // marks future callbacks as ok to execute, and synchronously runs any remaining ones right now
        Browser.allowAsyncCallbacks = true;
        if (Browser.queuedAsyncCallbacks.length > 0) {
          var callbacks = Browser.queuedAsyncCallbacks;
          Browser.queuedAsyncCallbacks = [];
          callbacks.forEach(function(func) {
            func();
          });
        }
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (ABORT) return;
          if (Browser.allowAsyncCallbacks) {
            func();
          } else {
            Browser.queuedAsyncCallbacks.push(func);
          }
        });
      },safeSetTimeout:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setTimeout(function() {
          if (ABORT) return;
          if (Browser.allowAsyncCallbacks) {
            func();
          } else {
            Browser.queuedAsyncCallbacks.push(func);
          }
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setInterval(function() {
          if (ABORT) return;
          if (Browser.allowAsyncCallbacks) {
            func();
          } // drop it on the floor otherwise, next interval will kick in
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll': 
            delta = event.detail;
            break;
          case 'mousewheel': 
            delta = event.wheelDelta;
            break;
          case 'wheel': 
            delta = event['deltaY'];
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return delta;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              var last = Browser.touches[touch.identifier];
              if (!last) last = coords;
              Browser.lastTouches[touch.identifier] = last;
              Browser.touches[touch.identifier] = coords;
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      },wgetRequests:{},nextWgetRequestHandle:0,getNextWgetRequestHandle:function () {
        var handle = Browser.nextWgetRequestHandle;
        Browser.nextWgetRequestHandle++;
        return handle;
      }};var AL={contexts:[],currentContext:null,alcErr:0,stringCache:{},alcStringCache:{},QUEUE_INTERVAL:25,QUEUE_LOOKAHEAD:100,newSrcId:1,updateSources:function updateSources(context) {
        // If we are animating using the requestAnimationFrame method, then the main loop does not run when in the background.
        // To give a perfect glitch-free audio stop when switching from foreground to background, we need to avoid updating
        // audio altogether when in the background, so detect that case and kill audio buffer streaming if so.
        if (Browser.mainLoop.timingMode == 1/*EM_TIMING_RAF*/ && document['visibilityState'] != 'visible') return;
  
        for (var srcId in context.src) {
          AL.updateSource(context.src[srcId]);
        }
      },updateSource:function updateSource(src) {
        if (src.state !== 0x1012 /* AL_PLAYING */) {
          return;
        }
  
        var currentTime = AL.currentContext.ctx.currentTime;
        var startTime = src.bufferPosition;
  
        for (var i = src.buffersPlayed; i < src.queue.length; i++) {
          var entry = src.queue[i];
  
          var startOffset = startTime - currentTime;
          var endTime = startTime + entry.buffer.duration;
  
          // Clean up old buffers.
          if (currentTime >= endTime) {
            // Update our location in the queue.
            src.bufferPosition = endTime;
            src.buffersPlayed = i + 1;
  
            // Stop / restart the source when we hit the end.
            if (src.buffersPlayed >= src.queue.length) {
              if (src.loop) {
                AL.setSourceState(src, 0x1012 /* AL_PLAYING */);
              } else {
                AL.setSourceState(src, 0x1014 /* AL_STOPPED */);
              }
            }
          }
          // Process all buffers that'll be played before the next tick.
          else if (startOffset < (AL.QUEUE_LOOKAHEAD / 1000) && !entry.src) {
            // If the start offset is negative, we need to offset the actual buffer.
            var offset = Math.abs(Math.min(startOffset, 0));
  
            entry.src = AL.currentContext.ctx.createBufferSource();
            entry.src.buffer = entry.buffer;
            entry.src.connect(src.gain);
            if (typeof(entry.src.start) !== 'undefined') {
              entry.src.start(startTime, offset);
            } else if (typeof(entry.src.noteOn) !== 'undefined') {
              entry.src.noteOn(startTime);
            }
          }
  
          startTime = endTime;
        }
      },setSourceState:function setSourceState(src, state) {
        if (state === 0x1012 /* AL_PLAYING */) {
          if (src.state !== 0x1013 /* AL_PAUSED */) {
            src.state = 0x1012 /* AL_PLAYING */;
            // Reset our position.
            src.bufferPosition = AL.currentContext.ctx.currentTime;
            src.buffersPlayed = 0;
          } else {
            src.state = 0x1012 /* AL_PLAYING */;
            // Use the current offset from src.bufferPosition to resume at the correct point.
            src.bufferPosition = AL.currentContext.ctx.currentTime - src.bufferPosition;
          }
          AL.stopSourceQueue(src);
          AL.updateSource(src);
        } else if (state === 0x1013 /* AL_PAUSED */) {
          if (src.state === 0x1012 /* AL_PLAYING */) {
            src.state = 0x1013 /* AL_PAUSED */;
            // Store off the current offset to restore with on resume.
            src.bufferPosition = AL.currentContext.ctx.currentTime - src.bufferPosition;
            AL.stopSourceQueue(src);
          }
        } else if (state === 0x1014 /* AL_STOPPED */) {
          if (src.state !== 0x1011 /* AL_INITIAL */) {
            src.state = 0x1014 /* AL_STOPPED */;
            src.buffersPlayed = src.queue.length;
            AL.stopSourceQueue(src);
          }
        } else if (state == 0x1011 /* AL_INITIAL */) {
          if (src.state !== 0x1011 /* AL_INITIAL */) {
            src.state = 0x1011 /* AL_INITIAL */;
            src.bufferPosition = 0;
            src.buffersPlayed = 0;
          }
        }
      },stopSourceQueue:function stopSourceQueue(src) {
        for (var i = 0; i < src.queue.length; i++) {
          var entry = src.queue[i];
          if (entry.src) {
            entry.src.stop(0);
            entry.src = null;
          }
        }
      }};function _alDeleteBuffers(count, buffers)
    {
      if (!AL.currentContext) {
        return;
      }
      if (count > AL.currentContext.buf.length) {
        AL.currentContext.err = 0xA003 /* AL_INVALID_VALUE */;
        return;
      }
  
      for (var i = 0; i < count; ++i) {
        var bufferIdx = HEAP32[(((buffers)+(i*4))>>2)] - 1;
  
        // Make sure the buffer index is valid.
        if (bufferIdx >= AL.currentContext.buf.length || !AL.currentContext.buf[bufferIdx]) {
          AL.currentContext.err = 0xA001 /* AL_INVALID_NAME */;
          return;
        }
  
        // Make sure the buffer is no longer in use.
        var buffer = AL.currentContext.buf[bufferIdx];
        for (var srcId in AL.currentContext.src) {
          var src = AL.currentContext.src[srcId];
          if (!src) {
            continue;
          }
          for (var k = 0; k < src.queue.length; k++) {
            if (buffer === src.queue[k].buffer) {
              AL.currentContext.err = 0xA004 /* AL_INVALID_OPERATION */;
              return;
            }
          }
        }
      }
  
      for (var i = 0; i < count; ++i) {
        var bufferIdx = HEAP32[(((buffers)+(i*4))>>2)] - 1;
        delete AL.currentContext.buf[bufferIdx];
      }
    }

  function _glBindTexture(target, texture) {
      GLctx.bindTexture(target, texture ? GL.textures[texture] : null);
    }

  
  function emscriptenWebGLGet(name_, p, type) {
      // Guard against user passing a null pointer.
      // Note that GLES2 spec does not say anything about how passing a null pointer should be treated.
      // Testing on desktop core GL 3, the application crashes on glGetIntegerv to a null pointer, but
      // better to report an error instead of doing anything random.
      if (!p) {
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      var ret = undefined;
      switch(name_) { // Handle a few trivial GLES values
        case 0x8DFA: // GL_SHADER_COMPILER
          ret = 1;
          break;
        case 0x8DF8: // GL_SHADER_BINARY_FORMATS
          if (type !== 'Integer' && type !== 'Integer64') {
            GL.recordError(0x0500); // GL_INVALID_ENUM
          }
          return; // Do not write anything to the out pointer, since no binary formats are supported.
        case 0x8DF9: // GL_NUM_SHADER_BINARY_FORMATS
          ret = 0;
          break;
        case 0x86A2: // GL_NUM_COMPRESSED_TEXTURE_FORMATS
          // WebGL doesn't have GL_NUM_COMPRESSED_TEXTURE_FORMATS (it's obsolete since GL_COMPRESSED_TEXTURE_FORMATS returns a JS array that can be queried for length),
          // so implement it ourselves to allow C++ GLES2 code get the length.
          var formats = GLctx.getParameter(0x86A3 /*GL_COMPRESSED_TEXTURE_FORMATS*/);
          ret = formats.length;
          break;
        case 0x8B9A: // GL_IMPLEMENTATION_COLOR_READ_TYPE
          ret = 0x1401; // GL_UNSIGNED_BYTE
          break;
        case 0x8B9B: // GL_IMPLEMENTATION_COLOR_READ_FORMAT
          ret = 0x1908; // GL_RGBA
          break;
      }
  
      if (ret === undefined) {
        var result = GLctx.getParameter(name_);
        switch (typeof(result)) {
          case "number":
            ret = result;
            break;
          case "boolean":
            ret = result ? 1 : 0;
            break;
          case "string":
            GL.recordError(0x0500); // GL_INVALID_ENUM
            return;
          case "object":
            if (result === null) {
              // null is a valid result for some (e.g., which buffer is bound - perhaps nothing is bound), but otherwise
              // can mean an invalid name_, which we need to report as an error
              switch(name_) {
                case 0x8894: // ARRAY_BUFFER_BINDING
                case 0x8B8D: // CURRENT_PROGRAM
                case 0x8895: // ELEMENT_ARRAY_BUFFER_BINDING
                case 0x8CA6: // FRAMEBUFFER_BINDING
                case 0x8CA7: // RENDERBUFFER_BINDING
                case 0x8069: // TEXTURE_BINDING_2D
                case 0x8514: { // TEXTURE_BINDING_CUBE_MAP
                  ret = 0;
                  break;
                }
                default: {
                  GL.recordError(0x0500); // GL_INVALID_ENUM
                  return;
                }
              }
            } else if (result instanceof Float32Array ||
                       result instanceof Uint32Array ||
                       result instanceof Int32Array ||
                       result instanceof Array) {
              for (var i = 0; i < result.length; ++i) {
                switch (type) {
                  case 'Integer': HEAP32[(((p)+(i*4))>>2)]=result[i];   break;
                  case 'Float':   HEAPF32[(((p)+(i*4))>>2)]=result[i]; break;
                  case 'Boolean': HEAP8[(((p)+(i))>>0)]=result[i] ? 1 : 0;    break;
                  default: throw 'internal glGet error, bad type: ' + type;
                }
              }
              return;
            } else if (result instanceof WebGLBuffer ||
                       result instanceof WebGLProgram ||
                       result instanceof WebGLFramebuffer ||
                       result instanceof WebGLRenderbuffer ||
                       result instanceof WebGLTexture) {
              ret = result.name | 0;
            } else {
              GL.recordError(0x0500); // GL_INVALID_ENUM
              return;
            }
            break;
          default:
            GL.recordError(0x0500); // GL_INVALID_ENUM
            return;
        }
      }
  
      switch (type) {
        case 'Integer64': (tempI64 = [ret>>>0,(tempDouble=ret,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((p)>>2)]=tempI64[0],HEAP32[(((p)+(4))>>2)]=tempI64[1]);    break;
        case 'Integer': HEAP32[((p)>>2)]=ret;    break;
        case 'Float':   HEAPF32[((p)>>2)]=ret;  break;
        case 'Boolean': HEAP8[((p)>>0)]=ret ? 1 : 0; break;
        default: throw 'internal glGet error, bad type: ' + type;
      }
    }function _glGetIntegerv(name_, p) {
      emscriptenWebGLGet(name_, p, 'Integer');
    }

  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }


  function _emscripten_glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) { GLctx.copyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) }

  function _emscripten_set_touchcancel_callback(target, userData, useCapture, callbackfunc) {
      JSEvents.registerTouchEventCallback(target, userData, useCapture, callbackfunc, 25, "touchcancel");
      return 0;
    }

  function _glBindFramebuffer(target, framebuffer) {
      GLctx.bindFramebuffer(target, framebuffer ? GL.framebuffers[framebuffer] : null);
    }

  function ___lock() {}

  function _emscripten_glBlendFuncSeparate(x0, x1, x2, x3) { GLctx.blendFuncSeparate(x0, x1, x2, x3) }

  function _glCullFace(x0) { GLctx.cullFace(x0) }

  function _emscripten_glGetVertexAttribPointerv(index, pname, pointer) {
      if (!pointer) {
        // GLES2 specification does not specify how to behave if pointer is a null pointer. Since calling this function does not make sense
        // if pointer == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      HEAP32[((pointer)>>2)]=GLctx.getVertexAttribOffset(index, pname);
    }

  function _emscripten_glVertexAttrib3f(x0, x1, x2, x3) { GLctx.vertexAttrib3f(x0, x1, x2, x3) }

  function _alSource3f(source, param, v1, v2, v3) {
      if (!AL.currentContext) {
        return;
      }
      var src = AL.currentContext.src[source];
      if (!src) {
        AL.currentContext.err = 0xA001 /* AL_INVALID_NAME */;
        return;
      }
      switch (param) {
      case 0x1004 /* AL_POSITION */:
        src.position = [v1, v2, v3];
        break;
      case 0x1005 /* AL_DIRECTION */:
        src.direction = [v1, v2, v3];
        break;
      case 0x1006 /* AL_VELOCITY */:
        src.velocity = [v1, v2, v3];
        break;
      default:
        AL.currentContext.err = 0xA002 /* AL_INVALID_ENUM */;
        break;
      }
    }

  function ___cxa_guard_abort() {}

  function _emscripten_set_mousemove_callback(target, userData, useCapture, callbackfunc) {
      JSEvents.registerMouseEventCallback(target, userData, useCapture, callbackfunc, 8, "mousemove");
      return 0;
    }

  function _emscripten_glNormalPointer() {
  Module['printErr']('missing function: emscripten_glNormalPointer'); abort(-1);
  }

  
  var _emscripten_GetProcAddress=undefined;
  Module["_emscripten_GetProcAddress"] = _emscripten_GetProcAddress;function _eglGetProcAddress(name_) {
      return _emscripten_GetProcAddress(name_);
    }

  var _abs=Math_abs;


  function _glRenderbufferStorage(x0, x1, x2, x3) { GLctx.renderbufferStorage(x0, x1, x2, x3) }

  function _emscripten_get_pointerlock_status(pointerlockStatus) {
      if (pointerlockStatus) JSEvents.fillPointerlockChangeEventData(pointerlockStatus);
      if (!document.body.requestPointerLock && !document.body.mozRequestPointerLock && !document.body.webkitRequestPointerLock && !document.body.msRequestPointerLock) {
        return -1;
      }
      return 0;
    }

  
  var _setSourceState=undefined;function _alSourcePlay(source) {
      if (!AL.currentContext) {
        return;
      }
      var src = AL.currentContext.src[source];
      if (!src) {
        AL.currentContext.err = 0xA001 /* AL_INVALID_NAME */;
        return;
      }
      AL.setSourceState(src, 0x1012 /* AL_PLAYING */);
    }

  function _glAttachShader(program, shader) {
      GLctx.attachShader(GL.programs[program],
                              GL.shaders[shader]);
    }

  function _eglSwapInterval(display, interval) {
      if (display != 62000 /* Magic ID for Emscripten 'default display' */) {
        EGL.setErrorCode(0x3008 /* EGL_BAD_DISPLAY */);
        return 0;
      }
      if (interval == 0) _emscripten_set_main_loop_timing(0/*EM_TIMING_SETTIMEOUT*/, 0);
      else _emscripten_set_main_loop_timing(1/*EM_TIMING_RAF*/, interval);
  
      EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
      return 1;
    }

  
  function emscriptenWebGLGetVertexAttrib(index, pname, params, type) {
      if (!params) {
        // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
        // if params == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      var data = GLctx.getVertexAttrib(index, pname);
      if (typeof data == 'number' || typeof data == 'boolean') {
        switch (type) {
          case 'Integer': HEAP32[((params)>>2)]=data; break;
          case 'Float': HEAPF32[((params)>>2)]=data; break;
          case 'FloatToInteger': HEAP32[((params)>>2)]=Math.fround(data); break;
          default: throw 'internal emscriptenWebGLGetVertexAttrib() error, bad type: ' + type;
        }
      } else {
        for (var i = 0; i < data.length; i++) {
          switch (type) {
            case 'Integer': HEAP32[(((params)+(i))>>2)]=data[i]; break;
            case 'Float': HEAPF32[(((params)+(i))>>2)]=data[i]; break;
            case 'FloatToInteger': HEAP32[(((params)+(i))>>2)]=Math.fround(data[i]); break;
            default: throw 'internal emscriptenWebGLGetVertexAttrib() error, bad type: ' + type;
          }
        }
      }
    }function _emscripten_glGetVertexAttribfv(index, pname, params) {
      // N.B. This function may only be called if the vertex attribute was specified using the function glVertexAttrib*f(),
      // otherwise the results are undefined. (GLES3 spec 6.1.12)
      emscriptenWebGLGetVertexAttrib(index, pname, params, 'Float');
    }

  function _glDeleteProgram(id) {
      if (!id) return;
      var program = GL.programs[id];
      if (!program) { // glDeleteProgram actually signals an error when deleting a nonexisting object, unlike some other GL delete functions.
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      GLctx.deleteProgram(program);
      program.name = 0;
      GL.programs[id] = null;
      GL.programInfos[id] = null;
    }

  function _emscripten_set_touchstart_callback(target, userData, useCapture, callbackfunc) {
      JSEvents.registerTouchEventCallback(target, userData, useCapture, callbackfunc, 22, "touchstart");
      return 0;
    }

  function _glUniform3f(location, v0, v1, v2) {
      location = GL.uniforms[location];
      GLctx.uniform3f(location, v0, v1, v2);
    }

  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[((variable)>>0)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[((variable)>>0)]=1;
        return 1;
      }
      return 0;
    }

  function _emscripten_glDrawArraysInstanced(mode, first, count, primcount) {
      GLctx['drawArraysInstanced'](mode, first, count, primcount);
    }

  function _emscripten_glDeleteBuffers(n, buffers) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((buffers)+(i*4))>>2)];
        var buffer = GL.buffers[id];
  
        // From spec: "glDeleteBuffers silently ignores 0's and names that do not
        // correspond to existing buffer objects."
        if (!buffer) continue;
  
        GLctx.deleteBuffer(buffer);
        buffer.name = 0;
        GL.buffers[id] = null;
  
        if (id == GL.currArrayBuffer) GL.currArrayBuffer = 0;
        if (id == GL.currElementArrayBuffer) GL.currElementArrayBuffer = 0;
      }
    }

  function _glDrawElements(mode, count, type, indices) {
  
      GLctx.drawElements(mode, count, type, indices);
  
    }

  var _sinf=Math_sin;

  function _emscripten_glUniformMatrix2fv(location, count, transpose, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform matrix
        view = GL.miniTempBufferViews[3];
        for (var i = 0; i < 4; i++) {
          view[i] = HEAPF32[(((value)+(i*4))>>2)];
        }
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*16)>>2);
      }
      GLctx.uniformMatrix2fv(location, transpose, view);
    }

  function _emscripten_glDeleteShader(id) {
      if (!id) return;
      var shader = GL.shaders[id];
      if (!shader) { // glDeleteShader actually signals an error when deleting a nonexisting object, unlike some other GL delete functions.
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      GLctx.deleteShader(shader);
      GL.shaders[id] = null;
    }

  function ___syscall5(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // open
      var pathname = SYSCALLS.getStr(), flags = SYSCALLS.get(), mode = SYSCALLS.get() // optional TODO
      var stream = FS.open(pathname, flags, mode);
      return stream.fd;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall6(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // close
      var stream = SYSCALLS.getStreamFromFD();
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  var _cos=Math_cos;

  function _emscripten_glGetVertexAttribiv(index, pname, params) {
      // N.B. This function may only be called if the vertex attribute was specified using the function glVertexAttrib*f(),
      // otherwise the results are undefined. (GLES3 spec 6.1.12)
      emscriptenWebGLGetVertexAttrib(index, pname, params, 'FloatToInteger');
    }

  function _emscripten_glUniformMatrix4fv(location, count, transpose, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform matrix
        view = GL.miniTempBufferViews[15];
        for (var i = 0; i < 16; i++) {
          view[i] = HEAPF32[(((value)+(i*4))>>2)];
        }
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*64)>>2);
      }
      GLctx.uniformMatrix4fv(location, transpose, view);
    }

  function _glGenerateMipmap(x0) { GLctx.generateMipmap(x0) }

  function _emscripten_glEnableClientState() {
  Module['printErr']('missing function: emscripten_glEnableClientState'); abort(-1);
  }

  function _emscripten_glGetPointerv() {
  Module['printErr']('missing function: emscripten_glGetPointerv'); abort(-1);
  }

  function _eglChooseConfig(display, attrib_list, configs, config_size, numConfigs) { 
      return EGL.chooseConfig(display, attrib_list, configs, config_size, numConfigs);
    }

  function ___syscall146(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // writev
      var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
      return SYSCALLS.doWritev(stream, iov, iovcnt);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function _alSourcefv(source, param, value) {
      _alSource3f(source, param,
        HEAPF32[((value)>>2)],
        HEAPF32[(((value)+(4))>>2)],
        HEAPF32[(((value)+(8))>>2)]);
    }

  function ___syscall145(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // readv
      var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
      return SYSCALLS.doReadv(stream, iov, iovcnt);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function _emscripten_glStencilMask(x0) { GLctx.stencilMask(x0) }

  function _emscripten_glStencilFuncSeparate(x0, x1, x2, x3) { GLctx.stencilFuncSeparate(x0, x1, x2, x3) }

  function _eglGetConfigAttrib(display, config, attribute, value) {
      if (display != 62000 /* Magic ID for Emscripten 'default display' */) {
        EGL.setErrorCode(0x3008 /* EGL_BAD_DISPLAY */);
        return 0;
      }
      if (config != 62002 /* Magic ID for the only EGLConfig supported by Emscripten */) {
        EGL.setErrorCode(0x3005 /* EGL_BAD_CONFIG */);
        return 0;
      }
      if (!value) {
        EGL.setErrorCode(0x300C /* EGL_BAD_PARAMETER */);
        return 0;
      }
      EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
      switch(attribute) {
      case 0x3020: // EGL_BUFFER_SIZE
        HEAP32[((value)>>2)]=32;
        return 1;
      case 0x3021: // EGL_ALPHA_SIZE
        HEAP32[((value)>>2)]=8;
        return 1;
      case 0x3022: // EGL_BLUE_SIZE
        HEAP32[((value)>>2)]=8;
        return 1;
      case 0x3023: // EGL_GREEN_SIZE
        HEAP32[((value)>>2)]=8;
        return 1;
      case 0x3024: // EGL_RED_SIZE
        HEAP32[((value)>>2)]=8;
        return 1;
      case 0x3025: // EGL_DEPTH_SIZE
        HEAP32[((value)>>2)]=24;
        return 1;
      case 0x3026: // EGL_STENCIL_SIZE
        HEAP32[((value)>>2)]=8;
        return 1;
      case 0x3027: // EGL_CONFIG_CAVEAT
        // We can return here one of EGL_NONE (0x3038), EGL_SLOW_CONFIG (0x3050) or EGL_NON_CONFORMANT_CONFIG (0x3051).
        HEAP32[((value)>>2)]=0x3038;
        return 1;
      case 0x3028: // EGL_CONFIG_ID
        HEAP32[((value)>>2)]=62002;
        return 1;
      case 0x3029: // EGL_LEVEL
        HEAP32[((value)>>2)]=0;
        return 1;
      case 0x302A: // EGL_MAX_PBUFFER_HEIGHT
        HEAP32[((value)>>2)]=4096;
        return 1;
      case 0x302B: // EGL_MAX_PBUFFER_PIXELS
        HEAP32[((value)>>2)]=16777216;
        return 1;
      case 0x302C: // EGL_MAX_PBUFFER_WIDTH
        HEAP32[((value)>>2)]=4096;
        return 1;
      case 0x302D: // EGL_NATIVE_RENDERABLE
        HEAP32[((value)>>2)]=0;
        return 1;
      case 0x302E: // EGL_NATIVE_VISUAL_ID
        HEAP32[((value)>>2)]=0;
        return 1;
      case 0x302F: // EGL_NATIVE_VISUAL_TYPE
        HEAP32[((value)>>2)]=0x3038;
        return 1;
      case 0x3031: // EGL_SAMPLES
        HEAP32[((value)>>2)]=4;
        return 1;
      case 0x3032: // EGL_SAMPLE_BUFFERS
        HEAP32[((value)>>2)]=1;
        return 1;
      case 0x3033: // EGL_SURFACE_TYPE
        HEAP32[((value)>>2)]=0x0004;
        return 1;
      case 0x3034: // EGL_TRANSPARENT_TYPE
        // If this returns EGL_TRANSPARENT_RGB (0x3052), transparency is used through color-keying. No such thing applies to Emscripten canvas.
        HEAP32[((value)>>2)]=0x3038;
        return 1;
      case 0x3035: // EGL_TRANSPARENT_BLUE_VALUE
      case 0x3036: // EGL_TRANSPARENT_GREEN_VALUE
      case 0x3037: // EGL_TRANSPARENT_RED_VALUE
        // "If EGL_TRANSPARENT_TYPE is EGL_NONE, then the values for EGL_TRANSPARENT_RED_VALUE, EGL_TRANSPARENT_GREEN_VALUE, and EGL_TRANSPARENT_BLUE_VALUE are undefined."
        HEAP32[((value)>>2)]=-1;
        return 1;
      case 0x3039: // EGL_BIND_TO_TEXTURE_RGB
      case 0x303A: // EGL_BIND_TO_TEXTURE_RGBA
        HEAP32[((value)>>2)]=0;
        return 1;
      case 0x303B: // EGL_MIN_SWAP_INTERVAL
      case 0x303C: // EGL_MAX_SWAP_INTERVAL
        HEAP32[((value)>>2)]=1;
        return 1;
      case 0x303D: // EGL_LUMINANCE_SIZE
      case 0x303E: // EGL_ALPHA_MASK_SIZE
        HEAP32[((value)>>2)]=0;
        return 1;
      case 0x303F: // EGL_COLOR_BUFFER_TYPE
        // EGL has two types of buffers: EGL_RGB_BUFFER and EGL_LUMINANCE_BUFFER.
        HEAP32[((value)>>2)]=0x308E;
        return 1;
      case 0x3040: // EGL_RENDERABLE_TYPE
        // A bit combination of EGL_OPENGL_ES_BIT,EGL_OPENVG_BIT,EGL_OPENGL_ES2_BIT and EGL_OPENGL_BIT.
        HEAP32[((value)>>2)]=0x0004;
        return 1;
      case 0x3042: // EGL_CONFORMANT
        // "EGL_CONFORMANT is a mask indicating if a client API context created with respect to the corresponding EGLConfig will pass the required conformance tests for that API."
        HEAP32[((value)>>2)]=0;
        return 1;
      default:
        EGL.setErrorCode(0x3004 /* EGL_BAD_ATTRIBUTE */);
        return 0;
      }
    }

  var _fabsf=Math_abs;

   
  Module["_i64Add"] = _i64Add;

  function _emscripten_glClearDepthf(x0) { GLctx.clearDepth(x0) }

  
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  
  
  function ___resumeException(ptr) {
      if (!EXCEPTIONS.last) { EXCEPTIONS.last = ptr; }
      EXCEPTIONS.clearRef(EXCEPTIONS.deAdjust(ptr)); // exception refcount should be cleared, but don't free it
      throw ptr;
    }function ___cxa_find_matching_catch() {
      var thrown = EXCEPTIONS.last;
      if (!thrown) {
        // just pass through the null ptr
        return ((asm["setTempRet0"](0),0)|0);
      }
      var info = EXCEPTIONS.infos[thrown];
      var throwntype = info.type;
      if (!throwntype) {
        // just pass through the thrown ptr
        return ((asm["setTempRet0"](0),thrown)|0);
      }
      var typeArray = Array.prototype.slice.call(arguments);
  
      var pointer = Module['___cxa_is_pointer_type'](throwntype);
      // can_catch receives a **, add indirection
      if (!___cxa_find_matching_catch.buffer) ___cxa_find_matching_catch.buffer = _malloc(4);
      HEAP32[((___cxa_find_matching_catch.buffer)>>2)]=thrown;
      thrown = ___cxa_find_matching_catch.buffer;
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (typeArray[i] && Module['___cxa_can_catch'](typeArray[i], throwntype, thrown)) {
          thrown = HEAP32[((thrown)>>2)]; // undo indirection
          info.adjusted = thrown;
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
        }
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      thrown = HEAP32[((thrown)>>2)]; // undo indirection
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      EXCEPTIONS.infos[ptr] = {
        ptr: ptr,
        adjusted: ptr,
        type: type,
        destructor: destructor,
        refcount: 0
      };
      EXCEPTIONS.last = ptr;
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr;
    }

  function _emscripten_set_touchend_callback(target, userData, useCapture, callbackfunc) {
      JSEvents.registerTouchEventCallback(target, userData, useCapture, callbackfunc, 23, "touchend");
      return 0;
    }

  function _glUseProgram(program) {
      GLctx.useProgram(program ? GL.programs[program] : null);
    }

  var _emscripten_landingpad=true;

  
  
  function __setLetterbox(element, topBottom, leftRight) {
      if (JSEvents.isInternetExplorer()) {
        // Cannot use padding on IE11, because IE11 computes padding in addition to the size, unlike
        // other browsers, which treat padding to be part of the size.
        // e.g.
        // FF, Chrome: If CSS size = 1920x1080, padding-leftright = 460, padding-topbottomx40, then content size = (1920 - 2*460) x (1080-2*40) = 1000x1000px, and total element size = 1920x1080px.
        //       IE11: If CSS size = 1920x1080, padding-leftright = 460, padding-topbottomx40, then content size = 1920x1080px and total element size = (1920+2*460) x (1080+2*40)px.
        // IE11  treats margin like Chrome and FF treat padding.
        element.style.marginLeft = element.style.marginRight = leftRight + 'px';
        element.style.marginTop = element.style.marginBottom = topBottom + 'px';
      } else {
        // Cannot use margin to specify letterboxes in FF or Chrome, since those ignore margins in fullscreen mode.
        element.style.paddingLeft = element.style.paddingRight = leftRight + 'px';
        element.style.paddingTop = element.style.paddingBottom = topBottom + 'px';
      }
    }function _emscripten_do_request_fullscreen(target, strategy) {
      if (typeof JSEvents.fullscreenEnabled() === 'undefined') return -1;
      if (!JSEvents.fullscreenEnabled()) return -3;
      if (!target) target = '#canvas';
      target = JSEvents.findEventTarget(target);
      if (!target) return -4;
  
      if (!target.requestFullscreen && !target.msRequestFullscreen && !target.mozRequestFullScreen && !target.mozRequestFullscreen && !target.webkitRequestFullscreen) {
        return -3;
      }
  
      var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
  
      // Queue this function call if we're not currently in an event handler and the user saw it appropriate to do so.
      if (!canPerformRequests) {
        if (strategy.deferUntilInEventHandler) {
          JSEvents.deferCall(JSEvents.requestFullscreen, 1 /* priority over pointer lock */, [target, strategy]);
          return 1;
        } else {
          return -2;
        }
      }
  
      return JSEvents.requestFullscreen(target, strategy);
    }
  
  var __currentFullscreenStrategy={};
  
  function __registerRestoreOldStyle(canvas) {
      var oldWidth = canvas.width;
      var oldHeight = canvas.height;
      var oldCssWidth = canvas.style.width;
      var oldCssHeight = canvas.style.height;
      var oldBackgroundColor = canvas.style.backgroundColor; // Chrome reads color from here.
      var oldDocumentBackgroundColor = document.body.style.backgroundColor; // IE11 reads color from here.
      // Firefox always has black background color.
      var oldPaddingLeft = canvas.style.paddingLeft; // Chrome, FF, Safari
      var oldPaddingRight = canvas.style.paddingRight;
      var oldPaddingTop = canvas.style.paddingTop;
      var oldPaddingBottom = canvas.style.paddingBottom;
      var oldMarginLeft = canvas.style.marginLeft; // IE11
      var oldMarginRight = canvas.style.marginRight;
      var oldMarginTop = canvas.style.marginTop;
      var oldMarginBottom = canvas.style.marginBottom;
      var oldDocumentBodyMargin = document.body.style.margin;
      var oldDocumentOverflow = document.documentElement.style.overflow; // Chrome, Firefox
      var oldDocumentScroll = document.body.scroll; // IE
      var oldImageRendering = canvas.style.imageRendering;
  
      function restoreOldStyle() {
        var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        if (!fullscreenElement) {
          document.removeEventListener('fullscreenchange', restoreOldStyle);
          document.removeEventListener('mozfullscreenchange', restoreOldStyle);
          document.removeEventListener('webkitfullscreenchange', restoreOldStyle);
          document.removeEventListener('MSFullscreenChange', restoreOldStyle);
  
          canvas.width = oldWidth;
          canvas.height = oldHeight;
          canvas.style.width = oldCssWidth;
          canvas.style.height = oldCssHeight;
          canvas.style.backgroundColor = oldBackgroundColor; // Chrome
          // IE11 hack: assigning 'undefined' or an empty string to document.body.style.backgroundColor has no effect, so first assign back the default color
          // before setting the undefined value. Setting undefined value is also important, or otherwise we would later treat that as something that the user
          // had explicitly set so subsequent fullscreen transitions would not set background color properly.
          if (!oldDocumentBackgroundColor) document.body.style.backgroundColor = 'white';
          document.body.style.backgroundColor = oldDocumentBackgroundColor; // IE11
          canvas.style.paddingLeft = oldPaddingLeft; // Chrome, FF, Safari
          canvas.style.paddingRight = oldPaddingRight;
          canvas.style.paddingTop = oldPaddingTop;
          canvas.style.paddingBottom = oldPaddingBottom;
          canvas.style.marginLeft = oldMarginLeft; // IE11
          canvas.style.marginRight = oldMarginRight;
          canvas.style.marginTop = oldMarginTop;
          canvas.style.marginBottom = oldMarginBottom;
          document.body.style.margin = oldDocumentBodyMargin;
          document.documentElement.style.overflow = oldDocumentOverflow; // Chrome, Firefox
          document.body.scroll = oldDocumentScroll; // IE
          canvas.style.imageRendering = oldImageRendering;
          if (canvas.GLctxObject) canvas.GLctxObject.GLctx.viewport(0, 0, oldWidth, oldHeight);
  
          if (__currentFullscreenStrategy.canvasResizedCallback) {
            Runtime.dynCall('iiii', __currentFullscreenStrategy.canvasResizedCallback, [37, 0, __currentFullscreenStrategy.canvasResizedCallbackUserData]);
          }
        }
      }
      document.addEventListener('fullscreenchange', restoreOldStyle);
      document.addEventListener('mozfullscreenchange', restoreOldStyle);
      document.addEventListener('webkitfullscreenchange', restoreOldStyle);
      document.addEventListener('MSFullscreenChange', restoreOldStyle);
      return restoreOldStyle;
    }function _emscripten_request_fullscreen_strategy(target, deferUntilInEventHandler, fullscreenStrategy) {
      var strategy = {};
      strategy.scaleMode = HEAP32[((fullscreenStrategy)>>2)];
      strategy.canvasResolutionScaleMode = HEAP32[(((fullscreenStrategy)+(4))>>2)];
      strategy.filteringMode = HEAP32[(((fullscreenStrategy)+(8))>>2)];
      strategy.deferUntilInEventHandler = deferUntilInEventHandler;
      strategy.canvasResizedCallback = HEAP32[(((fullscreenStrategy)+(12))>>2)];
      strategy.canvasResizedCallbackUserData = HEAP32[(((fullscreenStrategy)+(16))>>2)];
      __currentFullscreenStrategy = strategy;
  
      return _emscripten_do_request_fullscreen(target, strategy);
    }

  function _alSourceStop(source) {
      if (!AL.currentContext) {
        return;
      }
      var src = AL.currentContext.src[source];
      if (!src) {
        AL.currentContext.err = 0xA001 /* AL_INVALID_NAME */;
        return;
      }
      AL.setSourceState(src, 0x1014 /* AL_STOPPED */);
    }

  function _glBindRenderbuffer(target, renderbuffer) {
      GLctx.bindRenderbuffer(target, renderbuffer ? GL.renderbuffers[renderbuffer] : null);
    }

  function _emscripten_glFinish() { GLctx.finish() }

  function _glDeleteFramebuffers(n, framebuffers) {
      for (var i = 0; i < n; ++i) {
        var id = HEAP32[(((framebuffers)+(i*4))>>2)];
        var framebuffer = GL.framebuffers[id];
        if (!framebuffer) continue; // GL spec: "glDeleteFramebuffers silently ignores 0s and names that do not correspond to existing framebuffer objects".
        GLctx.deleteFramebuffer(framebuffer);
        framebuffer.name = 0;
        GL.framebuffers[id] = null;
      }
    }

  function _emscripten_glDepthFunc(x0) { GLctx.depthFunc(x0) }

  function _alcOpenDevice(deviceName) {
      if (typeof(AudioContext) !== "undefined" ||
          typeof(webkitAudioContext) !== "undefined") {
        return 1; // non-null pointer -- we just simulate one device
      } else {
        return 0;
      }
    }

  function _emscripten_get_num_gamepads() {
      if (!navigator.getGamepads && !navigator.webkitGetGamepads) return -1;
      if (navigator.getGamepads) {
        return navigator.getGamepads().length;
      } else if (navigator.webkitGetGamepads) {
        return navigator.webkitGetGamepads().length;
      }
    }

  function _emscripten_set_blur_callback(target, userData, useCapture, callbackfunc) {
      JSEvents.registerFocusEventCallback(target, userData, useCapture, callbackfunc, 12, "blur");
      return 0;
    }

  var _emscripten_postinvoke=true;

  function _sigaction(signum, act, oldact) {
      //int sigaction(int signum, const struct sigaction *act, struct sigaction *oldact);
      Module.printErr('Calling stub instead of sigaction()');
      return 0;
    }

  function _emscripten_glUniform4iv(location, count, value) {
      location = GL.uniforms[location];
      count *= 4;
      value = HEAP32.subarray((value)>>2,(value+count*4)>>2);
      GLctx.uniform4iv(location, value);
    }

  function _glClear(x0) { GLctx.clear(x0) }

  function _emscripten_set_resize_callback(target, userData, useCapture, callbackfunc) {
      JSEvents.registerUiEventCallback(target, userData, useCapture, callbackfunc, 10, "resize");
      return 0;
    }

  function _emscripten_glLoadIdentity(){ throw 'Legacy GL function (glLoadIdentity) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.'; }

  function _emscripten_set_element_css_size(target, width, height) {
      if (!target) {
        target = Module['canvas'];
      } else {
        target = JSEvents.findEventTarget(target);
      }
  
      if (!target) return -4;
  
      target.style.setProperty("width", width + "px");
      target.style.setProperty("height", height + "px");
  
      return 0;
    }

  function _glActiveTexture(x0) { GLctx.activeTexture(x0) }

  function _glEnableVertexAttribArray(index) {
      GLctx.enableVertexAttribArray(index);
    }

  function _emscripten_glAttachShader(program, shader) {
      GLctx.attachShader(GL.programs[program],
                              GL.shaders[shader]);
    }

  function _emscripten_glEnable(x0) { GLctx.enable(x0) }

  function _glFramebufferTexture2D(target, attachment, textarget, texture, level) {
      GLctx.framebufferTexture2D(target, attachment, textarget,
                                      GL.textures[texture], level);
    }

  function _emscripten_request_pointerlock(target, deferUntilInEventHandler) {
      if (!target) target = '#canvas';
      target = JSEvents.findEventTarget(target);
      if (!target) return -4;
      if (!target.requestPointerLock && !target.mozRequestPointerLock && !target.webkitRequestPointerLock && !target.msRequestPointerLock) {
        return -1;
      }
  
      var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
  
      // Queue this function call if we're not currently in an event handler and the user saw it appropriate to do so.
      if (!canPerformRequests) {
        if (deferUntilInEventHandler) {
          JSEvents.deferCall(JSEvents.requestPointerLock, 2 /* priority below fullscreen */, [target]);
          return 1;
        } else {
          return -2;
        }
      }
  
      return JSEvents.requestPointerLock(target);
    }

  function _eglCreateWindowSurface(display, config, win, attrib_list) { 
      if (display != 62000 /* Magic ID for Emscripten 'default display' */) {
        EGL.setErrorCode(0x3008 /* EGL_BAD_DISPLAY */);
        return 0;
      }
      if (config != 62002 /* Magic ID for the only EGLConfig supported by Emscripten */) {
        EGL.setErrorCode(0x3005 /* EGL_BAD_CONFIG */);
        return 0;
      }
      // TODO: Examine attrib_list! Parameters that can be present there are:
      // - EGL_RENDER_BUFFER (must be EGL_BACK_BUFFER)
      // - EGL_VG_COLORSPACE (can't be set)
      // - EGL_VG_ALPHA_FORMAT (can't be set)
      EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
      return 62006; /* Magic ID for Emscripten 'default surface' */
    }

  function _alListenerfv(param, values) {
      if (!AL.currentContext) {
        return;
      }
      switch (param) {
      case 0x1004 /* AL_POSITION */:
        var x = HEAPF32[((values)>>2)];
        var y = HEAPF32[(((values)+(4))>>2)];
        var z = HEAPF32[(((values)+(8))>>2)];
        AL.currentContext.ctx.listener._position = [x, y, z];
        AL.currentContext.ctx.listener.setPosition(x, y, z);
        break;
      case 0x1006 /* AL_VELOCITY */:
        var x = HEAPF32[((values)>>2)];
        var y = HEAPF32[(((values)+(4))>>2)];
        var z = HEAPF32[(((values)+(8))>>2)];
        AL.currentContext.ctx.listener._velocity = [x, y, z];
        AL.currentContext.ctx.listener.setVelocity(x, y, z);
        break;
      case 0x100F /* AL_ORIENTATION */:
        var x = HEAPF32[((values)>>2)];
        var y = HEAPF32[(((values)+(4))>>2)];
        var z = HEAPF32[(((values)+(8))>>2)];
        var x2 = HEAPF32[(((values)+(12))>>2)];
        var y2 = HEAPF32[(((values)+(16))>>2)];
        var z2 = HEAPF32[(((values)+(20))>>2)];
        AL.currentContext.ctx.listener._orientation = [x, y, z, x2, y2, z2];
        AL.currentContext.ctx.listener.setOrientation(x, y, z, x2, y2, z2);
        break;
      default:
        AL.currentContext.err = 0xA002 /* AL_INVALID_ENUM */;
        break;
      }
    }

  function _pthread_cond_broadcast() {
      return 0;
    }

  function _alGetSourcei(source, param, value) {
      if (!AL.currentContext) {
        return;
      }
      var src = AL.currentContext.src[source];
      if (!src) {
        AL.currentContext.err = 0xA001 /* AL_INVALID_NAME */;
        return;
      }
  
      // Being that we have no way to receive end events from buffer nodes,
      // we currently proccess and update a source's buffer queue every
      // ~QUEUE_INTERVAL milliseconds. However, this interval is not precise,
      // so we also forcefully update the source when alGetSourcei is queried
      // to aid in the common scenario of application calling alGetSourcei(AL_BUFFERS_PROCESSED)
      // to recycle buffers.
      AL.updateSource(src);
  
      switch (param) {
      case 0x202 /* AL_SOURCE_RELATIVE */:
        HEAP32[((value)>>2)]=src.panner ? 1 : 0;
        break;
      case 0x1001 /* AL_CONE_INNER_ANGLE */:
        HEAP32[((value)>>2)]=src.coneInnerAngle;
        break;
      case 0x1002 /* AL_CONE_OUTER_ANGLE */:
        HEAP32[((value)>>2)]=src.coneOuterAngle;
        break;
      case 0x1007 /* AL_LOOPING */:
        HEAP32[((value)>>2)]=src.loop;
        break;
      case 0x1009 /* AL_BUFFER */:
        if (!src.queue.length) {
          HEAP32[((value)>>2)]=0;
        } else {
          // Find the first unprocessed buffer.
          var buffer = src.queue[src.buffersPlayed].buffer;
          // Return its index.
          for (var i = 0; i < AL.currentContext.buf.length; ++i) {
            if (buffer == AL.currentContext.buf[i]) {
              HEAP32[((value)>>2)]=i+1;
              return;
            }
          }
          HEAP32[((value)>>2)]=0;
        }
        break;
      case 0x1010 /* AL_SOURCE_STATE */:
        HEAP32[((value)>>2)]=src.state;
        break;
      case 0x1015 /* AL_BUFFERS_QUEUED */:
        HEAP32[((value)>>2)]=src.queue.length
        break;
      case 0x1016 /* AL_BUFFERS_PROCESSED */:
        if (src.loop) {
          HEAP32[((value)>>2)]=0
        } else {
          HEAP32[((value)>>2)]=src.buffersPlayed
        }
        break;
      default:
        AL.currentContext.err = 0xA002 /* AL_INVALID_ENUM */;
        break;
      }
    }

  function _gettimeofday(ptr) {
      var now = Date.now();
      HEAP32[((ptr)>>2)]=(now/1000)|0; // seconds
      HEAP32[(((ptr)+(4))>>2)]=((now % 1000)*1000)|0; // microseconds
      return 0;
    }

  function _emscripten_glClearStencil(x0) { GLctx.clearStencil(x0) }

  function _emscripten_glDetachShader(program, shader) {
      GLctx.detachShader(GL.programs[program],
                              GL.shaders[shader]);
    }

  function _emscripten_get_device_pixel_ratio() {
      return window.devicePixelRatio || 1.0;
    }

  function _emscripten_glDeleteVertexArrays(n, vaos) {
      for(var i = 0; i < n; i++) {
        var id = HEAP32[(((vaos)+(i*4))>>2)];
        GLctx['deleteVertexArray'](GL.vaos[id]);
        GL.vaos[id] = null;
      }
    }

  function _alGenSources(count, sources) {
      if (!AL.currentContext) {
        return;
      }
      for (var i = 0; i < count; ++i) {
        var gain = AL.currentContext.ctx.createGain();
        gain.connect(AL.currentContext.gain);
        AL.currentContext.src[AL.newSrcId] = {
          state: 0x1011 /* AL_INITIAL */,
          queue: [],
          loop: false,
          get refDistance() {
            return this._refDistance || 1;
          },
          set refDistance(val) {
            this._refDistance = val;
            if (this.panner) this.panner.refDistance = val;
          },
          get maxDistance() {
            return this._maxDistance || 10000;
          },
          set maxDistance(val) {
            this._maxDistance = val;
            if (this.panner) this.panner.maxDistance = val;
          },
          get rolloffFactor() {
            return this._rolloffFactor || 1;
          },
          set rolloffFactor(val) {
            this._rolloffFactor = val;
            if (this.panner) this.panner.rolloffFactor = val;
          },
          get position() {
            return this._position || [0, 0, 0];
          },
          set position(val) {
            this._position = val;
            if (this.panner) this.panner.setPosition(val[0], val[1], val[2]);
          },
          get velocity() {
            return this._velocity || [0, 0, 0];
          },
          set velocity(val) {
            this._velocity = val;
            if (this.panner) this.panner.setVelocity(val[0], val[1], val[2]);
          },
          get direction() {
            return this._direction || [0, 0, 0];
          },
          set direction(val) {
            this._direction = val;
            if (this.panner) this.panner.setOrientation(val[0], val[1], val[2]);
          },
          get coneOuterGain() {
            return this._coneOuterGain || 0.0;
          },
          set coneOuterGain(val) {
            this._coneOuterGain = val;
            if (this.panner) this.panner.coneOuterGain = val;
          },
          get coneInnerAngle() {
            return this._coneInnerAngle || 360.0;
          },
          set coneInnerAngle(val) {
            this._coneInnerAngle = val;
            if (this.panner) this.panner.coneInnerAngle = val;
          },
          get coneOuterAngle() {
            return this._coneOuterAngle || 360.0;
          },
          set coneOuterAngle(val) {
            this._coneOuterAngle = val;
            if (this.panner) this.panner.coneOuterAngle = val;
          },
          gain: gain,
          panner: null,
          buffersPlayed: 0,
          bufferPosition: 0
        };
        HEAP32[(((sources)+(i*4))>>2)]=AL.newSrcId;
        AL.newSrcId++;
      }
    }

  function _emscripten_glTexParameteri(x0, x1, x2) { GLctx.texParameteri(x0, x1, x2) }

  function _glGenFramebuffers(n, ids) {
      for (var i = 0; i < n; ++i) {
        var framebuffer = GLctx.createFramebuffer();
        if (!framebuffer) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
          while(i < n) HEAP32[(((ids)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.framebuffers);
        framebuffer.name = id;
        GL.framebuffers[id] = framebuffer;
        HEAP32[(((ids)+(i*4))>>2)]=id;
      }
    }

  function _emscripten_get_element_css_size(target, width, height) {
      if (!target) {
        target = Module['canvas'];
      } else {
        target = JSEvents.findEventTarget(target);
      }
  
      if (!target) return -4;
  
      if (target.getBoundingClientRect) {
        var rect = target.getBoundingClientRect();
        HEAPF64[((width)>>3)]=rect.right - rect.left;
        HEAPF64[((height)>>3)]=rect.bottom - rect.top;
      } else {
        HEAPF64[((width)>>3)]=target.clientWidth;
        HEAPF64[((height)>>3)]=target.clientHeight;
      }
  
      return 0;
    }

  function _emscripten_glMatrixMode(){ throw 'Legacy GL function (glMatrixMode) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.'; }

  var _tanf=Math_tan;

  function _emscripten_glGetTexParameteriv(target, pname, params) {
      if (!params) {
        // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
        // if p == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      HEAP32[((params)>>2)]=GLctx.getTexParameter(target, pname);
    }

  function _alDeleteSources(count, sources) {
      if (!AL.currentContext) {
        return;
      }
      for (var i = 0; i < count; ++i) {
        var sourceIdx = HEAP32[(((sources)+(i*4))>>2)];
        delete AL.currentContext.src[sourceIdx];
      }
    }

  function _emscripten_glGenerateMipmap(x0) { GLctx.generateMipmap(x0) }

  function _emscripten_glGetString(name_) {
      if (GL.stringCache[name_]) return GL.stringCache[name_];
      var ret; 
      switch(name_) {
        case 0x1F00 /* GL_VENDOR */:
        case 0x1F01 /* GL_RENDERER */:
        case 0x1F02 /* GL_VERSION */:
          ret = allocate(intArrayFromString(GLctx.getParameter(name_)), 'i8', ALLOC_NORMAL);
          break;
        case 0x1F03 /* GL_EXTENSIONS */:
          var exts = GLctx.getSupportedExtensions();
          var gl_exts = [];
          for (var i in exts) {
            gl_exts.push(exts[i]);
            gl_exts.push("GL_" + exts[i]);
          }
          ret = allocate(intArrayFromString(gl_exts.join(' ')), 'i8', ALLOC_NORMAL);
          break;
        case 0x8B8C /* GL_SHADING_LANGUAGE_VERSION */:
          ret = allocate(intArrayFromString('OpenGL ES GLSL 1.00 (WebGL)'), 'i8', ALLOC_NORMAL);
          break;
        default:
          GL.recordError(0x0500/*GL_INVALID_ENUM*/);
          return 0;
      }
      GL.stringCache[name_] = ret;
      return ret;
    }

  function _emscripten_glCullFace(x0) { GLctx.cullFace(x0) }

  function _glDeleteTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((textures)+(i*4))>>2)];
        var texture = GL.textures[id];
        if (!texture) continue; // GL spec: "glDeleteTextures silently ignores 0s and names that do not correspond to existing textures".
        GLctx.deleteTexture(texture);
        texture.name = 0;
        GL.textures[id] = null;
      }
    }

  function _glDisableVertexAttribArray(index) {
      GLctx.disableVertexAttribArray(index);
    }

  function _emscripten_glUseProgram(program) {
      GLctx.useProgram(program ? GL.programs[program] : null);
    }

  function _emscripten_glHint(x0, x1) { GLctx.hint(x0, x1) }

  function _emscripten_glFramebufferTexture2D(target, attachment, textarget, texture, level) {
      GLctx.framebufferTexture2D(target, attachment, textarget,
                                      GL.textures[texture], level);
    }

  function _dlsym(handle, symbol) {
      // void *dlsym(void *restrict handle, const char *restrict name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/dlsym.html
      symbol = Pointer_stringify(symbol);
  
      if (!DLFCN.loadedLibs[handle]) {
        DLFCN.errorMsg = 'Tried to dlsym() from an unopened handle: ' + handle;
        return 0;
      } else {
        var lib = DLFCN.loadedLibs[handle];
        symbol = '_' + symbol;
        if (lib.cached_functions.hasOwnProperty(symbol)) {
          return lib.cached_functions[symbol];
        }
        if (!lib.module.hasOwnProperty(symbol)) {
          DLFCN.errorMsg = ('Tried to lookup unknown symbol "' + symbol +
                                 '" in dynamic lib: ' + lib.name);
          return 0;
        } else {
          var result = lib.module[symbol];
          if (typeof result == 'function') {
            result = Runtime.addFunction(result);
            lib.cached_functions = result;
          }
          return result;
        }
      }
    }

  function _emscripten_glUniform2fv(location, count, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform
        view = GL.miniTempBufferViews[1];
        view[0] = HEAPF32[((value)>>2)];
        view[1] = HEAPF32[(((value)+(4))>>2)];
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*8)>>2);
      }
      GLctx.uniform2fv(location, view);
    }

  function _glGetShaderInfoLog(shader, maxLength, length, infoLog) {
      var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
      if (log === null) log = '(unknown error)';
      log = log.substr(0, maxLength - 1);
      if (maxLength > 0 && infoLog) {
        writeStringToMemory(log, infoLog);
        if (length) HEAP32[((length)>>2)]=log.length;
      } else {
        if (length) HEAP32[((length)>>2)]=0;
      }
    }

  
  
  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]);
      return sum;
    }
  
  
  var __MONTH_DAYS_LEAP=[31,29,31,30,31,30,31,31,30,31,30,31];
  
  var __MONTH_DAYS_REGULAR=[31,28,31,30,31,30,31,31,30,31,30,31];function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while(days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month 
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
  
      return newDate;
    }function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
  
      var tm_zone = HEAP32[(((tm)+(40))>>2)];
  
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)],
        tm_gmtoff: HEAP32[(((tm)+(36))>>2)],
        tm_zone: tm_zone ? Pointer_stringify(tm_zone) : ''
      };
  
      var pattern = Pointer_stringify(format);
  
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S'                  // Replaced by the locale's appropriate date representation
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
  
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
      function leadingSomething(value, digits, character) {
        var str = typeof value === 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      };
  
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      };
  
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        };
  
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      };
  
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      };
  
      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            } else {
              return thisDate.getFullYear();
            }
          } else { 
            return thisDate.getFullYear()-1;
          }
      };
  
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls((year/100)|0,2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year. 
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes 
          // January 4th, which is also the week that includes the first Thursday of the year, and 
          // is also the first week that contains at least four days in the year. 
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of 
          // the last week of the preceding year; thus, for Saturday 2nd January 1999, 
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th, 
          // or 31st is a Monday, it and any following days are part of week 1 of the following year. 
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
          
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          return leadingNulls(date.tm_hour < 13 ? date.tm_hour : date.tm_hour-12, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour > 0 && date.tm_hour < 13) {
            return 'AM';
          } else {
            return 'PM';
          }
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay() || 7;
        },
        '%U': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Sunday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year+1900, 0, 1);
          var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7-janFirst.getDay());
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          
          // is target date after the first Sunday?
          if (compareByDay(firstSunday, endDate) < 0) {
            // calculate difference in days between first Sunday and endDate
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstSundayUntilEndJanuary = 31-firstSunday.getDate();
            var days = firstSundayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
  
          return compareByDay(firstSunday, janFirst) === 0 ? '01': '00';
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week) 
          // as a decimal number [01,53]. If the week containing 1 January has four 
          // or more days in the new year, then it is considered week 1. 
          // Otherwise, it is the last week of the previous year, and the next week is week 1. 
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var janFourthThisYear = new Date(date.tm_year+1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year+1901, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          var endDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            // if given date is before this years first week, then it belongs to the 53rd week of last year
            return '53';
          } 
  
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            // if given date is after next years first week, then it belongs to the 01th week of next year
            return '01';
          }
  
          // given date is in between CW 01..53 of this calendar year
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year+1900) {
            // first CW of this year starts last year
            daysDifference = date.tm_yday+32-firstWeekStartThisYear.getDate()
          } else {
            // first CW of this year starts this year
            daysDifference = date.tm_yday+1-firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference/7), 2);
        },
        '%w': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay();
        },
        '%W': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Monday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7-janFirst.getDay()+1);
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
  
          // is target date after the first Monday?
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstMondayUntilEndJanuary = 31-firstMonday.getDate();
            var days = firstMondayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01': '00';
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ).
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich).
          var off = date.tm_gmtoff;
          var ahead = off >= 0;
          off = Math.abs(off) / 60;
          // convert from minutes into hhmm format (which means 60 minutes = 100 units)
          off = (off / 60)*100 + (off % 60);
          return (ahead ? '+' : '-') + String("0000" + off).slice(-4);
        },
        '%Z': function(date) {
          return date.tm_zone;
        },
        '%%': function() {
          return '%';
        }
      };
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
  
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      } 
  
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }function _strftime_l(s, maxsize, format, tm) {
      return _strftime(s, maxsize, format, tm); // no locale support yet
    }

  function _abort() {
      Module['abort']();
    }

  function _emscripten_glVertexAttribDivisor(index, divisor) {
      GLctx['vertexAttribDivisor'](index, divisor);
    }

  function _emscripten_glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
      GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget,
                                         GL.renderbuffers[renderbuffer]);
    }

  function _alGenBuffers(count, buffers) {
      if (!AL.currentContext) {
        return;
      }
      for (var i = 0; i < count; ++i) {
        AL.currentContext.buf.push(null);
        HEAP32[(((buffers)+(i*4))>>2)]=AL.currentContext.buf.length;
      }
    }

  function _emscripten_glPolygonOffset(x0, x1) { GLctx.polygonOffset(x0, x1) }

  function _emscripten_glIsBuffer(buffer) {
      var b = GL.buffers[buffer];
      if (!b) return 0;
      return GLctx.isBuffer(b);
    }

  function _emscripten_glUniform2iv(location, count, value) {
      location = GL.uniforms[location];
      count *= 2;
      value = HEAP32.subarray((value)>>2,(value+count*4)>>2);
      GLctx.uniform2iv(location, value);
    }

  
  var PTHREAD_SPECIFIC={};function _pthread_getspecific(key) {
      return PTHREAD_SPECIFIC[key] || 0;
    }

  function _emscripten_glVertexAttrib1fv(index, v) {
      v = HEAPF32.subarray((v)>>2,(v+4)>>2);
      GLctx.vertexAttrib1fv(index, v);
    }

  function _glEnable(x0) { GLctx.enable(x0) }

  function _alBufferData(buffer, format, data, size, freq) {
      if (!AL.currentContext) {
        return;
      }
      if (buffer > AL.currentContext.buf.length) {
        return;
      }
      var channels, bytes;
      switch (format) {
      case 0x1100 /* AL_FORMAT_MONO8 */:
        bytes = 1;
        channels = 1;
        break;
      case 0x1101 /* AL_FORMAT_MONO16 */:
        bytes = 2;
        channels = 1;
        break;
      case 0x1102 /* AL_FORMAT_STEREO8 */:
        bytes = 1;
        channels = 2;
        break;
      case 0x1103 /* AL_FORMAT_STEREO16 */:
        bytes = 2;
        channels = 2;
        break;
      case 0x10010 /* AL_FORMAT_MONO_FLOAT32 */:
        bytes = 4;
        channels = 1;
        break;
      case 0x10011 /* AL_FORMAT_STEREO_FLOAT32 */:
        bytes = 4;
        channels = 2;
        break;
      default:
        return;
      }
      try {
        AL.currentContext.buf[buffer - 1] = AL.currentContext.ctx.createBuffer(channels, size / (bytes * channels), freq);
        AL.currentContext.buf[buffer - 1].bytesPerSample =  bytes;
      } catch (e) {
        AL.currentContext.err = 0xA003 /* AL_INVALID_VALUE */;
        return;
      }
      var buf = new Array(channels);
      for (var i = 0; i < channels; ++i) {
        buf[i] = AL.currentContext.buf[buffer - 1].getChannelData(i);
      }
      for (var i = 0; i < size / (bytes * channels); ++i) {
        for (var j = 0; j < channels; ++j) {
          switch (bytes) {
          case 1:
            var val = HEAP8[(((data)+(i*channels+j))>>0)] & 0xff;  // unsigned
            buf[j][i] = -1.0 + val * (2/256);
            break;
          case 2:
            var val = HEAP16[(((data)+(2*(i*channels+j)))>>1)];
            buf[j][i] = val/32768;
            break;
          case 4:
            buf[j][i] = HEAPF32[(((data)+(4*(i*channels+j)))>>2)];
            break;
          }
        }
      }
    }

  var _fabs=Math_abs;

  function _emscripten_glGetActiveAttrib(program, index, bufSize, length, size, type, name) {
      program = GL.programs[program];
      var info = GLctx.getActiveAttrib(program, index);
      if (!info) return; // If an error occurs, nothing will be written to length, size and type and name.
  
      var infoname = info.name.slice(0, Math.max(0, bufSize - 1));
      if (bufSize > 0 && name) {
        writeStringToMemory(infoname, name);
        if (length) HEAP32[((length)>>2)]=infoname.length;
      } else {
        if (length) HEAP32[((length)>>2)]=0;
      }
  
      if (size) HEAP32[((size)>>2)]=info.size;
      if (type) HEAP32[((type)>>2)]=info.type;
    }

  
  
  function emscriptenWebGLComputeImageSize(width, height, sizePerPixel, alignment) {
      function roundedToNextMultipleOf(x, y) {
        return Math.floor((x + y - 1) / y) * y
      }
      var plainRowSize = width * sizePerPixel;
      var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
      return (height <= 0) ? 0 :
               ((height - 1) * alignedRowSize + plainRowSize);
    }function emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) {
      var sizePerPixel;
      var numChannels;
      switch(format) {
        case 0x1906 /* GL_ALPHA */:
        case 0x1909 /* GL_LUMINANCE */:
        case 0x1902 /* GL_DEPTH_COMPONENT */:
        case 0x1903 /* GL_RED */:
          numChannels = 1;
          break;
        case 0x190A /* GL_LUMINANCE_ALPHA */:
        case 0x8227 /* GL_RG */:
          numChannels = 2;
          break;
        case 0x1907 /* GL_RGB */:
        case 0x8C40 /* GL_SRGB_EXT */:
          numChannels = 3;
          break;
        case 0x1908 /* GL_RGBA */:
        case 0x8C42 /* GL_SRGB_ALPHA_EXT */:
          numChannels = 4;
          break;
        default:
          GL.recordError(0x0500); // GL_INVALID_ENUM
          return {
            pixels: null,
            internalFormat: 0x0
          };
      }
      switch (type) {
        case 0x1401 /* GL_UNSIGNED_BYTE */:
          sizePerPixel = numChannels*1;
          break;
        case 0x1403 /* GL_UNSIGNED_SHORT */:
        case 0x8D61 /* GL_HALF_FLOAT_OES */:
          sizePerPixel = numChannels*2;
          break;
        case 0x1405 /* GL_UNSIGNED_INT */:
        case 0x1406 /* GL_FLOAT */:
          sizePerPixel = numChannels*4;
          break;
        case 0x84FA /* UNSIGNED_INT_24_8_WEBGL/UNSIGNED_INT_24_8 */:
          sizePerPixel = 4;
          break;
        case 0x8363 /* GL_UNSIGNED_SHORT_5_6_5 */:
        case 0x8033 /* GL_UNSIGNED_SHORT_4_4_4_4 */:
        case 0x8034 /* GL_UNSIGNED_SHORT_5_5_5_1 */:
          sizePerPixel = 2;
          break;
        default:
          GL.recordError(0x0500); // GL_INVALID_ENUM
          return {
            pixels: null,
            internalFormat: 0x0
          };
      }
      var bytes = emscriptenWebGLComputeImageSize(width, height, sizePerPixel, GL.unpackAlignment);
      if (type == 0x1401 /* GL_UNSIGNED_BYTE */) {
        pixels = HEAPU8.subarray((pixels),(pixels+bytes));
      } else if (type == 0x1406 /* GL_FLOAT */) {
        pixels = HEAPF32.subarray((pixels)>>2,(pixels+bytes)>>2);
      } else if (type == 0x1405 /* GL_UNSIGNED_INT */ || type == 0x84FA /* UNSIGNED_INT_24_8_WEBGL */) {
        pixels = HEAPU32.subarray((pixels)>>2,(pixels+bytes)>>2);
      } else {
        pixels = HEAPU16.subarray((pixels)>>1,(pixels+bytes)>>1);
      }
      return {
        pixels: pixels,
        internalFormat: internalFormat
      };
    }function _emscripten_glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
      var pixelData;
      if (pixels) {
        pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, -1).pixels;
      } else {
        pixelData = null;
      }
      GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
    }

  var _emscripten_asm_const_int=true;

  function _emscripten_glUniform2f(location, v0, v1) {
      location = GL.uniforms[location];
      GLctx.uniform2f(location, v0, v1);
    }

  function _glGetAttribLocation(program, name) {
      program = GL.programs[program];
      name = Pointer_stringify(name);
      return GLctx.getAttribLocation(program, name);
    }

  var _sin=Math_sin;

  function _glBlendFunc(x0, x1) { GLctx.blendFunc(x0, x1) }

  function _glCreateProgram() {
      var id = GL.getNewId(GL.programs);
      var program = GLctx.createProgram();
      program.name = id;
      GL.programs[id] = program;
      return id;
    }

  function _emscripten_glDeleteRenderbuffers(n, renderbuffers) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((renderbuffers)+(i*4))>>2)];
        var renderbuffer = GL.renderbuffers[id];
        if (!renderbuffer) continue; // GL spec: "glDeleteRenderbuffers silently ignores 0s and names that do not correspond to existing renderbuffer objects".
        GLctx.deleteRenderbuffer(renderbuffer);
        renderbuffer.name = 0;
        GL.renderbuffers[id] = null;
      }
    }

  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }

  
  function emscriptenWebGLGetUniform(program, location, params, type) {
      if (!params) {
        // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
        // if params == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      var data = GLctx.getUniform(GL.programs[program], GL.uniforms[location]);
      if (typeof data == 'number' || typeof data == 'boolean') {
        switch (type) {
          case 'Integer': HEAP32[((params)>>2)]=data; break;
          case 'Float': HEAPF32[((params)>>2)]=data; break;
          default: throw 'internal emscriptenWebGLGetUniform() error, bad type: ' + type;
        }
      } else {
        for (var i = 0; i < data.length; i++) {
          switch (type) {
            case 'Integer': HEAP32[(((params)+(i))>>2)]=data[i]; break;
            case 'Float': HEAPF32[(((params)+(i))>>2)]=data[i]; break;
            default: throw 'internal emscriptenWebGLGetUniform() error, bad type: ' + type;
          }
        }
      }
    }function _emscripten_glGetUniformiv(program, location, params) {
      emscriptenWebGLGetUniform(program, location, params, 'Integer');
    }

  function _emscripten_glDepthMask(x0) { GLctx.depthMask(x0) }

  function _emscripten_set_mousedown_callback(target, userData, useCapture, callbackfunc) {
      JSEvents.registerMouseEventCallback(target, userData, useCapture, callbackfunc, 5, "mousedown");
      return 0;
    }

  function _emscripten_glDepthRange(x0, x1) { GLctx.depthRange(x0, x1) }

  function _emscripten_set_fullscreenchange_callback(target, userData, useCapture, callbackfunc) {
      if (typeof JSEvents.fullscreenEnabled() === 'undefined') return -1;
      if (!target) target = document;
      else {
        target = JSEvents.findEventTarget(target);
        if (!target) return -4;
      }
      JSEvents.registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "fullscreenchange");
      JSEvents.registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "mozfullscreenchange");
      JSEvents.registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "webkitfullscreenchange");
      JSEvents.registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "msfullscreenchange");
      return 0;
    }

  var _ceil=Math_ceil;

  function ___syscall140(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // llseek
      var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get();
      var offset = offset_low;
      assert(offset_high === 0);
      FS.llseek(stream, offset, whence);
      HEAP32[((result)>>2)]=stream.position;
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function _emscripten_glVertexAttrib1f(x0, x1) { GLctx.vertexAttrib1f(x0, x1) }

  function _emscripten_glGetShaderPrecisionFormat(shaderType, precisionType, range, precision) {
      var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
      HEAP32[((range)>>2)]=result.rangeMin;
      HEAP32[(((range)+(4))>>2)]=result.rangeMax;
      HEAP32[((precision)>>2)]=result.precision;
    }

  function _emscripten_glUniform1fv(location, count, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform
        view = GL.miniTempBufferViews[0];
        view[0] = HEAPF32[((value)>>2)];
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*4)>>2);
      }
      GLctx.uniform1fv(location, view);
    }

  var _floor=Math_floor;

  function _emscripten_set_wheel_callback(target, userData, useCapture, callbackfunc) {
      target = JSEvents.findEventTarget(target);
      if (typeof target.onwheel !== 'undefined') {
        JSEvents.registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "wheel");
        return 0;
      } else if (typeof target.onmousewheel !== 'undefined') {
        JSEvents.registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "mousewheel");
        return 0;
      } else {
        return -1;
      }
    }

  function _emscripten_set_gamepaddisconnected_callback(userData, useCapture, callbackfunc) {
      if (!navigator.getGamepads && !navigator.webkitGetGamepads) return -1;
      JSEvents.registerGamepadEventCallback(window, userData, useCapture, callbackfunc, 27, "gamepaddisconnected");
      return 0;
   }

  function _emscripten_set_mouseenter_callback(target, userData, useCapture, callbackfunc) {
      JSEvents.registerMouseEventCallback(target, userData, useCapture, callbackfunc, 33, "mouseenter");
      return 0;
    }

  function _emscripten_glBindProgramARB() {
  Module['printErr']('missing function: emscripten_glBindProgramARB'); abort(-1);
  }

  function _emscripten_glCheckFramebufferStatus(x0) { return GLctx.checkFramebufferStatus(x0) }

  function _emscripten_glDeleteProgram(id) {
      if (!id) return;
      var program = GL.programs[id];
      if (!program) { // glDeleteProgram actually signals an error when deleting a nonexisting object, unlike some other GL delete functions.
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      GLctx.deleteProgram(program);
      program.name = 0;
      GL.programs[id] = null;
      GL.programInfos[id] = null;
    }

  function _emscripten_glDisable(x0) { GLctx.disable(x0) }

  function _emscripten_glVertexAttrib3fv(index, v) {
      v = HEAPF32.subarray((v)>>2,(v+12)>>2);
      GLctx.vertexAttrib3fv(index, v);
    }

  function _glClearColor(x0, x1, x2, x3) { GLctx.clearColor(x0, x1, x2, x3) }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 85: return totalMemory / PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 79:
          return 0;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: {
          if (typeof navigator === 'object') return navigator['hardwareConcurrency'] || 1;
          return 1;
        }
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _emscripten_glIsFramebuffer(framebuffer) {
      var fb = GL.framebuffers[framebuffer];
      if (!fb) return 0;
      return GLctx.isFramebuffer(fb);
    }

  function _emscripten_glLineWidth(x0) { GLctx.lineWidth(x0) }

  var _emscripten_resume=true;

  function ___syscall195(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // SYS_stat64
      var path = SYSCALLS.getStr(), buf = SYSCALLS.get();
      return SYSCALLS.doStat(FS.stat, path, buf);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function _eglDestroySurface(display, surface) { 
      if (display != 62000 /* Magic ID for Emscripten 'default display' */) {
        EGL.setErrorCode(0x3008 /* EGL_BAD_DISPLAY */);
        return 0; 
      }
      if (surface != 62006 /* Magic ID for the only EGLSurface supported by Emscripten */) {
        EGL.setErrorCode(0x300D /* EGL_BAD_SURFACE */);
        return 1;
      }
      if (EGL.currentReadSurface == surface) {
        EGL.currentReadSurface = 0;
      }
      if (EGL.currentDrawSurface == surface) {
        EGL.currentDrawSurface = 0;
      }
      EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
      return 1; /* Magic ID for Emscripten 'default surface' */
    }

  function _emscripten_glGetAttribLocation(program, name) {
      program = GL.programs[program];
      name = Pointer_stringify(name);
      return GLctx.getAttribLocation(program, name);
    }

  function _emscripten_glRotatef() {
  Module['printErr']('missing function: emscripten_glRotatef'); abort(-1);
  }

  function _emscripten_glVertexAttrib2f(x0, x1, x2) { GLctx.vertexAttrib2f(x0, x1, x2) }

  function _emscripten_glGetIntegerv(name_, p) {
      emscriptenWebGLGet(name_, p, 'Integer');
    }

  function _emscripten_glGetFramebufferAttachmentParameteriv(target, attachment, pname, params) {
      var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
      HEAP32[((params)>>2)]=result;
    }

  function _emscripten_glClientActiveTexture() {
  Module['printErr']('missing function: emscripten_glClientActiveTexture'); abort(-1);
  }

  function _emscripten_set_focus_callback(target, userData, useCapture, callbackfunc) {
      JSEvents.registerFocusEventCallback(target, userData, useCapture, callbackfunc, 13, "focus");
      return 0;
    }

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  function _emscripten_glGetShaderInfoLog(shader, maxLength, length, infoLog) {
      var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
      if (log === null) log = '(unknown error)';
      log = log.substr(0, maxLength - 1);
      if (maxLength > 0 && infoLog) {
        writeStringToMemory(log, infoLog);
        if (length) HEAP32[((length)>>2)]=log.length;
      } else {
        if (length) HEAP32[((length)>>2)]=0;
      }
    }

  function _emscripten_set_mouseup_callback(target, userData, useCapture, callbackfunc) {
      JSEvents.registerMouseEventCallback(target, userData, useCapture, callbackfunc, 6, "mouseup");
      return 0;
    }

  function _emscripten_glStencilOpSeparate(x0, x1, x2, x3) { GLctx.stencilOpSeparate(x0, x1, x2, x3) }

  
  
  var GLUT={initTime:null,idleFunc:null,displayFunc:null,keyboardFunc:null,keyboardUpFunc:null,specialFunc:null,specialUpFunc:null,reshapeFunc:null,motionFunc:null,passiveMotionFunc:null,mouseFunc:null,buttons:0,modifiers:0,initWindowWidth:256,initWindowHeight:256,initDisplayMode:18,windowX:0,windowY:0,windowWidth:0,windowHeight:0,requestedAnimationFrame:false,saveModifiers:function (event) {
        GLUT.modifiers = 0;
        if (event['shiftKey'])
          GLUT.modifiers += 1; /* GLUT_ACTIVE_SHIFT */
        if (event['ctrlKey'])
          GLUT.modifiers += 2; /* GLUT_ACTIVE_CTRL */
        if (event['altKey'])
          GLUT.modifiers += 4; /* GLUT_ACTIVE_ALT */
      },onMousemove:function (event) {
        /* Send motion event only if the motion changed, prevents
         * spamming our app with uncessary callback call. It does happen in
         * Chrome on Windows.
         */
        var lastX = Browser.mouseX;
        var lastY = Browser.mouseY;
        Browser.calculateMouseEvent(event);
        var newX = Browser.mouseX;
        var newY = Browser.mouseY;
        if (newX == lastX && newY == lastY) return;
  
        if (GLUT.buttons == 0 && event.target == Module["canvas"] && GLUT.passiveMotionFunc) {
          event.preventDefault();
          GLUT.saveModifiers(event);
          Runtime.dynCall('vii', GLUT.passiveMotionFunc, [lastX, lastY]);
        } else if (GLUT.buttons != 0 && GLUT.motionFunc) {
          event.preventDefault();
          GLUT.saveModifiers(event);
          Runtime.dynCall('vii', GLUT.motionFunc, [lastX, lastY]);
        }
      },getSpecialKey:function (keycode) {
          var key = null;
          switch (keycode) {
            case 8:  key = 120 /* backspace */; break;
            case 46: key = 111 /* delete */; break;
  
            case 0x70 /*DOM_VK_F1*/: key = 1 /* GLUT_KEY_F1 */; break;
            case 0x71 /*DOM_VK_F2*/: key = 2 /* GLUT_KEY_F2 */; break;
            case 0x72 /*DOM_VK_F3*/: key = 3 /* GLUT_KEY_F3 */; break;
            case 0x73 /*DOM_VK_F4*/: key = 4 /* GLUT_KEY_F4 */; break;
            case 0x74 /*DOM_VK_F5*/: key = 5 /* GLUT_KEY_F5 */; break;
            case 0x75 /*DOM_VK_F6*/: key = 6 /* GLUT_KEY_F6 */; break;
            case 0x76 /*DOM_VK_F7*/: key = 7 /* GLUT_KEY_F7 */; break;
            case 0x77 /*DOM_VK_F8*/: key = 8 /* GLUT_KEY_F8 */; break;
            case 0x78 /*DOM_VK_F9*/: key = 9 /* GLUT_KEY_F9 */; break;
            case 0x79 /*DOM_VK_F10*/: key = 10 /* GLUT_KEY_F10 */; break;
            case 0x7a /*DOM_VK_F11*/: key = 11 /* GLUT_KEY_F11 */; break;
            case 0x7b /*DOM_VK_F12*/: key = 12 /* GLUT_KEY_F12 */; break;
            case 0x25 /*DOM_VK_LEFT*/: key = 100 /* GLUT_KEY_LEFT */; break;
            case 0x26 /*DOM_VK_UP*/: key = 101 /* GLUT_KEY_UP */; break;
            case 0x27 /*DOM_VK_RIGHT*/: key = 102 /* GLUT_KEY_RIGHT */; break;
            case 0x28 /*DOM_VK_DOWN*/: key = 103 /* GLUT_KEY_DOWN */; break;
            case 0x21 /*DOM_VK_PAGE_UP*/: key = 104 /* GLUT_KEY_PAGE_UP */; break;
            case 0x22 /*DOM_VK_PAGE_DOWN*/: key = 105 /* GLUT_KEY_PAGE_DOWN */; break;
            case 0x24 /*DOM_VK_HOME*/: key = 106 /* GLUT_KEY_HOME */; break;
            case 0x23 /*DOM_VK_END*/: key = 107 /* GLUT_KEY_END */; break;
            case 0x2d /*DOM_VK_INSERT*/: key = 108 /* GLUT_KEY_INSERT */; break;
  
            case 16   /*DOM_VK_SHIFT*/:
            case 0x05 /*DOM_VK_LEFT_SHIFT*/:
              key = 112 /* GLUT_KEY_SHIFT_L */;
              break;
            case 0x06 /*DOM_VK_RIGHT_SHIFT*/:
              key = 113 /* GLUT_KEY_SHIFT_R */;
              break;
  
            case 17   /*DOM_VK_CONTROL*/:
            case 0x03 /*DOM_VK_LEFT_CONTROL*/:
              key = 114 /* GLUT_KEY_CONTROL_L */;
              break;
            case 0x04 /*DOM_VK_RIGHT_CONTROL*/:
              key = 115 /* GLUT_KEY_CONTROL_R */;
              break;
  
            case 18   /*DOM_VK_ALT*/:
            case 0x02 /*DOM_VK_LEFT_ALT*/:
              key = 116 /* GLUT_KEY_ALT_L */;
              break;
            case 0x01 /*DOM_VK_RIGHT_ALT*/:
              key = 117 /* GLUT_KEY_ALT_R */;
              break;
          };
          return key;
      },getASCIIKey:function (event) {
        if (event['ctrlKey'] || event['altKey'] || event['metaKey']) return null;
  
        var keycode = event['keyCode'];
  
        /* The exact list is soooo hard to find in a canonical place! */
  
        if (48 <= keycode && keycode <= 57)
          return keycode; // numeric  TODO handle shift?
        if (65 <= keycode && keycode <= 90)
          return event['shiftKey'] ? keycode : keycode + 32;
        if (96 <= keycode && keycode <= 105)
          return keycode - 48; // numpad numbers    
        if (106 <= keycode && keycode <= 111)
          return keycode - 106 + 42; // *,+-./  TODO handle shift?
  
        switch (keycode) {
          case 9:  // tab key
          case 13: // return key
          case 27: // escape
          case 32: // space
          case 61: // equal
            return keycode;
        }
  
        var s = event['shiftKey'];
        switch (keycode) {
          case 186: return s ? 58 : 59; // colon / semi-colon
          case 187: return s ? 43 : 61; // add / equal (these two may be wrong)
          case 188: return s ? 60 : 44; // less-than / comma
          case 189: return s ? 95 : 45; // dash
          case 190: return s ? 62 : 46; // greater-than / period
          case 191: return s ? 63 : 47; // forward slash
          case 219: return s ? 123 : 91; // open bracket
          case 220: return s ? 124 : 47; // back slash
          case 221: return s ? 125 : 93; // close braket
          case 222: return s ? 34 : 39; // single quote
        }
  
        return null;
      },onKeydown:function (event) {
        if (GLUT.specialFunc || GLUT.keyboardFunc) {
          var key = GLUT.getSpecialKey(event['keyCode']);
          if (key !== null) {
            if( GLUT.specialFunc ) {
              event.preventDefault();
              GLUT.saveModifiers(event);
              Runtime.dynCall('viii', GLUT.specialFunc, [key, Browser.mouseX, Browser.mouseY]);
            }
          }
          else
          {
            key = GLUT.getASCIIKey(event);
            if( key !== null && GLUT.keyboardFunc ) {
              event.preventDefault();
              GLUT.saveModifiers(event);
              Runtime.dynCall('viii', GLUT.keyboardFunc, [key, Browser.mouseX, Browser.mouseY]);
            }
          }
        }
      },onKeyup:function (event) {
        if (GLUT.specialUpFunc || GLUT.keyboardUpFunc) {
          var key = GLUT.getSpecialKey(event['keyCode']);
          if (key !== null) {
            if(GLUT.specialUpFunc) {
              event.preventDefault ();
              GLUT.saveModifiers(event);
              Runtime.dynCall('viii', GLUT.specialUpFunc, [key, Browser.mouseX, Browser.mouseY]);
            }
          }
          else
          {
            key = GLUT.getASCIIKey(event);
            if( key !== null && GLUT.keyboardUpFunc ) {
              event.preventDefault ();
              GLUT.saveModifiers(event);
              Runtime.dynCall('viii', GLUT.keyboardUpFunc, [key, Browser.mouseX, Browser.mouseY]);
            }
          }
        }
      },onMouseButtonDown:function (event) {
        Browser.calculateMouseEvent(event);
  
        GLUT.buttons |= (1 << event['button']);
  
        if (event.target == Module["canvas"] && GLUT.mouseFunc) {
          try {
            event.target.setCapture();
          } catch (e) {}
          event.preventDefault();
          GLUT.saveModifiers(event);
          Runtime.dynCall('viiii', GLUT.mouseFunc, [event['button'], 0/*GLUT_DOWN*/, Browser.mouseX, Browser.mouseY]);
        }
      },onMouseButtonUp:function (event) {
        Browser.calculateMouseEvent(event);
  
        GLUT.buttons &= ~(1 << event['button']);
  
        if (GLUT.mouseFunc) {
          event.preventDefault();
          GLUT.saveModifiers(event);
          Runtime.dynCall('viiii', GLUT.mouseFunc, [event['button'], 1/*GLUT_UP*/, Browser.mouseX, Browser.mouseY]);
        }
      },onMouseWheel:function (event) {
        Browser.calculateMouseEvent(event);
  
        // cross-browser wheel delta
        var e = window.event || event; // old IE support
        // Note the minus sign that flips browser wheel direction (positive direction scrolls page down) to native wheel direction (positive direction is mouse wheel up)
        var delta = -Browser.getMouseWheelDelta(event);
        delta = (delta == 0) ? 0 : (delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1)); // Quantize to integer so that minimum scroll is at least +/- 1.
  
        var button = 3; // wheel up
        if (delta < 0) {
          button = 4; // wheel down
        }
  
        if (GLUT.mouseFunc) {
          event.preventDefault();
          GLUT.saveModifiers(event);
          Runtime.dynCall('viiii', GLUT.mouseFunc, [button, 0/*GLUT_DOWN*/, Browser.mouseX, Browser.mouseY]);
        }
      },onFullScreenEventChange:function (event) {
        var width;
        var height;
        if (document["fullScreen"] || document["mozFullScreen"] || document["webkitIsFullScreen"]) {
          width = screen["width"];
          height = screen["height"];
        } else {
          width = GLUT.windowWidth;
          height = GLUT.windowHeight;
          // TODO set position
          document.removeEventListener('fullscreenchange', GLUT.onFullScreenEventChange, true);
          document.removeEventListener('mozfullscreenchange', GLUT.onFullScreenEventChange, true);
          document.removeEventListener('webkitfullscreenchange', GLUT.onFullScreenEventChange, true);
        }
        Browser.setCanvasSize(width, height);
        /* Can't call _glutReshapeWindow as that requests cancelling fullscreen. */
        if (GLUT.reshapeFunc) {
          // console.log("GLUT.reshapeFunc (from FS): " + width + ", " + height);
          Runtime.dynCall('vii', GLUT.reshapeFunc, [width, height]);
        }
        _glutPostRedisplay();
      },requestFullScreen:function () {
        var RFS = Module["canvas"]['requestFullscreen'] ||
                  Module["canvas"]['requestFullScreen'] ||
                  Module["canvas"]['mozRequestFullScreen'] ||
                  Module["canvas"]['webkitRequestFullScreen'] ||
                  (function() {});
        RFS.apply(Module["canvas"], []);
      },cancelFullScreen:function () {
        var CFS = document['exitFullscreen'] ||
                  document['cancelFullScreen'] ||
                  document['mozCancelFullScreen'] ||
                  document['webkitCancelFullScreen'] ||
                  (function() {});
        CFS.apply(document, []);
      }};function _glutInitDisplayMode(mode) {
      GLUT.initDisplayMode = mode;
    }
  
  function _glutCreateWindow(name) {
      var contextAttributes = {
        antialias: ((GLUT.initDisplayMode & 0x0080 /*GLUT_MULTISAMPLE*/) != 0),
        depth: ((GLUT.initDisplayMode & 0x0010 /*GLUT_DEPTH*/) != 0),
        stencil: ((GLUT.initDisplayMode & 0x0020 /*GLUT_STENCIL*/) != 0)
      };
      Module.ctx = Browser.createContext(Module['canvas'], true, true, contextAttributes);
      return Module.ctx ? 1 /* a new GLUT window ID for the created context */ : 0 /* failure */;
    }function _eglCreateContext(display, config, hmm, contextAttribs) {
      if (display != 62000 /* Magic ID for Emscripten 'default display' */) {
        EGL.setErrorCode(0x3008 /* EGL_BAD_DISPLAY */);
        return 0;
      }
  
      // EGL 1.4 spec says default EGL_CONTEXT_CLIENT_VERSION is GLES1, but this is not supported by Emscripten.
      // So user must pass EGL_CONTEXT_CLIENT_VERSION == 2 to initialize EGL.
      var glesContextVersion = 1;
      for(;;) {
        var param = HEAP32[((contextAttribs)>>2)];
        if (param == 0x3098 /*EGL_CONTEXT_CLIENT_VERSION*/) {
          glesContextVersion = HEAP32[(((contextAttribs)+(4))>>2)];
        } else if (param == 0x3038 /*EGL_NONE*/) {
          break;
        } else {
          /* EGL1.4 specifies only EGL_CONTEXT_CLIENT_VERSION as supported attribute */
          EGL.setErrorCode(0x3004 /*EGL_BAD_ATTRIBUTE*/);
          return 0;
        }
        contextAttribs += 8;
      }
      if (glesContextVersion != 2) {
        EGL.setErrorCode(0x3005 /* EGL_BAD_CONFIG */);
        return 0; /* EGL_NO_CONTEXT */
      }
  
      _glutInitDisplayMode(0xB2 /* GLUT_RGBA | GLUT_DOUBLE | GLUT_DEPTH | GLUT_MULTISAMPLE | GLUT_STENCIL */);
      EGL.windowID = _glutCreateWindow();
      if (EGL.windowID != 0) {
        EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
        // Note: This function only creates a context, but it shall not make it active.
        return 62004; // Magic ID for Emscripten EGLContext
      } else {
        EGL.setErrorCode(0x3009 /* EGL_BAD_MATCH */); // By the EGL 1.4 spec, an implementation that does not support GLES2 (WebGL in this case), this error code is set.
        return 0; /* EGL_NO_CONTEXT */
      }
    }

  function _emscripten_glReadPixels(x, y, width, height, format, type, pixels) {
      var data = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
      if (!data.pixels) {
        GL.recordError(0x0500/*GL_INVALID_ENUM*/);
        return;
      }
      GLctx.readPixels(x, y, width, height, format, type, data.pixels);
    }

  function _emscripten_glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data) {
      var heapView;
      if (data) {
        heapView = HEAPU8.subarray((data),(data+imageSize));
      } else {
        heapView = null;
      }
      GLctx['compressedTexSubImage2D'](target, level, xoffset, yoffset, width, height, format, heapView);
    }

  function _emscripten_glGetError() {
      // First return any GL error generated by the emscripten library_gl.js interop layer.
      if (GL.lastError) {
        var error = GL.lastError;
        GL.lastError = 0/*GL_NO_ERROR*/;
        return error;
      } else { // If there were none, return the GL error from the browser GL context.
        return GLctx.getError();
      }
    }

  function _eglBindAPI(api) {
      if (api == 0x30A0 /* EGL_OPENGL_ES_API */) {
        EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
        return 1;
      } else { // if (api == 0x30A1 /* EGL_OPENVG_API */ || api == 0x30A2 /* EGL_OPENGL_API */) {
        EGL.setErrorCode(0x300C /* EGL_BAD_PARAMETER */);
        return 0;
      }
    }

  function _pthread_cleanup_push(routine, arg) {
      __ATEXIT__.push(function() { Runtime.dynCall('vi', routine, [arg]) })
      _pthread_cleanup_push.level = __ATEXIT__.length;
    }

  function _alSourcei(source, param, value) {
      if (!AL.currentContext) {
        return;
      }
      var src = AL.currentContext.src[source];
      if (!src) {
        AL.currentContext.err = 0xA001 /* AL_INVALID_NAME */;
        return;
      }
      switch (param) {
      case 0x1001 /* AL_CONE_INNER_ANGLE */:
        src.coneInnerAngle = value;
        break;
      case 0x1002 /* AL_CONE_OUTER_ANGLE */:
        src.coneOuterAngle = value;
        break;
      case 0x1007 /* AL_LOOPING */:
        src.loop = (value === 1 /* AL_TRUE */);
        break;
      case 0x1009 /* AL_BUFFER */:
        var buffer = AL.currentContext.buf[value - 1];
        if (value == 0) {
          src.queue = [];
        } else {
          src.queue = [{ buffer: buffer }];
        }
        AL.updateSource(src);
        break;
      case 0x202 /* AL_SOURCE_RELATIVE */:
        if (value === 1 /* AL_TRUE */) {
          if (src.panner) {
            src.panner = null;
  
            // Disconnect from the panner.
            src.gain.disconnect();
  
            src.gain.connect(AL.currentContext.ctx.destination);
          }
        } else if (value === 0 /* AL_FALSE */) {
          if (!src.panner) {
            var panner = src.panner = AL.currentContext.ctx.createPanner();
            panner.panningModel = "equalpower";
            panner.distanceModel = "linear";
            panner.refDistance = src.refDistance;
            panner.maxDistance = src.maxDistance;
            panner.rolloffFactor = src.rolloffFactor;
            panner.setPosition(src.position[0], src.position[1], src.position[2]);
            panner.setVelocity(src.velocity[0], src.velocity[1], src.velocity[2]);
            panner.connect(AL.currentContext.ctx.destination);
  
            // Disconnect from the default source.
            src.gain.disconnect();
  
            src.gain.connect(panner);
          }
        } else {
          AL.currentContext.err = 0xA003 /* AL_INVALID_VALUE */;
        }
        break;
      default:
        AL.currentContext.err = 0xA002 /* AL_INVALID_ENUM */;
        break;
      }
    }

  function _emscripten_glIsEnabled(x0) { return GLctx.isEnabled(x0) }

  function _alSourcef(source, param, value) {
      if (!AL.currentContext) {
        return;
      }
      var src = AL.currentContext.src[source];
      if (!src) {
        AL.currentContext.err = 0xA001 /* AL_INVALID_NAME */;
        return;
      }
      switch (param) {
      case 0x1003 /* AL_PITCH */:
        break;
      case 0x100A /* AL_GAIN */:
        src.gain.gain.value = value;
        break;
      // case 0x100D /* AL_MIN_GAIN */:
      //   break;
      // case 0x100E /* AL_MAX_GAIN */:
      //   break;
      case 0x1023 /* AL_MAX_DISTANCE */:
        src.maxDistance = value;
        break;
      case 0x1021 /* AL_ROLLOFF_FACTOR */:
        src.rolloffFactor = value;
        break;
      case 0x1022 /* AL_CONE_OUTER_GAIN */:
        src.coneOuterGain = value;
        break;
      case 0x1001 /* AL_CONE_INNER_ANGLE */:
        src.coneInnerAngle = value;
        break;
      case 0x1002 /* AL_CONE_OUTER_ANGLE */:
        src.coneOuterAngle = value;
        break;
      case 0x1020 /* AL_REFERENCE_DISTANCE */:
        src.refDistance = value;
        break;
      default:
        AL.currentContext.err = 0xA002 /* AL_INVALID_ENUM */;
        break;
      }
    }

   
  Module["_memmove"] = _memmove;

  function _glGenTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var texture = GLctx.createTexture();
        if (!texture) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */); // GLES + EGL specs don't specify what should happen here, so best to issue an error and create IDs with 0.
          while(i < n) HEAP32[(((textures)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.textures);
        texture.name = id;
        GL.textures[id] = texture;
        HEAP32[(((textures)+(i*4))>>2)]=id;
      }
    }

  
  var __sigalrm_handler=0;function _signal(sig, func) {
      if (sig == 14 /*SIGALRM*/) {
        __sigalrm_handler = func;
      } else {
        Module.printErr('Calling stub instead of signal()');
      }
      return 0;
    }

  function _emscripten_glVertexAttrib4f(x0, x1, x2, x3, x4) { GLctx.vertexAttrib4f(x0, x1, x2, x3, x4) }

  function ___gxx_personality_v0() {
    }

  function _emscripten_glUniform2i(location, v0, v1) {
      location = GL.uniforms[location];
      GLctx.uniform2i(location, v0, v1);
    }

  var _sqrt=Math_sqrt;

  function ___cxa_rethrow() {
      ___cxa_end_catch.rethrown = true;
      var ptr = EXCEPTIONS.caught.pop();
      EXCEPTIONS.last = ptr;
      throw ptr;
    }

  function _pthread_cond_wait() {
      return 0;
    }

  function _emscripten_glClear(x0) { GLctx.clear(x0) }

  function _emscripten_glGetUniformfv(program, location, params) {
      emscriptenWebGLGetUniform(program, location, params, 'Float');
    }

  
  function _emscripten_get_now() {
      if (!_emscripten_get_now.actual) {
        if (ENVIRONMENT_IS_NODE) {
          _emscripten_get_now.actual = function _emscripten_get_now_actual() {
            var t = process['hrtime']();
            return t[0] * 1e3 + t[1] / 1e6;
          }
        } else if (typeof dateNow !== 'undefined') {
          _emscripten_get_now.actual = dateNow;
        } else if (typeof self === 'object' && self['performance'] && typeof self['performance']['now'] === 'function') {
          _emscripten_get_now.actual = function _emscripten_get_now_actual() { return self['performance']['now'](); };
        } else if (typeof performance === 'object' && typeof performance['now'] === 'function') {
          _emscripten_get_now.actual = function _emscripten_get_now_actual() { return performance['now'](); };
        } else {
          _emscripten_get_now.actual = Date.now;
        }
      }
      return _emscripten_get_now.actual();
    }
  
  function _emscripten_get_now_is_monotonic() {
      // return whether emscripten_get_now is guaranteed monotonic; the Date.now
      // implementation is not :(
      return ENVIRONMENT_IS_NODE || (typeof dateNow !== 'undefined') ||
          ((ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && self['performance'] && self['performance']['now']);
    }function _clock_gettime(clk_id, tp) {
      // int clock_gettime(clockid_t clk_id, struct timespec *tp);
      var now;
      if (clk_id === 0) {
        now = Date.now();
      } else if (clk_id === 1 && _emscripten_get_now_is_monotonic()) {
        now = _emscripten_get_now();
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      }
      HEAP32[((tp)>>2)]=(now/1000)|0; // seconds
      HEAP32[(((tp)+(4))>>2)]=((now % 1000)*1000*1000)|0; // nanoseconds
      return 0;
    }

  function _glDeleteRenderbuffers(n, renderbuffers) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((renderbuffers)+(i*4))>>2)];
        var renderbuffer = GL.renderbuffers[id];
        if (!renderbuffer) continue; // GL spec: "glDeleteRenderbuffers silently ignores 0s and names that do not correspond to existing renderbuffer objects".
        GLctx.deleteRenderbuffer(renderbuffer);
        renderbuffer.name = 0;
        GL.renderbuffers[id] = null;
      }
    }

  function _emscripten_glDisableVertexAttribArray(index) {
      GLctx.disableVertexAttribArray(index);
    }

  function _emscripten_glCompileShader(shader) {
      GLctx.compileShader(GL.shaders[shader]);
    }

  var _ceilf=Math_ceil;

  function _glGetProgramiv(program, pname, p) {
      if (!p) {
        // GLES2 specification does not specify how to behave if p is a null pointer. Since calling this function does not make sense
        // if p == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      if (pname == 0x8B84) { // GL_INFO_LOG_LENGTH
        var log = GLctx.getProgramInfoLog(GL.programs[program]);
        if (log === null) log = '(unknown error)';
        HEAP32[((p)>>2)]=log.length + 1;
      } else if (pname == 0x8B87 /* GL_ACTIVE_UNIFORM_MAX_LENGTH */) {
        var ptable = GL.programInfos[program];
        if (ptable) {
          HEAP32[((p)>>2)]=ptable.maxUniformLength;
          return;
        } else if (program < GL.counter) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
        } else {
          GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        }
      } else if (pname == 0x8B8A /* GL_ACTIVE_ATTRIBUTE_MAX_LENGTH */) {
        var ptable = GL.programInfos[program];
        if (ptable) {
          if (ptable.maxAttributeLength == -1) {
            var program = GL.programs[program];
            var numAttribs = GLctx.getProgramParameter(program, GLctx.ACTIVE_ATTRIBUTES);
            ptable.maxAttributeLength = 0; // Spec says if there are no active attribs, 0 must be returned.
            for(var i = 0; i < numAttribs; ++i) {
              var activeAttrib = GLctx.getActiveAttrib(program, i);
              ptable.maxAttributeLength = Math.max(ptable.maxAttributeLength, activeAttrib.name.length+1);
            }
          }
          HEAP32[((p)>>2)]=ptable.maxAttributeLength;
          return;
        } else if (program < GL.counter) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
        } else {
          GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        }
      } else {
        HEAP32[((p)>>2)]=GLctx.getProgramParameter(GL.programs[program], pname);
      }
    }

  function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
      GLctx.vertexAttribPointer(index, size, type, normalized, stride, ptr);
    }

   
  Module["_bitshift64Shl"] = _bitshift64Shl;

  function _emscripten_glGetBufferParameteriv(target, value, data) {
      if (!data) {
        // GLES2 specification does not specify how to behave if data is a null pointer. Since calling this function does not make sense
        // if data == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      HEAP32[((data)>>2)]=GLctx.getBufferParameter(target, value);
    }

  function _glGetUniformLocation(program, name) {
      name = Pointer_stringify(name);
  
      var arrayOffset = 0;
      // If user passed an array accessor "[index]", parse the array index off the accessor.
      if (name.indexOf(']', name.length-1) !== -1) {
        var ls = name.lastIndexOf('[');
        var arrayIndex = name.slice(ls+1, -1);
        if (arrayIndex.length > 0) {
          arrayOffset = parseInt(arrayIndex);
          if (arrayOffset < 0) {
            return -1;
          }
        }
        name = name.slice(0, ls);
      }
  
      var ptable = GL.programInfos[program];
      if (!ptable) {
        return -1;
      }
      var utable = ptable.uniforms;
      var uniformInfo = utable[name]; // returns pair [ dimension_of_uniform_array, uniform_location ]
      if (uniformInfo && arrayOffset < uniformInfo[0]) { // Check if user asked for an out-of-bounds element, i.e. for 'vec4 colors[3];' user could ask for 'colors[10]' which should return -1.
        return uniformInfo[1]+arrayOffset;
      } else {
        return -1;
      }
    }

  function _emscripten_glGetAttachedShaders(program, maxCount, count, shaders) {
      var result = GLctx.getAttachedShaders(GL.programs[program]);
      var len = result.length;
      if (len > maxCount) {
        len = maxCount;
      }
      HEAP32[((count)>>2)]=len;
      for (var i = 0; i < len; ++i) {
        var id = GL.shaders.indexOf(result[i]);
        assert(id !== -1, 'shader not bound to local id');
        HEAP32[(((shaders)+(i*4))>>2)]=id;
      }
    }

  function _emscripten_glGenRenderbuffers(n, renderbuffers) {
      for (var i = 0; i < n; i++) {
        var renderbuffer = GLctx.createRenderbuffer();
        if (!renderbuffer) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
          while(i < n) HEAP32[(((renderbuffers)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.renderbuffers);
        renderbuffer.name = id;
        GL.renderbuffers[id] = renderbuffer;
        HEAP32[(((renderbuffers)+(i*4))>>2)]=id;
      }
    }

  function _emscripten_glFrontFace(x0) { GLctx.frontFace(x0) }

  function _emscripten_glActiveTexture(x0) { GLctx.activeTexture(x0) }

  function _emscripten_glUniform1iv(location, count, value) {
      location = GL.uniforms[location];
      value = HEAP32.subarray((value)>>2,(value+count*4)>>2);
      GLctx.uniform1iv(location, value);
    }

  function _emscripten_glTexCoordPointer() {
  Module['printErr']('missing function: emscripten_glTexCoordPointer'); abort(-1);
  }

  function _emscripten_glGetInfoLogARB() {
  Module['printErr']('missing function: emscripten_glGetInfoLogARB'); abort(-1);
  }

  function _pthread_setspecific(key, value) {
      if (!(key in PTHREAD_SPECIFIC)) {
        return ERRNO_CODES.EINVAL;
      }
      PTHREAD_SPECIFIC[key] = value;
      return 0;
    }

  var _atan2f=Math_atan2;


  function _emscripten_set_keyup_callback(target, userData, useCapture, callbackfunc) {
      JSEvents.registerKeyEventCallback(target, userData, useCapture, callbackfunc, 3, "keyup");
      return 0;
    }

  function _emscripten_glRenderbufferStorage(x0, x1, x2, x3) { GLctx.renderbufferStorage(x0, x1, x2, x3) }

  function _glCheckFramebufferStatus(x0) { return GLctx.checkFramebufferStatus(x0) }

  var _llvm_ctlz_i32=true;

  function _emscripten_glTexParameteriv(target, pname, params) {
      var param = HEAP32[((params)>>2)];
      GLctx.texParameteri(target, pname, param);
    }

  function _emscripten_glShaderBinary() {
      GL.recordError(0x0500/*GL_INVALID_ENUM*/);
    }

  function _emscripten_glIsProgram(program) {
      var program = GL.programs[program];
      if (!program) return 0;
      return GLctx.isProgram(program);
    }

  function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      EXCEPTIONS.caught.push(ptr);
      EXCEPTIONS.addRef(EXCEPTIONS.deAdjust(ptr));
      return ptr;
    }

  function _eglInitialize(display, majorVersion, minorVersion) {
      if (display == 62000 /* Magic ID for Emscripten 'default display' */) {
        if (majorVersion) {
          HEAP32[((majorVersion)>>2)]=1; // Advertise EGL Major version: '1'
        }
        if (minorVersion) {
          HEAP32[((minorVersion)>>2)]=4; // Advertise EGL Minor version: '4'
        }
        EGL.defaultDisplayInitialized = true;
        EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
        return 1;
      } 
      else {
        EGL.setErrorCode(0x3008 /* EGL_BAD_DISPLAY */);
        return 0;
      }
    }

  function _emscripten_glBlendColor(x0, x1, x2, x3) { GLctx.blendColor(x0, x1, x2, x3) }

  function _emscripten_glGetShaderiv(shader, pname, p) {
      if (!p) {
        // GLES2 specification does not specify how to behave if p is a null pointer. Since calling this function does not make sense
        // if p == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      if (pname == 0x8B84) { // GL_INFO_LOG_LENGTH
        var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
        if (log === null) log = '(unknown error)';
        HEAP32[((p)>>2)]=log.length + 1;
      } else {
        HEAP32[((p)>>2)]=GLctx.getShaderParameter(GL.shaders[shader], pname);
      }
    }

  function _emscripten_glUniformMatrix3fv(location, count, transpose, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform matrix
        view = GL.miniTempBufferViews[8];
        for (var i = 0; i < 9; i++) {
          view[i] = HEAPF32[(((value)+(i*4))>>2)];
        }
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*36)>>2);
      }
      GLctx.uniformMatrix3fv(location, transpose, view);
    }


  function _emscripten_glUniform4fv(location, count, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform
        view = GL.miniTempBufferViews[3];
        view[0] = HEAPF32[((value)>>2)];
        view[1] = HEAPF32[(((value)+(4))>>2)];
        view[2] = HEAPF32[(((value)+(8))>>2)];
        view[3] = HEAPF32[(((value)+(12))>>2)];
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*16)>>2);
      }
      GLctx.uniform4fv(location, view);
    }

  function _emscripten_set_keypress_callback(target, userData, useCapture, callbackfunc) {
      JSEvents.registerKeyEventCallback(target, userData, useCapture, callbackfunc, 1, "keypress");
      return 0;
    }

  function _emscripten_exit_fullscreen() {
      if (typeof JSEvents.fullscreenEnabled() === 'undefined') return -1;
      // Make sure no queued up calls will fire after this.
      JSEvents.removeDeferredCalls(JSEvents.requestFullscreen);
  
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else {
        return -1;
      }
  
      if (__currentFullscreenStrategy.canvasResizedCallback) {
        Runtime.dynCall('iiii', __currentFullscreenStrategy.canvasResizedCallback, [37, 0, __currentFullscreenStrategy.canvasResizedCallbackUserData]);
      }
  
      return 0;
    }

  function _alcDestroyContext(context) {
      // Stop playback, etc
      clearInterval(AL.contexts[context - 1].interval);
    }

  function _emscripten_glGenFramebuffers(n, ids) {
      for (var i = 0; i < n; ++i) {
        var framebuffer = GLctx.createFramebuffer();
        if (!framebuffer) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
          while(i < n) HEAP32[(((ids)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.framebuffers);
        framebuffer.name = id;
        GL.framebuffers[id] = framebuffer;
        HEAP32[(((ids)+(i*4))>>2)]=id;
      }
    }

  function _glGetShaderiv(shader, pname, p) {
      if (!p) {
        // GLES2 specification does not specify how to behave if p is a null pointer. Since calling this function does not make sense
        // if p == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      if (pname == 0x8B84) { // GL_INFO_LOG_LENGTH
        var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
        if (log === null) log = '(unknown error)';
        HEAP32[((p)>>2)]=log.length + 1;
      } else {
        HEAP32[((p)>>2)]=GLctx.getShaderParameter(GL.shaders[shader], pname);
      }
    }

  function _emscripten_glBlendEquationSeparate(x0, x1) { GLctx.blendEquationSeparate(x0, x1) }

  function _eglWaitNative(nativeEngineId) {
      EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
      return 1;
    }

  
  function _usleep(useconds) {
      // int usleep(useconds_t useconds);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/usleep.html
      // We're single-threaded, so use a busy loop. Super-ugly.
      var msec = useconds / 1000;
      if ((ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && self['performance'] && self['performance']['now']) {
        var start = self['performance']['now']();
        while (self['performance']['now']() - start < msec) {
          // Do nothing.
        }
      } else {
        var start = Date.now();
        while (Date.now() - start < msec) {
          // Do nothing.
        }
      }
      return 0;
    }function _nanosleep(rqtp, rmtp) {
      // int nanosleep(const struct timespec  *rqtp, struct timespec *rmtp);
      var seconds = HEAP32[((rqtp)>>2)];
      var nanoseconds = HEAP32[(((rqtp)+(4))>>2)];
      if (rmtp !== 0) {
        HEAP32[((rmtp)>>2)]=0;
        HEAP32[(((rmtp)+(4))>>2)]=0;
      }
      return _usleep((seconds * 1e6) + (nanoseconds / 1000));
    }

  function _emscripten_glBindTexture(target, texture) {
      GLctx.bindTexture(target, texture ? GL.textures[texture] : null);
    }

  function _emscripten_glDrawRangeElements() {
  Module['printErr']('missing function: emscripten_glDrawRangeElements'); abort(-1);
  }

  function _emscripten_glGenTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var texture = GLctx.createTexture();
        if (!texture) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */); // GLES + EGL specs don't specify what should happen here, so best to issue an error and create IDs with 0.
          while(i < n) HEAP32[(((textures)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.textures);
        texture.name = id;
        GL.textures[id] = texture;
        HEAP32[(((textures)+(i*4))>>2)]=id;
      }
    }

  function _emscripten_glVertexAttrib2fv(index, v) {
      v = HEAPF32.subarray((v)>>2,(v+8)>>2);
      GLctx.vertexAttrib2fv(index, v);
    }

  var _floorf=Math_floor;

  function _emscripten_glGetActiveUniform(program, index, bufSize, length, size, type, name) {
      program = GL.programs[program];
      var info = GLctx.getActiveUniform(program, index);
      if (!info) return; // If an error occurs, nothing will be written to length, size, type and name.
  
      var infoname = info.name.slice(0, Math.max(0, bufSize - 1));
      if (bufSize > 0 && name) {
        writeStringToMemory(infoname, name);
        if (length) HEAP32[((length)>>2)]=infoname.length;
      } else {
        if (length) HEAP32[((length)>>2)]=0;
      }
  
      if (size) HEAP32[((size)>>2)]=info.size;
      if (type) HEAP32[((type)>>2)]=info.type;
    }

  function _emscripten_glDeleteObjectARB() {
  Module['printErr']('missing function: emscripten_glDeleteObjectARB'); abort(-1);
  }

  function _emscripten_set_touchmove_callback(target, userData, useCapture, callbackfunc) {
      JSEvents.registerTouchEventCallback(target, userData, useCapture, callbackfunc, 24, "touchmove");
      return 0;
    }

  function _emscripten_glUniform1f(location, v0) {
      location = GL.uniforms[location];
      GLctx.uniform1f(location, v0);
    }

  function _alcCreateContext(device, attrList) {
      if (device != 1) {
        return 0;
      }
  
      if (attrList) {
        return 0;
      }
  
      var ctx;
      try {
        ctx = new AudioContext();
      } catch (e) {
        try {
          ctx = new webkitAudioContext();
        } catch (e) {}
      }
  
      if (ctx) {
        // Old Web Audio API (e.g. Safari 6.0.5) had an inconsistently named createGainNode function.
        if (typeof(ctx.createGain) === 'undefined') ctx.createGain = ctx.createGainNode;
  
        var gain = ctx.createGain();
        gain.connect(ctx.destination);
        var context = {
          ctx: ctx,
          err: 0,
          src: {},
          buf: [],
          interval: setInterval(function() { AL.updateSources(context); }, AL.QUEUE_INTERVAL),
          gain: gain
        };
        AL.contexts.push(context);
        return AL.contexts.length;
      } else {
        return 0;
      }
    }

  function _emscripten_glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
      GLctx.vertexAttribPointer(index, size, type, normalized, stride, ptr);
    }

  function _alcCloseDevice(device) {
      // Stop playback, etc
    }

  function _glShaderSource(shader, count, string, length) {
      var source = GL.getSource(shader, count, string, length);
      GLctx.shaderSource(GL.shaders[shader], source);
    }

  function _emscripten_glBindBuffer(target, buffer) {
      var bufferObj = buffer ? GL.buffers[buffer] : null;
  
  
      GLctx.bindBuffer(target, bufferObj);
    }

  var _sqrtf=Math_sqrt;

  function _emscripten_glDrawArrays(mode, first, count) {
  
      GLctx.drawArrays(mode, first, count);
  
    }

  function _emscripten_glGenBuffers(n, buffers) {
      for (var i = 0; i < n; i++) {
        var buffer = GLctx.createBuffer();
        if (!buffer) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
          while(i < n) HEAP32[(((buffers)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.buffers);
        buffer.name = id;
        GL.buffers[id] = buffer;
        HEAP32[(((buffers)+(i*4))>>2)]=id;
      }
    }

  function _emscripten_glClearDepth(x0) { GLctx.clearDepth(x0) }

   
  Module["_i64Subtract"] = _i64Subtract;

  
  var PTHREAD_SPECIFIC_NEXT_KEY=1;function _pthread_key_create(key, destructor) {
      if (key == 0) {
        return ERRNO_CODES.EINVAL;
      }
      HEAP32[((key)>>2)]=PTHREAD_SPECIFIC_NEXT_KEY;
      // values start at 0
      PTHREAD_SPECIFIC[PTHREAD_SPECIFIC_NEXT_KEY] = 0;
      PTHREAD_SPECIFIC_NEXT_KEY++;
      return 0;
    }

  function _emscripten_glDeleteTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((textures)+(i*4))>>2)];
        var texture = GL.textures[id];
        if (!texture) continue; // GL spec: "glDeleteTextures silently ignores 0s and names that do not correspond to existing textures".
        GLctx.deleteTexture(texture);
        texture.name = 0;
        GL.textures[id] = null;
      }
    }

  
  function _glutDestroyWindow(name) {
      Module.ctx = Browser.destroyContext(Module['canvas'], true, true);
      return 1;
    }function _eglDestroyContext(display, context) {
      if (display != 62000 /* Magic ID for Emscripten 'default display' */) {
        EGL.setErrorCode(0x3008 /* EGL_BAD_DISPLAY */);
        return 0;
      }
  
      if (context != 62004 /* Magic ID for Emscripten EGLContext */) {
        EGL.setErrorCode(0x3006 /* EGL_BAD_CONTEXT */);
        return 0;
      }
  
      EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
      return 1;
    }

  function _emscripten_glGetUniformLocation(program, name) {
      name = Pointer_stringify(name);
  
      var arrayOffset = 0;
      // If user passed an array accessor "[index]", parse the array index off the accessor.
      if (name.indexOf(']', name.length-1) !== -1) {
        var ls = name.lastIndexOf('[');
        var arrayIndex = name.slice(ls+1, -1);
        if (arrayIndex.length > 0) {
          arrayOffset = parseInt(arrayIndex);
          if (arrayOffset < 0) {
            return -1;
          }
        }
        name = name.slice(0, ls);
      }
  
      var ptable = GL.programInfos[program];
      if (!ptable) {
        return -1;
      }
      var utable = ptable.uniforms;
      var uniformInfo = utable[name]; // returns pair [ dimension_of_uniform_array, uniform_location ]
      if (uniformInfo && arrayOffset < uniformInfo[0]) { // Check if user asked for an out-of-bounds element, i.e. for 'vec4 colors[3];' user could ask for 'colors[10]' which should return -1.
        return uniformInfo[1]+arrayOffset;
      } else {
        return -1;
      }
    }

  function _glBindBuffer(target, buffer) {
      var bufferObj = buffer ? GL.buffers[buffer] : null;
  
  
      GLctx.bindBuffer(target, bufferObj);
    }

  function _emscripten_glVertexAttrib4fv(index, v) {
      v = HEAPF32.subarray((v)>>2,(v+16)>>2);
      GLctx.vertexAttrib4fv(index, v);
    }

  function _emscripten_glScissor(x0, x1, x2, x3) { GLctx.scissor(x0, x1, x2, x3) }

   
  Module["_bitshift64Lshr"] = _bitshift64Lshr;

  function _glBufferData(target, size, data, usage) {
      switch (usage) { // fix usages, WebGL only has *_DRAW
        case 0x88E1: // GL_STREAM_READ
        case 0x88E2: // GL_STREAM_COPY
          usage = 0x88E0; // GL_STREAM_DRAW
          break;
        case 0x88E5: // GL_STATIC_READ
        case 0x88E6: // GL_STATIC_COPY
          usage = 0x88E4; // GL_STATIC_DRAW
          break;
        case 0x88E9: // GL_DYNAMIC_READ
        case 0x88EA: // GL_DYNAMIC_COPY
          usage = 0x88E8; // GL_DYNAMIC_DRAW
          break;
      }
      if (!data) {
        GLctx.bufferData(target, size, usage);
      } else {
        GLctx.bufferData(target, HEAPU8.subarray(data, data+size), usage);
      }
    }

  function _emscripten_glLinkProgram(program) {
      GLctx.linkProgram(GL.programs[program]);
      GL.programInfos[program] = null; // uniforms no longer keep the same names after linking
      GL.populateUniformTable(program);
    }

  var _BDtoIHigh=true;

  function _emscripten_glGetRenderbufferParameteriv(target, pname, params) {
      if (!params) {
        // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
        // if params == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      HEAP32[((params)>>2)]=GLctx.getRenderbufferParameter(target, pname);
    }

  function _glGenBuffers(n, buffers) {
      for (var i = 0; i < n; i++) {
        var buffer = GLctx.createBuffer();
        if (!buffer) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
          while(i < n) HEAP32[(((buffers)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.buffers);
        buffer.name = id;
        GL.buffers[id] = buffer;
        HEAP32[(((buffers)+(i*4))>>2)]=id;
      }
    }

  function _emscripten_glDrawBuffers(n, bufs) {
      var bufArray = [];
      for (var i = 0; i < n; i++)
        bufArray.push(HEAP32[(((bufs)+(i*4))>>2)]);
  
      GLctx['drawBuffers'](bufArray);
    }

  function _emscripten_glValidateProgram(program) {
      GLctx.validateProgram(GL.programs[program]);
    }

  function _pthread_mutex_unlock() {}

  function _emscripten_glBindFramebuffer(target, framebuffer) {
      GLctx.bindFramebuffer(target, framebuffer ? GL.framebuffers[framebuffer] : null);
    }

  function _emscripten_glBlendEquation(x0) { GLctx.blendEquation(x0) }

  function _emscripten_glBufferSubData(target, offset, size, data) {
      GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data+size));
    }

  function _emscripten_set_keydown_callback(target, userData, useCapture, callbackfunc) {
      JSEvents.registerKeyEventCallback(target, userData, useCapture, callbackfunc, 2, "keydown");
      return 0;
    }

  function _emscripten_glBufferData(target, size, data, usage) {
      switch (usage) { // fix usages, WebGL only has *_DRAW
        case 0x88E1: // GL_STREAM_READ
        case 0x88E2: // GL_STREAM_COPY
          usage = 0x88E0; // GL_STREAM_DRAW
          break;
        case 0x88E5: // GL_STATIC_READ
        case 0x88E6: // GL_STATIC_COPY
          usage = 0x88E4; // GL_STATIC_DRAW
          break;
        case 0x88E9: // GL_DYNAMIC_READ
        case 0x88EA: // GL_DYNAMIC_COPY
          usage = 0x88E8; // GL_DYNAMIC_DRAW
          break;
      }
      if (!data) {
        GLctx.bufferData(target, size, usage);
      } else {
        GLctx.bufferData(target, HEAPU8.subarray(data, data+size), usage);
      }
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) {
        var success = self.alloc(bytes);
        if (!success) return -1 >>> 0; // sbrk failure code
      }
      return ret;  // Previous break location.
    }

  function _alcMakeContextCurrent(context) {
      if (context == 0) {
        AL.currentContext = null;
        return 0;
      } else {
        AL.currentContext = AL.contexts[context - 1];
        return 1;
      }
    }

  function _emscripten_exit_pointerlock() {
      // Make sure no queued up calls will fire after this.
      JSEvents.removeDeferredCalls(JSEvents.requestPointerLock);
  
      if (document.exitPointerLock) {
        document.exitPointerLock();
      } else if (document.msExitPointerLock) {
        document.msExitPointerLock();
      } else if (document.mozExitPointerLock) {
        document.mozExitPointerLock();
      } else if (document.webkitExitPointerLock) {
        document.webkitExitPointerLock();
      } else {
        return -1;
      }
      return 0;
    }

  var _BItoD=true;

  function _emscripten_glDeleteFramebuffers(n, framebuffers) {
      for (var i = 0; i < n; ++i) {
        var id = HEAP32[(((framebuffers)+(i*4))>>2)];
        var framebuffer = GL.framebuffers[id];
        if (!framebuffer) continue; // GL spec: "glDeleteFramebuffers silently ignores 0s and names that do not correspond to existing framebuffer objects".
        GLctx.deleteFramebuffer(framebuffer);
        framebuffer.name = 0;
        GL.framebuffers[id] = null;
      }
    }

  function _emscripten_glGetShaderSource(shader, bufSize, length, source) {
      var result = GLctx.getShaderSource(GL.shaders[shader]);
      if (!result) return; // If an error occurs, nothing will be written to length or source.
      result = result.slice(0, Math.max(0, bufSize - 1));
      if (bufSize > 0 && source) {
        writeStringToMemory(result, source);
        if (length) HEAP32[((length)>>2)]=result.length;
      } else {
        if (length) HEAP32[((length)>>2)]=0;
      }
    }

   
  Module["_llvm_bswap_i32"] = _llvm_bswap_i32;

  function _emscripten_glBindVertexArray(vao) {
      GLctx['bindVertexArray'](GL.vaos[vao]);
    }

  function ___cxa_guard_release() {}

  var _exp=Math_exp;

  function _emscripten_set_gamepadconnected_callback(userData, useCapture, callbackfunc) {
      if (!navigator.getGamepads && !navigator.webkitGetGamepads) return -1;
      JSEvents.registerGamepadEventCallback(window, userData, useCapture, callbackfunc, 26, "gamepadconnected");
      return 0;
    }

  function _emscripten_glGetFloatv(name_, p) {
      emscriptenWebGLGet(name_, p, 'Float');
    }

  function _glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
      var pixelData;
      if (pixels) {
        var data = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat);
        pixelData = data.pixels;
        internalFormat = data.internalFormat;
      } else {
        pixelData = null;
      }
      GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData);
    }

  function _glGetProgramInfoLog(program, maxLength, length, infoLog) {
      var log = GLctx.getProgramInfoLog(GL.programs[program]);
      if (log === null) log = '(unknown error)';
  
      log = log.substr(0, maxLength - 1);
      if (maxLength > 0 && infoLog) {
        writeStringToMemory(log, infoLog);
        if (length) HEAP32[((length)>>2)]=log.length;
      } else {
        if (length) HEAP32[((length)>>2)]=0;
      }
    }

  function _emscripten_glUniform3fv(location, count, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform
        view = GL.miniTempBufferViews[2];
        view[0] = HEAPF32[((value)>>2)];
        view[1] = HEAPF32[(((value)+(4))>>2)];
        view[2] = HEAPF32[(((value)+(8))>>2)];
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*12)>>2);
      }
      GLctx.uniform3fv(location, view);
    }

  function _emscripten_glDrawElementsInstanced(mode, count, type, indices, primcount) {
      GLctx['drawElementsInstanced'](mode, count, type, indices, primcount);
    }

  function _eglMakeCurrent(display, draw, read, context) { 
      if (display != 62000 /* Magic ID for Emscripten 'default display' */) {
        EGL.setErrorCode(0x3008 /* EGL_BAD_DISPLAY */);
        return 0 /* EGL_FALSE */;
      }
      //\todo An EGL_NOT_INITIALIZED error is generated if EGL is not initialized for dpy. 
      if (context != 0 && context != 62004 /* Magic ID for Emscripten EGLContext */) {
        EGL.setErrorCode(0x3006 /* EGL_BAD_CONTEXT */);
        return 0;
      }
      if ((read != 0 && read != 62006) || (draw != 0 && draw != 62006 /* Magic ID for Emscripten 'default surface' */)) {
        EGL.setErrorCode(0x300D /* EGL_BAD_SURFACE */);
        return 0;
      }
      EGL.currentContext = context;
      EGL.currentDrawSurface = draw;
      EGL.currentReadSurface = read;
      EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
      return 1 /* EGL_TRUE */;
    }

  function _emscripten_glDrawElements(mode, count, type, indices) {
  
      GLctx.drawElements(mode, count, type, indices);
  
    }

  function _glDeleteBuffers(n, buffers) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((buffers)+(i*4))>>2)];
        var buffer = GL.buffers[id];
  
        // From spec: "glDeleteBuffers silently ignores 0's and names that do not
        // correspond to existing buffer objects."
        if (!buffer) continue;
  
        GLctx.deleteBuffer(buffer);
        buffer.name = 0;
        GL.buffers[id] = null;
  
        if (id == GL.currArrayBuffer) GL.currArrayBuffer = 0;
        if (id == GL.currElementArrayBuffer) GL.currElementArrayBuffer = 0;
      }
    }

  function _emscripten_glCreateProgram() {
      var id = GL.getNewId(GL.programs);
      var program = GLctx.createProgram();
      program.name = id;
      GL.programs[id] = program;
      return id;
    }

  function _pthread_once(ptr, func) {
      if (!_pthread_once.seen) _pthread_once.seen = {};
      if (ptr in _pthread_once.seen) return;
      Runtime.dynCall('v', func);
      _pthread_once.seen[ptr] = 1;
    }

  function _emscripten_glCompressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data) {
      var heapView;
      if (data) {
        heapView = HEAPU8.subarray((data),(data+imageSize));
      } else {
        heapView = null;
      }
      GLctx['compressedTexImage2D'](target, level, internalFormat, width, height, border, heapView);
    }

  function _emscripten_glClearColor(x0, x1, x2, x3) { GLctx.clearColor(x0, x1, x2, x3) }

  function ___unlock() {}

  var _atan2=Math_atan2;

  function _emscripten_glLoadMatrixf() {
  Module['printErr']('missing function: emscripten_glLoadMatrixf'); abort(-1);
  }

  
  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }

  function _glDeleteShader(id) {
      if (!id) return;
      var shader = GL.shaders[id];
      if (!shader) { // glDeleteShader actually signals an error when deleting a nonexisting object, unlike some other GL delete functions.
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      GLctx.deleteShader(shader);
      GL.shaders[id] = null;
    }

  function _emscripten_glGetProgramiv(program, pname, p) {
      if (!p) {
        // GLES2 specification does not specify how to behave if p is a null pointer. Since calling this function does not make sense
        // if p == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      if (pname == 0x8B84) { // GL_INFO_LOG_LENGTH
        var log = GLctx.getProgramInfoLog(GL.programs[program]);
        if (log === null) log = '(unknown error)';
        HEAP32[((p)>>2)]=log.length + 1;
      } else if (pname == 0x8B87 /* GL_ACTIVE_UNIFORM_MAX_LENGTH */) {
        var ptable = GL.programInfos[program];
        if (ptable) {
          HEAP32[((p)>>2)]=ptable.maxUniformLength;
          return;
        } else if (program < GL.counter) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
        } else {
          GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        }
      } else if (pname == 0x8B8A /* GL_ACTIVE_ATTRIBUTE_MAX_LENGTH */) {
        var ptable = GL.programInfos[program];
        if (ptable) {
          if (ptable.maxAttributeLength == -1) {
            var program = GL.programs[program];
            var numAttribs = GLctx.getProgramParameter(program, GLctx.ACTIVE_ATTRIBUTES);
            ptable.maxAttributeLength = 0; // Spec says if there are no active attribs, 0 must be returned.
            for(var i = 0; i < numAttribs; ++i) {
              var activeAttrib = GLctx.getActiveAttrib(program, i);
              ptable.maxAttributeLength = Math.max(ptable.maxAttributeLength, activeAttrib.name.length+1);
            }
          }
          HEAP32[((p)>>2)]=ptable.maxAttributeLength;
          return;
        } else if (program < GL.counter) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
        } else {
          GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        }
      } else {
        HEAP32[((p)>>2)]=GLctx.getProgramParameter(GL.programs[program], pname);
      }
    }

  function _emscripten_glGetProgramInfoLog(program, maxLength, length, infoLog) {
      var log = GLctx.getProgramInfoLog(GL.programs[program]);
      if (log === null) log = '(unknown error)';
  
      log = log.substr(0, maxLength - 1);
      if (maxLength > 0 && infoLog) {
        writeStringToMemory(log, infoLog);
        if (length) HEAP32[((length)>>2)]=log.length;
      } else {
        if (length) HEAP32[((length)>>2)]=0;
      }
    }

  function _emscripten_glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
      var pixelData;
      if (pixels) {
        var data = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat);
        pixelData = data.pixels;
        internalFormat = data.internalFormat;
      } else {
        pixelData = null;
      }
      GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData);
    }

  function _emscripten_glGenVertexArrays(n, arrays) {
  
      for(var i = 0; i < n; i++) {
        var vao = GLctx['createVertexArray']();
        if (!vao) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
          while(i < n) HEAP32[(((arrays)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.vaos);
        vao.name = id;
        GL.vaos[id] = vao;
        HEAP32[(((arrays)+(i*4))>>2)]=id;
      }
    }

  function _emscripten_glColorPointer() {
  Module['printErr']('missing function: emscripten_glColorPointer'); abort(-1);
  }

  function _glViewport(x0, x1, x2, x3) { GLctx.viewport(x0, x1, x2, x3) }

  function _emscripten_glFlush() { GLctx.flush() }

  var _log=Math_log;

  function _glDepthMask(x0) { GLctx.depthMask(x0) }

  function _emscripten_glCreateShader(shaderType) {
      var id = GL.getNewId(GL.shaders);
      GL.shaders[id] = GLctx.createShader(shaderType);
      return id;
    }

  
  
  
  
  var _environ=allocate(1, "i32*", ALLOC_STATIC);var ___environ=_environ;function ___buildEnvironment(env) {
      // WARNING: Arbitrary limit!
      var MAX_ENV_VALUES = 64;
      var TOTAL_ENV_SIZE = 1024;
  
      // Statically allocate memory for the environment.
      var poolPtr;
      var envPtr;
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        // Set default values. Use string keys for Closure Compiler compatibility.
        ENV['USER'] = ENV['LOGNAME'] = 'web_user';
        ENV['PATH'] = '/';
        ENV['PWD'] = '/';
        ENV['HOME'] = '/home/web_user';
        ENV['LANG'] = 'C';
        ENV['_'] = Module['thisProgram'];
        // Allocate memory.
        poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
        envPtr = allocate(MAX_ENV_VALUES * 4,
                          'i8*', ALLOC_STATIC);
        HEAP32[((envPtr)>>2)]=poolPtr;
        HEAP32[((_environ)>>2)]=envPtr;
      } else {
        envPtr = HEAP32[((_environ)>>2)];
        poolPtr = HEAP32[((envPtr)>>2)];
      }
  
      // Collect key=value lines.
      var strings = [];
      var totalSize = 0;
      for (var key in env) {
        if (typeof env[key] === 'string') {
          var line = key + '=' + env[key];
          strings.push(line);
          totalSize += line.length;
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
      }
  
      // Make new.
      var ptrSize = 4;
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        writeAsciiToMemory(line, poolPtr);
        HEAP32[(((envPtr)+(i * ptrSize))>>2)]=poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP32[(((envPtr)+(strings.length * ptrSize))>>2)]=0;
    }var ENV={};function _getenv(name) {
      // char *getenv(const char *name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
      if (name === 0) return 0;
      name = Pointer_stringify(name);
      if (!ENV.hasOwnProperty(name)) return 0;
  
      if (_getenv.ret) _free(_getenv.ret);
      _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
      return _getenv.ret;
    }

  var _SItoD=true;

  function _glUniformMatrix4fv(location, count, transpose, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform matrix
        view = GL.miniTempBufferViews[15];
        for (var i = 0; i < 16; i++) {
          view[i] = HEAPF32[(((value)+(i*4))>>2)];
        }
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*64)>>2);
      }
      GLctx.uniformMatrix4fv(location, transpose, view);
    }

  function _emscripten_glIsShader(shader) {
      var s = GL.shaders[shader];
      if (!s) return 0;
      return GLctx.isShader(s);
    }

  function _glTexParameteri(x0, x1, x2) { GLctx.texParameteri(x0, x1, x2) }

  function _emscripten_glColorMask(x0, x1, x2, x3) { GLctx.colorMask(x0, x1, x2, x3) }

  function _emscripten_glPixelStorei(pname, param) {
      if (pname == 0x0D05 /* GL_PACK_ALIGNMENT */) {
        GL.packAlignment = param;
      } else if (pname == 0x0cf5 /* GL_UNPACK_ALIGNMENT */) {
        GL.unpackAlignment = param;
      }
      GLctx.pixelStorei(pname, param);
    }

  function _pthread_cleanup_pop() {
      assert(_pthread_cleanup_push.level == __ATEXIT__.length, 'cannot pop if something else added meanwhile!');
      __ATEXIT__.pop();
      _pthread_cleanup_push.level = __ATEXIT__.length;
    }

  function _glGetShaderSource(shader, bufSize, length, source) {
      var result = GLctx.getShaderSource(GL.shaders[shader]);
      if (!result) return; // If an error occurs, nothing will be written to length or source.
      result = result.slice(0, Math.max(0, bufSize - 1));
      if (bufSize > 0 && source) {
        writeStringToMemory(result, source);
        if (length) HEAP32[((length)>>2)]=result.length;
      } else {
        if (length) HEAP32[((length)>>2)]=0;
      }
    }

  function _eglGetDisplay(nativeDisplayType) {
      EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
      // Note: As a 'conformant' implementation of EGL, we would prefer to init here only if the user
      //       calls this function with EGL_DEFAULT_DISPLAY. Other display IDs would be preferred to be unsupported
      //       and EGL_NO_DISPLAY returned. Uncomment the following code lines to do this.
      // Instead, an alternative route has been preferred, namely that the Emscripten EGL implementation
      // "emulates" X11, and eglGetDisplay is expected to accept/receive a pointer to an X11 Display object.
      // Therefore, be lax and allow anything to be passed in, and return the magic handle to our default EGLDisplay object.
  
  //    if (nativeDisplayType == 0 /* EGL_DEFAULT_DISPLAY */) {
          return 62000; // Magic ID for Emscripten 'default display'
  //    }
  //    else
  //      return 0; // EGL_NO_DISPLAY
    }

  function _emscripten_set_canvas_size(width, height) {
      Browser.setCanvasSize(width, height);
    }

  var _llvm_nacl_atomic_cmpxchg_i32=undefined;

  function _glPixelStorei(pname, param) {
      if (pname == 0x0D05 /* GL_PACK_ALIGNMENT */) {
        GL.packAlignment = param;
      } else if (pname == 0x0cf5 /* GL_UNPACK_ALIGNMENT */) {
        GL.unpackAlignment = param;
      }
      GLctx.pixelStorei(pname, param);
    }

  function _time(ptr) {
      var ret = (Date.now()/1000)|0;
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  function _pthread_self() {
      //FIXME: assumes only a single thread
      return 0;
    }

  function _emscripten_glGetBooleanv(name_, p) {
      emscriptenWebGLGet(name_, p, 'Boolean');
    }

  function ___syscall221(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // fcntl64
      var stream = SYSCALLS.getStreamFromFD(), cmd = SYSCALLS.get();
      switch (cmd) {
        case 0: {
          var arg = SYSCALLS.get();
          if (arg < 0) {
            return -ERRNO_CODES.EINVAL;
          }
          var newStream;
          newStream = FS.open(stream.path, stream.flags, 0, arg);
          return newStream.fd;
        }
        case 1:
        case 2:
          return 0;  // FD_CLOEXEC makes no sense for a single process.
        case 3:
          return stream.flags;
        case 4: {
          var arg = SYSCALLS.get();
          stream.flags |= arg;
          return 0;
        }
        case 12:
        case 12: {
          var arg = SYSCALLS.get();
          var offset = 0;
          // We're always unlocked.
          HEAP16[(((arg)+(offset))>>1)]=2;
          return 0;
        }
        case 13:
        case 14:
        case 13:
        case 14:
          return 0; // Pretend that the locking is successful.
        case 16:
        case 8:
          return -ERRNO_CODES.EINVAL; // These are for sockets. We don't have them fully implemented yet.
        case 9:
          // musl trusts getown return values, due to a bug where they must be, as they overlap with errors. just return -1 here, so fnctl() returns that, and we set errno ourselves.
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
        default: {
          return -ERRNO_CODES.EINVAL;
        }
      }
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }
var GLctx; GL.init()
FS.staticInit();__ATINIT__.unshift(function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() });__ATMAIN__.push(function() { FS.ignorePermissions = false });__ATEXIT__.push(function() { FS.quit() });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;Module["FS_unlink"] = FS.unlink;
__ATINIT__.unshift(function() { TTY.init() });__ATEXIT__.push(function() { TTY.shutdown() });
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); var NODEJS_PATH = require("path"); NODEFS.staticInit(); }
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas, vrDevice) { Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
  Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) { return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes) }
___buildEnvironment(ENV);
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + TOTAL_STACK;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);


function nullFunc_iiiiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iiiiiid(x) { Module["printErr"]("Invalid function pointer called with signature 'iiiiiid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vd(x) { Module["printErr"]("Invalid function pointer called with signature 'vd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vid(x) { Module["printErr"]("Invalid function pointer called with signature 'vid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiddiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiddiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vi(x) { Module["printErr"]("Invalid function pointer called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiidii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiidii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vii(x) { Module["printErr"]("Invalid function pointer called with signature 'vii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iiiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_ii(x) { Module["printErr"]("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viidd(x) { Module["printErr"]("Invalid function pointer called with signature 'viidd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iidd(x) { Module["printErr"]("Invalid function pointer called with signature 'iidd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viidi(x) { Module["printErr"]("Invalid function pointer called with signature 'viidi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iidi(x) { Module["printErr"]("Invalid function pointer called with signature 'iidi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viddd(x) { Module["printErr"]("Invalid function pointer called with signature 'viddd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iiiiiiiiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiiiiiiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vidd(x) { Module["printErr"]("Invalid function pointer called with signature 'vidd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiiiiiiiiiiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiiiiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiiiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iiid(x) { Module["printErr"]("Invalid function pointer called with signature 'iiid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_ddd(x) { Module["printErr"]("Invalid function pointer called with signature 'ddd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viid(x) { Module["printErr"]("Invalid function pointer called with signature 'viid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_di(x) { Module["printErr"]("Invalid function pointer called with signature 'di'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_dd(x) { Module["printErr"]("Invalid function pointer called with signature 'dd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vidddd(x) { Module["printErr"]("Invalid function pointer called with signature 'vidddd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vdi(x) { Module["printErr"]("Invalid function pointer called with signature 'vdi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiiiiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiiiiiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iii(x) { Module["printErr"]("Invalid function pointer called with signature 'iii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_diii(x) { Module["printErr"]("Invalid function pointer called with signature 'diii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_dii(x) { Module["printErr"]("Invalid function pointer called with signature 'dii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viii(x) { Module["printErr"]("Invalid function pointer called with signature 'viii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_i(x) { Module["printErr"]("Invalid function pointer called with signature 'i'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iiiiidii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiiiidii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iiiiiiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vdddddd(x) { Module["printErr"]("Invalid function pointer called with signature 'vdddddd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vdddd(x) { Module["printErr"]("Invalid function pointer called with signature 'vdddd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vdd(x) { Module["printErr"]("Invalid function pointer called with signature 'vdd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_v(x) { Module["printErr"]("Invalid function pointer called with signature 'v'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iiiiiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iiiiid(x) { Module["printErr"]("Invalid function pointer called with signature 'iiiiid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function invoke_iiiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    return Module["dynCall_iiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiiid(index,a1,a2,a3,a4,a5,a6) {
  try {
    return Module["dynCall_iiiiiid"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vd(index,a1) {
  try {
    Module["dynCall_vd"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vid(index,a1,a2) {
  try {
    Module["dynCall_vid"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiddiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiddiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiidii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiidii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    return Module["dynCall_iiiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viidd(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viidd"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iidd(index,a1,a2,a3) {
  try {
    return Module["dynCall_iidd"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viidi(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viidi"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iidi(index,a1,a2,a3) {
  try {
    return Module["dynCall_iidi"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viddd(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viddd"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11) {
  try {
    return Module["dynCall_iiiiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11) {
  try {
    Module["dynCall_viiiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vidd(index,a1,a2,a3) {
  try {
    Module["dynCall_vidd"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15) {
  try {
    Module["dynCall_viiiiiiiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiid(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiid"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_ddd(index,a1,a2) {
  try {
    return Module["dynCall_ddd"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viid(index,a1,a2,a3) {
  try {
    Module["dynCall_viid"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_di(index,a1) {
  try {
    return Module["dynCall_di"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_dd(index,a1) {
  try {
    return Module["dynCall_dd"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vidddd(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_vidddd"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vdi(index,a1,a2) {
  try {
    Module["dynCall_vdi"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
  try {
    Module["dynCall_viiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_diii(index,a1,a2,a3) {
  try {
    return Module["dynCall_diii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_dii(index,a1,a2) {
  try {
    return Module["dynCall_dii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_i(index) {
  try {
    return Module["dynCall_i"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiidii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    return Module["dynCall_iiiiidii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    return Module["dynCall_iiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vdddddd(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_vdddddd"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vdddd(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_vdddd"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vdd(index,a1,a2) {
  try {
    Module["dynCall_vdd"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    return Module["dynCall_iiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiid(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiid"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

Module.asmGlobalArg = { "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array, "NaN": NaN, "Infinity": Infinity };

Module.asmLibraryArg = { "abort": abort, "assert": assert, "nullFunc_iiiiiiii": nullFunc_iiiiiiii, "nullFunc_iiiiiid": nullFunc_iiiiiid, "nullFunc_vd": nullFunc_vd, "nullFunc_vid": nullFunc_vid, "nullFunc_viiddiii": nullFunc_viiddiii, "nullFunc_vi": nullFunc_vi, "nullFunc_viiidii": nullFunc_viiidii, "nullFunc_vii": nullFunc_vii, "nullFunc_iiiiiii": nullFunc_iiiiiii, "nullFunc_ii": nullFunc_ii, "nullFunc_viidd": nullFunc_viidd, "nullFunc_iidd": nullFunc_iidd, "nullFunc_viidi": nullFunc_viidi, "nullFunc_iidi": nullFunc_iidi, "nullFunc_viiiii": nullFunc_viiiii, "nullFunc_viddd": nullFunc_viddd, "nullFunc_iiiiiiiiiiii": nullFunc_iiiiiiiiiiii, "nullFunc_viiiiiiiiiii": nullFunc_viiiiiiiiiii, "nullFunc_vidd": nullFunc_vidd, "nullFunc_iiii": nullFunc_iiii, "nullFunc_viiiiiiiiiiiiiii": nullFunc_viiiiiiiiiiiiiii, "nullFunc_viiiiiiii": nullFunc_viiiiiiii, "nullFunc_viiiiii": nullFunc_viiiiii, "nullFunc_iiid": nullFunc_iiid, "nullFunc_ddd": nullFunc_ddd, "nullFunc_viid": nullFunc_viid, "nullFunc_di": nullFunc_di, "nullFunc_dd": nullFunc_dd, "nullFunc_vidddd": nullFunc_vidddd, "nullFunc_vdi": nullFunc_vdi, "nullFunc_viiiiiii": nullFunc_viiiiiii, "nullFunc_viiiiiiiii": nullFunc_viiiiiiiii, "nullFunc_viiiiiiiiii": nullFunc_viiiiiiiiii, "nullFunc_iii": nullFunc_iii, "nullFunc_iiiiii": nullFunc_iiiiii, "nullFunc_diii": nullFunc_diii, "nullFunc_dii": nullFunc_dii, "nullFunc_viii": nullFunc_viii, "nullFunc_i": nullFunc_i, "nullFunc_iiiiidii": nullFunc_iiiiidii, "nullFunc_iiiiiiiiii": nullFunc_iiiiiiiiii, "nullFunc_vdddddd": nullFunc_vdddddd, "nullFunc_vdddd": nullFunc_vdddd, "nullFunc_vdd": nullFunc_vdd, "nullFunc_v": nullFunc_v, "nullFunc_iiiiiiiii": nullFunc_iiiiiiiii, "nullFunc_iiiii": nullFunc_iiiii, "nullFunc_iiiiid": nullFunc_iiiiid, "nullFunc_viiii": nullFunc_viiii, "invoke_iiiiiiii": invoke_iiiiiiii, "invoke_iiiiiid": invoke_iiiiiid, "invoke_vd": invoke_vd, "invoke_vid": invoke_vid, "invoke_viiddiii": invoke_viiddiii, "invoke_vi": invoke_vi, "invoke_viiidii": invoke_viiidii, "invoke_vii": invoke_vii, "invoke_iiiiiii": invoke_iiiiiii, "invoke_ii": invoke_ii, "invoke_viidd": invoke_viidd, "invoke_iidd": invoke_iidd, "invoke_viidi": invoke_viidi, "invoke_iidi": invoke_iidi, "invoke_viiiii": invoke_viiiii, "invoke_viddd": invoke_viddd, "invoke_iiiiiiiiiiii": invoke_iiiiiiiiiiii, "invoke_viiiiiiiiiii": invoke_viiiiiiiiiii, "invoke_vidd": invoke_vidd, "invoke_iiii": invoke_iiii, "invoke_viiiiiiiiiiiiiii": invoke_viiiiiiiiiiiiiii, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_iiid": invoke_iiid, "invoke_ddd": invoke_ddd, "invoke_viid": invoke_viid, "invoke_di": invoke_di, "invoke_dd": invoke_dd, "invoke_vidddd": invoke_vidddd, "invoke_vdi": invoke_vdi, "invoke_viiiiiii": invoke_viiiiiii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_viiiiiiiiii": invoke_viiiiiiiiii, "invoke_iii": invoke_iii, "invoke_iiiiii": invoke_iiiiii, "invoke_diii": invoke_diii, "invoke_dii": invoke_dii, "invoke_viii": invoke_viii, "invoke_i": invoke_i, "invoke_iiiiidii": invoke_iiiiidii, "invoke_iiiiiiiiii": invoke_iiiiiiiiii, "invoke_vdddddd": invoke_vdddddd, "invoke_vdddd": invoke_vdddd, "invoke_vdd": invoke_vdd, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_iiiii": invoke_iiiii, "invoke_iiiiid": invoke_iiiiid, "invoke_viiii": invoke_viiii, "_emscripten_glGetTexParameterfv": _emscripten_glGetTexParameterfv, "_fabs": _fabs, "_emscripten_glBlendFuncSeparate": _emscripten_glBlendFuncSeparate, "_emscripten_glGetIntegerv": _emscripten_glGetIntegerv, "_glUniformMatrix4fv": _glUniformMatrix4fv, "___assert_fail": ___assert_fail, "_glVertexAttrib4f": _glVertexAttrib4f, "_emscripten_glDepthFunc": _emscripten_glDepthFunc, "_glDisableVertexAttribArray": _glDisableVertexAttribArray, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_emscripten_glUniform1f": _emscripten_glUniform1f, "emscriptenWebGLComputeImageSize": emscriptenWebGLComputeImageSize, "___syscall221": ___syscall221, "_emscripten_glUniform1i": _emscripten_glUniform1i, "___resumeException": ___resumeException, "_emscripten_glIsProgram": _emscripten_glIsProgram, "_glFramebufferRenderbuffer": _glFramebufferRenderbuffer, "___cxa_rethrow": ___cxa_rethrow, "_emscripten_glTexParameteriv": _emscripten_glTexParameteriv, "___syscall140": ___syscall140, "___syscall145": ___syscall145, "___syscall146": ___syscall146, "_emscripten_glAttachShader": _emscripten_glAttachShader, "_emscripten_get_now_is_monotonic": _emscripten_get_now_is_monotonic, "_alcCreateContext": _alcCreateContext, "_emscripten_glTexParameterfv": _emscripten_glTexParameterfv, "_emscripten_glUniformMatrix2fv": _emscripten_glUniformMatrix2fv, "_emscripten_glDrawArraysInstanced": _emscripten_glDrawArraysInstanced, "_glDepthMask": _glDepthMask, "_alcMakeContextCurrent": _alcMakeContextCurrent, "_emscripten_glVertexAttrib2fv": _emscripten_glVertexAttrib2fv, "_glViewport": _glViewport, "_alSourcef": _alSourcef, "_emscripten_glFlush": _emscripten_glFlush, "_alSourcei": _alSourcei, "_alGenBuffers": _alGenBuffers, "_nanosleep": _nanosleep, "_pthread_once": _pthread_once, "_eglWaitClient": _eglWaitClient, "_glAttachShader": _glAttachShader, "_emscripten_glTexCoordPointer": _emscripten_glTexCoordPointer, "_clock_gettime": _clock_gettime, "_glGenTextures": _glGenTextures, "_emscripten_glStencilFuncSeparate": _emscripten_glStencilFuncSeparate, "_emscripten_glVertexAttrib3f": _emscripten_glVertexAttrib3f, "_pthread_mutex_lock": _pthread_mutex_lock, "___cxa_guard_abort": ___cxa_guard_abort, "_dlerror": _dlerror, "_glCullFace": _glCullFace, "_emscripten_get_gamepad_status": _emscripten_get_gamepad_status, "_emscripten_glUniform1iv": _emscripten_glUniform1iv, "_eglGetConfigAttrib": _eglGetConfigAttrib, "_alListenerfv": _alListenerfv, "emscriptenWebGLGetUniform": emscriptenWebGLGetUniform, "_glClearColor": _glClearColor, "_emscripten_glUniform3iv": _emscripten_glUniform3iv, "_emscripten_glGetBufferParameteriv": _emscripten_glGetBufferParameteriv, "_emscripten_glVertexAttrib4fv": _emscripten_glVertexAttrib4fv, "_pthread_getspecific": _pthread_getspecific, "_glCreateShader": _glCreateShader, "_emscripten_glDepthRange": _emscripten_glDepthRange, "_floorf": _floorf, "_sqrtf": _sqrtf, "_glActiveTexture": _glActiveTexture, "_emscripten_request_pointerlock": _emscripten_request_pointerlock, "_eglMakeCurrent": _eglMakeCurrent, "_emscripten_glCopyTexImage2D": _emscripten_glCopyTexImage2D, "_emscripten_glFramebufferTexture2D": _emscripten_glFramebufferTexture2D, "_glEnableVertexAttribArray": _glEnableVertexAttribArray, "_emscripten_glStencilFunc": _emscripten_glStencilFunc, "_glDeleteBuffers": _glDeleteBuffers, "_sin": _sin, "___buildEnvironment": ___buildEnvironment, "_emscripten_glRenderbufferStorage": _emscripten_glRenderbufferStorage, "_emscripten_set_keydown_callback": _emscripten_set_keydown_callback, "_emscripten_glVertexPointer": _emscripten_glVertexPointer, "_eglInitialize": _eglInitialize, "_emscripten_glBufferSubData": _emscripten_glBufferSubData, "_emscripten_glGetUniformfv": _emscripten_glGetUniformfv, "_emscripten_glStencilOp": _emscripten_glStencilOp, "_emscripten_glBlendEquation": _emscripten_glBlendEquation, "_pthread_self": _pthread_self, "_emscripten_glVertexAttrib1fv": _emscripten_glVertexAttrib1fv, "_dlclose": _dlclose, "_emscripten_glGetProgramInfoLog": _emscripten_glGetProgramInfoLog, "_emscripten_glUniform4fv": _emscripten_glUniform4fv, "___cxa_throw": ___cxa_throw, "_emscripten_glUniform2fv": _emscripten_glUniform2fv, "_emscripten_glBindBuffer": _emscripten_glBindBuffer, "_emscripten_glGetFloatv": _emscripten_glGetFloatv, "_glUseProgram": _glUseProgram, "_exp": _exp, "_eglGetDisplay": _eglGetDisplay, "_emscripten_glCullFace": _emscripten_glCullFace, "_emscripten_glStencilMaskSeparate": _emscripten_glStencilMaskSeparate, "_emscripten_glUniform3fv": _emscripten_glUniform3fv, "_glBindBuffer": _glBindBuffer, "_alSource3f": _alSource3f, "_emscripten_glDisableVertexAttribArray": _emscripten_glDisableVertexAttribArray, "_eglBindAPI": _eglBindAPI, "_eglCreateContext": _eglCreateContext, "_emscripten_set_touchstart_callback": _emscripten_set_touchstart_callback, "_tanf": _tanf, "_emscripten_glGetBooleanv": _emscripten_glGetBooleanv, "_emscripten_glVertexAttribDivisor": _emscripten_glVertexAttribDivisor, "_emscripten_glGenBuffers": _emscripten_glGenBuffers, "_emscripten_glDeleteObjectARB": _emscripten_glDeleteObjectARB, "_emscripten_glGetShaderPrecisionFormat": _emscripten_glGetShaderPrecisionFormat, "_emscripten_request_fullscreen_strategy": _emscripten_request_fullscreen_strategy, "_emscripten_glIsEnabled": _emscripten_glIsEnabled, "_emscripten_glStencilOpSeparate": _emscripten_glStencilOpSeparate, "_emscripten_glGetActiveAttrib": _emscripten_glGetActiveAttrib, "_glGenerateMipmap": _glGenerateMipmap, "___cxa_free_exception": ___cxa_free_exception, "_atan2f": _atan2f, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_emscripten_glClear": _emscripten_glClear, "_glDrawElements": _glDrawElements, "___cxa_guard_release": ___cxa_guard_release, "_emscripten_glValidateProgram": _emscripten_glValidateProgram, "_emscripten_glUniform4iv": _emscripten_glUniform4iv, "___setErrNo": ___setErrNo, "_eglSwapBuffers": _eglSwapBuffers, "_emscripten_glVertexAttrib2f": _emscripten_glVertexAttrib2f, "_glUniform3f": _glUniform3f, "_emscripten_glGetError": _emscripten_glGetError, "_emscripten_glBufferData": _emscripten_glBufferData, "_emscripten_glReadPixels": _emscripten_glReadPixels, "_glGetIntegerv": _glGetIntegerv, "_eglCreateWindowSurface": _eglCreateWindowSurface, "_emscripten_glClearStencil": _emscripten_glClearStencil, "emscriptenWebGLGet": emscriptenWebGLGet, "_emscripten_get_device_pixel_ratio": _emscripten_get_device_pixel_ratio, "_emscripten_set_mouseup_callback": _emscripten_set_mouseup_callback, "_emscripten_glFinish": _emscripten_glFinish, "_emscripten_glClearDepth": _emscripten_glClearDepth, "_emscripten_glUniform1fv": _emscripten_glUniform1fv, "_glBindFramebuffer": _glBindFramebuffer, "_glGenFramebuffers": _glGenFramebuffers, "_emscripten_set_resize_callback": _emscripten_set_resize_callback, "_emscripten_glUniform4i": _emscripten_glUniform4i, "_llvm_pow_f64": _llvm_pow_f64, "_glDeleteFramebuffers": _glDeleteFramebuffers, "_emscripten_glUniform4f": _emscripten_glUniform4f, "_glCheckFramebufferStatus": _glCheckFramebufferStatus, "_emscripten_glBlendFunc": _emscripten_glBlendFunc, "_floor": _floor, "_emscripten_glStencilMask": _emscripten_glStencilMask, "_fabsf": _fabsf, "_glBindTexture": _glBindTexture, "_glUniform1f": _glUniform1f, "_strftime": _strftime, "_alcDestroyContext": _alcDestroyContext, "_emscripten_glGetVertexAttribiv": _emscripten_glGetVertexAttribiv, "_emscripten_glUniformMatrix3fv": _emscripten_glUniformMatrix3fv, "_pthread_key_create": _pthread_key_create, "_pthread_setspecific": _pthread_setspecific, "__setLetterbox": __setLetterbox, "_emscripten_glGetObjectParameterivARB": _emscripten_glGetObjectParameterivARB, "_emscripten_glGetUniformiv": _emscripten_glGetUniformiv, "_abs": _abs, "_glGetProgramiv": _glGetProgramiv, "_eglDestroySurface": _eglDestroySurface, "_sigaction": _sigaction, "_emscripten_set_mousemove_callback": _emscripten_set_mousemove_callback, "_emscripten_glDeleteTextures": _emscripten_glDeleteTextures, "_eglDestroyContext": _eglDestroyContext, "_emscripten_exit_fullscreen": _emscripten_exit_fullscreen, "_emscripten_get_element_css_size": _emscripten_get_element_css_size, "_glGetShaderiv": _glGetShaderiv, "_glRenderbufferStorage": _glRenderbufferStorage, "_emscripten_glColorMask": _emscripten_glColorMask, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_emscripten_glBindTexture": _emscripten_glBindTexture, "_glFramebufferTexture2D": _glFramebufferTexture2D, "_emscripten_set_main_loop": _emscripten_set_main_loop, "_alGenSources": _alGenSources, "_emscripten_glIsShader": _emscripten_glIsShader, "_alcOpenDevice": _alcOpenDevice, "_emscripten_glCompressedTexImage2D": _emscripten_glCompressedTexImage2D, "_glDisable": _glDisable, "_emscripten_glGetInfoLogARB": _emscripten_glGetInfoLogARB, "_emscripten_glGenRenderbuffers": _emscripten_glGenRenderbuffers, "_emscripten_glReleaseShaderCompiler": _emscripten_glReleaseShaderCompiler, "_dlsym": _dlsym, "___cxa_guard_acquire": ___cxa_guard_acquire, "_emscripten_glFrontFace": _emscripten_glFrontFace, "_glDeleteProgram": _glDeleteProgram, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_emscripten_glUseProgram": _emscripten_glUseProgram, "_glCreateProgram": _glCreateProgram, "__addDays": __addDays, "_emscripten_set_touchmove_callback": _emscripten_set_touchmove_callback, "_glBlendFunc": _glBlendFunc, "_glGetAttribLocation": _glGetAttribLocation, "_sinf": _sinf, "_sysconf": _sysconf, "_emscripten_glLineWidth": _emscripten_glLineWidth, "_glGenBuffers": _glGenBuffers, "_glShaderSource": _glShaderSource, "_emscripten_glScissor": _emscripten_glScissor, "_pthread_cleanup_push": _pthread_cleanup_push, "_emscripten_set_element_css_size": _emscripten_set_element_css_size, "_alSourcePlay": _alSourcePlay, "_emscripten_glIsBuffer": _emscripten_glIsBuffer, "_emscripten_glVertexAttrib1f": _emscripten_glVertexAttrib1f, "_glVertexAttribPointer": _glVertexAttribPointer, "_emscripten_glCompressedTexSubImage2D": _emscripten_glCompressedTexSubImage2D, "_emscripten_glGetAttachedShaders": _emscripten_glGetAttachedShaders, "_emscripten_glGenTextures": _emscripten_glGenTextures, "_glBindRenderbuffer": _glBindRenderbuffer, "_alGetSourcei": _alGetSourcei, "_emscripten_glGetTexParameteriv": _emscripten_glGetTexParameteriv, "_glDeleteTextures": _glDeleteTextures, "_emscripten_set_mousedown_callback": _emscripten_set_mousedown_callback, "_emscripten_glClientActiveTexture": _emscripten_glClientActiveTexture, "_emscripten_glCheckFramebufferStatus": _emscripten_glCheckFramebufferStatus, "_ceil": _ceil, "_eglWaitGL": _eglWaitGL, "_emscripten_glUniform3f": _emscripten_glUniform3f, "_emscripten_glUniform3i": _emscripten_glUniform3i, "_emscripten_glDeleteShader": _emscripten_glDeleteShader, "_glEnable": _glEnable, "_alDeleteSources": _alDeleteSources, "_emscripten_glGetUniformLocation": _emscripten_glGetUniformLocation, "_emscripten_glEnableVertexAttribArray": _emscripten_glEnableVertexAttribArray, "_emscripten_get_now": _emscripten_get_now, "__registerRestoreOldStyle": __registerRestoreOldStyle, "emscriptenWebGLGetTexPixelData": emscriptenWebGLGetTexPixelData, "_gettimeofday": _gettimeofday, "_eglWaitNative": _eglWaitNative, "_emscripten_glEnableClientState": _emscripten_glEnableClientState, "_eglChooseConfig": _eglChooseConfig, "___cxa_allocate_exception": ___cxa_allocate_exception, "_emscripten_get_num_gamepads": _emscripten_get_num_gamepads, "_ceilf": _ceilf, "_emscripten_glGetAttribLocation": _emscripten_glGetAttribLocation, "_emscripten_glDisable": _emscripten_glDisable, "___cxa_end_catch": ___cxa_end_catch, "_emscripten_glDeleteRenderbuffers": _emscripten_glDeleteRenderbuffers, "_emscripten_glDrawElementsInstanced": _emscripten_glDrawElementsInstanced, "_emscripten_glVertexAttrib4f": _emscripten_glVertexAttrib4f, "_emscripten_glPixelStorei": _emscripten_glPixelStorei, "_getenv": _getenv, "_log": _log, "_emscripten_set_gamepaddisconnected_callback": _emscripten_set_gamepaddisconnected_callback, "_alcCloseDevice": _alcCloseDevice, "_emscripten_glFramebufferRenderbuffer": _emscripten_glFramebufferRenderbuffer, "_glBufferData": _glBufferData, "_emscripten_glRotatef": _emscripten_glRotatef, "_emscripten_glGetShaderiv": _emscripten_glGetShaderiv, "___cxa_pure_virtual": ___cxa_pure_virtual, "_emscripten_glUniformMatrix4fv": _emscripten_glUniformMatrix4fv, "_emscripten_glGetPointerv": _emscripten_glGetPointerv, "_pthread_cond_wait": _pthread_cond_wait, "_emscripten_set_blur_callback": _emscripten_set_blur_callback, "_cosf": _cosf, "_emscripten_glIsRenderbuffer": _emscripten_glIsRenderbuffer, "_emscripten_glLoadMatrixf": _emscripten_glLoadMatrixf, "_emscripten_set_touchcancel_callback": _emscripten_set_touchcancel_callback, "_glDeleteRenderbuffers": _glDeleteRenderbuffers, "_emscripten_set_focus_callback": _emscripten_set_focus_callback, "_emscripten_glGetVertexAttribfv": _emscripten_glGetVertexAttribfv, "_emscripten_glVertexAttrib3fv": _emscripten_glVertexAttrib3fv, "_glGetUniformLocation": _glGetUniformLocation, "_emscripten_glCompileShader": _emscripten_glCompileShader, "_glClear": _glClear, "__arraySum": __arraySum, "_emscripten_glLinkProgram": _emscripten_glLinkProgram, "_alDeleteBuffers": _alDeleteBuffers, "_emscripten_get_pointerlock_status": _emscripten_get_pointerlock_status, "_emscripten_glDrawRangeElements": _emscripten_glDrawRangeElements, "___unlock": ___unlock, "_emscripten_glDeleteFramebuffers": _emscripten_glDeleteFramebuffers, "_emscripten_glClearColor": _emscripten_glClearColor, "_emscripten_glCreateProgram": _emscripten_glCreateProgram, "_glTexParameteri": _glTexParameteri, "_emscripten_glDetachShader": _emscripten_glDetachShader, "_emscripten_do_request_fullscreen": _emscripten_do_request_fullscreen, "_emscripten_set_mouseleave_callback": _emscripten_set_mouseleave_callback, "_strftime_l": _strftime_l, "_emscripten_set_fullscreenchange_callback": _emscripten_set_fullscreenchange_callback, "_emscripten_glVertexAttribPointer": _emscripten_glVertexAttribPointer, "_alBufferData": _alBufferData, "_emscripten_glDrawArrays": _emscripten_glDrawArrays, "_emscripten_glPolygonOffset": _emscripten_glPolygonOffset, "_emscripten_glBlendColor": _emscripten_glBlendColor, "_glGetShaderInfoLog": _glGetShaderInfoLog, "_signal": _signal, "_emscripten_set_main_loop_timing": _emscripten_set_main_loop_timing, "_sbrk": _sbrk, "___cxa_begin_catch": ___cxa_begin_catch, "_emscripten_glGetProgramiv": _emscripten_glGetProgramiv, "_emscripten_glGetShaderSource": _emscripten_glGetShaderSource, "_cos": _cos, "_emscripten_glTexImage2D": _emscripten_glTexImage2D, "__isLeapYear": __isLeapYear, "_emscripten_glBlendEquationSeparate": _emscripten_glBlendEquationSeparate, "_emscripten_glGetString": _emscripten_glGetString, "_emscripten_glIsFramebuffer": _emscripten_glIsFramebuffer, "_emscripten_glBindProgramARB": _emscripten_glBindProgramARB, "_glutCreateWindow": _glutCreateWindow, "_emscripten_glUniform2i": _emscripten_glUniform2i, "_emscripten_glUniform2f": _emscripten_glUniform2f, "_alSourcefv": _alSourcefv, "_atan2": _atan2, "_glGetProgramInfoLog": _glGetProgramInfoLog, "_emscripten_glTexParameterf": _emscripten_glTexParameterf, "_emscripten_glTexParameteri": _emscripten_glTexParameteri, "_glutInitDisplayMode": _glutInitDisplayMode, "_emscripten_glGenVertexArrays": _emscripten_glGenVertexArrays, "_emscripten_set_visibilitychange_callback": _emscripten_set_visibilitychange_callback, "_eglGetProcAddress": _eglGetProcAddress, "_emscripten_glBindAttribLocation": _emscripten_glBindAttribLocation, "_emscripten_glDrawElements": _emscripten_glDrawElements, "_emscripten_set_canvas_size": _emscripten_set_canvas_size, "_emscripten_glTexSubImage2D": _emscripten_glTexSubImage2D, "_emscripten_glClearDepthf": _emscripten_glClearDepthf, "_emscripten_set_mouseenter_callback": _emscripten_set_mouseenter_callback, "_emscripten_glMatrixMode": _emscripten_glMatrixMode, "_emscripten_glNormalPointer": _emscripten_glNormalPointer, "_emscripten_glHint": _emscripten_glHint, "_emscripten_glEnable": _emscripten_glEnable, "___lock": ___lock, "_emscripten_glBindFramebuffer": _emscripten_glBindFramebuffer, "___syscall6": ___syscall6, "___syscall5": ___syscall5, "_emscripten_glBindRenderbuffer": _emscripten_glBindRenderbuffer, "_time": _time, "_emscripten_glGetFramebufferAttachmentParameteriv": _emscripten_glGetFramebufferAttachmentParameteriv, "_emscripten_set_wheel_callback": _emscripten_set_wheel_callback, "_emscripten_asm_const_4": _emscripten_asm_const_4, "_emscripten_asm_const_3": _emscripten_asm_const_3, "_emscripten_asm_const_2": _emscripten_asm_const_2, "_emscripten_asm_const_1": _emscripten_asm_const_1, "_emscripten_asm_const_0": _emscripten_asm_const_0, "_pthread_cleanup_pop": _pthread_cleanup_pop, "_emscripten_set_keypress_callback": _emscripten_set_keypress_callback, "_emscripten_glShaderBinary": _emscripten_glShaderBinary, "_emscripten_glGetShaderInfoLog": _emscripten_glGetShaderInfoLog, "_emscripten_glGetVertexAttribPointerv": _emscripten_glGetVertexAttribPointerv, "_emscripten_glDeleteVertexArrays": _emscripten_glDeleteVertexArrays, "_emscripten_glGetActiveUniform": _emscripten_glGetActiveUniform, "emscriptenWebGLGetVertexAttrib": emscriptenWebGLGetVertexAttrib, "___syscall195": ___syscall195, "_eglSwapInterval": _eglSwapInterval, "_emscripten_glDeleteProgram": _emscripten_glDeleteProgram, "_glUniform1i": _glUniform1i, "_glutDestroyWindow": _glutDestroyWindow, "_emscripten_glCreateShader": _emscripten_glCreateShader, "_emscripten_glColorPointer": _emscripten_glColorPointer, "_glGetShaderSource": _glGetShaderSource, "_emscripten_glViewport": _emscripten_glViewport, "_pthread_cond_broadcast": _pthread_cond_broadcast, "_emscripten_glDepthMask": _emscripten_glDepthMask, "_emscripten_glDrawBuffers": _emscripten_glDrawBuffers, "_alSourceStop": _alSourceStop, "_glCompileShader": _glCompileShader, "_emscripten_exit_pointerlock": _emscripten_exit_pointerlock, "_emscripten_set_gamepadconnected_callback": _emscripten_set_gamepadconnected_callback, "_abort": _abort, "_emscripten_glGenerateMipmap": _emscripten_glGenerateMipmap, "_glTexImage2D": _glTexImage2D, "_emscripten_glGenFramebuffers": _emscripten_glGenFramebuffers, "_emscripten_glLoadIdentity": _emscripten_glLoadIdentity, "_glDeleteShader": _glDeleteShader, "_glLinkProgram": _glLinkProgram, "_emscripten_glShaderSource": _emscripten_glShaderSource, "___gxx_personality_v0": ___gxx_personality_v0, "_usleep": _usleep, "_emscripten_set_touchend_callback": _emscripten_set_touchend_callback, "_emscripten_glGetRenderbufferParameteriv": _emscripten_glGetRenderbufferParameteriv, "_glGenRenderbuffers": _glGenRenderbuffers, "_eglTerminate": _eglTerminate, "_emscripten_glSampleCoverage": _emscripten_glSampleCoverage, "_emscripten_glFrustum": _emscripten_glFrustum, "_emscripten_glDepthRangef": _emscripten_glDepthRangef, "_glPixelStorei": _glPixelStorei, "_emscripten_glIsTexture": _emscripten_glIsTexture, "_emscripten_glBindVertexArray": _emscripten_glBindVertexArray, "_emscripten_glActiveTexture": _emscripten_glActiveTexture, "_emscripten_set_keyup_callback": _emscripten_set_keyup_callback, "_emscripten_glDeleteBuffers": _emscripten_glDeleteBuffers, "___syscall54": ___syscall54, "_emscripten_glUniform2iv": _emscripten_glUniform2iv, "_emscripten_glCopyTexSubImage2D": _emscripten_glCopyTexSubImage2D, "_sqrt": _sqrt, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8 };
// EMSCRIPTEN_START_ASM
var asm =Module["asm"]// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg, Module.asmLibraryArg, buffer);
var real__main = asm["_main"]; asm["_main"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__main.apply(null, arguments);
};

var real___GLOBAL__sub_I_MainMenuScene_cpp = asm["__GLOBAL__sub_I_MainMenuScene_cpp"]; asm["__GLOBAL__sub_I_MainMenuScene_cpp"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real___GLOBAL__sub_I_MainMenuScene_cpp.apply(null, arguments);
};

var real___GLOBAL__sub_I_Engine_cpp = asm["__GLOBAL__sub_I_Engine_cpp"]; asm["__GLOBAL__sub_I_Engine_cpp"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real___GLOBAL__sub_I_Engine_cpp.apply(null, arguments);
};

var real__bitshift64Lshr = asm["_bitshift64Lshr"]; asm["_bitshift64Lshr"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__bitshift64Lshr.apply(null, arguments);
};

var real__bitshift64Shl = asm["_bitshift64Shl"]; asm["_bitshift64Shl"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__bitshift64Shl.apply(null, arguments);
};

var real___GLOBAL__sub_I_HelpScene_cpp = asm["__GLOBAL__sub_I_HelpScene_cpp"]; asm["__GLOBAL__sub_I_HelpScene_cpp"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real___GLOBAL__sub_I_HelpScene_cpp.apply(null, arguments);
};

var real____cxa_is_pointer_type = asm["___cxa_is_pointer_type"]; asm["___cxa_is_pointer_type"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real____cxa_is_pointer_type.apply(null, arguments);
};

var real__llvm_bswap_i32 = asm["_llvm_bswap_i32"]; asm["_llvm_bswap_i32"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__llvm_bswap_i32.apply(null, arguments);
};

var real__i64Subtract = asm["_i64Subtract"]; asm["_i64Subtract"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__i64Subtract.apply(null, arguments);
};

var real___GLOBAL__sub_I_LoseScene_cpp = asm["__GLOBAL__sub_I_LoseScene_cpp"]; asm["__GLOBAL__sub_I_LoseScene_cpp"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real___GLOBAL__sub_I_LoseScene_cpp.apply(null, arguments);
};

var real__i64Add = asm["_i64Add"]; asm["_i64Add"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__i64Add.apply(null, arguments);
};

var real___GLOBAL__I_000101 = asm["__GLOBAL__I_000101"]; asm["__GLOBAL__I_000101"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real___GLOBAL__I_000101.apply(null, arguments);
};

var real___GLOBAL__sub_I_PauseScene_cpp = asm["__GLOBAL__sub_I_PauseScene_cpp"]; asm["__GLOBAL__sub_I_PauseScene_cpp"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real___GLOBAL__sub_I_PauseScene_cpp.apply(null, arguments);
};

var real___GLOBAL__sub_I_iostream_cpp = asm["__GLOBAL__sub_I_iostream_cpp"]; asm["__GLOBAL__sub_I_iostream_cpp"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real___GLOBAL__sub_I_iostream_cpp.apply(null, arguments);
};

var real___GLOBAL__sub_I_WinScene_cpp = asm["__GLOBAL__sub_I_WinScene_cpp"]; asm["__GLOBAL__sub_I_WinScene_cpp"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real___GLOBAL__sub_I_WinScene_cpp.apply(null, arguments);
};

var real__emscripten_GetProcAddress = asm["_emscripten_GetProcAddress"]; asm["_emscripten_GetProcAddress"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__emscripten_GetProcAddress.apply(null, arguments);
};

var real____errno_location = asm["___errno_location"]; asm["___errno_location"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real____errno_location.apply(null, arguments);
};

var real___GLOBAL__sub_I_GameScene_cpp = asm["__GLOBAL__sub_I_GameScene_cpp"]; asm["__GLOBAL__sub_I_GameScene_cpp"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real___GLOBAL__sub_I_GameScene_cpp.apply(null, arguments);
};

var real____cxa_can_catch = asm["___cxa_can_catch"]; asm["___cxa_can_catch"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real____cxa_can_catch.apply(null, arguments);
};

var real__free = asm["_free"]; asm["_free"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__free.apply(null, arguments);
};

var real__memmove = asm["_memmove"]; asm["_memmove"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__memmove.apply(null, arguments);
};

var real__strstr = asm["_strstr"]; asm["_strstr"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__strstr.apply(null, arguments);
};

var real__malloc = asm["_malloc"]; asm["_malloc"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__malloc.apply(null, arguments);
};
var _main = Module["_main"] = asm["_main"];
var __GLOBAL__sub_I_MainMenuScene_cpp = Module["__GLOBAL__sub_I_MainMenuScene_cpp"] = asm["__GLOBAL__sub_I_MainMenuScene_cpp"];
var __GLOBAL__sub_I_Engine_cpp = Module["__GLOBAL__sub_I_Engine_cpp"] = asm["__GLOBAL__sub_I_Engine_cpp"];
var _bitshift64Lshr = Module["_bitshift64Lshr"] = asm["_bitshift64Lshr"];
var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
var __GLOBAL__sub_I_HelpScene_cpp = Module["__GLOBAL__sub_I_HelpScene_cpp"] = asm["__GLOBAL__sub_I_HelpScene_cpp"];
var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = asm["___cxa_is_pointer_type"];
var _memset = Module["_memset"] = asm["_memset"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _llvm_bswap_i32 = Module["_llvm_bswap_i32"] = asm["_llvm_bswap_i32"];
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var __GLOBAL__sub_I_LoseScene_cpp = Module["__GLOBAL__sub_I_LoseScene_cpp"] = asm["__GLOBAL__sub_I_LoseScene_cpp"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var __GLOBAL__I_000101 = Module["__GLOBAL__I_000101"] = asm["__GLOBAL__I_000101"];
var __GLOBAL__sub_I_PauseScene_cpp = Module["__GLOBAL__sub_I_PauseScene_cpp"] = asm["__GLOBAL__sub_I_PauseScene_cpp"];
var __GLOBAL__sub_I_iostream_cpp = Module["__GLOBAL__sub_I_iostream_cpp"] = asm["__GLOBAL__sub_I_iostream_cpp"];
var __GLOBAL__sub_I_WinScene_cpp = Module["__GLOBAL__sub_I_WinScene_cpp"] = asm["__GLOBAL__sub_I_WinScene_cpp"];
var _emscripten_GetProcAddress = Module["_emscripten_GetProcAddress"] = asm["_emscripten_GetProcAddress"];
var ___errno_location = Module["___errno_location"] = asm["___errno_location"];
var __GLOBAL__sub_I_GameScene_cpp = Module["__GLOBAL__sub_I_GameScene_cpp"] = asm["__GLOBAL__sub_I_GameScene_cpp"];
var ___cxa_can_catch = Module["___cxa_can_catch"] = asm["___cxa_can_catch"];
var _free = Module["_free"] = asm["_free"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _strstr = Module["_strstr"] = asm["_strstr"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = asm["dynCall_iiiiiiii"];
var dynCall_iiiiiid = Module["dynCall_iiiiiid"] = asm["dynCall_iiiiiid"];
var dynCall_vd = Module["dynCall_vd"] = asm["dynCall_vd"];
var dynCall_vid = Module["dynCall_vid"] = asm["dynCall_vid"];
var dynCall_viiddiii = Module["dynCall_viiddiii"] = asm["dynCall_viiddiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_viiidii = Module["dynCall_viiidii"] = asm["dynCall_viiidii"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = asm["dynCall_iiiiiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viidd = Module["dynCall_viidd"] = asm["dynCall_viidd"];
var dynCall_iidd = Module["dynCall_iidd"] = asm["dynCall_iidd"];
var dynCall_viidi = Module["dynCall_viidi"] = asm["dynCall_viidi"];
var dynCall_iidi = Module["dynCall_iidi"] = asm["dynCall_iidi"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_viddd = Module["dynCall_viddd"] = asm["dynCall_viddd"];
var dynCall_iiiiiiiiiiii = Module["dynCall_iiiiiiiiiiii"] = asm["dynCall_iiiiiiiiiiii"];
var dynCall_viiiiiiiiiii = Module["dynCall_viiiiiiiiiii"] = asm["dynCall_viiiiiiiiiii"];
var dynCall_vidd = Module["dynCall_vidd"] = asm["dynCall_vidd"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiii"] = asm["dynCall_viiiiiiiiiiiiiii"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iiid = Module["dynCall_iiid"] = asm["dynCall_iiid"];
var dynCall_ddd = Module["dynCall_ddd"] = asm["dynCall_ddd"];
var dynCall_viid = Module["dynCall_viid"] = asm["dynCall_viid"];
var dynCall_di = Module["dynCall_di"] = asm["dynCall_di"];
var dynCall_dd = Module["dynCall_dd"] = asm["dynCall_dd"];
var dynCall_vidddd = Module["dynCall_vidddd"] = asm["dynCall_vidddd"];
var dynCall_vdi = Module["dynCall_vdi"] = asm["dynCall_vdi"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = asm["dynCall_viiiiiiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_diii = Module["dynCall_diii"] = asm["dynCall_diii"];
var dynCall_dii = Module["dynCall_dii"] = asm["dynCall_dii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_iiiiidii = Module["dynCall_iiiiidii"] = asm["dynCall_iiiiidii"];
var dynCall_iiiiiiiiii = Module["dynCall_iiiiiiiiii"] = asm["dynCall_iiiiiiiiii"];
var dynCall_vdddddd = Module["dynCall_vdddddd"] = asm["dynCall_vdddddd"];
var dynCall_vdddd = Module["dynCall_vdddd"] = asm["dynCall_vdddd"];
var dynCall_vdd = Module["dynCall_vdd"] = asm["dynCall_vdd"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm["dynCall_iiiiiiiii"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_iiiiid = Module["dynCall_iiiiid"] = asm["dynCall_iiiiid"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
;

Runtime.stackAlloc = asm['stackAlloc'];
Runtime.stackSave = asm['stackSave'];
Runtime.stackRestore = asm['stackRestore'];
Runtime.establishStackSpace = asm['establishStackSpace'];

Runtime.setTempRet0 = asm['setTempRet0'];
Runtime.getTempRet0 = asm['getTempRet0'];



// === Auto-generated postamble setup entry stuff ===


function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun']) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString(Module['thisProgram']), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);


  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    exit(ret, /* implicit = */ true);
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    if (ABORT) return; 

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    if (Module['_main'] && shouldRunNow) Module['callMain'](args);

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status, implicit) {
  if (implicit && Module['noExitRuntime']) {
    Module.printErr('exit(' + status + ') implicitly called by end of main(), but noExitRuntime, so not exiting the runtime (you can use emscripten_force_exit, if you want to force a true shutdown)');
    return;
  }

  if (Module['noExitRuntime']) {
    Module.printErr('exit(' + status + ') called, but noExitRuntime, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)');
  } else {

    ABORT = true;
    EXITSTATUS = status;
    STACKTOP = initialStackTop;

    exitRuntime();

    if (Module['onExit']) Module['onExit'](status);
  }

  if (ENVIRONMENT_IS_NODE) {
    // Work around a node.js bug where stdout buffer is not flushed at process exit:
    // Instead of process.exit() directly, wait for stdout flush event.
    // See https://github.com/joyent/node/issues/1669 and https://github.com/kripken/emscripten/issues/2582
    // Workaround is based on https://github.com/RReverser/acorn/commit/50ab143cecc9ed71a2d66f78b4aec3bb2e9844f6
    process['stdout']['once']('drain', function () {
      process['exit'](status);
    });
    console.log(' '); // Make sure to print something to force the drain event to occur, in case the stdout buffer was empty.
    // Work around another node bug where sometimes 'drain' is never fired - make another effort
    // to emit the exit status, after a significant delay (if node hasn't fired drain by then, give up)
    setTimeout(function() {
      process['exit'](status);
    }, 500);
  } else
  if (ENVIRONMENT_IS_SHELL && typeof quit === 'function') {
    quit(status);
  }
  // if we reach here, we must throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

var abortDecorators = [];

function abort(what) {
  if (what !== undefined) {
    Module.print(what);
    Module.printErr(what);
    what = JSON.stringify(what)
  } else {
    what = '';
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '';

  var output = 'abort(' + what + ') at ' + stackTrace() + extra;
  if (abortDecorators) {
    abortDecorators.forEach(function(decorator) {
      output = decorator(output, what);
    });
  }
  throw output;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}

Module["noExitRuntime"] = true;

run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}



