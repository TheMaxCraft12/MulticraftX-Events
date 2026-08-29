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

// ========================================
// FREIE PLÄTZE PRÜFEN
// ========================================

const { count, error: countError } = await supabaseDB
    .from("anmeldungen")
    .select("*", { count: "exact", head: true });

if (countError) {
    console.error("Fehler beim Prüfen der Plätze:", countError);

    alert("Die freien Plätze konnten nicht geprüft werden.");
    return;
}

if (count >= 20) {
    alert("❌ Das Rennen ist voll! Es gibt keine freien Plätze mehr.");
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
   
    // Teilnehmerzahl sofort aktualisieren
    updateParticipantCount();
    
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

async function updateParticipantCount() {

    const { count, error } = await supabaseDB
        .from("anmeldungen")
        .select("*", { count: "exact", head: true });

    if (error) {
        console.error("Fehler beim Laden der Teilnehmerzahl:", error);
        return;
    }

    const participantCount = document.getElementById("participant-count");
    const submitButton = form.querySelector("button");

    participantCount.textContent = count;

    if (count >= 20) {

        submitButton.disabled = true;
        submitButton.textContent = "🚫 Rennen voll";

    } else {

        submitButton.disabled = false;
        submitButton.textContent = "🏁 Anmeldung abschicken";
    }
}

// ========================================
// EVENT-DATEN AUS SUPABASE
// ========================================

async function loadEventSettings() {

    const { data, error } = await supabaseDB
        .from("event_settings")
        .select("*")
        .eq("id", 1)
        .single();

    if (error) {
        console.error("Fehler beim Laden des Events:", error);
        return;
    }

    // Titel
    document.getElementById("event-title").textContent =
        "🏁 " + data.title;

    document.getElementById("event-card-title").textContent =
        data.title;

    // Beschreibung
    document.getElementById("event-description").textContent =
        data.description;

    document.getElementById("event-card-description").textContent =
        data.description;

    // Datum
    const date = new Date(data.event_date + "T00:00:00");

    const formattedDate = date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    document.getElementById("event-date").textContent =
        formattedDate;

    // Uhrzeit
    document.getElementById("event-time").textContent =
        data.event_time.substring(0, 5) + " Uhr";

    // Ort
    document.getElementById("event-location").textContent =
        data.location;

    // Server
    document.getElementById("event-server").textContent =
        data.server_ip;

    // Countdown-Anzeige
    document.getElementById("countdown-date").textContent =
        formattedDate + " • " +
        data.event_time.substring(0, 5) + " Uhr";

    // Countdown-Zeit aktualisieren
    const eventDateFromDB =
        new Date(
            data.event_date + "T" +
            data.event_time
        ).getTime();

    startDatabaseCountdown(eventDateFromDB);
}


// ========================================
// COUNTDOWN AUS EVENT-DATENBANK
// ========================================

function startDatabaseCountdown(eventTimestamp) {

    function updateDatabaseCountdown() {

        const now = new Date().getTime();

        const difference =
            eventTimestamp - now;

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

    updateDatabaseCountdown();

    setInterval(updateDatabaseCountdown, 1000);
}


// Event laden
loadEventSettings();
