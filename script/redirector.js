async function checkIsUserLogined(page) {
  const userName = localStorage.getItem("name");
  const userLastName = localStorage.getItem("last_name");
  if (!userName || !userLastName) {
    redirectToLogin();
  } else {
    const isPermited = await checkUserPeremission(page);
    if (!isPermited) {
      alert(
        "Данный пользователь не имеет достаточных прав на просмотр данной страницы"
      );
      window.location.href = "/index.html";
    }
  }
}

async function checkUserPeremission(page) {
  const firstName = localStorage.getItem("name");
  const lastName = localStorage.getItem("last_name");

  const res = await (
    await fetch(BASE_URL + "/check_user_permission/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: firstName,
        last_name: lastName,
      }),
    })
  ).json();

  if (res.status) {
    const permissions = parseUserPermissions(res.permissions);
    switch (page) {
      case "warehouse_manager":
        return checkWarehouseManagerPermission(permissions);
      case "installation_team":
        return checkInstallationTeamPermission(permissions);
      default:
        return false;
    }
  }
}

function checkWarehouseManagerPermission(permissions) {
  if (permissions === "all") return true;
  else if (permissions === "warehouse_manager") return true;
  else return false;
}

function checkInstallationTeamPermission(permissions) {
  if (permissions === "all") return true;
  else if (permissions === "installation_team") return true;
  else return false;
}

function parseUserPermissions(permissions) {
  if (
    permissions.includes("warehouse_manager") &&
    permissions.includes("installation_team")
  ) {
    return "all";
  } else if (permissions.includes("warehouse_manager")) {
    return "warehouse_manager";
  } else if (permissions.includes("installation_team")) {
    return "installation_team";
  } else {
    return "none";
  }
}

function redirectBack(pathKey) {
  const redirectUrl = localStorage.getItem(pathKey);
  localStorage.removeItem(pathKey);
  window.location.href = redirectUrl;
}

function redirectToLogin() {
  localStorage.setItem("redirectAfterLogin", window.location.pathname);
  alert("Необходимо войти в систему!");
  window.location.href = "/pages/login.html";
}

function redirectToRegister() {
  localStorage.setItem("redirectAfterRegister", window.location.pathname);
  window.location.href = "/pages/register.html";
}

function logOut() {
  if (!confirm("Вы уверены, что хотите выйти?"))
    return;
  if (localStorage.getItem("name"))
    localStorage.removeItem("name");
  if (localStorage.getItem("last_name"))
    localStorage.removeItem("last_name");

  localStorage.setItem("redirectAfterLogin", window.location.pathname)
  window.location.href = "/pages/login.html";
}
