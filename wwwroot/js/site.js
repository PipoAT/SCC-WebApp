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

function TxRxCaller() {
  if (document.getElementById("Mode").value == "Send Mode") {
    sendData();
  } else if (document.getElementById("Mode").value == "Receive Mode") {
    receiveData();
  } else {
    alert(
      "Attention: Application is in Idle Mode. Please configure settings and try again."
    );
  }
}

async function receiveData() {
  stopLoop = false;
  const logTransmission = document.getElementById("log").checked;
  const port = await navigator.serial.requestPort();
  const dirHandle = await window.showDirectoryPicker();

  let repeatTransmission = true;
  let i = 1;
  do {
    // Request permission to access the serial port

    // Open the serial port with a baud rate of 1200

    if (!port.isOpen) {
      await port.open({
        parity: selectedParity,
        baudRate: selectedBaudRate,
        dataBits: selectedDataBits,
        stopBits: selectedStopBits,
        readTimeout: selectedRT,
        writeTimeout: selectedWT,
        handshake: selectedHandshake,
      });
    }
    // Create a reader object for receiving data
    const reader = port.readable.getReader();

    // Read the incoming data
    const { value, done } = await reader.read();

    // Convert the received data to a string
    const receivedData = new TextDecoder().decode(value);
    animateBackgroundrec();
    // Close the reader and serial port
    try {
      await reader.cancel();
    } catch (e) {
      console.error("Failed to close writer: " + e);
    }

    // Display the received data
    document.getElementById("output" + i).value = receivedData;

    if (logTransmission) {
      // Log the transmission to a file
      const logFileName = "transmission.txt";
      const logData = receivedData;

      // Get a directory handle for the directory where you want to save the file

      const fileHandle = await dirHandle.getFileHandle(logFileName, {
        create: true,
      });
      const writable = await fileHandle.createWritable({
        keepExistingData: true,
      });
      await writable.seek(writable.length); // move the file pointer to the end of the file
      await writable.write(logData);
      await writable.write("\n");
      await writable.close();
    }

    try {
      await port.close();
    } catch (e) {
      console.error("Failed to close port: " + e);
    }

    if (stopLoop) {
      break;
    }

    if (i >= 5) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, selectedDelay));
    // Check if the "Repeat Transmission?" checkbox is checked
    repeatTransmission = document.getElementById("repeat").checked;
    i++;
  } while (repeatTransmission);
}

async function sendData() {
  stopLoop = false;
  const logTransmission = document.getElementById("log").checked;
  const port = await navigator.serial.requestPort();
  const dirHandle = await window.showDirectoryPicker();
  const logFileName = "transmission.txt";
  const fileHandle = await dirHandle.getFileHandle(logFileName, {
    create: true,
  });

  do {
    // Request permission to access the serial port

    // Open the serial port with a baud rate of 1200
    if (!port.isOpen) {
      await port.open({
        parity: selectedParity,
        baudRate: selectedBaudRate,
        dataBits: selectedDataBits,
        stopBits: selectedStopBits,
        readTimeout: selectedRT,
        writeTimeout: selectedWT,
        handshake: selectedHandshake,
      });
    }

    // Create a writer object for sending data
    const writer = port.writable.getWriter();
    // Get the input element
    var inputElement = document.getElementById("Input");

    // Get the input value and convert it to a UTF-8 encoded byte array
    var utf8Encoder = new TextEncoder();
    var utf8EncodedArray = utf8Encoder.encode(inputElement.value);

    // Store the encoded byte array in a buffer variable
    var buf = new Uint8Array(utf8EncodedArray);

    // Send the data
    if (
      document.getElementById("DataType").value == "Byte" ||
      document.getElementById("DataType").value == "BC"
    ) {
      await writer.write(new TextEncoder().encode(buf), animateBackground());

      if (logTransmission) {
        // Log the transmission to a file
        const logData = "Transmission: " + buf;

        // Get a directory handle for the directory where you want to save the file
        const writable = await fileHandle.createWritable();
        const logFile = await fileHandle.getFile();
        const existingData = await logFile.text();
        await writable.seek(writable.length); // move the file pointer to the end of the file
        await writable.write(existingData + logData + "\n");
        await writable.close();
      }
    } else if (document.getElementById("DataType").value == "String") {
      await writer.write(
        new TextEncoder().encode(document.getElementById("Input").value),
        animateBackground()
      );

      if (logTransmission) {
        // Log the transmission to a file
        const logData =
          "Transmission: " + document.getElementById("Input").value;

        // Get a directory handle for the directory where you want to save the file
        const writable = await fileHandle.createWritable();
        const logFile = await fileHandle.getFile();
        const existingData = await logFile.text();
        await writable.seek(writable.length); // move the file pointer to the end of the file
        await writable.write(existingData + logData + "\n");
        await writable.close();
      }
    } else if (document.getElementById("DataType").value == "ASCII") {
      await writer.write(
        new TextEncoder().encode(
          String.fromCharCode(document.getElementById("Input").value)
        ),
        animateBackground()
      );

      if (logTransmission) {
        // Log the transmission to a file
        const logData =
          "Transmission: " +
          String.fromCharCode(document.getElementById("Input").value);

        // Get a directory handle for the directory where you want to save the file
        const writable = await fileHandle.createWritable();
        const logFile = await fileHandle.getFile();
        const existingData = await logFile.text();
        await writable.seek(writable.length); // move the file pointer to the end of the file
        await writable.write(existingData + logData + "\n");
        await writable.close();
      }
    } else if (document.getElementById("DataType").value == "HEX") {
      await writer.write(
        new TextEncoder().encode(a2hex(document.getElementById("Input").value)),
        animateBackground()
      );

      if (logTransmission) {
        // Log the transmission to a file
        const logData =
          "Transmission: " + a2hex(document.getElementById("Input").value);

        // Get a directory handle for the directory where you want to save the file
        const writable = await fileHandle.createWritable();
        const logFile = await fileHandle.getFile();
        const existingData = await logFile.text();
        await writable.seek(writable.length); // move the file pointer to the end of the file
        await writable.write(existingData + logData + "\n");
        await writable.close();
      }
    } else {
      alert("ATTENTION: Invalid Data Type");
    }
    // Close the writer
    try {
      await writer.close();
    } catch (e) {
      console.error("Failed to close writer: " + e);
    }

    // Close the serial port
    try {
      await port.close();
    } catch (e) {
      console.error("Failed to close port: " + e);
    }

    if (stopLoop) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, selectedDelay));
    repeatTransmission = document.getElementById("repeat").checked;
  } while (repeatTransmission);
}
