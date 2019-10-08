class Board
{
    constructor(id, name, admin, lists, title = "", description = "")
    {
        this.id = id
        this.name = name;
        this.title = title;
        this.description = description;
        this.admin = admin;
        this.lists = lists;
        this.load();
    }
    load()
    {
        this.lists.forEach(item =>
        {
            var sibling = document.getElementById("newBoardButton");
            var newList = document.createElement("div");
            newList.id = item._id;
            newList.className += "card list-group-flush m-3";
            newList.innerHTML = `<div class="card-header d-flex justify-content-between align-items-center"><h3 class="card-title"><input type="text" onkeypress="changeName(event)" class="form-control-plaintext" value=${item.title}></h3><button type="button" class="btn btn-danger deleteBlock" onclick="deleteList(event)">X</button></div><ul ondrop="drop(event)" ondragover="allowDrop(event)" class="list-group"><button type="button" class="list-group-item list-group-item-success list-group-item-action addTask" onclick="addNewCard(event)">+ Add task</button></ul>`;
            sibling.parentNode.insertBefore(newList, sibling);

            item.cards.forEach(x =>
            {
                var newCard = document.createElement("li");
                newCard.addEventListener("dragstart", function(event){drag(event);});
                newCard.setAttribute("draggable", true);
                newCard.id = x._id;
                newCard.className += "list-group-item d-flex justify-content-between align-items-center";
                newCard.innerHTML = `<textarea onkeypress="changeTaskText(event)" onmouseenter="autoGrow(this)" onmouseleave="shrinkToDefault(this)" class="form-control-plaintext">${x.description || "Example task"}</textarea>
                    <button type="button" class="btn btn-outline-danger btn-sm ml-2 deleteItem" onclick="deleteCard(event)">X</button>`;
                newList.children[1].insertBefore(newCard, newList.children[1].lastChild);
            });
        });
    }
}

var boards = [];
loadBoard();
getUsername();

function loadBoard()
{
    const Url = "https://fathomless-chamber-33667.herokuapp.com/api/boards";

    const params = 
    {
        headers: 
        {
            'Content-Type': 'application/json',
            "x-auth-token": localStorage.getItem('jwt')   
        },
        method: 'GET'
    };
    fetch(Url, params)
        .then(res => 
        {   
            if(res.ok)
                return res.json();
            else
            {
                alert("Something went wrong :(");
                return;
            }
        })
        .then(response => 
        {
            if(response.length == 0)
            {
                createNewBoard();
                return;
            }
            document.getElementById("mainContainer").innerHTML = '<button type="button" class="btn btn-success m-3 newBoard" id="newBoardButton" onclick="addList()"><h3>+ Add board</h3></button>';
            response.forEach(item => 
            {          
                boards.push(new Board(item._id, item.name, item.admin, item.lists))
            })

            document.getElementById("boardName").value = response[0].title;
        })
        .catch(error => console.log(error));
}

function addList()
{
    const Url = `https://fathomless-chamber-33667.herokuapp.com/api/boards/${boards[0].id}`;

    var data =  
    { 
        title: `NewList${boards[0].lists.length + 1}`
    };

    const params = 
    {
        headers: 
        {
            'Content-Type': 'application/json',
            "x-auth-token": localStorage.getItem('jwt')   
        },
        body: JSON.stringify(data),
        method: 'POST'
    };
    fetch(Url, params)
        .then(res => 
        {                 
            if(!res.ok)
            {
                alert("Something went wrong :(");
                return;
            }
            else
            {
                boards = [];
                loadBoard();
            }
        })
        .catch(error => console.log(error));
    
}

function deleteCard(e)
{
    var card = e.target.parentNode;
    var cardIndex = Array.prototype.indexOf.call(card.parentNode.children, card);
    var list = card.parentNode.parentNode;
    var listIndex = Array.prototype.indexOf.call(list.parentNode.children, list);
    const Url = `https://fathomless-chamber-33667.herokuapp.com/api/lists/${boards[0].lists[listIndex]._id}/${boards[0].lists[listIndex].cards[cardIndex]._id}`;

    const params = 
    {
        headers: 
        {
            'Content-Type': 'application/json',
            "x-auth-token": localStorage.getItem('jwt')   
        },
        method: 'DELETE'
    };

    fetch(Url, params)
        .then(res => 
        {   
            if(!res.ok)
            {
                alert("Something went wrong :(");
                return;
            }
        })
        .catch(error => console.log(error));
    boards =[];
    loadBoard();
}

function deleteList(e)
{
    var list = e.target.parentNode.parentNode;
    var listIndex = Array.prototype.indexOf.call(list.parentNode.children, list);
    console.log(boards[0].lists[listIndex]._id);
    const Url = `https://fathomless-chamber-33667.herokuapp.com/api/lists/${boards[0].lists[listIndex]._id}`;

    const params = 
    {
        headers: 
        {
            'Content-Type': 'application/json',
            "x-auth-token": localStorage.getItem('jwt')   
        },
        method: 'DELETE'
    };

    fetch(Url, params)
        .then(res => 
        {   
            if(res.ok)
            {
                list.parentNode.removeChild(list);
                boards[0].lists.splice(listIndex, 1);
            }
            else
            {
                alert("Something went wrong :(");
                return;
            }
        })
        .catch(error => console.log(error));
}

function createNewBoard()
{
    const Url = "https://fathomless-chamber-33667.herokuapp.com/api/boards";

    const data =
    {
        name: localStorage.getItem('mail'),
        admin: localStorage.getItem('mail'),
        title: localStorage.getItem('mail')
    }
    const params = 
    {
        headers: 
        {
            'Content-Type': 'application/json',
            "x-auth-token": localStorage.getItem('jwt')   
        },
        body: JSON.stringify(data),
        method: 'POST'
    };
    fetch(Url, params)
        .then(res => 
        {   
            if(res.ok)
                loadBoard();
            else
            {
                alert("Something went wrong :(");
                return;
            }
        })
        .catch(error => console.log(error));
}

