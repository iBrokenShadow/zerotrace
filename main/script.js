// DECORATIVES START
function hackStylebyBS(element) {
  var str = document.getElementById(element).innerHTML.toString(); // Target the specific div by id
  var i = 0;
  document.getElementById(element).innerHTML = ""; // Clear the div content initially

  setTimeout(function () {
    var se = setInterval(function () {
      i++;
      document.getElementById(element).innerHTML = str.slice(0, i) + "|"; // Update div content
      if (i == str.length) {
        clearInterval(se); // Stop the interval when text is fully typed out
        document.getElementById(element).innerHTML = str; // Final content without the "|"
      }
    }, 0.6); // Adjust the speed of the animation here (in milliseconds)
  }, 0); // Start immediately after the page loads
}
hackStylebyBS('ppp');


function triggerButtonAnimation() {
  const button = document.querySelector(".button");

  if (!button) return;

  // Add hover-active class to trigger animation + glow effect
  button.classList.add("hover-active");

  // After 5.4 seconds, start fading out the hover-active animations
  setTimeout(() => {
    button.classList.add("fade-out-effect"); // Apply fade-out effect
  }, 6000);

  // After fade-out completes, remove hover-active class
  setTimeout(() => {
    button.classList.remove("hover-active", "fade-out-effect");
  }, 6000); // Adjust this based on the fade-out time
}



// Run the function 2 seconds after the page loads
window.addEventListener("load", () => {
  setTimeout(triggerButtonAnimation, 1500); // Adjust the timing as needed
});




document.addEventListener("DOMContentLoaded", function () {
  const isMobile = window.innerWidth <= 768; // Detect mobile screens

  if (isMobile) {
    // Show only one tooltip at bottom for mobile
    setTimeout(() => {
      showTooltip("tooltip-bottom-id", "tooltip-bottom-text", "FallenEcho provides a Free & Secure, key-based file-sharing solution. No registrations, just upload, share, and download with ease. Privacy is the focus, fast and reliable... by @iBrokenShadow");
    }, 6000);
  } else {
    setTimeout(() => {
      showTooltip("tooltip-right-id", "tooltip-right-text", "FallenEcho ensures your files are secure and private with automatic 24-hour expiration, so no sensitive data lingers. Effortlessly upload and share your files with a unique token—no sign-up required.");

      // Delay left tooltip by 1 second
      setTimeout(() => {
        showTooltip("tooltip-left-id", "tooltip-left-text", "FallenEcho provides a Free & Secure, key-based file-sharing solution. No registrations, just upload, share, and download with ease. Files are deleted after 24 hours for enhanced privacy.");
      }, 3000);
    }, 2000);
  }
});


// Function to show tooltip with typewriter effect
function showTooltip(tooltipId, textId, message) {
  const tooltip = document.getElementById(tooltipId);
  tooltip.classList.add("show-tooltip");

  typeWriterEffect(textId, message, tooltip);

  // Auto-close after 12 seconds
  setTimeout(() => closeTooltip(tooltipId), 32000);
}

// Typewriter Effect with Dynamic Growth
function typeWriterEffect(elementId, text, tooltip) {
  let i = 0;
  const speed = 10; // Adjust speed here
  const element = document.getElementById(elementId);

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;

      // Increase height dynamically
      tooltip.style.maxHeight = tooltip.scrollHeight + "px";

      setTimeout(type, speed);
    }
  }

  type();
}

// Close tooltip with smooth fade-out
function closeTooltip(tooltipId) {
  const tooltip = document.getElementById(tooltipId);
  tooltip.classList.add("fade-out");

  // Remove completely after fade-out animation
  setTimeout(() => {
    tooltip.style.display = "none";
  }, 500);
}







        
        // Start animation after 6 seconds
        setTimeout(() => {
          document.getElementById('gifBox').classList.add('animate-walk');
      }, 4000);
// DECORATIVES END





