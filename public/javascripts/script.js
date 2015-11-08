
$("#requiredError").hide();
$("#initOfficeSuccess").hide();
$("#officeStatusInfo").hide();

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

var loadOfficeStatus = function() {
  $.ajax({
    url: "/officestatus",
    dataType: 'json',
    cache: false,
    success: function(data) {
      if(data.AutoScalingInstances.length > 0) {
        $("#officeStatusInfo").hide();
        $("#instancesTable").find("tr:gt(0)").remove();

        for (var i=0; i < data.AutoScalingInstances.length; i++) {
          var newRow = $("<tr class='warning'>");
          var cols = "";
          cols += '<td>' + data.AutoScalingInstances[i].InstanceId +'</td>';
          if (data.AutoScalingInstances[i].LifecycleState === "InService") {
            cols += '<td>Running</td>';
            newRow = $("<tr class='success'>");
          } else {
            cols += '<td>' + data.AutoScalingInstances[i].LifecycleState +'</td>';
          }
          cols += '<td>' + data.AutoScalingInstances[i].HealthStatus +'</td>';
          newRow.append(cols);
          $("#instancesTable").append(newRow);
        }
      } else {
        $("#officeStatusInfo").show();
      }
    }.bind(this),
    error: function(xhr, status, err) {
      console.error("/officestatus", status, err.toString());
    }.bind(this)
  });
};

loadOfficeStatus();
setInterval(loadOfficeStatus, 10000);



