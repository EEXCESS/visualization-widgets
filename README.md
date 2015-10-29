# Widgets

EEXCESS widgets are components like visualizations (Barchart, FacetScape, ...), which are typically included via an iframe. Therefore, they should be self-contained, i.e. include all necessary media, libraries, css-files, etc.

Communication with the EEXCESS-environment is enabled via the window.postMessage-API, with the available options described in the following.

## Usage
For usage examples see the `examples` folder and the according `readme` file.

## Interface - using window.postMessage

The data attribute in the transmitted messages adheres to the following pattern:
    
    event:eexcess.<event>,
    data:{<event details>}
 
### Incoming messages
Available events:
* queryTriggered
* new Results
* rating
* error

#### queryTriggerd
This event specifies, that a new query was triggered. The event details contain the profile, that is associated with this query

#### new Results
This event indicates the arrival of new results. The event details consist of two attributes: _profile_ and _results_. _Profile_ contains the user profile associated with the results and _results_ contains the results retrieved.

#### rating
Indicates that an item was rated in another component. The widget can then update the item's rating accordingly. The event details contain the _uri_ of the item and _score_ of the rating.

#### error
Used to indicate an error. The event details contain an error message as string.


### Outgoing Messages
Available events:
* queryTriggered
* eexcess.log.moduleOpened
* eexcess.log.moduleClosed
* eexcess.log.statisticsCollected
* eexcess.log.itemOpened
* eexcess.log.itemClosed
* eexcess.log.itemCitedAsImage
* eexcess.log.itemCitedAsText
* eexcess.log.itemCitedAsHyperlink
* eexcess.log.itemRated
* currentResults

#### queryTriggered
Indicates a new query. The event details contain the profile associated with that query.

#### eexcess.log.moduleOpened
Indicates that a module was opened. The event details contain the origin and the name of the module.

#### eexcess.log.moduleClosed
Indicates that a module was closed. The event details contain the origin, the name of the module and optionaly the duration

#### eexcess.log.statisticsCollected
Indicates that a module wants to log data. The event details contain the origin and the data  

#### eexcess.log.itemOpened
Indicates that an item is opened. The event details contain the origin, the queryID of the original query and the documentBadge.

#### eexcess.log.itemClosed
Indicates that an item is closed. The event details contain the origin, the queryID of the original query, the documentBadge and optionaly the duration.

#### eexcess.log.itemCitedAsImage
Indicates that an item was cited in document as an image. The event details contain the origin, the queryID of the original query and the documentBadge.

#### eexcess.log.itemCitedAsText
Indicates that an item was cited in document as an text. The event details contain the origin, the queryID of the original query and the documentBadge.

#### eexcess.log.itemCitedAsHyperlink
Indicates that an item was cited in document as an hyperlink. The event details contain the origin, the queryID of the original query and the documentBadge.

#### eexcess.log.itemRated
Indicates that an item was rated. The event details contain the origin, the queryID, the documentBadge and the rating.

#### currentResults
This event may be used by widgets upon initialization to obtain the current resultset (and associated profile). It triggers the parent window to send a message with a **newResults** event.
