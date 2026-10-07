const detailsButtons = document.querySelectorAll(".details-button");
detailsButtons.forEach(button => {
    button.addEventListener("click", () => {
        const meeting = button.closest(".previous-meeting"); const isOpen = meeting.classList.contains("expanded");
    /* * Close all other meetings. */ document.querySelectorAll(".previous-meeting.expanded").forEach(openMeeting => {
            if (openMeeting !== meeting) {
                openMeeting.classList.remove("expanded");
                const openButton = openMeeting.querySelector(".details-button");
                openButton.setAttribute("aria-expanded", "false");
                openButton.textContent = "Details";
            }
        });
         /* * Toggle the selected meeting. */ if (isOpen) {
            meeting.classList.remove("expanded");
            button.setAttribute("aria-expanded", "false"); button.textContent = "Details";
        } else {
            meeting.classList.add("expanded");
            button.setAttribute("aria-expanded", "true");
            button.textContent = "Hide Details";
        }
    });
});
