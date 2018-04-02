// Ledpins  data array for filling in info box
var ledPinsList = [];
var currentId;
var thisLedObject;
 
// DOM Ready =============================================================
$(document).ready(function() {
 
    // Populate the Student table on initial page load
    populateTable();
});
 
// Functions =============================================================
 
// Fill table with data
function populateTable() {
    
    // Empty content string
    var tableContent = '';
 
    // jQuery AJAX call for JSON
    $.getJSON( '/displayleds', function( data ) {
        // For each item in our JSON, add a table row and cells to the content string
        $.each( data , function() {
            tableContent += '<tr>';
                currentId = this._id;
                console.log(currentId);
                tableContent += '<td class="col-sm-2">' + this.portArduino + '</td>';
                tableContent += '<td class="col-sm-6">' + this.ledPins + '</td>';
                tableContent += '<td class="col-sm-2">' + this.sensorPin + '</td>';
                tableContent += '<td class="col-sm-2"><center><button onclick="showLedInfo(this.id)" type="button" class="btn btn-primary btn-sm" id="'+currentId+'"> Update </button> &nbsp;&nbsp; <button onclick="deleteLed(this.id)" type="button" class="btn btn-danger btn-sm" id="'+currentId+'"> Delete </button></center></td>';
            tableContent += '</tr>';
            // Stick our Led data array into ledPinsList variable in the global object
        });
        ledPinsList = data;
        // Inject the whole content string into our existing HTML table
        $('#ledPinsList table tbody').html(tableContent);
    });
}

// Show Led Info
function showLedInfo(currentId) {    
    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve id from data id attribute
    var thisLedId = currentId;
    
    // Get Index of object based on id value
    var arrayPosition = ledPinsList.map(function(el) { return el._id; }).indexOf(thisLedId);

    // Get our Led Object
    thisLedObject = ledPinsList[arrayPosition];
    
    //Populate Info Box
    document.getElementById('portArduino').value = thisLedObject.portArduino;
    document.getElementById('ledPins').value = thisLedObject.ledPins;
    document.getElementById('sensorPin').value = thisLedObject.sensorPin;
    // $('#portArduino').text(thisLedObject.portArduino);
    // $('#ledPins').text(thisLedObject.ledPins);
 
    // // New Code show led information in textbox
    $('#insertLeds input#portArduino').val(thisLedObject.portArduino);
    $('#insertLeds input#ledPins').val(thisLedObject.ledPins);
    $('#insertLeds input#sensorPin').val(thisLedObject.sensorPin);
};

// Update Led
function updateLed(event) {
    // event.preventDefault();

    currentId = thisLedObject._id;

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#insertLeds input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });
 
    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {
        // If it is, compile all led info into one object
        var modifiedLed = {
            portArduino: $('#insertLeds input#portArduino').val(),
            ledPins: $('#insertLeds input#ledPins').val(),
            sensorPin: $('#insertLeds input#sensorPin').val()
        }
        
        // Use AJAX to post the object to our updateLed service
        $.ajax({
            type: 'POST',
            url: '/updateleds/'+ currentId,
            data: modifiedLed,
            dataType: 'JSON'
        }).done(function( response ) {
            // Check for successful (blank) response
            if (response.msg === '') {
                // Clear the form inputs
                $('#insertLeds input').val(''); 
                // Update the table
                populateTable();
                console.log(modifiedLed);
            } else {
                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);
            }
        });
    } else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// Delete Led
function deleteLed(currentId) {
    console.log(currentId);

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this Led data?');
            
    // Check and make sure the user confirmed
    if (confirmation === true) {
        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/deleteleds',
            data: {"currentId": currentId}
        }).done(function( response ) {
            // Check for a successful (blank) response
            if (response.msg === '') {
            } else {
                alert('Error: ' + response.msg);
            }
            // Update the table
            populateTable();
        });
    } else {
        // If they said no to the confirm, do nothing
        return false;
    }
};