var reg = document.querySelector("form");
reg.addEventListener("submit", register);

function register(e)
{
    e.preventDefault();

    var password = document.getElementById("inputPassword");
    var passRepeat = document.getElementById("inputPasswordRepeat");
    if(password.value != passRepeat.value)
    {
        alert("Passwords are different!");
        return;
    }    
    var name = document.getElementById("inputUsername");
    var email = document.getElementById("inputEmail");

    const Url = "https://fathomless-chamber-33667.herokuapp.com/api/users";

    var data =  
    {
        email: email.value, 
        name: name.value, 
        password: password.value
    };

    const params = 
    {
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
        method: 'POST'
    };
    fetch(Url, params)
        .then(res => 
        {
            if(res.ok)
            {
                alert("User created succesfully!");
                document.location.href = "index.html";
            }          
            else
                alert("Something went wrong :(");
        })
        .catch(error => alert("Something went wrong :("));
}
