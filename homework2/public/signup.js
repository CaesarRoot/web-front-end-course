function signup(){
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
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
        if(json['success'] == 'true')
            console.log("注册成功");
        else
            console.log(json['message']);
    });
}