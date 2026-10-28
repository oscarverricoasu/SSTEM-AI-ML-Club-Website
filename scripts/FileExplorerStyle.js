const homeButton = document.getElementById('home-button');
callSwitch();
homeButton.addEventListener('click', function() {
  // Check the current display property and switch it
  if (invisibleHome()) {
    setButton("Home");
    callSwitch();
   }
  });

const projectsButton = document.getElementById('projects-button');
projectsButton.addEventListener('click', function() {
  // Check the current display property and switch it
  if (invisibleProjects()) {
    setButton("Projects");
    callSwitch();
  }
});

const membersButton = document.getElementById('members-button');
membersButton.addEventListener('click', function() {
  // Check the current display property and switch it
  if (invisibleMembers()) {
    setButton("Members");
    callSwitch();
  }
});

const meetingsButton = document.getElementById('meetings-button');
meetingsButton.addEventListener('click', function() {
  // changes the theme if the button is clicked and it is not active.
  if (invisibleMeetings()) {
    setButton("Meetings");
    callSwitch();
  }
});