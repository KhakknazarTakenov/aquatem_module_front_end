const INSTALLATION_TEAM_DEPARTMENT = 27;
const WAREHOUSE_MANAGER_DEPARTMENT = 45;
const BASE_URL = "https://storerobots.gamechanger.kz/montajniki";

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

function formatToDateInput(value) {
    const date = new Date(value);
    return date.toISOString().split('T')[0];
}

