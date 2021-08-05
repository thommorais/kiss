
function _instanceof(left, right) {
  if (
    right != null &&
    typeof Symbol !== "undefined" &&
    right[Symbol.hasInstance]
  ) {
    return !!right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
}


function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === "function" &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? "symbol"
        : typeof obj;
    };
  }
  return _typeof(obj);
}

(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory);
  } else if (
    (typeof exports === "undefined" ? "undefined" : _typeof(exports)) ===
    "object"
  ) {
    module.exports = factory();
  } else {
    root.ScrollHandler = factory();
  }
})(void 0, function() {
  "use strict";

  let ScrollHandler = function ScrollHandler() {
    _util.log(
      2,
      "(COMPATIBILITY NOTICE) -> As of ScrollHandler 2.0.0 you need to use 'new ScrollHandler.Controller()' to create a new controller instance. Use 'new ScrollHandler.Scene()' to instance a scene."
    );
  };

  window.addEventListener("mousewheel", function() {});

  let PIN_SPACER_ATTRIBUTE = "data-scrollHandler-pin-spacer";

  ScrollHandler.Controller = function(options) {
    let NAMESPACE = "ScrollHandler.Controller",
      SCROLL_DIRECTION_FORWARD = "FORWARD",
      SCROLL_DIRECTION_REVERSE = "REVERSE",
      SCROLL_DIRECTION_PAUSED = "PAUSED",
      DEFAULT_OPTIONS = CONTROLLER_OPTIONS.defaults;

    let Controller = this,
      _options = _util.extend({}, DEFAULT_OPTIONS, options),
      _sceneObjects = [],
      _updateScenesOnNextCycle = false,
      _scrollPos = 0,
      _scrollDirection = SCROLL_DIRECTION_PAUSED,
      _isDocument = true,
      _viewPortSize = 0,
      _enabled = true,
      _updateTimeout,
      _refreshTimeout;


    let construct = function construct() {
      for (let key in _options) {
        if (!DEFAULT_OPTIONS.hasOwnProperty(key)) {
          log(2, 'WARNING: Unknown option "' + key + '"');
          delete _options[key];
        }
      }

      _options.container = _util.get.elements(_options.container)[0];

      if (!_options.container) {
        log(
          1,
          "ERROR creating object " +
            NAMESPACE +
            ": No valid scroll container supplied"
        );
        throw NAMESPACE + " init failed.";
      }

      _isDocument =
        _options.container === window ||
        _options.container === document.body ||
        !document.body.contains(_options.container);

      if (_isDocument) {
        _options.container = window;
      }

      _viewPortSize = getViewportSize();

      _options.container.addEventListener("resize", onChange);

      _options.container.addEventListener("scroll", onChange);

      let ri = parseInt(_options.refreshInterval, 10);
      _options.refreshInterval = _util.type.Number(ri)
        ? ri
        : DEFAULT_OPTIONS.refreshInterval;
      scheduleRefresh();
      log(
        3,
        "added new " +
          NAMESPACE +
          " controller (v" +
          ScrollHandler.version +
          ")"
      );
    };

    let scheduleRefresh = function scheduleRefresh() {
      if (_options.refreshInterval > 0) {
        _refreshTimeout = window.setTimeout(refresh, _options.refreshInterval);
      }
    };

    let getScrollPos = function getScrollPos() {
      return _options.vertical
        ? _util.get.scrollTop(_options.container)
        : _util.get.scrollLeft(_options.container);
    };

    let getViewportSize = function getViewportSize() {
      return _options.vertical
        ? _util.get.height(_options.container)
        : _util.get.width(_options.container);
    };

    let setScrollPos = (this._setScrollPos = function(pos) {
      if (_options.vertical) {
        if (_isDocument) {
          window.scrollTo(_util.get.scrollLeft(), pos);
        } else {
          _options.container.scrollTop = pos;
        }
      } else {
        if (_isDocument) {
          window.scrollTo(pos, _util.get.scrollTop());
        } else {
          _options.container.scrollLeft = pos;
        }
      }
    });

    let updateScenes = function updateScenes() {
      if (_enabled && _updateScenesOnNextCycle) {
        let scenesToUpdate = _util.type.Array(_updateScenesOnNextCycle)
          ? _updateScenesOnNextCycle
          : _sceneObjects.slice(0);

        _updateScenesOnNextCycle = false;
        let oldScrollPos = _scrollPos;

        _scrollPos = Controller.scrollPos();

        let deltaScroll = _scrollPos - oldScrollPos;

        if (deltaScroll !== 0) {
          _scrollDirection =
            deltaScroll > 0
              ? SCROLL_DIRECTION_FORWARD
              : SCROLL_DIRECTION_REVERSE;
        }

        if (_scrollDirection === SCROLL_DIRECTION_REVERSE) {
          scenesToUpdate.reverse();
        }

        scenesToUpdate.forEach(function(scene, index) {
          scene.update(true);
        })

        if (scenesToUpdate.length === 0 && _options.loglevel >= 3) {
          log(3, "updating 0 Scenes (nothing added to controller)");
        }
      }
    };

    let debounceUpdate = function debounceUpdate() {
      _updateTimeout = _util.rAF(updateScenes);
    };

    let onChange = function onChange(e) {
      // console.log(e)
      log(3, "event fired causing an update:", e.type);

      if (e.type == "resize") {
        _viewPortSize = getViewportSize();
        _scrollDirection = SCROLL_DIRECTION_PAUSED;
      }

      if (_updateScenesOnNextCycle !== true) {
        _updateScenesOnNextCycle = true;
        debounceUpdate();
      }
    };

    let refresh = function refresh() {
      if (!_isDocument) {
        if (_viewPortSize != getViewportSize()) {
          let resizeEvent;

          try {
            resizeEvent = new Event("resize", {
              bubbles: false,
              cancelable: false
            });
          } catch (e) {
            resizeEvent = document.createEvent("Event");
            resizeEvent.initEvent("resize", false, false);
          }

          _options.container.dispatchEvent(resizeEvent);
        }
      }

      _sceneObjects.forEach(function(scene, index) {
        scene.refresh();
      });

      scheduleRefresh();
    };

    let log = (this._log = function(loglevel, output) {
      if (_options.loglevel >= loglevel) {
        Array.prototype.splice.call(arguments, 1, 0, "(" + NAMESPACE + ") ->");

        _util.log.apply(window, arguments);
      }
    });

    this._options = _options;

    let sortScenes = function sortScenes(ScenesArray) {
      if (ScenesArray.length <= 1) {
        return ScenesArray;
      } else {
        let scenes = ScenesArray.slice(0);
        scenes.sort(function(a, b) {
          return a.scrollOffset() > b.scrollOffset() ? 1 : -1;
        });
        return scenes;
      }
    };


    this.addScene = function(newScene) {
      if (_util.type.Array(newScene)) {
        newScene.forEach(function(scene, index) {
          Controller.addScene(scene);
        });
      } else if (_instanceof(newScene, ScrollHandler.Scene)) {
        if (newScene.controller() !== Controller) {
          newScene.addTo(Controller);
        } else if (_sceneObjects.indexOf(newScene) < 0) {
          _sceneObjects.push(newScene);

          _sceneObjects = sortScenes(_sceneObjects);

          newScene.on("shift.controller_sort", function() {
            _sceneObjects = sortScenes(_sceneObjects);
          });

          for (let key in _options.globalSceneOptions) {
            if (newScene[key]) {
              newScene[key].call(newScene, _options.globalSceneOptions[key]);
            }
          }

          log(3, "adding Scene (now " + _sceneObjects.length + " total)");
        }
      } else {
        log(1, "ERROR: invalid argument supplied for '.addScene()'");
      }

      return Controller;
    };

    this.removeScene = function(Scene) {
      if (_util.type.Array(Scene)) {
        Scene.forEach(function(scene, index) {
          Controller.removeScene(scene);
        });
      } else {
        let index = _sceneObjects.indexOf(Scene);

        if (index > -1) {
          Scene.off("shift.controller_sort");

          _sceneObjects.splice(index, 1);

          log(3, "removing Scene (now " + _sceneObjects.length + " left)");
          Scene.remove();
        }
      }

      return Controller;
    };

    this.updateScene = function(Scene, immediately) {
      if (_util.type.Array(Scene)) {
        Scene.forEach(function(scene, index) {
          Controller.updateScene(scene, immediately);
        });
      } else {
        if (immediately) {
          Scene.update(true);
        } else if (
          _updateScenesOnNextCycle !== true &&
          _instanceof(Scene, ScrollHandler.Scene)
        ) {
          _updateScenesOnNextCycle = _updateScenesOnNextCycle || [];

          if (_updateScenesOnNextCycle.indexOf(Scene) == -1) {
            _updateScenesOnNextCycle.push(Scene);
          }

          _updateScenesOnNextCycle = sortScenes(_updateScenesOnNextCycle);

          debounceUpdate();
        }
      }

      return Controller;
    };

    this.update = function(immediately) {


      onChange({
        type: "resize"
      });

      if (immediately) {
        updateScenes();
      }

      return Controller;
    };

    this.scrollTo = function(scrollTarget, additionalParameter) {
      if (_util.type.Number(scrollTarget)) {
        setScrollPos.call(
          _options.container,
          scrollTarget,
          additionalParameter
        );
      } else if (_instanceof(scrollTarget, ScrollHandler.Scene)) {
        if (scrollTarget.controller() === Controller) {
          Controller.scrollTo(scrollTarget.scrollOffset(), additionalParameter);
        } else {
          log(
            2,
            "scrollTo(): The supplied scene does not belong to this controller. Scroll cancelled.",
            scrollTarget
          );
        }
      } else if (_util.type.Function(scrollTarget)) {
        setScrollPos = scrollTarget;
      } else {
        let elem = _util.get.elements(scrollTarget)[0];

        if (elem) {
          while (elem.parentNode.hasAttribute(PIN_SPACER_ATTRIBUTE)) {
            elem = elem.parentNode;
          }

          let param = _options.vertical ? "top" : "left",
            containerOffset = _util.get.offset(_options.container),
            elementOffset = _util.get.offset(elem);

          if (!_isDocument) {
            containerOffset[param] -= Controller.scrollPos();
          }

          Controller.scrollTo(
            elementOffset[param] - containerOffset[param],
            additionalParameter
          );
        } else {
          log(
            2,
            "scrollTo(): The supplied argument is invalid. Scroll cancelled.",
            scrollTarget
          );
        }
      }

      return Controller;
    };

    this.scrollPos = function(scrollPosMethod) {
      if (!arguments.length) {
        return getScrollPos.call(Controller);
      } else {
        if (_util.type.Function(scrollPosMethod)) {
          getScrollPos = scrollPosMethod;
        } else {
          log(
            2,
            "Provided value for method 'scrollPos' is not a function. To change the current scroll position use 'scrollTo()'."
          );
        }
      }

      return Controller;
    };

    this.info = function(about) {
      let values = {
        size: _viewPortSize,
        vertical: _options.vertical,
        scrollPos: _scrollPos,
        scrollDirection: _scrollDirection,
        container: _options.container,
        isDocument: _isDocument
      };

      if (!arguments.length) {
        return values;
      } else if (values[about] !== undefined) {
        return values[about];
      } else {
        log(1, 'ERROR: option "' + about + '" is not available');
        return;
      }
    };

    this.loglevel = function(newLoglevel) {
      if (!arguments.length) {
        return _options.loglevel;
      } else if (_options.loglevel != newLoglevel) {
        _options.loglevel = newLoglevel;
      }

      return Controller;
    };

    this.enabled = function(newState) {
      if (!arguments.length) {
        return _enabled;
      } else if (_enabled != newState) {
        _enabled = !!newState;
        Controller.updateScene(_sceneObjects, true);
      }

      return Controller;
    };

    this.destroy = function(resetScenes) {
      window.clearTimeout(_refreshTimeout);
      let i = _sceneObjects.length;

      while (i--) {
        _sceneObjects[i].destroy(resetScenes);
      }

      _options.container.removeEventListener("resize", onChange);

      _options.container.removeEventListener("scroll", onChange);

      _util.cAF(_updateTimeout);

      log(
        3,
        "destroyed " +
          NAMESPACE +
          " (reset: " +
          (resetScenes ? "true" : "false") +
          ")"
      );
      return null;
    };

    construct();
    return Controller;
  };

  let CONTROLLER_OPTIONS = {
    defaults: {
      container: window,
      vertical: true,
      globalSceneOptions: {},
      loglevel: 2,
      refreshInterval: 100
    }
  };

  ScrollHandler.Controller.addOption = function(name, defaultValue) {
    CONTROLLER_OPTIONS.defaults[name] = defaultValue;
  };

  ScrollHandler.Controller.extend = function(extension) {
    let oldClass = this;

    ScrollHandler.Controller = function() {
      oldClass.apply(this, arguments);
      this.$super = _util.extend({}, this);

      return extension.apply(this, arguments) || this;
    };

    _util.extend(ScrollHandler.Controller, oldClass);

    ScrollHandler.Controller.prototype = oldClass.prototype;

    ScrollHandler.Controller.prototype.constructor = ScrollHandler.Controller;
  };

  ScrollHandler.Scene = function(options) {
    let NAMESPACE = "ScrollHandler.Scene",
      SCENE_STATE_BEFORE = "BEFORE",
      SCENE_STATE_DURING = "DURING",
      SCENE_STATE_AFTER = "AFTER",
      DEFAULT_OPTIONS = SCENE_OPTIONS.defaults;

    let Scene = this,
      _options = _util.extend({}, DEFAULT_OPTIONS, options),
      _state = SCENE_STATE_BEFORE,
      _progress = 0,
      _scrollOffset = {
        start: 0,
        end: 0
      },
      _triggerPos = 0,
      _enabled = true,
      _durationUpdateMethod,
      _controller;

    let construct = function construct() {
      for (let key in _options) {
        if (!DEFAULT_OPTIONS.hasOwnProperty(key)) {
          log(2, 'WARNING: Unknown option "' + key + '"');
          delete _options[key];
        }
      }

      for (let optionName in DEFAULT_OPTIONS) {
        addSceneOption(optionName);
      }

      validateOption();
    };

    let _listeners = {};












    this.on = function(names, callback) {
      if (_util.type.Function(callback)) {
        names = names.trim().split(" ");
        names.forEach(function(fullname) {
          let nameparts = fullname.split("."),
            eventname = nameparts[0],
            namespace = nameparts[1];

          if (eventname != "*") {
            if (!_listeners[eventname]) {
              _listeners[eventname] = [];
            }

            _listeners[eventname].push({
              namespace: namespace || "",
              callback: callback
            });
          }
        });
      } else {
        log(
          1,
          "ERROR when calling '.on()': Supplied callback for '" +
            names +
            "' is not a valid function!"
        );
      }

      return Scene;
    };

    this.off = function(names, callback) {
      if (!names) {
        log(1, "ERROR: Invalid event name supplied.");
        return Scene;
      }

      names = names.trim().split(" ");
      names.forEach(function(fullname, key) {
        let nameparts = fullname.split("."),
          eventname = nameparts[0],
          namespace = nameparts[1] || "",
          removeList =
            eventname === "*" ? Object.keys(_listeners) : [eventname];
        removeList.forEach(function(remove) {
          let list = _listeners[remove] || [],
            i = list.length;

          while (i--) {
            let listener = list[i];

            if (
              listener &&
              (namespace === listener.namespace || namespace === "*") &&
              (!callback || callback == listener.callback)
            ) {
              list.splice(i, 1);
            }
          }

          if (!list.length) {
            delete _listeners[remove];
          }
        });
      });
      return Scene;
    };

    this.trigger = function(name, vars) {
      if (name) {
        let nameparts = name.trim().split("."),
          eventname = nameparts[0],
          namespace = nameparts[1],
          listeners = _listeners[eventname];
        log(3, "event fired:", eventname, vars ? "->" : "", vars || "");

        if (listeners) {
          listeners.forEach(function(listener, key) {
            if (!namespace || namespace === listener.namespace) {
              listener.callback.call(
                Scene,
                new ScrollHandler.Event(
                  eventname,
                  listener.namespace,
                  Scene,
                  vars
                )
              );
            }
          });
        }
      } else {
        log(1, "ERROR: Invalid event name supplied.");
      }

      return Scene;
    };

    Scene.on("change.internal", function(e) {
      if (e.what !== "loglevel" && e.what !== "tweenChanges") {
        if (e.what === "triggerElement") {
          updateTriggerElementPosition();
        } else if (e.what === "reverse") {
          Scene.update();
        }
      }
    }).on("shift.internal", function(e) {
      updateScrollOffset();
      Scene.update();
    });

    let log = (this._log = function(loglevel, output) {
      if (_options.loglevel >= loglevel) {
        Array.prototype.splice.call(arguments, 1, 0, "(" + NAMESPACE + ") ->");

        _util.log.apply(window, arguments);
      }
    });

    this.addTo = function(controller) {
      if (!_instanceof(controller, ScrollHandler.Controller)) {
        log(
          1,
          "ERROR: supplied argument of 'addTo()' is not a valid ScrollHandler Controller"
        );
      } else if (_controller != controller) {
        if (_controller) {
          _controller.removeScene(Scene);
        }

        _controller = controller;
        validateOption();
        updateDuration(true);
        updateTriggerElementPosition(true);
        updateScrollOffset();

        _controller
          .info("container")
          .addEventListener("resize", onContainerResize);

        controller.addScene(Scene);
        Scene.trigger("add", {
          controller: _controller
        });
        Scene.update();
      }

      return Scene;
    };

    this.enabled = function(newState) {
      if (!arguments.length) {
        return _enabled;
      } else if (_enabled != newState) {
        _enabled = !!newState;
        Scene.update(true);
      }

      return Scene;
    };

    this.remove = function() {
      if (_controller) {
        _controller
          .info("container")
          .removeEventListener("resize", onContainerResize);

        let tmpParent = _controller;
        _controller = undefined;
        tmpParent.removeScene(Scene);
        Scene.trigger("remove");
        log(3, "removed " + NAMESPACE + " from controller");
      }

      return Scene;
    };

    this.destroy = function(reset) {
      Scene.trigger("destroy", {
        reset: reset
      });
      Scene.remove();
      Scene.off("*.*");
      log(
        3,
        "destroyed " +
          NAMESPACE +
          " (reset: " +
          (reset ? "true" : "false") +
          ")"
      );
      return null;
    };

    this.update = function(immediately) {
      if (_controller) {
        if (immediately) {
          if (_controller.enabled() && _enabled) {
            let scrollPos = _controller.info("scrollPos"),
              newProgress;

            if (_options.duration > 0) {
              newProgress =
                (scrollPos - _scrollOffset.start) /
                (_scrollOffset.end - _scrollOffset.start);

            } else {
              newProgress = scrollPos >= _scrollOffset.start ? 1 : 0;
            }

            Scene.trigger("update", {
              startPos: _scrollOffset.start,
              endPos: _scrollOffset.end,
              scrollPos: scrollPos
            })

            Scene.progress(newProgress)

          } else if (_pin && _state === SCENE_STATE_DURING) {
            updatePinState(true); // unpin in position
          }

        } else {
          _controller.updateScene(Scene, false);
        }
      }

      return Scene;
    };

    this.refresh = function() {
      updateDuration();
      updateTriggerElementPosition(); // update trigger element position

      return Scene;
    };


    this.progress = function(progress) {
      if (!arguments.length) {
        // get
        return _progress;
      } else {
        // set
        let doUpdate = false,
          oldState = _state,
          scrollDirection = _controller
            ? _controller.info("scrollDirection")
            : "PAUSED",
          reverseOrForward = _options.reverse || progress >= _progress;

        if (_options.duration === 0) {
          // zero duration scenes
          doUpdate = _progress != progress;
          _progress = progress < 1 && reverseOrForward ? 0 : 1;
          _state = _progress === 0 ? SCENE_STATE_BEFORE : SCENE_STATE_DURING;
        } else {
          // scenes with start and end
          if (
            progress < 0 &&
            _state !== SCENE_STATE_BEFORE &&
            reverseOrForward
          ) {
            // go back to initial state
            _progress = 0;
            _state = SCENE_STATE_BEFORE;
            doUpdate = true;
          } else if (progress >= 0 && progress < 1 && reverseOrForward) {
            _progress = progress;
            _state = SCENE_STATE_DURING;
            doUpdate = true;
          } else if (progress >= 1 && _state !== SCENE_STATE_AFTER) {
            _progress = 1;
            _state = SCENE_STATE_AFTER;
            doUpdate = true;
          } else if (_state === SCENE_STATE_DURING && !reverseOrForward) {
            updatePinState(); // in case we scrolled backwards mid-scene and reverse is disabled => update the pin position, so it doesn't move back as well.
          }
        }

        if (doUpdate) {
          let eventVars = {
              progress: _progress,
              state: _state,
              scrollDirection: scrollDirection
            },
            stateChanged = _state != oldState;

          let trigger = function trigger(eventName) {
            Scene.trigger(eventName, eventVars);
          };

          if (stateChanged) {
            if (oldState !== SCENE_STATE_DURING) {
              trigger("enter");
              trigger(oldState === SCENE_STATE_BEFORE ? "start" : "end");
            }
          }

          trigger("progress");

          if (stateChanged) {
            if (_state !== SCENE_STATE_DURING) {
              trigger(_state === SCENE_STATE_BEFORE ? "start" : "end");
              trigger("leave");
            }
          }
        }

        return Scene;
      }
    };

    let updateScrollOffset = function updateScrollOffset() {
      _scrollOffset = {
        start: _triggerPos + _options.offset
      };

      if (_controller && _options.triggerElement) {
        _scrollOffset.start -= _controller.info("size") * _options.triggerHook;
      }

      _scrollOffset.end = _scrollOffset.start + _options.duration;
    };

    let updateDuration = function updateDuration(suppressEvents) {
      if (_durationUpdateMethod) {
        let varname = "duration";

        if (
          changeOption(varname, _durationUpdateMethod.call(Scene)) &&
          !suppressEvents
        ) {
          Scene.trigger("change", {
            what: varname,
            newval: _options[varname]
          });
          Scene.trigger("shift", {
            reason: varname
          });
        }
      }
    };

    let updateTriggerElementPosition = function updateTriggerElementPosition(
      suppressEvents
    ) {
      let elementPos = 0,
        telem = _options.triggerElement;

      if (_controller && (telem || _triggerPos > 0)) {
        if (telem) {
          if (telem.parentNode) {
            let controllerInfo = _controller.info(),
              containerOffset = _util.get.offset(controllerInfo.container),
              param = controllerInfo.vertical ? "top" : "left";

            while (telem.parentNode.hasAttribute(PIN_SPACER_ATTRIBUTE)) {
              telem = telem.parentNode;
            }

            let elementOffset = _util.get.offset(telem);

            if (!controllerInfo.isDocument) {
              containerOffset[param] -= _controller.scrollPos();
            }

            elementPos = elementOffset[param] - containerOffset[param];
          } else {
            log(
              2,
              "WARNING: triggerElement was removed from DOM and will be reset to",
              undefined
            );
            Scene.triggerElement(undefined);
          }
        }

        let changed = elementPos != _triggerPos;
        _triggerPos = elementPos;

        if (changed && !suppressEvents) {
          Scene.trigger("shift", {
            reason: "triggerElementPosition"
          });
        }
      }
    };

    let onContainerResize = function onContainerResize(e) {
      if (_options.triggerHook > 0) {
        Scene.trigger("shift", {
          reason: "containerResize"
        });
      }
    };

    let _validate = _util.extend(SCENE_OPTIONS.validate, {
      duration: function duration(val) {
        if (_util.type.String(val) && val.match(/^(\.|\d)*\d+%$/)) {
          let perc = parseFloat(val) / 100;

          val = function val() {
            return _controller ? _controller.info("size") * perc : 0;
          };
        }

        if (_util.type.Function(val)) {
          // function
          _durationUpdateMethod = val;

          try {
            val = parseFloat(_durationUpdateMethod.call(Scene));
          } catch (e) {
            val = -1; // will cause error below
          }
        } // val has to be float

        val = parseFloat(val);

        if (!_util.type.Number(val) || val < 0) {
          if (_durationUpdateMethod) {
            _durationUpdateMethod = undefined;
            throw [
              'Invalid return value of supplied function for option "duration":',
              val
            ];
          } else {
            throw ['Invalid value for option "duration":', val];
          }
        }

        return val;
      }
    });
    /**
     * Checks the validity of a specific or all options and reset to default if neccessary.
     * @private
     */

    let validateOption = function validateOption(check) {
      check = arguments.length ? [check] : Object.keys(_validate);
      check.forEach(function(optionName, key) {
        let value;

        if (_validate[optionName]) {
          // there is a validation method for this option
          try {
            // validate value
            value = _validate[optionName](_options[optionName]);
          } catch (e) {
            // validation failed -> reset to default
            value = DEFAULT_OPTIONS[optionName];
            let logMSG = _util.type.String(e) ? [e] : e;

            if (_util.type.Array(logMSG)) {
              logMSG[0] = "ERROR: " + logMSG[0];
              logMSG.unshift(1); // loglevel 1 for error msg

              log.apply(this, logMSG);
            } else {
              log(
                1,
                "ERROR: Problem executing validation callback for option '" +
                  optionName +
                  "':",
                e.message
              );
            }
          } finally {
            _options[optionName] = value;
          }
        }
      });
    };
    /**
     * Helper used by the setter/getters for scene options
     * @private
     */

    let changeOption = function changeOption(varname, newval) {
      let changed = false,
        oldval = _options[varname];

      if (_options[varname] != newval) {
        _options[varname] = newval;
        validateOption(varname);

        changed = oldval != _options[varname];
      }

      return changed;
    };

    let addSceneOption = function addSceneOption(optionName) {
      if (!Scene[optionName]) {
        Scene[optionName] = function(newVal) {
          if (!arguments.length) {
            return _options[optionName];
          } else {
            if (optionName === "duration") {
              _durationUpdateMethod = undefined;
            }

            if (changeOption(optionName, newVal)) {
              Scene.trigger("change", {
                what: optionName,
                newval: _options[optionName]
              });

              if (SCENE_OPTIONS.shifts.indexOf(optionName) > -1) {
                Scene.trigger("shift", {
                  reason: optionName
                });
              }
            }
          }

          return Scene;
        };
      }
    };







    this.controller = function() {
      return _controller;
    };

    this.state = function() {
      return _state;
    };

    this.scrollOffset = function() {
      return _scrollOffset.start;
    };

    this.triggerPosition = function() {
      let pos = _options.offset;

      if (_controller) {
        if (_options.triggerElement) {
          pos += _triggerPos;
        } else {
          pos += _controller.info("size") * Scene.triggerHook();
        }
      }

      return pos;
    };

    let _pin, _pinOptions;

    Scene.on("shift.internal", function(e) {
      let durationChanged = e.reason === "duration";

      if (
        (_state === SCENE_STATE_AFTER && durationChanged) ||
        (_state === SCENE_STATE_DURING && _options.duration === 0)
      ) {
        updatePinState();
      }

      if (durationChanged) {
        updatePinDimensions();
      }
    })
      .on("progress.internal", function(e) {
        updatePinState();
      })
      .on("add.internal", function(e) {
        updatePinDimensions();
      })
      .on("destroy.internal", function(e) {
        Scene.removePin(e.reset);
      });

    let updatePinState = function updatePinState(forceUnpin) {
      if (_pin && _controller) {
        let containerInfo = _controller.info(),
          pinTarget = _pinOptions.spacer.firstChild;

        if (!forceUnpin && _state === SCENE_STATE_DURING) {
          if (_util.css(pinTarget, "position") != "fixed") {
            _util.css(pinTarget, {
              position: "fixed"
            });

            updatePinDimensions();
          }

          let fixedPos = _util.get.offset(_pinOptions.spacer, true),
            scrollDistance =
              _options.reverse || _options.duration === 0
                ? containerInfo.scrollPos - _scrollOffset.start
                : Math.round(_progress * _options.duration * 10) / 10; // if no reverse and during pin the position needs to be recalculated using the progress
          // add scrollDistance

          fixedPos[containerInfo.vertical ? "top" : "left"] += scrollDistance; // set new values

          _util.css(_pinOptions.spacer.firstChild, {
            top: fixedPos.top,
            left: fixedPos.left
          });
        } else {
          // unpinned state
          let newCSS = {
              position: _pinOptions.inFlow ? "relative" : "absolute",
              top: 0,
              left: 0
            },
            change = _util.css(pinTarget, "position") != newCSS.position;

          if (!_pinOptions.pushFollowers) {
            newCSS[containerInfo.vertical ? "top" : "left"] =
              _options.duration * _progress;
          } else if (_options.duration > 0) {
            // only concerns scenes with duration
            if (
              _state === SCENE_STATE_AFTER &&
              parseFloat(_util.css(_pinOptions.spacer, "padding-top")) === 0
            ) {
              change = true; // if in after state but havent updated spacer yet (jumped past pin)
            } else if (
              _state === SCENE_STATE_BEFORE &&
              parseFloat(_util.css(_pinOptions.spacer, "padding-bottom")) === 0
            ) {
              // before
              change = true; // jumped past fixed state upward direction
            }
          } // set new values

          _util.css(pinTarget, newCSS);

          if (change) {
            // update pin spacer if state changed
            updatePinDimensions();
          }
        }
      }
    };
    /**
     * Update the pin spacer and/or element size.
     * The size of the spacer needs to be updated whenever the duration of the scene changes, if it is to push down following elements.
     * @private
     */

    let updatePinDimensions = function updatePinDimensions() {
      if (_pin && _controller && _pinOptions.inFlow) {
        let after = _state === SCENE_STATE_AFTER,
          before = _state === SCENE_STATE_BEFORE,
          during = _state === SCENE_STATE_DURING,
          vertical = _controller.info("vertical"),
          pinTarget = _pinOptions.spacer.firstChild,
          marginCollapse = _util.isMarginCollapseType(
            _util.css(_pinOptions.spacer, "display")
          ),
          css = {};

        if (_pinOptions.relSize.width || _pinOptions.relSize.autoFullWidth) {
          if (during) {
            _util.css(_pin, {
              width: _util.get.width(_pinOptions.spacer)
            });
          } else {
            _util.css(_pin, {
              width: "100%"
            });
          }
        } else {
          css["min-width"] = _util.get.width(
            vertical ? _pin : pinTarget,
            true,
            true
          );
          css.width = during ? css["min-width"] : "auto";
        }

        if (_pinOptions.relSize.height) {
          if (during) {
            _util.css(_pin, {
              height:
                _util.get.height(_pinOptions.spacer) -
                (_pinOptions.pushFollowers ? _options.duration : 0)
            });
          } else {
            _util.css(_pin, {
              height: "100%"
            });
          }
        } else {
          css["min-height"] = _util.get.height(
            vertical ? pinTarget : _pin,
            true,
            !marginCollapse
          );

          css.height = during ? css["min-height"] : "auto";
        }

        if (_pinOptions.pushFollowers) {
          css["padding" + (vertical ? "Top" : "Left")] =
            _options.duration * _progress;
          css["padding" + (vertical ? "Bottom" : "Right")] =
            _options.duration * (1 - _progress);
        }

        _util.css(_pinOptions.spacer, css);
      }
    };

    let updatePinInContainer = function updatePinInContainer() {
      if (
        _controller &&
        _pin &&
        _state === SCENE_STATE_DURING &&
        !_controller.info("isDocument")
      ) {
        updatePinState();
      }
    };

    let updateRelativePinSpacer = function updateRelativePinSpacer() {
      if (
        _controller &&
        _pin &&
        _state === SCENE_STATE_DURING &&
        (((_pinOptions.relSize.width || _pinOptions.relSize.autoFullWidth) &&
          _util.get.width(window) !=
            _util.get.width(_pinOptions.spacer.parentNode)) ||
          (_pinOptions.relSize.height &&
            _util.get.height(window) !=
              _util.get.height(_pinOptions.spacer.parentNode)))
      ) {
        updatePinDimensions();
      }
    };

    let onMousewheelOverPin = function onMousewheelOverPin(e) {
      const event = e
      if (
        _controller &&
        _pin &&
        _state === SCENE_STATE_DURING &&
        !_controller.info("isDocument")
      ) {

        e.preventDefault();

          const arg = e[_controller.info("vertical") ? "wheelDeltaY" : "wheelDeltaX"] / 3
          log(e.wheelDelta, arg , -event.pixelY * 30)

        _controller._setScrollPos(
          _controller.info("scrollPos") -
            ((e.wheelDelta ||
              e[_controller.info("vertical") ? "wheelDeltaY" : "wheelDeltaX"]) /
              3 || -event.pixelY * 30)
        );
      }
    };
    /**
     * Pin an element for the duration of the scene.
     * If the scene duration is 0 the element will only be unpinned, if the user scrolls back past the start position.
     * Make sure only one pin is applied to an element at the same time.
     * An element can be pinned multiple times, but only successively.
     * _**NOTE:** The option `pushFollowers` has no effect, when the scene duration is 0._
     * @method ScrollHandler.Scene#setPin
     * @example
     *
     * scene.setPin("#pin");
     *
     *
     * scene.setPin("#pin", {pushFollowers: false});
     *
     * @param {(string|object)} element - A Selector targeting an element or a DOM object that is supposed to be pinned.
     * @param {object} [settings] - settings for the pin
     * @param {boolean} [settings.pushFollowers=true] - If `true` following elements will be "pushed" down for the duration of the pin, if `false` the pinned element will just scroll past them.
     												   Ignored, when duration is `0`.
     * @param {string} [settings.spacerClass="scrollHandler-pin-spacer"] - Classname of the pin spacer element, which is used to replace the element.
     *
     * @returns {Scene} Parent object for chaining.
     */

    this.setPin = function(element, settings) {
      let defaultSettings = {
        pushFollowers: true,
        spacerClass: "scrollHandler-pin-spacer"
      };
      let pushFollowersActivelySet =
        settings && settings.hasOwnProperty("pushFollowers");
      settings = _util.extend({}, defaultSettings, settings); // validate Element

      element = _util.get.elements(element)[0];

      if (!element) {
        log(
          1,
          "ERROR calling method 'setPin()': Invalid pin element supplied."
        );
        return Scene; // cancel
      } else if (_util.css(element, "position") === "fixed") {
        log(
          1,
          "ERROR calling method 'setPin()': Pin does not work with elements that are positioned 'fixed'."
        );
        return Scene; // cancel
      }

      if (_pin) {
        // preexisting pin?
        if (_pin === element) {
          // same pin we already have -> do nothing
          return Scene; // cancel
        } else {
          // kill old pin
          Scene.removePin();
        }
      }

      _pin = element;
      let parentDisplay = _pin.parentNode.style.display,
        boundsParams = [
          "top",
          "left",
          "bottom",
          "right",
          "margin",
          "marginLeft",
          "marginRight",
          "marginTop",
          "marginBottom"
        ];
      _pin.parentNode.style.display = "none"; // hack start to force css to return stylesheet values instead of calculated px values.

      let inFlow = _util.css(_pin, "position") != "absolute",
        pinCSS = _util.css(_pin, boundsParams.concat(["display"])),
        sizeCSS = _util.css(_pin, ["width", "height"]);

      _pin.parentNode.style.display = parentDisplay; // hack end.

      if (!inFlow && settings.pushFollowers) {
        log(
          2,
          "WARNING: If the pinned element is positioned absolutely pushFollowers will be disabled."
        );
        settings.pushFollowers = false;
      }

      window.setTimeout(function() {
        // wait until all finished, because with responsive duration it will only be set after scene is added to controller
        if (
          _pin &&
          _options.duration === 0 &&
          pushFollowersActivelySet &&
          settings.pushFollowers
        ) {
          log(
            2,
            "WARNING: pushFollowers =",
            true,
            "has no effect, when scene duration is 0."
          );
        }
      }, 0); // create spacer and insert

      let spacer = _pin.parentNode.insertBefore(
          document.createElement("div"),
          _pin
        ),
        spacerCSS = _util.extend(pinCSS, {
          position: inFlow ? "relative" : "absolute",
          boxSizing: "content-box",
          mozBoxSizing: "content-box",
          webkitBoxSizing: "content-box"
        });

      if (!inFlow) {
        // copy size if positioned absolutely, to work for bottom/right positioned elements.
        _util.extend(spacerCSS, _util.css(_pin, ["width", "height"]));
      }

      _util.css(spacer, spacerCSS);

      spacer.setAttribute(PIN_SPACER_ATTRIBUTE, "");

      _util.addClass(spacer, settings.spacerClass);

      _pinOptions = {
        spacer: spacer,
        relSize: {
          width: sizeCSS.width.slice(-1) === "%",
          height: sizeCSS.height.slice(-1) === "%",
          autoFullWidth:
            sizeCSS.width === "auto" &&
            inFlow &&
            _util.isMarginCollapseType(pinCSS.display)
        },
        pushFollowers: settings.pushFollowers,
        inFlow: inFlow
      };

      if (!_pin.___origStyle) {
        _pin.___origStyle = {};
        let pinInlineCSS = _pin.style,
          copyStyles = boundsParams.concat([
            "width",
            "height",
            "position",
            "boxSizing",
            "mozBoxSizing",
            "webkitBoxSizing"
          ]);
        copyStyles.forEach(function(val) {
          _pin.___origStyle[val] = pinInlineCSS[val] || "";
        });
      }

      if (_pinOptions.relSize.width) {
        _util.css(spacer, {
          width: sizeCSS.width
        });
      }

      if (_pinOptions.relSize.height) {
        _util.css(spacer, {
          height: sizeCSS.height
        });
      }

      spacer.appendChild(_pin);

      _util.css(_pin, {
        position: inFlow ? "relative" : "absolute",
        margin: "auto",
        top: "auto",
        left: "auto",
        bottom: "auto",
        right: "auto"
      });

      if (_pinOptions.relSize.width || _pinOptions.relSize.autoFullWidth) {
        _util.css(_pin, {
          boxSizing: "border-box",
          mozBoxSizing: "border-box",
          webkitBoxSizing: "border-box"
        });
      }

      window.addEventListener("scroll", updatePinInContainer);
      window.addEventListener("resize", updatePinInContainer);
      window.addEventListener("resize", updateRelativePinSpacer);

      _pin.addEventListener("mousewheel", onMousewheelOverPin);

      _pin.addEventListener("DOMMouseScroll", onMousewheelOverPin);

      log(3, "added pin");

      updatePinState();
      return Scene;
    };

    this.removePin = function(reset) {
      if (_pin) {
        if (_state === SCENE_STATE_DURING) {
          updatePinState(true);
        }

        if (reset || !_controller) {
          let pinTarget = _pinOptions.spacer.firstChild;

          if (pinTarget.hasAttribute(PIN_SPACER_ATTRIBUTE)) {
            let style = _pinOptions.spacer.style,
              values = [
                "margin",
                "marginLeft",
                "marginRight",
                "marginTop",
                "marginBottom"
              ],
              margins = {};
            values.forEach(function(val) {
              margins[val] = style[val] || "";
            });

            _util.css(pinTarget, margins);
          }

          _pinOptions.spacer.parentNode.insertBefore(
            pinTarget,
            _pinOptions.spacer
          );

          _pinOptions.spacer.parentNode.removeChild(_pinOptions.spacer);

          if (!_pin.parentNode.hasAttribute(PIN_SPACER_ATTRIBUTE)) {
            _util.css(_pin, _pin.___origStyle);

            delete _pin.___origStyle;
          }
        }

        window.removeEventListener("scroll", updatePinInContainer);
        window.removeEventListener("resize", updatePinInContainer);
        window.removeEventListener("resize", updateRelativePinSpacer);

        _pin.removeEventListener("mousewheel", onMousewheelOverPin);

        _pin.removeEventListener("DOMMouseScroll", onMousewheelOverPin);

        _pin = undefined;
        log(3, "removed pin (reset: " + (reset ? "true" : "false") + ")");
      }

      return Scene;
    };

    let _cssClasses,
      _cssClassElems = [];

    Scene.on("destroy.internal", function(e) {
      Scene.removeClassToggle(e.reset);
    });

    this.setClassToggle = function(element, classes) {
      let elems = _util.get.elements(element);

      if (elems.length === 0 || !_util.type.String(classes)) {
        log(
          1,
          "ERROR calling method 'setClassToggle()': Invalid " +
            (elems.length === 0 ? "element" : "classes") +
            " supplied."
        );
        return Scene;
      }

      if (_cssClassElems.length > 0) {
        Scene.removeClassToggle();
      }

      _cssClasses = classes;
      _cssClassElems = elems;
      Scene.on("enter.internal_class leave.internal_class", function(e) {
        let toggle = e.type === "enter" ? _util.addClass : _util.removeClass;

        _cssClassElems.forEach(function(elem, key) {
          toggle(elem, _cssClasses);
        });
      });
      return Scene;
    };

    this.removeClassToggle = function(reset) {
      if (reset) {
        _cssClassElems.forEach(function(elem, key) {
          _util.removeClass(elem, _cssClasses);
        });
      }

      Scene.off("start.internal_class end.internal_class");
      _cssClasses = undefined;
      _cssClassElems = [];
      return Scene;
    };

    construct();
    return Scene;
  };

  let SCENE_OPTIONS = {
    defaults: {
      duration: 0,
      offset: 0,
      triggerElement: undefined,
      triggerHook: 0.5,
      reverse: true,
      loglevel: 2
    },
    validate: {
      offset: function offset(val) {
        val = parseFloat(val);

        if (!_util.type.Number(val)) {
          throw ['Invalid value for option "offset":', val];
        }

        return val;
      },
      triggerElement: function triggerElement(val) {
        val = val || undefined;

        if (val) {
          let elem = _util.get.elements(val)[0];

          if (elem && elem.parentNode) {
            val = elem;
          } else {
            throw [
              'Element defined in option "triggerElement" was not found:',
              val
            ];
          }
        }

        return val;
      },
      triggerHook: function triggerHook(val) {
        let translate = {
          onCenter: 0.5,
          onEnter: 1,
          onLeave: 0
        };

        if (_util.type.Number(val)) {
          val = Math.max(0, Math.min(parseFloat(val), 1));
        } else if (val in translate) {
          val = translate[val];
        } else {
          throw ['Invalid value for option "triggerHook": ', val];
        }

        return val;
      },
      reverse: function reverse(val) {
        return !!val;
      },
      loglevel: function loglevel(val) {
        val = parseInt(val);

        if (!_util.type.Number(val) || val < 0 || val > 3) {
          throw ['Invalid value for option "loglevel":', val];
        }

        return val;
      }
    },
    shifts: ["duration", "offset", "triggerHook"]
  };

  ScrollHandler.Scene.addOption = function(
    name,
    defaultValue,
    validationCallback,
    shifts
  ) {
    if (!(name in SCENE_OPTIONS.defaults)) {
      SCENE_OPTIONS.defaults[name] = defaultValue;
      SCENE_OPTIONS.validate[name] = validationCallback;

      if (shifts) {
        SCENE_OPTIONS.shifts.push(name);
      }
    } else {
      ScrollHandler._util.log(
        1,
        "[static] ScrollHandler.Scene -> Cannot add Scene option '" +
          name +
          "', because it already exists."
      );
    }
  };

  ScrollHandler.Scene.extend = function(extension) {
    let oldClass = this;

    ScrollHandler.Scene = function() {
      oldClass.apply(this, arguments);
      this.$super = _util.extend({}, this);

      return extension.apply(this, arguments) || this;
    };

    _util.extend(ScrollHandler.Scene, oldClass);

    ScrollHandler.Scene.prototype = oldClass.prototype;

    ScrollHandler.Scene.prototype.constructor = ScrollHandler.Scene;
  };

  ScrollHandler.Event = function(type, namespace, target, vars) {
    vars = vars || {};

    for (let key in vars) {
      this[key] = vars[key];
    }

    this.type = type;
    this.target = this.currentTarget = target;
    this.namespace = namespace || "";
    this.timeStamp = this.timestamp = Date.now();
    return this;
  };

  let _util = (ScrollHandler._util = (function(window) {
    let U = {},
      i;

    let floatval = function floatval(number) {
      return parseFloat(number) || 0;
    };

    let _getComputedStyle = function _getComputedStyle(elem) {
      return elem.currentStyle
        ? elem.currentStyle
        : window.getComputedStyle(elem);
    };

    let _dimension = function _dimension(which, elem, outer, includeMargin) {
      elem = elem === document ? window : elem;

      if (elem === window) {
        includeMargin = false;
      } else if (!_type.DomElement(elem)) {
        return 0;
      }

      which = which.charAt(0).toUpperCase() + which.substr(1).toLowerCase();
      let dimension =
        (outer
          ? elem["offset" + which] || elem["outer" + which]
          : elem["client" + which] || elem["inner" + which]) || 0;

      if (outer && includeMargin) {
        let style = _getComputedStyle(elem);

        dimension +=
          which === "Height"
            ? floatval(style.marginTop) + floatval(style.marginBottom)
            : floatval(style.marginLeft) + floatval(style.marginRight);
      }

      return dimension;
    };

    let _camelCase = function _camelCase(str) {
      return str
        .replace(/^[^a-z]+([a-z])/g, "$1")
        .replace(/-([a-z])/g, function(g) {
          return g[1].toUpperCase();
        });
    };

    U.extend = function(obj) {
      obj = obj || {};

      for (i = 1; i < arguments.length; i++) {
        if (!arguments[i]) {
          continue;
        }

        for (let key in arguments[i]) {
          if (arguments[i].hasOwnProperty(key)) {
            obj[key] = arguments[i][key];
          }
        }
      }

      return obj;
    };

    U.isMarginCollapseType = function(str) {
      return (
        ["block", "flex", "list-item", "table", "-webkit-box"].indexOf(str) > -1
      );
    };

    let lastTime = 0,
      vendors = ["ms", "moz", "webkit", "o"];
    let _requestAnimationFrame = window.requestAnimationFrame;
    let _cancelAnimationFrame = window.cancelAnimationFrame;

    for (i = 0; !_requestAnimationFrame && i < vendors.length; ++i) {
      _requestAnimationFrame = window[vendors[i] + "RequestAnimationFrame"];
      _cancelAnimationFrame =
        window[vendors[i] + "CancelAnimationFrame"] ||
        window[vendors[i] + "CancelRequestAnimationFrame"];
    }

    if (!_requestAnimationFrame) {
      _requestAnimationFrame = function _requestAnimationFrame(callback) {
        let currTime = new Date().getTime(),
          timeToCall = Math.max(0, 16 - (currTime - lastTime)),
          id = window.setTimeout(function() {
            callback(currTime + timeToCall);
          }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }

    if (!_cancelAnimationFrame) {
      _cancelAnimationFrame = function _cancelAnimationFrame(id) {
        window.clearTimeout(id);
      };
    }

    U.rAF = _requestAnimationFrame.bind(window);
    U.cAF = _cancelAnimationFrame.bind(window);
    let loglevels = ["error", "warn", "log"],
      console = window.console || {};

    console.log = console.log || function() {};

    for (i = 0; i < loglevels.length; i++) {
      let method = loglevels[i];

      if (!console[method]) {
        console[method] = console.log;
      }
    }

    U.log = function(loglevel) {
      if (loglevel > loglevels.length || loglevel <= 0)
        loglevel = loglevels.length;
      let now = new Date(),
        time =
          ("0" + now.getHours()).slice(-2) +
          ":" +
          ("0" + now.getMinutes()).slice(-2) +
          ":" +
          ("0" + now.getSeconds()).slice(-2) +
          ":" +
          ("00" + now.getMilliseconds()).slice(-3),
        method = loglevels[loglevel - 1],
        args = Array.prototype.splice.call(arguments, 1),
        func = Function.prototype.bind.call(console[method], console);
      args.unshift(time);
      func.apply(console, args);
    };

    let _type = (U.type = function(v) {
      return Object.prototype.toString
        .call(v)
        .replace(/^\[object (.+)\]$/, "$1")
        .toLowerCase();
    });

    _type.String = function(v) {
      return _type(v) === "string";
    };

    _type.Function = function(v) {
      return _type(v) === "function";
    };

    _type.Array = function(v) {
      return Array.isArray(v);
    };

    _type.Number = function(v) {
      return !_type.Array(v) && v - parseFloat(v) + 1 >= 0;
    };

    _type.DomElement = function(o) {
      return (typeof HTMLElement === "undefined"
        ? "undefined"
        : _typeof(HTMLElement)) === "object" ||
        typeof HTMLElement === "function"
        ? _instanceof(o, HTMLElement) || _instanceof(o, SVGElement)
        : o &&
            _typeof(o) === "object" &&
            o !== null &&
            o.nodeType === 1 &&
            typeof o.nodeName === "string";
    };

    let _get = (U.get = {});

    _get.elements = function(selector) {
      let arr = [];

      if (_type.String(selector)) {
        try {
          selector = document.querySelectorAll(selector);
        } catch (e) {
          return arr;
        }
      }

      if (
        _type(selector) === "nodelist" ||
        _type.Array(selector) ||
        _instanceof(selector, NodeList)
      ) {
        for (let i = 0, ref = (arr.length = selector.length); i < ref; i++) {
          let elem = selector[i];
          arr[i] = _type.DomElement(elem) ? elem : _get.elements(elem);
        }
      } else if (
        _type.DomElement(selector) ||
        selector === document ||
        selector === window
      ) {
        arr = [selector];
      }

      return arr;
    };

    _get.scrollTop = function(elem) {
      return elem && typeof elem.scrollTop === "number"
        ? elem.scrollTop
        : window.pageYOffset || 0;
    };

    _get.scrollLeft = function(elem) {
      return elem && typeof elem.scrollLeft === "number"
        ? elem.scrollLeft
        : window.pageXOffset || 0;
    };

    _get.width = function(elem, outer, includeMargin) {
      return _dimension("width", elem, outer, includeMargin);
    };

    _get.height = function(elem, outer, includeMargin) {
      return _dimension("height", elem, outer, includeMargin);
    };

    _get.offset = function(elem, relativeToViewport) {
      let offset = {
        top: 0,
        left: 0
      };

      if (elem && elem.getBoundingClientRect) {
        let rect = elem.getBoundingClientRect();
        offset.top = rect.top;
        offset.left = rect.left;

        if (!relativeToViewport) {
          offset.top += _get.scrollTop();
          offset.left += _get.scrollLeft();
        }
      }

      return offset;
    };

    U.addClass = function(elem, classname) {
      if (classname) {
        if (elem.classList) elem.classList.add(classname);
        else elem.className += " " + classname;
      }
    };

    U.removeClass = function(elem, classname) {
      if (classname) {
        if (elem.classList) elem.classList.remove(classname);
        else
          elem.className = elem.className.replace(
            new RegExp(
              "(^|\\b)" + classname.split(" ").join("|") + "(\\b|$)",
              "gi"
            ),
            " "
          );
      }
    };

    U.css = function(elem, options) {
      if (_type.String(options)) {
        return _getComputedStyle(elem)[_camelCase(options)];
      } else if (_type.Array(options)) {
        let obj = {},
          style = _getComputedStyle(elem);

        options.forEach(function(option, key) {
          obj[option] = style[_camelCase(option)];
        });
        return obj;
      } else {
        for (let option in options) {
          let val = options[option];

          if (val == parseFloat(val)) {
            val += "px";
          }

          elem.style[_camelCase(option)] = val;
        }
      }
    };

    return U;
  })(window || {}));

  ScrollHandler.Scene.prototype.addIndicators = function() {
    ScrollHandler._util.log(
      1,
      "(ScrollHandler.Scene) -> ERROR calling addIndicators() due to missing Plugin 'debug.addIndicators'. Please make sure to include plugins/debug.addIndicators.js"
    );

    return this;
  };

  ScrollHandler.Scene.prototype.removeIndicators = function() {
    ScrollHandler._util.log(
      1,
      "(ScrollHandler.Scene) -> ERROR calling removeIndicators() due to missing Plugin 'debug.addIndicators'. Please make sure to include plugins/debug.addIndicators.js"
    );

    return this;
  };

  ScrollHandler.Scene.prototype.setTween = function() {
    ScrollHandler._util.log(
      1,
      "(ScrollHandler.Scene) -> ERROR calling setTween() due to missing Plugin 'animation.gsap'. Please make sure to include plugins/animation.gsap.js"
    );

    return this;
  };

  ScrollHandler.Scene.prototype.removeTween = function() {
    ScrollHandler._util.log(
      1,
      "(ScrollHandler.Scene) -> ERROR calling removeTween() due to missing Plugin 'animation.gsap'. Please make sure to include plugins/animation.gsap.js"
    );

    return this;
  };

  ScrollHandler.Scene.prototype.setVelocity = function() {
    ScrollHandler._util.log(
      1,
      "(ScrollHandler.Scene) -> ERROR calling setVelocity() due to missing Plugin 'animation.velocity'. Please make sure to include plugins/animation.velocity.js"
    );

    return this;
  };

  ScrollHandler.Scene.prototype.removeVelocity = function() {
    ScrollHandler._util.log(
      1,
      "(ScrollHandler.Scene) -> ERROR calling removeVelocity() due to missing Plugin 'animation.velocity'. Please make sure to include plugins/animation.velocity.js"
    );

    return this;
  };

  window.ScrollHandler = ScrollHandler

  return ScrollHandler;
});
