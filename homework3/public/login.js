function login(){
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var pkey = "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAImtZPtXi8IICmWaAM4uBSk1o+KFdgX6MC180rdV7u0TuYthapKJE12cZjdFd/68Ne4qLRJvgu997oOXKs8OsfECAwEAAQ==";
    console.log(username);
    console.log(password);

    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(pkey);
    var encrypted = encrypt.encrypt(password);
    console.log(encrypted);

    var url = 'http://localhost:3000/login'
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
        if(res.status == 200){
            console.log("OK");
            return res.json();
        }
    }).then((json) => {
        if(json['success'] == "true"){
            console.log("登录成功");
            location.href = '/';
        }
        else {
            // Incorrect username or password.
            document.getElementById("message").style.visibility = "visible";
            console.log(json['message']);
        }
    });
}