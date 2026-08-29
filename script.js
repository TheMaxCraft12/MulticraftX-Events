// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL = "https://hdbgpedywtsiazbawbao.supabase.co";

const SUPABASE_KEY = "sb_publishable_Ab0ub7SN99UIjDdXCdSNNw_4FSlDmDa";

const supabaseDB = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

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

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const minecraftName =
        document.getElementById("minecraft-name").value.trim();

    const discordName =
        document.getElementById("discord-name").value.trim();


    if (!minecraftName || !discordName) {

        alert("Bitte fülle alle Felder aus.");

        return;
    }


    // Teilnehmer in Supabase speichern
    const { data, error } = await supabaseDB
        .from("anmeldungen")
        .insert([
            {
                minecraft_name: minecraftName,
                discord_name: discordName
            }
        ]);


    if (error) {

        console.error("Supabase Fehler:", error);

        alert(
            "Die Anmeldung konnte nicht gespeichert werden.\n\n" +
            "Fehler: " + error.message
        );

        return;
    }


    alert(
        "✅ Erfolgreich angemeldet!\n\n" +
        "Minecraft: " + minecraftName +
        "\nDiscord: " + discordName
    );


    form.reset();

});

// ========================================
// TEILNEHMERZAHL
// ========================================

async function updateParticipantCount() {

    const { count, error } = await supabaseDB
        .from("anmeldungen")
        .select("*", { count: "exact", head: true });

    if (error) {
        console.error("Fehler beim Laden der Teilnehmerzahl:", error);
        return;
    }

    document.getElementById("participant-count").textContent = count;
}

updateParticipantCount();
