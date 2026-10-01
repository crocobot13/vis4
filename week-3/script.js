var total = 0;


document.getElementById("minusTwo").addEventListener("click", function() {

    total = total - 2;

    document.querySelector("#resultId").innerHTML = total;

});


document.getElementById("minusOne").addEventListener("click", function() {

    total = total - 1;

    document.querySelector("#resultId").innerHTML = total;

});


document.getElementById("reset").addEventListener("click", function() {

    total = 0;

    document.querySelector("#resultId").innerHTML = total;

});


document.getElementById("plusOne").addEventListener("click", function() {

    total = total + 1;

    document.querySelector("#resultId").innerHTML = total;

});


document.getElementById("plusTwo").addEventListener("click", function() {

    total = total + 2;

    document.querySelector("#resultId").innerHTML = total;

});
