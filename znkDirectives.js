/*
 * In that angular module we gonna rewrite some of the core AngularJS directives to show that they can be easily 
 * understood if we accept not to have as good performances as the real AngularJS directives.
 * 
 * This modules might be commented out very much but the aim is to provide enough explainations to be understandable.
 * Hence, the module is also going to specify all the restrict even if the default value is 'A'.
 */
(function() {
    'use strict';
    angular.module('znkDirectives', [])
    .directive('znkBind', function() {
        return {
            restrict: 'A', // restricted to an attribute
            // we do not create an isolated scope so we do have access to the desired variables
            link: function(scope, element, attrs) {
                // Let's watch the given variable
                scope.$watch(attrs.znkBind, function(newValue, oldValue) {
                    // if the value is undefined we do not have anything to print
                    if (newValue === undefined) {
                        element.text('');
                    } else {
                        // otherwise let's print the real value
                        element.text(newValue);
                    }
                });
            }
        }
    })
    .directive('znkInit', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                // We just eval the value of the attrs in the scope and magic happens
                scope.$eval(attrs.znkInit);         
            }
            /*
             * Note : the AngularJS version is using the compile function instead of the linking function.
             * It ensures that the method is going to be called only once and the eval seems to be made 
             * earlier with the compile function than with the linking function.
             */
        }
    })
    .directive('znkClick', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                // Here we need to bind on the click event to be able to react
                element.on('click', function() {
                    // we eval the value of the znkClick attribute in the current scope
                    scope.$eval(attrs.znkClick);
                    // And finally launch a digest
                    scope.$digest();
                });
            }
        }
    })
    .directive('znkModel', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                if (attrs.type !== 'checkbox') {
                    element.on('keyup', function() {
                        updateValue(element.val());
                    });
                } else {
                    element.on('click', function() {
                       updateValue(element.prop('checked'));
                    });
                }
                scope.$watch(attrs.znkModel, function(newValue, oldValue) {
                    element.val(newValue !== undefined ? newValue : '');
                });
                
                function updateValue(value) {
                    // We update the scope with the new value
                    scope[attrs.znkModel] = value;
                    // We just digest because we consider that the modification only impacts the current scope
                    // Otherwise we should wrap the update inside a scope.$apply
                    scope.$digest();
                }
            }
        }
    })
    .directive('znkShow', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                // We watch the value to detect the changes and dynamically alter the css
                scope.$watch(attrs.znkShow, function(newValue, oldValue) {
                   if(!!newValue) {
                       // If the new value is truthy so we can show the content
                       element.css('display', 'block');
                   } else {
                       // Otherwise let's hide it
                       element.css('display', 'none');
                   }
                });
            }
        }
    })
    .directive('znkController', function() {
        return {
            restrict: 'A',
            scope: true, // We create our own scope to have a controller's dedicated scope
            controller: '@' // let's get the given controller so we do not have to create ours since it is already managed by angular
            /*
             * Based on the directive specification the @ means that we gonna get the instance of the controller
             * passed as an attribute instead of creating our own here. This is the wanted behaviour because angular 
             * already manages the controller and we do not want to have to redefine it or reinstantiate it.
             */
        }
    })
    .directive('znkRepeat', function() {
        return {
            restrict: 'A',
            transclude: 'element',
            link: function ($scope, $element, $attr, $controller, $transclude) {
                // Handle the znkRepeat expression
                var expression = $attr.znkRepeat.match(/^\s*(.+)\s+in\s+(.*)\s*$/);
                var iteree = expression[1];
                var collection = expression[2];
                var parent = $element.parent();

                $scope.$watchCollection(collection, function (newCollection) {
                    // Deletion of the DOM element
                    angular.forEach(parent.children(), function (element) {
                        // Getting the current element' scope
                        var scope = angular.element(element).scope();
                        // Removing the element
                        element.remove();
                        // Destroying the scope
                        scope.$destroy();
                    });

                    // For each item
                    angular.forEach(newCollection, function (current) {
                        // Creating a new scope
                        var childScope = $scope.$new();

                        /*
                     * Adding in the child scope the right variable.
                     * For instance, for contact in contacts we gonna add in the scope the contact variable =>
                     * childScope[contact] = current;
                     */
                        childScope[iteree] = current;

                        // Let's transclude / duplicate the element
                        $transclude(childScope, function (clone) {
                            // Clone is the new element so we have to append it to the parent
                            parent.append(clone);
                        });
                    });
                });
            }
        }
    });
})();