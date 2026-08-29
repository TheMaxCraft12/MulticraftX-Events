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

            const racingCompanyId =
    document
        .getElementById(
            "racing-company"
        )
        .value;

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
                                currentEvent.id,

                            racing_company_id:
                                 Number(racingCompanyId)
                        }
                    ]);


          if (error) {

    console.error(
        "Supabase Fehler:",
        error
    );


    // Rennfirma bereits vergeben

    if (
        error.code === "23505"
    ) {

        alert(
            "❌ Diese Rennfirma ist bereits vergeben!\n\n" +
            "Bitte wähle eine andere Rennfirma."
        );

        return;
    }


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
// RENN FIRMEN VERFÜGBARKEIT
// ========================================

async function updateRacingCompanies() {

    if (!currentEvent) {
        return;
    }


    const select =
        document.getElementById(
            "racing-company"
        );


    if (!select) {
        return;
    }


    const { data, error } =
        await supabaseDB
            .from("anmeldungen")
            .select("racing_company_id")
            .eq(
                "event_id",
                currentEvent.id
            );


    if (error) {

        console.error(
            "Fehler beim Laden der Rennfirmen:",
            error
        );

        return;
    }


    const usedCompanies =
        data.map(
            row =>
                Number(
                    row.racing_company_id
                )
        );


    Array.from(
        select.options
    ).forEach(option => {

        if (!option.value) {
            return;
        }


        const companyId =
            Number(option.value);


        if (
            usedCompanies.includes(
                companyId
            )
        ) {

            option.disabled = true;

            option.textContent =
                option.textContent
                .replace(
                    " – VERGEBEN",
                    ""
                ) +
                " – VERGEBEN";

        } else {

            option.disabled = false;

            option.textContent =
                option.textContent
                .replace(
                    " – VERGEBEN",
                    ""
                );
        }

    });

}

// ========================================
// VOTE SYSTEM
// ========================================

let currentUser = null;


// ========================================
// ANONYMEN BENUTZER ANMELDEN
// ========================================

async function setupVoting() {

    const {
        data,
        error
    } = await supabaseDB.auth.signInAnonymously();


    if (error) {

        console.error(
            "Fehler bei der anonymen Anmeldung:",
            error
        );

        return;
    }


    currentUser =
        data.user;


    loadVoteParticipants();
}


// ========================================
// TEILNEHMER FÜR VOTE LADEN
// ========================================

async function loadVoteParticipants() {

    if (!currentEvent) {
        return;
    }


    const voteList =
        document.getElementById(
            "vote-list"
        );


    if (!voteList) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseDB
            .from("anmeldungen")
            .select(
                "id, minecraft_name"
            )
            .eq(
                "event_id",
                currentEvent.id
            )
            .order(
                "minecraft_name"
            );


    if (error) {

        console.error(
            "Fehler beim Laden der Fahrer:",
            error
        );

        voteList.textContent =
            "❌ Fahrer konnten nicht geladen werden.";

        return;
    }


    if (!data || data.length === 0) {

        voteList.textContent =
            "Noch keine Fahrer angemeldet.";

        return;
    }


    voteList.innerHTML = "";


    data.forEach(
        participant => {

            const label =
                document.createElement(
                    "label"
                );


            label.style.display =
                "block";

            label.style.margin =
                "10px 0";


            label.innerHTML = `
                <input
                    type="radio"
                    name="vote"
                    value="${participant.id}"
                >
                🏎️ ${participant.minecraft_name}
            `;


            voteList.appendChild(
                label
            );
        }
    );


    checkIfAlreadyVoted();
}


// ========================================
// PRÜFEN, OB SCHON ABGESTIMMT
// ========================================

async function checkIfAlreadyVoted() {

    if (
        !currentUser ||
        !currentEvent
    ) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseDB
            .from("votes")
            .select("id")
            .eq(
                "event_id",
                currentEvent.id
            )
            .eq(
                "voter_id",
                currentUser.id
            )
            .maybeSingle();


    if (error) {

        console.error(
            "Fehler beim Prüfen des Votes:",
            error
        );

        return;
    }


    if (data) {

        const button =
            document.getElementById(
                "vote-button"
            );


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "✅ Du hast bereits abgestimmt";
        }

    }
}


// ========================================
// VOTE ABSCHICKEN
// ========================================

document
    .getElementById("vote-button")
    ?.addEventListener(
        "click",
        async function() {

            if (
                !currentUser ||
                !currentEvent
            ) {

                alert(
                    "❌ Das Voting ist noch nicht bereit."
                );

                return;
            }


            const selected =
                document.querySelector(
                    'input[name="vote"]:checked'
                );


            if (!selected) {

                alert(
                    "Bitte wähle zuerst einen Fahrer aus."
                );

                return;
            }


            const participantId =
                Number(
                    selected.value
                );


            const {
                error
            } =
                await supabaseDB
                    .from("votes")
                    .insert([
                        {
                            event_id:
                                currentEvent.id,

                            voter_id:
                                currentUser.id,

                            participant_id:
                                participantId
                        }
                    ]);


            if (error) {

                if (
                    error.code ===
                    "23505"
                ) {

                    alert(
                        "❌ Du hast bereits für dieses Event abgestimmt."
                    );

                    return;
                }


                console.error(
                    "Vote-Fehler:",
                    error
                );


                alert(
                    "❌ Deine Stimme konnte nicht gespeichert werden."
                );

                return;
            }


            alert(
                "✅ Deine Stimme wurde gespeichert!"
            );


            const button =
                document.getElementById(
                    "vote-button"
                );


            button.disabled =
                true;

            button.textContent =
                "✅ Stimme abgegeben";


            loadVoteResults();
        }
    );


// ========================================
// VOTE-ERGEBNISSE
// ========================================

async function loadVoteResults() {

    if (!currentEvent) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseDB
            .from("votes")
            .select(
                "participant_id, anmeldungen(minecraft_name)"
            )
            .eq(
                "event_id",
                currentEvent.id
            );


    if (error) {

        console.error(
            "Fehler beim Laden der Ergebnisse:",
            error
        );

        return;
    }


    const results = {};


    data.forEach(
        vote => {

            const id =
                vote.participant_id;


            if (!results[id]) {

                results[id] = {
                    name:
                        vote.anmeldungen
                            ?.minecraft_name
                            || "Unbekannt",

                    votes: 0
                };
            }


            results[id].votes++;
        }
    );


    const sorted =
        Object.values(results)
            .sort(
                (a, b) =>
                    b.votes -
                    a.votes
            );


    const resultsElement =
        document.getElementById(
            "vote-results"
        );


    if (!resultsElement) {
        return;
    }


    resultsElement.innerHTML =
        "<h3>📊 Aktuelle Ergebnisse</h3>";


    sorted.forEach(
        result => {

            const p =
                document.createElement(
                    "p"
                );


            p.textContent =
                `${result.name}: ${result.votes} Stimme(n)`;


            resultsElement.appendChild(
                p
            );
        }
    );
}

async function startWebsite() {

    await loadCurrentEvent();

    await setupVoting();

}

startWebsite();
