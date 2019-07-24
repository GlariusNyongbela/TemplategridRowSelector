# Description
On select of templategrid rows, this widget automatically triggers a microflow which takes 3 input parameters: list of selected objects of the templategrid, context object and templategrid object (NB: single object not list)
This widget is useful when certain operations (e.g. sum, average, etc) are done on the selected templategrid rows.
The widget links the select event of the rows to the microflow performing the desired operation.
When rows on the templategrid are selected, the linked microflow is is automatically triggered  

# Mendix Widget Boilerplate

See [AppStoreWidgetBoilerplate](https://github.com/mendix/AppStoreWidgetBoilerplate/) for an example
