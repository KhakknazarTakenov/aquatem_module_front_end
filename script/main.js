window.addEventListener("load", async () => {
    const currentUser = await getCurrentUser();
    console.log(currentUser)
    const userDepartment = currentUser.departments.find(department => Number(department) === INSTALLATION_TEAM_DEPARTMENT || Number(department) === WAREHOUSE_MANAGER_DEPARTMENT);

    const currentPage = window.location.pathname;
    const currentPageName = currentPage.split("/").pop();

    const accessRules = {
        [INSTALLATION_TEAM_DEPARTMENT]: "installation_team.html",
        [WAREHOUSE_MANAGER_DEPARTMENT]: "warehouse_manager.html",
    };

    if (accessRules[userDepartment] && accessRules[userDepartment] !== currentPageName) {
        window.location.href = accessRules[userDepartment];
    }
})




/*
    Монтажники - UF_DEPARTMENT: 27 installation_team
    Зав. Склада - UF_DEPARTMENT: 45 warehouse_manager
*/