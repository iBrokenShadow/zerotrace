// HIDE THE FILE LIST
// const filesListContainer = document.getElementById("filesListPopup");
// filesListContainer.style="none";
// filesListContainer.innerHTML = ''; // Clear previous file list


function showButtonContainer() {
  let container = document.getElementById("button-container-last");
  container.style.display = "flex"; // Make it visible first

  setTimeout(() => {
    container.style.opacity = "1"; // Gradually fade in
  }, 10); // Small delay to allow CSS transition to work
}
function hideButtonContainer() {
  let container = document.getElementById("button-container-last");

  container.style.opacity = "0"; // Fade out effect

  setTimeout(() => {
    container.style.display = "none"; // Hide after transition
  }, 500); // Wait for 0.5s (same as the transition duration)
}

// -----------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------

function hideButtonAndShowLoader() {
  const loader = document.getElementById("loaderZipping");
  // loader.style.display = "block"; 

  setTimeout(() => {
    loader.style.display = "block"; // Make loader visible
    loader.style.opacity = "0"; // Set initial opacity
    setTimeout(() => {
      loader.style.transition = "opacity 0.5s ease-in-out";
      loader.style.opacity = "1"; // Fade in
    }, 50); // Small delay to ensure transition works
  }, 500); // Wait for fade-out animation
}

function hideLoaderAndShowButton() {
  return new Promise((resolve) => {
    const loader = document.getElementById("loaderZipping");

    // Fade out loader
    loader.style.transition = "opacity 0.5s ease-in-out";
    loader.style.opacity = "0";

    // After fade-out animation completes, hide the loader
    setTimeout(() => {
      loader.style.display = "none"; // Hide loader
      resolve(); // Resolve the promise after loader is hidden
    }, 5000); // Wait for fade-out animation to complete (0.5s transition)
  });
}



// -----------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------







let token
let tokenTEMP;
let tokenTEMPDelete;
async function ZipAllFiles() {
  try {
    disableOtherButtons();
    hideButtonContainer();
    hideButtonAndShowLoader(); // Show progress bar before zipping starts
    tokenTEMP = token;
                                  
    const response = await fetch(`http://localhost:3000/api/download/${encodeURIComponent(token)}`);
    if (!response.ok) {
      console.error(`Failed to download zip. Status: ${response.status}`);
      throw new Error(`Server responded with status ${response.status}`);
    }

    let result;
    try {
      result = await response.json();
      tokenInput.value = '';
    } catch (jsonError) {
      tokenInput.value = '';
      throw new Error("Invalid JSON response from server.");
    }

    if (result.files && result.files.length > 0) {
      const zipUrl = `http://localhost:3000/api/zip-download/${encodeURIComponent(token)}`;

      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = String(currentDate.getFullYear()).slice(-2);
      const hour = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      const zipFileName = `ZeroTrace-${month}${day}${year}-${hour}${minutes}.zip`;

      const tempLink = document.createElement("a");
      tempLink.href = zipUrl;
      tempLink.setAttribute("download", zipFileName);
      tempLink.style.display = "none";
      document.body.appendChild(tempLink);

      tempLink.click();
      document.body.removeChild(tempLink);

      await hideLoaderAndShowButton(); // Hide progress bar once download starts
      downloadFiles(tokenTEMP);   // To reset Buttons (Zipo All and Delete after serving Zip File) |Legac Fix|
      enableAllButtons();
      tokenInput.value = '';
    } else {
      await hideLoaderAndShowButton(); // Hide progress bar once download starts
      downloadFiles(tokenTEMP);   // To reset Buttons (Zipo All and Delete after serving Zip File) |Legac Fix|
      enableAllButtons();
      throw new Error("No files found for this token.");
    }
  } catch (error) {
    await hideLoaderAndShowButton(); // Hide progress bar once download starts
    downloadFiles(tokenTEMP);   // To reset Buttons (Zipo All and Delete after serving Zip File) |Legac Fix|
    const ErrorMessage1 = document.getElementById('ErrorMessage');
    ErrorMessage1.innerHTML = `Error: ${error.message}`;
    showErrorPopup();
    enableAllButtons();
  }
}



