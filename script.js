// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
    "https://hdbgpedywtsiazbawbao.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Ab0ub7SN99UIjDdXCdSNNw_4FSlDmDa";

const supabaseDB =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ========================================
// SERVER
// ========================================

const serverIP =
    "MulticraftXY.aternos.me";


// ========================================
// AKTUELLES EVENT
// ========================================

let currentEvent = null;


// ========================================
// SERVER-IP KOPIEREN
// ========================================

function copyIP() {

    navigator.clipboard.writeText(serverIP);

    alert(
        "Server-IP kopiert:\n" +
        serverIP
    );
}


// ========================================
// NÄCHSTES EVENT LADEN
// ========================================

async function loadCurrentEvent() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const { data, error } =
        await supabaseDB
            .from("events")
            .select("*")
            .gte("event_date", today)
            .order("event_date", {
                ascending: true
            })
            .order("event_time", {
                ascending: true
            })
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
    // EVENT-TITEL
    // ========================================

    const eventTitle =
        document.getElementById(
            "event-title"
        );

    if (eventTitle) {

        eventTitle.textContent =
            "🏁 " + data.title;
    }


    const cardTitle =
        document.getElementById(
            "event-card-title"
        );

    if (cardTitle) {

        cardTitle.textContent =
            data.title;
    }


    // ========================================
    // BESCHREIBUNG
    // ========================================

    const description =
        document.getElementById(
            "event-description"
        );

    if (description) {

        description.textContent =
            data.description || "";
    }


    const cardDescription =
        document.getElementById(
            "event-card-description"
        );

    if (cardDescription) {

        cardDescription.textContent =
            data.description || "";
    }


    // ========================================
    // DATUM
    // ========================================

    const date =
        new Date(
            data.event_date +
            "T00:00:00"
        );


    const formattedDate =
        date.toLocaleDateString(
            "de-DE",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );


    const dateElement =
        document.getElementById(
            "event-date"
        );

    if (dateElement) {

        dateElement.textContent =
            formattedDate;
    }


    // ========================================
    // UHRZEIT
    // ========================================

    const time =
        data.event_time.substring(
            0,
            5
        );


    const timeElement =
        document.getElementById(
            "event-time"
        );

    if (timeElement) {

        timeElement.textContent =
            time + " Uhr";
    }


    // ========================================
    // ORT
    // ========================================

    const locationElement =
        document.getElementById(
            "event-location"
        );

    if (locationElement) {

        locationElement.textContent =
            data.location || "";
    }


    // ========================================
    // SERVER
    // ========================================

    const serverElement =
        document.getElementById(
            "event-server"
        );

    if (serverElement) {

        serverElement.textContent =
            data.server_ip || "";
    }


    // ========================================
    // COUNTDOWN-DATUM
    // ========================================

    const countdownDate =
        document.getElementById(
            "countdown-date"
        );

    if (countdownDate) {

        countdownDate.textContent =
            formattedDate +
            " • " +
            time +
            " Uhr";
    }


    // ========================================
    // COUNTDOWN STARTEN
    // ========================================

    const eventTimestamp =
        new Date(
            data.event_date +
            "T" +
            data.event_time
        ).getTime();


    startCountdown(
        eventTimestamp
    );


    // ========================================
    // TEILNEHMER
    // ========================================

    updateParticipantCount();
}


// ========================================
// COUNTDOWN
// ========================================

function startCountdown(
    eventTimestamp
) {

    function update() {

        const difference =
            eventTimestamp -
            new Date().getTime();


        const countdown =
            document.getElementById(
                "countdown"
            );


        if (!countdown) {
            return;
        }


        if (difference <= 0) {

            countdown.textContent =
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


        countdown.textContent =
            `${days}T ` +
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`;
    }


    update();

    setInterval(
        update,
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
            .eq(
                "event_id",
                currentEvent.id
            );


    if (error) {

        console.error(
            "Fehler beim Laden der Teilnehmerzahl:",
            error
        );

        return;
    }


    const countElement =
        document.getElementById(
            "participant-count"
        );


    if (countElement) {

        countElement.textContent =
            count;
    }


    const maxElement =
        document.getElementById(
            "participant-max"
        );


    if (maxElement) {

        maxElement.textContent =
            currentEvent.max_participants;
    }


    // Button deaktivieren,
    // wenn das Event voll ist

    const form =
        document.querySelector("form");


    if (form) {

        const button =
            form.querySelector(
                "button"
            );


        if (button) {

            if (
                count >=
                currentEvent.max_participants
            ) {

                button.disabled = true;

                button.textContent =
                    "🚫 Rennen voll";

            } else {

                button.disabled = false;

                button.textContent =
                    "🏁 Anmeldung abschicken";
            }
        }
    }
}


// ========================================
// ANMELDUNG
// ========================================

const form =
    document.querySelector("form");


if (form) {

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // Kein Event vorhanden

            if (!currentEvent) {

                alert(
                    "❌ Das Event konnte nicht geladen werden."
                );

                return;
            }


            // Anmeldung geschlossen

            if (
                !currentEvent.registration_open
            ) {

                alert(
                    "🔒 Die Anmeldung für dieses Event ist geschlossen."
                );

                return;
            }


            const minecraftName =
                document
                    .getElementById(
                        "minecraft-name"
                    )
                    .value
                    .trim();


            const discordName =
                document
                    .getElementById(
                        "discord-name"
                    )
                    .value
                    .trim();


            if (
                !minecraftName ||
                !discordName
            ) {

                alert(
                    "Bitte fülle alle Felder aus."
                );

                return;
            }


            // ========================================
            // PLÄTZE PRÜFEN
            // ========================================

            const {
                count,
                error: countError
            } =
                await supabaseDB
                    .from("anmeldungen")
                    .select("*", {
                        count: "exact",
                        head: true
                    })
                    .eq(
                        "event_id",
                        currentEvent.id
                    );


            if (countError) {

                console.error(
                    countError
                );

                alert(
                    "Die freien Plätze konnten nicht geprüft werden."
                );

                return;
            }


            if (
                count >=
                currentEvent.max_participants
            ) {

                alert(
                    "❌ Dieses Event ist voll!\n\n" +
                    count +
                    " / " +
                    currentEvent.max_participants
                );

                return;
            }


            // ========================================
            // ANMELDUNG SPEICHERN
            // ========================================

            const {
                error
            } =
                await supabaseDB
                    .from("anmeldungen")
                    .insert([
                        {
                            minecraft_name:
                                minecraftName,

                            discord_name:
                                discordName,

                            event_id:
                                currentEvent.id
                        }
                    ]);


            if (error) {

                console.error(
                    "Supabase Fehler:",
                    error
                );

                alert(
                    "❌ Die Anmeldung konnte nicht gespeichert werden.\n\n" +
                    error.message
                );

                return;
            }


            alert(
                "✅ Erfolgreich angemeldet!\n\n" +
                "Minecraft: " +
                minecraftName +
                "\nDiscord: " +
                discordName
            );


            form.reset();


            // Teilnehmerzahl aktualisieren

            updateParticipantCount();

        }
    );
}


// ========================================
// START
// ========================================

loadCurrentEvent();
