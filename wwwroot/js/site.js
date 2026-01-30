// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

let selectedBaudRate = 0;
let selectedDataBits = 0;
let selectedStopBits = 0;
let selectedRT = 0;
let selectedWT = 0;
let selectedParity = "";
let selectedHandshake = "";
let selectedDelay = 1000;
let stopLoop = false;
let j = 1;

// Add an event listener to the dropdown menu
const baudDropdown = document.getElementById("BAUD");
baudDropdown.addEventListener("change", () => {
  selectedBaudRate = parseInt(baudDropdown.value);
});

const parityDropdown = document.getElementById("Parity");
parityDropdown.addEventListener("change", () => {
  selectedParity = parityDropdown.value;
});

const dataBitsDropdown = document.getElementById("DataBits");
dataBitsDropdown.addEventListener("change", () => {
  selectedDataBits = parseInt(dataBitsDropdown.value);
});

const stopBitsDropdown = document.getElementById("StopBits");
stopBitsDropdown.addEventListener("change", () => {
  selectedStopBits = parseInt(stopBitsDropdown.value);
});

const RTDropdown = document.getElementById("ReadTimeout");
RTDropdown.addEventListener("change", () => {
  selectedRT = parseInt(RTDropdown.value);
});

const WTDropdown = document.getElementById("WriteTimeout");
WTDropdown.addEventListener("change", () => {
  selectedWT = parseInt(WTDropdown.value);
});

const HandshakeDropdown = document.getElementById("Handshake");
HandshakeDropdown.addEventListener("change", () => {
  selectedHandshake = HandshakeDropdown.value;
});

const DelayDropdown = document.getElementById("Delay");
DelayDropdown.addEventListener("change", () => {
  selectedDelay = parseInt(DelayDropdown.value);
});

const stopButton = document.querySelector("#stop-button");
stopButton.addEventListener("click", () => {
  stopLoop = true;
});

function a2hex(str) {
  var arr = [];
  for (var i = 0, l = str.length; i < l; i++) {
    var hex = Number(str.charCodeAt(i)).toString(16);
    arr.push((hex.length > 1 && hex) || "0" + hex);
  }
  return arr.join("");
}

function animateBackground() {
  document.body.classList.add("animate");
  setTimeout(() => {
    document.body.classList.remove("animate");
  }, 2000);
}

function animateBackgroundrec() {
  document.body.classList.add("animaterec");
  setTimeout(() => {
    document.body.classList.remove("animaterec");
  }, 2000);
}

function createInputFields() {
  const inputCountElement = document.getElementById("inputCount");
  if (!inputCountElement) {
    alert("Error: Input count field not found.");
    return;
  }

  const inputCount = parseInt(inputCountElement.value);
  
  if (isNaN(inputCount) || inputCount <= 0) {
    alert("Error: Please enter a valid positive number for the input count.");
    return;
  }

  if (inputCount > 100) {
    alert("WARNING: Requested Tx Buffer exceeds Rx Buffer Allowance (maximum 100)");
    return;
  }

  try {
    let inputFieldsHTML = "";
    for (let i = 0; i < inputCount; i++) {
      inputFieldsHTML += `<form id="inputForm">
                          <label for="input${i + 1}">Input ${i + 1}</label>
                          <input class="form-control w-100" type="text" aria-label="input${
                            i + 1
                          }" id="input${i + 1}">
                        </form>`;
    }
    document.getElementById("inputFields").innerHTML = inputFieldsHTML;
  } catch (error) {
    console.error("Error creating input fields:", error);
    alert("Error: Failed to create input fields. " + error.message);
  }
}

