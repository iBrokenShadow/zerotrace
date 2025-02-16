// Event Listeners
document.getElementById("fileButton").addEventListener("click", function() {
    document.getElementById("fileInput").click();
  });
  
  
  // Function to copy content to clipboard
  function copyToClipboard() {
    // Get the text from the element with ID 'tokenText'
    const tokenText = document.getElementById('tokenText').innerText;
    
    // Create a temporary input element to select the text
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = tokenText;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
  
    // Optional: You can modify the button text or icon to indicate it's copied
    const copyButton = document.querySelector('.copy span');
    copyButton.setAttribute('data-text-end', 'Copied!');
    copyButton.setAttribute('data-text-initial', 'Copy to clipboard');
    closePopup()
  }
  
  
  function ShowUploadButton() {
    // SHOW UPLOAD BUTTON IF FILE SELECTED
    const uploadBtn = document.getElementById('upload-btn');
    if (selectedFiles.length === 0) {
      document.getElementById("loaderEye-FileList").style.display="flex";
      uploadBtn.classList.remove('visible'); // Remove visible class if file list is empty
      uploadBtn.classList.add('invisible'); // Add invisible class to hide the button
    } else {
      // Hide the button first before showing again with a fade-in effect
      uploadBtn.classList.remove('visible'); // Remove visible class before transitioning
      uploadBtn.classList.add('invisible'); // Add invisible class to hide button completely
      
      // Trigger the fade-in effect with a slight delay
      setTimeout(() => {
        uploadBtn.classList.remove('invisible'); // Remove invisible class
        uploadBtn.classList.add('visible'); // Add visible class to show the button
      }, 500); // Delay for 500ms to match the opacity transition time
    }
  }
  
  
  
  // File handling functions
  let selectedFiles = [];
  let fileCount = 0;
  
  function addFiles() {
    const input = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    fileCount++;
    document.getElementById("loaderEye-FileList").style.display="none";
  
    // Append new files to existing ones
    for (let file of input.files) {
      if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        selectedFiles.push(file);
      }
    }
    
    renderFileList();
    ShowUploadButton();
    
    // Clear the input value after adding the files
    // input.value = ''; // Reset file input to allow re-selection of same file
  }
  
  // Function to render file list
  function renderFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = "";
    selectedFiles.forEach((file, index) => {
      let fileSize = file.size;
      let type = "B";
      if (fileSize > 999) {
        fileSize = (fileSize / 1024).toFixed(1);
        type = "KB";
      }
      if (fileSize > 999) {
        fileSize = (fileSize / 1024).toFixed(1);
        type = "MB";
      }
  
      let fileName = file.name.length > 24 ? file.name.substring(0, 22) + '...' : file.name;
  
      const listItem = document.createElement('div');
      listItem.className = 'file-item';
      listItem.innerHTML = `<span class = "inlineFileListUpload"><button id="buttonRemoveSelection" class= "ButtonInlineFileSelction" onclick="removeFileFromList(${index})">✖</button>${fileName}</span> <span class="InnerFileSizeUpload">${fileSize} ${type}</span>`;
      fileList.appendChild(listItem);
    });
  }
  
  // Function to remove a file from the list
  function removeFileFromList(index) {
    selectedFiles.splice(index, 1); // Remove file from array
    renderFileList(); // Re-render list
    ShowUploadButton();
  }
  
  



  // File upload validation functions
  function formatUploadTime(dateInput) {
      const date = new Date(dateInput);

      // Format date as "10 Feb 2025 (Monday)"
      const formattedDate = date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          weekday: "long"
      });

      // Format time as "03:59 AM"
      const formattedTime = date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
      });

      return `${formattedDate} - ${formattedTime}`;
  }
  async function checkUploadLimit() {
    try {
      const response = await fetch("http://localhost:3000/api/check-upload-count");
      const result = await response.json();
  
      if (result.uploadCount >= 10) {
        const recentUploadTime = result.recentUploadTime ? new Date(result.recentUploadTime) : null;
        const nextUploadTime = recentUploadTime ? new Date(recentUploadTime.getTime() + (24 * 60 * 60 * 1000)) : null;
        const formattedTime = formatUploadTime(nextUploadTime);


        const ErrorMessage1 = document.getElementById('ErrorMessage');
        if (formattedTime) {
          ErrorMessage1.innerHTML = `You may have uploaded 10 or more files in last 24 hours.<br>Next Upload: ${formattedTime.toLocaleString()}`;
          document.getElementById("loaderEye-FileList").style.display="flex";
        } else {
          ErrorMessage1.innerHTML = "Sorry! <br>You may have uploaded 10 or more files in last 24 hours.";
          document.getElementById("loaderEye-FileList").style.display="flex";
        }
  
        showErrorPopup();
        return false; // Block the upload
      }
  
      return true; // Allow upload if under the limit
    } catch (error) {
      const ErrorMessage1 = document.getElementById('ErrorMessage');
      ErrorMessage1.innerHTML = "Sorry! <br>Error checking upload limit: " + error;
      document.getElementById("loaderEye-FileList").style.display="flex";
      showErrorPopup();
      return true; // Allow upload if there's an error in checking
    }
  }
  
  
  function checkFileSelection() {
    const fileInput = document.getElementById("fileInput");
    const selectedFiles = fileInput.files;
  
    // Check if less than 11 files are selected
    if (selectedFiles.length < 11) {
      return true;  // Return true if the number of files is less than 6
    } else {
      const ErrorMessage1 = document.getElementById('ErrorMessage');
      ErrorMessage1.innerHTML = "Sorry! <br>Only 10 files allowed at a time!<br>Try again with less files.";  // Clear the displayed list
      document.getElementById("loaderEye-FileList").style.display="flex";
      showErrorPopup()
      return false;  // Return false if the number of files is 6 or more
    }
  }
  
  // Function to check if any file exceeds 10MB
  function validateFilesSize() {
    const maxSize = 30 * 1024 * 1024; // 30MB in bytes
  
    for (let file of selectedFiles) { // Use selectedFiles instead of fileInput.files
      if (file.size > maxSize) {
        const ErrorMessage1 = document.getElementById('ErrorMessage');
        ErrorMessage1.innerHTML = "Sorry! <br>Selected file exceeds size 30 MB<br>Try again with different file.";  // Clear the displayed list
        document.getElementById("loaderEye-FileList").style.display="flex";
        showErrorPopup()
        return false; // Return false if any file exceeds the size limit
      }
    }
    return true; // Return true if all files are within the size limit
  }
  
  
  // File upload functions
  async function uploadFiles() {
    showLoader_ErrorReport();
    function ResetInput() {
      const fileList = document.getElementById('fileList');
      fileList.innerHTML = "";  // Clear the displayed list
      fileInput.value = "";     // Clear the file input
      selectedFiles = [];       // Reset the selected files array
    }
    
  
    const files = selectedFiles;
  
    // Check if no files were selected
    if (files.length === 0) {
      const ErrorMessage1 = document.getElementById('ErrorMessage');
      ErrorMessage1.innerHTML = "Sorry! <br>Please select at least one file.!";  // Clear the displayed list
      document.getElementById("loaderEye-FileList").style.display="flex";
      showErrorPopup();
      hideLoader_ErrorReport();
      return;
    }
  
    // Validate file sizes
    if (!validateFilesSize()) {
      ResetInput();
      hideLoader_ErrorReport();
      return; // Stop the upload process if any file exceeds the size limit
    }
  
    // Check upload count before uploading
    const canUpload = await checkUploadLimit();
    const maxUpload = await checkFileSelection();
  
    // Stop if upload conditions fail
    if (canUpload !== true || maxUpload !== true) {
      ResetInput();  // Reset input if upload conditions fail
      hideLoader_ErrorReport();
      return;
    }
  
    //Remove cross btton once clicked on upload
    document.querySelectorAll('.ButtonInlineFileSelction').forEach(button => {
      button.classList.add('faded'); // Add the 'faded' class to start the fade-out effect
      // Optionally, remove the button after the fade-out is complete
      setTimeout(() => {
        button.style.display = 'none'; // Hide the button after the fade-out completes
      }, 500); // Match this delay with the CSS transition duration (in ms)
    });
  
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
  
    
    
    hideLoader_ErrorReport();
    // Show Alert Message
    const alertmessage = document.getElementById('AlertMessage');
    alertmessage.style.display = "flex";
    disableOtherButtons();
  
    // Show progress bar
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    progressContainer.style.display = "block";
  
    try {
      const request = new XMLHttpRequest();
  
      // Track upload progress
      request.upload.onprogress = function(event) {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          progressBar.style.width = percent + '%';
        }
      };
  
      request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
          const result = JSON.parse(request.responseText);
  
          // Show the token in the pop-up
          document.getElementById("tokenText").innerText = result.token;
          
          selectedFiles=[];
          ShowUploadButton();
          showPopup();
  
          ResetInput();
          progressContainer.style.display = "none"; // Hide progress bar on success
          alertmessage.style.display = "none";
          enableAllButtons();
        } else if (request.readyState === 4) {
          const ErrorMessage1 = document.getElementById('ErrorMessage');
          ErrorMessage1.innerHTML = "Sorry! Upload failed<br>There might be some issue with server.";
          document.getElementById("loaderEye-FileList").style.display="flex";
          showErrorPopup();
          ResetInput();
          progressContainer.style.display = "none"; // Hide progress bar on error
          alertmessage.style.display = "none";
          enableAllButtons();
        }
      };
  
      request.open("POST", "http://localhost:3000/api/upload", true);
      request.send(formData);
  
    } catch (error) {
      const ErrorMessage1 = document.getElementById('ErrorMessage');
      ErrorMessage1.innerHTML = "Sorry! <br>Upload failed!<br>Error: " + error;
      document.getElementById("loaderEye-FileList").style.display="flex";
      showErrorPopup();
      ResetInput();
      progressContainer.style.display = "none"; // Hide progress bar on error
      alertmessage.style.display = "none";
      enableAllButtons();
    }
  }
  
  
  
  
  // Pop-up control functions
  // Show and hide Token Popup
  function showPopup() {
  
    document.getElementById("overlay").style.display = "flex";  
    const popup = document.getElementById("tokenPopup");
    popup.style.display = "flex"; 
    setTimeout(() => { popup.classList.add("show"); }, 10); 
  
    disableOtherButtons("tokenPopup"); // Disable buttons outside this popup
  }
  
  function closePopup() {
    const popup = document.getElementById("tokenPopup");
    popup.classList.remove("show");
  
    setTimeout(() => {
      popup.style.display = "none"; 
      document.getElementById("overlay").style.display = "none";
      enableAllButtons(); // Re-enable all buttons after closing
    }, 500);
    
    goBack(); // Ensure goBack() still runs
  }
  
  function closeFilesPopup() {
    // Hide the files pop-up when 'Close' is clicked
    document.getElementById("filesPopup").style.display = "none";
  }
  