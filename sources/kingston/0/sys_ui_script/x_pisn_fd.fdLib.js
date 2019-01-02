    angular.module('fdLib', [])
    .service('fdManager', function ($q) {
        'use strict';
        
        var gFormInstances = [];
        
        /**
         * Add a new form to be managed
         * 
         * @param {GlideForm} g_form  the GlideForm of the form to be managed
         * @param {Object} formModel  the model of the form to be managed
         * @return {String}  a unique identifier
         */
        function add(g_form, formModel) {
            
            var id = _getNewID();
            
            gFormInstances[id] = {
                g_form: g_form,
                model: formModel
            };
            
            return id;
        }
        
        /**
         * Get the UI Actions for a particular form
         * 
         * @param {String} id  the unique identifier of the form
         * @return {Object} an object containing the UI actions for the form
         */
        function getActions(id) {
            return gFormInstances[id].model._ui_actions;
        }
        

        /**
         * Get the UI Actions for a particular form
         * 
         * @param {String} id  the unique identifier of the form
         * @param {String} action  the action name, or sys_id of the UI Action
         * @return {Promise}
         */
        function triggerAction(id, action) {
            return $q(function (resolve, reject) {
                resolve(gFormInstances[id].g_form.submit(action));
            });
        }
        
        /**
         * Get the model for a particular form
         * 
         * @param {String} id  the unique identifier of the form
         * @return {Object} the model of the form
         */
        function getModel(id) {
            return gFormInstances[id].model;
        }
        


        /**
         * Get a new unique identifier for the form
         * 
         * @return {String} the unique identifier
         */
        function _getNewID() {

            var id = '';

            while (id === '' || typeof gFormInstances[id] !== 'undefined') {
                id = 'g_form_' + Math.floor((Math.random() * 100) + 1);
            }

            return id;
        }
        
        return {
            add: add,
            getActions: getActions,
            triggerAction: triggerAction,
            getModel: getModel
        };
        
    })



    .directive('fdForm', function () {
        return {
            link: function (scope, elem, attr, ctrl) {
                scope.options = ctrl.options;
            },
            require: '^vbe775ff24f8443003b3028201310c739'
        };
    })





    .factory('fdFieldService', function (lazyLoader, $injector, $document) {
        'use strict';
        
        var head = $document[0].head || $document[0].getElementsByTagName('head')[0];
        
        /**
         * Load the directive
         * 
         * @param {String} directiveName  the name of the directive
         * @param {String} sysID  the sysID of the directive
         * @param {String} css  the CSS of the field
         * @param {String} controller  the angular controller of the field
         * @param {String} link  the angular link function for the field
         * @param {String} template  the angular template of the field
         * @return {undefined}
         */
        function loadDirective (directiveName, sysID, css, controller, link, template) {
            
            lazyLoader.directive(directiveName, function($injector) {

                var api = {
                    restrict: 'A',
                    replace: false,
                    require: '^fdField'
                };
                
                if (template)
                    api.template = template;
                
                if (css)
                    _loadCSS(directiveName, sysID, css);
                
                if (controller) {
                    eval('api.controller=' + controller);
                }
                
                api.link = function(scope, elem, attr, ctrl) {
                    var link;
                    if (link) {
                        eval('link=' + link);
                        if (link) {
                            link(scope, elem, attr, ctrl);
                        }
                    }
                };
            
                return api;
            });
        }

        /**
         * Load the CSS for the field's directive
         * 
         * @param {String} directiveName  the name of the directive
         * @param {String} sysID  the sysID of the directive
         * @param {String} css  the CSS to load
         * @return {undefined}
         */
        function _loadCSS(directiveName, sysID, css) {

            var id = sysID + '-s';

            if (css && !$document.find('head #' + directiveName).length) {

                var el = $document[0].createElement('style');
                el.type = 'text/css';
                if (sysID)
                    el.setAttribute('id', id);
                if (directiveName)
                    el.setAttribute('fd-directive', directiveName);
                if (el.styleSheet)
                    el.styleSheet.cssText = css;
                else
                    el.appendChild($document[0].createTextNode(css));

                head.appendChild(el);
            }
        }
        
        return {
            loadDirective: loadDirective
        };
        
        
    })





    .directive('fdField', function ($compile, fdFieldService) {
        'use strict';


        function insertDirective (scope, elem) {
            var directiveName,
                spinalCase;

            var fieldDirective = scope.formModel._fields[scope.field.name].directive;
            var fieldType = scope.formModel._fields[scope.field.name].type;

            if (typeof fieldDirective !== 'undefined') {

                directiveName = fieldDirective.name;
                spinalCase = fieldDirective.spinal_case;

            } else {

                directiveName = scope.formModel._field_types[fieldType].name;
                spinalCase = scope.formModel._field_types[fieldType].spinal_case;
            }

            var directive = scope.formModel._directives[directiveName];

            fdFieldService.loadDirective(directiveName, directive.id, directive.css,
                directive.controller, directive.link, directive.template);

            var elString  ="<div " + spinalCase + ' class="fd_' + directiveName + '"/></div>"';
            var el = angular.element(elString);
            elem.append(el);
            $compile(el)(scope);
        }
        
        var link = function (scope, elem, attrs, ctrl) {

            insertDirective(scope, elem);

            var inputField = elem.find("[name='" + scope.field.name + "']");
            scope.$emit("sp.spFormField.rendered", elem, inputField);

        };
        
        var controller = function ($scope) {

            var field = $scope.field;

            $scope.onImageUpload = function(thumbnail) {
                $scope.getGlideForm().setValue(field.name, thumbnail, thumbnail);
            };

            $scope.onImageDelete = function() {
                $scope.getGlideForm().setValue(field.name, '');
            };

            $scope.fieldValue = function(newValue, displayValue) {
                if (angular.isDefined(newValue)) {
                    $scope.getGlideForm().setValue(field.name, newValue, displayValue);
                }
                return field.value;
            };

            $scope.stagedValueChange = function() {
                $scope.$emit('sp.spFormField.stagedValueChange', null);
            };

            $scope.getGlideForm().$private.events.on("change", function(fieldName, oldValue, newValue) {
                if (fieldName == field.name)
                    field.stagedValue = newValue;
            });

            $scope.getAttachmentGuid = function() {
                if ($scope.formModel) {
                    return $scope.formModel._attachmentGUID;
                }
                return "";
            };
            
        };
        
        return {
            restrict: 'E',
            link: link,
            scope: {
                field: '=',
                formModel: '=',
                getGlideForm: '&glideForm'
            },
            replace: true,
            controller: controller,
            require: ['^spModel']
        };
    });