function TxRxCaller() {
  // Validate required settings before starting transmission
  const mode = document.getElementById("Mode").value;
  const baudRate = selectedBaudRate;
  const parity = selectedParity;
  const dataBits = selectedDataBits;
  const stopBits = selectedStopBits;
  const dataType = document.getElementById("DataType").value;

  // Check for Idle Mode
  if (mode === "Idle Mode") {
    alert(
      "Attention: Application is in Idle Mode. Please configure settings and try again."
    );
    return;
  }

  // Validate required serial port settings
  if (!baudRate || baudRate === 0) {
    alert("Error: Please select a BAUD rate before starting transmission.");
    return;
  }

  if (!parity || parity === "") {
    alert("Error: Please select a Parity option before starting transmission.");
    return;
  }

  if (!dataBits || dataBits === 0) {
    alert("Error: Please select DataBits before starting transmission.");
    return;
  }

  if (!stopBits || stopBits === 0) {
    alert("Error: Please select StopBits before starting transmission.");
    return;
  }

  // Validate data type for send modes
  if ((mode === "Send Mode" || mode === "SR") && (!dataType || dataType === "none")) {
    alert("Error: Please select a Data Type before starting transmission.");
    return;
  }

  // Validate input count for send modes
  if (mode === "Send Mode" || mode === "SR") {
    const inputCount = document.getElementById("inputCount").value;
    if (!inputCount || inputCount <= 0) {
      alert("Error: Please create input fields before starting transmission.");
      return;
    }
  }

  // All validations passed, proceed with transmission
  if (mode === "Send Mode" || mode === "SR") {
    sendData();
  } else if (mode === "Receive Mode") {
    receiveData();
  }
}

async function receiveData() {
  stopLoop = false;
  const logTransmission = document.getElementById("log").checked;
  let port = null;
  let dirHandle = null;
  let portOpened = false;

  try {
    // Request permission to access the serial port
    port = await navigator.serial.requestPort();
    
    // Request directory handle for logging if enabled
    if (logTransmission) {
      dirHandle = await window.showDirectoryPicker();
    }
  } catch (error) {
    console.error("Failed to get serial port or directory access:", error);
    alert("Error: Failed to get serial port or directory access. " + error.message);
    return;
  }

  let repeatTransmission = true;
  let i = 1;
  do {
    try {
      // Open the serial port with configured settings
      if (!portOpened) {
        await port.open({
          parity: selectedParity,
          baudRate: selectedBaudRate,
          dataBits: selectedDataBits,
          stopBits: selectedStopBits,
        });
        portOpened = true;
      }

      // Create a reader object for receiving data
      const reader = port.readable.getReader();

      try {
        // Read the incoming data
        const { value, done } = await reader.read();

        // Convert the received data to a string
        const receivedData = new TextDecoder().decode(value);
        animateBackgroundrec();

        // Display the received data
        document.getElementById("output" + i).value = receivedData;

        if (logTransmission && dirHandle) {
          // Log the transmission to a file
          const logFileName = "transmission.txt";
          const logData = receivedData;

          const fileHandle = await dirHandle.getFileHandle(logFileName, {
            create: true,
          });
          const writable = await fileHandle.createWritable({
            keepExistingData: true,
          });
          await writable.seek(writable.length);
          await writable.write(logData);
          await writable.write("\n");
          await writable.close();
        }
      } catch (readError) {
        console.error("Error reading from serial port:", readError);
        alert("Error reading from serial port: " + readError.message);
      } finally {
        // Close the reader
        try {
          await reader.cancel();
        } catch (e) {
          console.error("Failed to close reader:", e);
        }
      }

      // Close the serial port
      try {
        await port.close();
        portOpened = false;
      } catch (e) {
        console.error("Failed to close port:", e);
      }

      if (stopLoop) {
        break;
      }

      if (i >= 100) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, selectedDelay));
      repeatTransmission = document.getElementById("repeat").checked;
      i++;
    } catch (error) {
      console.error("Error during receive operation:", error);
      alert("Error during receive operation: " + error.message);
      
      // Try to close the port if it's open
      try {
        if (port && portOpened) {
          await port.close();
          portOpened = false;
        }
      } catch (closeError) {
        console.error("Failed to close port after error:", closeError);
      }
      break;
    }
  } while (repeatTransmission);
}

