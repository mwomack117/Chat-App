const socket = io();

// Elements
const $messageForm = document.getElementById("message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.getElementById("send-location");
const $messages = document.getElementById("messages");

// Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;

socket.on("message", message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    created: moment(message.createdAt).format("h:mm a")
  });
  // $messages.insertAdjacentHTML("beforeend", html);
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", message => {
  console.log(message);
  const html = Mustache.render(locationTemplate, {
    url: message.url,
    created: moment(message.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", e => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", true);

  const message = e.target.elements.message.value;
  // same thing written differently
  // const message = document.getElementById("message").value;

  socket.emit("sendMessage", message, error => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log("The message was delivered!");
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }
  $sendLocationButton.setAttribute("disabled", true);

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      "sendLocation",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
});
