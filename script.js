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
// VARIABLEN
// ========================================

let currentEvent = null;
let currentUser = null;


// ========================================
// SERVER-IP KOPIEREN
// ========================================

function copyIP() {

    navigator.clipboard.writeText(
        serverIP
    );

    alert(
        "Server-IP kopiert:\n" +
        serverIP
    );
}


// ========================================
// AKTUELLES EVENT LADEN
// ========================================

async function loadCurrentEvent() {

    const {
        data,
        error
    } =
        await supabaseDB
            .from("events")
            .select("*")
            .gte(
                "event_date",
                new Date()
                    .toISOString()
                    .split("T")[0]
            )
            .order(
                "event_date",
                {
                    ascending: true
                }
            )
            .order(
                "event_time",
                {
                    ascending: true
                }
            )
            .limit(1)


    if (error) {

    console.error(
        "Fehler beim Laden des Events:",
        error
    );

    const title =
        document.getElementById(
            "event-title"
        );

    if (title) {
        title.textContent =
            "❌ Event konnte nicht geladen werden: " +
            error.message;
    }

    return;
}


    currentEvent = data[0];


    // ========================================
    // EVENT-TEXTE
    // ========================================

    const eventTitle =
        document.getElementById(
            "event-title"
        );

    const cardTitle =
        document.getElementById(
            "event-card-title"
        );

    const description =
        document.getElementById(
            "event-description"
        );

    const cardDescription =
        document.getElementById(
            "event-card-description"
        );


    if (eventTitle) {
        eventTitle.textContent =
            "🏁 " + data.title;
    }

    if (cardTitle) {
        cardTitle.textContent =
            data.title;
    }

    if (description) {
        description.textContent =
            data.description || "";
    }

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
        data.event_time
            .substring(0, 5);


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
    // COUNTDOWN
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


    const eventTimestamp =
        new Date(
            data.event_date +
            "T" +
            data.event_time
        ).getTime();


    startDatabaseCountdown(
        eventTimestamp
    );


    // ========================================
    // TEILNEHMER
    // ========================================

    await updateParticipantCount();


    // ========================================
    // RENN FIRMEN
    // ========================================

    await updateRacingCompanies();
}


// ========================================
// COUNTDOWN
// ========================================

