let user = {};
let officials = [];
let filteredOfficials = [];

function nextStep(step) {
    if (step === 2) {
        user.firstName = document.getElementById('user-fname').value.trim();
        user.lastName = document.getElementById('user-lname').value.trim();

        fetch('/data')
            .then(res => res.json())
            .then(data => {
                const select = document.getElementById('locality-select');
                select.innerHTML = data.choices.map(c => `<option value="${c}">${c}</option>`).join('');
                officials = data.officials;
                showStep(2);
            });
    } else if (step === 3) {
        const selectedIndex = document.getElementById('official-select').value;
        const official = filteredOfficials[+selectedIndex];
        user.official = official;

        const letter = `Dear ${official.first_name} ${official.last_name},\n\n
My name is ${user.firstName} ${user.lastName}, and I am one of your constituents in ${official.city}.\n\n
Across the country, and especially in Minneapolis, federal ICE agents have been terrorizing innocent people and violating their constitutional rights to due process. This cannot continue.\n\n
As a follower of Jesus Christ, I find this deeply troubling. Scripture commands us to care for the vulnerable:\n\n
"When a foreigner resides among you in your land, do not mistreat them. The foreigner residing among you must be treated as your native-born." — Leviticus 19:33–34\n\n
We are called to love our neighbors. But is this what love looks like? Does it look like executing mothers in the street? Tearing hardworking people from their jobs, homes, and families? Hiding identities out of shame, rather than standing accountable?\n\n
To be clear, I am not asking for blanket forgiveness. If someone is guilty of a crime, they should be tried in a court of law, the American way.\n\n
You represent me in ${official.represents}, and this is what I ask of you: publicly and forcefully oppose the actions of ICE, President Donald Trump, and all who are complicit in this inhumane treatment of our neighbors.\n\n
If you do not, I will withdraw my support, and instead give my time, money, and vote to someone who will stand up for justice. I hope you prove yourself worthy of that support.\n\n
Sincerely,\n
${user.firstName} ${user.lastName}\n
${official.city}`;



        document.getElementById('letter-box').value = letter;

        // Show or hide webform note
        if (official.contact_type === 'webform') {
            document.getElementById('form-note').classList.remove('hidden');
        } else {
            document.getElementById('form-note').classList.add('hidden');
        }

        showStep(3);
    }
}

function updateOfficials() {
    const selectedChoice = document.getElementById('locality-select').value;
    filteredOfficials = officials.filter(o => o.choice === selectedChoice);

    const officialSelect = document.getElementById('official-select');
    if (filteredOfficials.length > 0) {
        officialSelect.innerHTML = filteredOfficials.map((o, i) =>
            `<option value="${i}">${o.first_name} ${o.last_name} (${o.represents})</option>`
        ).join('');
        document.getElementById('official-wrapper').classList.remove('hidden');
    } else {
        document.getElementById('official-wrapper').classList.add('hidden');
    }
}

function showStep(n) {
    document.querySelectorAll('.step').forEach(s => s.classList.add('hidden'));
    document.getElementById(`step-${n}`).classList.remove('hidden');
}

function copyText() {
    const box = document.getElementById('letter-box');
    box.select();
    document.execCommand('copy');
    logAction();
}

function prefillEmail() {
    const letter = document.getElementById('letter-box').value;
    const official = user.official;

    if (official.contact_type === 'webform' && official.contact_url) {
        navigator.clipboard.writeText(letter)
            .then(() => {
                alert("Your message has been copied to your clipboard. You’ll be redirected to the contact form.");
                window.open(official.contact_url, '_blank');
                logAction();
            })
            .catch(err => {
                alert("Failed to copy message to clipboard. Please copy it manually.");
                window.open(official.contact_url, '_blank');
                logAction();
            });
    } else if (official.contact_type === 'email') {
        const mailto = `mailto:${official.email}?subject=Letter&body=${encodeURIComponent(letter)}`;
        window.location.href = mailto;
        logAction();
    }
}

function logAction() {
    fetch('/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_first_name: user.firstName,
            official_last_name: user.official.last_name
        })
    });
}
