// ========================================
// SERVER
// ========================================

const serverIP = "MulticraftXY.aternos.me";


// ========================================
// SERVER-IP KOPIEREN
// ========================================

function copyIP() {

    navigator.clipboard.writeText(serverIP);

    alert("Server-IP kopiert:\n" + serverIP);
}


// ========================================
// COUNTDOWN
// ========================================

// 15. Dezember 2026 um 14:30 Uhr
const eventDate = new Date("2026-12-15T14:30:00").getTime();


function updateCountdown() {

    const now = new Date().getTime();

    const difference = eventDate - now;


    // Event hat begonnen
    if (difference <= 0) {

        document.getElementById("countdown").textContent =
            "🏁 DAS RENNEN LÄUFT!";

        return;
    }


    const days =
        Math.floor(
            difference / (1000 * 60 * 60 * 24)
        );


    const hours =
        Math.floor(
            (difference % (1000 * 60 * 60 * 24))
            / (1000 * 60 * 60)
        );


    const minutes =
        Math.floor(
            (difference % (1000 * 60 * 60))
            / (1000 * 60)
        );


    const seconds =
        Math.floor(
            (difference % (1000 * 60))
            / 1000
        );


    document.getElementById("countdown").textContent =
        `${days}T ` +
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;
}


// Countdown jede Sekunde aktualisieren
setInterval(updateCountdown, 1000);

updateCountdown();


// ========================================
// ANMELDUNG
// ========================================

const form = document.querySelector("form");


form.addEventListener("submit", function(event) {

    event.preventDefault();


    const minecraftName =
        document.getElementById("minecraft-name").value;

    const discordName =
        document.getElementById("discord-name").value;


    if (!minecraftName || !discordName) {

        alert("Bitte fülle alle Felder aus.");

        return;
    }


    alert(
        "Anmeldung vorbereitet!\n\n" +
        "Minecraft: " + minecraftName +
        "\nDiscord: " + discordName
    );

});
