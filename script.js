const loader = document.getElementById("loader");
const progressBar = document.getElementById("progressBar");
const result = document.getElementById("result");

// Typewriter Animation
function typeWriter(text) {
    result.textContent = "";

    let i = 0;

    const speed = 15;

    const timer = setInterval(() => {
        if (i < text.length) {
            result.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
        }
    }, speed);
}

// Generate Study Plan
async function generatePlan() {

    const subject = document.getElementById("subject").value.trim();
    const examDate = document.getElementById("examDate").value;
    const hours = document.getElementById("hours").value;
    const level = document.getElementById("level").value;

    if (!subject || !examDate || !hours) {
        alert("Please fill all the fields.");
        return;
    }

    loader.style.display = "block";
    result.textContent = "Generating your personalized study plan...";
    progressBar.style.width = "25%";

    try {

        const response = await fetch("http://127.0.0.1:8000/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                subject: subject,
                exam_date: examDate,
                hours_per_day: Number(hours),
                current_level: level
            })
        });

        progressBar.style.width = "70%";

        if (!response.ok) {
            throw new Error("Failed to generate study plan.");
        }

        const data = await response.json();

        progressBar.style.width = "100%";
        loader.style.display = "none";

        typeWriter(data.data);

        document.querySelector(".output-section").scrollIntoView({
            behavior: "smooth"
        });

        setTimeout(() => {
            progressBar.style.width = "0%";
        }, 1500);

    } catch (error) {

        loader.style.display = "none";
        progressBar.style.width = "0%";

        result.textContent =
            "❌ Error: Unable to generate the study plan.\n\n" +
            "Please check whether your FastAPI server is running and your Groq API key is valid.";

        console.error(error);
    }
}

// Dashboard Updates
function updateDashboard() {

    const exam = document.getElementById("examDate").value;
    const hours = document.getElementById("hours").value;
    const level = document.getElementById("level").value;

    const hoursCard = document.getElementById("hoursCard");
    const levelCard = document.getElementById("levelCard");
    const daysLeft = document.getElementById("daysLeft");

    if (hoursCard) {
        hoursCard.innerText = hours || 0;
    }

    if (levelCard) {
        levelCard.innerText = level;
    }

    if (exam && daysLeft) {

        const today = new Date();
        const examDate = new Date(exam);

        const diff = Math.ceil(
            (examDate - today) / (1000 * 60 * 60 * 24)
        );

        daysLeft.innerText = diff > 0 ? diff : 0;
    }
}

document.getElementById("examDate")?.addEventListener("change", updateDashboard);
document.getElementById("hours")?.addEventListener("input", updateDashboard);
document.getElementById("level")?.addEventListener("change", updateDashboard);