// Helper: detect if running as installed PWA/app
function isInStandaloneMode() {
  // iOS
  if (window.navigator.standalone) return true;
  // Chrome < 93 or other browsers supporting “standalone”
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  // Chrome > 93 with window-controls-overlay
  if (window.matchMedia('(display-mode: window-controls-overlay)').matches) return true;
  return false;
}

window.addEventListener('load', () => {
  // 1) Don’t show banner if already installed/opened as app
  if (isInStandaloneMode()) return;

  const banner = document.getElementById('coolAppBanner');
  const button = document.getElementById('coolInstallBtn');

  // 2) Show Banner After 2 Seconds
  setTimeout(() => {
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('show'), 100);
  }, 500);

  // 3) Shake if user doesn’t click by 7 seconds
  setTimeout(() => {
    if (banner.classList.contains('show')) {
      banner.style.animation = "shake 0.5s";
      banner.style.animationIterationCount = "1";
    }
  }, 6000);

  // 4) Auto-hide with fade-out at 16 seconds
  setTimeout(() => {
    if (banner.classList.contains('show')) {
      banner.style.animation = "fadeOutUp 1s forwards";
      setTimeout(() => banner.remove(), 1000);
    }
  }, 13000);
});

// Confetti + redirect
function triggerConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

  function random(min, max) { return Math.random() * (max - min) + min; }

  const interval = setInterval(() => {
    const timeLeft = end - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);

    const count = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, {
      particleCount: count,
      origin: { x: random(0.1, 0.9), y: Math.random() - 0.2 }
    }));
  }, 250);

  // redirect after confetti
  setTimeout(() => {
    window.location.href = '/';
  }, duration);
}



// BUTTON SERVING FILES
const installButton        = document.getElementById('coolInstallBtn');
const installNotification  = document.getElementById('install-notification');
const banner               = document.getElementById('coolAppBanner');
let deferredPrompt = null;

function hideBanner() {
  banner.style.animation = 'fadeOutUp 1s forwards';
  setTimeout(() => banner.remove(), 1000);
  if (installNotification) {
    installNotification.style.transition = 'opacity 0.5s';
    installNotification.style.opacity = 0;
    setTimeout(() => installNotification.style.display = 'none', 500);
  }
}

// Only capture the install prompt on non-Android browsers
window.addEventListener('beforeinstallprompt', (e) => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  if (!/android/i.test(ua)) {
    e.preventDefault();
    deferredPrompt = e;
  }
});

installButton.addEventListener('click', async () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;

  // 🛑 Fix: First check if app is already installed
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    showSuccessPopup("Already installed on your PC! 🚀 Opening...");
    window.focus();
    hideBanner();
    return;
  }

  // 1. Android → direct APK download
  if (/android/i.test(ua)) {
    const apkUrl = '/zerotrace.apk';
    try {
      const res = await fetch(apkUrl, { method: 'HEAD' });
      if (!res.ok) throw new Error('APK not found');
      window.location.href = apkUrl;
      triggerConfetti();
    } catch (err) {
      showSuccessPopup("Sorry! Download failed. Please try again later. 😥");
      hideBanner();
    }

  // 2. iOS → custom “add to home” popup
  } else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
    showSuccessPopup(
      `Please add ZeroTrace manually to your Home Screen 📱✨<br>See here how <a href="https://www.lbbd.gov.uk/add-webpage-your-smartphonetablet-home-screen" target="_blank" style="color: #00cc66; text-decoration: underline;">🔗</a>`
    );    
    hideBanner();

  // 3. Desktop (and other non-Android) → PWA prompt
  } else {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choice => {
        if (choice.outcome === 'accepted') {
          triggerConfetti();
        }
        deferredPrompt = null;
      });
    } else {
      showSuccessPopup("Seems already installed. If not then use Chrome!");
    }
    hideBanner();
  }
});





// END