function startDatabaseCountdown(
    eventTimestamp
) {

    function updateDatabaseCountdown() {

        const element =
            document.getElementById(
                "countdown"
            );


        if (!element) {
            return;
        }


        const difference =
            eventTimestamp -
            new Date().getTime();


        if (difference <= 0) {

            element.textContent =
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


        element.textContent =
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


    const {
        count,
        error
    } =
        await supabaseDB
            .from("anmeldungen")
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            )
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


    const element =
        document.getElementById(
            "participant-count"
        );


    if (element) {

        element.textContent =
            count || 0;
    }
}


// ========================================
// RENN FIRMEN
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


    const {
        data,
        error
    } =
        await supabaseDB
            .from("anmeldungen")
            .select(
                "racing_company_id"
            )
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

            option.disabled =
                true;

            if (
                !option.textContent
                    .includes(" – VERGEBEN")
            ) {

                option.textContent +=
                    " – VERGEBEN";
            }

        } else {

            option.disabled =
                false;

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
// ANMELDUNG
// ========================================

const form =
    document.querySelector(
        "form"
    );


if (form) {

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (!currentEvent) {

                alert(
                    "❌ Das Event konnte nicht geladen werden."
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


            // ========================================
            // FELDER PRÜFEN
            // ========================================

            if (
                !minecraftName ||
                !discordName ||
                !racingCompanyId
            ) {

                alert(
                    "Bitte fülle alle Felder aus."
                );

                return;
            }


            // ========================================
            // EVENT ANMELDUNG OFFEN?
            // ========================================

            if (
                currentEvent
                    .registration_open === false
            ) {

                alert(
                    "🔒 Die Anmeldung für dieses Event ist geschlossen."
                );

                return;
            }


            // ========================================
            // FREIE PLÄTZE PRÜFEN
            // ========================================

            const {
                count,
                error: countError
            } =
                await supabaseDB
                    .from("anmeldungen")
                    .select(
                        "*",
                        {
                            count: "exact",
                            head: true
                        }
                    )
                    .eq(
                        "event_id",
                        currentEvent.id
                    );


            if (countError) {

                console.error(
                    "Fehler beim Prüfen der Plätze:",
                    countError
                );

                alert(
                    "❌ Die freien Plätze konnten nicht geprüft werden."
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
                    currentEvent.max_participants +
                    " Plätze belegt."
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
                                Number(
                                    racingCompanyId
                                )
                        }
                    ]);


            if (error) {

                console.error(
                    "Supabase Fehler:",
                    error
                );


                // Rennfirma bereits vergeben

                if (
                    error.code ===
                    "23505"
                ) {

                    alert(
                        "❌ Diese Rennfirma ist bereits vergeben!\n\n" +
                        "Bitte wähle eine andere Rennfirma."
                    );

                    await updateRacingCompanies();

                    return;
                }


                alert(
                    "❌ Die Anmeldung konnte nicht gespeichert werden.\n\n" +
                    "Fehler: " +
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


            await updateParticipantCount();

            await updateRacingCompanies();


            // Vote-Liste aktualisieren

            await loadVoteParticipants();
        }
    );
}


// ========================================
// VOTE SYSTEM
// ========================================


// ========================================
// ANONYMER BENUTZER
// ========================================

async function setupVoting() {

    const voteList =
        document.getElementById(
            "vote-list"
        );


    if (voteList) {

        voteList.textContent =
            "🔄 Voting wird vorbereitet...";
    }


    if (!currentEvent) {

        if (voteList) {

            voteList.textContent =
                "❌ Kein Event geladen.";
        }

        return;
    }


    if (voteList) {

        voteList.textContent =
            "🔄 Zuschauer wird verbunden...";
    }


    const {
        data,
        error
    } =
        await supabaseDB.auth
            .signInAnonymously();


    if (error) {

        console.error(
            "Anonymous Login Fehler:",
            error
        );


        if (voteList) {

            voteList.textContent =
                "❌ Voting konnte nicht gestartet werden: " +
                error.message;
        }

        return;
    }


    currentUser =
        data.user;


    if (voteList) {

        voteList.textContent =
            "🔄 Fahrer werden geladen...";
    }


    await loadVoteParticipants();

    await loadVoteResults();
}


// ========================================
// VOTE-TEILNEHMER LADEN
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


    if (
        !data ||
        data.length === 0
    ) {

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


    await checkIfAlreadyVoted();
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


    const button =
        document.getElementById(
            "vote-button"
        );


    if (
        data &&
        button
    ) {

        button.disabled =
            true;

        button.textContent =
            "✅ Du hast bereits abgestimmt";
    }


    await loadVoteResults();
}


// ========================================
// VOTE ABSCHICKEN
// ========================================

const voteButton =
    document.getElementById(
        "vote-button"
    );


if (voteButton) {

    voteButton.addEventListener(
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

                console.error(
                    "Vote-Fehler:",
                    error
                );


                if (
                    error.code ===
                    "23505"
                ) {

                    alert(
                        "❌ Du hast bereits für dieses Event abgestimmt."
                    );

                } else {

                    alert(
                        "❌ Deine Stimme konnte nicht gespeichert werden.\n\n" +
                        error.message
                    );
                }

                return;
            }


            alert(
                "✅ Deine Stimme wurde gespeichert!"
            );


            voteButton.disabled =
                true;

            voteButton.textContent =
                "✅ Stimme abgegeben";


            await loadVoteResults();
        }
    );
}


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
                            ?.minecraft_name ||
                        "Unbekannt",

                    votes:
                        0
                };
            }


            results[id].votes++;
        }
    );


    const totalVotes =
        data.length;


    const sorted =
        Object.values(
            results
        ).sort(
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


    resultsElement.innerHTML = `
        <h3>📊 Aktuelle Ergebnisse</h3>

        <p class="vote-total">
            ${totalVotes}
            Stimme${totalVotes === 1 ? "" : "n"}
            insgesamt
        </p>
    `;


    if (
        sorted.length === 0
    ) {

        resultsElement.innerHTML += `
            <p>Noch keine Stimmen abgegeben.</p>
        `;

        return;
    }


    sorted.forEach(
        result => {

            const percentage =
                totalVotes > 0
                    ? Math.round(
                        (
                            result.votes /
                            totalVotes
                        ) *
                        100
                    )
                    : 0;


            const resultDiv =
                document.createElement(
                    "div"
                );


            resultDiv.className =
                "vote-result";


            resultDiv.innerHTML = `

                <div class="vote-result-header">

                    <strong>
                        🏎️ ${result.name}
                    </strong>

                    <span>
                        ${percentage}%
                        ·
                        ${result.votes}
                        Stimme${result.votes === 1 ? "" : "n"}
                    </span>

                </div>


                <div class="vote-bar-background">

                    <div
                        class="vote-bar"
                        style="width: ${percentage}%"
                    ></div>

                </div>
            `;


            resultsElement.appendChild(
                resultDiv
            );
        }
    );
}


// ========================================
// WEBSITE STARTEN
// ========================================

async function startWebsite() {

    try {

        console.log("1. Website startet");

        await loadCurrentEvent();

        console.log("2. Event geladen:", currentEvent);

        if (!currentEvent) {

            const voteList =
                document.getElementById("vote-list");

            if (voteList) {
                voteList.textContent =
                    "❌ Kein zukünftiges Event gefunden.";
            }

            return;
        }

        await setupVoting();

        console.log("3. Voting gestartet");

    } catch (error) {

        console.error(
            "STARTFEHLER:",
            error
        );

        const voteList =
            document.getElementById("vote-list");

        if (voteList) {

            voteList.textContent =
                "❌ Fehler: " +
                error.message;
        }
    }
}

startWebsite();
