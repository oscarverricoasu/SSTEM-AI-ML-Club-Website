let button = "Home";
const homeTarget = document.getElementById('home-page');
const desktopText = document.getElementById('textbox');
const projectsTarget = document.getElementById('projects-page');
const membersTarget = document.getElementById('members-page');
const meetingsTarget = document.getElementById('meetings-page');

function invisibleHome(){
    return homeTarget.style.display !== 'block';
}

function invisibleProjects(){
    return projectsTarget.style.display !== 'block';
}

function invisibleMembers(){
    return membersTarget.style.display !== 'block';
}

function invisibleMeetings(){
    return meetingsTarget.style.display !== 'block';
}

function setButton(String){
    button = String;
}
function callSwitch() {
    switch (button) {
        case "Home":
            projectsTarget.style.display = 'none';
            membersTarget.style.display = 'none';
            meetingsTarget.style.display = 'none';
            homeTarget.style.display = 'block';
            desktopText.textContent = 'Desktop > Home';
            break;
        case "Projects":
            homeTarget.style.display = 'none';
            membersTarget.style.display = 'none';
            meetingsTarget.style.display = 'none';
            projectsTarget.style.display = 'block';
            desktopText.textContent = 'Desktop > Projects';
            break;
        case "Members":
            homeTarget.style.display = 'none';
            projectsTarget.style.display = 'none';
            meetingsTarget.style.display = 'none';
            membersTarget.style.display = 'block';
            desktopText.textContent = 'Desktop > Members';
            break;
        case "Meetings":
            homeTarget.style.display = 'none';
            projectsTarget.style.display = 'none';
            membersTarget.style.display = 'none';
            meetingsTarget.style.display = 'block';
            desktopText.textContent = 'Desktop > Meetings';
            break;
    }
}