// Navigation functions
function showSection(sectionId) {
  closeTooltip('tooltip-bottom-id'); 
  closeTooltip('tooltip-right-id');
  closeTooltip('tooltip-left-id');

  document.getElementById('mainMenu').style.opacity = '0';
  setTimeout(() => {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';
    setTimeout(() => {
      document.getElementById(sectionId).style.opacity = '1';
      document.getElementById(sectionId).style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
  }, 500);

  let backButton = document.getElementById('backButton');
  setTimeout(() => {
    backButton.style.opacity = '1';
    backButton.style.transform = 'scale(1)';
  }, 1000);
}




function goBack() {
  document.querySelectorAll('.card2').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translate(-50%, -50%) scale(0.8)';
    setTimeout(() => { section.style.display = 'none'; }, 500);
  });

  setTimeout(() => {
    document.getElementById('mainMenu').style.display = 'block';
    setTimeout(() => { document.getElementById('mainMenu').style.opacity = '1'; }, 10);
  }, 500);

  let backButton = document.getElementById('backButton');
  backButton.style.opacity = '0';
  backButton.style.transform = 'scale(0.8)';

  // Close PopUp
  const popup = document.getElementById("tokenPopup");
  popup.classList.remove("show");
  popup.style.display = "none";
  document.getElementById("overlay").style.display = "none";
  enableAllButtons();



  // Remove File List and Buttons from Download Section
  let filesListPopup = document.getElementById("filesListPopup");
  let buttonContainerLast = document.getElementById("button-container-last");

  if (filesListPopup) {
    filesListPopup.style.display = "none"; // Hide instead of deleting
  }

  if (buttonContainerLast) {
    buttonContainerLast.style.display = "none"; // Hide instead of deleting
  }
}




// Pop-up control functions

function disableOtherButtons(popupId) {
  document.querySelectorAll("button:not(#" + popupId + " button)").forEach(button => {
    button.classList.add("disabled"); // Add a class for visual effect
    button.disabled = true; // Disable button functionality
  });
}

function enableAllButtons() {
  document.querySelectorAll(".disabled").forEach(button => {
    button.classList.remove("disabled");
    button.disabled = false; // Re-enable buttons
  });
}

function showSuccessPopup(message) {
  const popup = document.getElementById("success-popup");
  const overlay = document.getElementById("success-overlay");

  // Insert dynamic message with HTML support
  document.getElementById("success-message").innerHTML = message;

  // Show with fade-in effect
  popup.style.display = "block";
  overlay.style.display = "block";

  setTimeout(() => {
    popup.classList.add("show");
    overlay.classList.add("show");
  }, 10); // Small delay to allow CSS transition to apply

  // Close the popup when the close button is clicked
  document.getElementById("success-close-btn").onclick = function () {
    closeSuccessPopup();
  };
}


function closeSuccessPopup() {
  const popup = document.getElementById("success-popup");
  const overlay = document.getElementById("success-overlay");

  // Fade-out effect
  popup.classList.remove("show");
  overlay.classList.remove("show");

  setTimeout(() => {
    popup.style.display = "none";
    overlay.style.display = "none";
  }, 300); // Match the CSS transition time
}





// Show Error Popup
function showErrorPopup() {
  document.getElementById("overlay").style.display = "flex";
  const popup = document.getElementById("ErrorPopup");
  popup.style.display = "flex";
  setTimeout(() => {
    popup.classList.add("show");
  }, 10);

  disableOtherButtons("ErrorPopup"); // Disable buttons outside this popup
}

// Close Error Popup
function closeErrorPopup() {
  const popup = document.getElementById("ErrorPopup");
  popup.classList.remove("show"); // Remove the 'show' class to trigger fade-out

  setTimeout(() => {
    popup.style.display = "none"; // Hide the popup after fade-out
    document.getElementById("overlay").style.display = "none"; // Hide the overlay
    enableAllButtons(); // Re-enable all buttons after closing
  }, 300); // Adjust to match the fade-out transition duration (300ms)
}
























