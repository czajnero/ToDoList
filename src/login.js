var log = document.querySelector("form");
log.addEventListener("submit", login);

function login(e)
{
    e.preventDefault();

    var password = document.getElementById("inputPassword");   
    var email = document.getElementById("inputEmail");

    const Url = "https://fathomless-chamber-33667.herokuapp.com/api/auth";

    var data =  
    {
        email: email.value, 
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
                res.text().then(text => 
                {
                    localStorage.setItem('jwt', text);
                    localStorage.setItem('mail', email.value);
                    document.location.href = "app.html";
                })
            }
            else
            {
                alert("Invalid e-mail or password");
                log.reset();
                return;
            }
        })
        .catch(error => alert(error));
}