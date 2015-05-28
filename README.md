# Widgets

EEXCESS widgets are components like visualizations (Barchart, FacetScape, ...), which are typically included via an iframe. Therefore, they should be self-contained, i.e. include all necessary media, libraries, css-files, etc.

Communication with the EEXCESS-environment is enabled via the window.postMessage-API, with the available options described in the following.

## Interface - using window.postMessage

The data attribute in the transmitted messages adheres to the following pattern:
    
    event:eexcess.<event>,
    data:{<event details>}
 
### incoming messages
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
* logging
* rating
* currentResults

#### queryTriggered
Indicates a new query. The event details contain the profile associated with that query.

#### logging
Indicates that some interaction should be logged. The event details contain an _action_ attribute, which specifies the interaction and a _details_ attribute, providing details on the interaction to be logged.
Currently supported actions:
* resultOpened (_details_:<url>)

#### rating
Indicates the rating of an item. The event details contain the item's _uri_ and corresponding _score_ (integer).

#### currentResults
This event may be used by widgets upon initialization to obtain the current resultset (and associated profile). It triggers the parent window to send a message with a **newResults** event.