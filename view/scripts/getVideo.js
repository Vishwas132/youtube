import addNavButtons from "./navButtons.js";

async function fetchVideo() {
  const response = await fetch(
    `http://localhost:3000/video/id/${localStorage.getItem("videoId")}`,
    {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Range": "bytes=0-",
      },
    }
  );
  return response;
}

async function fillValues() {
  addNavButtons();
  const response = await fetchVideo();
  if (response.status === 206) {
    const video = document.querySelector("video");
    video.src = `http://localhost:3000/video/id/${localStorage.getItem(
      "videoId"
    )}`;
  } else {
    console.log("response.status", response.status);
  }
}

window.addEventListener("DOMContentLoaded", fillValues);
