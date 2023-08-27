function validate() {
  let category = document.getElementById("category").value;
  let nationalId = document.getElementById("nId").value;
  const button = document.getElementById("btn");
  const error = document.getElementById("error");

  error.classList.add("show");
  if (category !== "ارمله" && category !== "مطلقه" && category !== "متزوجه") {
    button.disabled = false;
    // nationalId.value = 0
    error.innerText = "تمام يا رايق";
    error.style.color = "green";
  } else {
    button.disabled = true;
    error.style.color = "red";

    if (nationalId.length < 14) {
      error.innerText = "الرقم القومى يجب ان يكون اكبر من 14 رقم";
    } else if (nationalId.length > 14) {
      error.innerText = "الرقم القومى يجب ان يكون اصغر من 14 رقم";
    } else if (nationalId[0] != 2 && nationalId[0] != 3) {
      error.innerText = "الرقم القومى يجب ان يبدا ب 3 او 2";
    } else {
      error.innerText = "تمام يا رايق";
      error.style.color = "green";
      button.disabled = false;
    }
  }
}

function getWhy(id) {
  var why = prompt("سبب اللغى؟");
  if (why == null || why == "") {
    location.reload();
  }
  document.getElementById(id).value = why;
  return why;
}

function autoSuggestMonth() {
  var amount = document.getElementById("amount").value;
  var amountPerMonth = document.getElementById("amount-month");

  amountPerMonth.value = Math.round(amount / 12);
}
function autoSuggestYear() {
  var amount = document.getElementById("amount");
  var amountPerMonth = document.getElementById("amount-month").value;

  amount.value = Math.round(amountPerMonth * 12);
}

function validatePetro() {
  let petrotechId = document.getElementById("petrotech-id").value;
  const petroValidateForm = document.getElementById("petro-validate");
  const error = document.querySelector("#Perror");

  error.classList.add("show");

  if (petrotechId != "babaTarek") {
    petrotechId = "";
    error.style.color = "firebrick";
    error.innerText = "Incorrect can't let you in!";
  } else {
    petroValidateForm.style.display = "none";
    error.classList.remove("show");
    document.querySelector(".register-form").classList.add("show");
    document.getElementById("error").classList.add("show");
    document.querySelector(".register__button").setAttribute("disabled", true);
  }
}

function validatePassword() {
  const registerBtn = document.querySelector(".register__button");

  let password = document.getElementById("pass").value;
  let confirmPassword = document.getElementById("cPass").value;

  if (confirmPassword.length === 0) {
    return
  }

  if (password != confirmPassword) {
    error.style.color = "red";
    error.innerText = "Password match.";
    registerBtn.setAttribute("disabled", true);
  } else if (password == confirmPassword) {
    error.style.color = "green";
    error.innerText = "LETS GO!";
    registerBtn.removeAttribute("disabled");
  }
}

function getKbd(id) {
    const numberOfMonth = prompt("قبض كام شهر؟")

    if(isNaN(+numberOfMonth)) {
        location.reload();
    } else {
        document.getElementById("index" + id).value = Number(numberOfMonth)
    }
}

function popup(id) {
  const popup = document.querySelector(".popup");
  popup.classList.add("show");
  document.getElementById(id).value = id;
  document.querySelector(".form-input").focus();
}

function add() {
  const input = document.querySelector(".form-input");
  while (input.value[0] === "+" || input.value[0] === "-") {
    input.value = input.value.substring(1);
  }
  input.focus();
}

function sub() {
  const input = document.querySelector(".form-input");
  while (input.value[0] == "+" || input.value[0] == "-") {
    input.value = input.value.substring(1);
  }
  input.value = "-" + input.value;
  input.focus();
}

function showLoading() {
  let preloader = document.getElementById("preloader");
  preloader.classList.add("show");
}
showLoading();
window.onload = function () {
  preloader.classList.remove("show");
};


const allForms = document.querySelectorAll('form');

if (allForms) {
    allForms.forEach(form => {
        form.onsubmit = function () {
            showLoading();
        }
    });
}


const allLinks = document.querySelectorAll('a');

if (allLinks) {
    allLinks.forEach(link => {
        link.onclick = function () {
            showLoading()
        }
    });
}
