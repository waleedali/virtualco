
$("#requiredError").hide();
$("#initOfficeSuccess").hide();

$("#officeinitForm").submit(function( event ) {

  // Stop form from submitting normally
  event.preventDefault();

  var $form = $(this);
  var numberOfEmp = $form.find( "input[id='noOfEmp']" ).val();
  var startTime = $form.find( "input[id='startTime']" ).val();
  var endTime = $form.find( "input[id='endTime']" ).val();
  var bucketName = $form.find( "input[id='bucketName']" ).val();
  var secretText = $form.find( "input[id='secretText']" ).val();

  if ( numberOfEmp === ""
    || startTime === ""
    || endTime === ""
    || bucketName === "") {
    console.log ("Bad request, number of employees, start time, end time, and bucket name must be sent!");
    $("#requiredError").show();
    setTimeout(function () {
      $("#requiredError").fadeOut(2000);
    }, 5000);
    return;
  }

  var officeinit = function() {
    $.ajax({
      type: "POST",
      url: "/officeinit",
      data: {
        numberOfEmp: numberOfEmp,
        startTime: startTime,
        endTime: endTime,
        bucketName: bucketName,
        secretText: secretText
      },
      success: function (){
        console.log("office init success!");
        $form.hide();
        $("#initOfficeSuccess").show();
        setTimeout(function () {
          $("#initOfficeSuccess").fadeOut(2000);
        }, 5000);
      }
    });
  };

  officeinit();
});

