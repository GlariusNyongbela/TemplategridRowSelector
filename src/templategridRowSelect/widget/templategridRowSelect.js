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
    "dijit/_TemplatedMixin",

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
    "dojo/on",

    "dojo/text!templategridRowSelect/widget/template/templategridRowSelect.html",

], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, widgetTemplate, on) {
    "use strict";

    return declare("templategridRowSelect.widget.templategridRowSelect", [ _WidgetBase ], {

        templateString: widgetTemplate,

        templategridWidget:null,
        templategridWidgetElementIdentifier: "",
        templategridElement:null,


        // Parameters configured in the Modeler ----> Glarius
        mfToExecuteName: "",
        templategridClass:"",
        templategridName:"",
        lastSelectedObjectAssociationName:"",

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _selectedObjects:null, // ----> Glarius
        _templategridElementBody:null, // ----> Glarius
        _selectedItemGuids:null, // ----> Glarius
        _previouslySelectedItemsGuids:null, // ----> Glarius
        _diffBetweenSelectedAndPreviouslySelectedGuids: null, //----> Glarius
        

        constructor: function () {
            logger.debug(this.id + ".constructor");
            this._handles = [];
    
            this._selectedItemGuids = [];
            this._selectedObjects = [];
            this._previouslySelectedItemsGuids = [];
            this._diffBetweenSelectedAndPreviouslySelectedGuids = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            logger.debug(this.id + ".postCreate");
            this._updateRendering();
            this._setupEvents(); // ---> Glarius
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();
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

            this._executeCallback(callback, "_updateRendering");

            this._getLastClickedItemOntemplateGrid(); // ----> Glarius: This was added to prevent the widget from throwing an error after clicking the row when the previous event was a click on the select button
       
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

           this.connect(document, "click", lang.hitch(this, function(e){
                if (dojoDom.isDescendant(e.target, this._templategridElementBody[0])){
                    console.log(document +  "Element name: "+ e.target)
                    this._execMicroflow(this.mfToExecuteName);
                    this._updatePreviouslySelectedItems();
                                        
                }
            })); 
        },
        
        _getTemplategrid: function(){
            logger.debug(this.id + "._getTemplategrid");
            this.templategridWidgetElementIdentifier = ".mx-name-"+ this.templategridName;
            this.templategridElement = dojo.query(this.templategridWidgetElementIdentifier); 
            this.templategridWidget = dijit.byNode(this.templategridElement[0]);
            this._templategridElementBody = dojo.query(".mx-grid-content", this.templategridElement[0]);

            },  

        // Run the microflow declared in the the widget ui
        _execMicroflow: function (mfName, cb) {
            this._setSelectedGuids();
            this._getLastClickedItemOntemplateGrid();
            logger.debug(this.id + "_execMicroflow" + "_" + mfName + "_" + this._contextObj + "_" + this._selectedItemGuids);
            if(this._selectedItemGuids.length > 0 & this.lastSelectedObjectAssociationName != ""){
                console.log("last selected object is:" + this._selectedItemGuids[this._selectedItemGuids.length-1]);
                console.log("last clicked object is:" + this._diffBetweenSelectedAndPreviouslySelectedGuids[0]);
                this._addReferenceObject();
                
                //this._contextObj.addReference(this.lastSelectedObjectAssociationName, this._diffBetweenSelectedAndPreviouslySelectedGuids[this._diffBetweenSelectedAndPreviouslySelectedGuids.length-1]);

            }
            
            
            if (mfName !="" & (this._selectedItemGuids.length > 0 || this._previouslySelectedItemsGuids.length >0)){
                mx.ui.action(mfName, {
                params: {
                    applyto: "selection",
                    guids: this._selectedItemGuids,
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
            }
        },

        // set selected guids
        _setSelectedGuids: function(){
            this._selectedItemGuids = this.templategridWidget.getSelected();

            console.log("selectedGuid: "+ this._selectedItemGuids);
            console.log(this.templategridWidget._mxObjects._guid);
        },

        // get last clicked item on the templategrid
        // this is done by subtracting last selected items array from newly selected items array
        _getLastClickedItemOntemplateGrid: function(){
            this._diffBetweenSelectedAndPreviouslySelectedGuids = [];
           
            if (this._previouslySelectedItemsGuids.length >0 ){
            
                if(this._previouslySelectedItemsGuids.length > this._selectedItemGuids.length){
                    this._substractSelectedItems(this._previouslySelectedItemsGuids, this._selectedItemGuids);
                }
                else {
                    this._substractSelectedItems(this._selectedItemGuids, this._previouslySelectedItemsGuids);
                }
    
            }
            else{
                this._diffBetweenSelectedAndPreviouslySelectedGuids = this._selectedItemGuids;
            }  

            console.log("Last Clicked items array: " + this._diffBetweenSelectedAndPreviouslySelectedGuids);
            
            return this._diffBetweenSelectedAndPreviouslySelectedGuids
        

        },

        // loop over _selectedItemsGuids and _previouslySelectedGuids 
        _substractSelectedItems: function(longList, shortList){
            var newLonglist = longList;
            var newShortList = shortList;

            for (var i in newLonglist)  {
                var isPresent = false;
 
                for (var j in newShortList){
                    if (newLonglist[i] === newShortList[j]){
                        isPresent = true;
                    }
                }
                if (isPresent === false){
                    this._diffBetweenSelectedAndPreviouslySelectedGuids.push(newLonglist[i])
                } 
            }

        },

        // change list of previously selected items to list of selected items

        _updatePreviouslySelectedItems: function(){
            this._previouslySelectedItemsGuids = this._selectedItemGuids;
            console.log(this._previouslySelectedItemsGuids +" --compare-- "+this._selectedItemGuids)
        },

        // add last selected object reference to context
        _addReferenceObject: function(){
            if(this._diffBetweenSelectedAndPreviouslySelectedGuids.length == 1){
                this._contextObj.addReference(this.lastSelectedObjectAssociationName, this._diffBetweenSelectedAndPreviouslySelectedGuids[this._diffBetweenSelectedAndPreviouslySelectedGuids.length-1]);
            }
        },

        // Reset subscriptions.
        _resetSubscriptions: function () {
            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            this.unsubscribeAll();

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, function (guid) {
                        this._updateRendering();
                    })
                });

                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.backgroundColor,
                    callback: lang.hitch(this, function (guid, attr, attrValue) {
                        this._updateRendering();
                    })
                });

                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    val: true,
                    callback: lang.hitch(this, this._handleValidation)
                });
            }
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
