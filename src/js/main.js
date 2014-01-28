/**
 
   Infobase documentation 
 
     ExDB-start
     sandbox.js provides namespacing functionality (reference patterns chapper)
     src/js/od/od.js      <-- change this
      APP.start   
          APPView
              useful central functionality is:
                 number formating
                  language lookup
              when the APPView is initialized, it sends a signal "init"  for other
              components to initialize themselves

      src/js/tables.js
        setup_tables runs when the init signal is triggered.  setup_table dispatches its own
        "load_table" signal 
        once all tasks have completed from the load_tables signal, setup_tables downloads
        and prepares each of the data tables
        finally, setup_tables triggers the data_loaded signal
 
      src/js/router.js
        this file contains the functionality for routing between different parts of the
        application. It uses the backbone router.
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 */
