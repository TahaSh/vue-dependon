;(function () {

    var vueDependOn = {};

    var helpers = {
        capitalize: function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    };

    function loadOptions(vm, data, parent, child) {
        // First, let's find the index of the selected parent in the data list.
        var index = 0;
        for (var i = 0; i < vm[data].length; i++) {
            if (vm[data][i][parent] === vm['selected' + helpers.capitalize(parent)])
                index = i;
        };
        
        // Second, put all child options in the `loaded+[child]` variable,
        // so you can use it to filter through the current loaded options.
        vm['loaded' + helpers.capitalize(child) + 'Options'] = vm[data][index][child];

        // Finally, we need to check if the child select input is also a parent for another child input.
        // If it is, we set its value in the `selected+[child]` variable, which is also being watched by
        // the $watch method. And because we change it here, the watcher gets triggered, so its children
        // get loaded.
        if (vm['selected' + helpers.capitalize(child)]) {
            vm['selected' + helpers.capitalize(child)] = vm['loaded' + helpers.capitalize(child) + 'Options'][0];
        }
    }

    vueDependOn.install = function (Vue) {
        Vue.directive('dependon', {
            bind: function () {
                var vm = this.vm;
                var data = this.expression.split('.')[0];
                var parent = this.expression.split('.')[1];
                var child = this.el.id;
                var async = this.modifiers.async;

                if (async) {
                    // Empty the data list, because the user has
                    // chosen it to be asynchronous
                    vm[data] = [];
                    setTimeout(function () {
                        if (! vm[data].length) {
                            throw new Error('[vue-dependon] timeout exceeded: asynchronous loading of "' + data + '"');
                        }
                    }, 5000);
                } else {
                    start();
                }


                vm.$watch(data, function () {
                    start();
                });

                function start () {
                    // Turn off warnings (because we're using vm.$set)
                    Vue.config.silent = true;

                    /*** Some checks before we proceed. ***/
                    
                    if (!vm[data]) {
                        throw new Error('[vue-dependon] the data "' + data + '" is not defined in your vm instance.');
                    }

                    if (!vm[data].length) {
                        throw new Error('[vue-dependon] the data "' + data + '" is empty.');
                    }

                    for (var i = 0; i < vm[data].length; i++) {
                        if (!vm[data][i][parent]) {
                            throw new Error('[vue-dependon] there is no parent named "' + parent + '" in "' + data + '"');
                        }

                        if (!vm[data][i][child]) {
                            throw new Error('[vue-dependon] there is no child named "' + child + '" in "' + data + '"');
                        }
                    };

                    /*** Alright, everything seems fine! Let's keep on ***/

                    var selectedParent = 'selected' + helpers.capitalize(parent);
                    var loadedChild = 'loaded' + helpers.capitalize(child) + 'Options';

                    // Set the selected parent and the loaded child options on the current vm.
                    // selectedParent is what we use on the parent select input using v-model.
                    // loadedChild is what we use on the child select input when filtering options using v-for.
                    vm.$set(selectedParent, '');
                    vm.$set(loadedChild, []);

                    /**
                     * When the parent select input changes (another option is chosen),
                     * reload all options in the child select input.
                     */
                    vm.$watch(selectedParent, function (newVal, oldVal) {
                        loadOptions(vm, data, parent, child);
                    });

                    // In the beginning the first option of the parent select input should be selected.
                    // Which also means, we need to load its child options.
                    vm[selectedParent] = vm[data][0][parent];
                    loadOptions(vm, data, parent, child);


                    // Turn on warnings
                    Vue.config.silent = false;
                }
            }
        })
    }

    if (typeof exports == "object") {
        module.exports = vueDependOn;
    } else if (typeof define == "function" && define.amd) {
        define([], function(){ return vueDependOn });
    } else if (window.Vue) {
        window.VueDependOn = vueDependOn;
        Vue.use(vueDependOn);
    }

})();

