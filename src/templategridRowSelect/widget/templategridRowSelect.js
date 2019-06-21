/*
    templategridRowSelect
    ========================

    @file      : templategridRowSelect.js
    @version   : 1.0.0
    @author    : Glarius
    @date      : 2019-6-13
    @copyright : Mendix 2019
    @license   : Apache 2

    Documentation
    ========================
*/


define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",


], function (declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent) {
    "use strict";

    return declare("templategridRowSelect.widget.templategridRowSelect", [ _WidgetBase ], {

        templategridWidget:null,
        templategridWidgetElementIdentifier: "",
        _templategridElement:null,

        // Parameters configured in the Modeler ----> Glarius
        mfToExecuteName: "",
        templategridClass:"",
        templategridName:"",

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _templategridElement:null, // ----> Glarius
        _templategridElementBody:null, // ----> Glarius

        constructor: function () {
            logger.debug(this.id + ".constructor");
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            logger.debug(this.id + ".postCreate");
            this._updateRendering();
            this._getTemplategrid(); // ---> Glarius
            this._setupEvents(); // ---> Glarius
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._updateRendering(callback);
            this._getTemplategrid(); // ---> Glarius
        },

        resize: function (box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function () {
            logger.debug(this.id + ".uninitialize");
        },

        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._executeCallback(callback, "_updateRendering");
        },

        // We want to stop events on a mobile device --> Glarius
        _stopBubblingEventOnMobile: function (e) {
            logger.debug(this.id + "._stopBubblingEventOnMobile");
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },
        // Attach events to HTML dom elements --> Glarius
        _setupEvents: function () {
            logger.debug(this.id + "._setupEvents");
           // var templategridWidgetElement = dojo.query(this.templategridWidgetElementIdentifier);
            this.connect(document, "click", lang.hitch(this, function(e){
                if (dojoDom.isDescendant(e.target, this._templategridElementBody[0])){
                    this._execMicroflow(this.mfToExecuteName, this._contextObj.getGuid());
                    console.log(document)
                }
                    
            }));
        }, 
        
        //Get templategrid by template grid name ----> Glarius
        _getTemplategrid: function(){
            logger.debug(this.id + "._getTemplategrid");
            this.templategridWidgetElementIdentifier = ".mx-name-"+ this.templategridName;
            this._templategridElement = dojo.query(this.templategridWidgetElementIdentifier); 
            this.templategridWidget = dijit.byNode(this._templategridElement[0]);
            this._templategridElementBody = dojo.query(".mx-grid-content", this._templategridElement[0]);
            },  

        // Run the microflow declared in the the widget ui
        _execMicroflow: function (mfName, contextObject, cb) {
            var selectedItemGuids = this.templategridWidget.getSelected();
            logger.debug(this.id + "_execMicroflow" + "_" + mfName + "_" + contextObject + "_" + selectedItemGuids);
            
            
            mx.ui.action(mfName, {
                params: {
                    applyto: "selection",
                    guids: selectedItemGuids,
                },
                origin: mx.ui.mxform,
                context:this.mxcontext,
                callback: lang.hitch(this, function (objs) {
                    if (cb && typeof cb === "function") {
                        cb(objs);
                    }
                }),
                error: function (error) {
                    console.debug(error.description);
                }
            }, this);  
        },


        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }

    });
});

require(["templategridRowSelect/widget/templategridRowSelect"]);
