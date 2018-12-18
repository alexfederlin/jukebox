
(function() {
    // get the json of the subdirs
    $.getJSON("http://localhost:5050/largemock", function(data) {
        var items = [];
        var first = true;
        //go through the JSON of the subdirs
        $.each( data, function( key, val ) {
          var res = val.name.split("/",2)
          //if we're on top level directory, no need to print it
          if (res.length<2){
            if (first == true) {
                first = false;
            }
            else {
                items.push( '</div>')    
            }

            items.push( '<button class"collapsible">' + res + "</button>")
            items.push( '<div class="content">')
            return true;
          }
          items.push( "<p>" + val.name + ": " + val.rfid + "</p>" );
        });
         
        $( "<div/>", {
          "class": "my-new-list",
          html: items.join( "" )
        }).appendTo( "body" );
    })
})();