async function sendData() {
  stopLoop = false;
  const logTransmission = document.getElementById("log").checked;
  let port = null;
  let dirHandle = null;
  let fileHandle = null;
  let portOpened = false;
  let j = 1; // Counter for received data in Send and Receive mode

  try {
    // Request permission to access the serial port
    port = await navigator.serial.requestPort();
    
    // Request directory handle and create file handle for logging if enabled
    if (logTransmission) {
      dirHandle = await window.showDirectoryPicker();
      const logFileName = "transmission.txt";
      fileHandle = await dirHandle.getFileHandle(logFileName, {
        create: true,
      });
    }
  } catch (error) {
    console.error("Failed to get serial port or directory access:", error);
    alert("Error: Failed to get serial port or directory access. " + error.message);
    return;
  }

  let repeatTransmission = true;

  do {
    try {
      // Open the serial port with configured settings
      if (!portOpened) {
        await port.open({
          parity: selectedParity,
          baudRate: selectedBaudRate,
          dataBits: selectedDataBits,
          stopBits: selectedStopBits,
        });
        portOpened = true;
      }

      // Create a writer object for sending data
      const writer = port.writable.getWriter();
      
      try {
        // Get the input data
        let inputData = [];
        const inputCount = document.getElementById("inputCount").value;

        for (let i = 1; i <= inputCount; i++) {
          const inputElement = document.getElementById("input" + i);
          if (inputElement) {
            inputData.push(inputElement.value);
          }
        }

        const inputDataString = inputData.join("");

        // Encode data based on selected data type
        let encodedData;
        let logData;
        const dataType = document.getElementById("DataType").value;

        switch (dataType) {
          case "Byte":
          case "BC":
            encodedData = new TextEncoder().encode(inputDataString);
            logData = "Transmission: " + encodedData;
            break;
          case "String":
            encodedData = new TextEncoder().encode(inputDataString);
            logData = "Transmission: " + inputDataString;
            break;
          case "ASCII":
            encodedData = new TextEncoder().encode(String.fromCharCode(inputDataString));
            logData = "Transmission: " + String.fromCharCode(inputDataString);
            break;
          case "HEX":
            encodedData = new TextEncoder().encode(a2hex(inputDataString));
            logData = "Transmission: " + a2hex(inputDataString);
            break;
          default:
            throw new Error("Invalid Data Type selected");
        }

        // Send the data
        await writer.write(encodedData);
        animateBackground();

        // Log the transmission if enabled
        if (logTransmission && fileHandle) {
          try {
            const writable = await fileHandle.createWritable();
            const logFile = await fileHandle.getFile();
            const existingData = await logFile.text();
            await writable.write(existingData + logData + "\n");
            await writable.close();
          } catch (logError) {
            console.error("Failed to log transmission:", logError);
          }
        }
      } catch (writeError) {
        console.error("Error writing to serial port:", writeError);
        alert("Error writing to serial port: " + writeError.message);
      } finally {
        // Close the writer
        try {
          await writer.close();
        } catch (e) {
          console.error("Failed to close writer:", e);
        }
      }

      // Handle Send and Receive mode
      if (document.getElementById("Mode").value === "SR") {
        const reader = port.readable.getReader();

        try {
          // Read the incoming data
          const { value, done } = await reader.read();

          // Convert the received data to a string
          const receivedData = new TextDecoder().decode(value);
          animateBackgroundrec();

          // Display the received data
          document.getElementById("output" + j).value = receivedData;

          // Log received data if logging is enabled
          if (logTransmission && dirHandle) {
            const logFileName = "transmission.txt";
            const logData = receivedData;

            const fileHandle = await dirHandle.getFileHandle(logFileName, {
              create: true,
            });
            const writable = await fileHandle.createWritable({
              keepExistingData: true,
            });
            await writable.seek(writable.length);
            await writable.write(logData);
            await writable.write("\n");
            await writable.close();
          }

          if (j >= 100) {
            j = 1; // Reset counter
          } else {
            j++;
          }
        } catch (readError) {
          console.error("Error reading from serial port:", readError);
          alert("Error reading from serial port: " + readError.message);
        } finally {
          // Close the reader
          try {
            await reader.cancel();
          } catch (e) {
            console.error("Failed to close reader:", e);
          }
        }
      }

      // Close the serial port
      try {
        await port.close();
        portOpened = false;
      } catch (e) {
        console.error("Failed to close port:", e);
      }

      if (stopLoop) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, selectedDelay));
      repeatTransmission = document.getElementById("repeat").checked;
    } catch (error) {
      console.error("Error during send operation:", error);
      alert("Error during send operation: " + error.message);
      
      // Try to close the port if it's open
      try {
        if (port && portOpened) {
          await port.close();
          portOpened = false;
        }
      } catch (closeError) {
        console.error("Failed to close port after error:", closeError);
      }
      break;
    }
  } while (repeatTransmission);
}