// Function to request the server to delete the files
// async function deleteFilesOnServer(token) {
//   try {
//     showLoader_ErrorReport();
//     const response = await fetch(`http://localhost:3000/api/delete-files/${encodeURIComponent(token)}`, {
//       method: 'DELETE',
//     });

//     if (!response.ok) {
//       hideLoader_ErrorReport();
//       throw new Error(`Failed to delete files on the server: ${response.status}`);
//     }

//     console.log("Files successfully deleted from server.");
//     hideLoader_ErrorReport();
//   } catch (error) {
//     hideLoader_ErrorReport();
//     const ErrorMessage1 = document.getElementById('ErrorMessage');
//     ErrorMessage1.innerHTML = `Error deleting files from server: ${error.message}`;
//     showErrorPopup();
//   }
// }










// File download functions
async function downloadFiles(tokenTEMP) {
  const tokenInput = document.getElementById("tokenInput");

  if (tokenInput.value == '') {
    token = tokenTEMP;
    console.log(token);
  } else {
    token = tokenInput.value.trim();
    tokenTEMPDelete = token;
  }



  if (!token) {
    const ErrorMessage1 = document.getElementById('ErrorMessage');
    ErrorMessage1.innerHTML = "Please enter a token...!";
    showErrorPopup();
    return;
  }

  try {
    showLoader_ErrorReport();
    disableOtherButtons();
    const response = await fetch(`http://localhost:3000/api/download/${encodeURIComponent(token)}`);
    enableAllButtons();

    if (!response.ok || response.status === '404') {
      hideLoader_ErrorReport();
      tokenInput.value = '';
      throw new Error(`The token enterered: "${token}" is either incorrect or not in database!`);
    } if (!response.ok) {
      hideLoader_ErrorReport();
      tokenInput.value = '';
      throw new Error(`Server responded with status ${response.status}`);
    }

    let result;
    try {
      result = await response.json();
      tokenInput.value = '';
    } catch (jsonError) {
      hideLoader_ErrorReport();
      tokenInput.value = '';
      throw new Error("Invalid JSON response from server.");
    }

    if (result.files && result.files.length > 0) {
      // Reset the token input field after download
      tokenInput.value = '';

      // Show the files in the container
      const filesListContainer = document.getElementById("filesListPopup");
      filesListContainer.innerHTML = ''; // Clear previous file list
      filesListContainer.style = "show";
      showButtonContainer();

      result.files.forEach((file) => {
        const div = document.createElement("div");
        div.classList.add("file-item-download");

        const a = document.createElement("a");

        // Construct the file URL
        const fileUrl = `http://localhost:3000/api/files/${encodeURIComponent(file)}`;
        hideLoader_ErrorReport();

        // Remove only the leading numbers before the first '-'
        const cleanedFilename = "•" + file.replace(/^\d+-/, '');


        // Handle the file download properly
        a.innerText = cleanedFilename; // Display cleaned name
        a.href = "#"; // Prevent direct navigation
        a.onclick = async (event) => {
          event.preventDefault();

          try {
            showLoader_ErrorReport();
            disableOtherButtons();
            const response = await fetch(fileUrl, {
              headers: { "Accept": "application/octet-stream" }
            });

            if (!response.ok) {
              hideLoader_ErrorReport();
              throw new Error(`Failed to fetch ${cleanedFilename}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            hideLoader_ErrorReport();
            // Create a temporary link element to force the download
            const tempLink = document.createElement("a");
            tempLink.href = url;
            tempLink.download = cleanedFilename; // Set correct filename
            document.body.appendChild(tempLink);
            tempLink.click();
            enableAllButtons();

            // Cleanup
            document.body.removeChild(tempLink);
            tokenInput.value = '';
            URL.revokeObjectURL(url);
          } catch (error) {
            hideLoader_ErrorReport();
            console.warn(`Download failed for ${cleanedFilename}:`, error.message);
            tokenInput.value = '';
          }
        };

        // Add the custom download button
        const downloadBtn = document.createElement("button");
        downloadBtn.classList.add("DownloadBtn"); // New custom-styled button
        downloadBtn.innerHTML = `
            <svg xmlns="https://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" class="DownloadIcon">
              <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path>
            </svg>
          `;
        downloadBtn.onclick = a.onclick; // Link button to same function

        // Create file icon based on extension (optional)
        const iconSpan = document.createElement("span");
        iconSpan.classList.add("file-icon");
        iconSpan.innerHTML = getFileIcon(file); // Assuming getFileIcon() is defined

        div.appendChild(iconSpan);
        div.appendChild(a);
        div.appendChild(downloadBtn);

        // Add smooth transitions and styling
        filesListContainer.appendChild(div);
      });

      // Ensure the files list is visible
      filesListContainer.style.display = "block";
    } else {
      throw new Error("No files found for this token.");
    }
  } catch (error) {
    hideLoader_ErrorReport();
    const ErrorMessage1 = document.getElementById('ErrorMessage');
    tokenInput.value = '';
    ErrorMessage1.innerHTML = `Error: ${error.message}`;
    enableAllButtons();
    showErrorPopup();
  }

}

function getFileIcon(file) {
  const ext = file.split('.').pop().toLowerCase();
  const icons = {
    // Documents
    pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
    ppt: '📽️', pptx: '📽️', txt: '📜',

    // Images
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', bmp: '🖼️',
    svg: '🖼️', webp: '🖼️',

    // Videos
    mp4: '🎥', avi: '🎥', mov: '🎥', wmv: '🎥', flv: '🎥',
    mkv: '🎥', webm: '🎥',

    // Audio
    mp3: '🎵', wav: '🎵', ogg: '🎵', flac: '🎵', aac: '🎵',

    // Code / Development Files
    html: '💻', htm: '💻', css: '💻', js: '💻', ts: '💻',
    php: '💻', py: '💻', c: '💻', cpp: '💻', java: '💻',
    rb: '💻', swift: '💻', go: '💻', cs: '💻', sh: '💻',

    // Archives / Compressed
    zip: '🗂️', rar: '🗂️', '7z': '🗂️', tar: '🗂️',
    gz: '🗂️', bz2: '🗂️',

    // Executables
    exe: '⚙️', bat: '⚙️', cmd: '⚙️', msi: '⚙️'
  };
  return icons[ext] || '📁'; // Default to 📁 if not found
}























async function deleteFilesByToken() {
  token = tokenTEMPDelete;
  try {
    showLoader_ErrorReport();
    // Make a DELETE request to delete the files for the given token
    const response = await fetch(`http://localhost:3000/api/delete-files/${encodeURIComponent(token)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      hideLoader_ErrorReport();
      throw new Error(`Failed to delete files for token: ${token}`);
    }

    const result = await response.json();
    if (result.success) {
      const filesListContainer = document.getElementById("filesListPopup");
      filesListContainer.innerHTML = ''; // Clear previous file list
      filesListContainer.style = "show";
      hideButtonContainer();
      
      hideLoader_ErrorReport();
      showSuccessPopup("✅Successfully removed from server.\nwe hope to to serve you again Thanks for using ZeroTrace!");          // alert("Files and records deleted successfully");
    } else {
      hideLoader_ErrorReport();
      const ErrorMessage1 = document.getElementById('ErrorMessage');
      ErrorMessage1.innerHTML = `Failed to delete files`;
      showErrorPopup();
    }
  } catch (error) {
    hideLoader_ErrorReport();
    const ErrorMessage1 = document.getElementById('ErrorMessage');
    ErrorMessage1.innerHTML = `Error deleting files:<br>${error.message}`;
    showErrorPopup();
  }
}
