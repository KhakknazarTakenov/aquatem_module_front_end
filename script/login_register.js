async function login() {
  const firstName = document.getElementById("first_name").value.trim();
  const lastName = document.getElementById("last_name").value.trim();
  const password = document.getElementById("password").value.trim();
  const res = await (
    await fetch(BASE_URL + "/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: firstName,
        last_name: lastName,
        password: password,
      }),
    })
  ).json();
  if (res.status) {
    localStorage.setItem('name', firstName)
    localStorage.setItem('last_name', lastName)
    redirectBack("redirectAfterLogin");
  } else if (res.message.includes("no_pwd")) {
    alert(
      `Для пользователя ${firstName} ${lastName} еще не установлен пароль, пройдите регистрацию`
    );
    redirectToRegister();
  } else {
	alert("Имя пользователя или пароль не совпадают")
  }
}

async function register() {
  const firstName = document.getElementById("first_name").value.trim();
  const lastName = document.getElementById("last_name").value.trim();
  const password = document.getElementById("password").value.trim();
  const res = await (
    await fetch(BASE_URL + "/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: firstName,
        last_name: lastName,
        password: password,
      }),
    })
  ).json();
  if (res.status) {
    redirectBack("redirectAfterRegister");
  } else {
    console.log(res);
    alert("Ошибка при регистрации, повторите попытку");
  }
}