function addNewCard(e)
{
    var list = e.target.parentNode.parentNode;
    var listIndex = Array.prototype.indexOf.call(list.parentNode.children, list);

    const Url = `https://fathomless-chamber-33667.herokuapp.com/api/lists/${boards[0].lists[listIndex]._id}`;

    const data =
    {
        title: "card",
        description: "Empty task"
    }
    const params = 
    {
        headers: 
        {
            'Content-Type': 'application/json',
            "x-auth-token": localStorage.getItem('jwt')   
        },
        body: JSON.stringify(data),
        method: 'POST'
    };
    fetch(Url, params)
        .then(res => 
        {   
            if(res.ok)
                loadBoard();
            else
            {
                alert("Something went wrong :(");
                return;
            }
        })
        .catch(error => console.log(error));
}

var defaultHeight = 0;
function autoGrow(element) 
{
    defaultHeight = element.style.height;
    element.style.height = "5px";
    element.style.height = (element.scrollHeight) + "px";
}

function shrinkToDefault(element)
{
    element.style.height = defaultHeight;
}

function changeTaskText(event)
{
    if(event.keyCode == 13 && !event.shiftKey)
    {
        event.preventDefault();

        var card = event.target.parentNode;
        var cardIndex = Array.prototype.indexOf.call(card.parentNode.children, card);
        var list = card.parentNode.parentNode;
        var listIndex = Array.prototype.indexOf.call(list.parentNode.children, list);

        const Url = `https://fathomless-chamber-33667.herokuapp.com/api/cards/${boards[0].lists[listIndex].cards[cardIndex]._id}`;

        const data =
        {
            description: event.target.value,
            title: "title"
        }
        const params = 
        {
            headers: 
            {
                'Content-Type': 'application/json',
                "x-auth-token": localStorage.getItem('jwt')   
            },
            body: JSON.stringify(data),
            method: 'PUT'
        };
        fetch(Url, params)
            .then(res => 
            {   
                if(!res.ok)
                {
                    alert("Something went wrong :(");
                    return;
                }
            })
            .catch(error => console.log(error));
    }
}

function changeBoardName(event)
{
    if(event.keyCode == 13 && !event.shiftKey)
    {
        event.preventDefault();

        const Url = `https://fathomless-chamber-33667.herokuapp.com/api/boards/${boards[0].id}`;

        const data =
        {
            title: event.target.value
        }
        const params = 
        {
            headers: 
            {
                'Content-Type': 'application/json',
                "x-auth-token": localStorage.getItem('jwt')   
            },
            body: JSON.stringify(data),
            method: 'PUT'
        };
        fetch(Url, params)
            .then(res => 
            {   
                if(!res.ok)
                {
                    alert("Something went wrong :(");
                    return;
                }
            })
            .catch(error => console.log(error));
    }
}

function changeName(event)
{
    if(event.keyCode == 13 && !event.shiftKey)
    {
        event.preventDefault();
        var list = event.target.parentNode.parentNode;
        var listIndex = Array.prototype.indexOf.call(list.parentNode.children, list);

        const Url = `https://fathomless-chamber-33667.herokuapp.com/api/lists/${boards[0].lists[listIndex]._id}`;

        const data =
        {
            title: event.target.value
        }
        const params = 
        {
            headers: 
            {
                'Content-Type': 'application/json',
                "x-auth-token": localStorage.getItem('jwt')   
            },
            body: JSON.stringify(data),
            method: 'PUT'
        };
        fetch(Url, params)
            .then(res => 
            {   
                if(!res.ok)
                {
                    alert("Something went wrong :(");
                    return;
                }
            })
            .catch(error => console.log(error));
    }
}

function getUsername()
{
    const Url = "https://fathomless-chamber-33667.herokuapp.com/api/auth/me";

    const params = 
    {
        headers: 
        {
            'Content-Type': 'application/json',
            "x-auth-token": localStorage.getItem('jwt')   
        },
        method: 'GET'
    };
    fetch(Url, params)
        .then(res => 
        {   
            if(res.ok)
            {
                return res.json();
            }
            else
            {
                alert("Something went wrong :(");
            }
        })
        .then(response => 
        {
            document.getElementById("user").innerHTML = response.name;
            localStorage.setItem('user', response.name);
        })
        .catch(error => console.log(error));
}

function logout()
{
    document.location.href = "index.html";
    localStorage.removeItem('email');
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
}

function allowDrop(ev) 
{
    ev.preventDefault();
}
  
function drag(ev) 
{
    ev.dataTransfer.setData("text", ev.target.id);
}
  
function drop(ev) 
{
    ev.preventDefault();
    var event = ev.target;
    var data = ev.dataTransfer.getData("text");
    while(event.className != "list-group")
        event = event.parentNode;
    event.insertBefore(document.getElementById(data), event.lastChild);
    const Url = `https://fathomless-chamber-33667.herokuapp.com/api/lists/${event.parentNode.id}/${data}`;

    const params = 
    {
        headers: 
        {
            'Content-Type': 'application/json',
            "x-auth-token": localStorage.getItem('jwt')   
        },
        method: 'PUT'
    };
    fetch(Url, params)
        .then(res => 
        {   
            if(!res.ok)
            {
                alert("Something went wrong :(");
                return;
            }
            else
            {
                boards = [];
                loadBoard();
            }
        })
        .catch(error => console.log(error));
}