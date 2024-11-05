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
    const expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + 1 * 60 * 60 * 1000); // Set to expire in 1 hour
    document.cookie = `name=${firstName}; path=/; expires=${expireDate.toUTCString()};`;
    document.cookie = `last_name=${lastName}; path=/; expires=${expireDate.toUTCString()};`;
    redirectBack("redirectAfterLogin");
  } else if (res.message.includes("no_pwd")) {
    alert(
      `Для пользователя ${firstName} ${lastName} еще не установлен пароль, пройдите регистрацию`
    );
    redirectToRegister();
  }
  // https://23f4-213-232-244-8.ngrok-free.app
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