async function reportERROR() {
  showLoader_ErrorReport();
  const userInfo = {
    device: {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      deviceMemory: navigator.deviceMemory || "Unknown",
      hardwareConcurrency: navigator.hardwareConcurrency || "Unknown", // CPU Cores
      touchSupport: navigator.maxTouchPoints > 0 ? "Yes" : "No",
    },
    browser: {
      name: navigator.appName,
      version: navigator.appVersion,
      language: navigator.language,
      onlineStatus: navigator.onLine ? "Online" : "Offline",
      cookiesEnabled: navigator.cookieEnabled ? "Yes" : "No",
    },
    screen: {
      width: screen.width,
      height: screen.height,
      availableWidth: screen.availWidth,
      availableHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
    },
    network: {
      connectionType: navigator.connection ? navigator.connection.effectiveType : "Unknown",
      downlink: navigator.connection ? navigator.connection.downlink + " Mbps" : "Unknown",
      rtt: navigator.connection ? navigator.connection.rtt + " ms" : "Unknown",
    },
    location: {
      latitude: "Permission Denied",
      longitude: "Permission Denied",
      country: "Unknown",
      city: "Unknown",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    systemTime: new Date().toLocaleString(),
  };

  // Get IP Address using a public API
  try {
    const ipResponse = await fetch("https://api64.ipify.org?format=json");
    const ipResponseIPV4 = await fetch("https://api.ipify.org/?format=json");
    const ipData = await ipResponse.json();
    const ipDataV4 = await ipResponseIPV4.json();
    userInfo.network.ipAddressV4 = ipDataV4.ip;
    userInfo.network.ipAddressV6 = ipData.ip;
  } catch (error) {
    userInfo.network.ipAddress = "Failed to fetch";
  }

  // Check geolocation permission without prompting user
  if (navigator.permissions) {
    try {
      const permissionStatus = await navigator.permissions.query({ name: "geolocation" });
      if (permissionStatus.state === "granted") {
        navigator.geolocation.getCurrentPosition(async (position) => {
          userInfo.location.latitude = position.coords.latitude;
          userInfo.location.longitude = position.coords.longitude;

          // Reverse Geocoding (Convert Lat/Lon to City & Country)
          try {
            const geoResponse = await fetch(`https://geocode.maps.co/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&api_key=YOUR_API_KEY`);
            const geoData = await geoResponse.json();
            userInfo.location.city = geoData.address.city || "Unknown";
            userInfo.location.country = geoData.address.country || "Unknown";
          } catch (error) {
            console.warn("Failed to fetch geolocation details.");
          }
        });
      }
    } catch (error) {
      console.warn("Error checking geolocation permission:", error);
    }
  }

  const tempMessage = document.getElementById("ErrorMessage").innerText;
  // console.log(tempMessage);
  // console.log(userInfo);

  let emailMessage = `
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 80%;
                margin: 30px auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h2 {
                color: #4CAF50;
            }
            table {
                width: 100%;
                margin-top: 20px;
                border-collapse: collapse;
            }
            th, td {
                padding: 12px;
                text-align: left;
                border: 1px solid #ddd;
            }
            th {
                background-color: #f2f2f2;
                color: #4CAF50;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #888;
                margin-top: 30px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>User Information Report</h2>
            <p><strong>Message:</strong> ${tempMessage}</p>

            <h3>Device Information</h3>
            <table>
                <tr><th>Platform</th><td>${userInfo.device.platform}</td></tr>
                <tr><th>User Agent</th><td>${userInfo.device.userAgent}</td></tr>
                <tr><th>Device Memory</th><td>${userInfo.device.deviceMemory}</td></tr>
                <tr><th>CPU Cores</th><td>${userInfo.device.hardwareConcurrency}</td></tr>
                <tr><th>Touch Support</th><td>${userInfo.device.touchSupport}</td></tr>
            </table>

            <h3>Browser Information</h3>
            <table>
                <tr><th>Browser Name</th><td>${userInfo.browser.name}</td></tr>
                <tr><th>Browser Version</th><td>${userInfo.browser.version}</td></tr>
                <tr><th>Language</th><td>${userInfo.browser.language}</td></tr>
                <tr><th>Online Status</th><td>${userInfo.browser.onlineStatus}</td></tr>
                <tr><th>Cookies Enabled</th><td>${userInfo.browser.cookiesEnabled}</td></tr>
            </table>

            <h3>Screen Information</h3>
            <table>
                <tr><th>Width</th><td>${userInfo.screen.width}</td></tr>
                <tr><th>Height</th><td>${userInfo.screen.height}</td></tr>
                <tr><th>Available Width</th><td>${userInfo.screen.availableWidth}</td></tr>
                <tr><th>Available Height</th><td>${userInfo.screen.availableHeight}</td></tr>
                <tr><th>Color Depth</th><td>${userInfo.screen.colorDepth}</td></tr>
                <tr><th>Pixel Depth</th><td>${userInfo.screen.pixelDepth}</td></tr>
            </table>

            <h3>Network Information</h3>
            <table>
                <tr><th>Connection Type</th><td>${userInfo.network.connectionType}</td></tr>
                <tr><th>Downlink</th><td>${userInfo.network.downlink}</td></tr>
                <tr><th>RTT</th><td>${userInfo.network.rtt}</td></tr>
                <tr><th>IP Address (IPv4)</th><td>${userInfo.network.ipAddressV4}</td></tr>
                <tr><th>IP Address (IPv6)</th><td>${userInfo.network.ipAddressV6}</td></tr>
            </table>

            <h3>Location Information</h3>
            <table>
                <tr><th>Latitude</th><td>${userInfo.location.latitude}</td></tr>
                <tr><th>Longitude</th><td>${userInfo.location.longitude}</td></tr>
                <tr><th>City</th><td>${userInfo.location.city}</td></tr>
                <tr><th>Country</th><td>${userInfo.location.country}</td></tr>
                <tr><th>Timezone</th><td>${userInfo.location.timezone}</td></tr>
            </table>

            <h3>System Time</h3>
            <table>
                <tr><th>Current System Time</th><td>${userInfo.systemTime}</td></tr>
            </table>

            <div class="footer">
                <p>This report was generated by your application.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  // Call the sendEmail function with the formatted emailMessage
  sendEmail(emailMessage);
}


async function sendEmail(emailMessage) {
  try {
    // showLoader_ErrorReport();
    const response = await fetch("http://localhost:3000/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Ensure JSON format
      body: JSON.stringify({ emailMessage }) // Send as JSON
    });

    const data = await response.json();
    if (data.success) {
      hideLoader_ErrorReport();
      closeErrorPopup();
      // showSuccessPopup("✅ Your email was sent successfully!");
      showSuccessPopup("✅Error Reported to Administrator✅ \nwe hope to fix it ASAP. \nThanks for your contribution.");
    } else {
      hideLoader_ErrorReport();
      closeErrorPopup();
      showSuccessPopup("❌ Failed to send email: " + data.error);
      // showErrorPopup("❌ Failed to send email: " + data.error);
    }
  } catch (error) {
    hideLoader_ErrorReport();
    closeErrorPopup();
    showSuccessPopup("❌ Failed to send email: " + error.message);
    // showErrorPopup("❌ Error: " + error.message);
  }
}


function showLoader_ErrorReport() {
  disableOtherButtons();
  document.getElementById("ErrorPopup").style.backgroundColor = "#979595";
  document.querySelector(".overlay").style.opacity = "1";
  document.querySelector(".loader-ErrorReport").style.display = "flex";
}

function hideLoader_ErrorReport() {
  enableAllButtons();
  document.querySelector(".overlay").style.opacity = "0";
  document.querySelector(".loader-ErrorReport").style.display = "none";
  document.getElementById("ErrorPopup").style.backgroundColor = "#fff";
}




// Add a Success Popup to Deleted successfully and error reported successfully