function validate() {

    var category = document.getElementById('category').value
    var nationalId = document.getElementById('nId').value
    var span = document.getElementById('error')
    var button = document.getElementById('btn')

    span.style.visibility = 'visible'
    if (category === 'سورى') {
        checkSoory()
    } else {
        
        button.disabled = true;
        span.style.color = 'red';

        if (nationalId.length < 14) {
            span.innerText = 'الرقم القومى لا يجب ان يكون اصغر من 14 رقم';
        } else if (nationalId.length > 14) {
            span.innerText = 'الرقم القومى لا يجب ان يكون اكبر من 14 رقم';
        } else if (nationalId[0] != 2 && nationalId[0] != 3) {
            span.innerText = 'الرقم القومى يجب ان يبدا ب 3 او 2';
        } else {
            span.innerText = 'تمام يا رايق'
            span.style.color = 'green';

            button.disabled = false;
        } 
    }   
}

function checkSoory () {

    var button = document.getElementById('btn')
    var category = document.getElementById('category').value
    var nationalId = document.getElementById('nId')
    var span = document.getElementById('error')

    if (category === 'سورى') {
        button.disabled = false;
        nationalId.value = 0
        span.innerText = 'تمام يا رايق'
        span.style.color = 'green';
        span.style.visibility = 'visible'
    }
}

function getWhy(id) {
    var why = prompt('سبب اللغى؟');
    if (why == null || why == "") {
        getWhy();
    }
    document.getElementById(id).value = why;
    return why;
}

function autoSuggestMonth() {
    var amount = document.getElementById('amount').value;
    var amountPerMonth = document.getElementById('amount-month');

    amountPerMonth.value = Math.round(amount / 12);
}
function autoSuggestYear() {
    var amount = document.getElementById('amount');
    var amountPerMonth = document.getElementById('amount-month').value;

    amount.value = Math.round(amountPerMonth * 12);

}



function validatePetro () {
    
    var petrotechId = document.getElementById('petrotech-id').value
    document.getElementById('Perror').style.visibility = 'visible';
    if (petrotechId != 'babaTarek') {
        document.getElementById('petrotech-id').value = ''
        document.getElementById('Perror').innerText = "Incorrect can't let you in!"
    } else {
        document.getElementById('petro-validate').style.display = 'none';
        document.getElementById('Perror').style.display = 'none';
        validatePassword()
    }
}

function validatePassword() {

    document.getElementById('form').style.display = 'block';

    var error = document.getElementById('error')
    error.style.visibility = 'visible'
    var password = document.getElementById('pass').value
    var confirmPassword = document.getElementById('cPass').value
    if (password != confirmPassword) {
        error.style.color = 'red'
        error.innerText = 'Please make sure your Password match.'
        return false
    } else if (password != confirmPassword) {
        error.style.color = 'green'
        error.innerText = 'LETS GO!'
        return true
    } else {
        error.style.color = 'green'
        error.innerText = 'LETS REGISTER!'
    }

}

function getKbd(id) {
    const numberOfMonth = prompt("قبض كام شهر؟")

    if(isNaN(+numberOfMonth)) {
        getKbd()
    } else {
        document.getElementById("index" + id).value = Number(numberOfMonth)
    }
}

function popup (id) {
    document.querySelector(".container").style.opacity = 0.2;
    document.querySelector(".popup").style.display = "block";
    document.querySelector(".popup").style.opacity = 1;
    document.getElementById(id).value = id;
    document.querySelector('.form-input').focus();

}

function add () {

    while (document.querySelector('.form-input').value[0] == "+" || document.querySelector('.form-input').value[0] == "-") {
        document.querySelector('.form-input').value = document.querySelector('.form-input').value.substring(1);
    }
    document.querySelector('.form-input').value = "+" + document.querySelector('.form-input').value ;
    document.querySelector('.form-input').focus();

}

function sub () {
    while (document.querySelector('.form-input').value[0] == "+" || document.querySelector('.form-input').value[0] == "-") {
        document.querySelector('.form-input').value = document.querySelector('.form-input').value.substring(1);
    }
    document.querySelector('.form-input').value = "-" + document.querySelector('.form-input').value;
    document.querySelector('.form-input').focus();
}




function showLoading () {
    let preloader = document.getElementById("preloader");
    preloader.classList.add('display')
}


let preloader = document.getElementById("preloader");
preloader.classList.add('display')
window.addEventListener('load', () => {
    preloader.classList.remove('display')
})

window.onload = function () {
    preloader.classList.remove('display')
}




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
