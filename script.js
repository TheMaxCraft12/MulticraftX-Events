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

if (!currentEvent) {

    alert("❌ Das Event konnte nicht geladen werden.");

    return;
}


if (!currentEvent.registration_open) {

    alert("🔒 Die Anmeldung für dieses Event ist geschlossen.");

    return;
}


const { count, error: countError } =
    await supabaseDB
        .from("anmeldungen")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("event_id", currentEvent.id);


if (countError) {

    console.error(
        "Fehler beim Prüfen der Plätze:",
        countError
    );

    alert(
        "Die freien Plätze konnten nicht geprüft werden."
    );

    return;
}


if (count >= currentEvent.max_participants) {

    alert(
        "❌ Dieses Event ist voll!\n\n" +
        count + " / " +
        currentEvent.max_participants +
        " Plätze belegt."
    );

    return;
}

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
// AKTUELLES EVENT
// ========================================

let currentEvent = null;


// ========================================
// NÄCHSTES EVENT LADEN
// ========================================

async function loadCurrentEvent() {

    const { data, error } = await supabaseDB
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true })
        .limit(1)
        .single();


    if (error) {

        console.error(
            "Fehler beim Laden des Events:",
            error
        );

        return;
    }


    currentEvent = data;


    // ========================================
    // TEXT AUF DER WEBSITE
    // ========================================

    document.getElementById("event-title").textContent =
        "🏁 " + data.title;

    document.getElementById("event-card-title").textContent =
        data.title;

    document.getElementById("event-description").textContent =
        data.description || "";

    document.getElementById("event-card-description").textContent =
        data.description || "";


    // ========================================
    // DATUM
    // ========================================

    const date = new Date(
        data.event_date + "T00:00:00"
    );


    const formattedDate =
        date.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });


    document.getElementById("event-date").textContent =
        formattedDate;


    // ========================================
    // UHRZEIT
    // ========================================

    const time =
        data.event_time.substring(0, 5);


    document.getElementById("event-time").textContent =
        time + " Uhr";


    // ========================================
    // ORT
    // ========================================

    document.getElementById("event-location").textContent =
        data.location || "";


    // ========================================
    // SERVER
    // ========================================

    document.getElementById("event-server").textContent =
        data.server_ip || "";


    // ========================================
    // COUNTDOWN
    // ========================================

    document.getElementById("countdown-date").textContent =
        formattedDate + " • " + time + " Uhr";


    const eventTimestamp =
        new Date(
            data.event_date + "T" + data.event_time
        ).getTime();


    startDatabaseCountdown(eventTimestamp);


    // ========================================
    // TEILNEHMER
    // ========================================

    updateParticipantCount();

}


// ========================================
// COUNTDOWN
// ========================================

function startDatabaseCountdown(eventTimestamp) {

    function updateDatabaseCountdown() {

        const difference =
            eventTimestamp - new Date().getTime();


        if (difference <= 0) {

            document.getElementById(
                "countdown"
            ).textContent =
                "🏁 DAS RENNEN LÄUFT!";

            return;
        }


        const days =
            Math.floor(
                difference /
                (1000 * 60 * 60 * 24)
            );


        const hours =
            Math.floor(
                (
                    difference %
                    (1000 * 60 * 60 * 24)
                ) /
                (1000 * 60 * 60)
            );


        const minutes =
            Math.floor(
                (
                    difference %
                    (1000 * 60 * 60)
                ) /
                (1000 * 60)
            );


        const seconds =
            Math.floor(
                (
                    difference %
                    (1000 * 60)
                ) /
                1000
            );


        document.getElementById(
            "countdown"
        ).textContent =

            `${days}T ` +
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`;
    }


    updateDatabaseCountdown();

    setInterval(
        updateDatabaseCountdown,
        1000
    );
}


// ========================================
// TEILNEHMERZAHL
// ========================================

async function updateParticipantCount() {

    if (!currentEvent) {
        return;
    }


    const { count, error } =
        await supabaseDB
            .from("anmeldungen")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("event_id", currentEvent.id);


    if (error) {

        console.error(
            "Fehler beim Laden der Teilnehmerzahl:",
            error
        );

        return;
    }


    const element =
        document.getElementById(
            "participant-count"
        );


    if (element) {
        element.textContent = count;
    }
}


// ========================================
// EVENT STARTEN
// ========================================

loadCurrentEvent();
