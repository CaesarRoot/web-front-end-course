function check(username, password){
    if(username.trim().length == 0){
        document.getElementById("empty").style.visibility = "visible";
        document.getElementById("already").style.visibility = "hidden";
        document.getElementById("capital").style.visibility = "hidden";
        document.getElementById("lower").style.visibility = "hidden";
        document.getElementById("length").style.visibility = "hidden";
        document.getElementById("capital").style.visibility = "hidden";
        document.getElementById("lower").style.visibility = "hidden";
        return false;
    }
    if(password.length<8){
        document.getElementById("length").style.visibility = "visible";
        document.getElementById("capital").style.visibility = "hidden";
        document.getElementById("lower").style.visibility = "hidden";
        document.getElementById("empty").style.visibility = "hidden";
        document.getElementById("already").style.visibility = "hidden";
        return false;
    }
    var reg = /[ABCDEFGHIJKLMNOPQRSTUVWXYZ]+/;
    if(!reg.test(password)){
        document.getElementById("capital").style.visibility = "visible";
        document.getElementById("length").style.visibility = "hidden";
        document.getElementById("lower").style.visibility = "hidden";
        document.getElementById("empty").style.visibility = "hidden";
        document.getElementById("already").style.visibility = "hidden";
        return false;
    }
    reg = /[abcdefghijklmnopqrstuvwxyz]+/;
    if(!reg.test(password)){
        document.getElementById("lower").style.visibility = "visible";
        document.getElementById("length").style.visibility = "hidden";
        document.getElementById("capital").style.visibility = "hidden";
        document.getElementById("empty").style.visibility = "hidden";
        document.getElementById("already").style.visibility = "hidden";
        return false;
    }
    return true;
};

function signup(){
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    
    if(!check(username, password)){
        return;
    }

    var pkey = "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAImtZPtXi8IICmWaAM4uBSk1o+KFdgX6MC180rdV7u0TuYthapKJE12cZjdFd/68Ne4qLRJvgu997oOXKs8OsfECAwEAAQ==";
    console.log(username);
    console.log(password);

    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(pkey);
    var encrypted = encrypt.encrypt(password);
    console.log(encrypted);

    var url = 'http://localhost:3000/signup'
    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: encrypted,
        })
    }).then((res) => {
        return res.json();
    }).then((json)=>{
        if(json['success'] == 'true'){
            console.log("注册成功");
            location.href = '/login';
        }
        else{
            document.getElementById("lower").style.visibility = "hidden";
            document.getElementById("length").style.visibility = "hidden";
            document.getElementById("capital").style.visibility = "hidden";
            document.getElementById("empty").style.visibility = "hidden";
            document.getElementById("already").style.visibility = "visible";
        }
    });
}