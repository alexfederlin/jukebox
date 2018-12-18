jQuery(function($) {

  display("Loading the JSON data");
  $.ajax({
    type:     "GET",
    url:      "http://localhost:5050/dirtree",
    dataType: "JSON",
    success:  function(data) {
      display("Got the data, rendering it.");
      nl=$('<ul id="newList">')
      $(document.body).append(nl)
      nl.append(renderchildren(data.children));

      // make the list with the ID 'newList' collapsible
      // see http://code.iamkate.com/javascript/collapsible-lists/
      CollapsibleLists.applyTo(document.getElementById('newList'));
      // add an event handler which triggers on any change to a text input field
      // it will trigger posting the changed value with the path the input field 
      // belongs to to the server
      $("input[type='text'").change(function(){
          var path = b64DecodeUnicode($(this).attr('id'));
          var rfid = $(this).val();
          console.log("value of "+path+" was changed by user to: "+rfid)
          postRFID(path, rfid)
        }
      )

    },
    error:    function() {
      display("An error occurred.");
    }
  });

// this changes the value of the input text field with the given path to the given rfid
  function changeval(path, rfid){
    var cleanpath = clean(path);
    $('input[id="'+cleanpath+'"]').val(rfid)
    console.log("changed value of "+path+": "+rfid)
  }

  //see here: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
  // this is done because the id attribute cannot handle slashes, whitespace and all sorts of other characters
  function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
  }

  function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }


// query the rfid for  given path from the server
// this is called for every field and the value is updated to the returned value
  function getRFID(path) {
    $.ajax({
      type:     "GET",
      url:      "http://localhost:5050/rfid",
      data:     {"path": path},
      dataType: "JSON",
      success:  function(data) {
        if (data.rfid){
          // cleanpath = clean(path);
          console.log("got response for path "+path+": "+JSON.stringify(data.rfid))
          // $('input[id="'+cleanpath+'"]').val(data.rfid)
          changeval(path, data.rfid)
        }
      },
      error:    function() {
        display("An error occurred.");
      }
    });
  }

// this sends the new RFID value for a particular path to the server
// if the RFID is already used for another path, an error is displayed and the 
// value of the input field is deleted
  function postRFID(path, rfid) {
    $.ajax({
      type:     "POST",
      url:      "http://localhost:5050/rfid",
      data:     {"path": path,
                 "rfid": rfid},
      dataType: "JSON",
      success:  function(data) {
        if (data.rfid){
          cleanpath = clean(path);
          console.log("Answer from Server: path "+JSON.stringify(data.playpath)+" now has rfid: "+JSON.stringify(data.rfid))
          // $('input[id="'+cleanpath+'"]').val(data.rfid)
        }
      },
      error:    function(err) {
        display("An error occurred: "+err.responseText);
        changeval(path, "")
      }
    })
    .done(function(msg){
      console.log("done with postRFID: "+JSON.stringify(msg))
    });
  }

//convenience function
  function clean(path){
    //return path.replace(/\s|\/|\(|\)|\&|\!|\?|\./g, "");
    return b64EncodeUnicode(path);
  }


// create the ul of all the items
  function renderchildren(children) {
    var index, ul;
    var cleanpath="";

    // Create a list for these children
    ul = $("<ul>");

    // Fill it in
    $.each(children, function(index, entry) {
      var li;
      cleanpath=clean(entry.path);
      // Create list item
      li = $('<li id="'+cleanpath+'">');

      // Set the text
      li.text(entry.path)


      // Append a sublist of its children if it has them
      if (entry.children.length>0) {
        li.append(renderchildren(entry.children));
      }
      else {
        li.append("<input id='"+cleanpath+"' type='text'/>")
        // for each leaf (no further children), create an input field
        // and check if an rfid already exists for this path
        getRFID(entry.path)
      }

      // Add this item to our list
      ul.append(li);
    });

    // Return it
    return ul;
  }

  function display(msg) {
    $("<p>").html(msg).appendTo(document.body);
  }
});